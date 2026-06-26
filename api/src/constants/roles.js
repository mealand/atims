// CommonJS mirror of shared/constants/roles.js
// Kept in sync manually — shared/ is ESM-only and api/ is CommonJS,
// so we mirror rather than fight Node's module interop here.

const ROLES = {
  FARMER:      'farmer',
  RANCHER:     'rancher',
  AGGREGATOR:  'aggregator',
  PACKING:     'packing_house',
  ABATTOIR:    'abattoir',
  LAB:         'food_safety_lab',
  COLD_CHAIN:  'cold_chain',
  EXPORT:      'export_agent',
  INSPECTOR:   'inspector',
  ADMIN:       'admin',
}

const PUBLIC_ROLES = [
  ROLES.FARMER, ROLES.RANCHER, ROLES.AGGREGATOR, ROLES.PACKING,
  ROLES.ABATTOIR, ROLES.LAB, ROLES.COLD_CHAIN, ROLES.EXPORT,
]

const INTERNAL_ROLES = [ROLES.INSPECTOR, ROLES.ADMIN]

const BATCH_CREATORS = [ROLES.FARMER, ROLES.RANCHER]

const ROLE_CODES = {
  [ROLES.FARMER]:     'FRM',
  [ROLES.RANCHER]:    'RCH',
  [ROLES.AGGREGATOR]: 'AGG',
  [ROLES.PACKING]:    'PKH',
  [ROLES.ABATTOIR]:   'ABT',
  [ROLES.LAB]:        'LAB',
  [ROLES.COLD_CHAIN]: 'CCL',
  [ROLES.EXPORT]:     'EXP',
  [ROLES.INSPECTOR]:  'INS',
  [ROLES.ADMIN]:      'ADM',
}

module.exports = { ROLES, PUBLIC_ROLES, INTERNAL_ROLES, BATCH_CREATORS, ROLE_CODES }
