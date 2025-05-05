import axios from 'axios';

const API_URL = 'https://pizza-inventory-system.nw.r.appspot.com';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

/**
 * Error handler for API requests
 */
const handleApiError = (error, operation = 'API operation') => {
  // Extract the most useful error message
  let errorMessage = 'An error occurred during the operation';
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const status = error.response.status;
    const serverMessage = error.response.data?.message || JSON.stringify(error.response.data);
    errorMessage = `Server error (${status}): ${serverMessage}`;
    console.error(`API Error (${status})`, error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage = 'No response received from server. Please check your connection.';
    console.error('No response received:', error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    errorMessage = error.message || 'Unknown error occurred';
    console.error('Request error:', error.message);
  }
  
  console.error(`${operation} failed:`, errorMessage);
  return { error: true, message: errorMessage };
};

/**
 * Pizza Dashboard API Service
 * This service handles all API calls to the backend
 */
const ApiService = {
  /**
   * Get all active orders
   */
  getOrders: async () => {
    try {
      console.log('Fetching orders...');
      const response = await api.get('/api/orders');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Get orders');
    }
  },

  /**
   * Get all archived orders
   */
  getArchivedOrders: async () => {
    try {
      console.log('Fetching archived orders...');
      const response = await api.get('/api/archived-orders');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Get archived orders');
    }
  },

  /**
   * Create a new order
   */
  createOrder: async (orderData) => {
    try {
      console.log('Creating new order:', orderData);
      const response = await api.post('/api/orders', orderData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Create order');
    }
  },

  /**
   * Update an existing order
   */
  updateOrder: async (orderId, orderData) => {
    try {
      console.log(`Updating order ${orderId}:`, orderData);
      const response = await api.put(`/api/orders/${orderId}`, orderData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Update order');
    }
  },

  /**
   * Delete an order
   */
  deleteOrder: async (orderId) => {
    try {
      console.log(`Deleting order ${orderId}`);
      const response = await api.delete(`/api/orders/${orderId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Delete order');
    }
  },

  /**
   * Archive an order
   */
  archiveOrder: async (orderId) => {
    try {
      console.log(`Archiving order ${orderId}`);
      const response = await api.post(`/api/orders/${orderId}/archive`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Archive order');
    }
  },

  /**
   * Update the completion status of a pizza in an order
   */
  updatePizzaStatus: async (orderId, cookedArray, status) => {
    try {
      console.log(`Updating pizza status for order ${orderId}`, { cookedArray, status });
      const response = await api.put(`/api/orders/${orderId}/pizza-status`, { 
        cooked: cookedArray,
        status
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Update pizza status');
    }
  },

  /**
   * Ping the server to check if it's online
   */
  pingServer: async () => {
    try {
      const response = await api.get('/api/ping');
      return { success: true, message: response.data.message };
    } catch (error) {
      return handleApiError(error, 'Ping server');
    }
  }
};

export default ApiService;
