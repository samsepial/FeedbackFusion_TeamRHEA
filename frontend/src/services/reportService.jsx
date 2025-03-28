// src/services/reportService.jsx
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import api from './api';

export const generateReport = async (params, data) => {
  try {
    // Client-side generation
    if (params.format === 'pdf') {
      await generatePdfClientSide(params, data);
    } else if (params.format === 'excel') {
      generateExcelClientSide(params, data);
    } else {
      throw new Error('Unsupported format');
    }
    
    return true;
  } catch (error) {
    console.error('Report generation error:', error);
    alert('Failed to generate report. Please try again.');
    throw error;
  }
};

// Export functions for direct report generation
export const generateMonthlyReport = async (customLogo = null) => {
  // Get data for last 30 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);
  
  try {
    // Fetch data from the API
    const response = await api.get('/feedback', {
      params: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    });
    const reviews = response.data;
    
    // Process the data
    const sentimentData = processSentimentData(reviews);
    const emotionData = processEmotionData(reviews);
    const departmentData = processDepartmentData(reviews);
    const ratingData = processRatingData(reviews);
    const stats = calculateStats(reviews);
    const negativeKeywords = extractNegativeKeywords(reviews);
    
    // Get logo from file
    let logoImage = null;
    try {
      // Load the logo from the public folder
      const logoUrl = '/FF.png'; // Your logo file
      const response = await fetch(logoUrl);
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
    
    // Generate the report
    await generateReport(
      {
        format: 'pdf',
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        includeReviews: true,
        includeGraphs: true,
        includeNegativeKeywords: true,
        enhancedVisualDesign: true,
        includeBothSentimentEmotion: true,
        includeHistoricalCharts: true,
        customLogo: logoImage,
        filters: {
          department: 'All',
          emotion: 'All',
          keyword: '',
        }
      },
      {
        sentimentData,
        emotionData,
        departmentData,
        ratingData,
        reviews,
        stats,
        negativeKeywords,
        historicalCharts: [] // This is where the comma was missing
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error generating monthly report:', error);
    alert('Failed to generate monthly report. Please try again.');
    return false;
  }
};

export const generateDepartmentReport = async (customLogo = null) => {
  // Get data for last 90 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 90);
  
  try {
    // Fetch data from the API
    const response = await api.get('/feedback', {
      params: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    });
    const reviews = response.data;
    
    // Process the data
    const sentimentData = processSentimentData(reviews);
    const emotionData = processEmotionData(reviews);
    const departmentData = processDepartmentData(reviews);
    const ratingData = processRatingData(reviews);
    const stats = calculateStats(reviews);
    const negativeKeywords = extractNegativeKeywords(reviews);
    
    // Get custom logo from file
    let logoImage = null;
    try {
      // Try to load the logo from the public folder
      const logoUrl = '/FF.png'; // Your logo file
      await fetch(logoUrl)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = function() {
            logoImage = reader.result;
          };
          reader.readAsDataURL(blob);
        });
    } catch (err) {
      console.error('Error loading logo:', err);
    }
    
    // Wait for logo to load
    if (!logoImage) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Generate the report
    await generateReport(
      {
        format: 'pdf',
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        includeReviews: true,
        includeGraphs: true,
        includeNegativeKeywords: true,
        enhancedVisualDesign: true,
        includeBothSentimentEmotion: true,
        includeHistoricalCharts: true,
        customLogo: logoImage || customLogo,
        filters: {
          department: 'All',
          emotion: 'All',
          keyword: '',
        }
      },
      {
        sentimentData,
        emotionData,
        departmentData,
        ratingData,
        reviews,
        stats,
        negativeKeywords,
        historicalCharts: [] // Make sure there's a comma if this isn't the last property
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error generating department report:', error);
    alert('Failed to generate department report. Please try again.');
    return false;
  }
};

// Save report history to localStorage
const saveReportHistory = (reportInfo) => {
  try {
    // Get existing reports from localStorage
    const existingReportsJSON = localStorage.getItem('generatedReports');
    let existingReports = existingReportsJSON ? JSON.parse(existingReportsJSON) : [];
    
    // Add new report to the beginning of the array
    existingReports.unshift({
      id: Date.now().toString(),
      ...reportInfo
    });
    
    // Keep only the last 10 reports
    if (existingReports.length > 10) {
      existingReports = existingReports.slice(0, 10);
    }
    
    // Save back to localStorage
    localStorage.setItem('generatedReports', JSON.stringify(existingReports));
  } catch (error) {
    console.error('Error saving report history:', error);
  }
};

// Get report history from localStorage
export const getReportHistory = () => {
  try {
    const reportsJSON = localStorage.getItem('generatedReports');
    return reportsJSON ? JSON.parse(reportsJSON) : [];
  } catch (error) {
    console.error('Error getting report history:', error);
    return [];
  }
};

// Client-side PDF generation
const generatePdfClientSide = async (params, data) => {
  try {
    const {
      startDate,
      endDate,
      includeReviews,
      includeGraphs,
      includeNegativeKeywords = true,
      enhancedVisualDesign = true,
      includeBothSentimentEmotion = true,
      includeHistoricalCharts = false, // New parameter
      customLogo = null, // New parameter for custom logo
      filters
    } = params;
    
    const {
      sentimentData,
      emotionData,
      departmentData,
      ratingData,
      historicalCharts = [], // Array of chart data URLs from Historical Analysis
      reviews,
      stats,
      negativeKeywords = extractNegativeKeywords(reviews)
    } = data;
    
    // Create a new document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add cover page if enhanced design is enabled
    if (enhancedVisualDesign) {
      addCoverPage(doc, startDate, endDate, customLogo);
    } else {
      // Simple title page
      addSimpleTitle(doc, startDate, endDate, filters);
    }
    
    // Add executive summary if enhanced design is enabled
    if (enhancedVisualDesign) {
      doc.addPage();
      addExecutiveSummary(doc, data);
      
      if (includeNegativeKeywords) {
        addKeyInsightsBox(doc, data, negativeKeywords);
      }
    }
    
    // Add charts if requested
    if (includeGraphs) {
      if (enhancedVisualDesign) {
        await addEnhancedCharts(doc, data);
      } else {
        await addBasicCharts(doc, data);
      }
      
      // Add historical charts if requested and available
      if (includeHistoricalCharts && historicalCharts && historicalCharts.length > 0) {
        doc.addPage();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(34, 197, 94);
        doc.text('Historical Analysis', 105, 20, { align: 'center' });
        
        let yPosition = 40;
        for (let i = 0; i < historicalCharts.length; i++) {
          // Check if we need a new page
          if (yPosition > 200) {
            doc.addPage();
            yPosition = 40;
          }
          
          try {
            // Add the chart image
            doc.addImage(historicalCharts[i].dataURL, 'PNG', 20, yPosition, 170, 80);
            // Add chart title
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(60, 60, 60);
            doc.text(historicalCharts[i].title || `Historical Chart ${i+1}`, 105, yPosition - 10, { align: 'center' });
            
            yPosition += 100; // Move position for next chart
          } catch (error) {
            console.error(`Error adding historical chart ${i}:`, error);
          }
        }
      }
    }
    
    // Add reviews if requested
    if (includeReviews) {
      if (enhancedVisualDesign && includeBothSentimentEmotion) {
        addEnhancedReviewsTable(doc, reviews);
      } else {
        addBasicReviewsTable(doc, reviews);
      }
    }
    
    // Add footer with date and page numbers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addPageFooter(doc, i, totalPages);
    }
    
    // Save the document
    doc.save(`Feedback_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    
    // Store report info in localStorage to show on dashboard
    saveReportHistory({
      type: 'pdf',
      dateGenerated: new Date().toISOString(),
      name: `Feedback Report ${new Date().toLocaleDateString()}`,
      filters: {
        startDate,
        endDate,
        department: filters.department,
        emotion: filters.emotion,
        keyword: filters.keyword
      },
      stats: {
        totalReviews: stats.totalReviews || 0,
        avgRating: stats.avgRating || 0
      }
    });
    
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};

// Client-side Excel generation
const generateExcelClientSide = (params, data) => {
  try {
    const {
      startDate,
      endDate,
      includeReviews,
      includeGraphs,
      includeNegativeKeywords = true,
      filters
    } = params;
    
    const {
      sentimentData,
      emotionData,
      departmentData,
      ratingData,
      reviews,
      stats,
      negativeKeywords = extractNegativeKeywords(reviews)
    } = data;
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Summary data
    const summaryData = [
      ['Feedback Analysis Report'],
      [],
      [`Date Range: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`],
      [`Filters: ${filters.department !== 'All' ? `Department: ${filters.department}, ` : ''}${filters.emotion !== 'All' ? `Emotion: ${filters.emotion}, ` : ''}${filters.keyword ? `Keyword: ${filters.keyword}` : 'None'}`],
      [],
      ['Summary Statistics'],
      ['Total Reviews', stats.totalReviews || 0],
      ['Average Rating', stats.avgRating || 0],
      ['Sentiment Score', `${stats.sentimentScore || 0}%`],
      []
    ];
    
    // Add negative keywords if requested
    if (includeNegativeKeywords && negativeKeywords.length > 0) {
      summaryData.push(['Top Negative Keywords']);
      negativeKeywords.slice(0, 10).forEach((keyword, index) => {
        summaryData.push([`${index + 1}. ${keyword}`]);
      });
      summaryData.push([]);
    }
    
    // Add chart data if available
    if (includeGraphs) {
      // Add sentiment data
      if (sentimentData && sentimentData.length > 0) {
        summaryData.push(['Sentiment Trend']);
        summaryData.push(['Day', 'Positive (%)', 'Negative (%)']);
        sentimentData.forEach(item => {
          summaryData.push([item.day, item.positive, item.negative]);
        });
        summaryData.push([]);
      }
      
      // Add emotion data
      if (emotionData && emotionData.length > 0) {
        summaryData.push(['Emotion Distribution']);
        summaryData.push(['Emotion', 'Percentage (%)']);
        emotionData.forEach(item => {
          summaryData.push([item.name, item.value]);
        });
        summaryData.push([]);
      }
      
      // Add department data
      if (departmentData && departmentData.length > 0) {
        summaryData.push(['Department Scores']);
        summaryData.push(['Department', 'Score']);
        departmentData.forEach(item => {
          summaryData.push([item.name, item.score]);
        });
      }
    }
    
    // Create worksheet for summary
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Add reviews if requested
    if (includeReviews && reviews && reviews.length > 0) {
      // Reviews data
      const reviewsData = [
        ['ID', 'Rating', 'Date', 'Department', 'Sentiment', 'Emotion', 'Review Text']
      ];
      
      // Add review rows (limit to 100 reviews to avoid performance issues)
      reviews.slice(0, 100).forEach((review, index) => {
        reviewsData.push([
          index + 1,
          review.rating ? review.rating.toFixed(1) : 'N/A',
          review.date ? new Date(review.date).toLocaleDateString() : 'N/A',
          review.department || 'N/A',
          review.sentiment_label || 'N/A',
          review.emotion_label || 'N/A',
          review.feedback_text || 'N/A'
        ]);
      });
      
      // Create worksheet for reviews
      const reviewsSheet = XLSX.utils.aoa_to_sheet(reviewsData);
      XLSX.utils.book_append_sheet(workbook, reviewsSheet, 'Reviews');
    }
    
    // Write file and trigger download
    XLSX.writeFile(workbook, `Feedback_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    // Store report info in localStorage to show on dashboard
    saveReportHistory({
      type: 'excel',
      dateGenerated: new Date().toISOString(),
      name: `Feedback Report ${new Date().toLocaleDateString()}`,
      filters: {
        startDate,
        endDate,
        department: filters.department,
        emotion: filters.emotion,
        keyword: filters.keyword
      },
      stats: {
        totalReviews: stats.totalReviews || 0,
        avgRating: stats.avgRating || 0
      }
    });
  } catch (error) {
    console.error('Excel generation error:', error);
    throw error;
  }
};

// Extract negative keywords
const extractNegativeKeywords = (reviews) => {
  // Count occurrences of negative words
  const wordCounts = {};
  const negativeReviews = reviews.filter(r => 
    r.sentiment_label === 'negative' || r.sentiment_label === 'very negative');

  negativeReviews.forEach(review => {
    if (!review.feedback_text) return;
    
    const text = review.feedback_text.toLowerCase();
    
    // Check text against common negative keywords
    const negativeWordsList = [
      'slow', 'cold', 'dirty', 'broken', 'noise', 'poor', 'disappointing', 
      'expensive', 'rude', 'wait', 'error', 'wrong', 'bad', 'overpriced',
      'issue', 'problem', 'forgot', 'missing', 'failed', 'unclean', 'smell',
      'loud', 'uncomfortable', 'outdated', 'stained', 'crowded', 'old',
      'delay', 'confusion', 'charged', 'WiFi', 'wifi', 'parking', 'staff',
      'service', 'billing', 'unhelpful', 'late', 'broken', 'mistake'
    ];
    
    negativeWordsList.forEach(word => {
      if (text.includes(word)) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
  });

  // Return top negative keywords
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .map(item => item[0]);
};

// Helper functions for charts and report generation

// Add cover page
const addCoverPage = (doc, startDate, endDate, customLogo = null) => {
  // Background rectangle with light green
  doc.setFillColor(240, 253, 244); // Light green background
  doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
  
  // Logo - either custom or default
  if (customLogo) {
    try {
      // Add custom logo if provided
      doc.addImage(customLogo, 'PNG', 85, 50, 40, 40);
    } catch (error) {
      console.error('Error adding custom logo, using default:', error);
      // Fallback to default logo
      doc.setFillColor(34, 197, 94); // Green
      doc.circle(105, 70, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('FF', 105, 75, { align: 'center' });
    }
  } else {
    // Default logo
    doc.setFillColor(34, 197, 94); // Green
    doc.circle(105, 70, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FF', 105, 75, { align: 'center' });
  }
  
  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(34, 197, 94);
  doc.text('FEEDBACK ANALYSIS REPORT', 105, 130, { align: 'center' });
  
  // Subtitle with date range
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  const startDateFormatted = new Date(startDate).toLocaleDateString();
  const endDateFormatted = new Date(endDate).toLocaleDateString();
  doc.text(`${startDateFormatted} to ${endDateFormatted}`, 105, 145, { align: 'center' });
  
  // Add decorative element
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(2);
  doc.line(65, 160, 145, 160);
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('FeedbackFusion', 105, 270, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 277, { align: 'center' });
};

// Add simple title page
const addSimpleTitle = (doc, startDate, endDate, filters) => {
  // Add title
  doc.setFontSize(18);
  doc.setTextColor(22, 197, 94); // Green color
  doc.text('Feedback Analysis Report', 105, 20, { align: 'center' });
  
  // Add date range
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Date Range: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`, 105, 30, { align: 'center' });
  
  // Add filters
  doc.setFontSize(10);
  let filtersText = 'Filters: ';
  if (filters.department !== 'All') filtersText += `Department: ${filters.department}, `;
  if (filters.emotion !== 'All') filtersText += `Emotion: ${filters.emotion}, `;
  if (filters.keyword) filtersText += `Keyword: ${filters.keyword}`;
  if (filtersText === 'Filters: ') filtersText += 'None';
  
  doc.text(filtersText, 105, 38, { align: 'center' });
};

// Add executive summary
const addExecutiveSummary = (doc, data) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(34, 197, 94);
  doc.text('Executive Summary', 14, 20);
  
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(0.5);
  doc.line(14, 23, 60, 23);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  
  // Get trend direction
  const trendDirection = determineTrendDirection(data.sentimentData);
  const topEmotion = data.emotionData[0]?.name || 'Neutral';
  const topEmotionPercentage = data.emotionData[0]?.value || 0;
  
  // Sort departments by score
  const sortedDepts = [...data.departmentData].sort((a, b) => b.score - a.score);
  const topDepartment = sortedDepts[0]?.name || 'None';
  const topDepartmentScore = sortedDepts[0]?.score?.toFixed(1) || 0;
  const bottomDepartment = sortedDepts[sortedDepts.length - 1]?.name || 'None';
  const bottomDepartmentScore = sortedDepts[sortedDepts.length - 1]?.score?.toFixed(1) || 0;
  
  // Create summary text
  const summaryText = `Analysis of ${data.stats.totalReviews} reviews shows a ${trendDirection} trend in customer satisfaction over the selected period. The overall sentiment score is ${data.stats.sentimentScore}%, with an average rating of ${data.stats.avgRating} out of 5.0.

The dominant emotion expressed in reviews is "${topEmotion}" at ${topEmotionPercentage}%. ${topDepartment} received the highest satisfaction with an average score of ${topDepartmentScore}, while ${bottomDepartment} scored lowest at ${bottomDepartmentScore}, indicating an area for improvement.

${getBestDay(data.sentimentData)} showed the highest positive sentiment, suggesting optimal customer experiences on this day. ${getWorstDay(data.sentimentData)} had the most negative feedback, warranting further investigation into staffing or operational factors.`;

  doc.text(summaryText, 14, 35, { maxWidth: 180 });
  
  // Add summary statistics box
  doc.setFillColor(248, 250, 252); // Light background
  doc.roundedRect(14, 80, 180, 30, 3, 3, 'F');
  
  // Add statistics
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(34, 197, 94);
  doc.text('Key Metrics', 20, 90);
  
  // Create statistics row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  
  // Stats in columns
  doc.text(`Total Reviews: ${data.stats.totalReviews}`, 25, 100);
  doc.text(`Average Rating: ${data.stats.avgRating}`, 80, 100);
  doc.text(`Sentiment Score: ${data.stats.sentimentScore}%`, 140, 100);
};

// Add key insights box
const addKeyInsightsBox = (doc, data, negativeKeywords) => {
  // Box with key insights
  doc.setFillColor(240, 253, 244); // Light green background
  doc.setDrawColor(34, 197, 94); // Green border
  doc.setLineWidth(1);
  doc.roundedRect(14, 120, 180, 50, 3, 3, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(34, 197, 94);
  doc.text('KEY INSIGHTS', 20, 130);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  
  // Top negative keywords
  doc.text(`• Top concerns: ${negativeKeywords.slice(0,3).join(', ')}`, 20, 140);
  
  // Add best day/worst day insight
  const bestDay = getBestDay(data.sentimentData);
  const worstDay = getWorstDay(data.sentimentData);
  doc.text(`• Best day: ${bestDay}, Worst day: ${worstDay}`, 20, 150);
  
  // Sort departments by score
  const sortedDepts = [...data.departmentData].sort((a, b) => a.score - b.score);
  const bottomDepartment = sortedDepts[0]?.name || 'None';
  
  // Add recommendation
  doc.text(`• Recommendation: Focus on improving ${bottomDepartment} service by addressing "${negativeKeywords[0]}" issues`, 20, 160);
};

// Add enhanced charts
const addEnhancedCharts = async (doc, data) => {
  // Implementation omitted for brevity
  // This function would add enhanced charts to the PDF document
};

// Add basic charts
const addBasicCharts = async (doc, data) => {
  // Implementation omitted for brevity
  // This function would add basic charts to the PDF document
};

// Add enhanced reviews table
const addEnhancedReviewsTable = (doc, reviews) => {
  // Implementation omitted for brevity
  // This function would add a detailed table of reviews to the PDF
};

// Add basic reviews table
const addBasicReviewsTable = (doc, reviews) => {
  // Implementation omitted for brevity
  // This function would add a simple table of reviews to the PDF
};

// Add page footer
const addPageFooter = (doc, pageNumber, totalPages) => {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated on ${new Date().toLocaleDateString()} | Page ${pageNumber} of ${totalPages}`, 105, 290, { align: 'center' });
};

// Helper functions for trend analysis

// Get best and worst days from sentiment data
const getBestDay = (sentimentData) => {
  if (!sentimentData || sentimentData.length === 0) return 'Unknown';

  let bestDay = sentimentData[0];
  sentimentData.forEach(day => {
    if (day.positive > bestDay.positive) {
      bestDay = day;
    }
  });

  return expandDayName(bestDay.day);
};

const getWorstDay = (sentimentData) => {
  if (!sentimentData || sentimentData.length === 0) return 'Unknown';

  let worstDay = sentimentData[0];
  sentimentData.forEach(day => {
    if (day.negative > worstDay.negative) {
      worstDay = day;
    }
  });

  return expandDayName(worstDay.day);
};

// Expand day name
const expandDayName = (shortDay) => {
  const dayMap = {
    'S': 'Sunday',
    'M': 'Monday',
    'T': 'Tuesday',
    'W': 'Wednesday',
    'Th': 'Thursday',
    'F': 'Friday',
    'Sa': 'Saturday',
    'Sun': 'Sunday',
    'Mon': 'Monday',
    'Tue': 'Tuesday',
    'Wed': 'Wednesday',
    'Thu': 'Thursday',
    'Fri': 'Friday',
    'Sat': 'Saturday'
  };

  return dayMap[shortDay] || shortDay;
};

// Determine trend direction
const determineTrendDirection = (sentimentData) => {
  if (!sentimentData || sentimentData.length <= 1) return 'stable';

  // Calculate a simplified linear regression to determine trend
  let trend = 0;
  const half = Math.floor(sentimentData.length / 2);

  const firstHalf = sentimentData.slice(0, half);
  const secondHalf = sentimentData.slice(half);

  const firstHalfAvg = firstHalf.reduce((sum, day) => sum + day.positive, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, day) => sum + day.positive, 0) / secondHalf.length;

  const diff = secondHalfAvg - firstHalfAvg;

  if (diff > 5) return 'improving';
  if (diff < -5) return 'declining';
  return 'stable';
};

// Get emotion description
const getEmotionDescription = (emotion) => {
  const descriptions = {
    'joy': 'positive and delighted',
    'neutral': 'generally satisfied',
    'sadness': 'disappointed',
    'disgust': 'dissatisfied',
    'anger': 'frustrated',
    'surprise': 'surprised',
    'fear': 'concerned'
  };

  return descriptions[emotion.toLowerCase()] || 'mixed emotions';
};

// Utility functions for data processing 

// Process sentiment data for charts
const processSentimentData = (reviews) => {
  // Days of the week
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dayGroups = {};

  // Initialize days
  daysOfWeek.forEach(day => {
    dayGroups[day] = { positive: 0, negative: 0, total: 0 };
  });

  // Group by day of week
  reviews.forEach(review => {
    if (!review.date) return;
    
    const date = new Date(review.date);
    const day = daysOfWeek[date.getDay()];
    
    dayGroups[day].total++;
    
    if (review.sentiment_label === 'positive' || review.sentiment_label === 'very positive') {
      dayGroups[day].positive++;
    } else if (review.sentiment_label === 'negative' || review.sentiment_label === 'very negative') {
      dayGroups[day].negative++;
    }
  });

  // Calculate percentages
  return daysOfWeek.map(day => {
    const total = dayGroups[day].total || 1; // Avoid division by zero
    const positive = Math.round((dayGroups[day].positive / total) * 100);
    return {
      day,
      positive,
      negative: 100 - positive // Simplify to positive/negative only
    };
  });
};

// Process emotion data for charts
const processEmotionData = (reviews) => {
  // Count emotions
  const emotions = {};
  let totalWithEmotion = 0;

  reviews.forEach(review => {
    if (!review.emotion_label) return;
    
    const emotion = review.emotion_label.toLowerCase();
    emotions[emotion] = (emotions[emotion] || 0) + 1;
    totalWithEmotion++;
  });

  // Convert to percentages
  return Object.keys(emotions).map(name => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize emotion
    value: Math.round((emotions[name] / (totalWithEmotion || 1)) * 100)
  })).sort((a, b) => b.value - a.value).slice(0, 5); // Get top 5
};

// Process department data for charts
const processDepartmentData = (reviews) => {
  // Group by department
  const departments = {};

  reviews.forEach(review => {
    if (!review.department) return;
    
    const dept = review.department;
    
    if (!departments[dept]) {
      departments[dept] = { total: 0, count: 0 };
    }
    
    departments[dept].total += review.rating || 0;
    departments[dept].count++;
  });

  // Calculate averages
  return Object.keys(departments).map(name => ({
    name,
    score: departments[name].count > 0 ? 
      parseFloat((departments[name].total / departments[name].count).toFixed(1)) : 0
  }));
};

// Process rating data for charts
const processRatingData = (reviews) => {
  // Count ratings
  const ratings = {
    '1★': 0,
    '2★': 0,
    '3★': 0,
    '4★': 0,
    '5★': 0
  };

  reviews.forEach(review => {
    if (!review.rating) return;
    
    const rating = Math.round(review.rating);
    if (rating >= 1 && rating <= 5) {
      ratings[`${rating}★`]++;
    }
  });

  // Convert to percentages
  return Object.keys(ratings).map(name => ({
    name,
    value: reviews.length > 0 ? Math.round((ratings[name] / reviews.length) * 100) : 0
  })).sort((a, b) => {
    // Sort by rating number (5★ to 1★)
    return parseInt(b.name) - parseInt(a.name);
  });
};

// Calculate stats from reviews
const calculateStats = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return { totalReviews: 0, avgRating: 0, sentimentScore: 0 };
  }

  // Calculate average rating
  let totalRating = 0;
  let ratingCount = 0;

  reviews.forEach(review => {
    if (review.rating) {
      totalRating += review.rating;
      ratingCount++;
    }
  });

  const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0;

  // Calculate sentiment score
  const positiveSentiment = reviews.filter(r => 
    r.sentiment_label === 'positive' || r.sentiment_label === 'very positive'
  ).length;

  const sentimentScore = reviews.length > 0 ? 
    Math.round((positiveSentiment / reviews.length) * 100) : 0;

  return {
    totalReviews: reviews.length,
    avgRating,
    sentimentScore
  };
};

export default {
  generateReport,
  generateMonthlyReport,
  generateDepartmentReport,
  getReportHistory
};