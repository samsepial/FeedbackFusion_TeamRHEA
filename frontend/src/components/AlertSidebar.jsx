import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../contexts/ThemeContext';
import api from '../services/api';

const AlertSidebar = ({ isOpen, onClose }) => {
  const { darkMode } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('create');
  const [department, setDepartment] = useState('');
  const [priority, setPriority] = useState('');
  const [threshold, setThreshold] = useState('');
  const [editingAlert, setEditingAlert] = useState(null);
  
  const [existingAlerts, setExistingAlerts] = useState([]);
  const [triggeredAlerts, setTriggeredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [popup, setPopup] = useState({ show: false, message: '', type: '' });

  const departments = [
    "Front Desk",
    "Housekeeping",
    "Maintenance",
    "Room Service",
    "Restaurant/Café",
    "Food & Beverage",
    "General",
    "IT"
  ];
  
  useEffect(() => {
    if (isOpen) {
      fetchAlerts();
    }
  }, [isOpen]);
  
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/alerts');
      
      const active = [];
      const triggered = [];
      
      response.data.forEach(alert => {
             const formattedAlert = {
          id: alert._id,
          department: alert.department || 'General',
          priority: alert.priority || 'medium',
          threshold: alert.threshold || 5,
          active: alert.active !== false, 
          triggeredAt: alert.triggeredAt
        };
        
        if (alert.triggered) {
          triggered.push(formattedAlert);
        } else {
          active.push(formattedAlert);
        }
      });
      
      setExistingAlerts(active);
      setTriggeredAlerts(triggered);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      showPopup('Failed to load alerts. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setTimeout(() => {
      setPopup({ show: false, message: '', type: '' });
    }, 3000);
  };
  
  const handleCreateAlert = async () => {
    if (!department || !priority || !threshold) {
      showPopup('Please fill in all fields', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      const alertData = {
        department,
        priority,
        threshold: parseInt(threshold),
        active: true
      };
      
      if (editingAlert) {
        await api.delete(`/alerts/${editingAlert.id}`);

        const response = await api.post('/alerts', alertData);

        const updatedAlert = {
          id: response.data._id,
          ...alertData
        };
        
        setExistingAlerts(existingAlerts.map(alert => 
          alert.id === editingAlert.id ? updatedAlert : alert
        ));
        
        showPopup('Alert updated successfully', 'success');
        resetForm();
      } else {
 
        const response = await api.post('/alerts', alertData);
        
        const newAlert = {
          id: response.data._id,
          ...alertData
        };
        
        setExistingAlerts([...existingAlerts, newAlert]);
        showPopup('Alert created successfully', 'success');
        resetForm();
      }
    } catch (err) {
      console.error('Error saving alert:', err);
      showPopup('Failed to save alert. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDepartment('');
    setPriority('');
    setThreshold('');
    setEditingAlert(null);
  };
  
  const handleEditAlert = (alert) => {
    setDepartment(alert.department);
    setPriority(alert.priority);
    setThreshold(alert.threshold.toString());
    setEditingAlert(alert);
    setActiveTab('create');
  };
  
  const handleDeleteAlert = async (alertId) => {
  try {
    console.log('Deleting alert with ID:', alertId);
    
    const response = await api.delete(`/alerts/${alertId}`);
    console.log('Delete response:', response);
    
    setExistingAlerts(existingAlerts.filter(alert => alert.id !== alertId));
    showPopup('Alert deleted successfully', 'success');
    
    if (editingAlert && editingAlert.id === alertId) {
      resetForm();
    }
    } catch (err) {
    console.error('Error deleting alert:', err);
    console.error('Error details:', err.response?.data || err.message);
    showPopup(`Failed to delete alert: ${err.response?.data?.error || err.message}`, 'error');
    } 
  };  
  
    const handleDismissAlert = async (alertId) => {
    try {
     await api.patch(`/alerts/${alertId}/reset`, {
      triggered: false,
      triggeredAt: null
    });
 
    setTriggeredAlerts(triggeredAlerts.filter(alert => alert.id !== alertId));
    showPopup('Alert dismissed', 'success');
    } catch (err) {
    console.error('Error dismissing alert:', err);
    showPopup('Failed to dismiss alert. Please try again.', 'error');
    }
  };

  const getPriorityClass = (priority) => {
    if (darkMode) {
      switch (priority) {
        case 'high':
          return 'bg-red-900 text-red-200';
        case 'medium':
          return 'bg-yellow-900 text-yellow-200';
        case 'low':
          return 'bg-green-900 text-green-200';
        default:
          return 'bg-gray-700 text-gray-200';
      }
    } else {
      switch (priority) {
        case 'high':
          return 'bg-red-100 text-red-800';
        case 'medium':
          return 'bg-yellow-100 text-yellow-800';
        case 'low':
          return 'bg-green-100 text-green-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          
          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className={`fixed right-0 top-0 h-full w-full md:w-1/2 lg:w-1/3 xl:w-1/3 z-50 ${
              darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
            } shadow-lg overflow-y-auto`}
          >
            {/* Header */}
            <div className={`flex justify-between items-center p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-xl font-bold flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Alerts
              </h2>
              <button
                onClick={onClose}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b px-4 pt-2 pb-0 mb-4">
              <button
                onClick={() => setActiveTab('create')}
                className={`py-2 px-4 focus:outline-none transition-colors ${
                  activeTab === 'create' 
                    ? `border-b-2 ${darkMode ? 'border-green-500 text-green-500' : 'border-green-600 text-green-600'} font-medium` 
                    : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                Create Alert
              </button>
              <button
                onClick={() => setActiveTab('triggered')}
                className={`py-2 px-4 focus:outline-none transition-colors ${
                  activeTab === 'triggered' 
                    ? `border-b-2 ${darkMode ? 'border-green-500 text-green-500' : 'border-green-600 text-green-600'} font-medium` 
                    : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                Triggered
                {triggeredAlerts.length > 0 && (
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                  }`}>
                    {triggeredAlerts.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`py-2 px-4 focus:outline-none transition-colors ${
                  activeTab === 'active' 
                    ? `border-b-2 ${darkMode ? 'border-green-500 text-green-500' : 'border-green-600 text-green-600'} font-medium` 
                    : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                Active
                {existingAlerts.length > 0 && (
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                  }`}>
                    {existingAlerts.length}
                  </span>
                )}
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="p-4">
              {/* Create Alert Form */}
              {activeTab === 'create' && (
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {editingAlert ? 'Edit Alert' : 'Create New Alert'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Department</label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-green-500`}
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Priority Level</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-green-500`}
                      >
                        <option value="">Select Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Negative Reviews Threshold</label>
                      <input
                        type="number"
                        value={threshold}
                        onChange={(e) => setThreshold(e.target.value)}
                        placeholder="Enter threshold value"
                        min="1"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-green-500`}
                      />
                    </div>
                    
                    <div className="mt-6 flex space-x-3">
                      <button
                        onClick={handleCreateAlert}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        {editingAlert ? 'Update Alert' : 'Create Alert'}
                      </button>
                      
                      {editingAlert && (
                        <button
                          onClick={resetForm}
                          className={`px-4 py-2 rounded-lg ${
                            darkMode 
                              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          } transition-colors`}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Triggered Alerts */}
              {activeTab === 'triggered' && (
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Triggered Alerts
                  </h3>
                  
                  {loading ? (
                    <div className="animate-pulse space-y-3">
                      <div className={`h-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
                      <div className={`h-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
                    </div>
                  ) : triggeredAlerts.length === 0 ? (
                    <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <svg className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p>No triggered alerts at this time</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {triggeredAlerts.map((alert) => (
                        <div 
                          key={alert.id} 
                          className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-4 flex flex-wrap items-center justify-between border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                        >
                          <div className="flex items-center space-x-4 mr-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityClass(alert.priority)}`}>
                              {alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)}
                            </span>
                            <div>
                              <h4 className="font-medium">Department: {alert.department}</h4>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Threshold: {alert.threshold}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center mt-3 md:mt-0">
                            <div className={`text-xs italic ${darkMode ? 'text-gray-400' : 'text-gray-500'} mr-3`}>
                              Triggered: {alert.triggeredAt ? new Date(alert.triggeredAt).toLocaleString() : 'Recently'}
                            </div>
                            <button
                              onClick={() => handleDismissAlert(alert.id)}
                              className="p-1.5 rounded bg-green-600 text-white hover:bg-green-700"
                              title="Dismiss alert"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Active Alerts */}
              {activeTab === 'active' && (
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Active Alerts
                  </h3>
                  
                  {loading ? (
                    <div className="animate-pulse space-y-3">
                      <div className={`h-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
                      <div className={`h-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
                    </div>
                  ) : existingAlerts.length === 0 ? (
                    <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <svg className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <p>No active alerts</p>
                      <button
                        onClick={() => setActiveTab('create')}
                        className="mt-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Create New Alert
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {existingAlerts.map((alert) => (
                        <div 
                          key={alert.id} 
                          className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-4 flex flex-wrap items-center justify-between border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityClass(alert.priority)} mb-2 md:mb-0`}>
                              {alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)}
                            </span>
                            <div>
                              <h4 className="font-medium">Department: {alert.department}</h4>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Threshold: {alert.threshold}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2 mt-3 md:mt-0">
                            <button
                              onClick={() => handleEditAlert(alert)}
                              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAlert(alert.id)}
                              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Popup notification */}
          {popup.show && (
            <div className="fixed bottom-4 right-4 z-50">
              <div className={`px-4 py-3 rounded-lg shadow-lg ${
                popup.type === 'error' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-green-500 text-white'
              }`}>
                {popup.message}
              </div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default AlertSidebar;