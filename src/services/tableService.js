// src/services/tableService.js - Complete implementation with detailed logging
import { URL_MAPPINGS, urlHelpers } from '../config/urlMappings';
import ApiService from './apiService';
import logger from '../utils/logger';

class TableService {
  constructor(token) {
    logger.table('TableService initialized', {
      myustaEndpoint: URL_MAPPINGS.base.myusta,
      chatEndpoint: URL_MAPPINGS.base.chat,
      isDevelopment: process.env.NODE_ENV === 'development'
    });

    this.myustaApi = new ApiService(URL_MAPPINGS.base.myusta, token);
    this.chatApi = new ApiService(URL_MAPPINGS.base.chat, token);
  }

  // Format table name for display
  formatTableName(name) {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  // Get all tables from both backends
  async getTables() {
    logger.separator('FETCHING ALL TABLES');
    
    try {
      const [myustaTables, chatTables] = await Promise.allSettled([
        this.getMyustaTables(),
        this.getChatTables()
      ]);

      const result = {
        myusta: myustaTables.status === 'fulfilled' ? myustaTables.value : [],
        chat: chatTables.status === 'fulfilled' ? chatTables.value : []
      };

      logger.success('All tables fetched', {
        myustaCount: result.myusta.length,
        chatCount: result.chat.length,
        totalCount: result.myusta.length + result.chat.length
      });

      return result;
    } catch (error) {
      logger.error('Failed to fetch tables', error.message);
      throw error;
    }
  }

  // Get MyUsta tables - uses localhost:3000/api/admin/models
  async getMyustaTables() {
    logger.table('Fetching MyUsta tables', {
      endpoint: URL_MAPPINGS.myusta.admin.models()
    });

    try {
      const response = await this.myustaApi.get('/api/admin/models');
      
      if (response.success && response.data?.models) {
        const mappedTables = response.data.models.map(model => ({
          name: model.name,
          tableName: model.tableName,
          displayName: this.formatTableName(model.name),
          backend: 'myusta',
          attributes: model.attributes || [],
          associations: model.associations || [],
          primaryKey: model.primaryKey,
          totalModels: response.data.totalModels
        }));

        logger.success('MyUsta tables fetched', { count: mappedTables.length });
        return mappedTables;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      logger.error('MyUsta tables fetch failed', error.message);
      return [];
    }
  }

  // Get Chat tables - uses localhost:5000/api/v1/admin/models
  async getChatTables() {
    logger.table('Fetching Chat tables', {
      endpoint: URL_MAPPINGS.chat.admin.models()
    });

    try {
      const response = await this.chatApi.get('/api/v1/admin/models');
      
      if (response.success && response.data?.models) {
        const mappedTables = response.data.models.map(model => ({
          name: model.name,
          tableName: model.tableName,
          displayName: this.formatTableName(model.name),
          backend: 'chat',
          attributes: model.attributes || [],
          associations: model.associations || [],
          primaryKey: model.primaryKey
        }));

        logger.success('Chat tables fetched', { count: mappedTables.length });
        return mappedTables;
      }
      
      throw new Error('Chat API not available');
    } catch (error) {
      logger.warn('Chat API not available, returning mock data', error.message);
      
      // Return mock data if chat backend is not available
      const mockTables = [
        {
          name: 'ChatUser',
          tableName: 'chat_users',
          displayName: 'Chat Users',
          backend: 'chat',
          attributes: ['id', 'username', 'email', 'status', 'createdAt'],
          associations: ['messages', 'conversations'],
          primaryKey: 'id'
        },
        {
          name: 'Message',
          tableName: 'messages',
          displayName: 'Messages',
          backend: 'chat',
          attributes: ['id', 'userId', 'content', 'timestamp', 'type'],
          associations: ['user', 'conversation'],
          primaryKey: 'id'
        }
      ];

      return mockTables;
    }
  }

  // Get table data with correct endpoint paths
  async getTableData(table, options = {}) {
    const { page = 1, size = 20, search = '', sortBy = 'createdAt', sortOrder = 'DESC', filters = {} } = options;

    logger.table('Fetching table data', {
      tableName: table.name,
      backend: table.backend,
      options
    });

    const api = table.backend === 'myusta' ? this.myustaApi : this.chatApi;
    const baseEndpoint = table.backend === 'myusta' 
      ? `/api/admin/models/${table.name}/records` 
      : `/api/v1/admin/models/${table.name}/records`;
    
    try {
      const params = {
        page: page.toString(),
        size: size.toString(),
        ...(search && { search }),
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder }),
        ...(Object.keys(filters).length > 0 && { filters: JSON.stringify(filters) })
      };

      const endpoint = urlHelpers.withQuery(baseEndpoint, params);
      const response = await api.get(endpoint);
      
      if (response.success && response.data) {
        logger.success('Table data fetched', {
          recordsCount: response.data.records?.length || 0
        });
        
        return {
          records: response.data.records || [],
          pagination: response.data.pagination || {},
          model: response.data.model || table,
          success: true
        };
      }
      
      throw new Error(response.error || 'Failed to fetch table data');
    } catch (error) {
      logger.error(`Error fetching ${table.name} data`, error.message);
      return {
        records: [],
        pagination: {},
        model: table,
        success: false,
        error: error.message
      };
    }
  }

