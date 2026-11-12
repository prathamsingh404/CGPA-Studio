// Frontend API Client for CGPA Studio Backend
// Uses standard fetch() with credentials: 'include' for HttpOnly JWT cookies

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    // If it's already an error with a status code, rethrow
    if (error.status) throw error;
    // Network / connection error
    throw new Error(`Network error connecting to backend: ${error.message}`);
  }
}

export const api = {
  // Health Check
  health: {
    check: () => request('/health')
  },

  // Authentication
  auth: {
    register: (name, email, password) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      }),

    login: (email, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),

    logout: () =>
      request('/auth/logout', {
        method: 'POST'
      }),

    getMe: () =>
      request('/auth/me', {
        method: 'GET'
      })
  },

  // Academic Plans (MongoDB CRUD)
  plans: {
    getAll: () =>
      request('/plans', {
        method: 'GET'
      }),

    getById: (id) =>
      request(`/plans/${id}`, {
        method: 'GET'
      }),

    create: (planData) =>
      request('/plans', {
        method: 'POST',
        body: JSON.stringify(planData)
      }),

    update: (id, planData) =>
      request(`/plans/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(planData)
      }),

    delete: (id) =>
      request(`/plans/${id}`, {
        method: 'DELETE'
      })
  }
};

