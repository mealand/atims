-- ============================================================
-- ATiMs Migration 003: transactions table
-- Phase 1 — Core Traceability Platform
--
-- Every supply chain event — stage transitions, custody changes,
-- document uploads — is recorded as an immutable transaction.
-- Each transaction is SHA-256 fingerprinted to form the
-- blockchain-style audit trail.
--
-- Transactions are NEVER updated or deleted. Corrections are
-- made by recording a new corrective transaction.
-- ============================================================

-- ── Transaction type enum ─────────────────────────────────────
CREATE TYPE transaction_type AS ENUM (
  -- Core lifecycle
  'BATCH_CREATED',
  'STAGE_ADVANCED',
  'CUSTODY_TRANSFERRED',

  -- Documents
  'DOCUMENT_UPLOADED',
  'DOCUMENT_VERIFIED',

  -- Compliance (Phase 2 — type defined now, used later)
  'COMPLIANCE_CHECKED',
  'COMPLIANCE_BLOCKED',
  'COMPLIANCE_CLEARED',

  -- Quality (Phase 3)
  'LAB_RESULT_SUBMITTED',
  'QUALITY_VERDICT_ISSUED',

  -- NTM (Phase 4)
  'NTM_REPORT_GENERATED',

  -- Cold chain (Phase 4)
  'COLD_CHAIN_BREACH',

  -- Corrections
  'NOTE_ADDED',
  'CORRECTION_RECORDED'
);

-- ── transactions table ────────────────────────────────────────
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Batch this transaction belongs to
  batch_id        UUID NOT NULL REFERENCES batches(id) ON DELETE RESTRICT,

  -- Who performed the action
  actor_id        UUID NOT NULL REFERENCES entities(id),

  -- Event classification
  tx_type         transaction_type NOT NULL,

  -- Stage transition (populated for STAGE_ADVANCED events)
  from_stage      TEXT,
  to_stage        TEXT,

  -- Custody transfer (populated for CUSTODY_TRANSFERRED events)
  from_entity_id  UUID REFERENCES entities(id),
  to_entity_id    UUID REFERENCES entities(id),

  -- Flexible payload — stores event-specific data as JSON
  -- Examples:
  --   BATCH_CREATED:      { commodity, quantity, unit, origin }
  --   STAGE_ADVANCED:     { previous_stage, new_stage, location }
  --   DOCUMENT_UPLOADED:  { document_id, doc_type, filename }
  --   COMPLIANCE_BLOCKED: { missing_certs: [...], corridor }
  payload         JSONB NOT NULL DEFAULT '{}',

  -- ── Blockchain fields ─────────────────────────────────────
  -- SHA-256 hash of: { batch_id, actor_id, tx_type, payload, timestamp, previous_hash }
  tx_hash         TEXT NOT NULL UNIQUE,

  -- Hash of the immediately preceding transaction for this batch
  -- NULL only for the genesis transaction (BATCH_CREATED)
  previous_hash   TEXT,

  -- Canonical timestamp used in hash computation (immutable)
  tx_timestamp    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Location at time of event (optional — from device GPS or manual entry)
  latitude        NUMERIC(9,6),
  longitude       NUMERIC(9,6),
  location_label  TEXT,

  -- Soft integrity flag — set false if tampering detected
  is_valid        BOOLEAN NOT NULL DEFAULT true
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX idx_transactions_batch_id     ON transactions(batch_id);
CREATE INDEX idx_transactions_actor_id     ON transactions(actor_id);
CREATE INDEX idx_transactions_tx_type      ON transactions(tx_type);
CREATE INDEX idx_transactions_tx_hash      ON transactions(tx_hash);
CREATE INDEX idx_transactions_tx_timestamp ON transactions(tx_timestamp DESC);

-- Composite: batch history in chronological order (most used query)
CREATE INDEX idx_transactions_batch_history
  ON transactions(batch_id, tx_timestamp ASC);

-- ── Immutability enforcement ──────────────────────────────────
-- Transactions must NEVER be updated or deleted after insert.
-- The API enforces this, but the DB adds a second layer.

CREATE OR REPLACE FUNCTION prevent_transaction_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Transactions are immutable. Record a corrective transaction instead.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_no_update
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION prevent_transaction_mutation();

CREATE TRIGGER transactions_no_delete
  BEFORE DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION prevent_transaction_mutation();

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view transactions for batches they're linked to
CREATE POLICY "transactions_select_authenticated"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    -- Actor can always see their own transactions
    actor_id = auth.uid()
    -- Batch origin entity or current holder
    OR EXISTS (
      SELECT 1 FROM batches b
      WHERE b.id = transactions.batch_id
        AND (b.origin_entity_id = auth.uid() OR b.current_holder_id = auth.uid())
    )
    -- Inspectors and admins see all
    OR EXISTS (
      SELECT 1 FROM entities e
      WHERE e.id = auth.uid()
        AND e.role IN ('inspector', 'admin')
    )
  );

-- Anon can view transactions for public batches (QR provenance)
CREATE POLICY "transactions_select_anon"
  ON transactions FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM batches b
      WHERE b.id = transactions.batch_id
        AND b.is_public = true
        AND b.archived = false
    )
  );

-- Only service role can insert (all writes go through API)
CREATE POLICY "transactions_insert_service"
  ON transactions FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ── Comments ──────────────────────────────────────────────────
COMMENT ON TABLE  transactions              IS 'Immutable event log. Every supply chain action produces one row.';
COMMENT ON COLUMN transactions.tx_hash      IS 'SHA-256 fingerprint of the full transaction payload + previous_hash.';
COMMENT ON COLUMN transactions.previous_hash IS 'Links to prior tx_hash for this batch — forms the chain.';
COMMENT ON COLUMN transactions.payload      IS 'Event-specific JSON data. Schema varies by tx_type.';
COMMENT ON COLUMN transactions.is_valid     IS 'Set false if hash verification fails during audit.';
