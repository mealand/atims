const express = require('express')
const router = express.Router()
const { register, getMe } = require('../controllers/authController')
const { requireAuth } = require('../middleware/auth')

// POST /api/v1/auth/register — create auth user + entity record
router.post('/register', register)

// GET /api/v1/auth/me — get current authenticated entity
router.get('/me', requireAuth, getMe)

module.exports = router
