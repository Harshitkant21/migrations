# Nexus Migrate — Project Context & Architecture Overview

## 1. Executive Summary & Purpose

**Nexus Migrate** is an enterprise-grade database migration intelligence and operations command center built for **Velocity Motors** (Automotive Manufacturing & Authoring Systems Migration).

The platform bridges three distinct migration environments:
- **Source Database (Legacy Production):** On-premise Oracle / IBM DB2 legacy databases.
- **Staging Sandbox (STG):** PostgreSQL 16 validation and remediation environment.
- **Target Production (PROD):** Snowflake Data Cloud target production database.

### The Problem It Solves
Enterprise database migrations fail due to five fundamental engineering challenges:
1. **Hidden Referential Cascades:** Modifying or deleting an upstream reference row silently corrupts tens of thousands of downstream child records.
2. **Opaque Transformation Rules:** Ingested fields undergo string trims or plant-code stripping without clear visual evidence of why LHS != RHS.
3. **Lack of Dry-Run Validation:** Direct database updates without pre-flight validation cause unexpected foreign key constraint crashes in production.
4. **Non-Audited Manual Fixes:** Ad-hoc database patches applied in production lack rollback trails or typed validation safety keys.
5. **Passive Monitoring Dashboards:** Traditional migration dashboards show error counts without explaining root causes, legacy source comparisons, or downstream risks.

Nexus Migrate solves these problems through an interactive **Investigate → Preview → Validate → Promote → Audit** operational lifecycle.

---

## 2. Product Vision & UX Philosophy

### Core UX Principle: Progressive Disclosure (Level 1 → Level 5)
The application adheres to a strict 5-level progressive disclosure hierarchy so a new user can understand the migration state within **30 seconds** of opening the app:

- **Level 1 — Overview (Dashboard):** *"What is happening?"* — Clean 94.8% Migration Health status, 92% progress bar, 4 key metrics, focused Needs Attention list, recent activity timeline, and single `[Review 6 Issues]` callout.
- **Level 2 — Investigation (Migration Health / Entity Explorer):** *"Where is the problem?"* — Table-level reconciliation stats, search bar, and domain category filters.
- **Level 3 — Diagnosis (Error Centre / Schema Explorer):** *"Why is this happening?"* — Plain-English error explanation, example value mismatch (`PUNE-X7-2026` vs `X7-2026`), recommended fix, and an expandable `▶ Show Technical Details` accordion hiding raw SQL, datatypes, and stack logs.
- **Level 4 — Resolution (Remediation Engine / STG Dry-Run):** *"How do I fix it?"* — 4-method value update engine (`DIRECT_OVERRIDE`, `PATTERN_TRANSFORM`, `LEGACY_IMPORT`, `SQL_EXPRESSION`), STG dry-run pre-flight check dialog, and PROD promotion confirmation modal (`BATCH` vs `SINGLE` push).
- **Level 5 — Validation (Audit History):** *"Did the fix work?"* — Re-validation proof (0 errors remaining) and immutable append-only audit trail.

### Visual Aesthetic
Modern enterprise visual design inspired by Stripe, Linear, Datadog, and Snowflake:
- **Theme:** Light, calm, trustworthy aesthetic (`bg-surface`, `border-slate-200`, Slate text, GM Blue accents).
- **Typography:** Outfit (Display headers) and Inter (UI body).
- **Animations:** State-explaining transitions only (progress bar updating, validation completing, drawer sliding). No glowing cyberpunk effects or pulsing neon borders.

---

## 3. Technology Stack & Architecture

- **Frontend Framework:** React 18.3 + TypeScript 5.8 + Vite 8.2
- **Styling:** Tailwind CSS 3.4 + Vanilla CSS custom variables (`bg-surface`, `bg-brand`, `shadow-premium`)
- **State Management:** Zustand 5.0 (`useGlobalStore.ts` storing `environment`, `activePage`, `selectedEntityId`, `selectedErrorId`, `selectedVehicleId`)
- **Diagrams & Graphs:** ReactFlow 12.4 (`@xyflow/react`) for interactive ER schema maps and multi-tier cascade domino graphs
- **Data Visualization:** Recharts 2.15 for trend curves
- **Icons:** Lucide React 1.16

### Current Architecture: Frontend-First Simulator
The application currently runs as a frontend-only simulator powered by deterministic seeded mock data (`src/data/database/seedData.ts`) wrapped inside an asynchronous service layer (`src/data/mockApi.ts`).

