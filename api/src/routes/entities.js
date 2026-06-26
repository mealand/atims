const express = require('express')
const router = express.Router()
const {
  getPendingEntities, verifyEntity, rejectEntity, getEntityById,
} = require('../controllers/entitiesController')
const { requireAuth } = require('../middleware/auth')
const { requireRole } = require('../middleware/requireRole')

// GET /api/v1/entities/pending — inspector/admin only
router.get('/pending', requireAuth, requireRole('inspector', 'admin'), getPendingEntities)

// PATCH /api/v1/entities/:id/verify — inspector/admin only
router.patch('/:id/verify', requireAuth, requireRole('inspector', 'admin'), verifyEntity)

// PATCH /api/v1/entities/:id/reject — inspector/admin only
router.patch('/:id/reject', requireAuth, requireRole('inspector', 'admin'), rejectEntity)

// GET /api/v1/entities/:id — any authenticated user (RLS governs visibility)
router.get('/:id', requireAuth, getEntityById)

module.exports = router
