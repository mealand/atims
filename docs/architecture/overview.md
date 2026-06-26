# ATiMs Architecture Overview

## System Layers

1. **Presentation** — React SPA with role-based dashboards (8 public, 2 internal)
2. **API / Business Logic** — Node.js/Express: compliance engine, verdict engine, NTM advisor, stage gate controller
3. **AI Integration** — Claude API (isolated service modules, never called from frontend)
4. **Data** — Supabase PostgreSQL (14 tables), Supabase Auth + RLS, Supabase Storage
5. **Blockchain** — SHA-256 fingerprints (Phase 1–3), Hyperledger Fabric (Phase 4)

## Key Design Decisions

- **API-first**: All features are built as API endpoints before UI is wired
- **RLS from day 1**: Supabase Row Level Security policies written before data enters any table
- **AI isolated**: Claude API calls live in `/api/src/services/ai/` only — no frontend API calls
- **Phase-gated schema**: Tables introduced only in the phase that needs them
- **Active compliance**: Stage gates BLOCK progression — they do not merely log

## Supply Chain Tracks

### Crop Track
HARVESTED → AGGREGATED → PACKED → IN_TRANSIT → AT_PORT → EXPORTED → DELIVERED

### Livestock Track
REGISTERED → AT_FARM → IN_TRANSIT → AT_ABATTOIR → PROCESSED → PACKED → EXPORTED → DELIVERED
