const {
  search,
  getSuggestions,
  booleanSearch,
  preprocess,
  getTermFreqMap,
  getDocumentById,
} = require("../services/indexingService");
// Standard keyword search with pagination
const executeSearch = async (req, res) => {
  const { query, page = 1, limit = 10 } = req.body;
  if (!query || typeof query !== "string" || query.trim() === "") {
    return res
      .status(400)
      .json({
        status: "error",
        message: "Query is required and must be non-empty string",
      });
  }

  const allResults = await search(query);
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const start = (pageNum - 1) * limitNum;
  const end = start + limitNum;
  const paginatedResults = allResults.slice(start, end);

  res.json({
    status: "success",
    query: query,
    totalResults: allResults.length,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(allResults.length / limitNum),
    results: paginatedResults,
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

// Boolean search with AND/OR/NOT and parentheses
const booleanSearchHandler = async (req, res) => {
  const { query, page = 1, limit = 10 } = req.body;
  if (!query || typeof query !== "string" || query.trim() === "") {
    return res
      .status(400)
      .json({ status: "error", message: "Boolean query is required" });
  }

  const allResults = await booleanSearch(query);
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const start = (pageNum - 1) * limitNum;
  const paginated = allResults.slice(start, start + limitNum);

  res.json({
    status: "success",
    query,
    totalResults: allResults.length,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(allResults.length / limitNum),
    results: paginated,
  });
};

const relevanceFeedback = async (req, res) => {
  try {
    const { originalQuery, relevantDocIds, alpha = 1.0, beta = 0.5 } = req.body;

    if (!originalQuery || !relevantDocIds || relevantDocIds.length === 0) {
      return res.status(400).json({
        status: "error",
        message:
          "Original query and at least one relevant document ID required",
      });
    }

    // Preprocess original query terms
    const queryTerms = preprocess(originalQuery);
    const queryTermMap = new Map();
    for (const t of queryTerms) {
      queryTermMap.set(t, (queryTermMap.get(t) || 0) + 1);
    }

    // Collect term frequencies from relevant documents
    const relevantTermMap = new Map();
    for (const docId of relevantDocIds) {
      const doc = getDocumentById(docId);
      if (doc) {
        const docTerms = preprocess(doc.content);
        const docFreqMap = getTermFreqMap(docTerms);
        for (const [term, tf] of docFreqMap.entries()) {
          relevantTermMap.set(term, (relevantTermMap.get(term) || 0) + tf);
        }
      }
    }

    // Rocchio combination: new_term_weight = alpha * original_weight + (beta / |R|) * sum(relevant_weights)
    const combinedTerms = new Map();
    for (const [term, weight] of queryTermMap.entries()) {
      combinedTerms.set(term, (combinedTerms.get(term) || 0) + alpha * weight);
    }
    const betaWeight = beta / relevantDocIds.length;
    for (const [term, weight] of relevantTermMap.entries()) {
      combinedTerms.set(
        term,
        (combinedTerms.get(term) || 0) + betaWeight * weight,
      );
    }

    // Build expanded query string by repeating terms according to rounded weight
    const newQueryParts = [];
    for (const [term, weight] of combinedTerms.entries()) {
      const count = Math.round(weight);
      for (let i = 0; i < count; i++) {
        newQueryParts.push(term);
      }
    }
    const expandedQuery = newQueryParts.join(" ");

    // If no expansion, fallback to original query
    const finalQuery = expandedQuery.trim() || originalQuery;

    // Perform search with expanded query
    const results = await search(finalQuery);

    res.json({
      status: "success",
      originalQuery,
      expandedQuery: finalQuery,
      results: results.slice(0, 20), // limit
    });
  } catch (err) {
    console.error("Relevance feedback error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

module.exports = {
  executeSearch,
  suggest,
  booleanSearchHandler,
  relevanceFeedback,
};
