const { ApifyClient } = require('apify-client');
const mongoose = require('mongoose');
const Feedback = require('../models/feedback.cjs');
const { analyzeFeedbackText } = require('./nlpService');

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN || 'apify_api_EfTr2KN27klqLsT9TcWh6ATk0nUTsu3GxUOU',
});

async function scrapeReviewsWithApify() {
  try {
      if (mongoose.connection.readyState !== 1) {
      await mongoose.connect('mongodb://127.0.0.1:27017/feedbackfusion?directConnection=true');
      console.log('Connected to MongoDB.');
    } else {
      console.log('MongoDB already connected.');
    }
    
    console.log('Starting Apify actor to scrape Google reviews...');
    const run = await apifyClient.actor("Xb8osYTtOjlsgI6k9").call({
      startUrls: [
        {
          url: "https://www.google.com/maps/place/Hotel+Boulevard,+Autograph+Collection/@25.1899793,55.2719269,17z/data=!4m11!3m10!1s0x3e5f6828d6d49ef7:0x4b4191d609f752a9!5m2!4m1!1i2!8m2!3d25.1899793!4d55.2745018!9m1!1b1!16s%2Fg%2F1pp2t_1z4?entry=ttu"
        }
      ],
      maxReviews: 30,            
      reviewsSort: "newest",     
      language: "en",            
      maxImages: 0,              
      personalData: true         
    });

    console.log('Getting scraped reviews...');
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    
    console.log(`Raw items from Apify: ${items.length}`);
   
    const allReviews = [];
    
    for (const item of items) {
      try {
              if (!item.text || (!item.stars && !item.rating)) {
          console.log('Item missing required review fields, skipping');
          continue;
        }
        const rating = item.stars || 
                      (item.rating ? parseFloat(item.rating) : 0);

        let reviewDate;
        let dateSource = '';
        
        if (item.publishedAtDate) {
          reviewDate = new Date(item.publishedAtDate);
          dateSource = 'publishedAtDate';
        } else if (item.publishedAt) {
 
          const regex = /(\d+)\s+(day|week|month|hour|minute|second)s?\s+ago/i;
          const match = item.publishedAt.match(regex);
          
          if (match) {
            const amount = parseInt(match[1]);
            const unit = match[2].toLowerCase();
            
            reviewDate = new Date();
            if (unit === 'day') {
              reviewDate.setDate(reviewDate.getDate() - amount);
            } else if (unit === 'week') {
              reviewDate.setDate(reviewDate.getDate() - (amount * 7));
            } else if (unit === 'month') {
              reviewDate.setMonth(reviewDate.getMonth() - amount);
            } else if (unit === 'hour') {
              reviewDate.setHours(reviewDate.getHours() - amount);
            } else if (unit === 'minute') {
              reviewDate.setMinutes(reviewDate.getMinutes() - amount);
            } else if (unit === 'second') {
              reviewDate.setSeconds(reviewDate.getSeconds() - amount);
            }
            dateSource = 'publishedAt_relative';
          } else {
    
            try {
              reviewDate = new Date(item.publishedAt);
              dateSource = 'publishedAt_absolute';
            } catch (e) {
              reviewDate = new Date();
              dateSource = 'default_now';
            }
          }
        } else {
          reviewDate = new Date();
          dateSource = 'default_now';
        }
        
        allReviews.push({
          rating,
          text: item.text,
          date: reviewDate,
          dateSource,
          username: item.name || item.reviewerName || 'Anonymous',
          publishedAt: item.publishedAt || 'Unknown'
        });
        
      } catch (err) {
        console.error('Error processing item:', err);
      }
    }
    
    console.log(`Total reviews processed: ${allReviews.length}`);
    
      const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentReviews = allReviews.filter(review => review.date >= oneWeekAgo);
    
    console.log(`Reviews from the last week: ${recentReviews.length}`);

    let insertedCount = 0;
    
    const reviewsToInsert = recentReviews;
   
    if (reviewsToInsert.length === 0) {
      console.log('No new reviews from the last week.');
      return { 
        success: true, 
        count: 0,
        message: 'No new reviews found from the last week.'
      };
    }
    
    for (const rawReview of reviewsToInsert) {
      const { text, rating } = rawReview;
      if (!text) continue;

      const existing = await Feedback.findOne({ feedback_text: text, rating });
      if (existing) {
        console.log('Duplicate found, skipping...');
        continue;
      }

      let sentiment_label = 'unknown', sentiment_confidence = 0;
      let emotion_label = 'unknown', emotion_confidence = 0;
      let dept_label = 'general'; 

      try {
        const analysis = await analyzeFeedbackText(text);
        if (analysis?.sentiment) {
          sentiment_label = analysis.sentiment.label;
          sentiment_confidence = analysis.sentiment.confidence;
        }
        if (analysis?.emotion) {
          emotion_label = analysis.emotion.label;
          emotion_confidence = analysis.emotion.confidence;
        }
        if (analysis?.department) {
          dept_label = analysis.department.label;
        }
      } catch (err) {
        console.error('NLP error:', err);
      }

      const feedbackDoc = new Feedback({
        feedback_text: text,
        textTranslated: text,
        rating,
        date: rawReview.date,
        source: "GoogleScraper",
        department: dept_label,
        sentiment_label,
        sentiment_confidence,
        emotion_label,
        emotion_confidence
      });
      
      await feedbackDoc.save();
      insertedCount++;
      console.log(`Inserted review #${insertedCount} (dept=${dept_label}, sentiment=${sentiment_label})`);
    }

    const message = `Successfully scraped and saved ${insertedCount} new reviews from the last week.`;
    console.log(message);
    
    return { 
      success: true, 
      count: insertedCount,
      message
    };
  } catch (err) {
    console.error('Scrape or insert failed:', err);
    
    return { 
      success: false, 
      count: 0,
      message: `Error during scraping: ${err.message}`
    };
  }
}

module.exports = { scrapeReviewsWithApify };