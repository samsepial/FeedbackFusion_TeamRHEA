const fs = require('fs');
const path = require('path');

const rulesPath = path.join(__dirname, 'recommendationsRules.json');
let NEGATIVE_RULES = [];

try {
  const raw = fs.readFileSync(rulesPath, 'utf8');
  NEGATIVE_RULES = JSON.parse(raw);
} catch (err) {
  console.error('Error loading negative rules:', err);
}

function generateRecommendations(feedbackDoc) {
  const recommendations = [];
  let textToAnalyze = '';
  if (feedbackDoc.textTranslated && feedbackDoc.textTranslated.trim().length > 0) {
    textToAnalyze = feedbackDoc.feedback_text + " " + feedbackDoc.textTranslated;
  } else if (feedbackDoc.feedback_text) {
    textToAnalyze = feedbackDoc.feedback_text;
  } else {
    console.log("No text available in feedback doc", feedbackDoc._id);
    return recommendations;
  }
  
  const cleanText = textToAnalyze
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();
  
  console.log("Checking doc", feedbackDoc._id, "cleaned text:", cleanText);
  
  if ((feedbackDoc.sentiment_label || '').toLowerCase() !== 'negative') {
    return recommendations;
  }
  
  for (const rule of NEGATIVE_RULES) {
    let matchFound = false;
    for (const kw of rule.keywords) {
      if (cleanText.includes(kw.toLowerCase())) {
        matchFound = true;
        break;
      }
    }
    if (matchFound) {
      let combinedSolutions = [];
      if (Array.isArray(rule.solution)) {
        combinedSolutions = rule.solution;
      } else if (Array.isArray(rule.solutions)) {
        combinedSolutions = rule.solutions;
      } else if (typeof rule.solution === 'string') {
        combinedSolutions = [rule.solution];
      }
      recommendations.push({
        keyword: rule.keywords[0],
        solutions: combinedSolutions
      });
    }
  }
  return recommendations;
}

module.exports = { generateRecommendations };