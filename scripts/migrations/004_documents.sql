-- ============================================================
-- ATiMs Migration 004: documents table
-- Phase 1 — Core Traceability Platform
--
-- Certificates, permits, lab reports, and supporting files
-- uploaded by entities. Files are stored in Supabase Storage;
-- this table stores the metadata and verification state.
-- ============================================================

-- ── Document type enum ────────────────────────────────────────
CREATE TYPE document_type AS ENUM (
  -- Entity registration documents
  'cac_certificate',          -- Corporate Affairs Commission (Nigeria)
  'naqs_license',             -- Nigerian Agricultural Quarantine Service
  'nafdac_registration',      -- NAFDAC product registration
  'business_registration',    -- General business registration

  -- Batch / product documents
  'phytosanitary_certificate',
  'veterinary_health_cert',
  'halal_certificate',
  'fumigation_certificate',
  'certificate_of_origin',
  'quality_certificate',
  'export_permit',
  'import_permit',
  'lab_test_report',          -- Raw lab result file (Phase 3 uses lab_results table)
  'invoice',
  'packing_list',
  'bill_of_lading',
  'eudr_due_diligence',       -- EU Deforestation Regulation statement

  -- Other
  'other'
);

-- ── Document verification status ──────────────────────────────
CREATE TYPE doc_verification_status AS ENUM (
  'uploaded',     -- stored, awaiting review
  'verified',     -- inspector confirmed authentic
  'rejected',     -- inspector rejected (reason logged)
  'expired'       -- past expiry_date
);

-- ── documents table ───────────────────────────────────────────
CREATE TABLE documents (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Who uploaded this document
  uploaded_by       UUID NOT NULL REFERENCES entities(id),

  -- Document scope: linked to entity OR batch (or both)
  entity_id         UUID REFERENCES entities(id),
  batch_id          UUID REFERENCES batches(id) ON DELETE SET NULL,

  -- Document classification
  doc_type          document_type NOT NULL,
  title             TEXT NOT NULL,           -- human-readable label
  description       TEXT,

  -- Supabase Storage reference
  -- Full path within the storage bucket, e.g.:
  -- "entities/{entity_id}/cac_cert_2026.pdf"
  -- "batches/{batch_id}/phyto_cert_001.pdf"
  storage_path      TEXT NOT NULL,
  storage_bucket    TEXT NOT NULL DEFAULT 'atims-documents',
  file_name         TEXT NOT NULL,
  file_size_bytes   BIGINT,
  mime_type         TEXT,

  -- Validity
  issue_date        DATE,
  expiry_date       DATE,
  issuing_authority TEXT,

  -- Verification
  verification_status doc_verification_status NOT NULL DEFAULT 'uploaded',
  verified_by       UUID REFERENCES entities(id),
  verified_at       TIMESTAMPTZ,
  rejection_reason  TEXT,

  -- Link to the transaction that recorded this upload
  transaction_id    UUID REFERENCES transactions(id),

  -- Metadata
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX idx_documents_uploaded_by     ON documents(uploaded_by);
CREATE INDEX idx_documents_entity_id       ON documents(entity_id);
CREATE INDEX idx_documents_batch_id        ON documents(batch_id);
CREATE INDEX idx_documents_doc_type        ON documents(doc_type);
CREATE INDEX idx_documents_verification    ON documents(verification_status);
CREATE INDEX idx_documents_expiry          ON documents(expiry_date) WHERE expiry_date IS NOT NULL;

-- ── Auto-update trigger ───────────────────────────────────────
CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Expiry auto-flag ──────────────────────────────────────────
-- A scheduled job (node-cron) will call this daily.
-- Can also be run manually.
CREATE OR REPLACE FUNCTION flag_expired_documents()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE documents
  SET    verification_status = 'expired'
  WHERE  expiry_date < CURRENT_DATE
    AND  verification_status NOT IN ('expired', 'rejected');

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Uploaders can view their own documents
-- Batch holders can view documents linked to their batches
-- Inspectors and admins see all
CREATE POLICY "documents_select"
  ON documents FOR SELECT
  TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR entity_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM batches b
      WHERE b.id = documents.batch_id
        AND (b.origin_entity_id = auth.uid() OR b.current_holder_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM entities e
      WHERE e.id = auth.uid()
        AND e.role IN ('inspector', 'admin')
    )
  );

-- Only service role inserts (upload goes through API which writes Storage + metadata)
CREATE POLICY "documents_insert_service"
  ON documents FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Inspectors update verification_status; uploaders update non-status fields
CREATE POLICY "documents_update_service"
  ON documents FOR UPDATE
  TO service_role
  USING (true);

-- ── Comments ──────────────────────────────────────────────────
COMMENT ON TABLE  documents                   IS 'Metadata for all uploaded files. Files live in Supabase Storage.';
COMMENT ON COLUMN documents.storage_path      IS 'Path within storage_bucket. Use supabase.storage.from(bucket).getPublicUrl(path)';
COMMENT ON COLUMN documents.transaction_id    IS 'The DOCUMENT_UPLOADED transaction that recorded this upload event.';
COMMENT ON COLUMN documents.expiry_date       IS 'Drives the flag_expired_documents() daily job. Null = no expiry.';
