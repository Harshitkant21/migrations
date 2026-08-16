# Nexus Migrate — Comprehensive Functionality & Team Onboarding Handbook

Welcome to **Nexus Migrate**! This document serves as the single source of truth for the product functionality, user interface behavior, data models, state architecture, and operational workflows of the platform.

Whether you are a **newly joined developer, QA engineer, database architect, or product manager**, reading this handbook will give you a complete end-to-end understanding of how the system works without needing to trace every line of code.

---

## Table of Contents
1. [Product Vision & Core Purpose](#1-product-vision--core-purpose)
2. [UX Philosophy: Progressive Disclosure (Levels 1–5)](#2-ux-philosophy-progressive-disclosure-levels-15)
3. [Data & Migration Architecture](#3-data--migration-architecture)
4. [Velocity Motors Automotive Domain Story](#4-velocity-motors-automotive-domain-story)
5. [Complete Screen-by-Screen Functional Reference](#5-complete-screen-by-screen-functional-reference)
   - [Screen 1: Executive Dashboard (Level 1 Overview)](#screen-1-executive-dashboard-level-1-overview)
   - [Screen 2: Migration Health & Reconciliation](#screen-2-migration-health--reconciliation)
   - [Screen 3: Entity Explorer & Data Grid](#screen-3-entity-explorer--data-grid)
   - [Screen 4: Error Centre Workbench & Diagnostic Drawer](#screen-4-error-centre-workbench--diagnostic-drawer)
   - [Screen 5: Cascade Impact Analysis & Domino Engine](#screen-5-cascade-impact-analysis--domino-engine)
   - [Screen 6: Schema Explorer & ER Map](#screen-6-schema-explorer--er-map)
   - [Screen 7: Authoring Changes Audit](#screen-7-authoring-changes-audit)
   - [Screen 8: Page Drilldown Directory](#screen-8-page-drilldown-directory)
   - [Screen 9: Operational Audit Logs & Execution Replay](#screen-9-operational-audit-logs--execution-replay)
6. [Detailed End-to-End Operational Workflows](#6-detailed-end-to-end-operational-workflows)
7. [State Architecture & Mock Service Boundary](#7-state-architecture--mock-service-boundary)
8. [Developer Onboarding & Customization Guide](#8-developer-onboarding--customization-guide)

---

## 1. Product Vision & Core Purpose

**Nexus Migrate** is an enterprise database migration intelligence and operations command center built for **Velocity Motors** (Automotive Manufacturing & Authoring Systems Migration).

### Why Nexus Migrate Exists
Enterprise database migrations (such as moving legacy vehicle authoring, manufacturing control systems, and part catalogs from legacy databases to cloud schemas) frequently fail due to five critical engineering challenges:

1. **Hidden Referential Cascades:** Deleting or altering a single upstream parent reference row silently breaks tens or hundreds of thousands of downstream child records.
2. **Opaque Transformation Rules:** Ingested string fields undergo plant-code trimming or UUID transformations without visual proof of why Left-Hand Side (LHS) != Right-Hand Side (RHS).
3. **Lack of Pre-Flight Dry-Run Validation:** Executing direct database commits without sandbox validation causes unexpected foreign key constraint crashes in production.
4. **Non-Audited Manual Fixes:** Ad-hoc database patches applied in production lack rollback trails, operator comments, or typed environment safety verification keys.
5. **Passive Health Dashboards:** Traditional migration dashboards show static error counts without explaining root causes, legacy source comparisons, or downstream blast radius.

Nexus Migrate solves these challenges by combining **Migration Reconciliation**, **Plain-English Error Diagnosis**, **Multi-Tier Domino Blast Radius Analysis**, **4-Method Value Remediation**, **STG Sandbox Pre-Flight Dry Runs**, and **Immutable Operational Auditing** into a single command center.

---

## 2. UX Philosophy: Progressive Disclosure (Levels 1–5)

To ensure that anyone opening the application can understand the migration state within **30 seconds**, Nexus Migrate structures information across **5 progressive levels**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ LEVEL 1: OVERVIEW (Dashboard)                                                          │
│ "What is happening?" ──► 94.8% Health | 92% Progress | 6 Issues Needing Attention       │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼ (Click "Investigate" / "Review Issues")
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ LEVEL 2: INVESTIGATION (Migration Health / Entity Explorer)                            │
│ "Where is the problem?" ──► Table-level status: Vehicles (42,381 failed rows)           │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼ (Click specific error row)
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ LEVEL 3: DIAGNOSIS (Error Detail Drawer)                                               │
│ "Why is this happening?" ──► Plain-English explanation + Plain Before/After example    │
│                              (Technical Details hidden behind expandable accordion)     │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼ (Click "Preview Fix")
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ LEVEL 4: RESOLUTION (STG Sandbox Dry-Run & Promotion Modal)                            │
│ "How do I fix it?" ──► Preview record changes → Run STG Dry-Run → Push to PROD          │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼ (Execution Complete)
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ LEVEL 5: VALIDATION (Audit Logs & Re-Validation Proof)                                 │
│ "Did the fix actually work?" ──► Re-validation passed (✓ 0 errors) + Immutable Audit Log│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Visual Aesthetic Guidelines
- **Modern Enterprise Theme:** Inspired by Stripe, Linear, Datadog, and Snowflake. Light, calm, trustworthy aesthetic (`bg-surface`, `border-slate-200`, Slate body text, GM Blue accents).
- **Typography:** Outfit (Display headers) and Inter (UI body & table text).
- **Animations:** State-explaining transitions only (progress bar fills, drawer slides, validation completions). No distracting neon glows or pulsing cyberpunk effects.

---

## 3. Data & Migration Architecture

Nexus Migrate governs data across three distinct environments:

```
┌──────────────────────────┐      ┌──────────────────────────┐      ┌──────────────────────────┐
│   SOURCE DATABASE        │      │    STAGING SANDBOX       │      │   PRODUCTION TARGET      │
│ (Legacy Oracle / DB2)    │ ───► │ (PostgreSQL Validation)  │ ───► │ (Snowflake Cloud DB)     │
│ Ingested Legacy Metadata │      │ Dry-Run & Remediation    │      │ Promoted & Audited Data  │
└──────────────────────────┘      └──────────────────────────┘      └──────────────────────────┘
```

1. **Source Database (Legacy Production):** Legacy on-premise Oracle / IBM DB2 databases containing raw, un-normalized historical manufacturing and vehicle authoring data.
2. **Staging Sandbox (STG):** PostgreSQL 16 sandbox environment where ETL transformation rules are executed, data quality constraints are validated, and pre-flight dry runs are performed.
3. **Production Target (PROD):** Target Snowflake Data Cloud production database where approved, sanitized data is promoted and published.

---

## 4. Velocity Motors Automotive Domain Story

To make demonstrations reproducible and realistic, the mock dataset models **Velocity Motors**, a global automotive manufacturer migrating production systems:

- **Pune Assembly Plant (India):** Houses legacy engine assembly databases (`LEGACY_VHCLS`, `LEGACY_MDLS`).
- **Munich R&D Facility (Germany):** Houses European engineering control catalogs (`LEGACY_PCS_HDR`, `LEGACY_PCS_PROC`).
- **11 Core Database Tables:**
  - **Reference Domain:** `makes`, `models`, `vehicles` (Master vehicle authoring catalog).
  - **PCS Domain (Production Configuration Systems):** `pcs`, `pcs_systems`, `pcs_subsystems`, `pcs_procedures` (Terminal assembly procedures; 150,610 rows).
  - **MCS Domain (Manufacturing Control Systems):** `mcs`, `mcs_systems`, `mcs_subsystems`, `mcs_procedures` (Plant automation procedure drafts; 521,878 rows).
- **Seeded Data Quality Scenarios:**
  - `ERR-2967` (Missing Parent Reference): Vehicle ID `GMV-2967` is present in child procedures but missing from reference table. Blocks 150,610 child procedure rows ($2,063\times$ cascade multiplier). `FIXABLE`.
  - `ERR-1713` (Duplicate Regional Keys): Ingested duplicate regional key entries in staging. `FIXABLE`.
  - `ERR-1750` (Orphan Reference Row): Excluded make code `"GEN"` with 0 child dependents. `DELETE_CANDIDATE`.
  - `ERR-3091` (Unsafe Deletion Block): 521,878 MCS procedure drafts referencing parent node. `BLOCKED`.

---

## 5. Complete Screen-by-Screen Functional Reference

### Screen 1: Executive Dashboard (Level 1 Overview)
- **Path / Route:** `/dashboard` (File: `src/pages/Dashboard.tsx`)
- **Purpose:** Gives executive stakeholders and migration leads a calm, 30-second summary of overall migration health.
- **Key UI Elements:**
  - **Migration Health Banner:** Displays `Migration Health: 94.8% (Healthy)`.
  - **1-Line Progress Bar:** Visualizes `92% Complete (221 / 245 tables migrated)` with color segments for Migrated (`221`), In Progress (`18`), and Require Attention (`6`).
  - **4 Primary Metric Cards:** Tables (`221 / 245`), Total Records (`18.4M`), Successful Records (`18.1M`), Failed/Blocked (`42.3K`).
  - **Actionable "Needs Attention" Area:** Displays prioritized items requiring human attention:
    - ⚠ **Vehicles Catalog Reference:** `42,381 records affected` | *Engine mapping mismatch* $\rightarrow$ `[Investigate]` button
    - ⚠ **Warranty Claims Assembly:** `1,284 records affected` | *Datatype mismatch* $\rightarrow$ `[Investigate]` button
    - ⚠ **MCS Procedures Drafts:** `521,878 records affected` | *Foreign key deletion block* $\rightarrow$ `[Investigate]` button
    - ✓ **Customers Catalog:** `Validation completed` | `100% reconciled`
  - **Recent Activity Timeline:** Non-distracting timeline of recent migration events (`Customer migration completed 2m ago`).
  - **Primary Action Button:** Prominent **`[Review 6 Issues]`** button navigating directly to Error Centre.

---

### Screen 2: Migration Health & Reconciliation
- **Path / Route:** `/health` (File: `src/pages/MigrationHealth.tsx`)
- **Purpose:** Level 2 Investigation view providing environment-aware reconciliation statistics across all 11 database tables.
- **Key UI Elements & Functionality:**
  - **Global Environment Switcher:** Toggle between `Source DB`, `STG`, and `PROD` to view environment-specific row counts.
  - **Live Search Bar & Filters:** Filter tables by name, domain category (`Reference`, `PCS`, `MCS`), status (`Healthy`, `Warning`, `Critical`), or check `Only show tables with discrepancies`.
  - **Sortable Columns:** Click column headers to sort by Table Name, Discrepancy Count, or Migration Completeness %.
  - **Table Reconciliation Grid:** Displays Table Name, Domain Category, Source Rows, STG Rows, PROD Rows, Record Difference Count, Migration %, and Status Badge.
  - **Interactive Drilldown:** Clicking any table row sets `selectedEntityId` and navigates to Entity Explorer.

---

### Screen 3: Entity Explorer & Data Grid
- **Path / Route:** `/entity` (File: `src/pages/EntityExplorer.tsx`)
- **Purpose:** Deep inspection of individual database entities, column schemas, mapping rules, data lineage, active errors, author revisions, and row-level data grids.
- **Key UI Elements & Functionality:**
  - **Entity Search Autocomplete:** Top search bar allowing instant switching between database tables.
  - **7 Interactive Entity Tabs:**
    1. **Overview:** Total row counts, storage size, column count, primary key, foreign key count, and sync status.
    2. **Columns & Types:** Complete column schema table displaying Column Name, Data Type, Primary Key tags (`PK`), and Foreign Key target links (`FK → vehicles.vehicle_id`).
    3. **Data Grid Explorer (Full-Page Data Grid):** Interactive staging record grid featuring **pinned primary key columns** (`📌 Pinned PK`), row search filtering, LHS vs RHS record comparison (`PUNE-X7-2026` vs `X7-2026`), reconciliation status badges (`DISCREPANCY`, `DUPLICATE`, `ORPHAN`, `RECONCILED`), and direct `Inspect Fix` links.
    4. **Source Mapping (Visual Column Mapping Studio Canvas):** Field-to-field ETL transformation connector cards (`Source Column (LHS)` $\rightarrow$ `ETL Transformation Node` $\rightarrow$ `Target Column (RHS)`), rule confidence ratings (`100% Rule Confidence`), datatype mapping pills, and live before/after sample data preview box (`PUNE-X7-2026` $\rightarrow$ `X7-2026`).
    5. **Lineage & Keys:** Upstream parent table references and downstream child table dependencies.
    6. **DQ Errors:** Table displaying active data quality anomalies filtered for this entity.
    7. **Author Audits:** Table displaying manual author modifications and change log timestamps.

---

### Screen 4: Error Centre Workbench & Diagnostic Drawer
- **Path / Route:** `/errors` (File: `src/pages/ErrorCentre.tsx`)
- **Purpose:** Level 3 Diagnosis and Level 4 Resolution workbench for investigating and fixing database migration errors.
- **Key UI Elements & Functionality:**
  - **Multi-Select Error Table:** Checkboxes to select individual or multiple errors, filter pills (`ALL`, `FIXABLE`, `DELETE_CANDIDATE`, `BLOCKED`), and floating batch action bar (`Preview Selected Fixes`).
  - **Level 3 Plain-English Diagnostic Drawer:**
    - **ISSUE DIAGNOSIS:** Severity badge (`HIGH SEVERITY`) and title (`PCS PROCEDURES Validation Failure`).
    - **WHAT HAPPENED?:** Plain-English summary (`"150,610 records failed staging database validation checks."`).
    - **WHY DID IT HAPPEN?:** Plain-English root cause explanation.
    - **EXAMPLE VALUE MISMATCH BOX:** Side-by-side comparison of Legacy Source Value (`PUNE-X7-2026`) vs Target Required Format (`X7-2026`).
    - **RECOMMENDED FIX:** Actionable guidance (`"Remove the legacy plant prefix ('PUNE-') and normalize the engine ID reference key."`).
    - **EXPANDABLE TECHNICAL ACCORDION:** `▶ Show Technical Details` button hiding raw diagnostic evidence, downstream dependency tree lists, and legacy DB query tables.
  - **4-Method Remediation Value Update Engine:**
    1. `DIRECT_OVERRIDE`: Manual reference key typing (e.g. `vehicle_id` = `"GMV-2967"`).
    2. `PATTERN_TRANSFORM`: String pattern replace rule (`REPLACE(vehicle_code, "VHC-", "GMV-")`).
    3. `LEGACY_IMPORT`: Clicks `🔍 Compare with Legacy DB` to query `LEGACY_VHCLS` and auto-imports legacy reference value.
    4. `SQL_EXPRESSION`: Evaluates custom SQL normalization expression (`COALESCE(target_ref, legacy_src_ref)`).
  - **STG Sandbox Dry-Run Simulator Modal (`ImpactPreview.tsx`):** Asynchronous `/remediation/preview` dry-run pre-flight check outputting risk level (`SAFE TO EXECUTE`, `NEEDS REVIEW`, `HIGH RISK`), total downstream records affected (`150,610`), and blocking reasons.
  - **Production Promotion Confirmation Modal (`ConfirmModal.tsx`):** Danger confirmation dialog requiring typed `"PROD"` environment verification, operator change request comment, and push scope selection (`BATCH` vs `SINGLE` push).

---

### Screen 5: Cascade Impact Analysis & Domino Engine
- **Path / Route:** `/cascade` (File: `src/pages/CascadeAnalysis.tsx`)
- **Purpose:** Interactive graph visualization of downstream referential blast radius and domino effect propagation.
- **Key UI Elements & Functionality:**
  - **Multi-Tier Domino Effect Tree:** Interactive ReactFlow graph mapping 4 distinct tier levels:
    $$\text{Tier 0: Root Vehicle Anomaly} \longrightarrow \text{Tier 1: PCS Headers} \longrightarrow \text{Tier 2: Systems} \longrightarrow \text{Tier 3: Subsystems} \longrightarrow \text{Tier 4: Leaf Procedures (150,610 rows)}$$
  - **Amplification Multiplier Dial:** Computes total child record impact vs root error count ($2,063\times$ growth factor).
  - **Interactive Impact Inspector:** Clicking any node in the graph displays its schema section, relationship type (`1-to-Many Cascade`), affected row count, percentage of total impact (95.2%), and constraint severity badge.
  - **High-Res Diagram Export:** **"📷 Export Domino Diagram (SVG/PNG)"** button downloading clean vector graphics of the cascade graph.

---

### Screen 6: Schema Explorer & ER Map
- **Path / Route:** `/schema` (File: `src/pages/SchemaExplorer.tsx`)
- **Purpose:** Technical schema inspection, interactive ER diagram canvas, table dictionary, and schema export engine.
- **Key UI Elements & Functionality:**
  - **Interactive ER Canvas:** ReactFlow visual node graph of all 11 database tables displaying column lists, primary key badges (`PK`), foreign key connectors (`FK`), and node highlight colors on selection.
  - **Table Search & Category Filters:** Search bar (`Search table, column...`) and domain category filter pills (`ALL`, `Reference`, `PCS`, `MCS`).
  - **7 Table Detail Tabs:** `Overview`, `Schema`, `Data`, `Relationships`, `Mapping`, `Validation`, `History`.
  - **📷 Export High-Res ER Diagram (SVG/PNG):** Generates and downloads scalable vector graphics capturing table nodes, column lists, connectors, and badges.
  - **📄 Export DDL (SQL):** Generates and downloads SQL `CREATE TABLE` and `ALTER TABLE ADD CONSTRAINT` DDL scripts matching target database engines.

---

### Screen 7: Authoring Changes Audit
- **Path / Route:** `/authoring` (File: `src/pages/AuthorChanges.tsx`)
- **Purpose:** Field-level audit trail comparing human author modifications against automated migration values.
- **Key UI Elements & Functionality:**
  - **3-Way Value Comparison Grid:** Original Legacy Value $\rightarrow$ Migrated ETL Value $\rightarrow$ Current Author Modified Value.
  - **Approval Status Workflows:** Status badges for `Pending Review`, `Approved`, and `Published`.
  - **Author Activity Cards:** Shows author name, timestamp, affected record key, and change rationale.

---

### Screen 8: Page Drilldown Directory
- **Path / Route:** `/drilldown` (File: `src/pages/PageDrilldown.tsx`)
- **Purpose:** Central routing sitemap navigation matrix providing direct links into any database table, error anomaly, or system module.

---

### Screen 9: Operational Audit Logs & Execution Replay
- **Path / Route:** `/audit` (File: `src/pages/AuditHistory.tsx`)
- **Purpose:** Level 5 Validation workspace containing immutable database transaction logs and an interactive execution replay timeline player.
- **Key UI Elements & Functionality:**
  - **Interactive Migration Execution Replay Player:**
    - **Play / Pause Button:** `▶ Play Replay` / `⏸ Pause Replay`.
    - **Speed Selector:** Toggle playback speed (`1x`, `2x`, `5x`).
    - **Progress Scrubber:** Visual progress bar (`0%` $\rightarrow$ `100%`).
    - **Step Navigation:** `Prev` and `Next` step buttons.
    - **Live Execution Log Box:** Displays step title, timestamp, and detailed description (`Step 1 of 4: Ingestion & STG Validation` $\rightarrow$ `Step 2: DQ Anomaly Detection` $\rightarrow$ `Step 3: Remediation Dry Run` $\rightarrow$ `Step 4: PROD Commit`).
  - **Immutable Transaction Table:** Operation ID (`OP-001`, `OP-002`), Timestamp, Target Schema, Operation Type, Mutated Record Count, Operator Name (`A. Howard`), and Environment (`PROD`).
  - **Snapshot Inspection Drawer:** Clicking any log row opens a drawer displaying full before/after JSON state snapshots.

---

## 6. Detailed End-to-End Operational Workflows

### Workflow 1: Executive Overview $\rightarrow$ Anomaly Selection $\rightarrow$ Investigation
1. **User Opens Dashboard (`/dashboard`):** User observes **Migration Health: 94.8% (Healthy)** and progress bar (`92% Complete`).
2. **Review Needs Attention Area:** User sees `Vehicles Catalog Reference` (`42,381 records affected` | *Engine mapping mismatch*).
3. **Click `[Investigate]`:** User is navigated to Error Centre (`/errors`), setting `selectedErrorId = "ERR-2967"` and opening the diagnostic drawer.

---

### Workflow 2: Plain-English Error Diagnosis $\rightarrow$ Technical Accordion $\rightarrow$ 4-Method Value Remediation
1. **Plain-English Review:** User reads:
   - **WHAT HAPPENED?:** `"150,610 records failed staging database validation checks."`
   - **WHY DID IT HAPPEN?:** `"Vehicle record 2967 failed to pass staging data-validation rules..."`
   - **EXAMPLE VALUE MISMATCH:** Legacy `PUNE-X7-2026` vs Target `X7-2026`.
   - **RECOMMENDED FIX:** `"Remove the legacy plant prefix ('PUNE-') and normalize the engine ID reference key."`
2. **Select Remediation Update Method:** User chooses an update method in the drawer:
   - `DIRECT_OVERRIDE`: Enters `"GMV-2967"` manually.
   - `PATTERN_TRANSFORM`: Selects `REPLACE(vehicle_code, "VHC-", "GMV-")`.
   - `LEGACY_IMPORT`: Clicks `🔍 Compare with Legacy DB` to query `LEGACY_VHCLS` and imports the legacy value.
   - `SQL_EXPRESSION`: Enters `COALESCE(target_ref, legacy_src_ref)`.
3. **Save Override:** User clicks `Apply Fix`. Success indicator (`✓ Value override saved`) appears.
4. **Expand Technical Details (Optional):** User clicks `▶ Show Technical Details` to reveal downstream dependency lists and raw SQL queries.

---

### Workflow 3: STG Sandbox Dry Run $\rightarrow$ Typed PROD Promotion $\rightarrow$ Audit Validation
1. **Trigger Pre-Flight Check:** User clicks `Preview and Run Fix`.
2. **Review Dry-Run Modal (`ImpactPreview.tsx`):** Displays Risk Level (`SAFE TO EXECUTE`), Affected Records (`150,610`), and Table Breakdown (`vehicles`: 1 row, `pcs_procedures`: 150,610 rows).
3. **Execute STG Sandbox:** User clicks `Proceed with STG Dry-Run`. Console logs stream progress (`STG_PENDING` $\rightarrow$ `STG_SUCCESS`).
4. **Trigger PROD Promotion:** User clicks `Batch Push to PROD (Recommended)`.
5. **Typed Verification Modal (`ConfirmModal.tsx`):** User types `"PROD"`, enters change request reason, selects `BATCH` push, and clicks `Confirm & Execute`.
6. **PROD Commit & Audit Log:** Status updates to `PROD_SUCCESS`, errors count decreases, and a new audit record (`OP-003`) is logged in Audit History (`/audit`).

---

### Workflow 4: ER Schema Exploration $\rightarrow$ Table Search $\rightarrow$ 7 Detail Tabs $\rightarrow$ High-Res SVG & SQL DDL Export
1. **Open Schema Explorer (`/schema`):** User views 11-table ER diagram canvas.
2. **Search & Filter:** User types `"vehicle"` in search input or clicks `Reference` category pill.
3. **Inspect Detail Tabs:** User switches view mode to `Mapping details` and navigates across `Overview`, `Schema`, `Data`, `Relationships`, `Mapping`, `Validation`, and `History`.
4. **Export High-Res Diagram:** User clicks `📷 Export High-Res ER Diagram (SVG/PNG)` to download scalable vector SVG graphics.
5. **Export DDL Script:** User clicks `📄 Export DDL (SQL)` to download ready-to-execute `CREATE TABLE` / `ALTER TABLE` SQL DDL files.

---

### Workflow 5: Multi-Tier Domino Blast Radius Analysis
1. **Open Cascade View (`/cascade`):** User inspects multi-tier domino tree.
2. **Trace Domino Tiers:** User follows impact flow: $\text{Root Vehicle Anomaly} \rightarrow \text{PCS Headers} \rightarrow \text{Systems} \rightarrow \text{Subsystems} \rightarrow \text{Leaf Procedures}$.
3. **Inspect Blast Radius:** User clicks `pcs_systems` node. Side-by-side Impact Inspector displays row count (`1,298`), percentage impact (`95.2%`), and severity.
4. **Export Domino Diagram:** User clicks `📷 Export Domino Diagram (SVG/PNG)` to download vector graphics.

---

### Workflow 6: Interactive Migration Execution Replay
1. **Open Audit History (`/audit`):** User views the Interactive Migration Execution Replay card.
2. **Play Execution:** User clicks `▶ Play Replay` or toggles speed (`1x`, `2x`, `5x`).
3. **Scrub Timeline:** User uses `Prev` / `Next` buttons or scrubber bar to step through `Step 1 of 4: Ingestion & STG Validation` $\rightarrow$ `Step 2: Anomaly Detection` $\rightarrow$ `Step 3: Remediation Dry Run` $\rightarrow$ `Step 4: PROD Commit`.

---

## 7. State Architecture & Mock Service Boundary

### Global State Store (`src/state/useGlobalStore.ts`)
Managed by **Zustand**. Stores global selection IDs and navigation context:
```typescript
interface GlobalState {
  environment: Environment; // 'Source' | 'STG' | 'PROD'
  activePage: PageId;       // 'dashboard' | 'health' | 'entity' | 'errors' | 'cascade' | 'schema' | 'authoring' | 'drilldown' | 'audit'
  selectedEntityId: string | null;
  selectedErrorId: string | null;
  selectedVehicleId: string | null;
  
  // Actions
  setEnvironment: (env: Environment) => void;
  setActivePage: (page: PageId) => void;
  setSelectedEntityId: (id: string | null) => void;
  setSelectedErrorId: (id: string | null) => void;
  setSelectedVehicleId: (id: string | null) => void;
}
```

### Mock API Service Layer (`src/data/mockApi.ts`)
All data fetching and mutations pass through `mockApi.ts` promises:
- `getEntities(env)`: Returns summary metrics for all 11 tables.
- `getErrors(filters)`: Returns data quality anomalies.
- `getSchema(tableId)`: Returns column schema, PKs, FKs, and ETL mapping rules.
- `getLineage(fieldId)`: Returns upstream and downstream dependency trees.
- `previewRemediation(errorIds, action)`: Runs STG pre-flight dry-run check.
- `executeRemediation(jobId, pushType)`: Commits promotion to PROD.
- `saveOverride(errorId, overrideValue, method)`: Saves remediation value override.
- `getOperationAudits()`: Returns immutable operational audit logs.

### Connecting to a Real Backend API
To transition from the mock simulator to a live backend, **zero UI code changes are required**. Simply edit `src/data/mockApi.ts` and replace the promise returns with `axios` or `fetch()` HTTP REST calls pointing to your backend endpoints (`http://localhost:8080/api/v1`).

---

## 8. Developer Onboarding & Customization Guide

### Running Locally
```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build production bundle and verify TypeScript types
npm run build
```

### Customizing Seed Data & Table Names
To change table names, column names, or mock data values to match your actual database migration scripts before connecting a real backend, edit:

📄 **[`src/data/database/seedData.ts`](file:///c:/Users/hp/Desktop/dummy_migration_dashboard/src/data/database/seedData.ts)**

Example:
```typescript
// Edit seedData.ts to rename tables or update row counts
{
  id: 'vehicle_master',                // <- Custom table ID
  name: 'Vehicle Master Reference',     // <- Custom display name
  category: 'Reference',
  sourceCount: 50000,                   // <- Custom row count
  stgCount: 49800,
  prodCount: 49800
}
```

### Key Files Map for New Developers
- **Dashboard:** `src/pages/Dashboard.tsx`
- **Migration Health:** `src/pages/MigrationHealth.tsx`
- **Entity Explorer & Data Grid:** `src/pages/EntityExplorer.tsx`
- **Error Centre & Remediation:** `src/pages/ErrorCentre.tsx`
- **Cascade Domino Graph:** `src/pages/CascadeAnalysis.tsx`
- **Schema Explorer & ER Map:** `src/pages/SchemaExplorer.tsx`
- **Audit Logs & Execution Replay:** `src/pages/AuditHistory.tsx`
- **API Service Layer:** `src/data/mockApi.ts`
- **Database Seed Models:** `src/data/database/seedData.ts`
- **Global State Store:** `src/state/useGlobalStore.ts`
- **Type Definitions:** `src/types/models.ts`
