# GM Authoring Governance & Migration Intelligence

## Functional Specification & Product Overview

### Document Purpose

The **GM Authoring Governance & Migration Intelligence** platform is an enterprise migration intelligence and data-governance application designed to monitor, investigate, analyze, and remediate data migration issues across GM Authoring systems.

The platform provides visibility across:

**Source DB → STG DB → PROD DB**

and combines:

* Migration reconciliation
* Data-quality monitoring
* Entity exploration
* Schema intelligence
* Dependency and lineage analysis
* Root-cause analysis
* Cascade impact analysis
* Error investigation
* Controlled data remediation
* Authoring change tracking
* Auditability
* Future statistical analytics
* AI-assisted governance

The system is designed to move beyond a traditional migration dashboard.

It should answer:

> **What is wrong → Why is it wrong → What does it affect → What will happen if we fix it → Can we safely fix it → Did the fix actually work?**

---

# 1. Product Objective

The primary objective is to provide a single platform for understanding the health and correctness of migrated GM Authoring data.

Instead of requiring engineers to manually query multiple databases and investigate relationships independently, the platform provides a unified investigation layer.

The platform compares:

| Environment | Purpose                              |
| ----------- | ------------------------------------ |
| Source      | Original/legacy GM data              |
| STG         | Migration and validation environment |
| PROD        | Published/production data            |

The system identifies differences between environments and provides the context required to investigate those differences.

---

# 2. Core Product Capabilities

The platform consists of the following major capabilities:

### 2.1 Migration Intelligence

Compare Source, STG and PROD records and identify discrepancies.

### 2.2 Data Quality

Identify missing relationships, duplicates, orphan records, transformation errors and other migration problems.

### 2.3 Entity Intelligence

Explore individual GM entities and understand their structure, migration state, relationships and errors.

### 2.4 Schema Intelligence

Explore tables, columns, PKs, FKs and relationships.

### 2.5 Dependency & Lineage

Understand upstream and downstream relationships between entities.

### 2.6 Cascade Analysis

Determine how a root-level issue propagates through the GM hierarchy.

### 2.7 Root Cause Analysis

Identify the likely source of a migration discrepancy using relationship and validation evidence.

### 2.8 Remediation

Provide controlled options to fix, update, relink or delete problematic records.

### 2.9 Impact Analysis

Show the expected downstream impact before a database modification occurs.

### 2.10 Authoring Audit

Track differences between original, migrated and current values.

### 2.11 Execution & Audit

Track remediation execution from STG validation through PROD deployment and final verification.

---

# 3. GM Data Hierarchy

The application models GM Authoring data across several business domains.

## Reference

* Makes
* Models
* Vehicles
* Years
* Regions

## PCS

* PCS
* PCS Systems
* PCS Subsystems
* PCS Procedures

## MCS

* MCS
* MCS Systems
* MCS Subsystems
* MCS Procedures

## Authoring

* Draft Tables
* Published Tables
* History Tables

This hierarchy is important because many migration problems are not isolated.

A missing reference entity can affect multiple downstream entities.

---

# 4. Application Navigation

The application uses a persistent navigation structure.

### Primary modules

1. Executive Dashboard
2. Migration Health
3. Entity Explorer
4. Error Centre
5. Cascade Analysis
6. Schema Explorer
7. Author Changes
8. Page Drilldown

Additional operational functionality may be exposed through:

9. Remediation / Fix Workspace
10. Execution & Audit History

Future modules:

11. Statistical Analytics
12. Pareto Analysis
13. AI Governance Copilot

---

# 5. Executive Dashboard

## Purpose

Provide an executive-level view of migration health.

The page answers:

> **Is the migration healthy?**

### Key metrics

* Open Errors
* Data Quality %
* Migration Success %

### Entity overview

Entities are grouped into:

**Reference**

**MCS**

**PCS**

Each entity displays its current migration health.

Example:

```text
PCS Procedures

Source     8,955,290
STG        8,955,290
PROD       8,804,680

Difference 150,610
Migration  98.32%
Status     Critical
```

### Migration Health Indicator

A large visual health indicator summarizes overall migration/data-quality health.

### Drilldown

Every major entity is interactive.

Clicking an entity takes the user into detailed analysis.

---

# 6. Migration Health

## Purpose

Provide detailed reconciliation between environments.

The primary view is a reconciliation table.

