// Supply chain stage definitions for both crop and livestock tracks

export const CROP_STAGES = [
  'HARVESTED',
  'AGGREGATED',
  'PACKED',
  'IN_TRANSIT',
  'AT_PORT',
  'EXPORTED',
  'DELIVERED',
]

export const LIVESTOCK_STAGES = [
  'REGISTERED',
  'AT_FARM',
  'IN_TRANSIT',
  'AT_ABATTOIR',
  'PROCESSED',
  'PACKED',
  'EXPORTED',
  'DELIVERED',
]

export const BATCH_TYPES = {
  CROP:      'crop',
  LIVESTOCK: 'livestock',
}

export const COMPLIANCE_STATUS = {
  PENDING:    'pending',
  COMPLIANT:  'compliant',
  BLOCKED:    'blocked',
  REMEDIATED: 'remediated',
}

export const VERDICT = {
  PASS:        'PASS',
  FAIL:        'FAIL',
  CONDITIONAL: 'CONDITIONAL',
  PENDING:     'PENDING',
}
