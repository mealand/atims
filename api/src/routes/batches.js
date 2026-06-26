const express = require('express')
const router = express.Router()
const { createBatch, getMyBatches, getBatchById, advanceStage } = require('../controllers/batchesController')
const { requireAuth } = require('../middleware/auth')
const { requireVerified } = require('../middleware/requireRole')

// All batch routes require authentication and verified status
router.use(requireAuth, requireVerified)

// POST /api/v1/batches — create a new batch
router.post('/', createBatch)

// GET /api/v1/batches — list my batches
router.get('/', getMyBatches)

// GET /api/v1/batches/:id — single batch + transaction history
router.get('/:id', getBatchById)

// POST /api/v1/batches/:id/advance — advance to next stage
router.post('/:id/advance', advanceStage)

module.exports = router