| Entity         |    Source |       STG |      PROD | Difference |
| -------------- | --------: | --------: | --------: | ---------: |
| Makes          |        28 |        28 |        23 |          5 |
| Models         |       573 |       573 |       556 |         17 |
| PCS            |     3,724 |     3,631 |     3,627 |          4 |
| PCS Systems    |    42,684 |    42,684 |    41,386 |      1,298 |
| PCS Subsystems |   219,004 |   219,004 |   213,878 |      5,126 |
| PCS Procedures | 8,955,290 | 8,955,290 | 8,804,680 |    150,610 |
| MCS            |        64 |        64 |        64 |          0 |
| MCS Systems    |       767 |       767 |       767 |          0 |
| MCS Subsystems |     8,635 |     8,635 |     8,635 |          0 |
| MCS Procedures | 1,648,344 | 1,648,344 | 1,126,466 |    521,878 |

These values are **representative migration data for the current prototype** and will eventually be replaced by live backend data.

### Calculated fields

For every entity:

* Source Count
* STG Count
* PROD Count
* Difference
* Migration %
* Status

### Status

* Healthy
* Warning
* Critical

### Filters

* Entity
* Environment
* Migration Status
* Difference
* Make
* Model
* Vehicle

### Interaction

Clicking an entity opens Entity Explorer.

---

# 7. Entity Explorer

## Purpose

Provide a 360° view of an entity.

The user can search:

> Entity / Table / ID

Example:

`PCS Subsystems`

### Basic Information

Display:

* Entity name
* Source count
* STG count
* PROD count
* Difference
* Migration %

### Schema

Display:

* Columns
* Data types
* Nullable
* Primary Keys
* Foreign Keys

### Dependencies

Display:

* Parent tables
* Child tables
* Related tables
* Upstream dependencies
* Downstream dependencies

### Mapping

Display:

* Source table
* Source column
* Target table
* Target column
* Transformation rule

### Data Quality

Display:

* Errors
* Missing relationships
* Duplicates
* Orphan records
* Transformation issues

### Changes

Display:

* Created
* Updated
* Deleted
* Rejected
* Approved
* Published

---

# 8. Error Centre

## Purpose

The Error Centre is the application's primary **Data Quality Workbench**.

It answers:

> **What is broken?**

### Error categories

* Missing Vehicle
* Missing FK
* Missing Model
* Missing Make
* Duplicate Data
* Orphan Records
* Transformation Errors

### Error information

Every error contains:

* Error ID
* Table
* Entity
* Record ID
* Root Cause
* Impact
* Severity
* Status
* Owner
* Created Date
* Recommended Action
* Remediation Type

### Error statuses

* Open
* Investigating
* In Progress
* Resolved
* Rejected

---

# 9. Error Investigation

Clicking an error opens its detailed investigation view.

The system should show:

### Root Cause

Why the error exists.

### Evidence

Actual records, IDs, relationships and mapping information supporting the conclusion.

### Impact

* Direct records affected
* Upstream dependencies
* Downstream dependencies
* Tables affected
* Expected migration impact

### Recommended Action

Examples:

* Fix
* Relink
* Delete Candidate
* Investigate
* No Action

---

# 10. Orphan Record Detection

An important data-quality scenario is identifying records that have no valid references.

Example:

```text
Vehicle 1750

Parent References: 0
Child References: 0

Classification:
Orphan

Recommendation:
Potential Delete Candidate
```

However, the system must **not assume that every orphan is automatically safe to delete**.

The backend must determine:

* Safe Delete Candidate
* Referenced
* Blocked
* Requires Investigation

The frontend displays the backend determination.

---

# 11. Referenced / Non-Deletable Records

If a record has downstream references, the application must clearly communicate the impact.

Example:

```text
Vehicle 2967

Referenced by:

73 PCS
1,298 PCS Systems
5,126 PCS Subsystems
150,610 PCS Procedures
```

The UI should identify the record as:

**Referenced / High Impact**

and explain why deletion is dangerous.

---

# 12. Cascade Analysis

## Purpose

Understand how a root-level problem propagates through the data hierarchy.

Example:

```text
Vehicle 2967
      ↓
73 PCS
      ↓
1,298 PCS Systems
      ↓
5,126 PCS Subsystems
      ↓
150,610 PCS Procedures
```

The visualization should be interactive.

Each node displays:

* Entity
* Affected records
* Percentage impact
* Severity

### Example

**PCS Systems**

```text
1,298 affected
Critical
```

Clicking the node opens its detailed impact information.

---

# 13. Cascade Amplification

The system calculates how much a root problem expands downstream.

Formula:

**Cascade Amplification = Downstream Loss / Root Cause Loss**

Example:

```text
150,610 / 73

≈ 2,063×
```

This should be prominently displayed.

This helps data-quality teams prioritize issues based not merely on error count but on **downstream business impact**.

---

# 14. Contextual Impact Intelligence

Important metrics should provide contextual explanations through hover/tooltips.

Example:

Hovering over:

**5,126 missing PCS Subsystems**

could show:

