const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware');
const {
  uploadDocument,
  listDocuments,
  getDocument,
  updateDocumentById,
  deleteDocumentById
} = require('../controllers/documentController');
const { getDocumentById } = require('../models/documentModel');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/plain' || file.mimetype === 'application/pdf' || 
      file.originalname.endsWith('.txt') || file.originalname.endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Only .txt or .pdf files allowed'), false);
  }
};
const upload = multer({ storage, fileFilter });

// PUBLIC: serve uploaded file (no auth needed)
// Public route - no authentication required (must be BEFORE authMiddleware)
// PUBLIC: serve uploaded file (no auth needed)
router.get('/file/:id', async (req, res) => {
  try {
    const { getDocumentById } = require('../models/documentModel');
    const fs = require('fs');
    const path = require('path');
    
    const doc = await getDocumentById(req.params.id);
    
    if (!doc) {
      return res.status(404).json({ status: 'error', message: 'Document not found' });
    }
    
    console.log('Serving file for document:', doc.id);
    console.log('Filename:', doc.filename);
    console.log('File path from DB (raw):', doc.filePath);
    
    // Check if it's a PDF file
    const isPdf = doc.filename && doc.filename.toLowerCase().endsWith('.pdf');
    
    if (isPdf) {
      if (!doc.filePath || doc.filePath === '') {
        return res.status(404).json({ 
          status: 'error', 
          message: 'PDF file path not found. Please re-upload the document.' 
        });
      }
      
      // Handle Windows path with backslashes
      let normalizedPath = doc.filePath;
      
      // Replace any forward slashes with backslashes for Windows
      if (process.platform === 'win32') {
        // Convert to Windows format
        normalizedPath = normalizedPath.replace(/\//g, '\\');
        // Ensure drive letter is properly formatted (D: not D:\\)
        normalizedPath = normalizedPath.replace(/^([A-Za-z]):\\/, '$1:\\');
      }
      
      // Resolve to absolute path (handles both formats)
      const absolutePath = path.resolve(normalizedPath);
      console.log('Resolved absolute path:', absolutePath);
      console.log('Path exists?', fs.existsSync(absolutePath));
      
      // Also check alternative path formats if file not found
      let fileExists = fs.existsSync(absolutePath);
      let finalPath = absolutePath;
      
      if (!fileExists) {
        // Try alternative path formats
        const alternatives = [
          doc.filePath,                                    // Original
          doc.filePath.replace(/\\/g, '/'),               // Forward slashes
          doc.filePath.replace(/\//g, '\\'),              // Double backslashes
          path.join(__dirname, '../../uploads/documents', path.basename(doc.filePath)), // Relative from project
        ];
        
        for (const altPath of alternatives) {
          const resolvedAlt = path.resolve(altPath);
          if (fs.existsSync(resolvedAlt)) {
            fileExists = true;
            finalPath = resolvedAlt;
            console.log('Found file at alternative path:', resolvedAlt);
            break;
          }
        }
      }
      
      if (!fileExists) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'PDF file not found on disk. Please re-upload the document.',
          attemptedPath: absolutePath,
          originalPath: doc.filePath
        });
      }
      
      // Set correct content type for PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.filename)}"`);
      res.sendFile(finalPath);
    } else {
      // For TXT files, serve the content from database
      if (!doc.content) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Text content not found in database.' 
        });
      }
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.filename || 'document.txt')}"`);
      res.send(doc.content);
    }
  } catch (err) {
    console.error('File serving error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to serve file: ' + err.message });
  }
});

// All other document routes require admin authentication
router.post('/', authMiddleware, upload.single('file'), uploadDocument);
router.get('/', authMiddleware, listDocuments);
router.get('/:id', authMiddleware, getDocument);
router.put('/:id', authMiddleware, upload.single('file'), updateDocumentById);
router.delete('/:id', authMiddleware, deleteDocumentById);

module.exports = router;