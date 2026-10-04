# Database Migration Platform V0 — Comprehensive Functionality & User Journey Handbook

Welcome to the **Database Migration Platform V0** handbook. This document serves as the authoritative single source of truth for product functionality, supported migration workflows, user interface behavior, data models, state management, and backend operational requirements.

Whether you are a **frontend developer, backend engineer, QA lead, database architect, or product reviewer**, this handbook provides a complete end-to-end understanding of how the platform operates across its 8-step migration journey.

---

## Table of Contents
1. [Product Purpose & Scope](#1-product-purpose--scope)
2. [Supported Migration Workflow (8-Step Journey)](#2-supported-migration-workflow-8-step-journey)
3. [Step-by-Step Functional Reference](#3-step-by-step-functional-reference)
   - [Step 1: Migration Setup — Multi-DB Connections & Full Credentials](#step-1-migration-setup--multi-db-connections--full-credentials)
   - [Step 2: Source Database Discovery](#step-2-source-database-discovery)
   - [Step 3: Target Schema Discovery & Review](#step-3-target-schema-discovery--review)
   - [Step 4: Table Configuration & Mapping Workspace](#step-4-table-configuration--mapping-workspace)
   - [Step 5: Script Pre-Flight & Dry-Run Validation Mode](#step-5-script-pre-flight--dry-run-validation-mode)
   - [Step 6: Sequential Migration Execution](#step-6-sequential-migration-execution)
   - [Step 7: Migration Dashboard & Reconciliation](#step-7-migration-dashboard--reconciliation)
   - [Step 8: Final Migration Report & Audit Artifact](#step-8-final-migration-report--audit-artifact)
4. [User Actions & Expected System Outcomes](#4-user-actions--expected-system-outcomes)
5. [Error & Failure State Behavior](#5-error--failure-state-behavior)
6. [Draft & Real-Time Auto-Save Behavior](#6-draft--real-time-auto-save-behavior)
7. [Current V0 Limitations vs Future Backend Capabilities](#7-current-v0-limitations-vs-future-backend-capabilities)

---

## 1. Product Purpose & Scope

The **Database Migration Platform V0** is an enterprise multi-database migration intelligence and orchestration platform driven by a **Single Source of Truth Migration Config JSON** (`sample-migration-config.json`).

### Key Engineering Challenges Solved
1. **Multi-Database Connection Credentials:** Captures full database credentials (Host, Port, Database Name, Username, Password, Engine type, SSL mode) for multiple source and target nodes.
2. **Single Source of Truth Config JSON:** The backend migration script executes strictly based on a master JSON config that defines database connection parameters, table projections, splits, joins, and execution step ordering.
3. **Template Schema Error Validation:** Surfaces template schema error validation directly on table mapping rows (`✓ Validated`, `⚠️ Type Length Warning`, `✕ Template Schema Error`).
4. **Script Pre-Flight & Dry-Run Validation Mode:** Aligns validation with the migration script running in `--dry-run --validate` mode to test live database connection health, schema compatibility, and constraint safety prior to live data transfer.
5. **Predictable Sequential Execution:** Enforces strict sequential table execution (`Completed` ➔ `Running` ➔ `Queued` ➔ `Failed`) without race conditions.
6. **Audit-Friendly Reporting:** Downloadable executive migration report artifact for compliance and audit sign-off.

---

## 2. Supported Migration Workflow (8-Step Journey)

The platform enforces an 8-step sequential workflow:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: MIGRATION SETUP (Multi-Source & Multi-Target DB Credentials & Single Source JSON)        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: SOURCE DISCOVERY (Inspect Source Schemas, Tables, PKs, FKs, Indexes & Metadata)          │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: TARGET SCHEMA DISCOVERY (Inspect Discovered Target Schemas across Target DB Nodes)       │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: MAPPING WORKSPACE (Single Source JSON File, Download Template, Template Error Validation)│
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ STEP 5: SCRIPT PRE-FLIGHT VALIDATION (Script --dry-run --validate Mode, Readiness Verification)   │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ STEP 6: SEQUENTIAL EXECUTION (Ordered Table Pipeline: Completed ➔ Running ➔ Queued ➔ Failed)     │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ STEP 7: MIGRATION DASHBOARD (Health Status, Table Reconciliation, Discrepancy Isolation)        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ STEP 8: FINAL MIGRATION REPORT (Audit Summary, Object Results, Downloadable Report Artifact)     │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Step-by-Step Functional Reference

### Step 1: Migration Setup — Multi-DB Connections & Full Credentials
- **Purpose:** Establish and configure full connection credentials for multiple source and target database nodes.
- **Key Functionality:**
  - **Multi-Database Support:** Add multiple source DBs (`legacy_db_01`, `legacy_db_02`) and target DBs (`prod_db_01`, `prod_db_02`).
  - **Full Credentials Form:** Collects Host Endpoint, Port, Database Name, Username, Password, Engine type (`PostgreSQL`, `MySQL`, `Oracle`, `SQL Server`), and SSL mode (`require`, `verify-full`, `prefer`, `disable`).
  - **Credential Cards:** Displays full connection parameters cleanly on source and target DB cards.
  - **Single Source JSON Banner:** Highlights the active master config JSON driving script execution with a download action.

### Step 2: Source Database Discovery
- **Purpose:** Automatically inspect and analyze connected source database schemas.
- **Key Functionality:**
  - **Operational Discovery State:** Visual progress communicating schema inspection, table cataloging, PK/FK discovery, and index mapping.
  - **Schema Explorer:** Discovered table list showing table name, schema, row counts, PK/FK counts, and indexes.
  - **Compact Metrics Summary:** Total tables discovered, total schemas, total columns, foreign key references.

### Step 3: Target Schema Discovery & Review
- **Purpose:** Discover and inspect existing target database schemas across target DB nodes.
- **Key Functionality:**
  - **Automated Target Discovery:** Discovers target schemas directly from target DB connections.
  - **Schema Inspection View:** Displays target tables, column data types, nullability, PK/FK constraints, and unique indexes for mapping verification.

### Step 4: Table Configuration & Mapping Workspace
- **Purpose:** Manage the Single Source of Truth Table Mapping Config JSON file (`sample-migration-config.json`).
- **Key Functionality:**
  - **Uploaded Config File Card:** Displays active file name, size (4.2 KB), total rules count, and `⚡ Auto-Saved` status.
  - **Template Actions:** **"Download Template JSON"** (downloads `sample-migration-config.json`) and **"Upload / Edit Config JSON"**.
  - **Template Schema Error Validation Column:** Surfaced directly on mapping rows:
    - `✓ Validated against schema template` (Green badge)
    - `⚠️ Type Length Warning: VARCHAR(50) to (20) requires truncate rule` (Amber badge)
    - `✕ Template Schema Error: TEXT to JSONB requires JSON parse rule` (Rose badge)
  - **Removed Confusing "Pattern" Column:** Non-standard pattern column (`1 -> N`, `N -> 1`) removed in favor of direct template schema error validation.

### Step 5: Script Pre-Flight & Dry-Run Validation Mode
- **Purpose:** Run the migration script in `--dry-run --validate` mode to verify target schemas and constraints prior to live execution.
- **Key Functionality:**
  - **Script Pre-Flight Banner:** Explains how the backend migration script validates database connectivity, schema existence, data type compatibility, and foreign key integrity.
  - **Readiness Score Header:** Readiness score indicator (0–100%).
  - **Structured Issue Table:** Categorizes issues into Critical (Blocking) and Warning (Non-blocking).
  - **One-Click Remediation (Simulated):** Resolves critical issues to achieve 100% dry-run readiness.

### Step 6: Sequential Migration Execution
- **Purpose:** Execute table-by-table migration sequentially with live log streaming.
- **Key Functionality:**
  - **Sequential Pipeline Model:** Enforces strict sequential table execution (`Completed` ➔ `Running` ➔ `Queued` ➔ `Failed`).
  - **Execution Controls:** Pause, Resume, Stop, and Retry actions.
  - **Log Console:** Filterable execution logs with timestamps.

### Step 7: Migration Dashboard & Reconciliation
- **Purpose:** Monitor overall migration health and table reconciliation metrics.
- **Key Functionality:**
  - **Executive Migration Health Banner:** Health score badge (94.8% in an auto-fitting container) and total tables migrated.
  - **Target DB Scope Filter:** Switch view between `ALL`, `prod_db_01`, and `prod_db_02`.
  - **Drilldown Navigation:** Direct navigation into Mapping View and Table Profile details.

### Step 8: Final Migration Report & Audit Artifact
- **Purpose:** Provide an audit-compliant summary report for final migration sign-off.
- **Key Functionality:**
  - **Executive Summary Box:** Run ID, status (`Completed with Warnings`), Source & Target DB info, duration.
  - **Download Action:** Triggers download of structured JSON report (`sample-migration-report.json`).

---

## 4. User Actions & Expected System Outcomes

| Journey Step | User Action | Expected System Outcome |
|---|---|---|
| Step 1 (Setup) | Fills DB credential form & clicks "Save DB" | Validates host/port/database credentials, updates source/target DB card grid, displays success toast. |
| Step 1 (Setup) | Clicks "Download Config JSON" | Downloads master `sample-migration-config.json` single source of truth artifact. |
| Step 2 (Discovery) | Clicks "Start Source Discovery" | Triggers operational discovery, inspects schemas, renders table list. |
| Step 3 (Target Review) | Inspects target database cards | Renders discovered target PostgreSQL tables, data types, and constraints. |
| Step 4 (Mapping) | Clicks "Download Template JSON" | Triggers browser download of `sample-migration-config.json`. |
| Step 4 (Mapping) | Uploads or edits config JSON | Validates against template schema, updates row-level validation badges (`✓ Validated` / `✕ Template Schema Error`). |
| Step 5 (Validation) | Clicks "Execute Script Dry-Run" | Runs pre-flight validation checks, updates readiness score, and unlocks execution gate. |
| Step 6 (Execution) | Clicks "Start Migration" | Launches sequential pipeline execution; updates order table state from `Queued` to `Running` to `Completed`. |
| Step 7 (Dashboard) | Selects Target DB scope filter | Filters table directory to display only tables present in `prod_db_01` or `prod_db_02`. |
| Step 8 (Report) | Clicks "Download Final Report" | Downloads structured migration summary JSON (`sample-migration-report.json`). |

---

## 5. Error & Failure State Behavior

1. **Connection Failure (Step 1):** Display explicit error message (e.g. `Connection refused at aws-east-pg01.internal:5432`). Prevent proceeding until credentials are verified.
2. **Template Schema Error (Step 4):** Flag mapping row with `✕ Template Schema Error` badge (e.g. `TEXT to JSONB requires JSON parse rule`). Prompt user to edit JSON file before running script.
3. **Script Dry-Run Blocker (Step 5):** Set readiness score < 100% and flag blocking issue as `Critical`. Disable execution start button until issues are resolved.
4. **Execution Failure (Step 6):** Pause sequential pipeline, flag failed table as `Failed`, write detailed error log, and offer `Retry Failed Table`.

---

## 6. Draft & Real-Time Auto-Save Behavior

- **Autosave Engine:** All user choices (connection credentials, discovered schema inclusions, mapping edits, validation states) auto-save to Zustand global state store in real-time.
- **TopBar Status Indicator:** TopBar displays a `⚡ Auto-Saved` status badge with a green pulsing dot to confirm real-time saving.
- **Step Navigation Safety:** Users can navigate freely between steps without losing connection credentials or uploaded master config JSON files.

---

## 7. Current V0 Limitations vs Future Backend Capabilities

| Feature Area | Current V0 Frontend Simulator | Future Backend Requirement |
|---|---|---|
| Master Config Engine | Client-side `sample-migration-config.json` management | Backend migration script executor reading master JSON config |
| Connection Credentials | Full credentials stored in Zustand state | Encrypted secret storage / HashiCorp Vault integration |
| Schema Discovery | Mocked multi-DB catalog inspection | Real SQL DDL query driver (`information_schema.tables`) |
| Template Validation | Client-side schema template comparator | Backend AST schema validator API |
| Execution Pipeline | Sequential progression timer simulator | Asynchronous worker queue with SSE/WebSocket progress stream |
| Report Generation | Static JSON sample file download | Dynamic PDF/CSV report generation engine |
