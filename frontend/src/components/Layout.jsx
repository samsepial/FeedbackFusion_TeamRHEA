import React, { useContext, useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import AlertSidebar from "./AlertSidebar";
import { ThemeContext } from "../contexts/ThemeContext";
import api from '../services/api';

export default function Layout({ children }) {
  const { darkMode } = useContext(ThemeContext);
  const [alertSidebarOpen, setAlertSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [uploadDropdownOpen, setUploadDropdownOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [alertCount, setAlertCount] = useState(0);
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    const fetchAlertCount = async () => {
      try {
        const response = await api.get('/alerts');
        const triggeredAlerts = response.data.filter(alert => alert.triggered);
        setAlertCount(triggeredAlerts.length);
      } catch (error) {
        console.error('Error fetching alert count:', error);
      }
    };
    
    fetchAlertCount();
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = async (file) => {
    if (file.type === 'text/csv' || file.type === 'application/json' || file.name.endsWith('.csv') || file.name.endsWith('.json')) {
      setUploadedFile(file);
      setUploading(true);
      setUploadError(null);
      setUploadSuccess(null);
      
      try {
        const formData = new FormData();
        formData.append('file', file);
    
        const response = await api.post('/feedback/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        setUploadSuccess(`File "${file.name}" uploaded successfully! ${response.data.count || 0} records processed.`);
        setUploadedFile(null);
 
        setTimeout(() => {
          setUploadDropdownOpen(false);
          setUploadSuccess(null);
        }, 3000);
      } catch (error) {
        console.error('Upload error:', error);
        setUploadError(`Upload failed: ${error.response?.data?.error || error.message}`);
      } finally {
        setUploading(false);
      }
    } else {
      setUploadError('Please upload a CSV or JSON file');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleScrapeReviews = async () => {
    try {
      setScraping(true);
      setUploadError(null);
      setUploadSuccess(null);
      
      const response = await api.post('/feedback/scrape');
      
      if (response.data.success) {
        setUploadSuccess(`Scraping completed! ${response.data.count || 0} reviews added.`);
      } else {
        setUploadError(`Scraping failed: ${response.data.message}`);
      }

      setTimeout(() => {
        setUploadSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Scrape error:', error);
      setUploadError(`Scraping failed: ${error.response?.data?.message || error.message}`);
      setTimeout(() => {
        setUploadError(null);
      }, 3000);
    } finally {
      setScraping(false);
    }
  };

  const handleClickOutside = (e) => {
    if (uploadDropdownOpen && !e.target.closest('.upload-dropdown-container')) {
      setUploadDropdownOpen(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [uploadDropdownOpen]);

  return (
    <div className={`flex min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Sidebar 
        onExpand={(expanded) => setSidebarExpanded(expanded)} 
      />
      
      <main 
        className="flex-1 transition-all duration-300 relative"
        style={{ marginLeft: sidebarExpanded ? '240px' : '80px' }}
      >
        {/* Floating action buttons in top right */}
        <div className="absolute top-4 right-4 z-10 flex space-x-3">
          {/* Scrape button */}
          <div className="relative">
            <button
              onClick={handleScrapeReviews}
              disabled={scraping}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} shadow-md relative ${scraping ? 'opacity-70 cursor-not-allowed' : ''}`}
              aria-label="Scrape Reviews"
            >
              {scraping ? (
                <div className="animate-spin w-6 h-6 border-2 border-gray-500 border-t-transparent rounded-full"></div>
              ) : (
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
            </button>
            
            {/* Tooltip on hover */}
            <div className="absolute right-0 w-36 mt-2 py-2 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 bg-gray-800 text-white text-xs px-2">
              Scrape reviews
            </div>
          </div>
          
          {/* Upload button */}
          <div className="relative upload-dropdown-container">
            <button
              onClick={() => setUploadDropdownOpen(!uploadDropdownOpen)}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} shadow-md relative`}
            >
              {/* Upload icon */}
              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
              </svg>
            </button>
            
            {/* Upload dropdown */}
            {uploadDropdownOpen && (
              <div 
                className={`absolute right-0 mt-2 w-64 rounded-md shadow-lg ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                } ring-1 ring-black ring-opacity-5 overflow-hidden transition-all duration-200 z-10`}
              >
                <div className="p-4 text-center">
                  <div className="mb-3">
                    <svg className="w-10 h-10 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-3`}>
                    Upload your datasets here
                  </p>
                  {uploadError && (
                    <div className={`p-2 mb-3 text-sm rounded ${darkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-100 text-red-700'}`}>
                      {uploadError}
                    </div>
                  )}
                  {uploadSuccess && (
                    <div className={`p-2 mb-3 text-sm rounded ${darkMode ? 'bg-green-900/20 text-green-300' : 'bg-green-100 text-green-700'}`}>
                      {uploadSuccess}
                    </div>
                  )}
                  {uploading ? (
                    <div className="flex items-center justify-center py-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mr-2"></div>
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <button
                      onClick={triggerFileInput}
                      className="px-4 py-2 w-full bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                    >
                      Browse Files
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json,application/json,text/csv"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Supports CSV or JSON files
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Alert button */}
          <div className="relative group">
            <button
              onClick={() => setAlertSidebarOpen(true)}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} shadow-md relative`}
              aria-label="Alerts"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {alertCount}
                </span>
              )}
            </button>
            
            {/* Tooltip on hover - dark mode aware */}
            <div className={`absolute right-0 w-48 mt-2 py-2 rounded-md shadow-lg ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'
            } opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20`}>
              <div className="px-4 py-2 text-sm">
                <div className="font-semibold">Alerts</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Click to manage alerts
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Success/Error toast notification */}
        {(uploadSuccess || uploadError) && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className={`px-4 py-3 rounded-lg shadow-lg ${
              uploadError 
                ? 'bg-red-500 text-white' 
                : 'bg-green-500 text-white'
            }`}>
              {uploadError || uploadSuccess}
            </div>
          </div>
        )}
        
        <div className="w-full min-h-screen p-4">
          {children}
        </div>
      </main>
      
      {/* Alert Sidebar */}
      <AlertSidebar 
        isOpen={alertSidebarOpen} 
        onClose={() => setAlertSidebarOpen(false)} 
      />
    </div>
  );
}