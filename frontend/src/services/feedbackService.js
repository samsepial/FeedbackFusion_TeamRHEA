import api from './api';

export const getFeedback = async () => {
  try {
    const response = await api.get('/feedback');
    return response.data;
  } catch (error) {
    console.error('Error fetching feedback:', error);
    throw error;
  }
};

export const getHistoricalData = async (params) => {
  try {
    const response = await api.get('/feedback/historical', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};

export const uploadFeedbackFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/feedback/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading feedback file:', error);
    throw error;
  }
};

export const scrapeReviews = async () => {
  try {
    const response = await api.post('/feedback/scrape');
    return response.data;
  } catch (error) {
    console.error('Error scraping reviews:', error);
    throw error;
  }
};

export const getScrapeStatus = async () => {
  try {
    const response = await api.get('/feedback/scrape-status');
    return response.data;
  } catch (error) {
    console.error('Error getting scrape status:', error);
    throw error;
  }
};