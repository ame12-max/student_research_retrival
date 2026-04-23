// src/services/indexingService.js
const { preprocess, getTermFreqMap } = require('./preprocessingService');
const { getAllDocuments, getDocumentById } = require('../models/documentModel');

// In-memory data structures
let invertedIndex = new Map();
let docNorms = new Map();
let totalDocs = 0;

// Helper: compute TF-IDF for a term in a document
function computeTfIdf(termFreq, docFreq, totalDocsCount) {
  if (termFreq === 0) return 0;
  const tf = termFreq;
  const idf = Math.log(totalDocsCount / docFreq);
  return tf * idf;
}

// ---------- Helper for boolean search: get set of document IDs for a term ----------
function getDocSetForTerm(term) {
  const data = invertedIndex.get(term);
  if (!data) return new Set();
  return new Set(data.postings.keys());
}
// ----------------------------------------------------------------------------------

// Rebuild entire index from all documents
async function rebuildIndex() {
  console.log('Rebuilding index...');
  invertedIndex.clear();
  docNorms.clear();
  
  const docs = getAllDocuments();
  totalDocs = docs.length;
  
  const docTermFreqs = new Map();
  for (const doc of docs) {
    const tokens = preprocess(doc.content);
    const termFreqMap = getTermFreqMap(tokens);
    docTermFreqs.set(doc.id, termFreqMap);
    for (const [term] of termFreqMap.entries()) {
      if (!invertedIndex.has(term)) {
        invertedIndex.set(term, { df: 0, postings: new Map() });
      }
    }
  }
  
  for (const [term, data] of invertedIndex.entries()) {
    let df = 0;
    for (const doc of docs) {
      const termFreqMap = docTermFreqs.get(doc.id);
      if (termFreqMap && termFreqMap.has(term)) df++;
    }
    data.df = df;
  }
  
  for (const [docId, termFreqMap] of docTermFreqs.entries()) {
    let normSq = 0;
    for (const [term, tf] of termFreqMap.entries()) {
      const data = invertedIndex.get(term);
      if (!data) continue;
      const tfidf = computeTfIdf(tf, data.df, totalDocs);
      data.postings.set(docId, tfidf);
      normSq += tfidf * tfidf;
    }
    docNorms.set(docId, Math.sqrt(normSq));
  }
  
  console.log(`Index rebuilt. Total docs: ${totalDocs}, Unique terms: ${invertedIndex.size}`);
}

// Add a single document to the index
async function addDocumentToIndex(docId, content) {
  const tokens = preprocess(content);
  const termFreqMap = getTermFreqMap(tokens);
  totalDocs = getAllDocuments().length;
  
  for (const [term, tf] of termFreqMap.entries()) {
    if (!invertedIndex.has(term)) {
      invertedIndex.set(term, { df: 0, postings: new Map() });
    }
    const data = invertedIndex.get(term);
    if (!data.postings.has(docId)) {
      data.df++;
    }
    const tfidf = computeTfIdf(tf, data.df, totalDocs);
    data.postings.set(docId, tfidf);
  }
  
  let normSq = 0;
  for (const [term, tf] of termFreqMap.entries()) {
    const data = invertedIndex.get(term);
    const tfidf = data.postings.get(docId);
    normSq += tfidf * tfidf;
  }
  docNorms.set(docId, Math.sqrt(normSq));

  console.log(`Adding doc ${docId}, content preview:`, content.substring(0, 100));
}

// Remove a document from the index
async function removeDocumentFromIndex(docId) {
  for (const [term, data] of invertedIndex.entries()) {
    if (data.postings.has(docId)) {
      data.postings.delete(docId);
      data.df--;
      if (data.df === 0) {
        invertedIndex.delete(term);
      }
    }
  }
  docNorms.delete(docId);
  totalDocs = getAllDocuments().length;
}

// Update a document: remove old, add new
async function updateDocumentInIndex(docId, oldContent, newContent) {
  await removeDocumentFromIndex(docId);
  await addDocumentToIndex(docId, newContent);
}

// Standard search: cosine similarity
async function search(query) {
  const queryTokens = preprocess(query);
  if (queryTokens.length === 0) return [];
  
  const queryTermFreq = new Map();
  for (const token of queryTokens) {
    queryTermFreq.set(token, (queryTermFreq.get(token) || 0) + 1);
  }
  
  const queryVector = new Map();
  const useFallback = new Set();
  for (const [term, tf] of queryTermFreq.entries()) {
    const data = invertedIndex.get(term);
    if (!data) continue;
    let idf = Math.log(totalDocs / data.df);
    if (idf === 0) {
      idf = Math.log(totalDocs / (data.df + 1));
      useFallback.add(term);
    }
    queryVector.set(term, tf * idf);
  }
  
  if (queryVector.size === 0) return [];
  
  let queryNormSq = 0;
  for (const val of queryVector.values()) queryNormSq += val * val;
  const queryNorm = Math.sqrt(queryNormSq);
  if (queryNorm === 0) return [];
  
  const scores = new Map();
  for (const [term, queryWeight] of queryVector.entries()) {
    const data = invertedIndex.get(term);
    if (!data) continue;
    for (const [docId, docWeight] of data.postings.entries()) {
      scores.set(docId, (scores.get(docId) || 0) + queryWeight * docWeight);
    }
  }
  
  const results = [];
  for (const [docId, dotProduct] of scores.entries()) {
    const docNorm = docNorms.get(docId);
    if (docNorm && docNorm > 0) {
      const similarity = dotProduct / (docNorm * queryNorm);
      if (similarity > 0) {
        const doc = getDocumentById(docId);
        if (doc) {
          results.push({
            documentId: docId,
            title: doc.title,
            author: doc.author,
            filename: doc.filename,   // <-- ADDED
            similarity: parseFloat(similarity.toFixed(4)),
            snippet: doc.content.substring(0, 200) + (doc.content.length > 200 ? '...' : '')
          });
        }
      }
    }
  }
  results.sort((a, b) => b.similarity - a.similarity);
  return results;
}

