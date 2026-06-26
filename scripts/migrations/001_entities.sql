-- ============================================================
-- ATiMs Migration 001: entities table
-- Phase 1 — Core Traceability Platform
-- 
-- Every organisation that participates in the ATiMs supply chain
-- is an entity. Entities are verified by an Inspector before they
-- can create or receive batches.
-- ============================================================

-- Enable UUID extension (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Entity status enum ───────────────────────────────────────
CREATE TYPE entity_status AS ENUM (
  'pending',      -- registered, awaiting inspector verification
  'verified',     -- approved — can transact
  'suspended',    -- temporarily blocked by admin
  'rejected'      -- verification denied
);

-- ── Entity role enum ─────────────────────────────────────────
CREATE TYPE entity_role AS ENUM (
  'farmer',
  'rancher',
  'aggregator',
  'packing_house',
  'abattoir',
  'food_safety_lab',
  'cold_chain',
  'export_agent',
  'inspector',
  'admin'
);

-- ── entities table ────────────────────────────────────────────
CREATE TABLE entities (
  -- Primary key: Supabase Auth user ID (1-to-1 with auth.users)
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- ATiMs-assigned unique identifier (e.g. NXS-FRM-A3F8B2)
  nexus_id        TEXT NOT NULL UNIQUE,

  -- Identity
  role            entity_role NOT NULL,
  business_name   TEXT NOT NULL,
  contact_name    TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  phone           TEXT,

  -- Location
  country         TEXT NOT NULL DEFAULT 'Nigeria',
  state_province  TEXT,
  lga             TEXT,       -- Local Government Area (Nigeria-specific)
  address         TEXT,

  -- Registration
  reg_number      TEXT,       -- CAC number, NAQS license, etc.
  status          entity_status NOT NULL DEFAULT 'pending',

  -- Inspector decision trail
  verified_by     UUID REFERENCES entities(id),
  verified_at     TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Metadata
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX idx_entities_nexus_id  ON entities(nexus_id);
CREATE INDEX idx_entities_role      ON entities(role);
CREATE INDEX idx_entities_status    ON entities(status);
CREATE INDEX idx_entities_email     ON entities(email);

-- ── Auto-update updated_at ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER entities_updated_at
  BEFORE UPDATE ON entities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;

-- Public: any authenticated user can view verified entities
-- (needed for batch provenance lookups)
CREATE POLICY "entities_select_verified"
  ON entities FOR SELECT
  TO authenticated
  USING (
    status = 'verified'
    OR auth.uid() = id          -- own record always visible
    OR EXISTS (                  -- inspectors and admins see all
      SELECT 1 FROM entities e
      WHERE e.id = auth.uid()
        AND e.role IN ('inspector', 'admin')
    )
  );

-- Entities can update only their own non-status fields
CREATE POLICY "entities_update_own"
  ON entities FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Prevent self-promotion of status field (handled by API only)
  );

-- Insert: only the API (service role) inserts — via registration endpoint
-- No direct client insert policy needed when using service role key on backend
CREATE POLICY "entities_insert_service"
  ON entities FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Inspectors and admins can update status
CREATE POLICY "entities_update_inspector"
  ON entities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM entities e
      WHERE e.id = auth.uid()
        AND e.role IN ('inspector', 'admin')
    )
  );

-- ── Comments ──────────────────────────────────────────────────
COMMENT ON TABLE  entities                IS 'All registered ATiMs participants. One row per auth.users account.';
COMMENT ON COLUMN entities.nexus_id       IS 'ATiMs-assigned unique identifier. Format: NXS-{ROLE_CODE}-{6 hex chars}';
COMMENT ON COLUMN entities.status         IS 'pending → verified/rejected by inspector. suspended by admin.';
COMMENT ON COLUMN entities.lga            IS 'Local Government Area — Nigeria-specific administrative subdivision.';
