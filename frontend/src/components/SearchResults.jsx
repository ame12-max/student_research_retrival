import React, { useState } from 'react';
import DocumentViewer from './DocumentViewer';

export default function SearchResults({ results }) {
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDocumentClick = (doc) => {
    if (doc.filename && doc.filename.toLowerCase().endsWith('.pdf')) {
      window.open(`/api/v1/documents/file/${doc.documentId}`, '_blank');
    } else {
      setSelectedDocId(doc.documentId);
      setIsModalOpen(true);
    }
  };

  if (!results.length) return null;

  return (
    <>
      <div className="space-y-4">
        {results.map((doc) => (
          <div
            key={doc.documentId}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-100 overflow-hidden"
            onClick={() => handleDocumentClick(doc)}
          >
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-orange-700 hover:text-orange-800">
                    {doc.title}
                  </h3>
                  {doc.author && <p className="text-sm text-gray-500 mt-1">by {doc.author}</p>}
                </div>
                {doc.filename && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {doc.filename.split('.').pop().toUpperCase()}
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                  Relevance: {(doc.similarity * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-gray-600 mt-3 line-clamp-3 leading-relaxed">{doc.snippet}</p>
              <div className="mt-4 text-orange-500 text-sm font-medium flex items-center gap-1">
                {doc.filename?.toLowerCase().endsWith('.pdf') ? '📄 Open PDF →' : '📖 Read full paper →'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <DocumentViewer
        documentId={selectedDocId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}