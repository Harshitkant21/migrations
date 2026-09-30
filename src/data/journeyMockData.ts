// src/data/journeyMockData.ts
import {
  DatabaseConnectionCard,
  MigrationIntent,
  MigrationConstraints,
  DiscoveredTable,
  ImpactAnalysisMetrics,
  TargetTableDef,
  ValidationIssue,
  ExecutionActivity,
  MigrationLogEntry,
  PreviousMigration,
  TableMappingDefinition
} from '../types/models';

export const previousMigrations: PreviousMigration[] = [
  {
    id: 'MIG-2026-0928-PROD',
    title: 'Production Database Migration',
    source: 'aws-east-pg01.internal:5432 (PostgreSQL 14.9)',
    target: 'pg-cloud-aurora.internal:5432 (PostgreSQL 16.2)',
    tables: 245,
    records: '18.4M',
    status: 'Completed with Warnings',
    completedAt: '2026-09-28 11:42 UTC',
    health: 94.8,
    type: 'Schema + Data',
    environment: 'Production'
  },
  {
    id: 'MIG-2026-0814-CRM',
    title: 'Legacy CRM System Migration',
    source: 'oracle-crm-node.internal:1521 (Oracle 19c)',
    target: 'pg-cloud-aurora.internal:5432 (PostgreSQL 16.2)',
    tables: 86,
    records: '4.2M',
    status: 'Completed',
    completedAt: '2026-08-14 16:20 UTC',
    health: 99.8,
    type: 'Full migration',
    environment: 'Staging'
  },
  {
    id: 'MIG-2026-0702-DW',
    title: 'Analytics Data Warehouse Sync',
    source: 'mysql-legacy.internal:3306 (MySQL 8.0)',
    target: 'dw-cluster.internal:5432 (PostgreSQL Analytics)',
    tables: 42,
    records: '1.8M',
    status: 'Completed',
    completedAt: '2026-07-02 04:15 UTC',
    health: 100.0,
    type: 'Data only',
    environment: 'Production'
  }
];

export const initialSources: DatabaseConnectionCard[] = [
  {
    id: 'src-1',
    name: 'Production PostgreSQL',
    type: 'PostgreSQL',
    status: 'Connected',
    host: 'aws-east-pg01.internal',
    port: 5432,
    database: 'production_core_db',
    username: 'migrator_svc',
    ssl: true,
    connectionString: 'postgresql://migrator_svc:••••••••@aws-east-pg01.internal:5432/production_core_db?sslmode=require',
    schemaCount: 15,
    tableCount: 245,
    isSource: true
  },
  {
    id: 'src-2',
    name: 'Legacy MySQL',
    type: 'MySQL',
    status: 'Connected',
    host: 'mysql-legacy.internal',
    port: 3306,
    database: 'legacy_store_v2',
    username: 'etl_reader',
    ssl: false,
    connectionString: 'mysql://etl_reader:••••••••@mysql-legacy.internal:3306/legacy_store_v2',
    schemaCount: 3,
    tableCount: 32,
    isSource: true
  }
];

export const initialTargets: DatabaseConnectionCard[] = [
  {
    id: 'tgt-1',
    name: 'PostgreSQL Production',
    type: 'PostgreSQL',
    status: 'Ready',
    host: 'pg-cloud-aurora.internal',
    port: 5432,
    database: 'aurora_enterprise_prod',
    username: 'cloud_admin',
    ssl: true,
    connectionString: 'postgresql://cloud_admin:••••••••@pg-cloud-aurora.internal:5432/aurora_enterprise_prod?sslmode=require',
    schemaCount: 12,
    tableCount: 245,
    isSource: false
  },
  {
    id: 'tgt-2',
    name: 'Analytics PostgreSQL',
    type: 'PostgreSQL',
    status: 'Ready',
    host: 'dw-cluster.internal',
    port: 5432,
    database: 'analytics_dw',
    username: 'dw_loader',
    ssl: true,
    connectionString: 'postgresql://dw_loader:••••••••@dw-cluster.internal:5432/analytics_dw?sslmode=require',
    schemaCount: 5,
    tableCount: 98,
    isSource: false
  }
];

export const initialIntent: MigrationIntent = {
  migrationType: 'Schema + Data',
  environment: 'Production',
  objective: 'Migrate core transactional monolithic PostgreSQL 14 instance to Aurora Serverless v16 with schema normalization and zero data loss.',
  notes: 'Customer profile table needs to be split into profile + contact tables. Orders and Order Items must be merged into customer_orders for high-throughput reporting.'
};

