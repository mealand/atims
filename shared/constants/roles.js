// ATiMs entity roles — used by both frontend and API for consistent role checks

export const ROLES = {
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

export const PUBLIC_ROLES = [
  ROLES.FARMER, ROLES.RANCHER, ROLES.AGGREGATOR, ROLES.PACKING,
  ROLES.ABATTOIR, ROLES.LAB, ROLES.COLD_CHAIN, ROLES.EXPORT,
]

export const INTERNAL_ROLES = [ROLES.INSPECTOR, ROLES.ADMIN]

export const BATCH_CREATORS = [ROLES.FARMER, ROLES.RANCHER]

export const ROLE_CODES = {
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
