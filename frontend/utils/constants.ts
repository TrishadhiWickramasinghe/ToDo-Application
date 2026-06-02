export const TODO_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
} as const;

export const TODO_STATUS_LABELS = {
  [TODO_STATUS.PENDING]: 'Pending',
  [TODO_STATUS.COMPLETED]: 'Completed',
} as const;

export const TODO_STATUS_COLORS = {
  [TODO_STATUS.PENDING]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    badge: '⏳',
  },
  [TODO_STATUS.COMPLETED]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    badge: '✅',
  },
} as const;

export const FILTER_OPTIONS = {
  ALL: 'all',
  PENDING: 'pending',
  COMPLETED: 'completed',
} as const;

export const API_ENDPOINTS = {
  AUTH_LOGIN: '/login',
  AUTH_REGISTER: '/register',
  AUTH_LOGOUT: '/logout',
  AUTH_PROFILE: '/profile',
  TODO_LIST: '/todos',
  TODO_CREATE: '/todos',
  TODO_UPDATE: (id: number) => `/todos/${id}`,
  TODO_DELETE: (id: number) => `/todos/${id}`,
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Your session has expired. Please login again.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful! Welcome back.',
  LOGOUT_SUCCESS: 'You have been logged out successfully.',
  REGISTRATION_SUCCESS: 'Account created successfully! Welcome aboard.',
  TODO_CREATED: 'Todo created successfully!',
  TODO_UPDATED: 'Todo updated successfully!',
  TODO_DELETED: 'Todo deleted successfully!',
  TODO_STATUS_UPDATED: 'Todo status updated!',
} as const;
