const supabase = require('../config/supabase')
const { generateNexusId } = require('../utils/idGenerator')
const { ROLE_CODES, PUBLIC_ROLES } = require('../constants/roles')
const logger = require('../utils/logger')

/**
 * POST /api/v1/auth/register
 * Creates a Supabase Auth user AND a matching entities row in one flow.
 * New entities always start as status: 'pending'.
 */
async function register(req, res, next) {
  try {
    const {
      email, password, role, business_name, contact_name,
      phone, state_province, lga, address, reg_number,
    } = req.body

    // ── Validation ──────────────────────────────────────────
    if (!email || !password || !role || !business_name || !contact_name) {
      return res.status(400).json({
        success: false,
        error: { message: 'email, password, role, business_name, and contact_name are required' },
      })
    }

    if (!PUBLIC_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        error: { message: `Invalid role. Must be one of: ${PUBLIC_ROLES.join(', ')}` },
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: { message: 'Password must be at least 8 characters' },
      })
    }

    // ── Step 1: Create Supabase Auth user ──────────────────
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // skip email verification for now — revisit for production
    })

    if (authError) {
      logger.warn(`Registration failed at auth step: ${authError.message}`)
      return res.status(400).json({ success: false, error: { message: authError.message } })
    }

    const userId = authData.user.id

    // ── Step 2: Generate Nexus ID ───────────────────────────
    const roleCode = ROLE_CODES[role] || 'ENT'
    const nexusId = generateNexusId(roleCode)

    // ── Step 3: Create entities row ─────────────────────────
    const { data: entity, error: entityError } = await supabase
      .from('entities')
      .insert({
        id: userId,
        nexus_id: nexusId,
        role,
        business_name,
        contact_name,
        email,
        phone: phone || null,
        state_province: state_province || null,
        lga: lga || null,
        address: address || null,
        reg_number: reg_number || null,
        status: 'pending',
      })
      .select()
      .single()

    if (entityError) {
      // Rollback: remove the orphaned auth user if entity creation fails
      await supabase.auth.admin.deleteUser(userId)
      logger.error(`Registration failed at entity step, rolled back auth user: ${entityError.message}`)
      return res.status(500).json({ success: false, error: { message: 'Failed to create entity record' } })
    }

    logger.info(`New entity registered: ${nexusId} (${role}) — pending verification`)

    res.status(201).json({
      success: true,
      data: {
        entity,
        message: 'Registration successful. Your account is pending inspector verification.',
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/v1/auth/me
 * Returns the authenticated user's entity record.
 * Requires requireAuth middleware.
 */
async function getMe(req, res) {
  res.json({ success: true, data: { entity: req.entity } })
}

module.exports = { register, getMe }
