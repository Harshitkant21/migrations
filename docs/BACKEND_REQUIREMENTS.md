# Backend Requirements & API Contract Specification (V0)

## A. Purpose and Scope

This document specifies the backend requirements, API endpoints, request/response contracts, and system lifecycle transitions necessary to support the **Database Migration Platform V0** frontend application.

The platform is driven by a **Single Source of Truth Migration Config JSON** (`sample-migration-config.json`) that controls multi-source and multi-target database connections, schema mappings, table projections, and sequential execution pipeline ordering.

---

## B. System Interaction Overview

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     FRONTEND (React 18 SPA)                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
            │                      │                       │                      │
   HTTP REST│ Full DB Credentials  │ Master Config JSON    │ Template Validation  │ Script Dry-Run
   & JSON   │ & Connections        │ Upload & Download     │ & Schema Errors      │ & Pipeline Execution
            ▼                      ▼                       ▼                      ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               BACKEND MIGRATION SCRIPT & SERVICE API                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
            │                                              │                      │
   Driver   │ SQL Inspection                               │ Data Pipeline        │ Report Artifact
   Queries  ▼                                              ▼                      ▼
┌────────────────────────┐                    ┌────────────────────────┐┌────────────────────────┐
│ SOURCE DATABASES (1..N)│                    │ TARGET DATABASES (1..N)││ MIGRATION REPORT STORE │
└────────────────────────┘                    └────────────────────────┘└────────────────────────┘
```

---

## C. API Inventory

The required backend capabilities are organized by journey step:

| Endpoint ID | Proposed Endpoint | Method | Journey Step | Purpose |
|---|---|---|---|---|
| API-01 | `/api/v1/migrations/draft` | `POST` | Step 1 (Setup) | Initialize a new migration run draft |
| API-02 | `/api/v1/connections/source/test` | `POST` | Step 1 (Setup) | Test connection with full credentials for a source DB node |
| API-03 | `/api/v1/connections/target/test` | `POST` | Step 1 (Setup) | Test connection with full credentials for a target DB node |
| API-04 | `/api/v1/discovery/source` | `POST` | Step 2 (Source Discovery) | Initiate source database schema inspection |
| API-05 | `/api/v1/discovery/source/results` | `GET` | Step 2 (Source Discovery) | Fetch discovered source database tables & metadata |
| API-06 | `/api/v1/discovery/target` | `POST` | Step 3 (Target Discovery) | Initiate target database schema inspection |
| API-07 | `/api/v1/discovery/target/results` | `GET` | Step 3 (Target Discovery) | Fetch discovered target database tables & metadata |
| API-08 | `/api/v1/config/template` | `GET` | Step 4 (Mapping Workspace) | Download master `sample-migration-config.json` template |
| API-09 | `/api/v1/config/upload` | `POST` | Step 4 (Mapping Workspace) | Upload and validate Single Source of Truth Config JSON |
| API-10 | `/api/v1/config/draft` | `PUT` | Step 4 (Mapping Workspace) | Save draft JSON configuration |
| API-11 | `/api/v1/validation/dry-run` | `POST` | Step 5 (Validation) | Execute migration script in `--dry-run --validate` mode |
| API-12 | `/api/v1/validation/issues/:id/resolve` | `POST` | Step 5 (Validation) | Resolve or bypass a dry-run validation issue |
| API-13 | `/api/v1/execution/start` | `POST` | Step 6 (Sequential Execution) | Launch sequential migration pipeline execution |
| API-14 | `/api/v1/execution/status` | `GET` | Step 6 (Sequential Execution) | Fetch live sequential execution status & order |
| API-15 | `/api/v1/execution/logs` | `GET` | Step 6 (Sequential Execution) | Fetch execution log entries |
| API-16 | `/api/v1/execution/control` | `POST` | Step 6 (Sequential Execution) | Pause, resume, retry, or stop execution |
| API-17 | `/api/v1/dashboard/summary` | `GET` | Step 7 (Dashboard) | Fetch executive dashboard summary metrics |
| API-18 | `/api/v1/dashboard/tables` | `GET` | Step 7 (Dashboard) | Fetch table reconciliation directory |
| API-19 | `/api/v1/dashboard/tables/:id` | `GET` | Step 7 (Dashboard) | Fetch table detail profile & column diffs |
| API-20 | `/api/v1/reports/summary` | `GET` | Step 8 (Final Report) | Fetch final migration summary report |
| API-21 | `/api/v1/reports/download` | `GET` | Step 8 (Final Report) | Download final report JSON artifact |

---

## D. Per-API Contract Specifications

### 1. Connection Testing with Full Credentials (`/api/v1/connections/source/test` & `/target/test`)
- **HTTP Method:** `POST`
- **Request Payload:**
```json
{
  "nodeId": "legacy_db_01",
  "engine": "PostgreSQL",
  "host": "aws-east-pg01.internal",
  "port": 5432,
  "database": "legacy_db_01",
  "username": "migration_admin",
  "password": "encrypted_password_string",
  "sslMode": "require"
}
```
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "nodeId": "legacy_db_01",
  "connectionRef": "conn_src_9921a",
  "engineVersion": "PostgreSQL 14.9",
  "tableCount": 8,
  "sslActive": true,
  "message": "Successfully connected to legacy_db_01"
}
```

