// src/types/models.ts

export type Environment = 'Source' | 'STG' | 'PROD';
export type MigrationStatus = 'Healthy' | 'Warning' | 'Critical';
export type SeverityType = 'High' | 'Medium' | 'Low';
export type AuditStatus = 'Pending' | 'Approved' | 'Rejected' | 'Published';
export type EntityCategory = 'Reference' | 'MCS' | 'PCS' | 'Authoring';

export type RemediationCategory = 'FIXABLE' | 'DELETE_CANDIDATE' | 'BLOCKED' | 'INVESTIGATE' | 'NO_ACTION';
export type RemediationStatus = 'PENDING' | 'RUNNING' | 'STG_SUCCESS' | 'STG_FAILED' | 'PROD_SUCCESS' | 'PROD_FAILED' | 'ROLLED_BACK';

export interface EntityMetadata {
  id: string;
  name: string;
  category: EntityCategory;
  sourceCount: number;
  stgCount: number;
  prodCount: number;
  difference: number;
  migrationPct: number;
  status: MigrationStatus;
}

export interface ColumnSchema {
  name: string;
  dataType: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  referencedTable?: string;
  referencedColumn?: string;
}

export interface TableSchema {
  entityId: string;
  columns: ColumnSchema[];
  primaryKeys: string[];
  foreignKeys: { column: string; referencedTable: string; referencedColumn: string }[];
  upstreamDeps: string[];
  downstreamDeps: string[];
  mappingRules: {
    sourceTable: string;
    sourceColumn: string;
    targetColumn: string;
    transformationRule: string;
  }[];
}

// Sub-interface representing validation evidence
export interface ErrorEvidence {
  rootRecord: string;
  rootTable: string;
  missingReferenceTable?: string;
  missingReferenceColumn?: string;
  expectedReference?: string;
  actualReference?: string;
  upstreamCount: number;
  downstreamCount: number;
  explanation: string;
}

export interface DataQualityError {
  id: string;
  entityId: string; // The affected table
  category: 'Missing Vehicle' | 'Missing FK' | 'Missing Model' | 'Missing Make' | 'Duplicate Data' | 'Orphan Records' | 'Transformation Error';
  rootCause: string;
  affectedRecords: number;
  impactDescription: string;
  severity: SeverityType;
  status: 'Open' | 'Investigating' | 'In Progress' | 'Resolved' | 'Rejected';
  owner: string;
  createdAt: string;
  vehicleId?: string; // Optional reference to specific vehicle triggering this error
  remediationCategory: RemediationCategory;
  evidence?: ErrorEvidence;
}

export interface AuthorAuditRecord {
  id: string;
  entityId: string;
  recordKey: string; // e.g. "PROC-88092"
  field: string;
  originalValue: string;
  migratedValue: string;
  currentValue: string;
  changedBy: string;
  changedAt: string;
  reason: string;
  changeType: 'Created' | 'Updated' | 'Deleted' | 'Rejected' | 'Approved' | 'Published';
  status: AuditStatus;
  timeline: {
    stage: 'Migration' | 'Author Change' | 'Review' | 'Approval' | 'Publication';
    timestamp: string;
    user?: string;
    details: string;
  }[];
}

export interface CascadeNode {
  id: string;
  name: string;
  category: EntityCategory | 'Root';
  affectedCount: number;
  impactPct: number;
  severity: SeverityType | 'Healthy';
  relationshipType?: string; // e.g., "1-to-Many Cascade", "Orphaned Association"
}

export interface ImpactPreviewResult {
  errorIds: string[];
  action: 'FIX' | 'DELETE' | 'RESTORE' | 'RELINK' | 'UPDATE';
  affectedTables: { tableName: string; recordsCount: number }[];
  totalDownstreamImpact: number;
  errorsResolvedCount: number;
  errorsCreatedCount: number;
  migrationDiffBefore: number;
  migrationDiffAfter: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  canExecute: boolean;
  blockingReasons: string[];
}

export interface RemediationJob {
  id: string;
  errorIds: string[];
  action: 'FIX' | 'DELETE' | 'RESTORE' | 'RELINK' | 'UPDATE';
  status: RemediationStatus;
  requestedBy: string;
  requestedAt: string;
  reason: string;
  stgValidationResult?: {
    success: boolean;
    logs: string[];
    recordsUpdated: number;
    errorCountBefore: number;
    errorCountAfter: number;
  };
  prodExecutionResult?: {
    success: boolean;
    executedAt: string;
    recordsUpdated: number;
    logs: string[];
  };
}

export interface OperationAuditRecord {
  id: string;
  remediationId: string;
  timestamp: string;
  action: string;
  environment: 'STG' | 'PROD';
  affectedTable: string;
  beforeStateSummary: string;
  afterStateSummary: string;
  reason: string;
  operator: string;
  affectedRecords: number;
}
