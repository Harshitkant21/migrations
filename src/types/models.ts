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

// -------------------------------------------------------------
// V0 PLATFORM JOURNEY TYPES
// -------------------------------------------------------------

export type WorkspaceStep = 
  | 'setup' 
  | 'discovery' 
  | 'definition' 
  | 'mapping' 
  | 'validation' 
  | 'execution' 
  | 'dashboard' 
  | 'report';

export type DashboardSubTab = 
  | 'overview' 
  | 'status' 
  | 'mapping_view' 
  | 'details';

export interface DatabaseConnectionCard {
  id: string;
  name: string;
  type: 'PostgreSQL' | 'MySQL' | 'Oracle' | 'SQL Server' | 'Other';
  status: 'Connected' | 'Ready' | 'Testing' | 'Failed';
  host: string;
  port: number;
  database: string;
  username: string;
  ssl: boolean;
  connectionString?: string;
  schemaCount: number;
  tableCount: number;
  isSource: boolean;
}

export type MigrationIntentType = 
  | 'Full migration' 
  | 'Partial migration' 
  | 'Schema only' 
  | 'Data only' 
  | 'Schema + Data';

export type TargetEnvironmentType = 
  | 'Development' 
  | 'Staging' 
  | 'Production';

export interface MigrationIntent {
  migrationType: MigrationIntentType;
  environment: TargetEnvironmentType;
  objective: string;
  notes: string;
}

export interface MigrationConstraints {
  downtimeRequirement: string;
  dataTransformationRequired: boolean;
  dataMaskingRequired: boolean;
  validationLevel: 'Basic' | 'Standard' | 'Strict (Row-by-row + Checksum)';
  migrationWindow: string;
}

export interface DiscoveredTable {
  id: string;
  name: string;
  schema: string;
  rows: number;
  columnCount: number;
  primaryKey: string;
  foreignKeyCount: number;
  indexCount: number;
  status: 'VERIFIED' | 'NEEDS_REVIEW' | 'INVALID';
  isIncluded: boolean;
  columnsList?: {
    name: string;
    dataType: string;
    isPk: boolean;
    isFk: boolean;
    isNullable: boolean;
  }[];
}

export interface ImpactAnalysisMetrics {
  totalTables: number;
  totalRecords: string;
  totalSchemas: number;
  totalColumns: number;
  totalIndexes: number;
  totalForeignKeys: number;
  directMappings: number;
  transformations: number;
  tableSplits: number;
  tableMerges: number;
  potentialConflicts: number;
}

export interface TargetColumnDef {
  name: string;
  dataType: string;
  length?: string;
  isNullable: boolean;
  defaultValue?: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  referencedTable?: string;
  referencedColumn?: string;
  isUnique: boolean;
  hasCheck: boolean;
  checkExpr?: string;
  indexes: string[];
}

export interface TargetTableDef {
  id: string;
  schema: string;
  name: string;
  columns: TargetColumnDef[];
  isCustom: boolean;
  ddlPreview?: string;
}

export type ValidationSeverity = 'Critical' | 'Warning' | 'Passed';

export interface ValidationIssue {
  id: string;
  title: string;
  description: string;
  domain: 'Schema' | 'Mapping' | 'Transformation' | 'Constraint' | 'Data Quality';
  severity: ValidationSeverity;
  entity: string;
  remediation: string;
  isResolved: boolean;
}

export interface ExecutionActivity {
  id: string;
  table: string;
  stage: 'Extracting' | 'Transforming' | 'Validating' | 'Loading';
  detail: string;
  status: 'active' | 'completed' | 'warning' | 'error';
  progressPct: number;
}

export interface MigrationLogEntry {
  id: string;
  timestamp: string;
  table: string;
  step: 'Extracting' | 'Transforming' | 'Validating' | 'Loading';
  status: 'success' | 'warning' | 'error';
  message: string;
}

export interface PreviousMigration {
  id: string;
  title: string;
  source: string;
  target: string;
  tables: number;
  records: string;
  status: 'Completed' | 'Completed with Warnings' | 'Failed';
  completedAt: string;
  health: number;
  type: string;
  environment: string;
}


