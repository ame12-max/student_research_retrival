import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocument, updateDocument } from '../services/api';
import { DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function EditDocument() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await getDocument(id);
        setTitle(res.data.document.title);
        setAuthor(res.data.document.author || '');
      } catch (err) {
        alert('Failed to load document');
        navigate('/admin');
      } finally {
        setFetching(false);
      }
    };
    fetchDoc();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    if (file) formData.append('file', file);
    try {
      await updateDocument(id, formData);
      alert('Document updated successfully');
      navigate('/admin');
    } catch (err) {
      alert('Update failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">✏️ Edit Document</h2>
        <p className="text-gray-500 text-sm mt-1">Update metadata or replace the file</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">Replace File (optional)</label>
          <input
            type="file"
            accept=".txt,.pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
          />
          {file && (
            <div className="mt-3 inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
              <DocumentIcon className="h-4 w-4" />
              {file.name}
              <button type="button" onClick={() => setFile(null)} className="ml-1">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">Leave empty to keep current file. Supported: .txt, .pdf</p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition"
          >
            {loading ? 'Saving...' : 'Save Changes'}
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