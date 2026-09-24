// src/data/database/index.ts
import { rawEntitySeeds } from './seedData';
import { 
  EntityMetadata, 
  TableSchema, 
  DataQualityError, 
  AuthorAuditRecord, 
  CascadeNode,
  Environment,
  RemediationJob,
  OperationAuditRecord,
  DatabaseInfo,
  TableMappingDefinition,
  TableDetailsMetadata
} from '../../types/models';

export const databases: DatabaseInfo[] = [
  {
    id: 'legacy_db_01',
    name: 'legacy_db_01 (MySQL)',
    type: 'MySQL',
    environment: 'Source',
    tableCount: 8,
    description: 'Legacy MySQL database storing legacy vehicle reference catalogs & assembly headers.'
  },
  {
    id: 'legacy_db_02',
    name: 'legacy_db_02 (PostgreSQL)',
    type: 'PostgreSQL',
    environment: 'Source',
    tableCount: 5,
    description: 'Legacy PostgreSQL database storing control systems & procedure catalogs.'
  },
  {
    id: 'prod_db_01',
    name: 'prod_db_01 (PostgreSQL)',
    type: 'PostgreSQL',
    environment: 'Target',
    tableCount: 6,
    description: 'Target production PostgreSQL database storing core vehicle reference catalogs.'
  },
  {
    id: 'prod_db_02',
    name: 'prod_db_02 (PostgreSQL)',
    type: 'PostgreSQL',
    environment: 'Target',
    tableCount: 8,
    description: 'Target production PostgreSQL database storing assembly line procedures and logs.'
  }
];

export const tableMappings: TableMappingDefinition[] = [
  {
    id: 'map-vehicles',
    mappingType: 'SPLIT',
    sourceDatabases: ['legacy_db_01'],
    sourceTables: ['LEGACY_VHCLS'],
    targetDatabases: ['prod_db_01'],
    targetTables: ['vehicles', 'vehicle_specifications'],
    title: 'Vehicle Master Table Split',
    description: 'Splits legacy monolithic vehicle table into core vehicle metadata and regional specifications.',
    status: 'Warning',
    notes: 'ERR-2967 missing parent reference anomaly affects 42,381 target rows during staging split.',
    columnMappings: [
      { id: 'cm-1', sourceDb: 'legacy_db_01', sourceTable: 'LEGACY_VHCLS', sourceColumn: 'VHC_ID', sourceDataType: 'VARCHAR(50)', transformationType: 'NORMALIZE', transformationRule: 'Prefix with "GMV-" and strip legacy plant prefix', targetDb: 'prod_db_01', targetTable: 'vehicles', targetColumn: 'vehicle_id', targetDataType: 'VARCHAR(20)', sampleBefore: 'PUNE-X7-2026', sampleAfter: 'GMV-2967', status: 'Warning' },
      { id: 'cm-2', sourceDb: 'legacy_db_01', sourceTable: 'LEGACY_VHCLS', sourceColumn: 'MDL_CD', sourceDataType: 'VARCHAR(20)', transformationType: 'LOOKUP', transformationRule: 'Foreign key lookup against models reference map', targetDb: 'prod_db_01', targetTable: 'vehicles', targetColumn: 'model_id', targetDataType: 'VARCHAR(10)', sampleBefore: 'MDL-556', sampleAfter: 'MDL-556', status: 'Mapped' },
      { id: 'cm-3', sourceDb: 'legacy_db_01', sourceTable: 'LEGACY_VHCLS', sourceColumn: 'YR', sourceDataType: 'VARCHAR(4)', transformationType: 'CAST', transformationRule: 'Cast string year to Integer', targetDb: 'prod_db_01', targetTable: 'vehicles', targetColumn: 'model_year', targetDataType: 'INT', sampleBefore: '"2026"', sampleAfter: '2026', status: 'Mapped' },
      { id: 'cm-4', sourceDb: 'legacy_db_01', sourceTable: 'LEGACY_VHCLS', sourceColumn: 'FULL_SPEC', sourceDataType: 'VARCHAR(500)', transformationType: 'SPLIT', transformationRule: 'Split spec payload into key-value attributes', targetDb: 'prod_db_01', targetTable: 'vehicle_specifications', targetColumn: 'spec_payload', targetDataType: 'JSONB', sampleBefore: 'ENGINE:V8;TRIM:LUX', sampleAfter: '{"engine":"V8"}', status: 'Mapped' }
    ]
  },
  {
    id: 'map-pcs-merge',
    mappingType: 'MERGE',
    sourceDatabases: ['legacy_db_01', 'legacy_db_01'],
    sourceTables: ['LEGACY_PCS_HDR', 'LEGACY_PCS_SYS'],
    targetDatabases: ['prod_db_02'],
    targetTables: ['pcs_systems_master'],
    title: 'PCS Header + System Table Merge',
    description: 'Merges legacy header attributes and system codes into a unified master system table.',
    status: 'Healthy',
    notes: '2 source tables combined using composite merge key (PCS_CD + SYS_CD).',
    columnMappings: [
      { id: 'cm-5', sourceDb: 'legacy_db_01', sourceTable: 'LEGACY_PCS_HDR', sourceColumn: 'PCS_CD', sourceDataType: 'VARCHAR(20)', transformationType: 'MERGE_KEY', transformationRule: 'Primary merge join key', targetDb: 'prod_db_02', targetTable: 'pcs_systems_master', targetColumn: 'pcs_id', targetDataType: 'VARCHAR(10)', sampleBefore: 'PCS-880', sampleAfter: 'PCS-880', status: 'Mapped' },
      { id: 'cm-6', sourceDb: 'legacy_db_01', sourceTable: 'LEGACY_PCS_SYS', sourceColumn: 'SYS_CD', sourceDataType: 'VARCHAR(20)', transformationType: 'DIRECT', transformationRule: 'Direct 1-to-1 mapping', targetDb: 'prod_db_02', targetTable: 'pcs_systems_master', targetColumn: 'system_id', targetDataType: 'VARCHAR(15)', sampleBefore: 'SYS-102', sampleAfter: 'SYS-102', status: 'Mapped' },
      { id: 'cm-7', sourceDb: 'legacy_db_01', sourceTable: 'LEGACY_PCS_HDR', sourceColumn: 'PCS_DESC', sourceDataType: 'VARCHAR(250)', transformationType: 'CONCAT', transformationRule: 'Concatenate header title and plant code', targetDb: 'prod_db_02', targetTable: 'pcs_systems_master', targetColumn: 'system_title', targetDataType: 'VARCHAR(200)', sampleBefore: 'Assembly Engine', sampleAfter: 'Assembly Engine (Pune)', status: 'Mapped' }
    ]
  },
  {
    id: 'map-pcs-procedures',
    mappingType: 'SINGLE',
    sourceDatabases: ['legacy_db_01'],
    sourceTables: ['LEGACY_PCS_PROC'],
    targetDatabases: ['prod_db_02'],
    targetTables: ['pcs_procedures'],
    title: 'PCS Procedures Ingestion',
    description: 'Direct ingestion with string normalization and FK lookup against subsystems.',
    status: 'Critical',
    notes: 'ERR-2967 blocks 150,610 procedures from target promotion.',
    columnMappings: [
      { id: 'cm-8', sourceDb: 'legacy_db_01', sourceTable: 'LEGACY_PCS_PROC', sourceColumn: 'PROC_CD', sourceDataType: 'VARCHAR(30)', transformationType: 'RENAME', transformationRule: 'Rename column to procedure_id', targetDb: 'prod_db_02', targetTable: 'pcs_procedures', targetColumn: 'procedure_id', targetDataType: 'VARCHAR(20)', sampleBefore: 'PROC_88092', sampleAfter: 'PROC-88092', status: 'Mapped' },
      { id: 'cm-9', sourceDb: 'legacy_db_01', sourceTable: 'LEGACY_PCS_PROC', sourceColumn: 'SUB_SYS_CD', sourceDataType: 'VARCHAR(30)', transformationType: 'LOOKUP', transformationRule: 'Foreign key reference lookup to pcs_subsystems', targetDb: 'prod_db_02', targetTable: 'pcs_procedures', targetColumn: 'subsystem_id', targetDataType: 'VARCHAR(20)', sampleBefore: 'SUB-SYS-998', sampleAfter: 'SUB-SYS-998', status: 'Error' },
      { id: 'cm-10', sourceDb: 'legacy_db_01', sourceTable: 'LEGACY_PCS_PROC', sourceColumn: 'REV_NUM', sourceDataType: 'VARCHAR(5)', transformationType: 'CAST', transformationRule: 'Cast string to Integer revision number', targetDb: 'prod_db_02', targetTable: 'pcs_procedures', targetColumn: 'revision_no', targetDataType: 'INT', sampleBefore: '"1"', sampleAfter: '1', status: 'Mapped' }
    ]
  }
];