### Backend-Ready API Service Boundary
All database operations pass through `mockApi.ts`. To connect a real backend, **zero UI code changes are required** — simply replace `mockApi.ts` promises with HTTP REST/GraphQL calls targeting real backend endpoints:
- `GET /api/v1/entities` (Schema table metrics)
- `GET /api/v1/errors` (Data quality anomalies)
- `POST /api/v1/remediation/preview` (STG pre-flight dry-run)
- `POST /api/v1/remediation/execute` (PROD promotion commit)
- `GET /api/v1/source/compare/:errorId` (Legacy database comparator)
- `GET /api/v1/audits` (Immutable transaction logs)

---

## 4. Major Modules & Navigation Structure

Nexus Migrate consists of 9 primary workspace pages:
1. **Executive Dashboard (`Dashboard.tsx`):** Level 1 Overview dashboard.
2. **Migration Health (`MigrationHealth.tsx`):** Source vs STG vs PROD record reconciliation table.
3. **Entity Explorer (`EntityExplorer.tsx`):** Column schema viewer and data quality links.
4. **Error Centre Workbench (`ErrorCentre.tsx`):** Plain-English error drawer, 4-method value update engine, STG dry-run dialog, and PROD promotion modal.
5. **Cascade Analysis (`CascadeAnalysis.tsx`):** Multi-tier domino tree graph, $2,063\times$ amplification factor, blast radius inspector, and SVG/PNG image export.
6. **Schema Explorer (`SchemaExplorer.tsx`):** 11-table ER diagram canvas, table search, domain category filters, 7 table detail tabs (`Overview`, `Schema`, `Data`, `Relationships`, `Mapping`, `Validation`, `History`), High-Res SVG Diagram Export, and SQL DDL Script Generator.
7. **Author Changes (`AuthorChanges.tsx`):** Field-level author revision timeline (Original → Migrated → Current) with approval workflows.
8. **Page Drilldown Directory (`PageDrilldown.tsx`):** Central sitemap directory matrix.
9. **Audit History (`AuditHistory.tsx`):** Immutable operational audit logs capturing operator actions and before/after diff snapshots.

---

## 5. Seed Data & Velocity Motors Domain Story

The seed dataset models **Velocity Motors**, a global automotive manufacturer migrating legacy production systems:
- **Pune Manufacturing Facility (India):** Houses legacy engine assembly databases (`LEGACY_VHCLS`, `LEGACY_MDLS`).
- **Munich R&D Facility (Germany):** Houses European engineering control catalogs (`LEGACY_PCS_HDR`, `LEGACY_PCS_PROC`).
- **Vehicle Authoring Models:** `GMV-2967` (Next-Gen EV Platform), `GMV-1713` (Hybrid V8 Module), `GMV-1750` (Obsolete Concept Row).
- **Seeded Data Quality Anomalies:**
  - `ERR-2967` (Missing Parent Reference): Vehicle code `GMV-2967` missing in reference catalog; blocks 150,610 terminal procedure rows ($2,063\times$ cascade multiplier). `FIXABLE`.
  - `ERR-1713` (Duplicate Regional Keys): Ingested duplicate regional keys in staging. `FIXABLE`.
  - `ERR-1750` (Orphan Reference Row): Excluded make code `"GEN"` with 0 child dependents. `DELETE_CANDIDATE`.
  - `ERR-3091` (Unsafe Deletion Block): 521,878 MCS procedure drafts referencing parent node. `BLOCKED`.

---

## 6. Key Architectural Decisions Made

1. **AI Copilot Removed (`not required`):** Removed Copilot drawer and state to focus on deterministic database governance and automated pre-flight checks.
2. **High-Fidelity Diagram Exports:** Integrated vector SVG and PNG image exports in Schema Explorer and Cascade view, alongside SQL `CREATE TABLE` / `ALTER TABLE` DDL generation.
3. **Multi-Tier Domino Effect Tree:** Upgraded cascade visualization to map 4 distinct tiers ($\text{Root Anomaly} \rightarrow \text{Headers} \rightarrow \text{Systems} \rightarrow \text{Subsystems} \rightarrow \text{Leaf Procedures}$).
4. **4-Method Remediation Engine:** Implemented `DIRECT_OVERRIDE`, `PATTERN_TRANSFORM`, `LEGACY_IMPORT`, and `SQL_EXPRESSION` update selectors.
5. **5-Level Progressive Disclosure:** Simplified Dashboard and Error Drawer to present plain-English explanations first before expanding technical details.

---

## 7. Future Roadmap & Production Readiness

- **Real Database Integration:** Replace `mockApi.ts` with real PostgreSQL / Snowflake backend REST API clients.
- **Live Progress Streaming:** Add WebSocket connection to stream real-time execution logs and rows/sec throughput during production commits.
- **Automated Table Checksum Hashing:** Implement background row-hash comparison between Source, STG, and PROD.
- **Dynamic ER Layout Engine:** Integrate Dagre/ELK auto-layout algorithms for arbitrary multi-schema visualization.
