// src/services/preprocessingService.js
const { isStopword } = require('../utils/stopwords');
const { stem } = require('../utils/stemmer');

/**
 * Tokenize text into words (split by whitespace and punctuation)
 */
function tokenize(text) {
  // Split on non-alphanumeric characters (preserve apostrophes for contractions but remove them)
  // This regex matches sequences of letters (including apostrophes inside words)
  const tokens = text.match(/\b[a-zA-Z]+(?:'[a-zA-Z]+)?\b/g);
  return tokens || [];
}

/**
 * Full preprocessing pipeline for a given text (English)
 * Steps: tokenization -> lowercase -> remove punctuation (handled by regex) -> stopword removal -> stemming
 * @param {string} text - Input text (English)
 * @returns {string[]} - Array of processed terms (stemmed, no stopwords)
 */
function preprocess(text) {
  if (!text || typeof text !== 'string') return [];

  // Step 1: Tokenization
  let tokens = tokenize(text);
  if (tokens.length === 0) return [];

  // Step 2: Lowercasing and remove punctuation (already done by token regex)
  tokens = tokens.map(token => token.toLowerCase());

  // Step 3: Remove stopwords
  tokens = tokens.filter(token => !isStopword(token));

  // Step 4: Stemming
  tokens = tokens.map(token => stem(token));

  // Optional: remove empty strings or very short tokens (length < 2)
  tokens = tokens.filter(token => token.length > 1);

  return tokens;
}

/**
 * Process a query (same as document preprocessing)
 */
function preprocessQuery(query) {
  return preprocess(query);
}

/**
 * Get term frequency map from token list
 */
function getTermFreqMap(tokens) {
  const map = new Map();
  for (const token of tokens) {
    map.set(token, (map.get(token) || 0) + 1);
  }
  return map;
}

module.exports = { preprocess, preprocessQuery, tokenize, getTermFreqMap };