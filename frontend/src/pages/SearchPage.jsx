import React, { useState } from 'react';
import { search, booleanSearch, getSuggestions, relevanceFeedback } from '../services/api';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import HeroCarousel from '../components/HeroCarousel';
import RelevanceFeedback from '../components/RelevanceFeedback';
import toast from 'react-hot-toast';

export default function SearchPage() {
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentQuery, setCurrentQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('standard'); // 'standard' or 'boolean'
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const [lastResults, setLastResults] = useState([]);

const handleSearch = async (query, page = 1) => {
  if (!query || query.trim() === '') {
    console.log('Empty query, skipping search');
    return;
  }
  
  setLoading(true);
  setCurrentQuery(query);
  setCurrentPage(page);
  setLastQuery(query);
  try {
    let res;
    if (mode === 'standard') {
      res = await search(query, page, 10);
    } else {
      res = await booleanSearch(query, page, 10);
    }
    
    if (res.data && res.data.results) {
      setResults(res.data.results);
      setTotalResults(res.data.totalResults || 0);
      setLastResults(res.data.results);
    } else {
      setResults([]);
      setTotalResults(0);
    }
  } catch (err) {
    console.error('Search error:', err);
    if (err.response?.status === 400) {
      console.log('Invalid search query:', err.response?.data?.message);
    }
    setResults([]);
    setTotalResults(0);
  } finally {
    setLoading(false);
  }
};

const handleFeedback = async (relevantIds) => {
  console.log('Feedback submitted with IDs:', relevantIds);
  console.log('Last query:', lastQuery);
  
  try {
    const res = await relevanceFeedback(lastQuery, relevantIds);
    console.log('Feedback response:', res.data);
    
    if (res.data.results && res.data.results.length > 0) {
      setResults(res.data.results);
      setTotalResults(res.data.results.length);
      setCurrentQuery(res.data.expandedQuery);
      toast.success(`Search refined! Found ${res.data.results.length} results.`);
    } else {
      toast.info('No improved results found. Try selecting different documents.');
    }
    setShowFeedback(false);
  } catch (err) {
    console.error('Relevance feedback error:', err);
    const errorMsg = err.response?.data?.message || err.message || 'Failed to refine search';
    toast.error(errorMsg);
  }
};

  const hasSearched = currentQuery !== '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Mode Toggle */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setMode('standard')}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 shadow-sm ${
              mode === 'standard'
                ? 'bg-orange-600 text-white ring-2 ring-orange-300'
                : 'bg-white text-gray-700 hover:bg-orange-100'
            }`}
          >
            🔍 Standard Search
          </button>
          <button
            onClick={() => setMode('boolean')}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 shadow-sm ${
              mode === 'boolean'
                ? 'bg-orange-600 text-white ring-2 ring-orange-300'
                : 'bg-white text-gray-700 hover:bg-orange-100'
            }`}
          >
            ⚡ Boolean Search
          </button>
        </div>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} getSuggestions={getSuggestions} />

        {mode === 'boolean' && (
          <div className="bg-orange-100 border-l-4 border-orange-500 p-4 rounded-r-lg text-sm text-orange-800">
            <strong>Boolean syntax:</strong> Use <code className="bg-white px-1 rounded">AND</code>, <code>OR</code>, <code>NOT</code>, and parentheses.<br />
            Example: <code className="bg-white px-2 py-0.5 rounded">(machine learning) AND (neural networks) NOT deep</code>
          </div>
        )}

        {/* Hero / Empty State */}
        {!hasSearched && !loading && (
          <div className="py-8">
            <HeroCarousel />
            <div className="text-center mt-12">
              <p className="text-gray-500 text-lg">✨ Start your research by typing a query above.</p>
              <p className="text-sm text-gray-400 mt-2">Try “information retrieval”, “machine learning”, or “data mining”</p>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        )}

        {/* Results Section */}
        {!loading && results.length > 0 && (
          <>
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                Found <strong className="text-orange-700">{totalResults}</strong> result{totalResults !== 1 && 's'}
              </p>
              <button
                onClick={() => setShowFeedback(!showFeedback)}
                className="text-sm text-orange-600 hover:text-orange-800 font-medium"
              >
                {showFeedback ? 'Cancel' : 'Improve results (Relevance Feedback)'}
              </button>
            </div>

            <SearchResults results={results} />

            {showFeedback && (
              <RelevanceFeedback
                results={lastResults}
                onSubmit={handleFeedback}
                onCancel={() => setShowFeedback(false)}
              />
            )}

            {/* Pagination */}
            {totalResults > 10 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => handleSearch(currentQuery, currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {currentPage} of {Math.ceil(totalResults / 10)}
                </span>
                <button
                  onClick={() => handleSearch(currentQuery, currentPage + 1)}
                  disabled={currentPage === Math.ceil(totalResults / 10)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {!loading && hasSearched && results.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <p className="text-gray-500 text-lg">😕 No results found for “{currentQuery}”.</p>
            <p className="text-sm text-gray-400 mt-2">Try different keywords or check your spelling.</p>
          </div>
        )}
      </div>
    </div>
  );
}