const fs = require('fs');
const path = require('path');
const { createDocument, getDocumentById, getAllDocuments, updateDocument, deleteDocument } = require('../models/documentModel');
const { addDocumentToIndex, removeDocumentFromIndex, updateDocumentInIndex } = require('../services/indexingService');
const { extractTextFromPDF } = require('../services/pdfService');
const { promisify } = require('util');
const rename = promisify(fs.rename);
// Ensure permanent upload directory exists

const PERMANENT_UPLOAD_DIR = path.join(__dirname, '../../uploads/documents');
if (!fs.existsSync(PERMANENT_UPLOAD_DIR)) {
  fs.mkdirSync(PERMANENT_UPLOAD_DIR, { recursive: true });
}

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
    
    if (fileExt === 'txt') {
      content = fs.readFileSync(req.file.path, 'utf8');
    } else if (fileExt === 'pdf') {
      try {
        content = await extractTextFromPDF(req.file.path);
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
    
    // Create document in database (without filePath first)
    const doc = await createDocument(title, author, req.file.originalname, content, '');
    
    // Permanent file name and path
    const permanentFileName = `${doc.id}_${req.file.originalname}`;
    const permanentFilePath = path.join(PERMANENT_UPLOAD_DIR, permanentFileName);
    
    // Move uploaded file to permanent location
    await rename(req.file.path, permanentFilePath);
    
    // Update document with the permanent file path
    const updatedDoc = await updateDocument(doc.id, { filePath: permanentFilePath });
    
    // Add to index
    await addDocumentToIndex(doc.id, content);
    
    res.status(201).json({
      status: 'success',
      message: 'Document uploaded and indexed',
      document: {
        id: updatedDoc.id,
        title: updatedDoc.title,
        author: updatedDoc.author,
        filename: updatedDoc.filename,
        uploadDate: updatedDoc.uploadDate,
        wordCount: updatedDoc.wordCount
      }
    });
  } catch (err) {
    console.error('Upload error:', err);
    // Clean up temporary file if still exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};



const listDocuments = async (req, res) => {
  const docs = getAllDocuments();
  const simplified = docs.map(doc => ({
    id: doc.id,
    title: doc.title,
    author: doc.author,
    uploadDate: doc.uploadDate,
    wordCount: doc.wordCount
  }));
  res.json({ status: 'success', count: simplified.length, documents: simplified });
};

const getDocument = async (req, res) => {
  const { id } = req.params;
  const doc = getDocumentById(id);
  if (!doc) {
    return res.status(404).json({ status: 'error', message: 'Document not found' });
  }
  res.json({ status: 'success', document: doc });
};

const updateDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = getDocumentById(id);
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

const deleteDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = getDocumentById(id);
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