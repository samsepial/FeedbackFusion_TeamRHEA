import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import api from './api';

export const generateReport = async (params, data) => {
  try {
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

export const generateMonthlyReport = async (customLogo = null) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);
  
  try {
    const response = await api.get('/feedback', {
      params: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    });
    const reviews = response.data;
    
    const sentimentData = processSentimentData(reviews);
    const emotionData = processEmotionData(reviews);
    const departmentData = processDepartmentData(reviews);
    const ratingData = processRatingData(reviews);
    const stats = calculateStats(reviews);
    const negativeKeywords = extractNegativeKeywords(reviews);

    let logoImage = null;
    try {

    const logoUrl = '/FF.png';
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
        historicalCharts: [] 
    );
    
    return true;
  } catch (error) {
    console.error('Error generating monthly report:', error);
    alert('Failed to generate monthly report. Please try again.');
    return false;
  }
};

export const generateDepartmentReport = async (customLogo = null) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 90);
  
  try {
    const response = await api.get('/feedback', {
      params: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    });
    const reviews = response.data;

    const sentimentData = processSentimentData(reviews);
    const emotionData = processEmotionData(reviews);
    const departmentData = processDepartmentData(reviews);
    const ratingData = processRatingData(reviews);
    const stats = calculateStats(reviews);
    const negativeKeywords = extractNegativeKeywords(reviews);

    let logoImage = null;
    try {
      const logoUrl = '/FF.png'; 
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

    if (!logoImage) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

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
        historicalCharts: [] 
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error generating department report:', error);
    alert('Failed to generate department report. Please try again.');
    return false;
  }
};

const saveReportHistory = (reportInfo) => {
  try {
    const existingReportsJSON = localStorage.getItem('generatedReports');
    let existingReports = existingReportsJSON ? JSON.parse(existingReportsJSON) : [];

    existingReports.unshift({
      id: Date.now().toString(),
      ...reportInfo
    });

    if (existingReports.length > 10) {
      existingReports = existingReports.slice(0, 10);
    }

    localStorage.setItem('generatedReports', JSON.stringify(existingReports));
  } catch (error) {
    console.error('Error saving report history:', error);
  }
};

export const getReportHistory = () => {
  try {
    const reportsJSON = localStorage.getItem('generatedReports');
    return reportsJSON ? JSON.parse(reportsJSON) : [];
  } catch (error) {
    console.error('Error getting report history:', error);
    return [];
  }
};

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
      includeHistoricalCharts = false,
      customLogo = null, 
      filters
    } = params;
    
    const {
      sentimentData,
      emotionData,
      departmentData,
      ratingData,
      historicalCharts = [],
      reviews,
      stats,
      negativeKeywords = extractNegativeKeywords(reviews)
    } = data;
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
 
    if (enhancedVisualDesign) {
      addCoverPage(doc, startDate, endDate, customLogo);
    } else {
      addSimpleTitle(doc, startDate, endDate, filters);
    }

    if (enhancedVisualDesign) {
      doc.addPage();
      addExecutiveSummary(doc, data);
      
      if (includeNegativeKeywords) {
        addKeyInsightsBox(doc, data, negativeKeywords);
      }
    }

    if (includeGraphs) {
      if (enhancedVisualDesign) {
        await addEnhancedCharts(doc, data);
      } else {
        await addBasicCharts(doc, data);
      }

      if (includeHistoricalCharts && historicalCharts && historicalCharts.length > 0) {
        doc.addPage();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(34, 197, 94);
        doc.text('Historical Analysis', 105, 20, { align: 'center' });
        
        let yPosition = 40;
        for (let i = 0; i < historicalCharts.length; i++) {
          if (yPosition > 200) {
            doc.addPage();
            yPosition = 40;
          }
          
          try {
            doc.addImage(historicalCharts[i].dataURL, 'PNG', 20, yPosition, 170, 80);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(60, 60, 60);
            doc.text(historicalCharts[i].title || `Historical Chart ${i+1}`, 105, yPosition - 10, { align: 'center' });
            
            yPosition += 100; 
          } catch (error) {
            console.error(`Error adding historical chart ${i}:`, error);
          }
        }
      }
    }

    if (includeReviews) {
      if (enhancedVisualDesign && includeBothSentimentEmotion) {
        addEnhancedReviewsTable(doc, reviews);
      } else {
        addBasicReviewsTable(doc, reviews);
      }
    }

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addPageFooter(doc, i, totalPages);
    }

    doc.save(`Feedback_Report_${new Date().toISOString().split('T')[0]}.pdf`);

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

