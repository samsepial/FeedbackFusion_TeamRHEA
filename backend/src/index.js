const app = require('./app.cjs');
const mongoose = require('mongoose');
const cron = require('node-cron');
const Feedback = require('./models/feedback.cjs');
const Alert = require('./models/Alert'); 


const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/feedbackfusion';

mongoose.connect('mongodb://127.0.0.1:27017/feedbackfusion', {
})
.then(() => {
  console.log('MongoDB connected successfully');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

cron.schedule('*/5 * * * *', async () => {
  try {
    const negativeCount = await Feedback.countDocuments({ sentiment_label: 'negative' });
    console.log('Negative feedback count:', negativeCount);

       const activeAlerts = await Alert.find({ active: true, triggered: false });
    
    for (let alert of activeAlerts) {
      if (negativeCount >= alert.threshold) {
        console.log(`Alert triggered: ${alert._id} (Threshold: ${alert.threshold}, Count: ${negativeCount})`);
        await Alert.findByIdAndUpdate(alert._id, { triggered: true, triggeredAt: new Date() });
      }
    }
  } catch (err) {
    console.error('Scheduled job error:', err);
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});