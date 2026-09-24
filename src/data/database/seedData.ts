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
  // Reference Group
  { id: 'makes', name: 'Makes', category: 'Reference', sourceCount: 28, stgCount: 28, prodCount: 23 },
  { id: 'models', name: 'Models', category: 'Reference', sourceCount: 573, stgCount: 573, prodCount: 556 },
  { id: 'vehicles', name: 'Vehicles', category: 'Reference', sourceCount: 3500, stgCount: 3500, prodCount: 3418 },
  { id: 'years', name: 'Years', category: 'Reference', sourceCount: 15, stgCount: 15, prodCount: 15 },
  { id: 'regions', name: 'Regions', category: 'Reference', sourceCount: 8, stgCount: 8, prodCount: 8 },

  // MCS Group
  { id: 'mcs', name: 'MCS', category: 'MCS', sourceCount: 64, stgCount: 64, prodCount: 64 },
  { id: 'mcs_systems', name: 'MCS Systems', category: 'MCS', sourceCount: 767, stgCount: 767, prodCount: 767 },
  { id: 'mcs_subsystems', name: 'MCS Subsystems', category: 'MCS', sourceCount: 8635, stgCount: 8635, prodCount: 8635 },
  { id: 'mcs_procedures', name: 'MCS Procedures', category: 'MCS', sourceCount: 1648344, stgCount: 1648344, prodCount: 1126466 },

  // PCS Group
  { id: 'pcs', name: 'PCS', category: 'PCS', sourceCount: 3724, stgCount: 3631, prodCount: 3627 },
  { id: 'pcs_systems', name: 'PCS Systems', category: 'PCS', sourceCount: 42684, stgCount: 42684, prodCount: 41386 },
  { id: 'pcs_subsystems', name: 'PCS Subsystems', category: 'PCS', sourceCount: 219004, stgCount: 219004, prodCount: 213878 },
  { id: 'pcs_procedures', name: 'PCS Procedures', category: 'PCS', sourceCount: 8955290, stgCount: 8955290, prodCount: 8804680 },

  // Authoring Group
  { id: 'draft_tables', name: 'Draft Tables', category: 'Authoring', sourceCount: 120, stgCount: 120, prodCount: 115 },
  { id: 'published_tables', name: 'Published Tables', category: 'Authoring', sourceCount: 450, stgCount: 450, prodCount: 442 },
  { id: 'history_tables', name: 'History Tables', category: 'Authoring', sourceCount: 890, stgCount: 890, prodCount: 890 }
];