export const initialConstraints: MigrationConstraints = {
  downtimeRequirement: '< 15 minutes (Zero-downtime replication window)',
  dataTransformationRequired: true,
  dataMaskingRequired: true,
  validationLevel: 'Strict (Row-by-row + Checksum)',
  migrationWindow: '2026-10-01 02:00 UTC - 05:00 UTC'
};

export const impactAnalysisData: ImpactAnalysisMetrics = {
  totalTables: 245,
  totalRecords: '18.4M',
  totalSchemas: 15,
  totalColumns: 3120,
  totalIndexes: 412,
  totalForeignKeys: 186,
  directMappings: 184,
  transformations: 32,
  tableSplits: 7,
  tableMerges: 4,
  potentialConflicts: 2
};

export const initialDiscoveredTables: DiscoveredTable[] = [
  {
    id: 'tbl-customers',
    name: 'customers',
    schema: 'public',
    rows: 1420500,
    columnCount: 24,
    primaryKey: 'customer_id (UUID)',
    foreignKeyCount: 2,
    indexCount: 5,
    status: 'VERIFIED',
    isIncluded: true,
    columnsList: [
      { name: 'customer_id', dataType: 'UUID', isPk: true, isFk: false, isNullable: false },
      { name: 'first_name', dataType: 'VARCHAR(100)', isPk: false, isFk: false, isNullable: false },
      { name: 'last_name', dataType: 'VARCHAR(100)', isPk: false, isFk: false, isNullable: false },
      { name: 'email', dataType: 'VARCHAR(255)', isPk: false, isFk: false, isNullable: false },
      { name: 'phone', dataType: 'VARCHAR(50)', isPk: false, isFk: false, isNullable: true },
      { name: 'billing_address', dataType: 'TEXT', isPk: false, isFk: false, isNullable: true },
      { name: 'created_at', dataType: 'TIMESTAMP', isPk: false, isFk: false, isNullable: false }
    ]
  },
  {
    id: 'tbl-orders',
    name: 'orders',
    schema: 'sales',
    rows: 2431221,
    columnCount: 18,
    primaryKey: 'order_id (BIGINT)',
    foreignKeyCount: 3,
    indexCount: 6,
    status: 'NEEDS_REVIEW',
    isIncluded: true,
    columnsList: [
      { name: 'order_id', dataType: 'BIGINT', isPk: true, isFk: false, isNullable: false },
      { name: 'customer_id', dataType: 'UUID', isPk: false, isFk: true, isNullable: false },
      { name: 'order_date', dataType: 'TIMESTAMP', isPk: false, isFk: false, isNullable: false },
      { name: 'status', dataType: 'VARCHAR(30)', isPk: false, isFk: false, isNullable: false },
      { name: 'total_amount', dataType: 'NUMERIC(12,2)', isPk: false, isFk: false, isNullable: false },
      { name: 'discount_code', dataType: 'VARCHAR(50)', isPk: false, isFk: false, isNullable: true }
    ]
  },
  {
    id: 'tbl-order-items',
    name: 'order_items',
    schema: 'sales',
    rows: 6850200,
    columnCount: 12,
    primaryKey: 'item_id (BIGINT)',
    foreignKeyCount: 2,
    indexCount: 4,
    status: 'VERIFIED',
    isIncluded: true,
    columnsList: [
      { name: 'item_id', dataType: 'BIGINT', isPk: true, isFk: false, isNullable: false },
      { name: 'order_id', dataType: 'BIGINT', isPk: false, isFk: true, isNullable: false },
      { name: 'product_id', dataType: 'BIGINT', isPk: false, isFk: true, isNullable: false },
      { name: 'quantity', dataType: 'INT', isPk: false, isFk: false, isNullable: false },
      { name: 'unit_price', dataType: 'NUMERIC(10,2)', isPk: false, isFk: false, isNullable: false }
    ]
  },
  {
    id: 'tbl-users',
    name: 'users',
    schema: 'auth',
    rows: 580000,
    columnCount: 14,
    primaryKey: 'user_id (UUID)',
    foreignKeyCount: 1,
    indexCount: 4,
    status: 'VERIFIED',
    isIncluded: true,
    columnsList: [
      { name: 'user_id', dataType: 'UUID', isPk: true, isFk: false, isNullable: false },
      { name: 'username', dataType: 'VARCHAR(80)', isPk: false, isFk: false, isNullable: false },
      { name: 'email_hash', dataType: 'VARCHAR(256)', isPk: false, isFk: false, isNullable: false },
      { name: 'is_active', dataType: 'BOOLEAN', isPk: false, isFk: false, isNullable: false }
    ]
  },
  {
    id: 'tbl-products',
    name: 'products',
    schema: 'inventory',
    rows: 125000,
    columnCount: 22,
    primaryKey: 'product_id (BIGINT)',
    foreignKeyCount: 2,
    indexCount: 5,
    status: 'VERIFIED',
    isIncluded: true,
    columnsList: [
      { name: 'product_id', dataType: 'BIGINT', isPk: true, isFk: false, isNullable: false },
      { name: 'sku', dataType: 'VARCHAR(50)', isPk: false, isFk: false, isNullable: false },
      { name: 'title', dataType: 'VARCHAR(200)', isPk: false, isFk: false, isNullable: false },
      { name: 'price', dataType: 'NUMERIC(10,2)', isPk: false, isFk: false, isNullable: false }
    ]
  },
  {
    id: 'tbl-payments',
    name: 'payments',
    schema: 'billing',
    rows: 2310000,
    columnCount: 16,
    primaryKey: 'payment_id (UUID)',
    foreignKeyCount: 2,
    indexCount: 4,
    status: 'VERIFIED',
    isIncluded: true,
    columnsList: [
      { name: 'payment_id', dataType: 'UUID', isPk: true, isFk: false, isNullable: false },
      { name: 'order_id', dataType: 'BIGINT', isPk: false, isFk: true, isNullable: false },
      { name: 'amount', dataType: 'NUMERIC(12,2)', isPk: false, isFk: false, isNullable: false },
      { name: 'provider', dataType: 'VARCHAR(50)', isPk: false, isFk: false, isNullable: false }
    ]
  },
  {
    id: 'tbl-invoices',
    name: 'invoices',
    schema: 'billing',
    rows: 1980000,
    columnCount: 19,
    primaryKey: 'invoice_id (UUID)',
    foreignKeyCount: 2,
    indexCount: 3,
    status: 'VERIFIED',
    isIncluded: true,
    columnsList: [
      { name: 'invoice_id', dataType: 'UUID', isPk: true, isFk: false, isNullable: false },
      { name: 'invoice_number', dataType: 'VARCHAR(40)', isPk: false, isFk: false, isNullable: false },
      { name: 'tax_amount', dataType: 'NUMERIC(10,2)', isPk: false, isFk: false, isNullable: false }
    ]
  },
  {
    id: 'tbl-addresses',
    name: 'addresses',
    schema: 'public',
    rows: 1650000,
    columnCount: 11,
    primaryKey: 'address_id (UUID)',
    foreignKeyCount: 1,
    indexCount: 3,
    status: 'VERIFIED',
    isIncluded: true,
    columnsList: [
      { name: 'address_id', dataType: 'UUID', isPk: true, isFk: false, isNullable: false },
      { name: 'street', dataType: 'VARCHAR(255)', isPk: false, isFk: false, isNullable: false },
      { name: 'city', dataType: 'VARCHAR(100)', isPk: false, isFk: false, isNullable: false },
      { name: 'postal_code', dataType: 'VARCHAR(20)', isPk: false, isFk: false, isNullable: false }
    ]
  },
  {
    id: 'tbl-subscriptions',
    name: 'subscriptions',
    schema: 'billing',
    rows: 420000,
    columnCount: 15,
    primaryKey: 'subscription_id (UUID)',
    foreignKeyCount: 2,
    indexCount: 4,
    status: 'VERIFIED',
    isIncluded: true,
    columnsList: [
      { name: 'subscription_id', dataType: 'UUID', isPk: true, isFk: false, isNullable: false },
      { name: 'tier', dataType: 'VARCHAR(50)', isPk: false, isFk: false, isNullable: false },
      { name: 'renewal_date', dataType: 'DATE', isPk: false, isFk: false, isNullable: false }
    ]
  },
  {
    id: 'tbl-transactions',
    name: 'transactions',
    schema: 'billing',
    rows: 2600000,
    columnCount: 14,
    primaryKey: 'tx_id (UUID)',
    foreignKeyCount: 2,
    indexCount: 5,
    status: 'VERIFIED',
    isIncluded: true,
    columnsList: [
      { name: 'tx_id', dataType: 'UUID', isPk: true, isFk: false, isNullable: false },
      { name: 'currency', dataType: 'VARCHAR(3)', isPk: false, isFk: false, isNullable: false },
      { name: 'gateway_status', dataType: 'VARCHAR(30)', isPk: false, isFk: false, isNullable: false }
    ]
  },
  {
    id: 'tbl-audit-log',
    name: 'audit_log',
    schema: 'audit',
    rows: 850000,
    columnCount: 8,
    primaryKey: 'log_id (BIGINT)',
    foreignKeyCount: 0,
    indexCount: 2,
    status: 'INVALID',
    isIncluded: true,
    columnsList: [
      { name: 'log_id', dataType: 'BIGINT', isPk: true, isFk: false, isNullable: false },
      { name: 'action', dataType: 'VARCHAR(80)', isPk: false, isFk: false, isNullable: false },
      { name: 'payload', dataType: 'TEXT', isPk: false, isFk: false, isNullable: true }
    ]
  },
  {
    id: 'tbl-legacy-sessions',
    name: 'legacy_sessions',
    schema: 'auth',
    rows: 24000,
    columnCount: 6,
    primaryKey: 'None (Missing PK)',
    foreignKeyCount: 1,
    indexCount: 1,
    status: 'NEEDS_REVIEW',
    isIncluded: false,
    columnsList: [
      { name: 'token_id', dataType: 'VARCHAR(128)', isPk: false, isFk: false, isNullable: false },
      { name: 'user_id', dataType: 'UUID', isPk: false, isFk: true, isNullable: false },
      { name: 'expires_at', dataType: 'TIMESTAMP', isPk: false, isFk: false, isNullable: false }
    ]
  }
];

