import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CreateAlerts = ({ darkMode }) => {
  const [department, setDepartment] = useState('');
  const [priority, setPriority] = useState('');
  const [threshold, setThreshold] = useState('');
  const [editingAlert, setEditingAlert] = useState(null);

  const [existingAlerts, setExistingAlerts] = useState([]);
  const [triggeredAlerts, setTriggeredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [popup, setPopup] = useState({ show: false, message: '', type: '' });
  
  const departments = [
    'Front Desk',
    'Room Service',
    'Housekeeping',
    'Food & Beverage',
    'Maintenance',
    'Facilities'
  ];

  useEffect(() => {
    setTimeout(() => {
      setTriggeredAlerts([
        {
          id: 1,
          department: 'Food & beverage',
          priority: 'medium',
          threshold: 5,
          triggeredAt: '2025-03-04T03:20:00Z'
        }
      ]);
      setExistingAlerts([
        {
          id: 2,
          department: 'Front Desk',
          priority: 'high',
          threshold: 3,
          active: true
        },
        {
          id: 3,
          department: 'Housekeeping',
          priority: 'low',
          threshold: 10,
          active: true
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);
  
  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setTimeout(() => {
      setPopup({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleCreateAlert = () => {
    if (!department || !priority || !threshold) {
      showPopup('Please fill in all fields', 'error');
      return;
    }
   
    if (editingAlert) {
      const updatedAlerts = existingAlerts.map(alert => 
        alert.id === editingAlert.id 
          ? { ...alert, department, priority, threshold: parseInt(threshold) }
          : alert
      );
      setExistingAlerts(updatedAlerts);
      showPopup('Alert updated successfully', 'success');
      resetForm();
    } else {
         const newAlert = {
        id: Date.now(),
        department,
        priority,
        threshold: parseInt(threshold),
        active: true
      };
      setExistingAlerts([...existingAlerts, newAlert]);
      showPopup('Alert created successfully', 'success');
      resetForm();
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
  };
  
  const handleDeleteAlert = (alertId) => {
    setExistingAlerts(existingAlerts.filter(alert => alert.id !== alertId));
    showPopup('Alert deleted successfully', 'success');

    if (editingAlert && editingAlert.id === alertId) {
      resetForm();
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };
  
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create Alerts</h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Set up alerts for negative feedback thresholds
          </p>
        </div>
        
        {/* Create Alert Form */}
        <div className={`mb-6 p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md`}>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {editingAlert ? 'Edit Alert' : 'Create Alert'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <button
              onClick={handleCreateAlert}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
        
        {/* Triggered Alerts */}
        <div className={`mb-6 p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md`}>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <svg className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Triggered Alerts
          </h2>
          
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className={`h-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
              <div className={`h-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
            </div>
          ) : triggeredAlerts.length === 0 ? (
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No triggered alerts</p>
          ) : (
            <div className="space-y-3">
              {triggeredAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 flex flex-wrap items-center justify-between`}
                >
                  <div className="flex items-center space-x-4 mr-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityClass(alert.priority)}`}>
                      {alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)}
                    </span>
                    <div>
                      <h3 className="font-medium">Department: {alert.department}</h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Threshold: {alert.threshold}
                      </p>
                    </div>
                  </div>
                  <div className={`text-sm italic ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Triggered at: {new Date(alert.triggeredAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Existing Alerts */}
        <div className={`p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md`}>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Existing Alerts
          </h2>
          
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className={`h-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
              <div className={`h-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
            </div>
          ) : existingAlerts.length === 0 ? (
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No existing alerts</p>
          ) : (
            <div className="space-y-3">
              {existingAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 flex flex-wrap md:items-center justify-between`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityClass(alert.priority)} mb-2 md:mb-0`}>
                      {alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)}
                    </span>
                    <div>
                      <h3 className="font-medium">Department: {alert.department}</h3>
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
        
        {/* Popup message */}
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
      </div>
    </div>
  );
};

export default CreateAlerts;