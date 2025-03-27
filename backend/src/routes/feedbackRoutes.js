const express = require('express');
const router = express.Router();
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');
const Feedback = require('../models/feedback.cjs');
const { analyzeFeedbackText } = require('../services/nlpService');
const { generateRecommendations } = require('../services/recommendationService');
const recommendationsRules = require('../services/recommendationsRules'); // if needed
const { scrapeReviewsWithApify } = require('../services/apifyScrapeService.js');

const upload = multer({ dest: 'uploads/' });

// GET all feedback
router.get('/', async (req, res) => {
  try {
    const allFeedback = await Feedback.find().sort({ date: -1 });
    res.json(allFeedback);
  } catch (err) {
    console.error('GET /feedback error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET historical aggregated data
router.get('/historical', async (req, res) => {
  try {
    const { start, end, department, emotion } = req.query;
    let startDate = start ? new Date(start) : new Date('2020-01-01');
    let endDate = end ? new Date(end) : new Date();
    endDate.setHours(23, 59, 59, 999);

    const matchStage = { date: { $gte: startDate, $lte: endDate } };
    if (department && department !== 'All') {
      matchStage.department = department;
    }
    if (emotion && emotion !== 'All') {
      matchStage.emotion_label = emotion;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ];

    const result = await Feedback.aggregate(pipeline);
    res.json(result);
  } catch (err) {
    console.error('GET /feedback/historical error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST upload feedback file (CSV or JSON)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const originalName = req.file.originalname.toLowerCase();
    const filePath = req.file.path;
    let insertedCount = 0;

    if (originalName.endsWith('.csv')) {
      insertedCount = await parseAndInsertCSV(filePath);
    } else if (originalName.endsWith('.json')) {
      insertedCount = await parseAndInsertJSON(filePath);
    } else {
      return res.status(400).json({ error: 'Unsupported file type (must be .csv or .json)' });
    }

    res.json({ message: 'File processed successfully', count: insertedCount });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /scrape - Trigger review scraping process
router.post('/scrape', async (req, res) => {
  try {
    // Start the scraping process 
    const result = await scrapeReviewsWithApify();
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: result.message,
        count: result.count
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: result.message
      });
    }
  } catch (err) {
    console.error('Error in scrape endpoint:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to complete scraping process'
    });
  }
});

// GET scrape status endpoint 
router.get('/scrape-status', (req, res) => {

  res.json({
    running: false,
    completed: true, 
    count: 0,
    startTime: null,
    endTime: null,
    error: null
  });
});

async function parseAndInsertCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => results.push(row))
      .on('end', async () => {
        try {
          const insertedDocs = await Feedback.insertMany(results);
          const count = insertedDocs.length;
          resolve(count);
          process.nextTick(async () => {
            for (const doc of insertedDocs) {
              try {
                await enrichAndSaveDoc(doc);
              } catch (err) {
                console.error('Error enriching doc (CSV):', doc._id, err);
              }
            }
          });
        } catch (err) {
          reject(err);
        }
      })
      .on('error', (err) => reject(err));
  });
}

async function parseAndInsertJSON(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error('JSON file must contain an array of objects');
  }
  const insertedDocs = await Feedback.insertMany(data);
  const count = insertedDocs.length;
  process.nextTick(async () => {
    for (const doc of insertedDocs) {
      try {
        await enrichAndSaveDoc(doc);
      } catch (err) {
        console.error('Error enriching doc (JSON):', doc._id, err);
      }
    }
  });
  return count;
}


function assignDepartment(text) {
  const lowerText = text.toLowerCase();
  for (const rule of recommendationsRules) {
    if (rule.department) {
      for (const keyword of rule.keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          return rule.department.charAt(0).toUpperCase() + rule.department.slice(1);
        }
      }
    }
  }
  return 'General';
}


async function enrichAndSaveDoc(doc) {
  try {
    const textForNLP = (doc.feedback_text && doc.feedback_text.trim().length > 0)
      ? doc.feedback_text
      : doc.textTranslated;
    if (!textForNLP || textForNLP.trim().length === 0) {
      console.log("Skipping NLP analysis due to empty text for doc", doc._id);
      return;
    }
    
    const analysis = await analyzeFeedbackText(textForNLP);

    doc.sentiment_label = analysis.sentiment?.label || 'neutral';
    doc.sentiment_confidence = analysis.sentiment?.confidence || 0;
    doc.emotion_label = analysis.emotion?.label || 'none';
    doc.emotion_confidence = analysis.emotion?.confidence || 0;

    let assignedDept = analysis.department?.label || '';
    if (assignedDept.toLowerCase() === 'general' || (analysis.department && analysis.department.confidence < 0.5)) {
      assignedDept = assignDepartment(textForNLP);
    }
    doc.department = assignedDept;

    await doc.save();

    const recs = generateRecommendations(doc);
    if (recs && recs.length > 0) {
      doc.recommendations = recs;
      await doc.save();
    }
  } catch (err) {
    console.error('enrichAndSaveDoc error for doc', doc._id, err);
  }
}

module.exports = router;