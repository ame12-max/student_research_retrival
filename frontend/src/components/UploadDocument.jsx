import React, { useState, useCallback } from 'react';
import { uploadDocument } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function UploadDocument() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'text/plain' || droppedFile.name.endsWith('.pdf'))) {
      setFile(droppedFile);
    } else {
      alert('Only .txt or .pdf files are allowed');
    }
  }, []);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected && (selected.type === 'text/plain' || selected.name.endsWith('.pdf'))) {
      setFile(selected);
    } else {
      alert('Only .txt or .pdf files are allowed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !file) {
      alert('Please provide a title and select a file');
      return;
    }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('file', file);
    setLoading(true);
    try {
      await uploadDocument(formData);
      navigate('/admin');
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📤 Upload New Document</h2>
        <p className="text-gray-500 text-sm mt-1">Add a research paper (.txt or .pdf) to the collection</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title and Author fields */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
              placeholder="e.g., A Survey of Information Retrieval Systems"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author (optional)</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
              placeholder="e.g., John Doe"
            />
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition ${
            dragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".txt,.pdf"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            required={!file}
          />
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {file ? file.name : 'Drag & drop a file here, or click to select'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Supported: .txt, .pdf</p>
          {file && (
            <div className="mt-3 inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
              <DocumentIcon className="h-4 w-4" />
              {file.name}
              <button
                type="button"
                onClick={() => setFile(null)}
                className="ml-1 text-orange-500 hover:text-orange-700"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition shadow-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">...</svg>
                Uploading...
              </span>
            ) : (
              'Upload Document'
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}