import api from './api';

export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const deleteUser = async (username) => {
  try {
    const response = await api.delete(`/users/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const updateUserRole = async (username, role) => {
  try {
    const response = await api.patch(`/users/${username}/role`, { role });
    return response.data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const changePassword = async (username, newPassword) => {
  try {
    const response = await api.patch(`/users/${username}/password`, { newPassword });
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};