export const initialTargetTables: TargetTableDef[] = [
  {
    id: 'tgt-customer-profile',
    schema: 'core',
    name: 'customer_profile',
    isCustom: false,
    ddlPreview: `CREATE TABLE core.customer_profile (\n  customer_id UUID PRIMARY KEY,\n  first_name VARCHAR(100) NOT NULL,\n  last_name VARCHAR(100) NOT NULL,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP\n);`,
    columns: [
      { name: 'customer_id', dataType: 'UUID', isNullable: false, isPrimaryKey: true, isForeignKey: false, isUnique: true, hasCheck: false, indexes: ['pk_customer_profile'] },
      { name: 'first_name', dataType: 'VARCHAR', length: '100', isNullable: false, isPrimaryKey: false, isForeignKey: false, isUnique: false, hasCheck: false, indexes: [] },
      { name: 'last_name', dataType: 'VARCHAR', length: '100', isNullable: false, isPrimaryKey: false, isForeignKey: false, isUnique: false, hasCheck: false, indexes: [] },
      { name: 'email', dataType: 'VARCHAR', length: '255', isNullable: false, isPrimaryKey: false, isForeignKey: false, isUnique: true, hasCheck: true, checkExpr: "email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'", indexes: ['idx_customer_email'] },
      { name: 'created_at', dataType: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'CURRENT_TIMESTAMP', isPrimaryKey: false, isForeignKey: false, isUnique: false, hasCheck: false, indexes: [] }
    ]
  },
  {
    id: 'tgt-customer-contact',
    schema: 'core',
    name: 'customer_contact',
    isCustom: false,
    ddlPreview: `CREATE TABLE core.customer_contact (\n  contact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  customer_id UUID NOT NULL REFERENCES core.customer_profile(customer_id),\n  phone_normalized VARCHAR(20),\n  billing_address JSONB,\n  verified_at TIMESTAMPTZ\n);`,
    columns: [
      { name: 'contact_id', dataType: 'UUID', isNullable: false, defaultValue: 'gen_random_uuid()', isPrimaryKey: true, isForeignKey: false, isUnique: true, hasCheck: false, indexes: ['pk_contact_id'] },
      { name: 'customer_id', dataType: 'UUID', isNullable: false, isPrimaryKey: false, isForeignKey: true, referencedTable: 'customer_profile', referencedColumn: 'customer_id', isUnique: false, hasCheck: false, indexes: ['fk_contact_cust_idx'] },
      { name: 'phone_normalized', dataType: 'VARCHAR', length: '20', isNullable: true, isPrimaryKey: false, isForeignKey: false, isUnique: false, hasCheck: true, checkExpr: "phone_normalized ~ '^\\+[1-9]\\d{1,14}$'", indexes: [] },
      { name: 'billing_address', dataType: 'JSONB', isNullable: true, isPrimaryKey: false, isForeignKey: false, isUnique: false, hasCheck: false, indexes: ['gin_contact_address'] },
      { name: 'verified_at', dataType: 'TIMESTAMPTZ', isNullable: true, isPrimaryKey: false, isForeignKey: false, isUnique: false, hasCheck: false, indexes: [] }
    ]
  },
  {
    id: 'tgt-customer-orders',
    schema: 'core',
    name: 'customer_orders',
    isCustom: false,
    ddlPreview: `CREATE TABLE core.customer_orders (\n  order_id BIGINT PRIMARY KEY,\n  customer_id UUID NOT NULL REFERENCES core.customer_profile(customer_id),\n  order_date TIMESTAMPTZ NOT NULL,\n  status VARCHAR(30) NOT NULL,\n  total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),\n  discount_amount NUMERIC(10,2) DEFAULT 0.00,\n  item_count INT NOT NULL DEFAULT 1,\n  items_payload JSONB NOT NULL\n);`,
    columns: [
      { name: 'order_id', dataType: 'BIGINT', isNullable: false, isPrimaryKey: true, isForeignKey: false, isUnique: true, hasCheck: false, indexes: ['pk_customer_orders'] },
      { name: 'customer_id', dataType: 'UUID', isNullable: false, isPrimaryKey: false, isForeignKey: true, referencedTable: 'customer_profile', referencedColumn: 'customer_id', isUnique: false, hasCheck: false, indexes: ['idx_orders_customer'] },
      { name: 'order_date', dataType: 'TIMESTAMPTZ', isNullable: false, isPrimaryKey: false, isForeignKey: false, isUnique: false, hasCheck: false, indexes: ['idx_orders_date'] },
      { name: 'status', dataType: 'VARCHAR', length: '30', isNullable: false, isPrimaryKey: false, isForeignKey: false, isUnique: false, hasCheck: true, checkExpr: "status IN ('PENDING', 'PAID', 'SHIPPED', 'CANCELLED', 'REFUNDED')", indexes: [] },
      { name: 'total_amount', dataType: 'NUMERIC', length: '12,2', isNullable: false, isPrimaryKey: false, isForeignKey: false, isUnique: false, hasCheck: true, checkExpr: 'total_amount >= 0', indexes: [] },
      { name: 'discount_amount', dataType: 'NUMERIC', length: '10,2', isNullable: true, defaultValue: '0.00', isPrimaryKey: false, isForeignKey: false, isUnique: false, hasCheck: false, indexes: [] },
      { name: 'item_count', dataType: 'INT', isNullable: false, defaultValue: '1', isPrimaryKey: false, isForeignKey: false, isUnique: false, hasCheck: false, indexes: [] },
      { name: 'items_payload', dataType: 'JSONB', isNullable: false, isPrimaryKey: false, isForeignKey: false, isUnique: false, hasCheck: false, indexes: ['gin_orders_items'] }
    ]
  },
  {
    id: 'tgt-invoices',
    schema: 'billing',
    name: 'invoices',
    isCustom: false,
    ddlPreview: `CREATE TABLE billing.invoices (\n  invoice_id UUID PRIMARY KEY,\n  invoice_number VARCHAR(40) UNIQUE NOT NULL,\n  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,\n  issued_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP\n);`,
    columns: [
      { name: 'invoice_id', dataType: 'UUID', isNullable: false, isPrimaryKey: true, isForeignKey: false, isUnique: true, hasCheck: false, indexes: ['pk_invoices'] },
      { name: 'invoice_number', dataType: 'VARCHAR', length: '40', isNullable: false, isPrimaryKey: false, isForeignKey: false, isUnique: true, hasCheck: false, indexes: ['idx_inv_num'] },
      { name: 'tax_amount', dataType: 'NUMERIC', length: '10,2', isNullable: false, defaultValue: '0.00', isPrimaryKey: false, isForeignKey: false, isUnique: false, hasCheck: false, indexes: [] }
    ]
  }
];

