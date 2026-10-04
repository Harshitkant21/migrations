# Backend Requirements & API Contract Specification (V0)

## A. Purpose and Scope

This document specifies the backend requirements, API endpoints, request/response contracts, and system lifecycle transitions necessary to support the **Database Migration Platform V0** frontend application.

It is designed to provide backend engineers with explicit, journey-mapped technical requirements for building backend REST/WebSocket APIs without guessing frontend expectations.

---

## B. System Interaction Overview

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     FRONTEND (React 18 SPA)                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
            │                      │                       │                      │
   HTTP REST│ Connection           │ Schema                │ Mapping &            │ Execution Control
   & JSON   │ Requests             │ Metadata              │ Validation           │ & Log Stream
            ▼                      ▼                       ▼                      ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   BACKEND MIGRATION SERVICE API                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
            │                                              │                      │
   Driver   │ SQL Inspection                               │ Data Pipeline        │ Report Artifact
   Queries  ▼                                              ▼                      ▼
┌────────────────────────┐                    ┌────────────────────────┐┌────────────────────────┐
│ SOURCE POSTGRESQL DB   │                    │ TARGET POSTGRESQL DB   ││ MIGRATION REPORT STORE │
└────────────────────────┘                    └────────────────────────┘└────────────────────────┘
```

---

## C. API Inventory

The required backend capabilities are organized by journey step:

| Endpoint ID | Proposed Endpoint | Method | Journey Step | Purpose |
|---|---|---|---|---|
| API-01 | `/api/v1/migrations/draft` | `POST` | Step 1 (Setup) | Initialize a new migration run draft |
| API-02 | `/api/v1/connections/source/test` | `POST` | Step 1 (Setup) | Test connection to source PostgreSQL database |
| API-03 | `/api/v1/connections/target/test` | `POST` | Step 1 (Setup) | Test connection to target PostgreSQL database |
| API-04 | `/api/v1/discovery/source` | `POST` | Step 2 (Source Discovery) | Initiate source database schema inspection |
| API-05 | `/api/v1/discovery/source/results` | `GET` | Step 2 (Source Discovery) | Fetch discovered source database tables & metadata |
| API-06 | `/api/v1/discovery/target` | `POST` | Step 3 (Target Discovery) | Initiate target database schema inspection |
| API-07 | `/api/v1/discovery/target/results` | `GET` | Step 3 (Target Discovery) | Fetch discovered target database tables & metadata |
| API-08 | `/api/v1/mappings/sample` | `GET` | Step 4 (Mapping Workspace) | Download standard sample mapping JSON structure |
| API-09 | `/api/v1/mappings/upload` | `POST` | Step 4 (Mapping Workspace) | Upload and validate mapping JSON definition |
| API-10 | `/api/v1/mappings/draft` | `PUT` | Step 4 (Mapping Workspace) | Save draft mapping changes |
| API-11 | `/api/v1/validation/run` | `POST` | Step 5 (Validation) | Run pre-flight migration validation checks |
| API-12 | `/api/v1/validation/issues/:id/resolve` | `POST` | Step 5 (Validation) | Resolve or bypass a validation issue |
| API-13 | `/api/v1/execution/start` | `POST` | Step 6 (Sequential Execution) | Launch sequential migration execution |
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

### 1. Connection Testing (`/api/v1/connections/source/test` & `/target/test`)
- **HTTP Method:** `POST`
- **Request Payload:**
```json
{
  "engine": "PostgreSQL",
  "host": "aws-east-pg01.internal",
  "port": 5432,
  "database": "production_core_db",
  "username": "migrator_svc",
  "password": "encrypted_password_string",
  "ssl": true
}
```
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "connectionRef": "conn_src_9921a",
  "engineVersion": "PostgreSQL 14.9",
  "tableCount": 245,
  "schemaCount": 4,
  "message": "Successfully connected to PostgreSQL database"
}
```
- **Error Response (`400 Bad Request` / `500 Server Error`):**
```json
{
  "success": false,
  "errorCode": "CONNECTION_REFUSED",
  "errorMessage": "Could not establish TCP connection to host aws-east-pg01.internal:5432. Timeout after 5000ms."
}
```

