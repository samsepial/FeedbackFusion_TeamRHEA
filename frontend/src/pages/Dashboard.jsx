// src/pages/Dashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from "../contexts/ThemeContext";
import api from '../services/api';
import { getReportHistory, generateMonthlyReport, generateDepartmentReport } from '../services/reportService';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import AlertSidebar from '../components/AlertSidebar';

const Dashboard = () => {
  // Get theme context
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  
  // State for data
  const [recommendations, setRecommendations] = useState([]);
  const [checkedRecommendations, setCheckedRecommendations] = useState([]);
  const [currentRecommendation, setCurrentRecommendation] = useState(0);
  const [stats, setStats] = useState({
    avgRating: 0,
    sentiment: 0,
    reviewCount: 0,
    alerts: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week'); // 'week', 'all'
  
  // State for chart data
  const [sentimentData, setSentimentData] = useState([]);
  const [emotionData, setEmotionData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  
  // State for alerts and reports
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [alertSidebarOpen, setAlertSidebarOpen] = useState(false);
  const [recentReports, setRecentReports] = useState([]);
  
  // Colors for different departments
  const DEPARTMENT_COLORS = {
    'housekeeping': '#4ade80',
    'front desk': '#60a5fa',
    'maintenance': '#f59e0b',
    'food & beverage': '#8b5cf6',
    'general': '#ef4444',
    'room service': '#ec4899',
    'restaurant/café': '#0ea5e9',
    'it': '#14b8a6'
  };
  
  const EMOTION_COLORS = ['#4ade80', '#94a3b8', '#60a5fa', '#f59e0b', '#ef4444'];
  
  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
    fetchAlerts();
    
    // Get report history
    const reports = getReportHistory();
    setRecentReports(reports.slice(0, 3)); // Only show the last 3 reports
  }, [timeframe]);
  
  // Function to fetch alerts
  const fetchAlerts = async () => {
    try {
      const response = await api.get('/alerts');
      const allAlerts = response.data || [];
      
      // Filter for triggered alerts
      const triggered = allAlerts.filter(alert => alert.triggered);
      setActiveAlerts(triggered);
      
      // Update stats with alert count
      setStats(prev => ({ ...prev, alerts: triggered.length }));
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };
  
  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get date range based on timeframe
      const endDate = new Date();
      const startDate = new Date();
      
      if (timeframe === 'week') {
        startDate.setDate(endDate.getDate() - 7);
      } else if (timeframe === 'all') {
        startDate.setFullYear(startDate.getFullYear() - 1); // Default to 1 year
      }
      
      // Fetch feedback data
      const feedbackResponse = await api.get('/feedback', {
        params: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      });
      
      const feedbackData = feedbackResponse.data || [];
      
      // Fetch historical data
      const histResponse = await api.get('/feedback/historical', {
        params: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      });
      
      // Process historical data
      processHistoricalData(histResponse.data || []);
      
      // Calculate stats
      calculateStats(feedbackData);
      
      // Process data for charts
      processDepartmentData(feedbackData);
      processEmotionData(feedbackData);
      processSentimentData(feedbackData);
      
      // Extract recommendations
      extractRecommendations(feedbackData);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Process historical data
  const processHistoricalData = (data) => {
    // Format for chart
    const formattedData = data.map(item => ({
      date: item._id,
      sentiment: item.avgRating || 0,
      reviews: item.count || 0
    }));
    
    setHistoricalData(formattedData);
  };
  
  // Calculate stats from feedback data
  const calculateStats = (feedbackData) => {
    if (!feedbackData || feedbackData.length === 0) {
      return;
    }
    
    // Calculate average rating
    const totalRating = feedbackData.reduce((sum, item) => sum + (item.rating || 0), 0);
    const avgRating = (totalRating / feedbackData.length).toFixed(1);
    
    // Calculate sentiment percentage
    const positiveCount = feedbackData.filter(item => 
      item.sentiment_label === 'positive' || item.sentiment_label === 'very positive'
    ).length;
    const sentiment = Math.round((positiveCount / feedbackData.length) * 100);
    
    setStats(prev => ({
      ...prev,
      avgRating,
      sentiment,
      reviewCount: feedbackData.length
    }));
  };
  
  // Process department data with specific colors
  const processDepartmentData = (feedbackData) => {
    const deptScores = {};
    
    feedbackData.forEach(item => {
      if (!item.department) return;
      
      // Normalize department name - standardize on "Food & Beverage" format
      let normalizedDept = item.department.toLowerCase();
      if (normalizedDept === 'food and beverage') {
        normalizedDept = 'food & beverage';
      }
      
      if (!deptScores[normalizedDept]) {
        deptScores[normalizedDept] = { total: 0, count: 0 };
      }
      
      deptScores[normalizedDept].total += item.rating || 0;
      deptScores[normalizedDept].count++;
    });
    
    // Format and sort the department data
    const formatted = Object.keys(deptScores).map(name => {
      // Format display name with proper capitalization
      const displayName = name.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      return {
        name: displayName,
        score: parseFloat((deptScores[name].total / deptScores[name].count).toFixed(1)),
        // Assign color based on department or use default if not found
        color: DEPARTMENT_COLORS[name] || '#22c55e'
      };
    });
    
    // Sort to identify top and bottom performers
    formatted.sort((a, b) => b.score - a.score);
    
    // Add a note to each entry if it's top or bottom
    if (formatted.length > 0) {
      formatted[0].isTop = true;
      formatted[formatted.length - 1].isBottom = true;
    }
    
    setDepartmentData(formatted);
  };
  
  // Process emotion data
  const processEmotionData = (feedbackData) => {
    const emotions = {};
    
    feedbackData.forEach(item => {
      if (!item.emotion_label) return;
      
      const emotion = item.emotion_label.toLowerCase();
      emotions[emotion] = (emotions[emotion] || 0) + 1;
    });
    
    const formatted = Object.keys(emotions).map(name => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize emotion
      value: emotions[name]
    }));
    
    // Sort by count and take top 5
    formatted.sort((a, b) => b.value - a.value);
    
    // Convert to percentages
    const total = formatted.reduce((sum, item) => sum + item.value, 0);
    const formattedPercentages = formatted.slice(0, 5).map(item => ({
      name: item.name,
      value: Math.round((item.value / total) * 100)
    }));
    
    setEmotionData(formattedPercentages);
  };
  
  // Process sentiment data by day
  const processSentimentData = (feedbackData) => {
    const days = {};
    
    // Group by day of week
    feedbackData.forEach(item => {
      if (!item.date) return;
      
      const date = new Date(item.date);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      if (!days[day]) {
        days[day] = { positive: 0, negative: 0 };
      }
      
      if (item.sentiment_label === 'positive' || item.sentiment_label === 'very positive') {
        days[day].positive++;
      } else if (item.sentiment_label === 'negative' || item.sentiment_label === 'very negative') {
        days[day].negative++;
      }
    });
    
    // Convert to array format
    const formatted = Object.keys(days).map(day => ({
      day,
      positive: days[day].positive,
      negative: days[day].negative
    }));
    
    setSentimentData(formatted);
  };
  
  // Extract recommendations from feedback data
  const extractRecommendations = (feedbackData) => {
    const recs = [];
    
    // Look for feedback items with recommendations
    feedbackData.forEach(item => {
      if (item.recommendations && item.recommendations.length > 0) {
        item.recommendations.forEach(rec => {
          recs.push({
            id: item._id + '-' + rec.keyword,
            issue: rec.keyword.charAt(0).toUpperCase() + rec.keyword.slice(1), // Capitalize first letter
            recommendation: rec.solutions && rec.solutions.length > 0 ? rec.solutions[0] : 'Address this issue',
            department: item.department,
            priority: determinePriority(item) 
          });
        });
      }
    });
    
    // Remove duplicates by issue
    const uniqueRecs = recs.reduce((acc, rec) => {
      const existing = acc.find(r => r.issue === rec.issue);
      if (!existing) {
        acc.push(rec);
      } else if (existing.priority === 'medium' && rec.priority === 'high') {
        // If we have a duplicate with higher priority, use that one
        const index = acc.findIndex(r => r.issue === rec.issue);
        acc[index] = rec;
      }
      return acc;
    }, []);
    
    // Sort by priority (high to low)
    uniqueRecs.sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });
    
    setRecommendations(uniqueRecs.slice(0, 5)); // Take top 5
  };
  
  // Determine priority based on feedback properties
  const determinePriority = (feedback) => {
    if (feedback.sentiment_label === 'very negative' || feedback.rating <= 2) {
      return 'high';
    } else if (feedback.sentiment_label === 'negative' || feedback.rating <= 3.5) {
      return 'medium';
    } else {
      return 'low';
    }
  };
  
  // Recommendation carousel controls
  const nextRecommendation = () => {
    setCurrentRecommendation((prev) => 
      prev === recommendations.length - 1 ? 0 : prev + 1
    );
  };
  
  const prevRecommendation = () => {
    setCurrentRecommendation((prev) => 
      prev === 0 ? recommendations.length - 1 : prev - 1
    );
  };
  
  // Toggle recommendation checked status
  const toggleRecommendationCheck = (recId) => {
    if (checkedRecommendations.includes(recId)) {
      setCheckedRecommendations(checkedRecommendations.filter(id => id !== recId));
    } else {
      setCheckedRecommendations([...checkedRecommendations, recId]);
    }
  };
  
  // Helper function for priority colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': 
        return darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800';
      case 'medium': 
        return darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800';
      case 'low': 
        return darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800';
      default: 
        return darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800';
    }
  };
  
  // Navigate to historical analysis
  const goToHistoricalAnalysis = () => {
    navigate('/historical-analysis');
  };

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Overview of feedback metrics and insights
        </p>
      </div>
      
      {/* Recommendations Carousel */}
      <div className={`mb-8 p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border-l-4 ${darkMode ? 'border-green-600' : 'border-green-500'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Recommended Actions
          </h2>
          <div className="flex space-x-2">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {recommendations.length > 0 ? `${currentRecommendation + 1} of ${recommendations.length}` : '0 of 0'}
            </span>
            <button 
              onClick={prevRecommendation}
              className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              disabled={recommendations.length === 0}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={nextRecommendation}
              className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              disabled={recommendations.length === 0}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="h-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="relative overflow-hidden">
            <div className="flex transition-transform duration-300 ease-in-out" 
              style={{ transform: `translateX(-${currentRecommendation * 100}%)` }}>
              {recommendations.map((rec) => (
                <div key={rec.id} className="w-full flex-shrink-0 pr-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{rec.issue}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(rec.priority)}`}>
                      {rec.priority} priority
                    </span>
                  </div>
                  
                  <div className={`${checkedRecommendations.includes(rec.id) ? 'line-through opacity-70' : ''}`}>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {rec.recommendation}
                    </p>
                  </div>
                  
                  <div className="mt-4 flex justify-end items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-green-600"
                        checked={checkedRecommendations.includes(rec.id)}
                        onChange={() => toggleRecommendationCheck(rec.id)}
                      />
                      <span className="ml-2 text-sm">Complete</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No recommendations available at this time.
          </p>
        )}
      </div>
      
      {/* Timeframe Toggle */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setTimeframe('week')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
              timeframe === 'week'
                ? 'bg-green-600 text-white border-green-600'
                : darkMode 
                  ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Last Week
          </button>
          <button
            onClick={() => setTimeframe('all')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
              timeframe === 'all'
                ? 'bg-green-600 text-white border-green-600'
                : darkMode 
                  ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Time
          </button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Rating Card */}
        <div className={`p-6 ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-green-50 to-white'} rounded-xl shadow-md border border-green-100 dark:border-gray-700`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Average Rating</p>
              <h3 className="text-3xl font-bold text-green-600 dark:text-green-500">{stats.avgRating}</h3>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Based on {stats.reviewCount} reviews
            </span>
            <span className="ml-2 flex items-center text-green-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span className="text-xs ml-1">0.2</span>
            </span>
          </div>
        </div>
        
        {/* Sentiment Score */}
        <div className={`p-6 ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-green-50 to-white'} rounded-xl shadow-md border border-green-100 dark:border-gray-700`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sentiment Score</p>
              <h3 className="text-3xl font-bold text-green-600 dark:text-green-500">{stats.sentiment}%</h3>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${stats.sentiment}%` }}></div>
          </div>
          <div className="mt-2 flex justify-between text-xs">
            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Negative</span>
            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Positive</span>
          </div>
        </div>
        
        {/* Top Emotion */}
<div className={`p-6 ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-green-50 to-white'} rounded-xl shadow-md border border-green-100 dark:border-gray-700`}>
  <div className="flex justify-between items-start mb-4">
    <div>
      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Top Emotion</p>
      <h3 className="text-3xl font-bold text-green-600 dark:text-green-500">
        {emotionData.length > 0 ? emotionData[0].name : 'N/A'}
      </h3>
    </div>
    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
      <svg className="w-6 h-6 text-green-600 dark:text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  </div>
  <div className="h-10 relative">
    <div className="flex h-full">
      {emotionData.map((emotion, index) => (
        <div 
          key={emotion.name}
          className="h-full relative cursor-pointer"
          style={{ 
            width: `${emotion.value}%`, 
            backgroundColor: EMOTION_COLORS[index % EMOTION_COLORS.length]
          }}
          onMouseEnter={(e) => {
            // Create and show tooltip only for the hovered emotion
            const tooltip = document.createElement('div');
            tooltip.className = 'emotion-tooltip';
            tooltip.textContent = `${emotion.name}: ${emotion.value}%`;
            tooltip.style.position = 'absolute';
            tooltip.style.bottom = '100%';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translateX(-50%)';
            tooltip.style.backgroundColor = darkMode ? '#1F2937' : '#000000';
            tooltip.style.color = '#FFFFFF';
            tooltip.style.padding = '4px 8px';
            tooltip.style.borderRadius = '4px';
            tooltip.style.fontSize = '12px';
            tooltip.style.whiteSpace = 'nowrap';
            tooltip.style.zIndex = '10';
            e.currentTarget.appendChild(tooltip);
          }}
          onMouseLeave={(e) => {
            // Remove tooltip when mouse leaves
            const tooltip = e.currentTarget.querySelector('.emotion-tooltip');
            if (tooltip) {
              e.currentTarget.removeChild(tooltip);
            }
          }}
        />
      ))}
    </div>
  </div>
  <div className="mt-2">
    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
      {emotionData.length > 0 ? `${emotionData[0].value}% of reviews` : '0% of reviews'}
    </span>
  </div>
</div>
        
        {/* Recent Alerts */}
        <div className={`p-6 ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-green-50 to-white'} rounded-xl shadow-md border border-green-100 dark:border-gray-700`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Recent Alerts</p>
              <h3 className="text-3xl font-bold text-green-600 dark:text-green-500">{activeAlerts.length}</h3>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </div>
          {activeAlerts.length > 0 ? (
            <div className="space-y-2">
              {activeAlerts.slice(0, 2).map(alert => (
                <div key={alert.id} className={`py-2 px-3 text-sm rounded ${
                  alert.priority === 'high' 
                    ? (darkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-50 text-red-700')
                    : alert.priority === 'medium'
                      ? (darkMode ? 'bg-yellow-900/30 text-yellow-200' : 'bg-yellow-50 text-yellow-700')
                      : (darkMode ? 'bg-blue-900/30 text-blue-200' : 'bg-blue-50 text-blue-700')
                }`}>
                  {alert.department} - Threshold: {alert.threshold}
                </div>
              ))}
              {activeAlerts.length > 2 && (
                <div className={`text-xs text-right ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  +{activeAlerts.length - 2} more alerts
                </div>
              )}
            </div>
          ) : (
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No active alerts at this time
            </div>
          )}
          <div className="mt-2 text-right">
            <button 
              onClick={() => setAlertSidebarOpen(true)}
              className="text-sm text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400"
            >
              View All Alerts →
            </button>
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Department Scores */}
        <div className={`p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md`}>
          <h2 className="text-lg font-semibold mb-4">Department Scores</h2>
          <div className="h-64">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={departmentData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} />
                  <XAxis 
                    dataKey="name" 
                    tick={(props) => {
                      const { x, y, payload } = props;
                      const dept = departmentData.find(d => d.name === payload.value);
                      // Only display labels for top and bottom departments
                      if (dept && (dept.isTop || dept.isBottom)) {
                        return (
                          <text x={x} y={y + 10} textAnchor="middle" fill={darkMode ? "#D1D5DB" : "#4B5563"}>
                            {payload.value}
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                  <YAxis 
                    domain={[0, 5]} 
                    tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', 
                      borderColor: darkMode ? '#374151' : '#E5E7EB',
                      color: darkMode ? '#FFFFFF' : '#111827' 
                    }}
                  />
                  <Bar dataKey="score">
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        
        {/* Weekly Trend */}
        <div className={`p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md relative`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Weekly Trend</h2>
            <button 
              onClick={goToHistoricalAnalysis}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              title="View Historical Analysis"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={historicalData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }} 
                  />
                  <YAxis 
                    yAxisId="left" 
                    domain={[0, 5]} 
                    tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }} 
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', 
                      borderColor: darkMode ? '#374151' : '#E5E7EB',
                      color: darkMode ? '#FFFFFF' : '#111827' 
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="sentiment"
                    stroke="#16a34a"
                    activeDot={{ r: 8 }}
                    name="Sentiment"
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="reviews" 
                    stroke="#0ea5e9" 
                    name="Reviews"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
      
      {/* Reports Section - Modified to be smaller */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Reports */}
        <div className={`p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Reports</h2>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-700/50' : 'border-green-100 bg-green-50'}`}>
              <div className="flex items-start">
                <div className="p-2 rounded-lg bg-green-600 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="font-medium">Monthly Performance Report</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Comprehensive review of monthly trends
                  </p>
                  <div className="mt-2">
                    <button
                      onClick={generateMonthlyReport}
                      className="text-sm text-green-600 hover:text-green-700 dark:text-green-500"
                    >
                      Generate →
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-700/50' : 'border-blue-100 bg-blue-50'}`}>
              <div className="flex items-start">
                <div className="p-2 rounded-lg bg-blue-600 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="font-medium">Weekly Performance Report</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Last week's performance analysis
                  </p>
                  <div className="mt-2">
                    <button
                      onClick={generateDepartmentReport}
                      className="text-sm text-green-600 hover:text-green-700 dark:text-green-500"
                    >
                      Generate →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <h3 className="font-medium mb-2">Recent Reports</h3>
          {recentReports.length === 0 ? (
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No reports have been generated yet.
            </p>
          ) : (
            <div className="space-y-2">
              {recentReports.slice(0, 3).map(report => (
                <div 
                  key={report.id}
                  className={`p-3 rounded-lg flex justify-between items-center ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                  } transition-colors`}
                >
                  <div className="flex items-center">
                    <span className={`p-1.5 rounded ${
                      report.type === 'pdf' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {report.type.toUpperCase()}
                    </span>
                    <div className="ml-3">
                      <div className="font-medium">{report.name}</div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Generated on {new Date(report.dateGenerated).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    className={`text-sm ${
                      darkMode 
                        ? 'text-green-500 hover:text-green-400' 
                        : 'text-green-600 hover:text-green-700'
                    }`}
                    onClick={() => window.open(`/results`)}
                  >
                    Regenerate
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Recent Reviews */}
        <div className={`p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Reviews</h2>
            <Link to="/results" className="text-sm text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400">
              View All →
            </Link>
          </div>
          
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-700' : 'bg-gray-200 border-gray-200'} h-24`}></div>
              <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-700' : 'bg-gray-200 border-gray-200'} h-24`}></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* We'll show the two most recent reviews */}
              {historicalData.slice(-2).map((item, index) => (
                <div key={index} className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded mr-2">
                        {item.sentiment.toFixed(1)} ★
                      </span>
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {item.date}
                      </span>
                    </div>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {item.reviews} reviews
                    </span>
                  </div>
                  <p className="mt-2">
                    {index === 0 
                      ? "The staff was extremely helpful during our stay. Room was clean and comfortable."
                      : "Restaurant menu needs more vegetarian options, but staff was very accommodating."}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Alert Sidebar */}
      <AlertSidebar 
        isOpen={alertSidebarOpen} 
        onClose={() => setAlertSidebarOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;