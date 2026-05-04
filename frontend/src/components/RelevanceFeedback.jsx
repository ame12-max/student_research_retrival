import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function RelevanceFeedback({ results, onSubmit, onCancel }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one relevant document');
      return;
    }
    
    setIsSubmitting(true);
    console.log('Submitting relevant IDs:', selectedIds);
    
    try {
      await onSubmit(selectedIds);
      toast.success('Search refined successfully!');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to refine search');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === results.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(results.map(r => r.documentId));
    }
  };

  return (
    <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-lg text-orange-800">Improve Search Results</h3>
        <button
          onClick={handleSelectAll}
          className="text-sm text-orange-600 hover:text-orange-800"
        >
          {selectedIds.length === results.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>
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
          disabled={isSubmitting || selectedIds.length === 0}
          className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition"
        >
          {isSubmitting ? 'Refining...' : `Refine Search (${selectedIds.length} selected)`}
        </button>
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}