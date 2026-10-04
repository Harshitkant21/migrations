# Database Migration Platform V0 — Project Context & Architectural Specification

## 1. Executive Summary & Purpose

The **Database Migration Platform V0** is an enterprise multi-database migration orchestration platform driven by a **Single Source of Truth Migration Config JSON**.

It provides a structured, predictable 8-step migration workflow:
1. **Migration Setup:** Multi-Database Source & Target connection configuration with full credentials (Host, Port, DB Name, Username, Password, SSL mode).
2. **Source Discovery:** Automated discovery of multi-source database schemas, tables, data types, primary keys, foreign keys, and indexes.
3. **Target Schema Discovery:** Automated discovery of existing target database schemas for mapping review.
4. **Mapping Workspace:** Single Source of Truth Table Mapping Config JSON management (download template, upload/edit config, row-level template schema error validation).
5. **Script Pre-Flight & Dry-Run Validation:** Migration script dry-run validation mode (`--dry-run --validate`) testing live database health, schema compatibility, and constraint enforcement prior to execution.
6. **Sequential Execution:** Ordered table-by-table migration pipeline execution driven by the master JSON config with live logs.
7. **Migration Dashboard:** Monitoring multi-database migration health, status breakdown, and table reconciliation metrics.
8. **Final Migration Report:** Exporting audit-compliant summary reports.

---

## 2. UX & Architectural Philosophy

### Core UX Principles
- **Single Source of Truth JSON Flow:** The migration script executes strictly based on the defined master Migration Config JSON (`sample-migration-config.json`) containing multi-source and multi-target DB connection strings and table mapping rules.
- **Clarity Over Complexity:** Clean, single-line UI elements with `whitespace-nowrap` buttons, sleek single hover tooltips, and responsive layout bounds.
- **Full Credential Transparency:** Capture complete database credentials (Host, Port, DB Name, Username, Password, Engine Type, SSL Mode) for all connected nodes.
- **Predictable Execution:** Present migration as an ordered, sequential process driven by script pipeline sequence.
- **Restrained Enterprise Aesthetic:** Light neutral base (`bg-slate-50`), clear text contrast (`text-slate-900`), blue/slate primary actions (`bg-slate-900`), emerald for success/active auto-save (`bg-emerald-600` / `⚡ Auto-Saved`), amber for warnings, and red for template schema errors.

---

## 3. Technology Stack & Component Structure

- **Framework:** React 18.3 + TypeScript 5.8 + Vite 8.2
- **Styling:** Tailwind CSS 3.4 + Vanilla CSS custom variables (`bg-surface`, `shadow-2xs`)
- **State Management:** Zustand 5.0 (`useGlobalStore.ts`) with real-time auto-save
- **Icons:** Lucide React 1.16

### Project Structure
```
c:\Users\hp\Desktop\dummy_migration_dashboard\
├── docs/
│   └── BACKEND_REQUIREMENTS.md       # API design contract & backend specifications
├── public/
│   └── samples/
│       ├── sample-migration-config.json # Single Source of Truth master config JSON
│       ├── sample-mapping.json       # Legacy mapping JSON artifact
│       └── sample-migration-report.json # Sample migration report download artifact
├── src/
│   ├── components/
│   │   ├── layout/                   # TopBar, SidebarNav, AppShell, DemoJumperModal
│   │   └── ui/                       # Button, Badge, Modal, ToastContainer, Pagination
│   ├── data/
│   │   ├── database/                 # Seed data & database metadata definitions
│   │   ├── journeyMockData.ts        # Mock data for 8-step migration journey
│   │   └── mockApi.ts                # Async service layer boundary for backend integration
│   ├── pages/
│   │   ├── journey/                  # 8-Step Journey Components
│   │   │   ├── 1_MigrationSetup.tsx  # Multi-DB Credential Setup
│   │   │   ├── 2_SourceDiscovery.tsx # Source Schema Discovery
│   │   │   ├── 3_TargetDiscovery.tsx # Target Schema Discovery
│   │   │   ├── 4_MappingWorkspace.tsx# Table Config JSON & Template Validation
│   │   │   ├── 5_ValidationStep.tsx   # Script Dry-Run Validation Mode
│   │   │   ├── 6_ExecutionStep.tsx   # Sequential Pipeline Execution
│   │   │   ├── 7_DashboardStep.tsx   # Monitoring Dashboard
│   │   │   └── 8_MigrationReport.tsx # Final Audit Report
│   │   ├── LandingPage.tsx           # Initial Landing Screen
│   │   ├── Overview.tsx              # Executive Overview Tab
│   │   ├── MigrationStatus.tsx       # Migration Status Directory Tab
│   │   ├── Mapping.tsx               # Mapping Studio Tab
│   │   └── TableDetails.tsx          # Table Details Profile Tab
│   ├── state/
│   │   └── useGlobalStore.ts         # Global Zustand state store
│   └── types/
│       └── models.ts                 # TypeScript data contracts & models
├── context.md                        # Product context (This file)
├── functionality.md                  # Comprehensive functional handbook
└── package.json                      # Project manifest
```

---

## 4. State Architecture & Service Boundary

All data interactions are routed through `src/data/mockApi.ts` and managed in Zustand (`useGlobalStore.ts`).

### Backend Integration Boundary
To connect a real backend REST/GraphQL server:
1. Replace simulated promises in `src/data/mockApi.ts` with HTTP API calls (`axios` or `fetch`).
2. Map response payloads to the backend API contracts defined in [`docs/BACKEND_REQUIREMENTS.md`](file:///c:/Users/hp/Desktop/dummy_migration_dashboard/docs/BACKEND_REQUIREMENTS.md).
3. The backend migration engine consumes the Single Source of Truth Config JSON (`sample-migration-config.json`) uploaded or edited in Step 4.

---

## 5. Architectural Alignment & Multi-DB Capabilities

1. **Multi-Source & Multi-Target Database Support:** Supports adding and managing multiple source nodes (`legacy_db_01`, `legacy_db_02`) and target nodes (`prod_db_01`, `prod_db_02`) with engine selections (`PostgreSQL`, `MySQL`, `Oracle`, `SQL Server`).
2. **Master Config JSON Driven Engine:** The frontend manages and uploads a single JSON configuration file that defines connection parameters, table projections, splits/joins, and execution order.
3. **Template Schema Error Validation:** The Mapping Workspace displays row-by-row schema validation against database templates to flag missing primary keys or invalid data type conversions directly.
4. **Script Pre-Flight & Dry-Run Validation:** Step 05 executes the migration script in `--dry-run --validate` mode to test database health before launching live execution.
5. **Downloadable Artifacts:** Working download actions for `sample-migration-config.json` and `sample-migration-report.json`.

---

## 6. Known Limitations & Future Extensions

- **Current Limitation:** Connection testing, discovery, validation, and execution run on simulated frontend timers.
- **Future Extension:** Implement WebSocket/SSE streaming for real-time migration logs and row ingestion throughput.
- **Future Extension:** Add HashiCorp Vault / encrypted secrets store integration for database passwords.
