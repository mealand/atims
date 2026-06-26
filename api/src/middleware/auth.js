const supabase = require('../config/supabase')
const logger = require('../utils/logger')

/**
 * Verifies the Supabase JWT from the Authorization header and attaches
 * the corresponding entity record (with role) to req.entity.
 *
 * Usage: router.get('/protected', requireAuth, controllerFn)
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: { message: 'Missing or malformed Authorization header' } })
    }

    const token = authHeader.split(' ')[1]

    // Verify the JWT against Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return res.status(401).json({ success: false, error: { message: 'Invalid or expired token' } })
    }

    // Fetch the matching entity record (role, status, nexus_id)
    const { data: entity, error: entityError } = await supabase
      .from('entities')
      .select('*')
      .eq('id', user.id)
      .single()

    if (entityError || !entity) {
      logger.warn(`Auth: user ${user.id} has no matching entity record`)
      return res.status(403).json({ success: false, error: { message: 'No entity record found for this account' } })
    }

    req.user = user
    req.entity = entity
    next()
  } catch (err) {
    logger.error({ message: 'Auth middleware failure', error: err.message })
    res.status(500).json({ success: false, error: { message: 'Authentication check failed' } })
  }
}

module.exports = { requireAuth }
