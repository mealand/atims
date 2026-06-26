-- ============================================================
-- ATiMs Migration 006: Phase 2 table stubs
-- 
-- These tables are created empty in Phase 1 so that:
-- 1. Foreign key references from Phase 1 tables can exist
-- 2. The schema is forward-compatible from deployment day one
-- 3. Phase 2 development just adds columns/logic, not new tables
--
-- Full column definitions and RLS are added in Phase 2 migrations.
-- ============================================================

-- Compliance engine tables
CREATE TABLE corridor_profiles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- Phase 2 columns: corridor_code, required_certs[], stage_rules (JSONB), etc.
);

CREATE TABLE certifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- Phase 2 columns: entity_id, batch_id, cert_type, issued_by, expiry_date, etc.
);

CREATE TABLE compliance_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- Phase 2 columns: batch_id, stage, result (PASS/FAIL), blocking_reasons (JSONB), etc.
);

COMMENT ON TABLE corridor_profiles  IS 'Phase 2: Per-destination compliance rule profiles. Stub created in Phase 1.';
COMMENT ON TABLE certifications     IS 'Phase 2: Entity and batch certificates with expiry tracking. Stub in Phase 1.';
COMMENT ON TABLE compliance_events  IS 'Phase 2: Structured log of every stage gate evaluation. Stub in Phase 1.';
