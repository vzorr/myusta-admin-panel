// src/services/tableService.js - Fixed to handle MyUsta response structure
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
      // Always get MyUsta tables (primary backend)
      let myustaTables = [];
      let chatTables = [];

      try {
        myustaTables = await this.getMyustaTables();
        console.log(`✅ MyUsta tables: ${myustaTables.length}`);
      } catch (error) {
        console.error('❌ MyUsta backend error:', error.message);
        throw error; // MyUsta errors are critical
      }

      // Try chat backend but don't fail if it's not available
      try {
        chatTables = await this.getChatTables();
        console.log(`✅ Chat tables: ${chatTables.length}`);
      } catch (error) {
        console.warn('⚠️ Chat backend not available, using mock data:', error.message);
        chatTables = this.getMockChatTables();
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

  // Get MyUsta tables - FIXED to handle response.data.result structure
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
      
      // FIXED: Handle both response.data.result and response.data.models
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

  // Get Chat tables - optional backend
  async getChatTables() {
    try {
      // First check if chat backend is available
      const healthCheck = await this.chatApi.get('/api/v1/admin/health');
      
      if (!healthCheck.success) {
        throw new Error('Chat backend health check failed');
      }

      const response = await this.chatApi.get('/api/v1/admin/models');
      
      // Handle chat response structure (similar to MyUsta fix)
      let models = null;
      
      if (response.success && response.data) {
        if (response.data.result && response.data.result.models) {
          models = response.data.result.models;
        } else if (response.data.models) {
          models = response.data.models;
        }
      }
      
      if (models && Array.isArray(models)) {
        return models.map(model => ({
          name: model.name,
          tableName: model.tableName,
          displayName: this.formatTableName(model.name),
          backend: 'chat',
          attributes: model.attributes || [],
          associations: model.associations || [],
          primaryKey: model.primaryKey || 'id'
        }));
      }
      
      throw new Error('Invalid response from chat backend');
    } catch (error) {
      // Chat backend errors are not critical
      throw new Error(`Chat backend unavailable: ${error.message}`);
    }
  }

  // Return mock chat tables when backend is unavailable
  getMockChatTables() {
    return [
      {
        name: 'ChatUser',
        tableName: 'chat_users',
        displayName: 'Chat Users',
        backend: 'chat',
        attributes: [
          { name: 'id', type: 'INTEGER', primaryKey: true },
          { name: 'username', type: 'STRING' },
          { name: 'email', type: 'STRING' },
          { name: 'status', type: 'STRING' },
          { name: 'createdAt', type: 'DATE' }
        ],
        associations: [],
        primaryKey: 'id',
        isMock: true
      },
      {
        name: 'Message',
        tableName: 'messages',
        displayName: 'Messages',
        backend: 'chat',
        attributes: [
          { name: 'id', type: 'INTEGER', primaryKey: true },
          { name: 'userId', type: 'INTEGER' },
          { name: 'content', type: 'TEXT' },
          { name: 'timestamp', type: 'DATE' },
          { name: 'type', type: 'STRING' }
        ],
        associations: [],
        primaryKey: 'id',
        isMock: true
      },
      {
        name: 'Conversation',
        tableName: 'conversations',
        displayName: 'Conversations',
        backend: 'chat',
        attributes: [
          { name: 'id', type: 'INTEGER', primaryKey: true },
          { name: 'title', type: 'STRING' },
          { name: 'type', type: 'STRING' },
          { name: 'createdAt', type: 'DATE' }
        ],
        associations: [],
        primaryKey: 'id',
        isMock: true
      }
    ];
  }

  // Get table data - FIXED to handle response.data.result structure
  async getTableData(table, options = {}) {
    const { page = 1, size = 20, search = '', sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    console.log(`📊 Fetching data for ${table.name} (${table.backend})`);

    // Handle mock tables
    if (table.isMock) {
      return {
        success: true,
        records: [],
        pagination: {
          currentPage: 1,
          pageSize: size,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        },
        model: table
      };
    }

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
        // FIXED: Handle both response structures
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
      
      // For chat backend errors, return empty data instead of failing
      if (table.backend === 'chat') {
        return {
          records: [],
          pagination: { currentPage: 1, pageSize: size, totalItems: 0 },
          model: table,
          success: true,
          warning: 'Chat backend not available'
        };
      }
      
      return {
        records: [],
        pagination: {},
        model: table,
        success: false,
        error: error.message
      };
    }
  }

  // Get table schema - FIXED to handle response.data.result structure
  async getTableSchema(table) {
    console.log(`🏗️ Fetching schema for ${table.name} (${table.backend})`);

    // Handle mock tables
    if (table.isMock) {
      return {
        success: true,
        attributes: table.attributes || [],
        associations: table.associations || [],
        model: {
          name: table.name,
          tableName: table.tableName,
          primaryKey: table.primaryKey || 'id'
        },
        warning: 'Using mock data - chat backend not available'
      };
    }

    const api = table.backend === 'myusta' ? this.myustaApi : this.chatApi;
    const endpoint = table.backend === 'myusta' 
      ? `/api/admin/models/${table.name}/schema` 
      : `/api/v1/admin/models/${table.name}/schema`;

    try {
      const response = await api.get(endpoint);
      
      if (response.success && response.data) {
        // FIXED: Handle both response structures
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
        success: table.backend === 'chat', // Don't fail for chat backend
        error: table.backend === 'myusta' ? error.message : undefined,
        warning: table.backend === 'chat' ? 'Chat backend not available' : undefined,
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

  // Get single record - FIXED to handle response.data.result structure
  async getRecord(table, recordId) {
    console.log(`📝 Fetching record ${recordId} from ${table.name}`);

    if (table.isMock) {
      return {
        success: true,
        record: {
          id: recordId,
          name: `Mock ${table.name} Record`,
          createdAt: new Date().toISOString()
        },
        warning: 'Mock data - chat backend not available'
      };
    }

    const api = table.backend === 'myusta' ? this.myustaApi : this.chatApi;
    const endpoint = table.backend === 'myusta' 
      ? `/api/admin/models/${table.name}/records/${recordId}` 
      : `/api/v1/admin/models/${table.name}/records/${recordId}`;

    try {
      const response = await api.get(endpoint);
      
      if (response.success && response.data) {
        // FIXED: Handle both response structures
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
      
      if (table.backend === 'chat') {
        return {
          success: true,
          record: { id: recordId, name: 'Mock Record' },
          warning: 'Chat backend not available'
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update, Delete, Create methods remain the same but with response.data.result handling
  async updateRecord(table, recordId, data) {
    if (table.isMock || table.backend === 'chat') {
      return {
        success: true,
        record: { ...data, id: recordId },
        warning: 'Mock update - chat backend not available'
      };
    }

    const api = this.myustaApi;
    const endpoint = `/api/admin/models/${table.name}/records/${recordId}`;

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

  async deleteRecord(table, recordId) {
    if (table.isMock || table.backend === 'chat') {
      return {
        success: true,
        message: 'Mock deletion - chat backend not available'
      };
    }

    const api = this.myustaApi;
    const endpoint = `/api/admin/models/${table.name}/records/${recordId}`;

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

  async createRecord(table, data) {
    if (table.isMock || table.backend === 'chat') {
      return {
        success: true,
        record: { ...data, id: Date.now() },
        warning: 'Mock creation - chat backend not available'
      };
    }

    const api = this.myustaApi;
    const endpoint = `/api/admin/models/${table.name}/records`;

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