```text
Root Cause:
Missing PCS System relationships

Upstream:
1,298 PCS Systems

Downstream:
150,610 Procedures

Example:
PCS System SYS-29481
→ 4 Subsystems
→ 137 Procedures
```

This allows users to understand the cause without immediately navigating away.

---

# 15. Schema Explorer

## Purpose

Provide technical schema and relationship intelligence.

The page is designed primarily for Data Architects and Data Engineers.

### Table information

* Columns
* Data Types
* Nullable
* Primary Keys
* Foreign Keys

### Foreign Keys

Display:

```text
Current Table
      ↓
Referenced Table
```

### Mapping

Display:

```text
Source Table
Source Column
      ↓
Target Table
Target Column
      ↓
Transformation Rule
```

### Dependencies

Display:

* Parent tables
* Child tables
* Upstream dependencies
* Downstream dependencies

---

# 16. Interactive ER / Lineage View

The Schema Explorer contains an interactive graph.

Example:

```text
PCS
 ↓
PCS Systems
 ↓
PCS Subsystems
 ↓
PCS Procedures
```

Clicking a table highlights its relationships.

Clicking a foreign key shows its impact.

Example:

```text
pcs.vehicle_id
       ↓
vehicles.id
```

The system can then show:

```text
7 dependent tables

73 PCS
1,298 Systems
5,126 Subsystems
150,610 Procedures
```

---

# 17. Author Changes

## Purpose

Distinguish migration changes from legitimate authoring changes.

The system tracks:

```text
Original → Migrated → Current
```

Example:

| Field        | Original     | Migrated       | Current      |
| ------------ | ------------ | -------------- | ------------ |
| Vehicle Name | Legacy Value | Migrated Value | Author Value |

Additional metadata:

* Who changed it
* When
* Why
* Change Type
* Status

### Change types

* Created
* Updated
* Deleted
* Rejected
* Approved
* Published

### Audit fields

Where available:

* created_at
* created_by
* updated_at
* updated_by

---

# 18. Authoring Timeline

Each record can display:

```text
Migration
   ↓
Author Change
   ↓
Review
   ↓
Approval
   ↓
Publication
```

This allows the organization to distinguish:

**Migration issue**

from

**Intentional authoring change**

---

# 19. Page Drilldown

Provides a technical/business catalog of all tables.

Groups:

### Reference

* Makes
* Models
* Vehicles
* Years
* Regions

### MCS

* MCS
* MCS Systems
* MCS Subsystems
* MCS Procedures

### PCS

* PCS
* PCS Systems
* PCS Subsystems
* PCS Procedures

### Authoring

* Draft Tables
* Published Tables
* History Tables

Each table exposes:

* Row count
* Schema
* Columns
* PKs
* FKs
* Dependencies
* Mapping
* Errors
* Changes
* Migration Status

---

# 20. Remediation Workspace

This is the operational extension of Error Centre.

The administrator can select one or multiple errors.

Example:

```text
☑ Vehicle 2967
☑ Vehicle 1713
☑ Vehicle 1750

3 selected
```

Possible actions:

* Preview Fix
* Fix Selected
* Delete Candidates
* Relink
* Update
* Investigate

---

# 21. Multi-Record Remediation

Bulk actions must never immediately modify production data.

The system first classifies selected records.

Example:

```text
Selected: 10

Fixable: 6
Delete Candidates: 2
Blocked: 1
Requires Investigation: 1
```

The administrator can inspect each classification.

---

# 22. Impact Preview

Before any modification, the system calculates the expected impact.

Example:

```text
Vehicle 2967

Current:
Missing relationship

Proposed:
Restore relationship

Expected Impact:

73 PCS
1,298 PCS Systems
5,126 PCS Subsystems
150,610 PCS Procedures
```

Also display:

* Tables affected
* Records affected
* Errors expected to resolve
* Errors potentially created
* Migration difference before
* Migration difference after
* Risk level

---

# 23. Before / After Simulation

The administrator should see the expected result before executing.

Example:

```text
PCS Procedures

Current:
8,804,680

Expected:
8,955,290

Difference:
150,610 → 0
```

Other expected metrics:

```text
Open Errors:
82 → 9

Data Quality:
98.2% → 99.8%

Migration Success:
98.3% → 100%
```

These are examples; real values will come from backend calculations.

---

# 24. Production Safety

The browser must never directly modify the database.

All modifications must go through the backend.

The operational flow is:

```text
Frontend
   ↓
Impact Preview
   ↓
Administrator Confirmation
   ↓
Backend Remediation API
   ↓
STG Execution
   ↓
STG Validation
   ↓
Production Confirmation
   ↓
PROD Execution
   ↓
Verification
   ↓
Audit
```

---

# 25. Dangerous Operation Confirmation

