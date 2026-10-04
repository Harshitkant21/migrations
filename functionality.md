# Database Migration Platform V0 — Comprehensive Functionality & User Journey Handbook

Welcome to the **Database Migration Platform V0** handbook. This document serves as the authoritative single source of truth for product functionality, supported migration workflows, user interface behavior, data models, state management, and backend operational requirements.

Whether you are a **frontend developer, backend engineer, QA lead, database architect, or product reviewer**, this handbook provides a complete end-to-end understanding of how the platform operates across its 8-step migration journey.

---

## Table of Contents
1. [Product Purpose & Scope](#1-product-purpose--scope)
2. [Supported Migration Workflow (8-Step Journey)](#2-supported-migration-workflow-8-step-journey)
3. [Step-by-Step Functional Reference](#3-step-by-step-functional-reference)
   - [Step 1: Migration Setup — Source & Target Connections](#step-1-migration-setup--source--target-connections)
   - [Step 2: Source Database Discovery](#step-2-source-database-discovery)
   - [Step 3: Target Schema Discovery & Review](#step-3-target-schema-discovery--review)
   - [Step 4: Mapping Workspace & JSON Integration](#step-4-mapping-workspace--json-integration)
   - [Step 5: Pre-Flight Migration Validation](#step-5-pre-flight-migration-validation)
   - [Step 6: Sequential Migration Execution](#step-6-sequential-migration-execution)
   - [Step 7: Migration Dashboard & Reconciliation](#step-7-migration-dashboard--reconciliation)
   - [Step 8: Final Migration Report & Audit Artifact](#step-8-final-migration-report--audit-artifact)
4. [User Actions & Expected System Outcomes](#4-user-actions--expected-system-outcomes)
5. [Error & Failure State Behavior](#5-error--failure-state-behavior)
6. [Draft & State Persistence Behavior](#6-draft--state-persistence-behavior)
7. [Current V0 Limitations vs Future Backend Capabilities](#7-current-v0-limitations-vs-future-backend-capabilities)

---

## 1. Product Purpose & Scope

The **Database Migration Platform V0** is an enterprise database migration intelligence and orchestration platform designed to migrate PostgreSQL databases safely, predictably, and with complete visibility.

### Key Engineering Challenges Solved
1. **Opaque Connection Failures:** Clear step-by-step PostgreSQL source and target database connection validation prior to discovery.
2. **Hidden Referential & Schema Constraints:** Automated inspection of discovered source tables, data types, primary keys, foreign key constraints, and indexes.
3. **Target Schema Disconnect:** Direct discovery of target database schemas instead of manual, error-prone frontend schema creation.
4. **Complex JSON-Driven Schema Mapping:** Simplified mapping review with JSON upload, sample JSON download, missing mapping detection, and field-level override capabilities.
5. **Non-Technical Validation Feedback:** Plain-English validation readiness reporting (`"Is this migration ready to run?"`) with blocking issue isolation.
6. **Predictable Sequential Execution:** Strict sequential processing (table-by-table) ensuring referential integrity and dependency ordering without race conditions.
7. **Audit-Friendly Reporting:** Downloadable executive migration report for compliance and audit sign-off.

---

## 2. Supported Migration Workflow (8-Step Journey)

The V0 platform enforces an 8-step sequential workflow:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: MIGRATION SETUP (Source & Target PostgreSQL Connections)                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: SOURCE DISCOVERY (Inspect Tables, Columns, PKs, FKs, Indexes & Metadata)                │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: TARGET SCHEMA DISCOVERY (Inspect Discovered Target Schema — No Frontend Editing)         │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: MAPPING WORKSPACE (Review Mappings, Upload JSON, Download Sample JSON, Edit Drafts)      │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ STEP 5: VALIDATION (Readiness Check, Blocking Issue Resolution, Pre-Flight Verification)         │
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

### Step 1: Migration Setup — Source & Target Connections
- **Purpose:** Establish and test PostgreSQL source and target database connections.
- **Key Functionality:**
  - **Engine Focus:** Focused strictly on PostgreSQL for V0.
  - **Source Connection Card:** Host, port (5432), database name, username, password, SSL toggle (`sslmode=require`), connection string.
  - **Target Connection Card:** Host, port (5432), database name, username, password, SSL toggle (`sslmode=require`), connection string.
  - **Integrated Action Buttons:** Integrated test/connect buttons (`Test & Connect Source`, `Test & Connect Target`) with clear loading states and status feedback.
  - **Removed Obsolete Concepts:** Unnecessary "Migration Intent" and "Migration Constraints" sections removed from V0 setup flow.

### Step 2: Source Database Discovery
- **Purpose:** Automatically inspect and analyze the connected PostgreSQL source database structure.
- **Key Functionality:**
  - **Operational Discovery State:** Visual progress communicating current inspection stage (Inspecting schema, cataloging tables, discovering primary keys, mapping foreign keys, indexing).
  - **Schema Explorer:** Discovered table list showing table name, schema, estimated row count, column count, PK, FK count, and index count.
  - **Compact Metrics Summary:** Total tables discovered, total schemas, total columns, total foreign key references.
  - **Inclusion Toggles & Search:** Filter discovered tables, toggle table migration inclusion.

### Step 3: Target Schema Discovery & Review
- **Purpose:** Discover and inspect the target PostgreSQL database schema to prepare for mapping.
- **Key Functionality:**
  - **Automated Target Discovery:** Discovers existing target schema directly from target PostgreSQL connection.
  - **No Frontend Schema Editing:** Unsupported manual schema creation controls ("Create target table", "Add target column", "Edit target schema DDL") have been completely removed.
  - **Schema Inspection View:** Displays discovered target tables, column data types, nullability, PK/FK constraints, and unique indexes for mapping verification.

### Step 4: Mapping Workspace & JSON Integration
- **Purpose:** Define and review source-to-target table and column mappings.
- **Key Functionality:**
  - **JSON Mapping Upload:** Primary action allowing users to upload a mapping JSON file (`sample-mapping.json`).
  - **Sample JSON Download:** Working download action providing a standard sample mapping JSON file.
  - **Removed Obsolete Concept:** Strategy selector ("Preserve Source Structure", "Optimize Target Structure", "Custom") removed in favor of direct JSON-driven mapping review.
  - **Mapping Summary & Review:** Shows Total Mappings, Valid Mappings, Invalid Mappings, Unmapped Source Objects, and Unmatched Target Objects.
  - **Field Mapping Editor:** Allows inline adjustment of target column assignments, data type casting rules, and string normalization rules.
  - **Draft Persistence:** Mappings are saved automatically to draft state as the user works.

### Step 5: Pre-Flight Migration Validation
- **Purpose:** Answer the fundamental question: *"Is this migration ready to run?"*
- **Key Functionality:**
  - **Readiness Score Header:** Prominent migration readiness indicator (0–100%).
  - **Structured Issue List:** Categorizes issues into Critical (Blocking) and Warning (Non-blocking).
  - **Issue Detail Cards:** Plain-English explanation of affected source/target objects, impact, and required remediation action.
  - **One-Click Remediation (Simulated):** Allows resolving mock critical issues to achieve 100% readiness.

### Step 6: Sequential Migration Execution
- **Purpose:** Execute table-by-table migration sequentially with live log streaming.
- **Key Functionality:**
  - **Sequential Pipeline Model:** Enforces strict sequential table execution (`Completed` ➔ `Running` ➔ `Queued` ➔ `Failed`). No parallel worker lanes or race conditions.
  - **Ordered Table Pipeline Table:**
    | Order | Table Name | Status | Current Operation | Progress |
    |---|---|---|---|---|
    | 1 | legacy_makes | Completed | Verified 5 rows | 100% |
    | 2 | legacy_models | Completed | Verified 17 rows | 100% |
    | 3 | legacy_vehicles | Running | Ingesting & Splitting | 68.4% |
    | 4 | pcs_procedures | Queued | Waiting on vehicles FK | 0% |
  - **Execution Controls:** Pause, Resume, Stop, and Retry actions.
  - **Scannable Log Console:** Filterable execution logs (All, Success, Warning, Error) with timestamps.

### Step 7: Migration Dashboard & Reconciliation
- **Purpose:** Monitor overall migration health and table reconciliation metrics.
- **Key Functionality:**
  - **Executive Migration Health Header:** Overall health score (e.g. 94.8%), total migrated tables vs total tables.
  - **Compact Key Metrics:** Total Tables, AS-IS Source Rows (2.78M), TO-BE Expected Rows (2.07M), Failed/Blocked Rows (193K).
  - **Table Directory & Filters:** Target DB scope filter (`prod_db_01` vs `prod_db_02`), search bar, status dropdown.
  - **Mapping Studio & Table Details Drilldowns:** Direct navigation into Mapping view and Table Profile details.

### Step 8: Final Migration Report & Audit Artifact
- **Purpose:** Provide an audit-friendly executive report summarizing final migration outcomes.
- **Key Functionality:**
  - **Executive Summary Box:** Run ID, Migration status (`Completed with Warnings`), Source & Target DB info, execution duration.
  - **Metrics Overview:** Migrated tables count, total source records, target reconciled records, failed record count.
  - **Object-Level Results Table:** Table-by-table breakdown of source rows, target expected rows, migrated count, failed count, reconciliation %, and status.
  - **Working Download Button:** Triggers download of `sample-migration-report.json`.

---

## 4. User Actions & Expected System Outcomes

| Journey Step | User Action | Expected System Outcome |
|---|---|---|
| Step 1 (Setup) | Clicks "Test & Connect Source" | Validates PostgreSQL connection string, displays connection success toast, updates source card to `Connected`. |
| Step 1 (Setup) | Clicks "Test & Connect Target" | Validates PostgreSQL target connection string, displays target connection success toast. |
| Step 2 (Discovery) | Clicks "Start Source Discovery" | Triggers operational discovery state, displays table inspection progress, renders discovered source schema. |
| Step 3 (Target Review) | Inspects discovered target tables | Renders target PostgreSQL tables, columns, PKs, FKs for review without allowing schema DDL mutation. |
| Step 4 (Mapping) | Uploads mapping JSON | Validates JSON format, populates source-to-target field mapping grid, updates mapping counts. |
| Step 4 (Mapping) | Clicks "Download Sample JSON" | Triggers browser file download of `sample-mapping.json`. |
| Step 5 (Validation) | Clicks "Run Pre-Flight Check" | Evaluates schema compatibility, FK relationships, data types, and updates readiness score. |
| Step 6 (Execution) | Clicks "Start Migration" | Launches sequential pipeline execution; updates order table state from `Queued` to `Running` to `Completed`. |
| Step 7 (Dashboard) | Selects Target DB scope filter | Filters table directory to display only tables present in `prod_db_01` or `prod_db_02`. |
| Step 8 (Report) | Clicks "Download Final Report" | Downloads structured migration summary JSON (`sample-migration-report.json`). |

---

## 5. Error & Failure State Behavior

1. **Connection Failure (Step 1):** Display explicit error message (e.g. `Connection refused at aws-east-pg01.internal:5432`). Prevent proceeding to Step 2 until connection succeeds.
2. **Schema Incompatibility / Discrepancy (Step 3/4):** Highlight unmapped source columns or unmatched target columns in red/amber status badges. Mark mapping status as `Warning` or `Invalid`.
3. **Blocking Validation Issue (Step 5):** Set readiness score < 100% and flag blocking issue as `Critical`. Disable execution start button until critical issues are resolved or bypassed.
4. **Execution Table Failure (Step 6):** Pause active sequential pipeline, flag failed table order item as `Failed`, write detailed error log to execution console, and present `Retry Failed Table` action.

---

## 6. Draft & State Persistence Behavior

- **Autosave Engine:** All user choices (connection credentials, discovered schema inclusions, mapping edits, validation resolution states) autosave to Zustand global state store.
- **TopBar Status Indicator:** TopBar displays a green `"Draft saved"` badge whenever state updates occur.
- **Step Navigation Safety:** Users can move back and forth between completed steps without losing entered connection strings or uploaded mapping JSON definitions.

---

## 7. Current V0 Limitations vs Future Backend Capabilities

| Feature Area | Current V0 Frontend Simulator | Future Backend Requirement |
|---|---|---|
| Database Engine Support | PostgreSQL | Extensible multi-engine driver layer (PostgreSQL, MySQL, Oracle) |
| Connection Persistence | In-memory Zustand store | Encrypted secret storage / HashiCorp Vault integration |
| Schema Discovery | Mocked PostgreSQL catalog inspection | Real SQL DDL query driver (`information_schema.tables`) |
| Mapping Upload | Client-side JSON file parse | Backend mapping schema validator REST API |
| Execution Engine | Simulated sequential progression timer | Asynchronous worker queue with SSE/WebSocket progress stream |
| Report Generation | Static JSON sample file download | Dynamic PDF/CSV report generation engine |