---

### 2. Source & Target Schema Discovery (`/api/v1/discovery/source/results` & `/target/results`)
- **HTTP Method:** `GET`
- **Success Response (`200 OK`):**
```json
{
  "migrationId": "mig_2026_0928",
  "environment": "Source",
  "totalTables": 245,
  "totalColumns": 1840,
  "discoveredTables": [
    {
      "id": "tbl_vehicles",
      "name": "vehicles",
      "schema": "public",
      "rows": 3500,
      "columnCount": 6,
      "primaryKey": "vehicle_id",
      "foreignKeyCount": 2,
      "indexCount": 3,
      "columnsList": [
        { "name": "vehicle_id", "dataType": "VARCHAR(20)", "isPk": true, "isFk": false, "isNullable": false },
        { "name": "model_id", "dataType": "VARCHAR(10)", "isPk": false, "isFk": true, "isNullable": false }
      ]
    }
  ]
}
```

---

### 3. Mapping Contract & JSON Import (`/api/v1/mappings/upload`)
- **HTTP Method:** `POST`
- **Request Payload (`sample-mapping.json` compatible):**
```json
{
  "migrationId": "mig_2026_0928",
  "version": "1.0",
  "sourceDatabase": "production_core_db",
  "targetDatabase": "pg_cloud_aurora",
  "mappings": [
    {
      "id": "map-vehicles",
      "mappingType": "SPLIT",
      "sourceDatabases": ["legacy_db_01"],
      "sourceTables": ["LEGACY_VHCLS"],
      "targetDatabases": ["prod_db_01"],
      "targetTables": ["vehicles", "vehicle_specifications"],
      "title": "Vehicle Master Table Split",
      "columnMappings": [
        {
          "id": "cm-1",
          "sourceDb": "legacy_db_01",
          "sourceTable": "LEGACY_VHCLS",
          "sourceColumn": "VHC_ID",
          "sourceDataType": "VARCHAR(50)",
          "transformationType": "NORMALIZE",
          "transformationRule": "Prefix with 'GMV-' and strip legacy plant prefix",
          "targetDb": "prod_db_01",
          "targetTable": "vehicles",
          "targetColumn": "vehicle_id",
          "targetDataType": "VARCHAR(20)",
          "sampleBefore": "PUNE-X7-2026",
          "sampleAfter": "GMV-2967",
          "status": "Mapped"
        }
      ]
    }
  ]
}
```

---

### 4. Validation Contract (`/api/v1/validation/run`)
- **HTTP Method:** `POST`
- **Success Response (`200 OK`):**
```json
{
  "readinessScore": 92,
  "overallStatus": "Warning",
  "criticalCount": 2,
  "warningCount": 3,
  "passedCount": 42,
  "issues": [
    {
      "id": "val-err-01",
      "title": "Foreign Key Data Type Mismatch",
      "description": "Column model_year in legacy_vehicles is VARCHAR(4), but target vehicles expects INT.",
      "domain": "Schema",
      "severity": "Critical",
      "entity": "vehicles.model_year",
      "remediation": "Apply CAST transformation rule from VARCHAR to INT in Mapping Workspace.",
      "isResolved": false
    }
  ]
}
```

---

### 5. Sequential Execution Contract (`/api/v1/execution/status`)
- **HTTP Method:** `GET`
- **Behavior:** Returns sequential table pipeline order and live state.
- **Success Response (`200 OK`):**
```json
{
  "migrationId": "mig_2026_0928",
  "executionStatus": "running",
  "overallProgressPct": 68.4,
  "activeSequenceIndex": 2,
  "pipeline": [
    {
      "order": 1,
      "table": "legacy_makes",
      "status": "completed",
      "currentOperation": "Verified 5 rows",
      "progressPct": 100,
      "sourceRows": 5,
      "targetRows": 5
    },
    {
      "order": 2,
      "table": "legacy_models",
      "status": "completed",
      "currentOperation": "Verified 17 rows",
      "progressPct": 100,
      "sourceRows": 17,
      "targetRows": 17
    },
    {
      "order": 3,
      "table": "legacy_vehicles",
      "status": "running",
      "currentOperation": "Splitting and inserting into vehicles & vehicle_specifications",
      "progressPct": 68.4,
      "sourceRows": 3500,
      "targetRows": 2394
    },
    {
      "order": 4,
      "table": "pcs_procedures",
      "status": "queued",
      "currentOperation": "Waiting on parent vehicles FK completion",
      "progressPct": 0,
      "sourceRows": 1648344,
      "targetRows": 0
    }
  ]
}
```

