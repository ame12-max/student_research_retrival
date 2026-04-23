import React, { useState } from 'react';

export default function RelevanceFeedback({ results, onSubmit, onCancel }) {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one relevant document');
      return;
    }
    onSubmit(selectedIds);
  };

  return (
    <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
      <h3 className="font-semibold text-lg text-orange-800">Improve Search Results</h3>
      <p className="text-sm text-gray-600 mb-3">
        Select the documents that are most relevant to your search. The system will expand your query to find better results.
      </p>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {results.map((doc) => (
          <label key={doc.documentId} className="flex items-start gap-2 p-2 hover:bg-orange-100 rounded cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.includes(doc.documentId)}
              onChange={() => toggleSelect(doc.documentId)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-800">{doc.title}</div>
              <div className="text-xs text-gray-500">
                Relevance: {(doc.similarity * 100).toFixed(1)}%
              </div>
            </div>
          </label>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
        >
          Refine Search
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}