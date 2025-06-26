// src/services/tableService.js - Updated with real chat implementation
import { URL_MAPPINGS, urlHelpers } from '../config/urlMappings';
import ApiService from './apiService';
import logger from '../utils/logger';

class TableService {
  constructor(token) {
    this.myustaApi = new ApiService(URL_MAPPINGS.base.myusta, token);
    this.chatApi = new ApiService(URL_MAPPINGS.base.chat, token);
    this.fetchInProgress = false; // Prevent duplicate calls
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
    // Prevent duplicate calls
    if (this.fetchInProgress) {
      console.log('⏸️ Fetch already in progress, skipping...');
      return { myusta: [], chat: [] };
    }

    this.fetchInProgress = true;
    console.log('🚀 Fetching all tables...');
    
    try {
      let myustaTables = [];
      let chatTables = [];

      // Get MyUsta tables (primary backend)
      try {
        myustaTables = await this.getMyustaTables();
        console.log(`✅ MyUsta tables: ${myustaTables.length}`);
      } catch (error) {
        console.error('❌ MyUsta backend error:', error.message);
        throw error; // MyUsta errors are critical
      }

      // Get chat backend tables - now using real implementation
      try {
        chatTables = await this.getChatTables();
        console.log(`✅ Chat tables: ${chatTables.length}`);
      } catch (error) {
        console.warn('⚠️ Chat backend error:', error.message);
        // For chat backend, we still provide a minimal fallback but try real implementation first
        chatTables = [];
      }

      const result = {
        myusta: myustaTables,
        chat: chatTables
      };

      console.log(`✅ Total tables fetched: ${myustaTables.length + chatTables.length}`);
      return result;

    } catch (error) {
      console.error('❌ Failed to fetch tables:', error.message);
      throw error;
    } finally {
      this.fetchInProgress = false;
    }
  }

