-- ============================================================
-- ATiMs Migration 005: seed data
-- Phase 1 — Core Traceability Platform
--
-- Reference data that must exist before any entity registers
-- or any batch is created. Does NOT create user accounts —
-- those come through auth.users via the registration flow.
-- ============================================================

-- ── Role code lookup (for Nexus ID generation reference) ──────
-- This is documentation-in-SQL; the actual generation is in
-- api/src/utils/idGenerator.js. Kept here as a reference view.
CREATE VIEW role_code_reference AS
SELECT role::TEXT, code FROM (VALUES
  ('farmer',         'FRM'),
  ('rancher',        'RCH'),
  ('aggregator',     'AGG'),
  ('packing_house',  'PKH'),
  ('abattoir',       'ABT'),
  ('food_safety_lab','LAB'),
  ('cold_chain',     'CCL'),
  ('export_agent',   'EXP'),
  ('inspector',      'INS'),
  ('admin',          'ADM')
) AS t(role, code);

-- ── Nigerian states reference ─────────────────────────────────
CREATE TABLE ref_states (
  code  TEXT PRIMARY KEY,
  name  TEXT NOT NULL,
  zone  TEXT NOT NULL
);

INSERT INTO ref_states (code, name, zone) VALUES
  ('AB', 'Abia',           'South East'),
  ('AD', 'Adamawa',        'North East'),
  ('AK', 'Akwa Ibom',      'South South'),
  ('AN', 'Anambra',        'South East'),
  ('BA', 'Bauchi',         'North East'),
  ('BY', 'Bayelsa',        'South South'),
  ('BE', 'Benue',          'North Central'),
  ('BO', 'Borno',          'North East'),
  ('CR', 'Cross River',    'South South'),
  ('DE', 'Delta',          'South South'),
  ('EB', 'Ebonyi',         'South East'),
  ('ED', 'Edo',            'South South'),
  ('EK', 'Ekiti',          'South West'),
  ('EN', 'Enugu',          'South East'),
  ('GO', 'Gombe',          'North East'),
  ('IM', 'Imo',            'South East'),
  ('JI', 'Jigawa',         'North West'),
  ('KD', 'Kaduna',         'North West'),
  ('KN', 'Kano',           'North West'),
  ('KT', 'Katsina',        'North West'),
  ('KE', 'Kebbi',          'North West'),
  ('KO', 'Kogi',           'North Central'),
  ('KW', 'Kwara',          'North Central'),
  ('LA', 'Lagos',          'South West'),
  ('NA', 'Nasarawa',       'North Central'),
  ('NI', 'Niger',          'North Central'),
  ('OG', 'Ogun',           'South West'),
  ('ON', 'Ondo',           'South West'),
  ('OS', 'Osun',           'South West'),
  ('OY', 'Oyo',            'South West'),
  ('PL', 'Plateau',        'North Central'),
  ('RI', 'Rivers',         'South South'),
  ('SO', 'Sokoto',         'North West'),
  ('TA', 'Taraba',         'North East'),
  ('YO', 'Yobe',           'North East'),
  ('ZA', 'Zamfara',        'North West'),
  ('FC', 'FCT - Abuja',    'North Central');

-- ── Trade corridor reference ──────────────────────────────────
-- Used by batches.trade_corridor and (Phase 4) ntm_profiles
CREATE TABLE ref_trade_corridors (
  code            TEXT PRIMARY KEY,
  label           TEXT NOT NULL,
  destination_region TEXT NOT NULL,
  key_frameworks  TEXT[],    -- e.g. ARRAY['AfCFTA', 'ECOWAS']
  notes           TEXT
);

