const { v4: uuidv4 } = require('uuid')

/**
 * Generate a Trace ID for a batch.
 * Format: TRC-{YEAR}-{TYPE}-{8 random hex chars}
 * Example: TRC-2026-CROP-A3F8B21C
 */
function generateTraceId(type = 'CROP') {
  const year = new Date().getFullYear()
  const suffix = uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase()
  return `TRC-${year}-${type.toUpperCase()}-${suffix}`
}

/**
 * Generate a Nexus ID for an entity.
 * Format: NXS-{ROLE_CODE}-{6 random alphanum chars}
 * Example: NXS-FRM-X4T9K2
 */
function generateNexusId(roleCode = 'ENT') {
  const suffix = uuidv4().replace(/-/g, '').slice(0, 6).toUpperCase()
  return `NXS-${roleCode.toUpperCase()}-${suffix}`
}

module.exports = { generateTraceId, generateNexusId }