  // Get MyUsta tables - Enhanced error handling
  async getMyustaTables() {
    try {
      console.log('🔄 Calling MyUsta API: /api/admin/models');
      const response = await this.myustaApi.get('/api/admin/models');
      
      console.log('📥 MyUsta API Response:', {
        success: response.success,
        hasData: !!response.data,
        hasResult: !!response.data?.result,
        dataKeys: response.data ? Object.keys(response.data) : [],
        totalModels: response.data?.totalModels || response.data?.result?.totalModels
      });
      
      // Handle both response.data.result and response.data.models
      let models = null;
      let totalModels = 0;
      
      if (response.success && response.data) {
        // Try response.data.result first (new structure)
        if (response.data.result && response.data.result.models) {
          models = response.data.result.models;
          totalModels = response.data.result.totalModels;
          console.log('✅ Using response.data.result structure');
        }
        // Fallback to response.data.models (old structure)
        else if (response.data.models) {
          models = response.data.models;
          totalModels = response.data.totalModels;
          console.log('✅ Using response.data structure');
        }
      }
      
      if (!models || !Array.isArray(models)) {
        console.error('❌ Invalid response structure:', response.data);
        throw new Error('Invalid response format from MyUsta backend - no models array found');
      }

      console.log(`📊 Processing ${models.length} MyUsta models`);
      
      const mappedTables = models.map((model, index) => {
        console.log(`Processing model ${index + 1}:`, {
          name: model.name,
          tableName: model.tableName,
          attributesCount: model.attributes?.length || 0,
          associationsCount: model.associations?.length || 0
        });
        
        return {
          name: model.name,
          tableName: model.tableName,
          displayName: this.formatTableName(model.name),
          backend: 'myusta',
          attributes: model.attributes || [],
          associations: model.associations || [],
          primaryKey: model.primaryKey || 'id',
          totalModels: totalModels
        };
      });

      console.log('✅ MyUsta tables processed successfully:', {
        count: mappedTables.length,
        tables: mappedTables.map(t => t.name)
      });

      return mappedTables;
      
    } catch (error) {
      console.error('❌ MyUsta API error:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // Get Chat tables - REAL IMPLEMENTATION (no more mock)
  async getChatTables() {
    try {
      console.log('🔄 Calling Chat API: /api/v1/admin/models');
      
      // First check if chat backend is available with health check
      try {
        const healthCheck = await this.chatApi.get('/api/v1/admin/health');
        if (!healthCheck.success) {
          throw new Error('Chat backend health check failed');
        }
        console.log('✅ Chat backend health check passed');
      } catch (healthError) {
        console.warn('⚠️ Chat backend health check failed:', healthError.message);
        throw new Error(`Chat backend not available: ${healthError.message}`);
      }

      // Get models from chat backend
      const response = await this.chatApi.get('/api/v1/admin/models');
      
      console.log('📥 Chat API Response:', {
        success: response.success,
        hasData: !!response.data,
        hasResult: !!response.data?.result,
        dataKeys: response.data ? Object.keys(response.data) : []
      });
      
      // Handle chat response structure (similar to MyUsta)
      let models = null;
      let totalModels = 0;
      
      if (response.success && response.data) {
        // Try response.data.result first
        if (response.data.result && response.data.result.models) {
          models = response.data.result.models;
          totalModels = response.data.result.totalModels;
          console.log('✅ Using chat response.data.result structure');
        }
        // Fallback to response.data.models
        else if (response.data.models) {
          models = response.data.models;
          totalModels = response.data.totalModels;
          console.log('✅ Using chat response.data structure');
        }
      }
      
      if (!models || !Array.isArray(models)) {
        console.warn('⚠️ Invalid chat response structure:', response.data);
        throw new Error('Invalid response format from Chat backend - no models array found');
      }

      console.log(`📊 Processing ${models.length} Chat models`);
      
      const mappedTables = models.map((model, index) => {
        console.log(`Processing chat model ${index + 1}:`, {
          name: model.name,
          tableName: model.tableName,
          attributesCount: model.attributes?.length || 0,
          associationsCount: model.associations?.length || 0
        });
        
        return {
          name: model.name,
          tableName: model.tableName,
          displayName: this.formatTableName(model.name),
          backend: 'chat',
          attributes: model.attributes || [],
          associations: model.associations || [],
          primaryKey: model.primaryKey || 'id',
          totalModels: totalModels
        };
      });

      console.log('✅ Chat tables processed successfully:', {
        count: mappedTables.length,
        tables: mappedTables.map(t => t.name)
      });

      return mappedTables;
      
    } catch (error) {
      console.error('❌ Chat API error:', {
        message: error.message,
        stack: error.stack
      });
      // Don't fail the entire app if chat backend is unavailable
      throw error;
    }
  }

  // Get table data - Enhanced for real chat implementation
  async getTableData(table, options = {}) {
    const { page = 1, size = 20, search = '', sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    console.log(`📊 Fetching data for ${table.name} (${table.backend})`);

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
        ...(sortOrder && { sortOrder })
      };

      const endpoint = urlHelpers.withQuery(baseEndpoint, params);
      const response = await api.get(endpoint);
      
      console.log(`📥 ${table.backend} data response:`, {
        success: response.success,
        hasData: !!response.data,
        hasResult: !!response.data?.result,
        dataKeys: response.data ? Object.keys(response.data) : []
      });
      
      if (response.success && response.data) {
        // Handle both response structures
        let records = [];
        let pagination = {};
        let model = table;
        
        // Try response.data.result first
        if (response.data.result) {
          records = response.data.result.records || [];
          pagination = response.data.result.pagination || {};
          model = response.data.result.model || table;
        }
        // Fallback to direct response.data
        else {
          records = response.data.records || [];
          pagination = response.data.pagination || {};
          model = response.data.model || table;
        }
        
        console.log(`✅ ${table.name} data fetched: ${records.length} records`);
        
        return {
          records,
          pagination,
          model,
          success: true
        };
      }
      
      throw new Error(response.error || 'Failed to fetch table data');
    } catch (error) {
      console.error(`❌ Error fetching ${table.name} data:`, error.message);
      
      return {
        records: [],
        pagination: { currentPage: 1, pageSize: size, totalItems: 0 },
        model: table,
        success: false,
        error: error.message
      };
    }
  }

  // Get table schema - Enhanced for real chat implementation
  async getTableSchema(table) {
    console.log(`🏗️ Fetching schema for ${table.name} (${table.backend})`);

    const api = table.backend === 'myusta' ? this.myustaApi : this.chatApi;
    const endpoint = table.backend === 'myusta' 
      ? `/api/admin/models/${table.name}/schema` 
      : `/api/v1/admin/models/${table.name}/schema`;

    try {
      const response = await api.get(endpoint);
      
      if (response.success && response.data) {
        // Handle both response structures
        let attributes = [];
        let associations = [];
        let model = {};
        
        // Try response.data.result first
        if (response.data.result) {
          attributes = response.data.result.attributes || table.attributes || [];
          associations = response.data.result.associations || table.associations || [];
          model = response.data.result.model || {
            name: table.name,
            tableName: table.tableName,
            primaryKey: table.primaryKey || 'id'
          };
        }
        // Fallback to direct response.data
        else {
          attributes = response.data.attributes || table.attributes || [];
          associations = response.data.associations || table.associations || [];
          model = response.data.model || {
            name: table.name,
            tableName: table.tableName,
            primaryKey: table.primaryKey || 'id'
          };
        }
        
        return {
          success: true,
          attributes,
          associations,
          model
        };
      }
      
      throw new Error(response.error || 'Failed to fetch table schema');
    } catch (error) {
      console.error(`❌ Error fetching ${table.name} schema:`, error.message);
      
      // Return fallback schema using table attributes
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

  // Get single record - Works for both backends
  async getRecord(table, recordId) {
    console.log(`📝 Fetching record ${recordId} from ${table.name}`);

    const api = table.backend === 'myusta' ? this.myustaApi : this.chatApi;
    const endpoint = table.backend === 'myusta' 
      ? `/api/admin/models/${table.name}/records/${recordId}` 
      : `/api/v1/admin/models/${table.name}/records/${recordId}`;

    try {
      const response = await api.get(endpoint);
      
      if (response.success && response.data) {
        // Handle both response structures
        let record = {};
        
        if (response.data.result) {
          record = response.data.result.record || response.data.result;
        } else {
          record = response.data.record || response.data;
        }
        
        return {
          success: true,
          record
        };
      }
      
      throw new Error(response.error || 'Record not found');
    } catch (error) {
      console.error(`❌ Error fetching record ${recordId}:`, error.message);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update record - Works for both backends
  async updateRecord(table, recordId, data) {
    const api = table.backend === 'myusta' ? this.myustaApi : this.chatApi;
    const endpoint = table.backend === 'myusta' 
      ? `/api/admin/models/${table.name}/records/${recordId}`
      : `/api/v1/admin/models/${table.name}/records/${recordId}`;

    try {
      const response = await api.put(endpoint, data);
      
      if (response.success) {
        let record = {};
        if (response.data.result) {
          record = response.data.result.record || response.data.result;
        } else {
          record = response.data?.record || response.data;
        }
        
        return {
          success: true,
          record
        };
      }
      
      throw new Error(response.error || 'Failed to update record');
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete record - Works for both backends
  async deleteRecord(table, recordId) {
    const api = table.backend === 'myusta' ? this.myustaApi : this.chatApi;
    const endpoint = table.backend === 'myusta' 
      ? `/api/admin/models/${table.name}/records/${recordId}`
      : `/api/v1/admin/models/${table.name}/records/${recordId}`;

    try {
      const response = await api.delete(endpoint);
      
      if (response.success) {
        let message = 'Record deleted successfully';
        if (response.data.result) {
          message = response.data.result.message || message;
        } else {
          message = response.data?.message || message;
        }
        
        return {
          success: true,
          message
        };
      }
      
      throw new Error(response.error || 'Failed to delete record');
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create record - Works for both backends
  async createRecord(table, data) {
    const api = table.backend === 'myusta' ? this.myustaApi : this.chatApi;
    const endpoint = table.backend === 'myusta' 
      ? `/api/admin/models/${table.name}/records`
      : `/api/v1/admin/models/${table.name}/records`;

    try {
      const response = await api.post(endpoint, data);
      
      if (response.success) {
        let record = {};
        if (response.data.result) {
          record = response.data.result.record || response.data.result;
        } else {
          record = response.data?.record || response.data;
        }
        
        return {
          success: true,
          record
        };
      }
      
      throw new Error(response.error || 'Failed to create record');
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update token for both API services
  updateToken(token) {
    this.myustaApi.updateToken(token);
    this.chatApi.updateToken(token);
  }

  // Clear token from both API services
  clearToken() {
    this.myustaApi.clearToken();
    this.chatApi.clearToken();
  }
}

export default TableService;