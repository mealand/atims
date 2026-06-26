const supabase = require('../config/supabase')
const { generateTraceId } = require('../utils/idGenerator')
const { generateFingerprint } = require('../utils/fingerprint')
const { BATCH_CREATORS, ROLE_CODES } = require('../constants/roles')
const { getInitialStage, getNextStage } = require('../constants/stages')
const logger = require('../utils/logger')

/**
 * POST /api/v1/batches
 * Creates a new batch with genesis hash and first transaction.
 * Only farmers and ranchers can create batches.
 */
async function createBatch(req, res, next) {
  try {
    const {
      batch_type, commodity, variety, quantity, unit,
      production_date, origin_state, origin_lga, farm_id,
      destination_country, trade_corridor, notes,
    } = req.body

    const entity = req.entity

    // ── Validation ──────────────────────────────────────────
    if (!BATCH_CREATORS.includes(entity.role)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Only farmers and ranchers can create batches' },
      })
    }

    if (!batch_type || !commodity || !quantity || !unit || !production_date) {
      return res.status(400).json({
        success: false,
        error: { message: 'batch_type, commodity, quantity, unit, and production_date are required' },
      })
    }

    if (!['crop', 'livestock'].includes(batch_type)) {
      return res.status(400).json({
        success: false,
        error: { message: 'batch_type must be crop or livestock' },
      })
    }

    // Farmers create crop batches; ranchers create livestock batches
    if (entity.role === 'farmer' && batch_type !== 'crop') {
      return res.status(400).json({ success: false, error: { message: 'Farmers can only create crop batches' } })
    }
    if (entity.role === 'rancher' && batch_type !== 'livestock') {
      return res.status(400).json({ success: false, error: { message: 'Ranchers can only create livestock batches' } })
    }

    // ── Generate Trace ID ───────────────────────────────────
    const traceId = generateTraceId(batch_type === 'crop' ? 'CROP' : 'LVST')

    // ── Generate genesis hash ───────────────────────────────
    const genesisPayload = {
      trace_id: traceId,
      origin_entity_id: entity.id,
      batch_type,
      commodity,
      quantity,
      unit,
      production_date,
    }
    const { hash: genesisHash, timestamp: genesisTimestamp } = generateFingerprint(genesisPayload)

    const initialStage = getInitialStage(batch_type)

    // ── Insert batch row ────────────────────────────────────
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .insert({
        trace_id: traceId,
        origin_entity_id: entity.id,
        batch_type,
        commodity,
        variety: variety || null,
        quantity,
        unit,
        production_date,
        origin_state: origin_state || entity.state_province || null,
        origin_lga: origin_lga || entity.lga || null,
        farm_id: farm_id || null,
        current_stage: initialStage,
        current_holder_id: entity.id,
        compliance_status: 'pending',
        quality_verdict: 'PENDING',
        destination_country: destination_country || null,
        trade_corridor: trade_corridor || null,
        genesis_hash: genesisHash,
        notes: notes || null,
      })
      .select()
      .single()

    if (batchError) throw batchError

    // ── Record genesis transaction ──────────────────────────
    const txPayload = {
      batch_id: batch.id,
      actor_id: entity.id,
      tx_type: 'BATCH_CREATED',
      payload: genesisPayload,
    }
    const { hash: txHash } = generateFingerprint(txPayload)

    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        batch_id: batch.id,
        actor_id: entity.id,
        tx_type: 'BATCH_CREATED',
        to_stage: initialStage,
        payload: genesisPayload,
        tx_hash: txHash,
        previous_hash: null, // genesis — no predecessor
        tx_timestamp: genesisTimestamp,
      })

    if (txError) throw txError

    logger.info(`Batch created: ${traceId} by ${entity.nexus_id}`)

    res.status(201).json({
      success: true,
      data: { batch },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/v1/batches
 * Returns all batches for the authenticated entity.
 */
async function getMyBatches(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .eq('origin_entity_id', req.entity.id)
      .eq('archived', false)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ success: true, data: { batches: data, count: data.length } })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/v1/batches/:id
 * Returns a single batch with its full transaction history.
 */
async function getBatchById(req, res, next) {
  try {
    const { id } = req.params

    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .select('*')
      .eq('id', id)
      .single()

    if (batchError || !batch) {
      return res.status(404).json({ success: false, error: { message: 'Batch not found' } })
    }

    // Fetch transaction history in chronological order
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('batch_id', id)
      .order('tx_timestamp', { ascending: true })

    if (txError) throw txError

    res.json({ success: true, data: { batch, transactions } })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/v1/batches/:id/advance
 * Advances a batch to the next stage and records a chained transaction.
 */
async function advanceStage(req, res, next) {
  try {
    const { id } = req.params
    const { location_label, latitude, longitude, notes } = req.body

    const { data: batch, error: fetchError } = await supabase
      .from('batches')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !batch) {
      return res.status(404).json({ success: false, error: { message: 'Batch not found' } })
    }

    // Determine next stage
    const nextStage = getNextStage(batch.batch_type, batch.current_stage)
    if (!nextStage) {
      return res.status(400).json({
        success: false,
        error: { message: `Batch is already at the final stage: ${batch.current_stage}` },
      })
    }

    // Get the latest transaction hash to chain from
    const { data: lastTx, error: lastTxError } = await supabase
      .from('transactions')
      .select('tx_hash')
      .eq('batch_id', id)
      .order('tx_timestamp', { ascending: false })
      .limit(1)
      .single()

    if (lastTxError) throw lastTxError

    const fromStage = batch.current_stage

    // ── Update batch stage ──────────────────────────────────
    const { data: updatedBatch, error: updateError } = await supabase
      .from('batches')
      .update({ current_stage: nextStage })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    // ── Record chained transaction ──────────────────────────
    const txPayload = {
      batch_id: id,
      actor_id: req.entity.id,
      from_stage: fromStage,
      to_stage: nextStage,
      location_label: location_label || null,
      notes: notes || null,
    }
    const { hash: txHash, timestamp: txTimestamp } = generateFingerprint({
      ...txPayload,
      previous_hash: lastTx.tx_hash,
    })

    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        batch_id: id,
        actor_id: req.entity.id,
        tx_type: 'STAGE_ADVANCED',
        from_stage: fromStage,
        to_stage: nextStage,
        payload: txPayload,
        tx_hash: txHash,
        previous_hash: lastTx.tx_hash,
        tx_timestamp: txTimestamp,
        latitude: latitude || null,
        longitude: longitude || null,
        location_label: location_label || null,
      })

    if (txError) throw txError

    logger.info(`Batch ${batch.trace_id} advanced: ${fromStage} → ${nextStage} by ${req.entity.nexus_id}`)

    res.json({
      success: true,
      data: {
        batch: updatedBatch,
        transition: { from: fromStage, to: nextStage },
      },
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { createBatch, getMyBatches, getBatchById, advanceStage }
