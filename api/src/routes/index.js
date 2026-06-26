const express = require('express')
const router = express.Router()

// Phase 1 routes
router.use('/auth',     require('./auth'))
router.use('/entities', require('./entities'))
router.use('/batches',  require('./batches'))
router.use('/transactions', require('./transactions'))
router.use('/documents', require('./documents'))

// Phase 2 routes (stubbed — uncomment when Phase 2 begins)
// router.use('/compliance', require('./compliance'))
// router.use('/certifications', require('./certifications'))

// Phase 3 routes (stubbed)
// router.use('/lab-results', require('./labResults'))
// router.use('/quality', require('./quality'))

// Phase 4 routes (stubbed)
// router.use('/ntm', require('./ntm'))
// router.use('/cold-chain', require('./coldChain'))

module.exports = router
