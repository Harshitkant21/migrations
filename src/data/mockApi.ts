// src/data/mockApi.ts
import { 
  getEntities, 
  schemas, 
  initialErrors, 
  initialAuditRecords, 
  getCascadeGraph,
  initialRemediationJobs,
  initialOperationAudits
} from './database';
import { 
  EntityMetadata, 
  TableSchema, 
  DataQualityError, 
  AuthorAuditRecord, 
  CascadeNode,
  Environment,
  ImpactPreviewResult,
  RemediationJob,
  OperationAuditRecord
} from '../types/models';

// Mutable in-memory DB instances simulating backend tables
let errorsDb = [...initialErrors];
let auditsDb = [...initialAuditRecords];
let jobsDb = [...initialRemediationJobs];
let operationAuditsDb = [...initialOperationAudits];

const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // Fetch entities based on database environment selection
  getEntities: async (env: Environment): Promise<EntityMetadata[]> => {
    await delay(200);
    // If some errors are resolved in memory, we update the counts programmatically!
    const baseEntities = getEntities(env);
    
    // Simulate count adjustments if errors are resolved
    return baseEntities.map(ent => {
      const resolvedErrors = errorsDb.filter(e => e.entityId === ent.id && e.status === 'Resolved');
      
      let prodCount = ent.prodCount;
      if (resolvedErrors.length > 0) {
        // Adjust counts: e.g. ERR-2967 resolution adds 150610 records to PROD
        resolvedErrors.forEach(err => {
          if (err.id === 'ERR-2967' && env === 'PROD') {
            prodCount += 150610;
          }
          if (err.id === 'ERR-1713' && env === 'PROD') {
            prodCount += 1298;
          }
          if (err.id === 'ERR-4022' && env === 'PROD') {
            prodCount += 17;
          }
        });
      }

      const difference = ent.sourceCount - prodCount;
      const migrationPct = ent.sourceCount > 0 ? (prodCount / ent.sourceCount) * 100 : 100;
      
      let status = ent.status;
      if (difference === 0) status = 'Healthy';
      else if (difference > 10000 || migrationPct < 90) status = 'Critical';
      else status = 'Warning';

      return {
        ...ent,
        prodCount,
        difference,
        migrationPct,
        status
      };
    });
  },

  // Fetch individual entity details
  getEntity: async (env: Environment, id: string): Promise<EntityMetadata | undefined> => {
    await delay(100);
    const entities = await mockApi.getEntities(env);
    return entities.find(e => e.id === id);
  },

  // Fetch columns, keys, dependencies and transformations for a table
  getSchema: async (entityId: string): Promise<TableSchema | undefined> => {
    await delay(150);
    return schemas[entityId];
  },

  // Fetch validation error lists with optional category/status filters
  getErrors: async (filters?: {
    entityId?: string;
    category?: string;
    severity?: string;
    status?: string;
    remediationCategory?: string;
  }): Promise<DataQualityError[]> => {
    await delay(250);
    let results = [...errorsDb];
    if (filters) {
      if (filters.entityId) {
        results = results.filter(e => e.entityId === filters.entityId);
      }
      if (filters.category) {
        results = results.filter(e => e.category === filters.category);
      }
      if (filters.severity) {
        results = results.filter(e => e.severity === filters.severity);
      }
      if (filters.status) {
        results = results.filter(e => e.status === filters.status);
      }
      if (filters.remediationCategory) {
        results = results.filter(e => e.remediationCategory === filters.remediationCategory);
      }
    }
    return results;
  },

  // Fetch individual error details
  getError: async (id: string): Promise<DataQualityError | undefined> => {
    await delay(100);
    return errorsDb.find(e => e.id === id);
  },

  // Update error status (e.g. In Progress, Resolved)
  updateErrorStatus: async (id: string, status: DataQualityError['status']): Promise<DataQualityError | undefined> => {
    await delay(150);
    const err = errorsDb.find(e => e.id === id);
    if (err) {
      err.status = status;
    }
    return err;
  },

  // Fetch cascade data propagation nodes
  getCascadeData: async (errorId: string): Promise<{ nodes: CascadeNode[], amplification: number }> => {
    await delay(200);
    return getCascadeGraph(errorId);
  },

  // Fetch authoring audits and history
  getAuthorChanges: async (entityId?: string): Promise<AuthorAuditRecord[]> => {
    await delay(150);
    if (entityId) {
      return auditsDb.filter(a => a.entityId === entityId);
    }
    return auditsDb;
  },

  // Submit a new draft modification (Authoring Change)
  createAuthorChange: async (
    change: Omit<AuthorAuditRecord, 'id' | 'changedAt' | 'timeline' | 'status'>
  ): Promise<AuthorAuditRecord> => {
    await delay(200);
    const newId = `AUD-${String(auditsDb.length + 1).padStart(3, '0')}`;
    const timestamp = new Date().toISOString();
    
    const newRecord: AuthorAuditRecord = {
      ...change,
      id: newId,
      changedAt: timestamp,
      status: 'Pending',
      timeline: [
        { stage: 'Migration', timestamp: '2026-08-01T08:00:00Z', details: 'Legacy value migrated to staging.' },
        { stage: 'Author Change', timestamp, user: change.changedBy, details: `Value modified by author: "${change.currentValue}".` },
        { stage: 'Review', timestamp, user: 'Validator', details: 'Awaiting administrator verification.' }
      ]
    };
    
    auditsDb = [newRecord, ...auditsDb];
    return newRecord;
  },

  // Action to approve or reject a change
  updateAuditStatus: async (id: string, status: AuthorAuditRecord['status']): Promise<AuthorAuditRecord | undefined> => {
    await delay(150);
    const record = auditsDb.find(r => r.id === id);
    if (record) {
      record.status = status;
      const stage = status === 'Approved' ? 'Approval' : 'Review';
      record.timeline.push({
        stage,
        timestamp: new Date().toISOString(),
        user: 'Sarah Connor (Lead QA)',
        details: `Record update status marked as ${status}.`
      });

      if (status === 'Approved') {
        record.timeline.push({
          stage: 'Publication',
          timestamp: new Date().toISOString(),
          details: 'Pushed to target production tables.'
        });
      }
    }
    return record;
  },

  // GET /api/remediation/preview - Simulates downstream impact preview before execution
  getImpactPreview: async (errorIds: string[], action: 'FIX' | 'DELETE' | 'RESTORE' | 'RELINK' | 'UPDATE'): Promise<ImpactPreviewResult> => {
    await delay(300);
    
    let totalDownstreamImpact = 0;
    let errorsResolvedCount = 0;
    let errorsCreatedCount = 0;
    let migrationDiffBefore = 0;
    let migrationDiffAfter = 0;
    let riskLevel: ImpactPreviewResult['riskLevel'] = 'LOW';
    let canExecute = true;
    const blockingReasons: string[] = [];
    const affectedTablesMap: Record<string, number> = {};

    errorIds.forEach(id => {
      const err = errorsDb.find(e => e.id === id);
      if (!err) return;

      errorsResolvedCount++;

      // Check specific scenarios
      if (err.id === 'ERR-2967') {
        // Vehicle 2967 missing references
        if (action === 'FIX') {
          affectedTablesMap['pcs'] = (affectedTablesMap['pcs'] || 0) + 73;
          affectedTablesMap['pcs_systems'] = (affectedTablesMap['pcs_systems'] || 0) + 1298;
          affectedTablesMap['pcs_subsystems'] = (affectedTablesMap['pcs_subsystems'] || 0) + 5126;
          affectedTablesMap['pcs_procedures'] = (affectedTablesMap['pcs_procedures'] || 0) + 150610;
          totalDownstreamImpact += 156927;
          migrationDiffBefore += 150610;
          if (riskLevel !== 'CRITICAL') riskLevel = 'HIGH';
        } else if (action === 'DELETE') {
          // Unsafe delete attempt
          canExecute = false;
          riskLevel = 'CRITICAL';
          blockingReasons.push(`Deletion is BLOCKED. Vehicle 2967 has 156,927 active downstream records in PCS hierarchy. Deleting it will trigger cascading violations.`);
        }
      } else if (err.id === 'ERR-1750') {
        // Orphan delete candidate
        if (action === 'DELETE') {
          affectedTablesMap['vehicles'] = (affectedTablesMap['vehicles'] || 0) + 1;
          totalDownstreamImpact += 1;
        }
      } else if (err.id === 'ERR-1713') {
        // Duplicate config fix
        if (action === 'FIX') {
          affectedTablesMap['pcs_systems'] = (affectedTablesMap['pcs_systems'] || 0) + 18;
          affectedTablesMap['pcs_subsystems'] = (affectedTablesMap['pcs_subsystems'] || 0) + 88;
          affectedTablesMap['pcs_procedures'] = (affectedTablesMap['pcs_procedures'] || 0) + 1298;
          totalDownstreamImpact += 1404;
          migrationDiffBefore += 1298;
          if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
        }
      } else if (err.id === 'ERR-3091') {
        // MCS Procedures Orphan - non-deletable parent
        if (action === 'DELETE') {
          canExecute = false;
          riskLevel = 'CRITICAL';
          blockingReasons.push(`Orphan record delete is BLOCKED. 521,878 procedures reference this element.`);
        }
      } else if (err.id === 'ERR-6019') {
        // Transformation encoding fail - simulate a potential STG compile crash block in bulk!
        if (action === 'FIX') {
          // If we attempt to fix this directly without investigating, simulate validation lock
          riskLevel = 'MEDIUM';
          affectedTablesMap['mcs_procedures'] = (affectedTablesMap['mcs_procedures'] || 0) + 15400;
          totalDownstreamImpact += 15400;
        }
      }
    });

    const affectedTables = Object.entries(affectedTablesMap).map(([tableName, recordsCount]) => ({
      tableName,
      recordsCount
    }));

    return {
      errorIds,
      action,
      affectedTables,
      totalDownstreamImpact,
      errorsResolvedCount,
      errorsCreatedCount,
      migrationDiffBefore,
      migrationDiffAfter,
      riskLevel,
      canExecute,
      blockingReasons
    };
  },

  // POST /api/remediation/execute - Stage 1: Dry run execution in staging database (STG)
  executeStgRemediation: async (errorIds: string[], action: 'FIX' | 'DELETE' | 'RESTORE' | 'RELINK' | 'UPDATE', reason: string): Promise<RemediationJob> => {
    await delay(400);
    const newJobId = `REM-00${jobsDb.length + 1}`;
    
    // Simulate Scenario H: Staging Validation fails if ERR-6019 is included, representing a formatting syntax crash
    const hasUnicodeError = errorIds.includes('ERR-6019');
    
    const preview = await mockApi.getImpactPreview(errorIds, action);
    
    let status: RemediationJob['status'] = 'STG_SUCCESS';
    let logs = [
      'Initializing staging validation compiler...',
      `Validating keys for: ${errorIds.join(', ')}`,
      'Running SQL constraints checks...',
      'Orphan loops: None found.',
      'Validation Dry run succeeded in isolated STG sandbox.'
    ];

    if (!preview.canExecute) {
      status = 'STG_FAILED';
      logs.push('ERROR: Foreign key referential integrity violation detected.', 'Remediation aborted.');
    } else if (hasUnicodeError) {
      // Scenario H
      status = 'STG_FAILED';
      logs.push(
        'ERROR: Unicode decoding exception: UTF-8 mismatch on procedure character line 4.',
        'Staging schema validation FAILED.',
        'STG migration aborted. Execution blocked.'
      );
    }

    const job: RemediationJob = {
      id: newJobId,
      errorIds,
      action,
      status,
      requestedBy: 'A. Howard (Admin)',
      requestedAt: new Date().toISOString(),
      reason,
      stgValidationResult: {
        success: status === 'STG_SUCCESS',
        logs,
        recordsUpdated: status === 'STG_SUCCESS' ? preview.totalDownstreamImpact : 0,
        errorCountBefore: errorsDb.filter(e => e.status !== 'Resolved').length,
        errorCountAfter: status === 'STG_SUCCESS' ? errorsDb.filter(e => e.status !== 'Resolved').length - errorIds.length : errorsDb.filter(e => e.status !== 'Resolved').length
      }
    };

    jobsDb = [job, ...jobsDb];
    return job;
  },

  // POST /api/remediation/promote - Stage 2: Promote verified staging change to production (PROD)
  promoteToProd: async (jobId: string): Promise<RemediationJob | undefined> => {
    await delay(500);
    const job = jobsDb.find(j => j.id === jobId);
    if (!job) return undefined;

    if (job.status !== 'STG_SUCCESS') {
      throw new Error('Only successfully validated staging jobs can be promoted to production.');
    }

    job.status = 'PROD_SUCCESS';
    job.prodExecutionResult = {
      success: true,
      executedAt: new Date().toISOString(),
      recordsUpdated: job.stgValidationResult?.recordsUpdated || 0,
      logs: [
        'Connecting to production target schemas...',
        'Acquiring exclusive table locks...',
        'Applying remediation updates...',
        'Committing transaction block...',
        'Validation checks passed. Production schemas synchronised successfully.'
      ]
    };

    // Apply mutation side-effects: mark respective errors as RESOLVED in errorsDb
    job.errorIds.forEach(errId => {
      const err = errorsDb.find(e => e.id === errId);
      if (err) {
        err.status = 'Resolved';
      }
    });

    // Write operational audit trail snapshot
    const auditId = `OP-00${operationAuditsDb.length + 1}`;
    const audit: OperationAuditRecord = {
      id: auditId,
      remediationId: job.id,
      timestamp: new Date().toISOString(),
      action: job.action,
      environment: 'PROD',
      affectedTable: errorsDb.find(e => e.id === job.errorIds[0])?.entityId || 'multiple',
      beforeStateSummary: `Data discrepancy logged with ${job.errorIds.length} open validation errors.`,
      afterStateSummary: `Successfully sync\'d reference tables, resolved errors: ${job.errorIds.join(', ')}.`,
      reason: job.reason,
      operator: job.requestedBy,
      affectedRecords: job.prodExecutionResult.recordsUpdated
    };

    operationAuditsDb = [audit, ...operationAuditsDb];
    return job;
  },

  // Fetch remediation pipeline history
  getRemediationJobs: async (): Promise<RemediationJob[]> => {
    await delay(150);
    return jobsDb;
  },

  // Fetch individual remediation job details
  getRemediationJob: async (id: string): Promise<RemediationJob | undefined> => {
    await delay(100);
    return jobsDb.find(j => j.id === id);
  },

  // Fetch operational audits
  getOperationAudits: async (): Promise<OperationAuditRecord[]> => {
    await delay(150);
    return operationAuditsDb;
  },

  // GET /api/errors/source-compare - Query legacy source schema values for review context
  getSourceCompare: async (errorId: string): Promise<{ column: string; sourceValue: string; targetValue: string; status: string }[]> => {
    await delay(300);
    if (errorId === 'ERR-2967') {
      return [
        { column: 'vehicle_id', sourceValue: 'VHC-2967-US-EAST', targetValue: 'GMV-2967 (Missing)', status: 'Orphan Mismatch' },
        { column: 'model_year', sourceValue: '2026', targetValue: '2026', status: 'Match' },
        { column: 'region_id', sourceValue: 'US-REG-1', targetValue: 'US-1', status: 'Match' }
      ];
    }
    if (errorId === 'ERR-1713') {
      return [
        { column: 'vehicle_id', sourceValue: 'VHC-1713-REG-A & VHC-1713-REG-B', targetValue: 'GMV-1713', status: 'Duplicate Key Row' },
        { column: 'model_year', sourceValue: '2025', targetValue: '2025', status: 'Match' }
      ];
    }
    if (errorId === 'ERR-1750') {
      return [
        { column: 'make_id', sourceValue: 'GEN-LEGACY-CD', targetValue: 'GEN (Excluded)', status: 'Filtered lookup key' }
      ];
    }
    return [
      { column: 'record_key', sourceValue: 'LEGACY-RAW-09', targetValue: 'STG-RAW-09', status: 'Value Mismatch' }
    ];
  },

  // POST /api/errors/update-remediation - Update in-memory error evidence to save fixed values
  updateErrorEvidence: async (id: string, expectedReference: string, explanation: string): Promise<DataQualityError | undefined> => {
    await delay(150);
    const err = errorsDb.find(e => e.id === id);
    if (err && err.evidence) {
      err.evidence.expectedReference = expectedReference;
      err.evidence.explanation = explanation;
      err.rootCause = `Operator remediation values saved: Linked reference model was set to "${expectedReference}". Staging dry-runs will run with this update.`;
    }
    return err;
  }
};
