import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function SearchBar({ onSearch, getSuggestions }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await getSuggestions(query);
        setSuggestions(res.data.suggestions);
        setShowSuggestions(true);
      } catch (err) {
        console.error(err);
      }
    }, 300);
  }, [query, getSuggestions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
    inputRef.current?.blur();
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search research papers by title, keywords, or author..."
          className="w-full px-5 py-4 pr-24 text-lg border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-600 text-white px-6 py-2 rounded-xl hover:bg-orange-700 transition flex items-center gap-2"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
          Search
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-2 overflow-hidden">
          {suggestions.map((s, idx) => (
            <div
              key={idx}
              className="px-4 py-2 hover:bg-orange-50 cursor-pointer transition text-gray-700"
              onMouseDown={(e) => {
                e.preventDefault(); // prevents input from losing focus
                handleSuggestionClick(s);
              }}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}