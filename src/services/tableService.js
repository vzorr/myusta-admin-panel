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

  async getTables() {
    try {
      const [myustaTables, chatTables] = await Promise.allSettled([
        this.getMyustaTables(),
        this.getChatTables()
      ]);

      return [
        ...(myustaTables.status === 'fulfilled' ? myustaTables.value : []),
        ...(chatTables.status === 'fulfilled' ? chatTables.value : [])
      ];
    } catch (error) {
      console.error('Error fetching tables:', error);
      return this.getMockTables();
    }
  }

  async getMyustaTables() {
    // Replace with actual endpoint to get table schemas
    try {
      const response = await this.myustaApi.get('/api/admin/tables');
      if (response.success) {
        return response.data.map(table => ({
          ...table,
          backend: BACKEND_TYPES.MYUSTA,
          displayName: this.formatTableName(table.name)
        }));
      }
    } catch (error) {
      console.warn('Using mock Myusta tables:', error);
    }

    // Fallback to mock data
    return [
      { 
        name: 'users', 
        endpoint: '/api/users', 
        backend: BACKEND_TYPES.MYUSTA,
        displayName: 'Users',
        columns: ['id', 'name', 'email', 'role', 'created_at']
      },
      { 
        name: 'orders', 
        endpoint: '/api/orders', 
        backend: BACKEND_TYPES.MYUSTA,
        displayName: 'Orders',
        columns: ['id', 'user_id', 'total', 'status', 'created_at']
      },
      { 
        name: 'products', 
        endpoint: '/api/products', 
        backend: BACKEND_TYPES.MYUSTA,
        displayName: 'Products',
        columns: ['id', 'name', 'price', 'category', 'stock']
      }
    ];
  }

  async getChatTables() {
    // Replace with actual endpoint to get table schemas
    try {
      const response = await this.chatApi.get('/api/admin/tables');
      if (response.success) {
        return response.data.map(table => ({
          ...table,
          backend: BACKEND_TYPES.CHAT,
          displayName: this.formatTableName(table.name)
        }));
      }
    } catch (error) {
      console.warn('Using mock Chat tables:', error);
    }

    // Fallback to mock data
    return [
      { 
        name: 'conversations', 
        endpoint: '/api/conversations', 
        backend: BACKEND_TYPES.CHAT,
        displayName: 'Conversations',
        columns: ['id', 'user_id', 'title', 'status', 'created_at']
      },
      { 
        name: 'messages', 
        endpoint: '/api/messages', 
        backend: BACKEND_TYPES.CHAT,
        displayName: 'Messages',
        columns: ['id', 'conversation_id', 'content', 'sender', 'timestamp']
      }
    ];
  }

  async getTableData(table) {
    const api = table.backend === BACKEND_TYPES.MYUSTA ? this.myustaApi : this.chatApi;
    
    try {
      const response = await api.get(table.endpoint);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error);
    } catch (error) {
      console.warn(`Using mock data for ${table.name}:`, error);
      return this.getMockData(table.name);
    }
  }

  async updateRecord(table, id, data) {
    const api = table.backend === BACKEND_TYPES.MYUSTA ? this.myustaApi : this.chatApi;
    
    try {
      const response = await api.put(`${table.endpoint}/${id}`, data);
      return response;
    } catch (error) {
      console.error(`Error updating ${table.name} record:`, error);
      throw error;
    }
  }

  async deleteRecord(table, id) {
    const api = table.backend === BACKEND_TYPES.MYUSTA ? this.myustaApi : this.chatApi;
    
    try {
      const response = await api.delete(`${table.endpoint}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting ${table.name} record:`, error);
      throw error;
    }
  }

  formatTableName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' ');
  }

  getMockTables() {
    return [
      { 
        name: 'users', 
        endpoint: '/api/users', 
        backend: BACKEND_TYPES.MYUSTA,
        displayName: 'Users' 
      },
      { 
        name: 'orders', 
        endpoint: '/api/orders', 
        backend: BACKEND_TYPES.MYUSTA,
        displayName: 'Orders' 
      },
      { 
        name: 'products', 
        endpoint: '/api/products', 
        backend: BACKEND_TYPES.MYUSTA,
        displayName: 'Products' 
      },
      { 
        name: 'conversations', 
        endpoint: '/api/conversations', 
        backend: BACKEND_TYPES.CHAT,
        displayName: 'Conversations' 
      },
      { 
        name: 'messages', 
        endpoint: '/api/messages', 
        backend: BACKEND_TYPES.CHAT,
        displayName: 'Messages' 
      }
    ];
  }

  getMockData(tableName) {
    const mockData = {
      users: [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', created_at: '2024-01-15' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', created_at: '2024-01-16' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', created_at: '2024-01-17' }
      ],
      orders: [
        { id: 1, user_id: 1, total: 99.99, status: 'completed', created_at: '2024-01-15' },
        { id: 2, user_id: 2, total: 149.50, status: 'pending', created_at: '2024-01-16' },
        { id: 3, user_id: 3, total: 75.25, status: 'shipped', created_at: '2024-01-17' }
      ],
      products: [
        { id: 1, name: 'Widget A', price: 29.99, category: 'Electronics', stock: 50 },
        { id: 2, name: 'Widget B', price: 39.99, category: 'Electronics', stock: 25 },
        { id: 3, name: 'Gadget C', price: 19.99, category: 'Accessories', stock: 100 }
      ],
      conversations: [
        { id: 1, user_id: 1, title: 'Support Chat', status: 'active', created_at: '2024-01-15' },
        { id: 2, user_id: 2, title: 'Product Inquiry', status: 'closed', created_at: '2024-01-16' }
      ],
      messages: [
        { id: 1, conversation_id: 1, content: 'Hello, I need help', sender: 'user', timestamp: '2024-01-15 10:00' },
        { id: 2, conversation_id: 1, content: 'How can I assist you?', sender: 'agent', timestamp: '2024-01-15 10:01' }
      ]
    };

    return mockData[tableName] || [];
  }
}

export default TableService;