// Get index statistics
function getIndexStats() {
  return {
    totalDocuments: totalDocs,
    uniqueTerms: invertedIndex.size,
    totalTermOccurrences: Array.from(invertedIndex.values()).reduce((sum, data) => sum + data.postings.size, 0),
    lastRebuild: new Date().toISOString()
  };
}

// Query suggestions (autocomplete)
function getSuggestions(prefix, limit = 10) {
  if (!prefix || prefix.length === 0) return [];
  const suggestions = [];
  const lowerPrefix = prefix.toLowerCase();
  for (const term of invertedIndex.keys()) {
    if (term.startsWith(lowerPrefix)) {
      suggestions.push(term);
      if (suggestions.length >= limit) break;
    }
  }
  return suggestions;
}

// ---------- Boolean query helpers ----------
function tokenizeBooleanQuery(queryStr) {
  const tokens = [];
  const regex = /(\bAND\b|\bOR\b|\bNOT\b|[()]|\w+)/gi;
  let match;
  while ((match = regex.exec(queryStr)) !== null) {
    let token = match[0].toUpperCase();
    if (token === 'AND' || token === 'OR' || token === 'NOT' || token === '(' || token === ')') {
      tokens.push(token);
    } else {
      const processed = preprocess(token);
      if (processed.length > 0) {
        tokens.push(processed[0]);
      } else {
        tokens.push(token.toLowerCase());
      }
    }
  }
  return tokens;
}

function infixToPostfix(tokens) {
  const precedence = { 'NOT': 3, 'AND': 2, 'OR': 1 };
  const output = [];
  const stack = [];
  for (const token of tokens) {
    if (token === '(') {
      stack.push(token);
    } else if (token === ')') {
      while (stack.length && stack[stack.length-1] !== '(') {
        output.push(stack.pop());
      }
      stack.pop();
    } else if (token === 'AND' || token === 'OR' || token === 'NOT') {
      while (stack.length && precedence[stack[stack.length-1]] >= precedence[token]) {
        output.push(stack.pop());
      }
      stack.push(token);
    } else {
      output.push(token);
    }
  }
  while (stack.length) output.push(stack.pop());
  return output;
}

function evaluatePostfix(postfix, allDocsSet) {
  const stack = [];
  for (const token of postfix) {
    if (token === 'AND') {
      const right = stack.pop();
      const left = stack.pop();
      const intersection = new Set([...left].filter(x => right.has(x)));
      stack.push(intersection);
    } else if (token === 'OR') {
      const right = stack.pop();
      const left = stack.pop();
      const union = new Set([...left, ...right]);
      stack.push(union);
    } else if (token === 'NOT') {
      const operand = stack.pop();
      const complement = new Set([...allDocsSet].filter(x => !operand.has(x)));
      stack.push(complement);
    } else {
      // token is a term
      const docSet = getDocSetForTerm(token);
      stack.push(docSet);
    }
  }
  return stack.pop() || new Set();
}

async function booleanSearch(queryStr) {
  const allDocs = getAllDocuments();
  const allDocsSet = new Set(allDocs.map(doc => doc.id));
  const tokens = tokenizeBooleanQuery(queryStr);
  if (tokens.length === 0) return [];
  const postfix = infixToPostfix(tokens);
  const docSet = evaluatePostfix(postfix, allDocsSet);
  
  const cleanQuery = queryStr.replace(/\b(AND|OR|NOT)\b/gi, '').replace(/[()]/g, '');
  const simResults = await search(cleanQuery);
  const simMap = new Map(simResults.map(r => [r.documentId, r.similarity]));
  
  const results = [];
  for (const docId of docSet) {
    const doc = getDocumentById(docId);
    if (doc) {
      results.push({
        documentId: docId,
        title: doc.title,
        author: doc.author,
        similarity: simMap.get(docId) || 0,
        snippet: doc.content.substring(0, 200) + (doc.content.length > 200 ? '...' : '')
      });
    }
  }
  results.sort((a, b) => b.similarity - a.similarity);
  return results;
}
// -------------------------------------------

module.exports = {
  rebuildIndex,
  addDocumentToIndex,
  removeDocumentFromIndex,
  updateDocumentInIndex,
  search,
  getIndexStats,
  getSuggestions,
  booleanSearch,
  getDocumentById,
  preprocess,
  getTermFreqMap
};