---

## E. Connection Handling
- **Credentials Protection:** Password fields must never be stored in plain text or reflected back in `GET` responses.
- **Connection References:** Successful connection tests return an opaque `connectionRef` (e.g. `conn_src_9921a`) to be used in subsequent discovery and execution calls.

---

## F. Schema Discovery
- Discovery operates asynchronously on the backend. The frontend polls `/api/v1/discovery/source/status` until `status === "COMPLETED"`, then calls `/results`.

---

## G. Mapping Contract
- The sample JSON file (`public/samples/sample-mapping.json`) serves as the canonical example payload for backend mapping upload validation.

---

## H. Validation Contract
- `readinessScore` is calculated by the backend using:
  $$\text{Readiness \%} = 100 - (15 \times \text{Critical Issues}) - (3 \times \text{Warnings})$$
- A `readinessScore` of 100% or `criticalCount === 0` is required to start execution.

---

## I. Sequential Execution Contract
- **Strict Ordering:** Execution is strictly sequential. Only ONE table moves through `Extracting` ➔ `Transforming` ➔ `Loading` ➔ `Verifying` at a time to maintain referential integrity.

---

## J. Logs and Progress Updates
- **Supported Transport:** `GET /api/v1/execution/logs?since=<timestamp>` via HTTP polling (every 2000ms) or Server-Sent Events (`GET /api/v1/execution/stream`).

---

## K. Dashboard Contract
- Dashboard endpoints return aggregated table status breakdowns, total source/target row counts, reconciliation percentages, and blocker alerts.

---

## L. Report Contract
- `/api/v1/reports/summary` returns executive summary data.
- `/api/v1/reports/download` returns structured JSON or PDF download stream (`sample-migration-report.json`).

---

## M. Error Model

All API error responses follow a standardized payload structure:
```json
{
  "success": false,
  "error": {
    "code": "SCHEMA_MISMATCH",
    "message": "Target table 'vehicles' does not exist in target database 'pg_cloud_aurora'.",
    "details": [
      { "field": "targetTable", "issue": "Missing table definition in target database" }
    ],
    "timestamp": "2026-10-04T17:24:00Z"
  }
}
```

---

## N. State and Lifecycle

```
[DRAFT] ──► [CONNECTING] ──► [DISCOVERING] ──► [MAPPING] ──► [VALIDATING] ──► [READY] ──► [RUNNING] ──► [COMPLETED]
                                                                                            │
                                                                                            ▼
                                                                                        [FAILED]
```

---

## O. Frontend Integration Checklist

- [ ] `POST /api/v1/connections/source/test` returns `200 OK` for valid PostgreSQL credentials.
- [ ] `GET /api/v1/discovery/source/results` returns complete source PostgreSQL tables & columns.
- [ ] `GET /api/v1/discovery/target/results` returns target PostgreSQL tables & columns.
- [ ] `POST /api/v1/mappings/upload` accepts `sample-mapping.json` format.
- [ ] `POST /api/v1/validation/run` returns readiness score and issue list.
- [ ] `GET /api/v1/execution/status` returns ordered sequential table progress.
- [ ] `GET /api/v1/reports/download` returns downloadable JSON artifact.

---

## P. Open Questions / Backend Decisions

- [ ] `Requires Backend Decision`: Will passwords be stored in HashiCorp Vault or passed transiently via session tokens?
- [ ] `Requires Backend Decision`: Will live logs use WebSockets or HTTP Server-Sent Events (SSE)?
- [ ] `Requires Backend Decision`: Will final reports be rendered as static PDF files on S3 or dynamically generated JSON?