INSERT INTO ref_trade_corridors (code, label, destination_region, key_frameworks, notes) VALUES
  ('EU',           'European Union',     'Europe',       ARRAY['EUDR', 'EU-Reg-2023/1115', 'Codex'],        'MRL-strict; EUDR mandatory for cocoa, soy, timber, cattle'),
  ('UK',           'United Kingdom',     'Europe',       ARRAY['UK-REACH', 'Codex'],                        'Post-Brexit own regulatory track'),
  ('UAE',          'UAE / Gulf States',  'Middle East',  ARRAY['Halal', 'GSO', 'Codex'],                    'Halal certification mandatory for livestock products'),
  ('GULF',         'GCC (Broader Gulf)', 'Middle East',  ARRAY['Halal', 'GSO'],                             'Gulf Cooperation Council member states'),
  ('ASIA_EAST',    'East Asia',          'Asia',         ARRAY['Codex', 'bilateral'],                       'China, Japan, South Korea — bilateral agreements apply'),
  ('AFCFTA_WEST',  'AfCFTA West Africa', 'Africa',       ARRAY['AfCFTA', 'ECOWAS-TEC'],                     'ECOWAS corridor — reduced tariffs under AfCFTA'),
  ('AFCFTA_EAST',  'AfCFTA East Africa', 'Africa',       ARRAY['AfCFTA', 'EAC'],                            'East African Community corridor'),
  ('AFCFTA_SOUTH', 'AfCFTA Southern',    'Africa',       ARRAY['AfCFTA', 'SADC'],                           'SADC corridor'),
  ('LOCAL',        'Domestic / Local',   'Nigeria',      ARRAY['NAFDAC', 'NAQS', 'SON'],                    'Nigerian domestic market — NAFDAC and NAQS standards'),
  ('USA',          'United States',      'North America',ARRAY['FSMA', 'FDA', 'Codex'],                     'FDA FSMA compliance required for food imports');

-- ── Common commodities reference ──────────────────────────────
CREATE TABLE ref_commodities (
  code        TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  batch_type  batch_type NOT NULL,
  hs_code     TEXT,           -- Harmonized System code (for NTM lookups)
  notes       TEXT
);

INSERT INTO ref_commodities (code, name, batch_type, hs_code, notes) VALUES
  -- Crops
  ('SESAME',    'Sesame Seeds',       'crop',      '1207.40', 'High NTM risk — Salmonella and MRL checks'),
  ('CASHEW',    'Cashew Nuts',        'crop',      '0801.31', 'EUDR applicable from 2025'),
  ('COCOA',     'Cocoa Beans',        'crop',      '1801.00', 'EUDR applicable — deforestation due diligence required'),
  ('CASSAVA',   'Cassava',            'crop',      '0714.10', NULL),
  ('MAIZE',     'Maize / Corn',       'crop',      '1005.90', NULL),
  ('SOYBEAN',   'Soybeans',           'crop',      '1201.90', 'EUDR applicable'),
  ('RICE',      'Rice (Paddy/Milled)','crop',      '1006.10', NULL),
  ('SORGHUM',   'Sorghum',            'crop',      '1007.90', NULL),
  ('OFADA',     'Ofada Rice',         'crop',      '1006.30', 'Nigerian variety — premium local market'),
  ('GINGER',    'Ginger',             'crop',      '0910.11', 'High EU MRL scrutiny'),
  ('PEPPER',    'Pepper',             'crop',      '0904.21', NULL),
  ('TOMATO',    'Tomatoes',           'crop',      '0702.00', 'Cold chain required'),
  ('YAMS',      'Yams',               'crop',      '0714.20', NULL),
  ('COWPEA',    'Cowpea / Black-eyed Peas', 'crop','0713.35',NULL),
  ('GROUNDNUT', 'Groundnuts/Peanuts', 'crop',      '1202.41', 'Aflatoxin MRL critical'),
  -- Livestock
  ('CATTLE',    'Cattle',             'livestock', '0102.29', 'Halal cert required for Gulf'),
  ('GOAT',      'Goats',              'livestock', '0104.20', NULL),
  ('SHEEP',     'Sheep',              'livestock', '0104.10', NULL),
  ('POULTRY',   'Poultry (Chicken)',  'livestock', '0105.11', 'Avian influenza surveillance required'),
  ('FISH',      'Fish (Farmed)',      'livestock', '0302.00', 'Cold chain mandatory'),
  ('CATFISH',   'Catfish',            'livestock', '0302.49', 'Dominant Nigerian aquaculture species'),
  ('EGGS',      'Eggs',               'livestock', '0407.11', NULL);