const addCoverPage = (doc, startDate, endDate, customLogo = null) => {
  doc.setFillColor(240, 253, 244);
  doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
  
  if (customLogo) {
    try {
      doc.addImage(customLogo, 'PNG', 85, 50, 40, 40);
    } catch (error) {
      console.error('Error adding custom logo, using default:', error);
      doc.setFillColor(34, 197, 94); 
      doc.circle(105, 70, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('FF', 105, 75, { align: 'center' });
    }
  } else {
    doc.setFillColor(34, 197, 94); 
    doc.circle(105, 70, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FF', 105, 75, { align: 'center' });
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(34, 197, 94);
  doc.text('FEEDBACK ANALYSIS REPORT', 105, 130, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  const startDateFormatted = new Date(startDate).toLocaleDateString();
  const endDateFormatted = new Date(endDate).toLocaleDateString();
  doc.text(`${startDateFormatted} to ${endDateFormatted}`, 105, 145, { align: 'center' });

  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(2);
  doc.line(65, 160, 145, 160);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('FeedbackFusion', 105, 270, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 277, { align: 'center' });
};

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

  const trendDirection = determineTrendDirection(data.sentimentData);
  const topEmotion = data.emotionData[0]?.name || 'Neutral';
  const topEmotionPercentage = data.emotionData[0]?.value || 0;

  const sortedDepts = [...data.departmentData].sort((a, b) => b.score - a.score);
  const topDepartment = sortedDepts[0]?.name || 'None';
  const topDepartmentScore = sortedDepts[0]?.score?.toFixed(1) || 0;
  const bottomDepartment = sortedDepts[sortedDepts.length - 1]?.name || 'None';
  const bottomDepartmentScore = sortedDepts[sortedDepts.length - 1]?.score?.toFixed(1) || 0;

  const summaryText = `Analysis of ${data.stats.totalReviews} reviews shows a ${trendDirection} trend in customer satisfaction over the selected period. The overall sentiment score is ${data.stats.sentimentScore}%, with an average rating of ${data.stats.avgRating} out of 5.0.

The dominant emotion expressed in reviews is "${topEmotion}" at ${topEmotionPercentage}%. ${topDepartment} received the highest satisfaction with an average score of ${topDepartmentScore}, while ${bottomDepartment} scored lowest at ${bottomDepartmentScore}, indicating an area for improvement.

${getBestDay(data.sentimentData)} showed the highest positive sentiment, suggesting optimal customer experiences on this day. ${getWorstDay(data.sentimentData)} had the most negative feedback, warranting further investigation into staffing or operational factors.`;

  doc.text(summaryText, 14, 35, { maxWidth: 180 });

  doc.setFillColor(248, 250, 252); 
  doc.roundedRect(14, 80, 180, 30, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(34, 197, 94);
  doc.text('Key Metrics', 20, 90);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);

  doc.text(`Total Reviews: ${data.stats.totalReviews}`, 25, 100);
  doc.text(`Average Rating: ${data.stats.avgRating}`, 80, 100);
  doc.text(`Sentiment Score: ${data.stats.sentimentScore}%`, 140, 100);
};

const addKeyInsightsBox = (doc, data, negativeKeywords) => {
  doc.setFillColor(240, 253, 244); 
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(1);
  doc.roundedRect(14, 120, 180, 50, 3, 3, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(34, 197, 94);
  doc.text('KEY INSIGHTS', 20, 130);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  
  doc.text(`• Top concerns: ${negativeKeywords.slice(0,3).join(', ')}`, 20, 140);
  
  const bestDay = getBestDay(data.sentimentData);
  const worstDay = getWorstDay(data.sentimentData);
  doc.text(`• Best day: ${bestDay}, Worst day: ${worstDay}`, 20, 150);

  const sortedDepts = [...data.departmentData].sort((a, b) => a.score - b.score);
  const bottomDepartment = sortedDepts[0]?.name || 'None';

  doc.text(`• Recommendation: Focus on improving ${bottomDepartment} service by addressing "${negativeKeywords[0]}" issues`, 20, 160);
};

const addEnhancedCharts = async (doc, data) => {
  doc.addPage();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(34, 197, 94);
  doc.text('Feedback Analytics', 105, 20, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text('Sentiment Trend', 14, 35);
  
  try {
    const sentimentChartURL = await createSentimentChart(data.sentimentData, true);
    doc.addImage(sentimentChartURL, 'PNG', 14, 40, 80, 60);

    addChartInsight(doc, 104, 40, "Sentiment Insight", 
      `${getBestDay(data.sentimentData)} shows the highest positive sentiment (${getBestPositivePercentage(data.sentimentData)}%). ${getWorstDay(data.sentimentData)} has the most negative feedback (${getWorstNegativePercentage(data.sentimentData)}%).`);
  } catch (error) {
    console.error('Error creating sentiment chart:', error);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text('Emotion Distribution', 14, 115);
  
  try {
    const emotionChartURL = await createEmotionPieChart(data.emotionData);
    doc.addImage(emotionChartURL, 'PNG', 14, 120, 80, 60);
    
    const topEmotion = data.emotionData[0]?.name || 'Unknown';
    const topEmotionValue = data.emotionData[0]?.value || 0;
    
    addChartInsight(doc, 104, 120, "Emotion Insight", 
      `"${topEmotion}" is the dominant emotion at ${topEmotionValue}%. This suggests most guests feel ${getEmotionDescription(topEmotion)} during their stay.`);
  } catch (error) {
    console.error('Error creating emotion chart:', error);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text('Department Performance', 14, 195);
  
  try {
    const deptChartURL = await createDepartmentBarChart(data.departmentData);
    doc.addImage(deptChartURL, 'PNG', 14, 200, 180, 70);
  } catch (error) {
    console.error('Error creating department chart:', error);
  }
};

const addChartInsight = (doc, x, y, title, text) => {
  doc.setFillColor(248, 250, 252); 
  doc.setDrawColor(226, 232, 240); 
  doc.roundedRect(x, y, 90, 40, 2, 2, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(34, 197, 94);
  doc.text(title, x+5, y+10);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(text, x+5, y+18, { maxWidth: 80 });
};

const addEnhancedReviewsTable = (doc, reviews) => {
  doc.addPage();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(34, 197, 94);
  doc.text('Customer Reviews', 105, 20, { align: 'center' });

  const reviewsByDept = {};
  reviews.forEach(review => {
    const dept = review.department || 'General';
    if (!reviewsByDept[dept]) reviewsByDept[dept] = [];
    reviewsByDept[dept].push(review);
  });
  
  let yPos = 35;

  for (const [dept, deptReviews] of Object.entries(reviewsByDept)) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFillColor(240, 249, 255); 
    doc.rect(14, yPos - 5, 180, 10, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204); 
    doc.text(dept, 20, yPos);
    yPos += 10;
   
    for (let i = 0; i < Math.min(deptReviews.length, 10); i++) {
      const review = deptReviews[i];

      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.1);
      doc.line(14, yPos, 194, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.text(`${review.rating?.toFixed(1) || 'N/A'}★`, 18, yPos);

      const sentimentColor = getSentimentColorRgb(review.sentiment_label);
      doc.setFillColor(...sentimentColor);
      doc.roundedRect(40, yPos - 5, 40, 7, 2, 2, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(review.sentiment_label || 'unknown', 42, yPos - 1);

      const emotionColor = getEmotionColorRgb(review.emotion_label);
      doc.setFillColor(...emotionColor);
      doc.roundedRect(85, yPos - 5, 40, 7, 2, 2, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      const date = review.date ? new Date(review.date).toLocaleDateString() : 'Unknown date';
      doc.text(date, 170, yPos);
      
      yPos += 10;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      
      const reviewText = review.feedback_text || 'No feedback provided';
      const truncatedText = reviewText.length > 300 ? 
                           reviewText.substring(0, 300) + '...' : 
                           reviewText;

      const textLines = doc.splitTextToSize(truncatedText, 170);
      
      const textHeight = textLines.length * 5;
      if (yPos + textHeight > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.text(textLines, 18, yPos);
      
      yPos += textHeight + 10; 
    }

    if (deptReviews.length > 10) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text(`(${deptReviews.length - 10} more reviews not shown)`, 20, yPos);
      yPos += 10;
    }
    
    yPos += 5; 
  }
};

const addPageFooter = (doc, pageNumber, totalPages) => {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated on ${new Date().toLocaleDateString()} | Page ${pageNumber} of ${totalPages}`, 105, 290, { align: 'center' });
};

const addBasicCharts = async (doc, data) => {
  let yPosition = 40;

  doc.setFontSize(18);
  doc.setTextColor(22, 197, 94); 
  doc.text('Feedback Analysis Charts', 105, 20, { align: 'center' });

  if (data.emotionData && data.emotionData.length > 0) {
    doc.setFontSize(14);
    doc.text('Emotion Distribution', 105, yPosition, { align: 'center' });
    yPosition += 10;
    
    try {
      const emotionChartURL = await createEmotionPieChart(data.emotionData);
      doc.addImage(emotionChartURL, 'PNG', 55, yPosition, 100, 70);
      yPosition += 80;
    } catch (chartError) {
      console.error('Error creating emotion chart:', chartError);
      yPosition += 10;
    }
  }
  
  if (data.departmentData && data.departmentData.length > 0) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Department Scores', 105, yPosition, { align: 'center' });
    yPosition += 10;
    
    try {
      const deptChartURL = await createDepartmentBarChart(data.departmentData);
      doc.addImage(deptChartURL, 'PNG', 55, yPosition, 100, 70);
      yPosition += 80;
    } catch (chartError) {
      console.error('Error creating department chart:', chartError);
      yPosition += 10;
    }
  }
  
  if (data.sentimentData && data.sentimentData.length > 0) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Sentiment Trend', 105, yPosition, { align: 'center' });
    yPosition += 10;
    
    try {
      const sentimentChartURL = await createSentimentChart(data.sentimentData);
      doc.addImage(sentimentChartURL, 'PNG', 55, yPosition, 100, 70);
      yPosition += 80;
    } catch (chartError) {
      console.error('Error creating sentiment chart:', chartError);
      yPosition += 10;
    }
  }
};


const addSimpleTitle = (doc, startDate, endDate, filters) => {
  doc.setFontSize(18);
  doc.setTextColor(22, 197, 94); 
  doc.text('Feedback Analysis Report', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Date Range: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`, 105, 30, { align: 'center' });

  doc.setFontSize(10);
  let filtersText = 'Filters: ';
  if (filters.department !== 'All') filtersText += `Department: ${filters.department}, `;
  if (filters.emotion !== 'All') filtersText += `Emotion: ${filters.emotion}, `;
  if (filters.keyword) filtersText += `Keyword: ${filters.keyword}`;
  if (filtersText === 'Filters: ') filtersText += 'None';
  
  doc.text(filtersText, 105, 38, { align: 'center' });
};

const addBasicReviewsTable = (doc, reviews) => {
  doc.addPage();
  doc.setFontSize(14);
  doc.text('Reviews', 105, 15, { align: 'center' });
  
  try {

    const tableHeaders = [['Rating', 'Date', 'Department', 'Sentiment', 'Review Text']];
    const tableData = [];
    

    for (let i = 0; i < Math.min(reviews.length, 50); i++) {
      const review = reviews[i];
      let reviewText = '';
      
      if (review.feedback_text) {
        reviewText = review.feedback_text.length > 40 
          ? review.feedback_text.substring(0, 40) + '...'
          : review.feedback_text;
      }
      
      tableData.push([
        review.rating ? review.rating.toFixed(1) : 'N/A',
        review.date ? new Date(review.date).toLocaleDateString() : 'N/A',
        (review.department || 'N/A').substring(0, 15), 
        (review.sentiment_label || 'N/A').substring(0, 15), 
        reviewText
      ]);
    }

    doc.autoTable({
      startY: 25,
      head: tableHeaders,
      body: tableData,
      theme: 'grid',
      styles: { 
        fontSize: 8, 
        cellPadding: 2,
        overflow: 'linebreak',
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 75 }
      },
      headStyles: {
        fillColor: [22, 197, 94],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      margin: { top: 25, left: 14, right: 14 }
    });
  } catch (tableError) {
    console.error('Table generation error:', tableError);
      let reviewY = 30;
    for (let i = 0; i < Math.min(reviews.length, 20); i++) {
      const review = reviews[i];
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(`Rating: ${review.rating?.toFixed(1) || 'N/A'} | ${review.department || 'N/A'} | ${review.sentiment_label || 'N/A'}`, 14, reviewY);
      reviewY += 5;
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const reviewText = review.feedback_text?.substring(0, 100) + (review.feedback_text?.length > 100 ? '...' : '') || 'N/A';
      doc.text(reviewText, 14, reviewY, { maxWidth: 180 });
      reviewY += 10;
      
      if (reviewY > 280) {
        doc.addPage();
        reviewY = 20;
      }
    }
  }
};


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
    

    const workbook = XLSX.utils.book_new();
    

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

    if (includeNegativeKeywords && negativeKeywords.length > 0) {
      summaryData.push(['Top Negative Keywords']);
      negativeKeywords.slice(0, 10).forEach((keyword, index) => {
        summaryData.push([`${index + 1}. ${keyword}`]);
      });
      summaryData.push([]);
    }

    if (includeGraphs) {

      if (sentimentData && sentimentData.length > 0) {
        summaryData.push(['Sentiment Trend']);
        summaryData.push(['Day', 'Positive (%)', 'Negative (%)']);
        sentimentData.forEach(item => {
          summaryData.push([item.day, item.positive, item.negative]);
        });
        summaryData.push([]);
      }

      if (emotionData && emotionData.length > 0) {
        summaryData.push(['Emotion Distribution']);
        summaryData.push(['Emotion', 'Percentage (%)']);
        emotionData.forEach(item => {
          summaryData.push([item.name, item.value]);
        });
        summaryData.push([]);
      }

      if (departmentData && departmentData.length > 0) {
        summaryData.push(['Department Scores']);
        summaryData.push(['Department', 'Score']);
        departmentData.forEach(item => {
          summaryData.push([item.name, item.score]);
        });
      }
    }

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    if (includeReviews && reviews && reviews.length > 0) {
      const reviewsData = [
        ['ID', 'Rating', 'Date', 'Department', 'Sentiment', 'Emotion', 'Review Text']
      ];

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

      const reviewsSheet = XLSX.utils.aoa_to_sheet(reviewsData);
      XLSX.utils.book_append_sheet(workbook, reviewsSheet, 'Reviews');
    }
    
    XLSX.writeFile(workbook, `Feedback_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
 
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
      'delay', 'confusion', 'charged', 'WiFi', 'wifi', 'parking', 'staff',
      'service', 'billing', 'unhelpful', 'late', 'broken', 'mistake'
    ];
    
    negativeWordsList.forEach(word => {
      if (text.includes(word)) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
  });

  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .map(item => item[0]);
};

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

const getBestPositivePercentage = (sentimentData) => {
  if (!sentimentData || sentimentData.length === 0) return '0';

  let bestDay = sentimentData[0];
  sentimentData.forEach(day => {
    if (day.positive > bestDay.positive) {
      bestDay = day;
    }
  });

  return bestDay.positive;
};

const getWorstNegativePercentage = (sentimentData) => {
  if (!sentimentData || sentimentData.length === 0) return '0';

  let worstDay = sentimentData[0];
  sentimentData.forEach(day => {
    if (day.negative > worstDay.negative) {
      worstDay = day;
    }
  });

  return worstDay.negative;
};

const determineTrendDirection = (sentimentData) => {
  if (!sentimentData || sentimentData.length <= 1) return 'stable';

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

const getSentimentColorRgb = (sentiment) => {
  if (!sentiment) return [150, 150, 150]; 

  sentiment = sentiment.toLowerCase();
  if (sentiment === 'positive' || sentiment === 'very positive') {
    return [34, 197, 94]; 
  } else if (sentiment === 'negative' || sentiment === 'very negative') {
    return [239, 68, 68]; 
  } else {
    return [59, 130, 246]; 
  }
};

const getEmotionColorRgb = (emotion) => {
  if (!emotion) return [150, 150, 150]; 

  emotion = emotion.toLowerCase();
  switch (emotion) {
    case 'joy':
      return [34, 197, 94]; 
    case 'neutral':
      return [148, 163, 184]; 
    case 'sadness':
      return [59, 130, 246]; 
    case 'disgust':
      return [245, 158, 11]; 
    case 'anger':
      return [239, 68, 68]; 
    case 'surprise':
      return [139, 92, 246]; 
    case 'fear':
      return [79, 70, 229]; 
    default:
      return [150, 150, 150]; 
};

const createSentimentChart = async (sentimentData, showAnnotations = false) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const chartArea = {
      left: 50,
      top: 30,
      right: 350,
      bottom: 250,
      width: 300,
      height: 220
    };
  
    ctx.beginPath();
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;

    ctx.moveTo(chartArea.left, chartArea.top);
    ctx.lineTo(chartArea.left, chartArea.bottom);

    ctx.moveTo(chartArea.left, chartArea.bottom);
    ctx.lineTo(chartArea.right, chartArea.bottom);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.setLineDash([5, 5]);

    for (let i = 1; i <= 4; i++) {
      const y = chartArea.bottom - (i * chartArea.height / 4);
      ctx.moveTo(chartArea.left, y);
      ctx.lineTo(chartArea.right, y);

      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`${i * 25}%`, chartArea.left - 10, y + 4);
    }
    ctx.stroke();
    ctx.setLineDash([]);
 
    if (sentimentData && sentimentData.length > 0) {
      const barWidth = (chartArea.width - 20) / sentimentData.length;
      const spacing = 5;
      
      for (let i = 0; i < sentimentData.length; i++) {
        const day = sentimentData[i];
        const x = chartArea.left + 10 + (i * barWidth);

        const positiveHeight = day.positive * chartArea.height / 100;
        ctx.fillStyle = '#22c55e'; 
        ctx.fillRect(x, chartArea.bottom - positiveHeight, barWidth - spacing, positiveHeight);

        const negativeHeight = day.negative * chartArea.height / 100;
        ctx.fillStyle = '#ef4444'; 
        ctx.fillRect(x, chartArea.bottom - positiveHeight - negativeHeight, barWidth - spacing, negativeHeight);
        
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(day.day, x + (barWidth - spacing) / 2, chartArea.bottom + 20);
   
        if (positiveHeight > 30) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`${day.positive}%`, x + (barWidth - spacing) / 2, chartArea.bottom - positiveHeight/2);
        }
        
        if (negativeHeight > 30) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`${day.negative}%`, x + (barWidth - spacing) / 2, chartArea.bottom - positiveHeight - negativeHeight/2);
        }
      }
  
      if (showAnnotations) {
        let bestDay = sentimentData[0];
        let worstDay = sentimentData[0];
        sentimentData.forEach(day => {
          if (day.positive > bestDay.positive) bestDay = day;
          if (day.negative > worstDay.negative) worstDay = day;
        });

        const bestDayIndex = sentimentData.indexOf(bestDay);
        const bestX = chartArea.left + 10 + (bestDayIndex * barWidth) + (barWidth - spacing) / 2;
        const bestY = chartArea.bottom - bestDay.positive * chartArea.height / 100;
        
        ctx.beginPath();
        ctx.arc(bestX, bestY, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
        ctx.fill();
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.stroke();
  
        const worstDayIndex = sentimentData.indexOf(worstDay);
        const worstX = chartArea.left + 10 + (worstDayIndex * barWidth) + (barWidth - spacing) / 2;
        const worstY = chartArea.bottom - worstDay.positive * chartArea.height / 100 - worstDay.negative * chartArea.height / 100;
        
        ctx.beginPath();
        ctx.arc(worstX, worstY, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    ctx.fillStyle = '#22c55e';
    ctx.fillRect(chartArea.left, chartArea.bottom + 35, 15, 15);
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Positive', chartArea.left + 20, chartArea.bottom + 45);
    
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(chartArea.left + 100, chartArea.bottom + 35, 15, 15);
    ctx.fillStyle = '#6b7280';
    ctx.fillText('Negative', chartArea.left + 120, chartArea.bottom + 45);

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Sentiment Trend by Day of Week', chartArea.left + chartArea.width/2, 15);

    const dataURL = canvas.toDataURL('image/png');

    document.body.removeChild(canvas);
    
    resolve(dataURL);
  });
};

const createEmotionPieChart = async (emotionData) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
      ctx.fillStyle = '#111827';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Emotion Distribution', canvas.width/2, 20);
    

    const centerX = canvas.width/2;
    const centerY = canvas.height/2;
    const radius = Math.min(centerX, centerY) - 60;
    
    const total = emotionData.reduce((sum, item) => sum + item.value, 0);
    
    let startAngle = 0;
    const colors = ['#4ade80', '#94a3b8', '#60a5fa', '#f59e0b', '#ef4444'];

    for (let i = 0; i < emotionData.length; i++) {
      const item = emotionData[i];
      const sliceAngle = (item.value / total) * Math.PI * 2;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();

      if (item.value / total > 0.05) {
        const labelAngle = startAngle + sliceAngle / 2;
        const labelRadius = radius * 0.7;
        const labelX = centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = centerY + Math.sin(labelAngle) * labelRadius;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${item.value}%`, labelX, labelY);
      }
      
      startAngle += sliceAngle;
    }

    let legendY = centerY - radius;
    for (let i = 0; i < emotionData.length; i++) {
      const item = emotionData[i];
      
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(centerX + radius + 20, legendY, 15, 15);
      
      ctx.fillStyle = '#111827';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${item.name}: ${item.value}%`, centerX + radius + 40, legendY + 12);
      
      legendY += 20;
    }

    const dataURL = canvas.toDataURL('image/png');

    document.body.removeChild(canvas);
    
    resolve(dataURL);
  });
};

const createDepartmentBarChart = async (departmentData) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 320;
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Department Performance Scores', canvas.width/2, 20);

    const chartArea = {
      left: 120,
      top: 40,
      right: 450,
      bottom: 280,
      width: 330,
      height: 240
    };

    ctx.beginPath();
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;

    ctx.moveTo(chartArea.left, chartArea.top);
    ctx.lineTo(chartArea.left, chartArea.bottom);

    ctx.moveTo(chartArea.left, chartArea.bottom);
    ctx.lineTo(chartArea.right, chartArea.bottom);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.setLineDash([5, 5]);

    for (let i = 0; i <= 5; i++) {
      const x = chartArea.left + (i * chartArea.width / 5);

      if (i > 0) {
        ctx.moveTo(x, chartArea.top);
        ctx.lineTo(x, chartArea.bottom);
      }

      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(i.toString(), x, chartArea.bottom + 20);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Average Rating (Scale 0-5)', chartArea.left + chartArea.width/2, chartArea.bottom + 40);
    
    if (departmentData && departmentData.length > 0) {
      const barHeight = Math.min(30, (chartArea.height - 20) / departmentData.length);
      const spacing = 10;
      
      for (let i = 0; i < departmentData.length; i++) {
        const dept = departmentData[i];
        const y = chartArea.top + 10 + (i * (barHeight + spacing));

        const barWidth = (dept.score / 5) * chartArea.width;

        const deptColor = dept.color || '#22c55e';
        
        ctx.fillStyle = deptColor;
        ctx.fillRect(chartArea.left, y, barWidth, barHeight);
 
        ctx.fillStyle = '#111827';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(dept.name, chartArea.left - 10, y + barHeight/2 + 4);
  
        ctx.fillStyle = barWidth > 50 ? '#ffffff' : '#111827';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(dept.score.toFixed(1), chartArea.left + barWidth + 5, y + barHeight/2 + 4);
      }
    }
    
    const dataURL = canvas.toDataURL('image/png');

    document.body.removeChild(canvas);
    
    resolve(dataURL);
  });
};

const processSentimentData = (reviews) => {
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dayGroups = {};

  daysOfWeek.forEach(day => {
    dayGroups[day] = { positive: 0, negative: 0, total: 0 };
  });

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

  return daysOfWeek.map(day => {
    const total = dayGroups[day].total || 1; 
    const positive = Math.round((dayGroups[day].positive / total) * 100);
    return {
      day,
      positive,
      negative: 100 - positive 
    };
  });
};

const processEmotionData = (reviews) => {

  const emotions = {};
  let totalWithEmotion = 0;

  reviews.forEach(review => {
    if (!review.emotion_label) return;
    
    const emotion = review.emotion_label.toLowerCase();
    emotions[emotion] = (emotions[emotion] || 0) + 1;
    totalWithEmotion++;
  });

  return Object.keys(emotions).map(name => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), 
    value: Math.round((emotions[name] / (totalWithEmotion || 1)) * 100)
  })).sort((a, b) => b.value - a.value).slice(0, 5); 
};

const processDepartmentData = (reviews) => {
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

  return Object.keys(departments).map(name => ({
    name,
    score: departments[name].count > 0 ? 
      parseFloat((departments[name].total / departments[name].count).toFixed(1)) : 0
  }));
};

const processRatingData = (reviews) => {
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

  return Object.keys(ratings).map(name => ({
    name,
    value: reviews.length > 0 ? Math.round((ratings[name] / reviews.length) * 100) : 0
  })).sort((a, b) => {
    return parseInt(b.name) - parseInt(a.name);
  });
};

const calculateStats = (reviews) => {
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