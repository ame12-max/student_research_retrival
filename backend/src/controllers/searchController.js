// backend/src/controllers/searchController.js
const { search, getSuggestions, booleanSearch, preprocess, getTermFreqMap, getDocumentById } = require('../services/indexingService');

// Standard keyword search with pagination
const executeSearch = async (req, res) => {
  const { query, page = 1, limit = 10 } = req.body;
  if (!query || typeof query !== 'string' || query.trim() === '') {
    return res.status(400).json({ status: 'error', message: 'Query is required and must be non-empty string' });
  }
  
  const allResults = await search(query);
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const start = (pageNum - 1) * limitNum;
  const end = start + limitNum;
  const paginatedResults = allResults.slice(start, end);
  
  res.json({
    status: 'success',
    query: query,
    totalResults: allResults.length,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(allResults.length / limitNum),
    results: paginatedResults
  });
};

// Query suggestion (auto-complete)
const suggest = async (req, res) => {
  const { prefix } = req.query;
  if (!prefix || prefix.length < 1) {
    return res.json({ suggestions: [] });
  }
  const suggestions = getSuggestions(prefix, 10);
  res.json({ prefix, suggestions });
};

// Boolean search
const booleanSearchHandler = async (req, res) => {
  const { query, page = 1, limit = 10 } = req.body;
  if (!query || typeof query !== 'string' || query.trim() === '') {
    return res.status(400).json({ status: 'error', message: 'Boolean query is required' });
  }
  
  const allResults = await booleanSearch(query);
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const start = (pageNum - 1) * limitNum;
  const paginated = allResults.slice(start, start + limitNum);
  
  res.json({
    status: 'success',
    query,
    totalResults: allResults.length,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(allResults.length / limitNum),
    results: paginated
  });
};

// Relevance feedback - SIMPLIFIED WORKING VERSION
const relevanceFeedback = async (req, res) => {
  try {
    const { originalQuery, relevantDocIds, alpha = 1.0, beta = 0.5 } = req.body;

    console.log('=== RELEVANCE FEEDBACK ===');
    console.log('Original query:', originalQuery);
    console.log('Relevant doc IDs:', relevantDocIds);

    if (!originalQuery || !relevantDocIds || relevantDocIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Original query and at least one relevant document ID required'
      });
    }

    // Get the content of relevant documents
    const relevantContents = [];
    for (const docId of relevantDocIds) {
      const doc = await getDocumentById(docId);
      if (doc && doc.content) {
        relevantContents.push(doc.content);
        console.log(`Loaded document: ${doc.title}`);
      } else {
        console.log(`Document not found: ${docId}`);
      }
    }

    if (relevantContents.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid documents found with the provided IDs'
      });
    }

    // Extract important terms from relevant documents
    const importantTerms = new Map();
    
    for (const content of relevantContents) {
      const tokens = preprocess(content);
      const termFreq = new Map();
      for (const token of tokens) {
        termFreq.set(token, (termFreq.get(token) || 0) + 1);
      }
      // Add terms that appear multiple times in the document
      for (const [term, freq] of termFreq.entries()) {
        if (freq > 1) { // Only consider terms that appear at least twice
          importantTerms.set(term, (importantTerms.get(term) || 0) + freq);
        }
      }
    }

    // Sort terms by importance and take top 10
    const sortedTerms = Array.from(importantTerms.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([term]) => term);

    console.log('Important terms:', sortedTerms);

    // Build expanded query
    const originalTerms = preprocess(originalQuery);
    const expandedTerms = [...originalTerms, ...sortedTerms];
    const expandedQuery = expandedTerms.join(' ');
    
    console.log('Expanded query:', expandedQuery);

    // Perform search with expanded query
    const results = await search(expandedQuery);

    res.json({
      status: 'success',
      originalQuery,
      expandedQuery,
      results: results.slice(0, 20)
    });
  } catch (err) {
    console.error('Relevance feedback error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = {
  executeSearch,
  suggest,
  booleanSearchHandler,
  relevanceFeedback
};