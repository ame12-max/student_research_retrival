import React, { useState, useEffect } from 'react';
import { getDocument } from '../services/api';
import Modal from 'react-modal';

Modal.setAppElement('#root');

export default function DocumentViewer({ documentId, isOpen, onClose }) {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && documentId) {
      setLoading(true);
      getDocument(documentId)
        .then(res => setDocument(res.data.document))
        .catch(err => setError('Failed to load document'))
        .finally(() => setLoading(false));
    }
  }, [documentId, isOpen]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="max-w-3xl mx-auto mt-20 bg-white rounded-xl shadow-2xl p-6 outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50"
      contentLabel="Document Viewer"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-orange-700">
          {document?.title || 'Loading...'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl leading-5"
        >
          &times;
        </button>
      </div>
      {loading && <p className="text-gray-500">Loading document...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {document && (
        <div className="prose prose-orange max-w-none">
          <div className="text-sm text-gray-500 mb-4">
            {document.author && <span>Author: {document.author} | </span>}
            <span>Uploaded: {new Date(document.uploadDate).toLocaleDateString()}</span>
            <span className="ml-2">📄 {document.wordCount} words</span>
          </div>
          <div className="border-t pt-4 whitespace-pre-wrap font-serif text-gray-800 leading-relaxed">
            {document.content}
          </div>
        </div>
      )}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}