For destructive operations, display a warning dialog.

Example:

```text
⚠ PRODUCTION DATA CHANGE

Action:
DELETE

Record:
Vehicle 1750

Known Dependents:
0

Environment:
PROD

Reason:
[________________]

This operation will modify production data.

[Cancel]

[Continue to STG Validation]
```

For high-impact operations:

```text
⚠ HIGH IMPACT OPERATION

This change may affect:

73 PCS
1,298 Systems
5,126 Subsystems
150,610 Procedures

[View Full Impact]

[Cancel]

[Continue]
```

No fake multi-user approval workflow is required.

The authorized administrator is the final decision-maker.

---

# 26. STG Execution

Remediation should first execute against STG.

Lifecycle:

```text
Impact Analysis
      ✓
STG Execution
      ✓
STG Validation
      ✓
PROD Execution
      ○
Verification
      ○
```

If STG validation fails:

```text
STG Validation FAILED

Reason:
Foreign Key Constraint Violation

PROD:
BLOCKED
```

The system must not proceed to PROD automatically.

---

# 27. Production Promotion

After successful STG validation, the administrator can initiate production execution.

The system displays:

* STG result
* Validation result
* Records changed
* Tables affected
* Expected PROD impact

Then the administrator explicitly confirms production execution.

---

# 28. Verification

After production execution the system performs reconciliation.

It compares:

```text
Before
vs
After
```

Verification should confirm:

* Expected records created
* Expected records updated
* Expected records deleted
* Errors resolved
* No new critical errors
* FK integrity
* Migration counts
* Data-quality score

---

# 29. Execution History / Audit

Every remediation operation produces an audit record.

Capture:

* Remediation ID
* Timestamp
* Action
* Environment
* Table
* Record
* Before state
* After state
* Reason
* Execution status
* Validation result
* Affected records

Example lifecycle:

```text
REM-004281

Impact Analysis      ✓
STG Execution        ✓
STG Validation       ✓
PROD Execution       ✓
Post Verification    ✓
Audit                ✓
```

---

# 30. Failure Handling

The platform must support:

* Pending
* Running
* Validating
* Completed
* Failed
* Blocked
* Rejected
* Rolled Back

Example:

```text
STG Validation FAILED

PROD deployment:
BLOCKED

Reason:
Foreign key constraint violation
```

The user can then:

* View failure
* Investigate
* Modify remediation
* Retry

---

# 31. Mock Data Strategy

The current frontend uses representative mock data.

The mock data should reproduce realistic scenarios:

* Healthy entity
* Warning entity
* Critical entity
* Missing FK
* Missing Vehicle
* Missing Model
* Missing Make
* Duplicate
* Orphan
* Referenced/non-deletable record
* Transformation failure
* Author change
* Successful remediation
* Failed remediation

The prototype data must be deterministic so that refreshes produce consistent results.

---

# 32. Backend Integration Model

The frontend should be built against a clean API abstraction.

The frontend should not depend directly on database implementation.

Conceptually:

```text
React Frontend
      ↓
API Layer
      ↓
Migration / Governance Backend
      ↓
Source DB
STG DB
PROD DB
```

The current mock API should mimic the future backend API.

This allows the mock layer to be replaced without rewriting the UI.

---

# 33. Required Backend Data

The backend/STG layer needs to expose information for:

### Entity Catalog

* Tables
* Entity names
* Categories
* Counts

### Schema

* Columns
* Types
* PKs
* FKs

### Relationships

* Parent
* Child
* Upstream
* Downstream

### Migration

* Source count
* STG count
* PROD count
* Difference
* Migration %

### Errors

* Error
* Root cause
* Evidence
* Record
* Severity
* Status

### Lineage

* Entity relationships
* Record relationships
* Dependency depth
* Impact counts

### Mapping

* Source
* Target
* Transformation

### Authoring

* Original
* Migrated
* Current
* Changed by
* Changed at

### Remediation

* Proposed action
* Impact
* Execution
* Validation

### Audit

* Before
* After
* Environment
* Timestamp
* Result

---

# 34. Future Statistical Analytics

The architecture should leave room for statistical analysis.

Potential metrics:

* Mean
* Median
* Standard deviation
* Variance
* Skewness
* Kurtosis
* IQR
* Z-score
* Robust Z-score
* Outliers

Potential analysis:

### Pareto

* Top Publications
* Top Vehicles
* Top Procedure Contributors
* Top Error Contributors

### Expansion Analysis

Example:

```text
Sections → PCS Systems

18,721 → 42,684
2.28×
```

```text
Subsections → PCS Subsystems

82,200 → 219,004
2.66×
```

```text
Procedures → PCS Procedures

3,071,328 → 8,955,290
2.92×
```

-
