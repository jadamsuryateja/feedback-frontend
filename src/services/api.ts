import { Config } from '../types';

const API_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const getToken = () => localStorage.getItem('token');

export const api = {
  auth: {
    login: async (credentials: { username: string; password: string; role: string }) => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });
        
        return handleResponse(response);
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },

    verify: async () => {
      const token = getToken();
      if (!token) throw new Error('No token');
      const response = await fetch(`${API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Verification failed');
      return response.json();
    }
  },

  config: {
    create: async (config: Config) => {
      try {
        const response = await fetch(`${API_URL}/config`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          },
          body: JSON.stringify(config)
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.error === 'Configuration with this title already exists') {
            return { error: 'DUPLICATE_TITLE' };
          }
          throw new Error(data.error || 'Failed to create configuration');
        }

        return data;
      } catch (error: any) {
        console.error('Create config error:', error);
        throw new Error(error.message || 'Failed to create configuration');
      }
    },

    getAll: async (params?: any) => {
      const token = getToken();
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      const response = await fetch(`${API_URL}/config${queryString}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch configs');
      return response.json();
    },

    getByTitle: async (title: string) => {
      const response = await fetch(`${API_URL}/config/title/${encodeURIComponent(title)}`);
      if (!response.ok) throw new Error('Failed to fetch config');
      return response.json();
    },

    update: async (id: string, data: Config) => {
      try {
        const response = await fetch(`${API_URL}/config/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update config');
        }

        return await response.json();
      } catch (error) {
        console.error('Error updating config:', error);
        throw error;
      }
    },

    delete: async (id: string) => {
      try {
        const response = await fetch(`${API_URL}/config/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to delete config');
        }

        return await response.json();
      } catch (error) {
        console.error('Error deleting config:', error);
        throw error;
      }
    }
  },

  feedback: {
    submit: async (data: any) => {
      const response = await fetch(`${API_URL}/feedback/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to submit feedback');
      return response.json();
    },

    getSummary: async (params: any) => {
      const token = getToken();
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}/feedback/summary?${queryString}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch summary');
      return response.json();
    },

    getResponses: async (params: any) => {
      const token = getToken();
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}/feedback/responses?${queryString}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch responses');
      return response.json();
    }
  }
};

// Example usage in components
const handleSubmit = async (config: Config) => {
  try {
    await api.config.create(config);
    // Handle success
  } catch (error) {
    // Handle error
  }
};

const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      data
    });
    
    throw new Error(data.error || data.message || 'Server error');
  }
  
  return data;
};
