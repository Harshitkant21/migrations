// src/data/mockApi.ts
import { 
  getEntities, 
  initialErrors, 
  databases,
  tableMappings,
  getTableDetails
} from './database';
import { 
  EntityMetadata, 
  DataQualityError, 
  Environment,
  DatabaseInfo,
  TableMappingDefinition,
  TableDetailsMetadata
} from '../types/models';

const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  getDatabases: async (): Promise<DatabaseInfo[]> => {
    await delay(50);
    return databases;
  },

  getTableMappings: async (): Promise<TableMappingDefinition[]> => {
    await delay(50);
    return tableMappings;
  },

  getTableDetails: async (tableId: string): Promise<TableDetailsMetadata> => {
    await delay(50);
    return getTableDetails(tableId);
  },

  getEntities: async (env: Environment): Promise<EntityMetadata[]> => {
    await delay(50);
    return getEntities(env);
  },

  getErrors: async (): Promise<DataQualityError[]> => {
    await delay(50);
    return initialErrors;
  }
};
