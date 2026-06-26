-- ============================================================
-- ATiMs Migration 002: batches table
-- Phase 1 — Core Traceability Platform
--
-- A batch is the core unit of traceability. Every crop harvest
-- or livestock group gets a unique Trace ID and moves through
-- a defined sequence of stages. Only farmers (crops) and
-- ranchers (livestock) can create batches.
-- ============================================================

-- ── Batch type enum ───────────────────────────────────────────
CREATE TYPE batch_type AS ENUM ('crop', 'livestock');

-- ── Crop stage enum ───────────────────────────────────────────
CREATE TYPE crop_stage AS ENUM (
  'HARVESTED',
  'AGGREGATED',
  'PACKED',
  'IN_TRANSIT',
  'AT_PORT',
  'EXPORTED',
  'DELIVERED'
);

-- ── Livestock stage enum ──────────────────────────────────────
CREATE TYPE livestock_stage AS ENUM (
  'REGISTERED',
  'AT_FARM',
  'IN_TRANSIT',
  'AT_ABATTOIR',
  'PROCESSED',
  'PACKED',
  'EXPORTED',
  'DELIVERED'
);

-- ── Compliance status enum ────────────────────────────────────
CREATE TYPE compliance_status AS ENUM (
  'pending',      -- no compliance check run yet
  'compliant',    -- all gates passed for current stage
  'blocked',      -- blocked from advancing — missing docs or certs
  'remediated'    -- was blocked; issues resolved, now compliant
);

-- ── Quality verdict enum ──────────────────────────────────────
CREATE TYPE quality_verdict AS ENUM (
  'PENDING',
  'PASS',
  'FAIL',
  'CONDITIONAL'
);

-- ── batches table ─────────────────────────────────────────────
CREATE TABLE batches (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- ATiMs-assigned trace identifier (e.g. TRC-2026-CROP-A3F8B21C)
  trace_id          TEXT NOT NULL UNIQUE,

  -- Originating entity (farmer or rancher only)
  origin_entity_id  UUID NOT NULL REFERENCES entities(id),

  -- Batch classification
  batch_type        batch_type NOT NULL,
  commodity         TEXT NOT NULL,      -- e.g. "Sesame Seeds", "Cassava", "Cattle"
  variety           TEXT,               -- e.g. "Ofada Rice", "Angus"
  quantity          NUMERIC(12,3) NOT NULL,
  unit              TEXT NOT NULL,      -- kg, MT, head, litres
  production_date   DATE NOT NULL,

  -- Origin geography
  origin_country    TEXT NOT NULL DEFAULT 'Nigeria',
  origin_state      TEXT,
  origin_lga        TEXT,
  farm_id           TEXT,               -- optional field/plot reference

  -- Current state — updated on every stage transition
  current_stage     TEXT NOT NULL,      -- stores crop_stage or livestock_stage value
  current_holder_id UUID REFERENCES entities(id),   -- who has custody now

  -- Compliance and quality state (updated by engines in Phase 2 & 3)
  compliance_status compliance_status NOT NULL DEFAULT 'pending',
  quality_verdict   quality_verdict NOT NULL DEFAULT 'PENDING',

  -- Destination (may be set later by export agent)
  destination_country TEXT,
  trade_corridor      TEXT,             -- e.g. 'EU', 'Gulf', 'AfCFTA-West'

  -- Blockchain
  -- Hash of the batch creation payload — first fingerprint in the chain
  genesis_hash      TEXT NOT NULL,

  -- QR / public traceability
  -- Public URL: /trace/{trace_id}
  is_public         BOOLEAN NOT NULL DEFAULT true,

  -- Soft delete
  archived          BOOLEAN NOT NULL DEFAULT false,

  -- Metadata
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX idx_batches_trace_id         ON batches(trace_id);
CREATE INDEX idx_batches_origin_entity    ON batches(origin_entity_id);
CREATE INDEX idx_batches_current_holder   ON batches(current_holder_id);
CREATE INDEX idx_batches_type             ON batches(batch_type);
CREATE INDEX idx_batches_commodity        ON batches(commodity);
CREATE INDEX idx_batches_compliance       ON batches(compliance_status);
CREATE INDEX idx_batches_created_at       ON batches(created_at DESC);

-- ── Auto-update trigger ───────────────────────────────────────
CREATE TRIGGER batches_updated_at
  BEFORE UPDATE ON batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can view public batches (provenance lookups)
CREATE POLICY "batches_select_public"
  ON batches FOR SELECT
  TO authenticated
  USING (
    is_public = true
    OR origin_entity_id = auth.uid()
    OR current_holder_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM entities e
      WHERE e.id = auth.uid()
        AND e.role IN ('inspector', 'admin')
    )
  );

-- Unauthenticated public can view public batches (for QR scan provenance)
CREATE POLICY "batches_select_anon"
  ON batches FOR SELECT
  TO anon
  USING (is_public = true AND archived = false);

-- Only service role inserts (via API controller)
CREATE POLICY "batches_insert_service"
  ON batches FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Only service role updates (stage transitions enforced by API)
CREATE POLICY "batches_update_service"
  ON batches FOR UPDATE
  TO service_role
  USING (true);

-- ── Comments ──────────────────────────────────────────────────
COMMENT ON TABLE  batches               IS 'Core traceability unit. One row per crop harvest or livestock group.';
COMMENT ON COLUMN batches.trace_id      IS 'ATiMs unique batch ID. Format: TRC-{YEAR}-{TYPE}-{8 hex chars}';
COMMENT ON COLUMN batches.current_stage IS 'Stores the current enum value from crop_stage or livestock_stage.';
COMMENT ON COLUMN batches.genesis_hash  IS 'SHA-256 fingerprint of the batch creation payload — chain anchor.';
COMMENT ON COLUMN batches.trade_corridor IS 'Destination trade corridor. Drives NTM profile selection in Phase 4.';