export const journeyTableMappings: TableMappingDefinition[] = [
  {
    id: 'map-cust-split',
    mappingType: 'SPLIT',
    sourceDatabases: ['Production PostgreSQL'],
    sourceTables: ['customers'],
    targetDatabases: ['PostgreSQL Production'],
    targetTables: ['customer_profile', 'customer_contact'],
    title: 'Customer Monolith Table Split (1 → N)',
    description: 'Separates customer personal identity from contact channels and addresses into normalized relations.',
    status: 'Healthy',
    notes: 'Phone numbers normalized using E.164 rule (+1XXXXXXXXXX).',
    columnMappings: [
      { id: 'cm-c1', sourceDb: 'Production PostgreSQL', sourceTable: 'customers', sourceColumn: 'customer_id', sourceDataType: 'UUID', transformationType: 'DIRECT', transformationRule: 'Direct key copy', targetDb: 'PostgreSQL Production', targetTable: 'customer_profile', targetColumn: 'customer_id', targetDataType: 'UUID', sampleBefore: '550e8400-e29b-41d4', sampleAfter: '550e8400-e29b-41d4', status: 'Mapped' },
      { id: 'cm-c2', sourceDb: 'Production PostgreSQL', sourceTable: 'customers', sourceColumn: 'first_name', sourceDataType: 'VARCHAR(100)', transformationType: 'DIRECT', transformationRule: 'Direct copy', targetDb: 'PostgreSQL Production', targetTable: 'customer_profile', targetColumn: 'first_name', targetDataType: 'VARCHAR(100)', sampleBefore: 'Jane', sampleAfter: 'Jane', status: 'Mapped' },
      { id: 'cm-c3', sourceDb: 'Production PostgreSQL', sourceTable: 'customers', sourceColumn: 'phone', sourceDataType: 'VARCHAR(50)', transformationType: 'NORMALIZE', transformationRule: 'Apply normalize_phone(val, "+1")', targetDb: 'PostgreSQL Production', targetTable: 'customer_contact', targetColumn: 'phone_normalized', targetDataType: 'VARCHAR(20)', sampleBefore: '(415) 555-0199', sampleAfter: '+14155550199', status: 'Mapped' },
      { id: 'cm-c4', sourceDb: 'Production PostgreSQL', sourceTable: 'customers', sourceColumn: 'billing_address', sourceDataType: 'TEXT', transformationType: 'SPLIT', transformationRule: 'JSON parse into structured address fields', targetDb: 'PostgreSQL Production', targetTable: 'customer_contact', targetColumn: 'billing_address', targetDataType: 'JSONB', sampleBefore: '123 Market St, SF, CA 94105', sampleAfter: '{"street":"123 Market St","city":"SF"}', status: 'Mapped' }
    ]
  },
  {
    id: 'map-orders-merge',
    mappingType: 'MERGE',
    sourceDatabases: ['Production PostgreSQL', 'Production PostgreSQL'],
    sourceTables: ['orders', 'order_items'],
    targetDatabases: ['PostgreSQL Production'],
    targetTables: ['customer_orders'],
    title: 'Orders + Items Aggregated Merge (N → 1)',
    description: 'Combines parent order headers with line items payload into a high-performance consolidated order table.',
    status: 'Warning',
    notes: '240 orders missing parent customer references in archived batch.',
    columnMappings: [
      { id: 'cm-o1', sourceDb: 'Production PostgreSQL', sourceTable: 'orders', sourceColumn: 'order_id', sourceDataType: 'BIGINT', transformationType: 'MERGE_KEY', transformationRule: 'Merge join root key', targetDb: 'PostgreSQL Production', targetTable: 'customer_orders', targetColumn: 'order_id', targetDataType: 'BIGINT', sampleBefore: '1098442', sampleAfter: '1098442', status: 'Mapped' },
      { id: 'cm-o2', sourceDb: 'Production PostgreSQL', sourceTable: 'orders', sourceColumn: 'discount_code', sourceDataType: 'VARCHAR(50)', transformationType: 'CAST', transformationRule: 'Lookup discount percentage code and cast to NUMERIC(10,2)', targetDb: 'PostgreSQL Production', targetTable: 'customer_orders', targetColumn: 'discount_amount', targetDataType: 'NUMERIC(10,2)', sampleBefore: 'SUMMER20', sampleAfter: '20.00', status: 'Warning' },
      { id: 'cm-o3', sourceDb: 'Production PostgreSQL', sourceTable: 'order_items', sourceColumn: 'item_id', sourceDataType: 'BIGINT', transformationType: 'AGGREGATED', transformationRule: 'Aggregate order items into JSONB array', targetDb: 'PostgreSQL Production', targetTable: 'customer_orders', targetColumn: 'items_payload', targetDataType: 'JSONB', sampleBefore: 'item_id: 8841', sampleAfter: '[{"item_id":8841,"qty":2}]', status: 'Mapped' }
    ]
  },
  {
    id: 'map-users-direct',
    mappingType: 'SINGLE',
    sourceDatabases: ['Production PostgreSQL'],
    sourceTables: ['users'],
    targetDatabases: ['PostgreSQL Production'],
    targetTables: ['users'],
    title: 'Users Direct 1:1 Identity Ingestion',
    description: 'Direct schema replication with SHA-256 integrity hash verification.',
    status: 'Healthy',
    notes: '580,000 active credentials mapped.',
    columnMappings: [
      { id: 'cm-u1', sourceDb: 'Production PostgreSQL', sourceTable: 'users', sourceColumn: 'user_id', sourceDataType: 'UUID', transformationType: 'DIRECT', transformationRule: 'Direct copy', targetDb: 'PostgreSQL Production', targetTable: 'users', targetColumn: 'user_id', targetDataType: 'UUID', sampleBefore: '49cf2442-12aa', sampleAfter: '49cf2442-12aa', status: 'Mapped' },
      { id: 'cm-u2', sourceDb: 'Production PostgreSQL', sourceTable: 'users', sourceColumn: 'username', sourceDataType: 'VARCHAR(80)', transformationType: 'NORMALIZE', transformationRule: 'Lower-case trim', targetDb: 'PostgreSQL Production', targetTable: 'users', targetColumn: 'username', targetDataType: 'VARCHAR(80)', sampleBefore: 'Admin_User ', sampleAfter: 'admin_user', status: 'Mapped' }
    ]
  }
];

