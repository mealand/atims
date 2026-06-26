-- ============================================================
-- ATiMs: Run all Phase 1 migrations in order
--
-- Execute this file in your Supabase SQL Editor to set up
-- the complete Phase 1 schema.
--
-- Order matters — foreign key dependencies:
--   001 entities  (no dependencies)
--   002 batches   (depends on entities)
--   003 transactions (depends on batches, entities)
--   004 documents    (depends on entities, batches, transactions)
--   005 seed_data    (depends on batch_type enum from 002)
--   006 phase2_stubs (no dependencies — empty tables)
-- ============================================================

\i 001_entities.sql
\i 002_batches.sql
\i 003_transactions.sql
\i 004_documents.sql
\i 005_seed_data.sql
\i 006_phase2_stubs.sql

-- Verify tables created
SELECT table_name, pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS size
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
