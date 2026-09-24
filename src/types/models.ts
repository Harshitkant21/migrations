export type Environment = 'Source' | 'STG' | 'PROD';
export type MigrationStatus = 'Healthy' | 'Warning' | 'Critical' | 'Pending';
export type SeverityType = 'High' | 'Medium' | 'Low';
export type AuditStatus = 'Pending' | 'Approved' | 'Rejected' | 'Published';
export type EntityCategory = 'Reference' | 'MCS' | 'PCS' | 'Authoring';

export type TransformationType = 
  | 'DIRECT' 
  | 'RENAME' 
  | 'CAST' 
  | 'CONCAT' 
  | 'SPLIT' 
  | 'NORMALIZE' 
  | 'LOOKUP' 
  | 'CASE_MAPPING' 
  | 'CALCULATED' 
  | 'CONDITIONAL' 
  | 'AGGREGATED' 
  | 'DERIVED'
  | 'MERGE_KEY';

export type MappingType = 'SINGLE' | 'MERGE' | 'SPLIT' | 'COMPLEX';

export type SchemaDiffType = 'ADDED' | 'REMOVED' | 'CHANGED' | 'UNCHANGED';

export interface DatabaseInfo {
  id: string;
  name: string;
  type: 'MySQL' | 'PostgreSQL';
  environment: 'Source' | 'Staging' | 'Target';
  tableCount: number;
  description: string;
}

export interface DetailedColumnSchema {
  name: string;
  dataType: string;
  length?: string;
  isNullable: boolean;
  defaultValue?: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  referencedTable?: string;
  referencedColumn?: string;
  sourceColumn?: string;
  sourceTable?: string;
  transformationType?: TransformationType;
  diffStatus?: SchemaDiffType;
  diffDetail?: string;
}

export interface ColumnMappingItem {
  id: string;
  sourceDb: string;
  sourceTable: string;
  sourceColumn: string;
  sourceDataType?: string;
  transformationType: TransformationType;
  transformationRule: string;
  targetDb: string;
  targetTable: string;
  targetColumn: string;
  targetDataType?: string;
  sampleBefore?: string;
  sampleAfter?: string;
  status: 'Mapped' | 'Warning' | 'Error' | 'Unmapped';
}

export interface TableMappingDefinition {
  id: string;
  mappingType: MappingType; // 'SINGLE' | 'MERGE' | 'SPLIT'
  sourceDatabases: string[];
  sourceTables: string[];
  targetDatabases: string[];
  targetTables: string[];
  title: string;
  description: string;
  columnMappings: ColumnMappingItem[];
  status: MigrationStatus;
  notes?: string;
}

export interface TableDetailsMetadata {
  id: string; // Target table ID or table key
  tableName: string;
  databaseId: string; // e.g. production_db_01
  databaseName: string;
  schema: string;
  migrationStatus: MigrationStatus;
  sourceDatabases: string[];
  sourceTables: string[];
  targetDatabases: string[];
  targetTables: string[];
  mappingType: MappingType;
  recordCount: number;
  migratedCount: number;
  failedCount: number;
  migrationTimestamp: string;
  migrationDuration?: string;
  columns: DetailedColumnSchema[];
  primaryKeys: string[];
  foreignKeys: { column: string; referencedTable: string; referencedColumn: string; cardinality?: '1-to-1' | '1-to-Many' | 'Many-to-Many' }[];
  dependsOn: string[]; // Upstream required tables
  usedBy: string[];   // Downstream dependent tables
  schemaDiffs: {
    columnName: string;
    diffType: SchemaDiffType;
    sourceDetail?: string;
    targetDetail?: string;
  }[];
}

export type RemediationCategory = 'FIXABLE' | 'DELETE_CANDIDATE' | 'BLOCKED' | 'INVESTIGATE' | 'NO_ACTION';
export type RemediationStatus = 'PENDING' | 'RUNNING' | 'STG_SUCCESS' | 'STG_FAILED' | 'PROD_SUCCESS' | 'PROD_FAILED' | 'ROLLED_BACK';

export interface EntityMetadata {
  id: string;
  name: string;
  category: EntityCategory;
  sourceDatabase: string;
  targetDatabase: string;
  sourceCount: number;
  stgCount: number;
  prodCount: number;
  failedCount: number;
  difference: number;
  migrationPct: number;
  status: MigrationStatus;
  mappingType?: MappingType;
  lastUpdated?: string;
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
  entityId: string;
  category: 'Missing Vehicle' | 'Missing FK' | 'Missing Model' | 'Missing Make' | 'Duplicate Data' | 'Orphan Records' | 'Transformation Error';
  rootCause: string;
  affectedRecords: number;
  impactDescription: string;
  severity: SeverityType;
  status: 'Open' | 'Investigating' | 'In Progress' | 'Resolved' | 'Rejected';
  owner: string;
  createdAt: string;
  vehicleId?: string;
  remediationCategory: RemediationCategory;
  evidence?: ErrorEvidence;
}

export interface AuthorAuditRecord {
  id: string;
  entityId: string;
  recordKey: string;
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
  relationshipType?: string;
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

