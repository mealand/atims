const Anthropic = require('@anthropic-ai/sdk')
const logger = require('../../utils/logger')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/**
 * Generate an NTM export readiness gap report for a batch × corridor.
 * Called only from the NTM route controller — never directly from the UI.
 *
 * @param {object} params
 * @param {object} params.batch - Batch record with commodity, origin, stage
 * @param {object} params.ntmProfile - Corridor NTM profile for destination country
 * @param {object} params.qualityVerdict - Latest quality verdict for the batch
 * @returns {object} Structured gap report
 */
async function generateGapReport({ batch, ntmProfile, qualityVerdict }) {
  // TODO: implement in Phase 4
  throw new Error('NTM Advisor not yet implemented — Phase 4')
}

module.exports = { generateGapReport }