export const getTableDetails = (entityId: string): TableDetailsMetadata => {
  const entityList = getEntities('PROD');
  const ent = entityList.find(e => e.id === entityId) || entityList[0];

  const sourceDb = ent.sourceDatabase;
  const targetDb = ent.targetDatabase;

  if (entityId === 'vehicles') {
    return {
      id: 'vehicles',
      tableName: 'vehicles',
      databaseId: targetDb,
      databaseName: 'prod_db_01 (PostgreSQL)',
      schema: 'public',
      migrationStatus: 'Warning',
      sourceDatabases: [sourceDb],
      sourceTables: ['LEGACY_VHCLS'],
      targetDatabases: [targetDb],
      targetTables: ['vehicles', 'vehicle_specifications'],
      mappingType: 'SPLIT',
      recordCount: 3500,
      migratedCount: 3418,
      failedCount: 82,
      migrationTimestamp: '2026-09-24 10:30 UTC',
      migrationDuration: '4m 12s',
      columns: [
        { name: 'vehicle_id', dataType: 'VARCHAR', length: '20', isNullable: false, isPrimaryKey: true, isForeignKey: false, sourceTable: 'LEGACY_VHCLS', sourceColumn: 'VHC_ID', transformationType: 'NORMALIZE', diffStatus: 'CHANGED', diffDetail: 'Added GMV- prefix and uppercase formatting' },
        { name: 'vin_prefix', dataType: 'VARCHAR', length: '10', isNullable: true, isPrimaryKey: false, isForeignKey: false, sourceTable: 'LEGACY_VHCLS', sourceColumn: 'VIN_PRE', transformationType: 'DIRECT', diffStatus: 'UNCHANGED' },
        { name: 'model_id', dataType: 'VARCHAR', length: '10', isNullable: false, isPrimaryKey: false, isForeignKey: true, referencedTable: 'models', referencedColumn: 'model_id', sourceTable: 'LEGACY_VHCLS', sourceColumn: 'MDL_CD', transformationType: 'LOOKUP', diffStatus: 'UNCHANGED' },
        { name: 'model_year', dataType: 'INT', isNullable: false, isPrimaryKey: false, isForeignKey: false, sourceTable: 'LEGACY_VHCLS', sourceColumn: 'YR', transformationType: 'CAST', diffStatus: 'CHANGED', diffDetail: 'Type converted from VARCHAR(4) to INT' },
        { name: 'region_id', dataType: 'VARCHAR', length: '5', isNullable: false, isPrimaryKey: false, isForeignKey: true, referencedTable: 'regions', referencedColumn: 'region_id', sourceTable: 'LEGACY_VHCLS', sourceColumn: 'REG_CD', transformationType: 'LOOKUP', diffStatus: 'UNCHANGED' },
        { name: 'created_at', dataType: 'TIMESTAMP', isNullable: false, defaultValue: 'CURRENT_TIMESTAMP()', isPrimaryKey: false, isForeignKey: false, transformationType: 'DERIVED', diffStatus: 'ADDED', diffDetail: 'New audit timestamp column added in target schema' }
      ],
      primaryKeys: ['vehicle_id'],
      foreignKeys: [
        { column: 'model_id', referencedTable: 'models', referencedColumn: 'model_id', cardinality: '1-to-Many' },
        { column: 'region_id', referencedTable: 'regions', referencedColumn: 'region_id', cardinality: '1-to-Many' }
      ],
      dependsOn: ['models', 'regions', 'years'],
      usedBy: ['pcs', 'pcs_systems', 'pcs_procedures'],
      schemaDiffs: [
        { columnName: 'created_at', diffType: 'ADDED', targetDetail: 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP()' },
        { columnName: 'model_year', diffType: 'CHANGED', sourceDetail: 'VARCHAR(4)', targetDetail: 'INT' },
        { columnName: 'LEGACY_PLANT_CD', diffType: 'REMOVED', sourceDetail: 'VARCHAR(10)' }
      ]
    };
  }

  return {
    id: ent.id,
    tableName: ent.name,
    databaseId: targetDb,
    databaseName: targetDb === 'prod_db_01' ? 'prod_db_01 (PostgreSQL)' : 'prod_db_02 (PostgreSQL)',
    schema: 'public',
    migrationStatus: ent.status,
    sourceDatabases: [sourceDb],
    sourceTables: [`LEGACY_${ent.id.toUpperCase()}`],
    targetDatabases: [targetDb],
    targetTables: [ent.id],
    mappingType: ent.mappingType || 'SINGLE',
    recordCount: ent.sourceCount,
    migratedCount: ent.prodCount,
    failedCount: ent.failedCount,
    migrationTimestamp: '2026-09-24 11:15 UTC',
    migrationDuration: '2m 45s',
    columns: [
      { name: `${ent.id.replace('_tables', '')}_id`, dataType: 'VARCHAR', length: '20', isNullable: false, isPrimaryKey: true, isForeignKey: false, sourceTable: `LEGACY_${ent.id.toUpperCase()}`, sourceColumn: 'ID', transformationType: 'DIRECT', diffStatus: 'UNCHANGED' },
      { name: 'name', dataType: 'VARCHAR', length: '150', isNullable: false, isPrimaryKey: false, isForeignKey: false, sourceTable: `LEGACY_${ent.id.toUpperCase()}`, sourceColumn: 'TITLE', transformationType: 'NORMALIZE', diffStatus: 'UNCHANGED' },
      { name: 'status', dataType: 'VARCHAR', length: '20', isNullable: false, isPrimaryKey: false, isForeignKey: false, sourceTable: `LEGACY_${ent.id.toUpperCase()}`, sourceColumn: 'STATUS_CD', transformationType: 'CASE_MAPPING', diffStatus: 'CHANGED', diffDetail: 'Status code mapped to enum' },
      { name: 'updated_at', dataType: 'TIMESTAMP', isNullable: false, defaultValue: 'CURRENT_TIMESTAMP()', isPrimaryKey: false, isForeignKey: false, transformationType: 'DERIVED', diffStatus: 'ADDED', diffDetail: 'Target audit column' }
    ],
    primaryKeys: [`${ent.id.replace('_tables', '')}_id`],
    foreignKeys: [],
    dependsOn: ent.id.includes('procedures') ? ['pcs_subsystems', 'mcs_subsystems'] : ent.id.includes('subsystems') ? ['pcs_systems', 'mcs_systems'] : [],
    usedBy: ent.id.includes('systems') ? ['pcs_subsystems', 'pcs_procedures'] : [],
    schemaDiffs: [
      { columnName: 'updated_at', diffType: 'ADDED', targetDetail: 'TIMESTAMP NOT NULL' },
      { columnName: 'status', diffType: 'CHANGED', sourceDetail: 'INT', targetDetail: 'VARCHAR(20)' }
    ]
  };
};

// Calculate entity metrics programmatically
export const getEntities = (env: Environment): EntityMetadata[] => {
  return rawEntitySeeds.map(seed => {
    let targetCount = seed.prodCount;
    if (env === 'Source') {
      targetCount = seed.sourceCount;
    } else if (env === 'STG') {
      targetCount = seed.stgCount;
    }

    const difference = seed.sourceCount - targetCount;
    const migrationPct = seed.sourceCount > 0 ? (targetCount / seed.sourceCount) * 100 : 100;
    
    // Status logic
    let status: 'Healthy' | 'Warning' | 'Critical' = 'Healthy';
    if (difference > 0) {
      if (difference > 10000 || migrationPct < 90) {
        status = 'Critical';
      } else {
        status = 'Warning';
      }
    }

    let sourceDatabase = 'legacy_db_01';
    let targetDatabase = 'prod_db_01';
    let mappingType: EntityMetadata['mappingType'] = 'SINGLE';

    if (seed.id.startsWith('mcs')) {
      sourceDatabase = 'legacy_db_02';
      targetDatabase = 'prod_db_02';
    } else if (seed.id.startsWith('pcs')) {
      sourceDatabase = 'legacy_db_01';
      targetDatabase = 'prod_db_02';
      if (seed.id === 'pcs_systems') mappingType = 'MERGE';
    } else if (seed.id === 'vehicles') {
      mappingType = 'SPLIT';
    }

    const failedCount = seed.id === 'pcs_procedures' ? 150610 : seed.id === 'mcs_procedures' ? 521878 : seed.id === 'vehicles' ? 42381 : difference;

    return {
      id: seed.id,
      name: seed.name,
      category: seed.category,
      sourceDatabase,
      targetDatabase,
      sourceCount: seed.sourceCount,
      stgCount: seed.stgCount,
      prodCount: seed.prodCount,
      failedCount,
      difference,
      migrationPct,
      status,
      mappingType,
      lastUpdated: '2026-09-24 12:45 UTC'
    };
  });
};


// Simulated schemas for core tables
export const schemas: Record<string, TableSchema> = {
  makes: {
    entityId: 'makes',
    columns: [
      { name: 'make_id', dataType: 'VARCHAR(10)', isNullable: false, isPrimaryKey: true, isForeignKey: false },
      { name: 'make_name', dataType: 'VARCHAR(100)', isNullable: false, isPrimaryKey: false, isForeignKey: false },
      { name: 'created_by', dataType: 'VARCHAR(50)', isNullable: false, isPrimaryKey: false, isForeignKey: false },
      { name: 'created_at', dataType: 'TIMESTAMP', isNullable: false, isPrimaryKey: false, isForeignKey: false }
    ],
    primaryKeys: ['make_id'],
    foreignKeys: [],
    upstreamDeps: [],
    downstreamDeps: ['models'],
    mappingRules: [
      { sourceTable: 'LEGACY_MKS', sourceColumn: 'MK_CD', targetColumn: 'make_id', transformationRule: 'Trim whitespace and convert to lowercase' },
      { sourceTable: 'LEGACY_MKS', sourceColumn: 'MK_DESC', targetColumn: 'make_name', transformationRule: 'Map directly' }
    ]
  },
  models: {
    entityId: 'models',
    columns: [
      { name: 'model_id', dataType: 'VARCHAR(10)', isNullable: false, isPrimaryKey: true, isForeignKey: false },
      { name: 'model_name', dataType: 'VARCHAR(100)', isNullable: false, isPrimaryKey: false, isForeignKey: false },
      { name: 'make_id', dataType: 'VARCHAR(10)', isNullable: false, isPrimaryKey: false, isForeignKey: true, referencedTable: 'makes', referencedColumn: 'make_id' },
      { name: 'created_at', dataType: 'TIMESTAMP', isNullable: false, isPrimaryKey: false, isForeignKey: false }
    ],
    primaryKeys: ['model_id'],
    foreignKeys: [{ column: 'make_id', referencedTable: 'makes', referencedColumn: 'make_id' }],
    upstreamDeps: ['makes'],
    downstreamDeps: ['vehicles'],
    mappingRules: [
      { sourceTable: 'LEGACY_MDLS', sourceColumn: 'MDL_CD', targetColumn: 'model_id', transformationRule: 'Format as MDL-XX' },
      { sourceTable: 'LEGACY_MDLS', sourceColumn: 'MDL_NAME', targetColumn: 'model_name', transformationRule: 'Title case standard' },
      { sourceTable: 'LEGACY_MDLS', sourceColumn: 'MK_CD', targetColumn: 'make_id', transformationRule: 'Lookup from makes mapping' }
    ]
  },
  vehicles: {
    entityId: 'vehicles',
    columns: [
      { name: 'vehicle_id', dataType: 'VARCHAR(20)', isNullable: false, isPrimaryKey: true, isForeignKey: false },
      { name: 'vin_prefix', dataType: 'VARCHAR(10)', isNullable: true, isPrimaryKey: false, isForeignKey: false },
      { name: 'model_id', dataType: 'VARCHAR(10)', isNullable: false, isPrimaryKey: false, isForeignKey: true, referencedTable: 'models', referencedColumn: 'model_id' },
      { name: 'model_year', dataType: 'INT', isNullable: false, isPrimaryKey: false, isForeignKey: false },
      { name: 'region_id', dataType: 'VARCHAR(5)', isNullable: false, isPrimaryKey: false, isForeignKey: true, referencedTable: 'regions', referencedColumn: 'region_id' }
    ],
    primaryKeys: ['vehicle_id'],
    foreignKeys: [
      { column: 'model_id', referencedTable: 'models', referencedColumn: 'model_id' },
      { column: 'region_id', referencedTable: 'regions', referencedColumn: 'region_id' }
    ],
    upstreamDeps: ['models', 'regions'],
    downstreamDeps: ['pcs'],
    mappingRules: [
      { sourceTable: 'LEGACY_VHCLS', sourceColumn: 'VHC_ID', targetColumn: 'vehicle_id', transformationRule: 'Prefix with GMV-' },
      { sourceTable: 'LEGACY_VHCLS', sourceColumn: 'MDL_CD', targetColumn: 'model_id', transformationRule: 'Lookup reference map' },
      { sourceTable: 'LEGACY_VHCLS', sourceColumn: 'YR', targetColumn: 'model_year', transformationRule: 'Cast to Integer' }
    ]
  },
  pcs: {
    entityId: 'pcs',
    columns: [
      { name: 'pcs_id', dataType: 'VARCHAR(10)', isNullable: false, isPrimaryKey: true, isForeignKey: false },
      { name: 'pcs_title', dataType: 'VARCHAR(200)', isNullable: false, isPrimaryKey: false, isForeignKey: false },
      { name: 'vehicle_id', dataType: 'VARCHAR(20)', isNullable: false, isPrimaryKey: false, isForeignKey: true, referencedTable: 'vehicles', referencedColumn: 'vehicle_id' },
      { name: 'status', dataType: 'VARCHAR(20)', isNullable: false, isPrimaryKey: false, isForeignKey: false }
    ],
    primaryKeys: ['pcs_id'],
    foreignKeys: [{ column: 'vehicle_id', referencedTable: 'vehicles', referencedColumn: 'vehicle_id' }],
    upstreamDeps: ['vehicles'],
    downstreamDeps: ['pcs_systems'],
    mappingRules: [
      { sourceTable: 'LEGACY_PCS_HDR', sourceColumn: 'PCS_CD', targetColumn: 'pcs_id', transformationRule: 'Direct map' },
      { sourceTable: 'LEGACY_PCS_HDR', sourceColumn: 'PCS_DESC', targetColumn: 'pcs_title', transformationRule: 'Trim trailing spaces' },
      { sourceTable: 'LEGACY_PCS_HDR', sourceColumn: 'V_ID', targetColumn: 'vehicle_id', transformationRule: 'Lookup from GMV mapping table' }
    ]
  },
  pcs_systems: {
    entityId: 'pcs_systems',
    columns: [
      { name: 'system_id', dataType: 'VARCHAR(15)', isNullable: false, isPrimaryKey: true, isForeignKey: false },
      { name: 'system_name', dataType: 'VARCHAR(100)', isNullable: false, isPrimaryKey: false, isForeignKey: false },
      { name: 'pcs_id', dataType: 'VARCHAR(10)', isNullable: false, isPrimaryKey: false, isForeignKey: true, referencedTable: 'pcs', referencedColumn: 'pcs_id' }
    ],
    primaryKeys: ['system_id'],
    foreignKeys: [{ column: 'pcs_id', referencedTable: 'pcs', referencedColumn: 'pcs_id' }],
    upstreamDeps: ['pcs'],
    downstreamDeps: ['pcs_subsystems'],
    mappingRules: [
      { sourceTable: 'LEGACY_PCS_SYS', sourceColumn: 'SYS_CD', targetColumn: 'system_id', transformationRule: 'Format with system group standard' },
      { sourceTable: 'LEGACY_PCS_SYS', sourceColumn: 'PCS_CD', targetColumn: 'pcs_id', transformationRule: 'Direct map' }
    ]
  },
  pcs_subsystems: {
    entityId: 'pcs_subsystems',
    columns: [
      { name: 'subsystem_id', dataType: 'VARCHAR(20)', isNullable: false, isPrimaryKey: true, isForeignKey: false },
      { name: 'subsystem_name', dataType: 'VARCHAR(100)', isNullable: false, isPrimaryKey: false, isForeignKey: false },
      { name: 'system_id', dataType: 'VARCHAR(15)', isNullable: false, isPrimaryKey: false, isForeignKey: true, referencedTable: 'pcs_systems', referencedColumn: 'system_id' }
    ],
    primaryKeys: ['subsystem_id'],
    foreignKeys: [{ column: 'system_id', referencedTable: 'pcs_systems', referencedColumn: 'system_id' }],
    upstreamDeps: ['pcs_systems'],
    downstreamDeps: ['pcs_procedures'],
    mappingRules: [
      { sourceTable: 'LEGACY_PCS_SUBSYS', sourceColumn: 'SUB_SYS_CD', targetColumn: 'subsystem_id', transformationRule: 'Format with system group standard' },
      { sourceTable: 'LEGACY_PCS_SUBSYS', sourceColumn: 'SYS_CD', targetColumn: 'system_id', transformationRule: 'Direct map' }
    ]
  },
  pcs_procedures: {
    entityId: 'pcs_procedures',
    columns: [
      { name: 'procedure_id', dataType: 'VARCHAR(20)', isNullable: false, isPrimaryKey: true, isForeignKey: false },
      { name: 'procedure_title', dataType: 'TEXT', isNullable: false, isPrimaryKey: false, isForeignKey: false },
      { name: 'subsystem_id', dataType: 'VARCHAR(20)', isNullable: false, isPrimaryKey: false, isForeignKey: true, referencedTable: 'pcs_subsystems', referencedColumn: 'subsystem_id' },
      { name: 'revision_no', dataType: 'INT', isNullable: false, isPrimaryKey: false, isForeignKey: false }
    ],
    primaryKeys: ['procedure_id'],
    foreignKeys: [{ column: 'subsystem_id', referencedTable: 'pcs_subsystems', referencedColumn: 'subsystem_id' }],
    upstreamDeps: ['pcs_subsystems'],
    downstreamDeps: [],
    mappingRules: [
      { sourceTable: 'LEGACY_PCS_PROC', sourceColumn: 'PROC_CD', targetColumn: 'procedure_id', transformationRule: 'Normalize code' },
      { sourceTable: 'LEGACY_PCS_PROC', sourceColumn: 'SUB_SYS_CD', targetColumn: 'subsystem_id', transformationRule: 'Direct map' },
      { sourceTable: 'LEGACY_PCS_PROC', sourceColumn: 'REV_NUM', targetColumn: 'revision_no', transformationRule: 'Map directly' }
    ]
  }
};

// Add fallback schemas for MCS tables dynamically
rawEntitySeeds.forEach(seed => {
  if (!schemas[seed.id]) {
    schemas[seed.id] = {
      entityId: seed.id,
      columns: [
        { name: `${seed.id.replace('_tables', '')}_id`, dataType: 'VARCHAR(15)', isNullable: false, isPrimaryKey: true, isForeignKey: false },
        { name: 'name', dataType: 'VARCHAR(150)', isNullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: 'updated_by', dataType: 'VARCHAR(50)', isNullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: 'updated_at', dataType: 'TIMESTAMP', isNullable: false, isPrimaryKey: false, isForeignKey: false }
      ],
      primaryKeys: [`${seed.id.replace('_tables', '')}_id`],
      foreignKeys: [],
      upstreamDeps: [],
      downstreamDeps: [],
      mappingRules: [
        { sourceTable: `LEGACY_${seed.id.toUpperCase()}`, sourceColumn: 'SRC_ID', targetColumn: `${seed.id.replace('_tables', '')}_id`, transformationRule: 'Trim whitespace' },
        { sourceTable: `LEGACY_${seed.id.toUpperCase()}`, sourceColumn: 'NAME', targetColumn: 'name', transformationRule: 'Direct map' }
      ]
    };
  }
});

// Seed data-quality errors with details, categories and evidence objects
export const initialErrors: DataQualityError[] = [
  {
    id: 'ERR-2967',
    entityId: 'pcs_procedures',
    category: 'Missing Vehicle',
    rootCause: 'Vehicle record 2967 failed to pass staging data-validation rules due to missing regional year constraints, creating orphaned downstream links.',
    affectedRecords: 150610,
    impactDescription: 'If corrected, 73 PCS headers, 1,298 PCS Systems, 5,126 PCS Subsystems, and 150,610 PCS procedures will be linked to the active production model catalog and published.',
    severity: 'High',
    status: 'Open',
    owner: 'Alex Rivera (Data Engineer)',
    createdAt: '2026-08-01',
    vehicleId: 'Vehicle 2967',
    remediationCategory: 'FIXABLE',
    evidence: {
      rootRecord: 'GMV-2967',
      rootTable: 'vehicles',
      missingReferenceTable: 'vehicles',
      missingReferenceColumn: 'vehicle_id',
      expectedReference: 'GMV-2967',
      actualReference: '—',
      upstreamCount: 73,
      downstreamCount: 150610,
      explanation: 'Vehicle code reference GMV-2967 exists in child PCS headers and cascade relations, but is missing in the primary Reference catalog. Remediation will inject the matching vehicle reference row into the database, re-linking 156,927 total downstream records.'
    }
  },
  {
    id: 'ERR-1713',
    entityId: 'pcs_systems',
    category: 'Missing Vehicle',
    rootCause: 'Vehicle mapping model 1713 has duplicate configurations in legacy schema (LEGACY_VHCLS), halting ingestion of downstream systems.',
    affectedRecords: 1298,
    impactDescription: 'Resolves duplicate configuration validation check, enabling ingestion of 18 systems and 88 sub-records.',
    severity: 'High',
    status: 'Investigating',
    owner: 'Sarah Connor (Data Architect)',
    createdAt: '2026-08-04',
    vehicleId: 'Vehicle 1713',
    remediationCategory: 'FIXABLE',
    evidence: {
      rootRecord: 'GMV-1713',
      rootTable: 'vehicles',
      upstreamCount: 18,
      downstreamCount: 1298,
      explanation: 'Multiple entries exist for GMV-1713. System recommends merging configurations using the canonical reference key configuration.'
    }
  },
  {
    id: 'ERR-1750',
    entityId: 'vehicles',
    category: 'Missing Vehicle',
    rootCause: 'Vehicle 1750 referenced legacy make Code "GEN" that was excluded from the master Make reference table mapping filter rules.',
    affectedRecords: 0,
    impactDescription: 'Vehicle record has 0 dependent child records in MCS or PCS. It represents an obsolete legacy testing artifact.',
    severity: 'Medium',
    status: 'Open',
    owner: 'Marcus Aurelius (Data Quality)',
    createdAt: '2026-08-05',
    vehicleId: 'Vehicle 1750',
    remediationCategory: 'DELETE_CANDIDATE',
    evidence: {
      rootRecord: 'GMV-1750',
      rootTable: 'vehicles',
      upstreamCount: 0,
      downstreamCount: 0,
      explanation: 'The vehicle row GMV-1750 is an orphaned entry. It has no associated PCS procedures, systems, or MCS dependencies. It is safe to delete from target tables.'
    }
  },
  {
    id: 'ERR-3091',
    entityId: 'mcs_procedures',
    category: 'Orphan Records',
    rootCause: 'MCS Legacy procedures referenced MCS System "MCS-SYS-99" which was deleted in legacy DB but remains in procedural drafts.',
    affectedRecords: 521878,
    impactDescription: 'Links 521,878 procedures back to correct active parent. Currently listed as unassociated draft entries.',
    severity: 'High',
    status: 'Open',
    owner: 'Alex Rivera (Data Engineer)',
    createdAt: '2026-08-02',
    remediationCategory: 'BLOCKED',
    evidence: {
      rootRecord: 'MCS-SYS-99',
      rootTable: 'mcs_systems',
      upstreamCount: 0,
      downstreamCount: 521878,
      explanation: 'Deletion is BLOCKED. 521,878 procedure records reference this parent node. Direct deletion will break referential integrity constraints across mcs_procedures.'
    }
  },
  {
    id: 'ERR-4022',
    entityId: 'models',
    category: 'Missing Model',
    rootCause: 'Legacy models (MDL-556 through MDL-573) are missing valid Make references.',
    affectedRecords: 17,
    impactDescription: 'Links 17 models to their respective manufacturers. Ensures consistency in Vehicle selector checklists.',
    severity: 'Medium',
    status: 'Resolved',
    owner: 'Diana Prince (Author)',
    createdAt: '2026-08-07',
    remediationCategory: 'FIXABLE'
  },
  {
    id: 'ERR-5011',
    entityId: 'pcs',
    category: 'Duplicate Data',
    rootCause: 'Legacy schema mapping script ingested redundant regional entries for 4 PCS system records during staging translation.',
    affectedRecords: 4,
    impactDescription: 'Deduplicates records in PROD environment to prevent index collisions.',
    severity: 'Low',
    status: 'Resolved',
    owner: 'Bruce Wayne (Data Engineer)',
    createdAt: '2026-08-09',
    remediationCategory: 'FIXABLE'
  },
  {
    id: 'ERR-6019',
    entityId: 'mcs_procedures',
    category: 'Transformation Error',
    rootCause: 'Character encoding conflict (UTF-8 mismatch on bullet points) rejected procedures during export to PROD.',
    affectedRecords: 15400,
    impactDescription: 'Enables migration of remaining procedures once formatting is sanitized.',
    severity: 'Medium',
    status: 'Open',
    owner: 'Clark Kent (Data Architect)',
    createdAt: '2026-08-10',
    remediationCategory: 'INVESTIGATE',
    evidence: {
      rootRecord: 'MCS-PROC-ENC',
      rootTable: 'mcs_procedures',
      upstreamCount: 0,
      downstreamCount: 15400,
      explanation: 'Unicode UTF-8 decoding exceptions thrown. Formatting symbols do not match DB specifications. Requires investigation.'
    }
  }
];

// Seed author modification records (Original -> Migrated -> Current)
export const initialAuditRecords: AuthorAuditRecord[] = [
  {
    id: 'AUD-001',
    entityId: 'pcs_procedures',
    recordKey: 'PROC-99812',
    field: 'procedure_title',
    originalValue: 'ENG OVERHAUL - V8 L87 LUBRICATION FLUSH (LEGACY)',
    migratedValue: 'ENG OVERHAUL - V8 L87 LUBRICATION FLUSH',
    currentValue: 'Engine Overhaul - 6.2L V8 L87 Lubrication System Flush Procedure',
    changedBy: 'Diana Prince (Author)',
    changedAt: '2026-08-11T14:32:00Z',
    reason: 'Updated to conform to new global GM service branding terms and clarify engine displacement specification.',
    changeType: 'Updated',
    status: 'Approved',
    timeline: [
      { stage: 'Migration', timestamp: '2026-08-01T08:00:00Z', details: 'Ingested from legacy DB schema to STG.' },
      { stage: 'Author Change', timestamp: '2026-08-11T14:32:00Z', user: 'Diana Prince (Author)', details: 'Modified text value in draft tables.' },
      { stage: 'Review', timestamp: '2026-08-11T16:00:00Z', user: 'Marcus Aurelius (Data Quality)', details: 'Passed automatic spellcheck and format validation.' },
      { stage: 'Approval', timestamp: '2026-08-12T09:15:00Z', user: 'Sarah Connor (Lead QA)', details: 'Approved revision for publication.' },
      { stage: 'Publication', timestamp: '2026-08-12T10:00:00Z', details: 'Pushed to PROD tables.' }
    ]
  },
  {
    id: 'AUD-002',
    entityId: 'pcs_procedures',
    recordKey: 'PROC-77621',
    field: 'subsystem_id',
    originalValue: 'SUB-SYS-998',
    migratedValue: 'SUB-SYS-998',
    currentValue: 'SUB-SYS-1024',
    changedBy: 'Clark Kent (Author)',
    changedAt: '2026-08-12T11:20:00Z',
    reason: 'Incorrect legacy subsystem classification. Re-associated to the active electrical distribution module.',
    changeType: 'Updated',
    status: 'Pending',
    timeline: [
      { stage: 'Migration', timestamp: '2026-08-01T08:00:00Z', details: 'Ingested into staging database.' },
      { stage: 'Author Change', timestamp: '2026-08-12T11:20:00Z', user: 'Clark Kent (Author)', details: 'Updated foreign key reference.' },
      { stage: 'Review', timestamp: '2026-08-12T11:25:00Z', user: 'System Validator', details: 'Valid referencing key confirmed. Queueing for approval.' }
    ]
  }
];

// Seeded remediation pipeline jobs (STG -> PROD timeline status)
export const initialRemediationJobs: RemediationJob[] = [
  {
    id: 'REM-001',
    errorIds: ['ERR-5011'],
    action: 'FIX',
    status: 'PROD_SUCCESS',
    requestedBy: 'A. Howard (Admin)',
    requestedAt: '2026-08-11T09:00:00Z',
    reason: 'Deduplicate regional entries for target PCS configuration keys',
    stgValidationResult: {
      success: true,
      logs: ['Running constraints validator...', 'No orphan checks violated', 'Deduplication execution succeeded in STG'],
      recordsUpdated: 4,
      errorCountBefore: 7,
      errorCountAfter: 6
    },
    prodExecutionResult: {
      success: true,
      executedAt: '2026-08-11T10:15:00Z',
      recordsUpdated: 4,
      logs: ['Initiating PROD commit...', 'Writing transactions...', 'Verification checks passed']
    }
  }
];

// Operational audit logger history (snapshot records)
export const initialOperationAudits: OperationAuditRecord[] = [
  {
    id: 'OP-001',
    remediationId: 'REM-001',
    timestamp: '2026-08-11T10:15:00Z',
    action: 'DEDUPLICATE',
    environment: 'PROD',
    affectedTable: 'pcs',
    beforeStateSummary: '4 Duplicate regional code records in target production mappings',
    afterStateSummary: 'Removed 4 duplicate rows, set unique reference key checks',
    reason: 'Clean key overlaps blocking master index publishing rules',
    operator: 'A. Howard (Admin)',
    affectedRecords: 4
  }
];

// Cascade analysis graph generators
export const getCascadeGraph = (rootCauseId: string): { nodes: CascadeNode[], amplification: number } => {
  // Currently supporting ERR-2967 (Vehicle 2967) cascade
  if (rootCauseId === 'ERR-2967') {
    const nodes: CascadeNode[] = [
      { id: 'root', name: 'Vehicle 2967', category: 'Root', affectedCount: 73, impactPct: 2.1, severity: 'High', relationshipType: 'Parent Reference Node' },
      { id: 'pcs', name: '73 PCS', category: 'PCS', affectedCount: 73, impactPct: 1.96, severity: 'High', relationshipType: '1-to-Many Mappings' },
      { id: 'pcs_systems', name: '1,298 PCS Systems', category: 'PCS', affectedCount: 1298, impactPct: 3.04, severity: 'High', relationshipType: '1-to-Many Mappings' },
      { id: 'pcs_subsystems', name: '5,126 PCS Subsystems', category: 'PCS', affectedCount: 5126, impactPct: 2.34, severity: 'High', relationshipType: '1-to-Many Mappings' },
      { id: 'pcs_procedures', name: '150,610 PCS Procedures', category: 'PCS', affectedCount: 150610, impactPct: 1.68, severity: 'High', relationshipType: 'Terminal Cascade Leaf' }
    ];
    // Calculation: 150,610 / 73 = 2,063x
    const amplification = 150610 / 73;
    return { nodes, amplification };
  }

  // Fallbacks for other vehicle errors
  if (rootCauseId === 'ERR-1713') {
    return {
      nodes: [
        { id: 'root', name: 'Vehicle 1713', category: 'Root', affectedCount: 18, impactPct: 0.52, severity: 'High', relationshipType: 'Duplicate Group Master' },
        { id: 'pcs_systems', name: '18 PCS Systems', category: 'PCS', affectedCount: 18, impactPct: 0.04, severity: 'High', relationshipType: '1-to-Many Mappings' },
        { id: 'pcs_subsystems', name: '88 PCS Subsystems', category: 'PCS', affectedCount: 88, impactPct: 0.04, severity: 'High', relationshipType: '1-to-Many Mappings' },
        { id: 'pcs_procedures', name: '1,298 PCS Procedures', category: 'PCS', affectedCount: 1298, impactPct: 0.01, severity: 'Medium', relationshipType: 'Terminal Leaf' }
      ],
      amplification: 1298 / 18
    };
  }

  if (rootCauseId === 'ERR-1750') {
    return {
      nodes: [
        { id: 'root', name: 'Vehicle 1750', category: 'Root', affectedCount: 1, impactPct: 0.02, severity: 'Medium', relationshipType: 'Orphaned Reference' },
        { id: 'makes', name: '5 Makes', category: 'Reference', affectedCount: 5, impactPct: 17.8, severity: 'Medium', relationshipType: 'Mismatched Lookups' },
        { id: 'models', name: '12 Models', category: 'Reference', affectedCount: 12, impactPct: 2.09, severity: 'Medium', relationshipType: 'Terminal Leaf' }
      ],
      amplification: 12 / 1
    };
  }

  // Generic fallback if empty or missing
  return {
    nodes: [
      { id: 'root', name: 'Generic Source Node', category: 'Root', affectedCount: 1, impactPct: 0, severity: 'Low', relationshipType: 'Standalone' },
      { id: 'pcs_procedures', name: 'Procedures Impact', category: 'PCS', affectedCount: 0, impactPct: 0, severity: 'Healthy', relationshipType: 'Terminal Leaf' }
    ],
    amplification: 0
  };
};
