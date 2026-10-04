# Database Migration Platform V0 — Project Context & Architectural Specification

## 1. Executive Summary & Purpose

The **Database Migration Platform V0** is an enterprise database migration orchestration platform designed for PostgreSQL migrations.

It provides a structured, predictable 8-step migration workflow:
1. **Migration Setup:** PostgreSQL Source & Target connection configuration.
2. **Source Discovery:** Automated discovery of source schemas, tables, data types, primary keys, foreign keys, and indexes.
3. **Target Schema Discovery:** Automated discovery of existing target PostgreSQL schemas for mapping review (eliminating unsupported manual frontend schema editors).
4. **Mapping Workspace:** Reviewing discovered schemas, uploading mapping JSON files, downloading sample JSON, and refining mapping rules.
5. **Validation:** Plain-English readiness checking (`"Is this migration ready to run?"`) with blocking issue detection.
6. **Sequential Execution:** Ordered table-by-table migration pipeline execution with live logs.
7. **Migration Dashboard:** Monitoring migration health, status breakdown, and table reconciliation metrics.
8. **Final Migration Report:** Exporting audit-compliant summary reports.

---

## 2. UX & Architectural Philosophy

### Core UX Principles
- **Clarity Over Complexity:** Eliminate cluttered dashboards, unnecessary card stacking, and awkward multi-row button arrows.
- **Direct Discovery:** Discover both source and target schemas automatically from database connections rather than prompting users to manually create or edit target DDL schemas in the browser.
- **Predictable Execution:** Present migration as an ordered, sequential process (table 1 ➔ table 2 ➔ table 3) rather than complex, parallel worker lanes.
- **Restrained Enterprise Aesthetic:** Light neutral base (`bg-slate-50`), clear text contrast (`text-slate-900`), blue primary actions (`bg-slate-900` / `bg-brand`), green for success (`bg-emerald-500`), amber for warnings, and red for critical failures.

---

## 3. Technology Stack & Component Structure

- **Framework:** React 18.3 + TypeScript 5.8 + Vite 8.2
- **Styling:** Tailwind CSS 3.4 + Vanilla CSS custom variables (`bg-surface`, `bg-brand`, `shadow-2xs`)
- **State Management:** Zustand 5.0 (`useGlobalStore.ts`)
- **Icons:** Lucide React 1.16

### Project Structure
```
c:\Users\hp\Desktop\dummy_migration_dashboard\
├── docs/
│   └── BACKEND_REQUIREMENTS.md       # API design contract & backend specifications
├── public/
│   └── samples/
│       ├── sample-mapping.json       # Sample mapping JSON artifact
│       └── sample-migration-report.json # Sample migration report download artifact
├── src/
│   ├── components/
│   │   ├── layout/                   # TopBar, SidebarNav, AppShell, DemoJumperModal
│   │   └── ui/                       # Button, Badge, Modal, ToastContainer
│   ├── data/
│   │   ├── database/                 # Seed data & database metadata definitions
│   │   ├── journeyMockData.ts        # Mock data for 8-step migration journey
│   │   └── mockApi.ts                # Async service layer boundary for backend integration
│   ├── pages/
│   │   ├── journey/                  # 8-Step Journey Components
│   │   │   ├── 1_MigrationSetup.tsx
│   │   │   ├── 2_SourceDiscovery.tsx
│   │   │   ├── 3_TargetDiscovery.tsx
│   │   │   ├── 4_MappingWorkspace.tsx
│   │   │   ├── 5_ValidationStep.tsx
│   │   │   ├── 6_ExecutionStep.tsx
│   │   │   ├── 7_DashboardStep.tsx
│   │   │   └── 8_MigrationReport.tsx
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
3. Zero UI component restructuring is required.

---

## 5. Important Decisions & Revised Scope

1. **Target Schema Creation Removed:** Creating new target tables or adding target columns through the frontend has been removed. Target schemas are discovered automatically from the target connection.
2. **PostgreSQL Focus:** Database engine selection is focused on PostgreSQL connections for V0.
3. **Sequential Execution Model:** Migration execution is displayed as a single, ordered table pipeline (`Completed` ➔ `Running` ➔ `Queued` ➔ `Failed`) rather than parallel worker lanes.
4. **JSON Mapping Upload & Sample Download:** Mapping Workspace provides clear JSON upload and sample JSON download actions (`sample-mapping.json`).
5. **Downloadable Migration Report:** Final Migration Report page provides a working download button for `sample-migration-report.json`.

---

## 6. Known Limitations & Future Extensions

- **Current Limitation:** Connection test, discovery, validation, and execution run on simulated frontend timers.
- **Future Extension:** Implement WebSocket/SSE streaming for real-time migration logs and row ingestion throughput.
- **Future Extension:** Add HashiCorp Vault / encrypted secrets store integration for database passwords.