export const initialValidationIssues: ValidationIssue[] = [
  {
    id: 'crit-1',
    title: 'Type Conflict: orders.discount_code',
    description: 'Source orders.discount_code is VARCHAR(50) containing promo vouchers, while target customer_orders.discount_amount expects NUMERIC(10,2). Implicit cast will fail on alphanumeric strings.',
    domain: 'Data Quality',
    severity: 'Critical',
    entity: 'orders → customer_orders',
    remediation: 'Apply SAFE_DISCOUNT_LOOKUP(val, default: 0.00) rule to convert promo codes to monetary discount values.',
    isResolved: false
  },
  {
    id: 'crit-2',
    title: 'Malformed Payload: audit_log.payload',
    description: 'Source audit_log.payload contains unescaped non-standard UTF-8 strings that violate PostgreSQL strict JSONB RFC 8259 parser.',
    domain: 'Data Quality',
    severity: 'Critical',
    entity: 'audit_log → audit_log_v2',
    remediation: 'Quarantine malformed payloads and apply JSON_CLEANSE_STRICT(payload) encoding sanitizer.',
    isResolved: false
  },
  {
    id: 'warn-1',
    title: 'Missing Primary Key on legacy_sessions',
    description: 'Source table legacy_sessions has no defined primary key constraint or unique index. Replication cannot track incremental WAL deltas.',
    domain: 'Constraint',
    severity: 'Warning',
    entity: 'legacy_sessions',
    remediation: 'Synthesize surrogate UUID primary key or exclude non-essential session cache.',
    isResolved: false
  },
  {
    id: 'warn-2',
    title: 'Nullable Column Mismatch: addresses.postal_code',
    description: 'Source allows NULL in postal_code (12,410 rows), but target schema defines NOT NULL.',
    domain: 'Schema',
    severity: 'Warning',
    entity: 'addresses',
    remediation: 'Target column supplied with fallback default value "UNKNOWN".',
    isResolved: false
  },
  {
    id: 'warn-3',
    title: 'Unindexed Foreign Key: order_items.product_id',
    description: 'Target table customer_orders does not have a secondary B-Tree index on product_id for high-throughput joins.',
    domain: 'Constraint',
    severity: 'Warning',
    entity: 'order_items',
    remediation: 'Target schema script will append CREATE INDEX idx_orders_product.',
    isResolved: false
  },
  {
    id: 'warn-4',
    title: 'Timezone Truncation Risk: invoices.issued_at',
    description: 'Source TIMESTAMP WITHOUT TIME ZONE converted to TIMESTAMPTZ assuming UTC default offset.',
    domain: 'Transformation',
    severity: 'Warning',
    entity: 'invoices',
    remediation: 'Confirmed source server timezone offset is strictly UTC.',
    isResolved: false
  },
  {
    id: 'warn-5',
    title: 'High-Volume Decimal Rounding Check: payments.amount',
    description: 'Currency conversion verification for multi-currency transactions requires IEEE 754 precision check.',
    domain: 'Transformation',
    severity: 'Warning',
    entity: 'payments',
    remediation: 'Enforce NUMERIC(12,2) exact banking decimal format.',
    isResolved: false
  },
  {
    id: 'warn-6',
    title: 'Cascade Deletion Rule Inconsistency: customer_contact',
    description: 'Target schema foreign key does not explicitly define ON DELETE CASCADE for contact channels.',
    domain: 'Constraint',
    severity: 'Warning',
    entity: 'customer_contact',
    remediation: 'Add ON DELETE RESTRICT to prevent accidental orphan deletion.',
    isResolved: false
  },
  {
    id: 'warn-7',
    title: 'Character Set Collation Drift: products.title',
    description: 'Source database collation is utf8mb4_unicode_ci; target is en_US.UTF-8.',
    domain: 'Schema',
    severity: 'Warning',
    entity: 'products',
    remediation: 'Accent-insensitive sort matches expected production behavior.',
    isResolved: false
  },
  {
    id: 'warn-8',
    title: 'Incomplete Mapping on 7 Auxiliary Config Tables',
    description: '7 lookup tables marked for automated 1:1 mirror have unreviewed composite keys.',
    domain: 'Mapping',
    severity: 'Warning',
    entity: 'system_settings, lookup_codes',
    remediation: 'Auto-accepted default 1:1 mirror mappings.',
    isResolved: false
  }
];

