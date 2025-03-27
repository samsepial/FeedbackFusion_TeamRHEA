const fetch = require('node-fetch');
const NLP_URL = 'http://localhost:5001/analyze';

async function analyzeFeedbackText(input) {
  let text = "";
  if (typeof input === 'object' && input !== null) {
    text = input.textTranslated && input.textTranslated.trim().length > 0
      ? input.textTranslated
      : input.feedback_text;
  } else {
    text = input;
  }
  try {
    const response = await fetch(NLP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    console.log('NLP Response Status:', response.status);
    if (!response.ok) {
      throw new Error(`NLP service error: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ NLP Service Error:', error);
    throw error;
  }
}

module.exports = { analyzeFeedbackText };