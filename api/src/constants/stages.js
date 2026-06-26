// CommonJS mirror of shared/constants/stages.js

const CROP_STAGES = [
  'HARVESTED',
  'AGGREGATED',
  'PACKED',
  'IN_TRANSIT',
  'AT_PORT',
  'EXPORTED',
  'DELIVERED',
]

const LIVESTOCK_STAGES = [
  'REGISTERED',
  'AT_FARM',
  'IN_TRANSIT',
  'AT_ABATTOIR',
  'PROCESSED',
  'PACKED',
  'EXPORTED',
  'DELIVERED',
]

const BATCH_TYPES = { CROP: 'crop', LIVESTOCK: 'livestock' }

/**
 * Returns the next valid stage for a given batch type and current stage.
 * Returns null if already at the final stage.
 */
function getNextStage(batchType, currentStage) {
  const stages = batchType === 'livestock' ? LIVESTOCK_STAGES : CROP_STAGES
  const idx = stages.indexOf(currentStage)
  if (idx === -1 || idx === stages.length - 1) return null
  return stages[idx + 1]
}

/**
 * Returns the first stage for a given batch type (used on batch creation).
 */
function getInitialStage(batchType) {
  return batchType === 'livestock' ? LIVESTOCK_STAGES[0] : CROP_STAGES[0]
}

module.exports = { CROP_STAGES, LIVESTOCK_STAGES, BATCH_TYPES, getNextStage, getInitialStage }