export const executionActivities: ExecutionActivity[] = [
  {
    id: 'act-1',
    table: 'orders',
    stage: 'Loading',
    detail: 'Loading Batch 412/600 (1.68M rows loaded) → Aurora cluster worker #03',
    status: 'active',
    progressPct: 68.6
  },
  {
    id: 'act-2',
    table: 'customer_contact',
    stage: 'Transforming',
    detail: 'Applying E.164 phone normalization & address JSON parser (Chunk 24/35)',
    status: 'active',
    progressPct: 68.0
  },
  {
    id: 'act-3',
    table: 'invoices',
    stage: 'Extracting',
    detail: 'Extracting Chunk 88/120 from aws-east-pg01 via replica snapshot',
    status: 'active',
    progressPct: 73.3
  },
  {
    id: 'act-4',
    table: 'subscriptions',
    stage: 'Validating',
    detail: 'Checksum verification against target billing.subscriptions table',
    status: 'completed',
    progressPct: 100.0
  }
];

export const initialLogs: MigrationLogEntry[] = [
  { id: 'log-1', timestamp: '10:42:31', table: 'orders', step: 'Extracting', status: 'success', message: 'Read 2,431,221 rows from source partition 2026_q1' },
  { id: 'log-2', timestamp: '10:42:38', table: 'orders', step: 'Transforming', status: 'success', message: 'Applied customer_orders N:1 merge aggregation rules' },
  { id: 'log-3', timestamp: '10:43:01', table: 'orders', step: 'Loading', status: 'success', message: 'Batch 412/600 committed to target PostgreSQL' },
  { id: 'log-4', timestamp: '10:43:05', table: 'customers', step: 'Extracting', status: 'success', message: 'Read 1,420,500 customer records in 4 parallel threads' },
  { id: 'log-5', timestamp: '10:43:09', table: 'customers', step: 'Transforming', status: 'warning', message: '12,110 duplicate phone numbers detected; applying deduplication merge' },
  { id: 'log-6', timestamp: '10:43:10', table: 'customers', step: 'Validating', status: 'error', message: '42,381 rows quarantined to DLQ: Missing parent FK in legacy customer archive' },
  { id: 'log-7', timestamp: '10:43:14', table: 'invoices', step: 'Extracting', status: 'success', message: 'Extractor thread #02 initialized for billing.invoices' },
  { id: 'log-8', timestamp: '10:43:22', table: 'invoices', step: 'Transforming', status: 'success', message: 'Currency precision check passed for 1,980,000 ledger rows' },
  { id: 'log-9', timestamp: '10:43:30', table: 'subscriptions', step: 'Loading', status: 'success', message: 'Bulk COPY stream written to core.subscriptions (0 errors)' },
  { id: 'log-10', timestamp: '10:43:35', table: 'subscriptions', step: 'Validating', status: 'success', message: 'Row count checksum 420,000 matches source exactly (100% matched)' }
];