---

### 2. Single Source of Truth Config Upload (`/api/v1/config/upload`)
- **HTTP Method:** `POST`
- **Request Payload (`sample-migration-config.json` master structure):**
```json
{
  "migrationConfigVersion": "1.0",
  "migrationId": "MIG-2026-0928-PROD",
  "sourceConnections": [
    {
      "id": "legacy_db_01",
      "type": "PostgreSQL",
      "host": "aws-east-pg01.internal",
      "port": 5432,
      "database": "legacy_db_01",
      "username": "migration_admin",
      "sslMode": "require"
    }
  ],
  "targetConnections": [
    {
      "id": "prod_db_01",
      "type": "PostgreSQL",
      "host": "pg-cloud-aurora01.internal",
      "port": 5432,
      "database": "prod_db_01",
      "username": "prod_migrator",
      "sslMode": "verify-full"
    }
  ],
  "tableMappings": [
    {
      "id": "rule-01",
      "title": "Vehicle Assembly Split",
      "mappingType": "SPLIT",
      "sourceDatabases": ["legacy_db_01"],
      "sourceTables": ["LEGACY_VHCLS"],
      "targetDatabases": ["prod_db_01"],
      "targetTables": ["vehicles", "vehicle_specifications"],
      "columnMappings": [
        {
          "sourceDb": "legacy_db_01",
          "sourceTable": "LEGACY_VHCLS",
          "sourceColumn": "VHC_ID",
          "sourceDataType": "VARCHAR(50)",
          "transformationType": "NORMALIZE",
          "targetDb": "prod_db_01",
          "targetTable": "vehicles",
          "targetColumn": "vehicle_id",
          "targetDataType": "VARCHAR(20)",
          "templateValidation": {
            "status": "valid",
            "message": "✓ Validated against schema template"
          }
        }
      ]
    }
  ]
}
```

---

### 3. Script Dry-Run Validation (`/api/v1/validation/dry-run`)
- **HTTP Method:** `POST`
- **Behavior:** Executes the migration script in `--dry-run --validate` mode.
- **Success Response (`200 OK`):**
```json
{
  "readinessScore": 100,
  "dryRunStatus": "Passed",
  "criticalCount": 0,
  "warningCount": 2,
  "passedCount": 235,
  "checks": [
    {
      "domain": "Schema",
      "status": "Passed",
      "message": "Target tables vehicles, customer_profile exist in prod_db_01"
    },
    {
      "domain": "Data Types",
      "status": "Passed",
      "message": "Column casting rules compiled without implicit loss"
    }
  ]
}
```

---

## E. State and Lifecycle

```
[DRAFT] ──► [CREDENTIALS_SET] ──► [DISCOVERED] ──► [CONFIG_UPLOADED] ──► [DRY_RUN_PASSED] ──► [EXECUTING] ──► [COMPLETED]
                                                                                                    │
                                                                                                    ▼
                                                                                                [FAILED]
```

---

## F. Frontend Integration Checklist

- [x] `POST /api/v1/connections/source/test` returns `200 OK` for full PostgreSQL credentials.
- [x] `GET /api/v1/config/template` downloads `sample-migration-config.json`.
- [x] `POST /api/v1/config/upload` accepts master Migration Config JSON payload.
- [x] `POST /api/v1/validation/dry-run` surfaces script dry-run validation results.
- [x] `GET /api/v1/execution/status` returns ordered sequential table progress.
- [x] `GET /api/v1/reports/download` returns downloadable JSON report artifact (`sample-migration-report.json`).
