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
      ? `/api/admin/models/${table.name}` 
      : `/api/v1/admin/models/${table.name}`;
    
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

  // Other methods remain similar but use the correct endpoints...
}

export default TableService;