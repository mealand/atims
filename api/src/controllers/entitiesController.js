const supabase = require('../config/supabase')
const logger = require('../utils/logger')

/**
 * GET /api/v1/entities/pending
 * Inspector/Admin only. Returns all entities awaiting verification.
 */
async function getPendingEntities(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error) throw error

    res.json({ success: true, data: { entities: data, count: data.length } })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/v1/entities/:id/verify
 * Inspector/Admin only. Approves a pending entity.
 */
async function verifyEntity(req, res, next) {
  try {
    const { id } = req.params

    const { data: entity, error: fetchError } = await supabase
      .from('entities')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !entity) {
      return res.status(404).json({ success: false, error: { message: 'Entity not found' } })
    }

    if (entity.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: { message: `Entity status is '${entity.status}', not 'pending'. Cannot verify.` },
      })
    }

    const { data: updated, error: updateError } = await supabase
      .from('entities')
      .update({
        status: 'verified',
        verified_by: req.entity.id,
        verified_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    logger.info(`Entity ${entity.nexus_id} verified by ${req.entity.nexus_id}`)

    res.json({ success: true, data: { entity: updated } })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/v1/entities/:id/reject
 * Inspector/Admin only. Rejects a pending entity with a reason.
 */
async function rejectEntity(req, res, next) {
  try {
    const { id } = req.params
    const { reason } = req.body

    if (!reason) {
      return res.status(400).json({ success: false, error: { message: 'Rejection reason is required' } })
    }

    const { data: entity, error: fetchError } = await supabase
      .from('entities')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !entity) {
      return res.status(404).json({ success: false, error: { message: 'Entity not found' } })
    }

    const { data: updated, error: updateError } = await supabase
      .from('entities')
      .update({
        status: 'rejected',
        verified_by: req.entity.id,
        verified_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    logger.info(`Entity ${entity.nexus_id} rejected by ${req.entity.nexus_id}: ${reason}`)

    res.json({ success: true, data: { entity: updated } })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/v1/entities/:id
 * Any authenticated user (RLS governs actual visibility).
 */
async function getEntityById(req, res, next) {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return res.status(404).json({ success: false, error: { message: 'Entity not found' } })
    }

    res.json({ success: true, data: { entity: data } })
  } catch (err) {
    next(err)
  }
}

module.exports = { getPendingEntities, verifyEntity, rejectEntity, getEntityById }
