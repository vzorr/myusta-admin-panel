// src/services/tableService.js
import ApiService from './apiService';
import { API_ENDPOINTS, BACKEND_TYPES } from '../utils/constants';

class TableService {
  constructor(token) {
    this.myustaApi = new ApiService(API_ENDPOINTS.MYUSTA_BACKEND, token);
    this.chatApi = new ApiService(API_ENDPOINTS.CHAT_BACKEND, token);
  }

  setToken(token) {
    this.myustaApi.setToken(token);
    this.chatApi.setToken(token);
  }

  // Get all available models/tables
  async getTables() {
    try {
      const [myustaTables, chatTables] = await Promise.allSettled([
        this.getMyustaTables(),
        this.getChatTables()
      ]);

      return {
        myusta: myustaTables.status === 'fulfilled' ? myustaTables.value : [],
        chat: chatTables.status === 'fulfilled' ? chatTables.value : []
      };
    } catch (error) {
      console.error('Error fetching tables:', error);
      return { myusta: [], chat: [] };
    }
  }

  // Get MyUsta database tables
  async getMyustaTables() {
    try {
      const response = await this.myustaApi.get('/admin/models');
      
      if (response.success && response.data?.models) {
        return response.data.models.map(model => ({
          name: model.name,
          tableName: model.tableName,
          displayName: this.formatTableName(model.name),
          backend: BACKEND_TYPES.MYUSTA,
          attributes: model.attributes || [],
          associations: model.associations || [],
          primaryKey: model.primaryKey,
          totalModels: response.data.totalModels
        }));
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.warn('MyUsta tables API failed:', error);
      return [];
    }
  }

  // Get Chat database tables (placeholder - implement when API is available)
  async getChatTables() {
    try {
      const response = await this.chatApi.get('/admin/models');
      
      if (response.success && response.data?.models) {
        return response.data.models.map(model => ({
          name: model.name,
          tableName: model.tableName,
          displayName: this.formatTableName(model.name),
          backend: BACKEND_TYPES.CHAT,
          attributes: model.attributes || [],
          associations: model.associations || [],
          primaryKey: model.primaryKey
        }));
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.warn('Chat tables API not available or failed:', error);
      // Return mock data for now
      return [
        {
          name: 'ChatUser',
          tableName: 'chat_users',
          displayName: 'Chat Users',
          backend: BACKEND_TYPES.CHAT,
          attributes: ['id', 'username', 'email', 'status', 'createdAt'],
          associations: ['messages', 'conversations'],
          primaryKey: 'id'
        },
        {
          name: 'Message',
          tableName: 'messages',
          displayName: 'Messages',
          backend: BACKEND_TYPES.CHAT,
          attributes: ['id', 'userId', 'content', 'timestamp', 'type'],
          associations: ['user', 'conversation'],
          primaryKey: 'id'
        }
      ];
    }
  }

  // Get table data with pagination, search, and filters
  async getTableData(table, options = {}) {
    const {
      page = 1,
      size = 20,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      filters = {}
    } = options;

    const api = table.backend === BACKEND_TYPES.MYUSTA ? this.myustaApi : this.chatApi;
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        ...(search && { search }),
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder }),
        ...(Object.keys(filters).length > 0 && { filters: JSON.stringify(filters) })
      });

      const response = await api.get(`/admin/models/${table.name}?${params}`);
      
      if (response.success && response.data) {
        return {
          records: response.data.records || [],
          pagination: response.data.pagination || {},
          model: response.data.model || table,
          success: true
        };
      }
      
      throw new Error(response.error || 'Failed to fetch table data');
    } catch (error) {
      console.error(`Error fetching ${table.name} data:`, error);
      return {
        records: [],
        pagination: {},
        model: table,
        success: false,
        error: error.message
      };
    }
  }

  // Get table schema/structure
  async getTableSchema(table) {
    const api = table.backend === BACKEND_TYPES.MYUSTA ? this.myustaApi : this.chatApi;
    
    try {
      const response = await api.get(`/admin/models/${table.name}/schema`);
      
      if (response.success && response.data) {
        return {
          model: response.data.model,
          attributes: response.data.attributes || [],
          associations: response.data.associations || [],
          statistics: response.data.statistics || {},
          success: true
        };
      }
      
      throw new Error(response.error || 'Failed to fetch table schema');
    } catch (error) {
      console.error(`Error fetching ${table.name} schema:`, error);
      return {
        model: table,
        attributes: [],
        associations: [],
        statistics: {},
        success: false,
        error: error.message
      };
    }
  }

  // Get single record by ID
  async getRecord(table, recordId) {
    const api = table.backend === BACKEND_TYPES.MYUSTA ? this.myustaApi : this.chatApi;
    
    try {
      const response = await api.get(`/admin/models/${table.name}/records/${recordId}`);
      
      if (response.success && response.data) {
        return {
          record: response.data.record,
          model: response.data.model || table,
          success: true
        };
      }
      
      throw new Error(response.error || 'Record not found');
    } catch (error) {
      console.error(`Error fetching ${table.name} record ${recordId}:`, error);
      return {
        record: null,
        model: table,
        success: false,
        error: error.message
      };
    }
  }

  // Update record
  async updateRecord(table, recordId, data) {
    const api = table.backend === BACKEND_TYPES.MYUSTA ? this.myustaApi : this.chatApi;
    
    try {
      const response = await api.put(`/admin/models/${table.name}/records/${recordId}`, data);
      
      if (response.success) {
        return {
          success: true,
          record: response.data?.record || data,
          message: response.message || 'Record updated successfully'
        };
      }
      
      throw new Error(response.error || 'Failed to update record');
    } catch (error) {
      console.error(`Error updating ${table.name} record:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete record
  async deleteRecord(table, recordId) {
    const api = table.backend === BACKEND_TYPES.MYUSTA ? this.myustaApi : this.chatApi;
    
    try {
      const response = await api.delete(`/admin/models/${table.name}/records/${recordId}`);
      
      if (response.success) {
        return {
          success: true,
          message: response.message || 'Record deleted successfully'
        };
      }
      
      throw new Error(response.error || 'Failed to delete record');
    } catch (error) {
      console.error(`Error deleting ${table.name} record:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create new record
  async createRecord(table, data) {
    const api = table.backend === BACKEND_TYPES.MYUSTA ? this.myustaApi : this.chatApi;
    
    try {
      const response = await api.post(`/admin/models/${table.name}/records`, data);
      
      if (response.success) {
        return {
          success: true,
          record: response.data?.record || data,
          message: response.message || 'Record created successfully'
        };
      }
      
      throw new Error(response.error || 'Failed to create record');
    } catch (error) {
      console.error(`Error creating ${table.name} record:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Search across models
  async searchGlobal(searchTerm, models = []) {
    const searchPromises = models.map(async (model) => {
      try {
        const result = await this.getTableData(model, {
          search: searchTerm,
          size: 5 // Limit results for global search
        });
        
        return {
          model: model.name,
          results: result.records,
          total: result.pagination?.totalItems || 0
        };
      } catch (error) {
        return {
          model: model.name,
          results: [],
          total: 0,
          error: error.message
        };
      }
    });

    try {
      const results = await Promise.all(searchPromises);
      return results.filter(result => result.total > 0);
    } catch (error) {
      console.error('Global search failed:', error);
      return [];
    }
  }

  // Utility methods
  formatTableName(name) {
    return name
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .trim()
      .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
  }

  formatFieldValue(value, fieldType = 'STRING') {
    if (value === null || value === undefined) return '';
    
    switch (fieldType) {
      case 'BOOLEAN':
        return value ? 'Yes' : 'No';
      case 'DATE':
      case 'DATEONLY':
        try {
          return new Date(value).toLocaleDateString();
        } catch {
          return value;
        }
      case 'ENUM':
        return value.toString().toUpperCase();
      case 'JSON':
      case 'JSONB':
        return typeof value === 'object' ? JSON.stringify(value, null, 2) : value;
      case 'TEXT':
        return value.length > 100 ? `${value.substring(0, 100)}...` : value;
      default:
        return value.toString();
    }
  }

  getFieldIcon(fieldType) {
    const iconMap = {
      'INTEGER': '🔢',
      'STRING': '📝',
      'TEXT': '📄',
      'BOOLEAN': '☑️',
      'DATE': '📅',
      'DATEONLY': '📅',
      'ENUM': '📋',
      'JSON': '{}',
      'JSONB': '{}',
      'FLOAT': '🔢',
      'DECIMAL': '💰'
    };
    
    return iconMap[fieldType] || '📊';
  }
}

export default TableService;