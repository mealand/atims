# ATiMs — Agro-Trace Integrated Management System

> Blockchain and AI-powered agricultural traceability, compliance, quality standards, and trade facilitation.

## Monorepo Structure

```
atims/
├── frontend/          React + Vite SPA
├── api/               Node.js + Express REST API
├── shared/            Shared constants, types, and utilities
├── docs/              Architecture, API, and deployment documentation
└── scripts/           Database migration and seed scripts
```

## Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9
- Supabase account and project

### Setup

```bash
# 1. Clone and install
git clone https://github.com/your-org/atims.git
cd atims
npm install

# 2. Configure environment
cp frontend/.env.example frontend/.env
cp api/.env.example api/.env
# Fill in your Supabase URL, keys, and Anthropic API key

# 3. Run database migrations
# (scripts to be added — see docs/deployment)

# 4. Start development
npm run dev
```

Frontend: http://localhost:5173  
API: http://localhost:3000  
API Health: http://localhost:3000/health

## Development Phases

| Phase | Scope | Months |
|-------|-------|--------|
| 1 | Core traceability: entities, batches, transactions, documents | 1–3 |
| 2 | Compliance engine: corridor profiles, stage gates, certifications | 4–5 |
| 3 | Quality verdict engine: lab results, standards library, verdicts | 6–7 |
| 4 | NTM advisor, cold chain, Hyperledger Fabric | 8–10 |

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, React Router v6
- **Backend**: Node.js, Express, Supabase (PostgreSQL + Auth + Storage)
- **Blockchain**: SHA-256 fingerprinting → Hyperledger Fabric (Phase 4)
- **AI**: Claude API (Anthropic) — NTM advisor, quality grading, image analysis

## Brand

Forest Green `#1A5C2A` · Harvest Amber `#E07C24` · Deep Blue `#185FA5`  
Typography: Sora (display) · DM Sans (body)
