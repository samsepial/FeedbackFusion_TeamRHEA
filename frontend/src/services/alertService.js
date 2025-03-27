import api from './api';

export const getAlerts = async () => {
  try {
    const response = await api.get('/alerts');
    return response.data;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};

export const createAlert = async (alertData) => {
  try {
    const response = await api.post('/alerts', alertData);
    return response.data;
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};

export const deleteAlert = async (alertId) => {
  try {
    const response = await api.delete(`/alerts/${alertId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting alert:', error);
    throw error;
  }
};