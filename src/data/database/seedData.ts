// src/data/database/seedData.ts

export interface RawEntitySeed {
  id: string;
  name: string;
  category: 'Reference' | 'MCS' | 'PCS' | 'Authoring';
  sourceCount: number;
  stgCount: number;
  prodCount: number;
}

export const rawEntitySeeds: RawEntitySeed[] = [
  // Primary Core Enterprise Migration Entities
  { id: 'orders', name: 'orders', category: 'Reference', sourceCount: 2431221, stgCount: 2431221, prodCount: 2430981 },
  { id: 'customers', name: 'customers', category: 'Reference', sourceCount: 1420500, stgCount: 1420500, prodCount: 1408390 },
  { id: 'order_items', name: 'order_items', category: 'Reference', sourceCount: 6850200, stgCount: 6850200, prodCount: 6850200 },
  { id: 'users', name: 'users', category: 'Reference', sourceCount: 580000, stgCount: 580000, prodCount: 580000 },
  { id: 'products', name: 'products', category: 'Reference', sourceCount: 125000, stgCount: 125000, prodCount: 125000 },
  { id: 'payments', name: 'payments', category: 'Reference', sourceCount: 2310000, stgCount: 2310000, prodCount: 2309850 },
  { id: 'invoices', name: 'invoices', category: 'Reference', sourceCount: 1980000, stgCount: 1980000, prodCount: 1980000 },
  { id: 'addresses', name: 'addresses', category: 'Reference', sourceCount: 1650000, stgCount: 1650000, prodCount: 1649910 },
  { id: 'subscriptions', name: 'subscriptions', category: 'Reference', sourceCount: 420000, stgCount: 420000, prodCount: 420000 },
  { id: 'transactions', name: 'transactions', category: 'Reference', sourceCount: 653410, stgCount: 653410, prodCount: 650000 },

  // Secondary catalog & procedures
  { id: 'vehicles', name: 'vehicles', category: 'Reference', sourceCount: 3500, stgCount: 3500, prodCount: 3418 },
  { id: 'models', name: 'models', category: 'Reference', sourceCount: 573, stgCount: 573, prodCount: 556 },
  { id: 'makes', name: 'makes', category: 'Reference', sourceCount: 28, stgCount: 28, prodCount: 23 },
  { id: 'audit_log', name: 'audit_log', category: 'Authoring', sourceCount: 850000, stgCount: 850000, prodCount: 820000 },
  { id: 'published_tables', name: 'published_tables', category: 'Authoring', sourceCount: 450, stgCount: 450, prodCount: 442 }
];
