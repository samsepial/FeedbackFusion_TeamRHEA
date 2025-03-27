import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../contexts/ThemeContext';
import api from '../services/api';
import { generateReport } from '../services/reportService';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar, RadialBarChart, RadialBar
} from 'recharts';

const Results = () => {
  const { darkMode } = useContext(ThemeContext);
  
  // State for filters
  const [keywords, setKeywords] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [dateRange, setDateRange] = useState('week');
  const [activeMetricTab, setActiveMetricTab] = useState('rating');
  const [inputValue, setInputValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;
  
  // State for data
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [expandedReview, setExpandedReview] = useState(null);
  const [stats, setStats] = useState({
    avgRating: 0,
    sentimentScore: 0,
    totalReviews: 0,
    departments: []
  });
  
  // Charts data
  const [sentimentData, setSentimentData] = useState([]);
  const [emotionData, setEmotionData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [ratingData, setRatingData] = useState([]);
  
  // Expanded chart states
  const [expandedChart, setExpandedChart] = useState(null);
  
  // Report modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTimeframe, setReportTimeframe] = useState('current');
  const [reportStartDate, setReportStartDate] = useState(getDefaultStartDate());
  const [reportEndDate, setReportEndDate] = useState(getCurrentDate());
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportFormat, setReportFormat] = useState('pdf');
  const [includeReviews, setIncludeReviews] = useState(true);
  const [includeGraphs, setIncludeGraphs] = useState(true);
  
  // Enhanced report options
  const [includeNegativeKeywords, setIncludeNegativeKeywords] = useState(true);
  const [includeBothSentimentEmotion, setIncludeBothSentimentEmotion] = useState(true);
  const [enhancedVisualDesign, setEnhancedVisualDesign] = useState(true);
  
  const EMOTION_COLORS = ['#4ade80', '#94a3b8', '#60a5fa', '#f59e0b', '#ef4444'];
  const RATING_COLORS = ['#22c55e', '#4ade80', '#fcd34d', '#f97316', '#ef4444'];
 
  const DEPARTMENT_COLORS = {
    'Front Desk': '#60a5fa',
    'Housekeeping': '#4ade80',
    'Room Service': '#22c55e',
    'Food & Beverage': '#8b5cf6',
    'Maintenance & amenities': '#f59e0b',
    'Restaurant/Café': '#0ea5e9',
    'IT': '#14b8a6',
    'General': '#ef4444'
  };
  
  const allDepartments = [
    'Front Desk', 
    'Room Service', 
    'Housekeeping', 
    'Food & Beverage', 
    'Maintenance & amenities', 
    'Restaurant/Café', 
    'General'
  ];
  
  const allEmotions = [
    'joy', 
    'neutral', 
    'sadness', 
    'disgust', 
    'anger', 
    'surprise', 
    'fear'
  ];
 
  const chartRefs = useRef({});
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (expandedChart && !chartRefs.current[expandedChart]?.contains(event.target)) {
        setExpandedChart(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedChart]);

  useEffect(() => {
    fetchData();
  }, [dateRange, selectedDepartments, selectedEmotions, keywords]);
  
  function getCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  function getDefaultStartDate() {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  }

  const addKeyword = (keyword) => {
    if (!keywords.includes(keyword) && keyword.trim()) {
      setKeywords([...keywords, keyword.trim()]);
      setCurrentPage(1); 
    setInputValue('');
  };

  const removeKeyword = (keyword) => {
    setKeywords(keywords.filter(k => k !== keyword));
    setCurrentPage(1); 
  };
  
  const handleKeywordKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      addKeyword(inputValue);
      e.preventDefault();
    }
  };

  const toggleDepartment = (dept) => {
    if (selectedDepartments.includes(dept)) {
      setSelectedDepartments(selectedDepartments.filter(d => d !== dept));
    } else {
      setSelectedDepartments([...selectedDepartments, dept]);
    }
    setCurrentPage(1); 
  };
  
  const toggleEmotion = (emotion) => {
    if (selectedEmotions.includes(emotion)) {
      setSelectedEmotions(selectedEmotions.filter(e => e !== emotion));
    } else {
      setSelectedEmotions([...selectedEmotions, emotion]);
    }
    setCurrentPage(1); 
  };
  
  const fetchData = async () => {
    try {
      setLoading(true);

      const { startDate, endDate } = getDateRange(dateRange);
      
      const params = {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      };

      if (selectedDepartments.length > 0) {
        params.departments = selectedDepartments.join(',');
      }

      if (selectedEmotions.length > 0) {
        params.emotions = selectedEmotions.join(',');
      }

      const reviewsResponse = await api.get('/feedback', { params });
      let fetchedReviews = reviewsResponse.data;
  
      if (keywords.length > 0) {
        fetchedReviews = fetchedReviews.filter(review => {
          const text = (review.feedback_text || '') + ' ' + (review.textTranslated || '');
          const lowerText = text.toLowerCase();
          return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
        });
      }

      setReviews(fetchedReviews);
      
      calculateStats(fetchedReviews);

      prepareSentimentData(fetchedReviews);
      prepareEmotionData(fetchedReviews);
      prepareDepartmentData(fetchedReviews);
      prepareRatingData(fetchedReviews);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (rangeType) => {
    const endDate = new Date();
    let startDate = new Date();
    
    switch (rangeType) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }
    
    return { startDate, endDate };
  };
  
  const calculateStats = (reviews) => {
    if (reviews.length === 0) {
      setStats({
        avgRating: 0,
        sentimentScore: 0,
        totalReviews: 0,
        departments: []
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    const avgRating = (totalRating / reviews.length).toFixed(1);

    const positiveSentiment = reviews.filter(r => 
      r.sentiment_label === 'positive' || r.sentiment_label === 'very positive'
    ).length;
    const sentimentScore = Math.round((positiveSentiment / reviews.length) * 100);
    
    const departments = [...new Set(reviews.map(r => r.department))].filter(Boolean);
    
    setStats({
      avgRating,
      sentimentScore,
      totalReviews: reviews.length,
      departments
    });
  };

  const prepareSentimentData = (reviews) => {
    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const initialData = daysOfWeek.map(day => ({ day, positive: 0, negative: 0, total: 0 }));
    
    reviews.forEach(review => {
      if (!review.date) return;
      
      const date = new Date(review.date);
      const dayIndex = date.getDay(); 
      
      initialData[dayIndex].total++;
      
      if (review.sentiment_label === 'positive' || review.sentiment_label === 'very positive') {
        initialData[dayIndex].positive++;
      } else if (review.sentiment_label === 'negative' || review.sentiment_label === 'very negative') {
        initialData[dayIndex].negative++;
      }
    });

    const data = initialData.map(item => {
      if (item.total === 0) return { day: item.day, positive: 0, negative: 0 };
      
      const positive = Math.round((item.positive / item.total) * 100) || 0;
      return {
        day: item.day,
        positive,
        negative: 100 - positive
      };
    });
    
    setSentimentData(data);
  };

  const prepareEmotionData = (reviews) => {

    const emotionCounts = reviews.reduce((acc, review) => {
      const emotion = review.emotion_label || 'Unknown';
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});

    const data = Object.entries(emotionCounts).map(([name, count]) => ({
      name,
      value: Math.round((count / reviews.length) * 100)
    }));

    data.sort((a, b) => b.value - a.value);
    
    setEmotionData(data.slice(0, 5)); 

  const prepareDepartmentData = (reviews) => {
    const deptsToShow = selectedDepartments.length > 0 ? selectedDepartments : allDepartments;
s
    const deptScores = reviews.reduce((acc, review) => {
      const dept = review.department || 'Unknown';
      
      if (!acc[dept]) {
        acc[dept] = { total: 0, count: 0 };
      }
      
      acc[dept].total += review.rating || 0;
      acc[dept].count++;
      
      return acc;
    }, {});
    
    const data = deptsToShow.map(dept => {
      const score = deptScores[dept] 
        ? parseFloat((deptScores[dept].total / deptScores[dept].count).toFixed(1)) 
        : 0;
      
      return {
        name: dept,
        score,
        color: DEPARTMENT_COLORS[dept] || '#22c55e'
      };
    }).filter(d => d.score > 0 || selectedDepartments.includes(d.name));
    
    setDepartmentData(data);
  };

  const prepareRatingData = (reviews) => {
    const ratingCounts = reviews.reduce((acc, review) => {
      const rating = Math.round(review.rating || 0);
      const ratingKey = `${rating}★`;
      acc[ratingKey] = (acc[ratingKey] || 0) + 1;
      return acc;
    }, {});

    for (let i = 1; i <= 5; i++) {
      const key = `${i}★`;
      if (!ratingCounts[key]) {
        ratingCounts[key] = 0;
      }
    }
  
    const data = Object.entries(ratingCounts).map(([name, count]) => ({
      name,
      value: Math.round((count / reviews.length) * 100) || 0
    }));
 
    data.sort((a, b) => {
      const aValue = parseInt(a.name.charAt(0));
      const bValue = parseInt(b.name.charAt(0));
      return bValue - aValue; // 5★ to 1★
    });
    
    setRatingData(data);
  };

  const extractNegativeKeywords = (reviews) => {
    const wordCounts = {};

    const negativeReviews = reviews.filter(r => 
      r.sentiment_label === 'negative' || r.sentiment_label === 'very negative');
    
    negativeReviews.forEach(review => {
      if (!review.feedback_text) return;
      
      const text = review.feedback_text.toLowerCase();

      const negativeWordsList = [
        'slow', 'cold', 'dirty', 'broken', 'noise', 'poor', 'disappointing', 
        'expensive', 'rude', 'wait', 'error', 'wrong', 'bad', 'overpriced',
        'issue', 'problem', 'forgot', 'missing', 'failed', 'unclean', 'smell',
        'loud', 'uncomfortable', 'outdated', 'stained', 'crowded', 'old',
        'delay', 'confusion', 'charged', 'WiFi', 'wifi', 'parking'
      ];
      
      negativeWordsList.forEach(word => {
        if (text.includes(word)) {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
      });
    });

    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(item => item[0]);
  };
  
  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      
      let historicalCharts = [];
    
      if (window.exportHistoricalCharts && typeof window.exportHistoricalCharts === 'function') {
        try {
          console.log("Attempting to export historical charts...");
          const chartData = await window.exportHistoricalCharts();
          console.log("Historical charts exported:", chartData);
          historicalCharts = chartData || [];
        } catch (e) {
          console.error('Error fetching historical charts:', e);
        }
      } else {
        console.log("Historical chart export function not available");
      }
 
      let logoImage = null;
      try {
        const response = await fetch('/FF.png');
        if (response.ok) {
          const blob = await response.blob();
          const reader = new FileReader();
          logoImage = await new Promise(resolve => {
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        }
      } catch (err) {
        console.error('Error loading logo:', err);
      }

      const reportParams = {
        format: reportFormat,
        startDate: reportTimeframe === 'custom' ? reportStartDate : undefined,
        endDate: reportTimeframe === 'custom' ? reportEndDate : undefined,
        includeReviews,
        includeGraphs,
        includeNegativeKeywords,
        enhancedVisualDesign,
        includeBothSentimentEmotion,
        includeHistoricalCharts: true,
        customLogo: logoImage,
        filters: {
          keywords,
          department: selectedDepartments.length > 0 ? selectedDepartments.join(',') : 'All',
          emotion: selectedEmotions.length > 0 ? selectedEmotions.join(',') : 'All',
          dateRange: reportTimeframe === 'current' ? dateRange : 'custom',
        }
      };

      if (reportTimeframe === 'current') {
        const { startDate, endDate } = getDateRange(dateRange);
        reportParams.startDate = startDate.toISOString().split('T')[0];
        reportParams.endDate = endDate.toISOString().split('T')[0];
      }

      let negativeKeywords = [];
      if (includeNegativeKeywords) {
        negativeKeywords = extractNegativeKeywords(reviews);
      }

      await generateReport(reportParams, {
        sentimentData,
        emotionData,
        departmentData,
        ratingData,
        historicalCharts,
        reviews,
        stats,
        negativeKeywords
      });

      setTimeout(() => {
        alert(`${reportFormat.toUpperCase()} report generated successfully`);
      }, 500);
      
      setShowReportModal(false);
      setGeneratingReport(false);
      
    } catch (error) {
      console.error('Error generating report:', error);
      
       let errorMessage = 'Failed to generate report. Please try again.';
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      setGeneratingReport(false);
    }
  };

  const getCurrentReviews = () => {
    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    return reviews.slice(indexOfFirstReview, indexOfLastReview);
  };
  

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  

  const getRatingColor = (rating) => {
    if (darkMode) {
      if (rating >= 4.5) return 'bg-green-900 text-green-200';
      if (rating >= 3.5) return 'bg-green-900 text-green-200';
      if (rating >= 2.5) return 'bg-yellow-900 text-yellow-200';
      return 'bg-red-900 text-red-200';
    } else {
      if (rating >= 4.5) return 'bg-green-100 text-green-800';
      if (rating >= 3.5) return 'bg-green-100 text-green-800';
      if (rating >= 2.5) return 'bg-yellow-100 text-yellow-800';
      return 'bg-red-100 text-red-800';
    }
  };
  
  const getSentimentColor = (sentiment) => {
    if (darkMode) {
      switch (sentiment) {
        case 'positive':
        case 'very positive':
          return 'bg-green-900 text-green-200';
        case 'negative':
        case 'very negative':
          return 'bg-red-900 text-red-200';
        default:
          return 'bg-blue-900 text-blue-200';
      }
    } else {
      switch (sentiment) {
        case 'positive':
        case 'very positive':
          return 'bg-green-100 text-green-800';
        case 'negative':
        case 'very negative':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-blue-100 text-blue-800';
      }
    }
  };
  
  const getEmotionColor = (emotion) => {
    if (darkMode) {
      switch (emotion) {
        case 'joy':
        case 'Joy':
          return 'bg-green-900 text-green-200';
        case 'neutral':
        case 'Neutral':
          return 'bg-gray-900 text-gray-200';
        case 'sadness':
        case 'Sadness':
          return 'bg-blue-900 text-blue-200';
        case 'disgust':
        case 'Disgust':
          return 'bg-yellow-900 text-yellow-200';
        case 'anger':
        case 'Anger':
          return 'bg-red-900 text-red-200';
        case 'surprise':
        case 'Surprise':
          return 'bg-purple-900 text-purple-200';
        case 'fear':
        case 'Fear':
          return 'bg-indigo-900 text-indigo-200';
        default:
          return 'bg-gray-900 text-gray-200';
      }
    } else {
      switch (emotion) {
        case 'joy':
        case 'Joy':
          return 'bg-green-100 text-green-800';
        case 'neutral':
        case 'Neutral':
          return 'bg-gray-100 text-gray-800';
        case 'sadness':
        case 'Sadness':
          return 'bg-blue-100 text-blue-800';
        case 'disgust':
        case 'Disgust':
          return 'bg-yellow-100 text-yellow-800';
        case 'anger':
        case 'Anger':
          return 'bg-red-100 text-red-800';
        case 'surprise':
        case 'Surprise':
          return 'bg-purple-100 text-purple-800';
        case 'fear':
        case 'Fear':
          return 'bg-indigo-100 text-indigo-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
  };

  const renderTagInput = () => {
    return (
      <div className="w-full">
        <label className="block text-sm font-medium mb-1">Search Keywords</label>
        
        {/* Display keywords as tags */}
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {keywords.map(keyword => (
              <div 
                key={keyword} 
                className={`flex items-center px-2 py-1 rounded-md text-sm ${
                  darkMode ? 'bg-green-900/20 text-green-300' : 'bg-green-100 text-green-800'
                }`}
              >
                <span>{keyword}</span>
                <button 
                  onClick={() => removeKeyword(keyword)}
                  className="ml-2 text-opacity-70 hover:text-opacity-100"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeywordKeyDown}
            placeholder="Type and Add Keywords"
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-green-500`}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  const renderDepartmentSelect = () => {
    return (
      <div className="w-full">
        <label className="block text-sm font-medium mb-1">Departments</label>
        
        {/* Display selected departments as tags */}
        {selectedDepartments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedDepartments.map(dept => (
              <div 
                key={dept} 
                className={`flex items-center px-2 py-1 rounded-md text-sm ${
                  darkMode ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-100 text-blue-800'
                }`}
              >
                <span>{dept}</span>
                <button 
                  onClick={() => toggleDepartment(dept)}
                  className="ml-2 text-opacity-70 hover:text-opacity-100"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="relative mt-1">
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) toggleDepartment(e.target.value);
            }}
            className={`w-full px-4 py-2 rounded-lg border appearance-none ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-green-500`}
          >
            <option value="">Select Department{selectedDepartments.length > 0 ? ` (${selectedDepartments.length})` : ''}</option>
            {allDepartments
              .filter(dept => !selectedDepartments.includes(dept))
              .map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))
            }
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  const renderEmotionSelect = () => {
    return (
      <div className="w-full">
        <label className="block text-sm font-medium mb-1">Emotions</label>
        
        {/* Display selected emotions as tags */}
        {selectedEmotions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedEmotions.map(emotion => (
              <div 
                key={emotion} 
                className={`flex items-center px-2 py-1 rounded-md text-sm ${getEmotionColor(emotion)}`}
              >
                <span>{emotion}</span>
                <button 
                  onClick={() => toggleEmotion(emotion)}
                  className="ml-2 text-opacity-70 hover:text-opacity-100"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="relative mt-1">
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) toggleEmotion(e.target.value);
            }}
            className={`w-full px-4 py-2 rounded-lg border appearance-none ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-green-500`}
          >
            <option value="">Select Emotion{selectedEmotions.length > 0 ? ` (${selectedEmotions.length})` : ''}</option>
            {allEmotions
              .filter(emotion => !selectedEmotions.includes(emotion))
              .map(emotion => (
                <option key={emotion} value={emotion}>{emotion}</option>
              ))
            }
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  const renderExpandableChart = (chartId, title, chart) => {
    const isExpanded = expandedChart === chartId;
    
    return (
      <div 
        className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md relative`}
        ref={el => chartRefs.current[chartId] = el}
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={() => setExpandedChart(isExpanded ? null : chartId)}
            className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            title={isExpanded ? "Minimize" : "Expand"}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isExpanded ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              )}
            </svg>
          </button>
        </div>
        
        <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'h-96' : 'h-64'}`}>
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : chart}
        </div>
        
        {/* Fixed-position expanded chart */}
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 backdrop-blur-sm bg-black/20 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setExpandedChart(null)}
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className={`w-11/12 max-w-4xl rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{title}</h2>
                <button
                  onClick={() => setExpandedChart(null)}
                  className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="h-[70vh]">
                {chart}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen`}>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Results</h1>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Analyze feedback data and discover insights
        </p>
      </div>
      
      {/* Filter Bar */}
      <div className={`mb-6 p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Keywords Search */}
          <div>
            {renderTagInput()}
          </div>

          {/* Department Filter */}
          <div>
            {renderDepartmentSelect()}
          </div>

          {/* Emotion Filter */}
          <div>
            {renderEmotionSelect()}
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Sentiment Trend Card */}
        {renderExpandableChart('sentiment', 'Sentiment Trend', (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sentimentData}
              margin={{ top: 10, right: 0, left: 0, bottom: 5 }}
              stackOffset="expand"
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} />
              <XAxis dataKey="day" tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }} />
              <YAxis tickFormatter={(value) => `${Math.round(value * 100)}%`} tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }} />
              <Tooltip 
                formatter={(value) => [`${value}%`, '']}
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', 
                  borderColor: darkMode ? '#374151' : '#E5E7EB',
                  color: darkMode ? '#FFFFFF' : '#111827' 
                }}
              />
              <Legend />
              <Bar dataKey="positive" stackId="a" fill="#22c55e" name="Positive" />
              <Bar dataKey="negative" stackId="a" fill="#ef4444" name="Negative" />
            </BarChart>
          </ResponsiveContainer>
        ))}

        {/* Emotion Distribution Card */}
        {renderExpandableChart('emotion', 'Emotion Distribution', (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={emotionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius="80%"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {emotionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={EMOTION_COLORS[index % EMOTION_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Percentage']}
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', 
                  borderColor: darkMode ? '#374151' : '#E5E7EB',
                  color: darkMode ? '#FFFFFF' : '#111827' 
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ))}

        {/* Department Scores Card */}
        {renderExpandableChart('department', 'Department Scores', (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={departmentData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} horizontal={false} />
              <XAxis type="number" domain={[0, 5]} tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }} />
              <YAxis dataKey="name" type="category" tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', 
                  borderColor: darkMode ? '#374151' : '#E5E7EB',
                  color: darkMode ? '#FFFFFF' : '#111827' 
                }}
              />
              <Bar dataKey="score">
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || DEPARTMENT_COLORS[entry.name] || '#22c55e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ))}

        {/* Rating Distribution Card */}
        {renderExpandableChart('rating', 'Rating Distribution', (
          <ResponsiveContainer width="100%" height="100%">
            {activeMetricTab === 'rating' ? (
              <PieChart>
                <Pie
                  data={ratingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius="80%"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {ratingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RATING_COLORS[index % RATING_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Percentage']}
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', 
                    borderColor: darkMode ? '#374151' : '#E5E7EB',
                    color: darkMode ? '#FFFFFF' : '#111827' 
                  }}
                />
              </PieChart>
            ) : (
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="30%" 
                outerRadius="90%" 
                barSize={15} 
                data={[
                  { name: 'Sentiment Score', value: stats.sentimentScore, fill: '#22c55e' },
                ]}
                startAngle={90} 
                endAngle={-270}
              >
                <RadialBar
                  label={{ position: 'center', fill: darkMode ? '#FFFFFF' : '#111827', fontSize: 24, fontWeight: 'bold' }}
                  background
                  dataKey="value"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', 
                    borderColor: darkMode ? '#374151' : '#E5E7EB',
                    color: darkMode ? '#FFFFFF' : '#111827' 
                  }}
                />
              </RadialBarChart>
            )}
            <div className="absolute bottom-0 right-0 flex space-x-1 p-2">
              <button
                onClick={() => setActiveMetricTab('rating')}
                className={`px-2 py-1 text-xs rounded-l-md ${
                  activeMetricTab === 'rating'
                    ? 'bg-green-600 text-white'
                    : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Rating
              </button>
              <button
                onClick={() => setActiveMetricTab('sentiment')}
                className={`px-2 py-1 text-xs rounded-r-md ${
                  activeMetricTab === 'sentiment'
                    ? 'bg-green-600 text-white'
                    : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Sentiment
              </button>
            </div>
          </ResponsiveContainer>
        ))}
      </div>

      {/* Recent Reviews */}
      <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md mb-6`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Reviews</h2>
          <button 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            onClick={() => setShowReportModal(true)}
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generate Report
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`h-24 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`}></div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8">
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No reviews found matching your filters.</p>
            </div>
          ) : (
            getCurrentReviews().map((review) => (
              <div
                key={review._id}
                className={`p-4 rounded-lg border ${
                  darkMode 
                    ? 'border-gray-700 hover:border-green-500' 
                    : 'border-gray-200 hover:border-green-500'
                } transition-all cursor-pointer`}
                onClick={() => setExpandedReview(expandedReview === review._id ? null : review._id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getRatingColor(review.rating)}`}>
                      {review.rating?.toFixed(1) || 'N/A'} ★
                    </span>
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {review.source || 'Unknown Source'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getSentimentColor(review.sentiment_label)}`}>
                      {review.sentiment_label || 'Unknown Sentiment'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getEmotionColor(review.emotion_label)}`}>
                      {review.emotion_label || 'Unknown Emotion'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mr-2`}>
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                    <span className={`text-sm font-medium ${
                      darkMode 
                        ? 'bg-blue-900/30 text-blue-200' 
                        : 'bg-blue-100 text-blue-800'
                    } px-2 py-1 rounded`}>
                      {review.department || 'General'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-2">
                  <p className={expandedReview === review._id ? "" : "line-clamp-1"}>
                    {review.feedback_text || 'No feedback text available.'}
                  </p>
                </div>
                
                <div className="mt-1 text-right">
                  <span className={`text-xs ${darkMode ? 'text-green-500' : 'text-green-600'}`}>
                    {expandedReview === review._id ? 'Click to collapse' : 'Click to expand'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Pagination */}
        {reviews.length > reviewsPerPage && (
          <div className="mt-4 flex justify-center items-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-l-md ${
                currentPage === 1 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              Previous
            </button>
            
            <div className="px-4">
              Page {currentPage} of {totalPages}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-r-md ${
                currentPage === totalPages 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Report Generation Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={() => setShowReportModal(false)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className={`inline-block align-bottom ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium" id="modal-title">
                      Generate Feedback Report
                    </h3>
                    <div className="mt-2">
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Generate a comprehensive report with all graphs, data, and reviews matching your selected filters.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  {/* Report Format */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Report Format</label>
                    <div className="flex space-x-4">
                      <div className="flex items-center">
                        <input
                          id="format-pdf"
                          name="format"
                          type="radio"
                          checked={reportFormat === 'pdf'}
                          onChange={() => setReportFormat('pdf')}
                          className={`h-4 w-4 text-green-600 focus:ring-green-500 ${
                            darkMode ? 'bg-gray-800 border-gray-700' : 'border-gray-300'
                          }`}
                        />
                        <label htmlFor="format-pdf" className="ml-2 text-sm">
                          PDF
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="format-excel"
                          name="format"
                          type="radio"
                          checked={reportFormat === 'excel'}
                          onChange={() => setReportFormat('excel')}
                          className={`h-4 w-4 text-green-600 focus:ring-green-500 ${
                            darkMode ? 'bg-gray-800 border-gray-700' : 'border-gray-300'
                          }`}
                        />
                        <label htmlFor="format-excel" className="ml-2 text-sm">
                          Excel
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Timeframe Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Report Timeframe</label>
                    <div className="flex space-x-4">
                      <div className="flex items-center">
                        <input
                          id="timeframe-current"
                          name="timeframe"
                          type="radio"
                          checked={reportTimeframe === 'current'}
                          onChange={() => setReportTimeframe('current')}
                          className={`h-4 w-4 text-green-600 focus:ring-green-500 ${
                            darkMode ? 'bg-gray-800 border-gray-700' : 'border-gray-300'
                          }`}
                        />
                        <label htmlFor="timeframe-current" className="ml-2 text-sm">
                          Current Filters ({dateRange === 'week' ? 'Last 7 days' : 
                                            dateRange === 'month' ? 'Last 30 days' : 
                                            'Last 90 days'})
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="timeframe-custom"
                          name="timeframe"
                          type="radio"
                          checked={reportTimeframe === 'custom'}
                          onChange={() => setReportTimeframe('custom')}
                          className={`h-4 w-4 text-green-600 focus:ring-green-500 ${
                            darkMode ? 'bg-gray-800 border-gray-700' : 'border-gray-300'
                          }`}
                        />
                        <label htmlFor="timeframe-custom" className="ml-2 text-sm">
                          Custom Date Range
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Custom Date Range */}
                  {reportTimeframe === 'custom' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <input
                          type="date"
                          value={reportStartDate}
                          onChange={(e) => setReportStartDate(e.target.value)}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-green-500`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <input
                          type="date"
                          value={reportEndDate}
                          onChange={(e) => setReportEndDate(e.target.value)}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-green-500`}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Report Contents */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Report Contents</label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          id="include-graphs"
                          name="include-graphs"
                          type="checkbox"
                          checked={includeGraphs}
                          onChange={(e) => setIncludeGraphs(e.target.checked)}
                          className={`h-4 w-4 text-green-600 focus:ring-green-500 ${
                            darkMode ? 'bg-gray-800 border-gray-700' : 'border-gray-300'
                          }`}
                        />
                        <label htmlFor="include-graphs" className="ml-2 text-sm">
                          Include all graphs and metrics
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="include-reviews"
                          name="include-reviews"
                          type="checkbox"
                          checked={includeReviews}
                          onChange={(e) => setIncludeReviews(e.target.checked)}
                          className={`h-4 w-4 text-green-600 focus:ring-green-500 ${
                            darkMode ? 'bg-gray-800 border-gray-700' : 'border-gray-300'
                          }`}
                        />
                        <label htmlFor="include-reviews" className="ml-2 text-sm">
                          Include filtered reviews
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Report Features */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Report Improvements</label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          id="include-negative-keywords"
                          name="include-negative-keywords"
                          type="checkbox"
                          checked={includeNegativeKeywords}
                          onChange={(e) => setIncludeNegativeKeywords(e.target.checked)}
                          className={`h-4 w-4 text-green-600 focus:ring-green-500 ${
                            darkMode ? 'bg-gray-800 border-gray-700' : 'border-gray-300'
                          }`}
                        />
                        <label htmlFor="include-negative-keywords" className="ml-2 text-sm">
                          Include negative keywords analysis
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="include-both-sentiment-emotion"
                          name="include-both-sentiment-emotion"
                          type="checkbox"
                          checked={includeBothSentimentEmotion}
                          onChange={(e) => setIncludeBothSentimentEmotion(e.target.checked)}
                          className={`h-4 w-4 text-green-600 focus:ring-green-500 ${
                            darkMode ? 'bg-gray-800 border-gray-700' : 'border-gray-300'
                          }`}
                        />
                        <label htmlFor="include-both-sentiment-emotion" className="ml-2 text-sm">
                          Show both sentiment and emotion for each review
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="enhanced-visual-design"
                          name="enhanced-visual-design"
                          type="checkbox"
                          checked={enhancedVisualDesign}
                          onChange={(e) => setEnhancedVisualDesign(e.target.checked)}
                          className={`h-4 w-4 text-green-600 focus:ring-green-500 ${
                            darkMode ? 'bg-gray-800 border-gray-700' : 'border-gray-300'
                          }`}
                        />
                        <label htmlFor="enhanced-visual-design" className="ml-2 text-sm">
                          Use enhanced visual design with insights
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Applied Filters */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Applied Filters</label>
                    <div className={`p-3 rounded-md text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <p><strong>Keywords:</strong> {keywords.length > 0 ? keywords.join(', ') : 'None'}</p>
                      <p><strong>Departments:</strong> {selectedDepartments.length > 0 ? selectedDepartments.join(', ') : 'All'}</p>
                      <p><strong>Emotions:</strong> {selectedEmotions.length > 0 ? selectedEmotions.join(', ') : 'All'}</p>
                      <p><strong>Date Range:</strong> {dateRange === 'week' ? 'Last 7 days' : dateRange === 'month' ? 'Last 30 days' : 'Last 90 days'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
                <button
                  type="button"
                  onClick={handleGenerateReport}
                  disabled={generatingReport || (reportTimeframe === 'custom' && (!reportStartDate || !reportEndDate)) || (!includeGraphs && !includeReviews)}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm ${
                    generatingReport || (reportTimeframe === 'custom' && (!reportStartDate || !reportEndDate)) || (!includeGraphs && !includeReviews) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {generatingReport ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : `Generate ${reportFormat.toUpperCase()}`}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                    darkMode 
                      ? 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 focus:ring-gray-500' 
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-200'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;