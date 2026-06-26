const crypto = require('crypto')

/**
 * Generate a SHA-256 blockchain fingerprint for a transaction payload.
 * This is written to the transactions table on every stage-change event.
 *
 * @param {object} payload - The transaction data to fingerprint
 * @returns {{ hash: string, timestamp: string }} - Hash and ISO timestamp
 */
function generateFingerprint(payload) {
  const timestamp = new Date().toISOString()
  const normalized = JSON.stringify({ ...payload, timestamp }, Object.keys({ ...payload, timestamp }).sort())
  const hash = crypto.createHash('sha256').update(normalized).digest('hex')
  return { hash, timestamp }
}

/**
 * Verify a stored fingerprint against its original payload.
 * Used for tamper-evidence checks on audit trails.
 */
function verifyFingerprint(payload, storedHash, storedTimestamp) {
  const normalized = JSON.stringify({ ...payload, timestamp: storedTimestamp }, Object.keys({ ...payload, timestamp: storedTimestamp }).sort())
  const recomputed = crypto.createHash('sha256').update(normalized).digest('hex')
  return recomputed === storedHash
}

module.exports = { generateFingerprint, verifyFingerprint }
