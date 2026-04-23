// src/services/pdfService.js
const fs = require('fs');

let pdfParse;
try {
  const loaded = require('pdf-parse');
  // Handle different export styles
  if (typeof loaded === 'function') {
    pdfParse = loaded;
  } else if (loaded && typeof loaded.default === 'function') {
    pdfParse = loaded.default;
  } else {
    throw new Error('pdf-parse exported an unexpected type');
  }
  console.log('PDF parsing loaded successfully');
} catch (err) {
  console.warn('PDF parsing not available:', err.message);
  pdfParse = null;
}

async function extractTextFromPDF(filePath) {
  if (!pdfParse) {
    throw new Error('PDF support not installed. Please use .txt files or run: npm install pdf-parse@1.1.1');
  }
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

module.exports = { extractTextFromPDF };