import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../contexts/ThemeContext';
import api from '../services/api';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area
} from 'recharts';

const HistoricalAnalysis = () => {
  const { darkMode } = useContext(ThemeContext);
  
  // Filter states
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getCurrentDate());
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGraphSelector, setShowGraphSelector] = useState(false);
  
  // Graph states
  const [graphs, setGraphs] = useState([
    { id: 'sentiment', name: 'Sentiment Trend', type: 'line' },
    { id: 'departments', name: 'Department Comparison', type: 'bar' },
    { id: 'rating', name: 'Rating Trend', type: 'line' },
  ]);
  const [historicalData, setHistoricalData] = useState([]);
  
  // Data for various charts
  const [trendData, setTrendData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [emotionData, setEmotionData] = useState([]);
  const [sentimentComparisonData, setSentimentComparisonData] = useState([]);
  const [ratingDistributionData, setRatingDistributionData] = useState([]);
  const [weeklyTrendData, setWeeklyTrendData] = useState([]);
  
  // Stats
  const [stats, setStats] = useState({
    totalReviews: 0,
    avgRating: 0,
    sentimentScore: 0,
    trendDirection: 'Stable'
  });
  
  // Graph types available
  const availableGraphs = [
    { id: 'sentiment', name: 'Sentiment Trend', type: 'line' },
    { id: 'rating', name: 'Rating Trend', type: 'line' },
    { id: 'volume', name: 'Review Volume', type: 'bar' },
    { id: 'departments', name: 'Department Comparison', type: 'bar' },
    { id: 'emotions', name: 'Emotion Distribution', type: 'pie' },
    { id: 'sentiment-comparison', name: 'Sentiment Comparison', type: 'area' },
  ];
  
  const DEPARTMENT_COLORS = {
    'Front Desk': '#60a5fa',
    'Housekeeping': '#4ade80',
    'Room Service': '#22c55e',
    'Food & Beverage': '#8b5cf6',
    'Maintenance & amenities': '#f59e0b',
    'Restaurant/Café': '#0ea5e9',
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
  const [expandedChart, setExpandedChart] = useState(null);

  const EMOTION_COLORS = ['#4ade80', '#94a3b8', '#60a5fa', '#f59e0b', '#ef4444'];

  const graphSelectorRef = useRef(null);

  const chartRefs = useRef({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (graphSelectorRef.current && !graphSelectorRef.current.contains(event.target)) {
        setShowGraphSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const exportChartAsImage = (chartId) => {
    const chartContainer = chartRefs.current[chartId];
    if (!chartContainer) return null;

    const svgElement = chartContainer.querySelector('svg');
    if (!svgElement) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = svgElement.width.baseVal.value;
    canvas.height = svgElement.height.baseVal.value;
    
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    
    return new Promise((resolve) => {
      img.onload = () => {
        ctx.fillStyle = darkMode ? '#1F2937' : '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve({
          dataURL,
          title: chartId === 'sentiment' ? 'Sentiment Trend' :
                 chartId === 'rating' ? 'Rating Trend' :
                 chartId === 'departments' ? 'Department Comparison' :
                 chartId === 'emotions' ? 'Emotion Distribution' :
                 chartId === 'volume' ? 'Review Volume' :
                 chartId === 'sentiment-comparison' ? 'Sentiment Comparison' : 
                 'Historical Chart'
        });
      };
    });
  };

  const exportAllCharts = async () => {
    const chartData = [];

    const chartIds = graphs.map(g => g.id);
    
    for (const chartId of chartIds) {
      try {
        const chart = await exportChartAsImage(chartId);
        if (chart) chartData.push(chart);
      } catch (error) {
        console.error(`Error exporting chart ${chartId}:`, error);
      }
    }
    
    return chartData;
  };

  useEffect(() => {
    window.exportHistoricalCharts = exportAllCharts;
    
    return () => {
      delete window.exportHistoricalCharts;
    };
  }, [graphs, darkMode]); 

  function getCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }
  
  function getDefaultStartDate() {
    const date = new Date();
    date.setDate(date.getDate() - 14);
    return date.toISOString().split('T')[0];
  }

  const toggleDepartment = (dept) => {
    if (selectedDepartments.includes(dept)) {
      setSelectedDepartments(selectedDepartments.filter(d => d !== dept));
    } else {
      setSelectedDepartments([...selectedDepartments, dept]);
    }
  };
  
  const handleRefresh = () => {
    setLoading(true);
    fetchData();
  };
  
  const fetchData = async () => {
    try {
      setLoading(true);
 
      const params = {
        start: startDate,
        end: endDate
      };
      
      if (selectedDepartments.length > 0) {
        params.departments = selectedDepartments.join(',');
      }
      
      const histResponse = await api.get('/feedback/historical', { params });
      setHistoricalData(histResponse.data || []);

      const feedbackResponse = await api.get('/feedback', { params });
      const feedbackData = feedbackResponse.data || [];
      
      processTrendData(histResponse.data);
      processDepartmentData(feedbackData);
      processEmotionData(feedbackData);
      processSentimentComparisonData(histResponse.data);
      processRatingDistributionData(feedbackData);
      processWeeklyTrendData(feedbackData);
 
      calculateStats(feedbackData, histResponse.data);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const processTrendData = (historicalData) => {
    const formattedData = historicalData.map(item => ({
      date: item._id,
      sentiment: item.avgRating || 0,
      rating: item.avgRating || 0,
      reviews: item.count || 0
    }));
    
    setTrendData(formattedData);
  };
  
  const processDepartmentData = (feedbackData) => {
    const deptsToShow = selectedDepartments.length > 0 ? selectedDepartments : allDepartments;

    const deptScores = feedbackData.reduce((acc, review) => {
      const dept = review.department || 'Unknown';
      
      if (!acc[dept]) {
        acc[dept] = { current: 0, previous: 0, currentCount: 0, previousCount: 0 };
      }
     
      const reviewDate = new Date(review.date);
      const midpoint = new Date(startDate);
      midpoint.setDate(midpoint.getDate() + (new Date(endDate) - new Date(startDate)) / (2 * 86400000));
      
      if (reviewDate >= midpoint) {
        acc[dept].current += review.rating || 0;
        acc[dept].currentCount++;
      } else {
        acc[dept].previous += review.rating || 0;
        acc[dept].previousCount++;
      }
      
      return acc;
    }, {});

    const data = deptsToShow.map(dept => {
      const currentAvg = deptScores[dept]?.currentCount > 0 
        ? parseFloat((deptScores[dept].current / deptScores[dept].currentCount).toFixed(1)) 
        : 0;
      
      const previousAvg = deptScores[dept]?.previousCount > 0 
        ? parseFloat((deptScores[dept].previous / deptScores[dept].previousCount).toFixed(1)) 
        : 0;
      
      return {
        name: dept,
        current: currentAvg,
        previous: previousAvg,
        color: DEPARTMENT_COLORS[dept] || '#22c55e'
      };
    }).filter(dept => dept.current > 0 || dept.previous > 0 || selectedDepartments.includes(dept.name));
    
    setDepartmentData(data);
  };
  
  const processEmotionData = (feedbackData) => {
    const emotionCounts = {};
    let totalWithEmotion = 0;
    
    feedbackData.forEach(review => {
      if (!review.emotion_label) return;
      
      const emotion = review.emotion_label;
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      totalWithEmotion++;
    });
    
    const data = Object.keys(emotionCounts).map(name => ({
      name,
      value: Math.round((emotionCounts[name] / (totalWithEmotion || 1)) * 100)
    })).sort((a, b) => b.value - a.value).slice(0, 5); 
    
    setEmotionData(data);
  };
  
  const processSentimentComparisonData = (historicalData) => {
       const formattedData = historicalData.map(item => {
      const positivePercentage = Math.min(Math.round(item.avgRating * 20) || 70, 95); 
      const neutralPercentage = Math.round((100 - positivePercentage) / 2);
      const negativePercentage = 100 - positivePercentage - neutralPercentage;
      
      return {
        date: item._id,
        positive: positivePercentage,
        neutral: neutralPercentage,
        negative: negativePercentage
      };
    });
    
    setSentimentComparisonData(formattedData);
  };
  
  const processRatingDistributionData = (feedbackData) => {
      const ratingCounts = {
      '1★': 0,
      '2★': 0,
      '3★': 0,
      '4★': 0,
      '5★': 0
    };
    
    feedbackData.forEach(review => {
      if (!review.rating) return;
      
      const rating = Math.round(review.rating);
      if (rating >= 1 && rating <= 5) {
        ratingCounts[`${rating}★`]++;
      }
    });
    
    const data = Object.keys(ratingCounts).map(name => ({
      name,
      value: feedbackData.length > 0 ? Math.round((ratingCounts[name] / feedbackData.length) * 100) : 0
    })).sort((a, b) => {
      return parseInt(b.name) - parseInt(a.name);
    });
    
    setRatingDistributionData(data);
  };
  
  const processWeeklyTrendData = (feedbackData) => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayData = {};
 
    daysOfWeek.forEach(day => {
      dayData[day] = { rating: 0, sentiment: 0, count: 0 };
    });

    feedbackData.forEach(review => {
      if (!review.date) return;
      
      const date = new Date(review.date);
      const dayOfWeek = daysOfWeek[date.getDay()];
      
      dayData[dayOfWeek].rating += review.rating || 0;
      dayData[dayOfWeek].sentiment += review.sentiment_confidence || 0;
      dayData[dayOfWeek].count++;
    });

    const data = daysOfWeek.map(day => {
      const count = dayData[day].count || 1; 
      return {
        day,
        rating: parseFloat((dayData[day].rating / count).toFixed(1)),
        sentiment: parseFloat((dayData[day].sentiment / count).toFixed(1)),
        count: dayData[day].count
      };
    });
    
    setWeeklyTrendData(data);
  };
  
  const calculateStats = (reviews, historicalData) => {
    if (!reviews || reviews.length === 0) {
      return { totalReviews: 0, avgRating: 0, sentimentScore: 0 };
    }

    let totalRating = 0;
    let ratingCount = 0;
    
    reviews.forEach(review => {
      if (review.rating) {
        totalRating += review.rating;
        ratingCount++;
      }
    });
    
    const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0;
 
    const positiveSentiment = reviews.filter(r => 
      r.sentiment_label === 'positive' || r.sentiment_label === 'very positive'
    ).length;
    
    const sentimentScore = reviews.length > 0 ? 
      Math.round((positiveSentiment / reviews.length) * 100) : 0;
  
    let trendDirection = 'Stable';
    if (historicalData.length >= 2) {
      const recentHalf = historicalData.slice(-Math.ceil(historicalData.length / 2));
      const olderHalf = historicalData.slice(0, Math.floor(historicalData.length / 2));
      
      const recentAvg = recentHalf.reduce((sum, item) => sum + (item.avgRating || 0), 0) / recentHalf.length;
      const olderAvg = olderHalf.reduce((sum, item) => sum + (item.avgRating || 0), 0) / olderHalf.length;
      
      if (recentAvg > olderAvg) {
        trendDirection = 'Improving';
      } else if (recentAvg < olderAvg) {
        trendDirection = 'Declining';
      }
    }
    
    setStats({
      totalReviews: reviews.length,
      avgRating,
      sentimentScore,
      trendDirection
    });
  };
  
  const addGraph = (graphType) => {
    if (graphs.length < 6) {

      if (!graphs.find(g => g.id === graphType.id)) {
        setGraphs([...graphs, graphType]);
      }
      setShowGraphSelector(false);
    }
  };
  
  const removeGraph = (id) => {
    setGraphs(graphs.filter(g => g.id !== id));
  };

  const renderDepartmentSelect = () => {
    return (
      <div className="w-full">
        <div className="relative">
          {selectedDepartments.length > 0 && (
            <div className="absolute left-4 right-8 top-1/2 transform -translate-y-1/2 flex flex-wrap gap-1 max-w-full overflow-hidden">
              {selectedDepartments.map(dept => (
                <div 
                  key={dept} 
                  className={`flex items-center px-2 py-0.5 text-xs rounded ${
                    darkMode ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  <span className="truncate">{dept}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDepartment(dept);
                    }}
                    className="ml-1"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) toggleDepartment(e.target.value);
            }}
            className={`w-full px-4 py-2 rounded-lg border appearance-none ${
              selectedDepartments.length > 0 ? 'text-transparent' : ''
            } ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-green-500`}
          >
            <option value="">
              {selectedDepartments.length === 0 
                ? 'Select Department' 
                : `${selectedDepartments.length} selected`}
            </option>
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
 
  const renderGraph = (graphType) => {
    switch(graphType.id) {
      case 'sentiment':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} />
              <XAxis dataKey="date" tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }} />
              <YAxis domain={[0, 5]} tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', 
                  borderColor: darkMode ? '#374151' : '#E5E7EB',
                  color: darkMode ? '#FFFFFF' : '#111827' 
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sentiment" 
                stroke="#22c55e" 
                activeDot={{ r: 8 }} 
                name="Sentiment Score" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'rating':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} />
              <XAxis dataKey="date" tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }} />
              <YAxis domain={[0, 5]} tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', 
                  borderColor: darkMode ? '#374151' : '#E5E7EB',
                  color: darkMode ? '#FFFFFF' : '#111827' 
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="rating" 
                stroke="#3b82f6" 
                activeDot={{ r: 8 }} 
                name="Rating" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'volume':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={trendData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} />
              <XAxis dataKey="date" tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }} />
              <YAxis tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', 
                  borderColor: darkMode ? '#374151' : '#E5E7EB',
                  color: darkMode ? '#FFFFFF' : '#111827' 
                }}
              />
              <Legend />
              <Bar dataKey="reviews" fill="#8b5cf6" name="Review Count" />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'departments':
        return (
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
              <Legend />
              <Bar dataKey="current" name="Current Period" fill="#22c55e" />
              <Bar dataKey="previous" name="Previous Period" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'emotions':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={emotionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
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
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'sentiment-comparison':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sentimentComparisonData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} />
              <XAxis dataKey="date" tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }} />
              <YAxis tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', 
                  borderColor: darkMode ? '#374151' : '#E5E7EB',
                  color: darkMode ? '#FFFFFF' : '#111827' 
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="positive" stackId="1" stroke="#22c55e" fill="#22c55e" name="Positive" />
              <Area type="monotone" dataKey="neutral" stackId="1" stroke="#94a3b8" fill="#94a3b8" name="Neutral" />
              <Area type="monotone" dataKey="negative" stackId="1" stroke="#ef4444" fill="#ef4444" name="Negative" />
            </AreaChart>
          </ResponsiveContainer>
        );
        
      default:
        return <div>Unknown graph type</div>;
    }
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
        <h1 className="text-3xl font-bold">Historical Analysis</h1>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Analyze trends and patterns over time
        </p>
      </div>
      
      {/* Filter Bar */}
      <div className={`mb-6 p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            {renderDepartmentSelect()}
          </div>

          {/* Refresh Button */}
          <div>
            <button
              onClick={handleRefresh}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : "Refresh Data"}
            </button>
          </div>
        </div>
      </div>
      
      {/* Add Graph Button with Dropdown */}
      <div className="mb-4 flex justify-end relative" ref={graphSelectorRef}>
        <button
          onClick={() => setShowGraphSelector(!showGraphSelector)}
          className={`px-4 py-2 rounded-lg flex items-center ${
            graphs.length >= 6
              ? 'bg-gray-400 cursor-not-allowed text-gray-200'
              : 'bg-green-600 hover:bg-green-700 text-white'
          } transition-colors`}
          disabled={graphs.length >= 6}
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Graph
          <svg className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Graph Selection Dropdown */}
        {showGraphSelector && (
          <div className={`absolute right-0 top-12 z-10 w-64 mt-2 rounded-md shadow-lg ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } ring-1 ring-black ring-opacity-5 overflow-y-auto max-h-60`}>
            <div className="py-1">
              {availableGraphs
                .filter(graph => !graphs.some(g => g.id === graph.id))
                .map(graph => (
                  <button
                    key={graph.id}
                    onClick={() => addGraph(graph)}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      darkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="w-8 text-center">
                        {graph.type === 'line' && (
                          <svg className="h-5 w-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
                          </svg>
                        )}
                        {graph.type === 'bar' && (
                          <svg className="h-5 w-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        )}
                        {graph.type === 'pie' && (
                          <svg className="h-5 w-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                          </svg>
                        )}
                        {graph.type === 'area' && (
                          <svg className="h-5 w-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        )}
                      </span>
                      <span className="ml-2">{graph.name}</span>
                    </div>
                  </button>
                ))}
                {availableGraphs.filter(graph => !graphs.some(g => g.id === graph.id)).length === 0 && (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    All graph types are already displayed
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
      
      {/* Graphs Grid */}
      <div className={`grid grid-cols-1 ${
        graphs.length === 1 ? 'md:grid-cols-1' : 
        graphs.length === 2 ? 'md:grid-cols-2' : 
        graphs.length <= 4 ? 'md:grid-cols-2' : 
        'md:grid-cols-3'
      } gap-6 mb-8`}>
        {graphs.map((graph) => (
          <div key={graph.id}>
            {renderExpandableChart(graph.id, graph.name, renderGraph(graph))}
          </div>
        ))}
      </div>
      
      {/* Summary Card */}
      <div className={`p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md mb-6`}>
        <h2 className="text-xl font-semibold mb-4">Period Summary</h2>
        {loading ? (
          <div className="animate-pulse">
            <div className={`h-4 w-3/4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-2`}></div>
            <div className={`h-4 w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-2`}></div>
            <div className={`h-4 w-5/6 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
          </div>
        ) : (
          <div>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              The analysis shows a {stats.trendDirection.toLowerCase()} trend in customer satisfaction over the selected period. 
              The overall sentiment score is {stats.sentimentScore}%, with an average rating of {stats.avgRating}.
            </p>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              {departmentData.length > 0 ? (
                <>
                  {departmentData[0]?.name} has shown the most improvement, with a sentiment increase of {
                    ((departmentData[0]?.current || 0) - (departmentData[0]?.previous || 0)).toFixed(1)
                  } points. {departmentData.length > 1 ? `${departmentData[1]?.name} maintains the highest consistent scores.` : ''}
                </>
              ) : (
                'Not enough department data to show trends.'
              )}
            </p>
            <div className="mt-4">
              <h3 className="font-medium text-lg mb-2">Key Observations:</h3>
              <ul className={`list-disc pl-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Total of {stats.totalReviews} reviews analyzed in this period</li>
                <li>Sentiment trend is {stats.trendDirection.toLowerCase()} over time</li>
                {emotionData.length > 0 && (
                  <li>{emotionData[0]?.name} remains the dominant emotion in customer feedback ({emotionData[0]?.value}% of all reviews)</li>
                )}
                <li>Average rating is {stats.avgRating} out of 5.0</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md`}>
          <h3 className="text-lg font-semibold">Total Reviews</h3>
          <p className={`text-3xl font-bold ${darkMode ? 'text-green-500' : 'text-green-600'}`}>
            {loading ? <span className="animate-pulse">...</span> : stats.totalReviews}
          </p>
        </div>
        
        <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md`}>
          <h3 className="text-lg font-semibold">Average Rating</h3>
          <p className={`text-3xl font-bold ${darkMode ? 'text-green-500' : 'text-green-600'}`}>
            {loading ? <span className="animate-pulse">...</span> : stats.avgRating}
          </p>
        </div>
        
        <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md`}>
          <h3 className="text-lg font-semibold">Sentiment Score</h3>
          <p className={`text-3xl font-bold ${darkMode ? 'text-green-500' : 'text-green-600'}`}>
            {loading ? <span className="animate-pulse">...</span> : `${stats.sentimentScore}%`}
          </p>
        </div>
        
        <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md`}>
          <h3 className="text-lg font-semibold">Trend Direction</h3>
          <p className={`text-3xl font-bold ${
            stats.trendDirection === 'Improving' 
              ? (darkMode ? 'text-green-500' : 'text-green-600')
              : stats.trendDirection === 'Declining'
                ? (darkMode ? 'text-red-500' : 'text-red-600') 
                : (darkMode ? 'text-blue-500' : 'text-blue-600')
          }`}>
            {loading ? <span className="animate-pulse">...</span> : stats.trendDirection}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HistoricalAnalysis; 