  // Get table schema
  async getTableSchema(table) {
    logger.table('Fetching table schema', {
      tableName: table.name,
      backend: table.backend
    });

    const api = table.backend === 'myusta' ? this.myustaApi : this.chatApi;
    const endpoint = table.backend === 'myusta' 
      ? `/api/admin/models/${table.name}/schema` 
      : `/api/v1/admin/models/${table.name}/schema`;

    try {
      const response = await api.get(endpoint);
      
      if (response.success && response.data) {
        logger.success('Table schema fetched', {
          attributesCount: response.data.attributes?.length || 0,
          associationsCount: response.data.associations?.length || 0
        });
        
        return {
          success: true,
          attributes: response.data.attributes || table.attributes || [],
          associations: response.data.associations || table.associations || [],
          model: response.data.model || {
            name: table.name,
            tableName: table.tableName,
            primaryKey: table.primaryKey || 'id'
          },
          statistics: response.data.statistics || {
            totalFields: response.data.attributes?.length || 0,
            totalAssociations: response.data.associations?.length || 0,
            requiredFields: response.data.attributes?.filter(attr => !attr.allowNull)?.length || 0,
            uniqueFields: response.data.attributes?.filter(attr => attr.unique)?.length || 0
          }
        };
      }
      
      throw new Error(response.error || 'Failed to fetch table schema');
    } catch (error) {
      logger.error(`Error fetching ${table.name} schema`, error.message);
      
      // Return fallback schema using table attributes if available
      return {
        success: false,
        error: error.message,
        attributes: table.attributes || [],
        associations: table.associations || [],
        model: {
          name: table.name,
          tableName: table.tableName,
          primaryKey: table.primaryKey || 'id'
        }
      };
    }
  }

