// src/types/auth.js
export const AuthUser = {
  id: null,
  email: '',
  role: '',
  name: ''
};

export const LoginCredentials = {
  emailOrPhone: '',
  password: '',
  role: ''
};

export const AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null
};

// src/types/table.js
export const TableConfig = {
  name: '',
  endpoint: '',
  backend: '',
  displayName: '',
  columns: []
};

export const TableRow = {
  id: null,
  data: {}
};

export const TableState = {
  tables: [],
  selectedTable: null,
  data: [],
  loading: false,
  error: null,
  editingRow: null,
  editData: {}
};

// src/types/api.js
export const ApiResponse = {
  success: false,
  data: null,
  message: '',
  error: null
};

export const ApiError = {
  message: '',
  status: 0,
  code: ''
};