/**
 * Role-gating middleware. Must run AFTER requireAuth (needs req.entity).
 *
 * Usage:
 *   router.post('/verify', requireAuth, requireRole('inspector', 'admin'), controllerFn)
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.entity) {
      return res.status(500).json({
        success: false,
        error: { message: 'requireRole used without requireAuth — req.entity missing' },
      })
    }

    if (!allowedRoles.includes(req.entity.role)) {
      return res.status(403).json({
        success: false,
        error: { message: `Access denied. Requires role: ${allowedRoles.join(' or ')}` },
      })
    }

    next()
  }
}

/**
 * Requires the entity to be verified (status = 'verified').
 * Used for routes like batch creation, where pending entities
 * must not be able to transact.
 */
function requireVerified(req, res, next) {
  if (!req.entity) {
    return res.status(500).json({
      success: false,
      error: { message: 'requireVerified used without requireAuth — req.entity missing' },
    })
  }

  if (req.entity.status !== 'verified') {
    return res.status(403).json({
      success: false,
      error: { message: `Account status is '${req.entity.status}'. Verification required before this action.` },
    })
  }

  next()
}

module.exports = { requireRole, requireVerified }
