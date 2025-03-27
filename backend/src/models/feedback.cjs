const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  feedback_text: String,
  rating: Number,
  date: Date,
  source: String,
  department: String,
  textTranslated: String,
  // NLP:
  sentiment_label: String,
  sentiment_confidence: Number,
  emotion_label: String,
  emotion_confidence: Number,
  recommendations: [
    {
      keyword: { type: String },
      solutions: [{ type: String }]
    }
  ]
});

module.exports = mongoose.model('Feedback', feedbackSchema);