  // Get single record
  async getRecord(table, recordId) {
    logger.table('Fetching single record', {
      tableName: table.name,
      recordId,
      backend: table.backend
    });

    const api = table.backend === 'myusta' ? this.myustaApi : this.chatApi;
    const endpoint = table.backend === 'myusta' 
      ? `/api/admin/models/${table.name}/records/${recordId}` 
      : `/api/v1/admin/models/${table.name}/records/${recordId}`;

    try {
      const response = await api.get(endpoint);
      
      if (response.success && response.data) {
        logger.success('Record fetched', { recordId });
        
        return {
          success: true,
          record: response.data.record || response.data
        };
      }
      
      throw new Error(response.error || 'Record not found');
    } catch (error) {
      logger.error(`Error fetching record ${recordId}`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update record
  async updateRecord(table, recordId, data) {
    logger.table('Updating record', {
      tableName: table.name,
      recordId,
      updateFields: Object.keys(data || {}),
      backend: table.backend
    });

    const api = table.backend === 'myusta' ? this.myustaApi : this.chatApi;
    const endpoint = table.backend === 'myusta' 
      ? `/api/admin/models/${table.name}/records/${recordId}` 
      : `/api/v1/admin/models/${table.name}/records/${recordId}`;

    try {
      const response = await api.put(endpoint, data);
      
      if (response.success) {
        logger.success('Record updated', { recordId });
        
        return {
          success: true,
          record: response.data?.record || response.data
        };
      }
      
      throw new Error(response.error || 'Failed to update record');
    } catch (error) {
      logger.error(`Error updating record ${recordId}`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete record
  async deleteRecord(table, recordId) {
    logger.table('Deleting record', {
      tableName: table.name,
      recordId,
      backend: table.backend
    });

    const api = table.backend === 'myusta' ? this.myustaApi : this.chatApi;
    const endpoint = table.backend === 'myusta' 
      ? `/api/admin/models/${table.name}/records/${recordId}` 
      : `/api/v1/admin/models/${table.name}/records/${recordId}`;

    try {
      const response = await api.delete(endpoint);
      
      if (response.success) {
        logger.success('Record deleted', { recordId });
        
        return {
          success: true,
          message: response.data?.message || 'Record deleted successfully'
        };
      }
      
      throw new Error(response.error || 'Failed to delete record');
    } catch (error) {
      logger.error(`Error deleting record ${recordId}`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create record
  async createRecord(table, data) {
    logger.table('Creating record', {
      tableName: table.name,
      fields: Object.keys(data || {}),
      backend: table.backend
    });

    const api = table.backend === 'myusta' ? this.myustaApi : this.chatApi;
    const endpoint = table.backend === 'myusta' 
      ? `/api/admin/models/${table.name}/records` 
      : `/api/v1/admin/models/${table.name}/records`;

    try {
      const response = await api.post(endpoint, data);
      
      if (response.success) {
        logger.success('Record created', {
          recordId: response.data?.record?.id || response.data?.id
        });
        
        return {
          success: true,
          record: response.data?.record || response.data
        };
      }
      
      throw new Error(response.error || 'Failed to create record');
    } catch (error) {
      logger.error('Error creating record', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Global search across all tables
  async searchGlobal(searchTerm, tables = []) {
    logger.table('Starting global search', {
      searchTerm,
      tablesCount: tables.length
    });

    const searchPromises = tables.map(async (table) => {
      try {
        const result = await this.getTableData(table, {
          search: searchTerm,
          size: 5 // Limit results per table
        });
        
        if (result.success && result.records.length > 0) {
          return {
            table,
            records: result.records,
            totalFound: result.pagination?.totalItems || result.records.length
          };
        }
        
        return null;
      } catch (error) {
        logger.warn(`Search failed for table ${table.name}`, error.message);
        return null;
      }
    });

    try {
      const results = await Promise.allSettled(searchPromises);
      const validResults = results
        .filter(result => result.status === 'fulfilled' && result.value !== null)
        .map(result => result.value);

      logger.success('Global search completed', {
        resultsCount: validResults.length,
        totalRecords: validResults.reduce((sum, result) => sum + result.records.length, 0)
      });

      return validResults;
    } catch (error) {
      logger.error('Global search failed', error.message);
      return [];
    }
  }

  // Update token for both API services
  updateToken(token) {
    logger.auth('Updating token in TableService');
    this.myustaApi.updateToken(token);
    this.chatApi.updateToken(token);
  }

  // Clear token from both API services
  clearToken() {
    logger.auth('Clearing token in TableService');
    this.myustaApi.clearToken();
    this.chatApi.clearToken();
  }
}

export default TableService;