export const sampleMappingJson = `{
  "$schema": "https://enterprise.internal/schemas/v2/migration-mapping.json",
  "migration_id": "MIG-2026-0928-PROD",
  "source_cluster": "aws-east-pg01.internal:5432",
  "target_cluster": "pg-cloud-aurora.internal:5432",
  "statistics": {
    "total_mappings": 245,
    "transformations": 18,
    "merge_rules": 4,
    "split_rules": 7
  },
  "rules": [
    {
      "type": "SPLIT",
      "source_table": "public.customers",
      "targets": [
        {
          "table": "core.customer_profile",
          "columns": { "customer_id": "customer_id", "first_name": "first_name", "last_name": "last_name", "email": "email" }
        },
        {
          "table": "core.customer_contact",
          "columns": { "customer_id": "customer_id", "phone": "phone_normalized", "billing_address": "billing_address" },
          "transformations": { "phone": "NORMALIZE_E164", "billing_address": "JSON_PARSE" }
        }
      ]
    },
    {
      "type": "MERGE",
      "source_tables": ["sales.orders", "sales.order_items"],
      "join_key": "order_id",
      "target_table": "core.customer_orders",
      "transformations": {
        "orders.discount_code": "SAFE_DISCOUNT_LOOKUP",
        "order_items": "AGGREGATE_TO_JSONB"
      }
    }
  ]
}`;
