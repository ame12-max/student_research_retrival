// backend/src/controllers/documentController.js
const fs = require('fs');
const { createDocument, getDocumentById, getAllDocuments, updateDocument, deleteDocument } = require('../models/documentModel');
const { addDocumentToIndex, removeDocumentFromIndex, updateDocumentInIndex } = require('../services/indexingService');
const { extractTextFromPDF } = require('../services/pdfService');

// Upload a new document (supports .txt and .pdf)
// Upload a new document (supports .txt and .pdf)
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }
    const { title, author } = req.body;
    if (!title) {
      return res.status(400).json({ status: 'error', message: 'Title is required' });
    }
    
    let content;
    const fileExt = req.file.originalname.split('.').pop().toLowerCase();
    
    // Create permanent storage directory if it doesn't exist
    const path = require('path');
    const PERMANENT_UPLOAD_DIR = path.join(__dirname, '../../uploads/documents');
    if (!fs.existsSync(PERMANENT_UPLOAD_DIR)) {
      fs.mkdirSync(PERMANENT_UPLOAD_DIR, { recursive: true });
    }
    
    // Generate unique filename for permanent storage
    const uniqueFilename = `${Date.now()}_${req.file.originalname}`;
    const permanentFilePath = path.join(PERMANENT_UPLOAD_DIR, uniqueFilename);
    
    if (fileExt === 'txt') {
      content = fs.readFileSync(req.file.path, 'utf8');
      // Copy file to permanent location
      fs.copyFileSync(req.file.path, permanentFilePath);
    } else if (fileExt === 'pdf') {
      try {
        content = await extractTextFromPDF(req.file.path);
        // Copy file to permanent location
        fs.copyFileSync(req.file.path, permanentFilePath);
      } catch (pdfErr) {
        fs.unlinkSync(req.file.path);
        return res.status(500).json({ 
          status: 'error', 
          message: `PDF processing failed: ${pdfErr.message}. Please use a valid PDF file.` 
        });
      }
    } else {
      return res.status(400).json({ status: 'error', message: 'Only .txt or .pdf files allowed' });
    }
    
    // Create document in storage with file path
    const doc = await createDocument(title, author, req.file.originalname, content, permanentFilePath);
    
    // Add to index
    await addDocumentToIndex(doc.id, content);
    
    // Clean up temporary uploaded file
    fs.unlinkSync(req.file.path);
    
    res.status(201).json({
      status: 'success',
      message: 'Document uploaded and indexed',
      document: {
        id: doc.id,
        title: doc.title,
        author: doc.author,
        filename: doc.filename,
        filePath: doc.filePath,
        uploadDate: doc.uploadDate,
        wordCount: doc.wordCount
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// List all documents - FIXED: await the async function
const listDocuments = async (req, res) => {
  try {
    const docs = await getAllDocuments(); // Added await
    const simplified = docs.map(doc => ({
      id: doc.id,
      title: doc.title,
      author: doc.author,
      uploadDate: doc.uploadDate,
      wordCount: doc.wordCount
    }));
    res.json({ status: 'success', count: simplified.length, documents: simplified });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch documents' });
  }
};

// Get single document - FIXED: await the async function
const getDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await getDocumentById(id); // Added await
    if (!doc) {
      return res.status(404).json({ status: 'error', message: 'Document not found' });
    }
    res.json({ status: 'success', document: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch document' });
  }
};

// Update document - FIXED: await the async functions
const updateDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getDocumentById(id); // Added await
    if (!existing) {
      return res.status(404).json({ status: 'error', message: 'Document not found' });
    }
    
    let newContent = existing.content;
    let newTitle = existing.title;
    let newAuthor = existing.author;
    
    if (req.body.title) newTitle = req.body.title;
    if (req.body.author) newAuthor = req.body.author;
    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop().toLowerCase();
      if (fileExt === 'txt') {
        newContent = fs.readFileSync(req.file.path, 'utf8');
      } else if (fileExt === 'pdf') {
        newContent = await extractTextFromPDF(req.file.path);
      }
      fs.unlinkSync(req.file.path);
    }
    
    // Update in storage
    const updated = await updateDocument(id, {
      title: newTitle,
      author: newAuthor,
      content: newContent
    });
    
    // Update index
    await updateDocumentInIndex(id, existing.content, newContent);
    
    res.json({
      status: 'success',
      message: 'Document updated and re-indexed',
      document: updated
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// Delete document - FIXED: await the async functions
const deleteDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getDocumentById(id); // Added await
    if (!existing) {
      return res.status(404).json({ status: 'error', message: 'Document not found' });
    }
    
    // Remove from index
    await removeDocumentFromIndex(id);
    
    // Delete from storage
    await deleteDocument(id);
    
    res.json({ status: 'success', message: 'Document deleted and removed from index' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

module.exports = {
  uploadDocument,
  listDocuments,
  getDocument,
  updateDocumentById,
  deleteDocumentById
};