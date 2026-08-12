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
  OperationAuditRecord
} from '../../types/models';

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

    return {
      id: seed.id,
      name: seed.name,
      category: seed.category,
      sourceCount: seed.sourceCount,
      stgCount: seed.stgCount,
      prodCount: seed.prodCount,
      difference,
      migrationPct,
      status
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
