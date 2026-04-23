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
router.get('/file/:id', (req, res) => {
  const doc = getDocumentById(req.params.id);
  if (!doc || !doc.filePath || !fs.existsSync(doc.filePath)) {
    return res.status(404).json({ status: 'error', message: 'File not found' });
  }
  res.sendFile(path.resolve(doc.filePath));
});

// All other document routes require admin authentication
router.post('/', authMiddleware, upload.single('file'), uploadDocument);
router.get('/', authMiddleware, listDocuments);
router.get('/:id', authMiddleware, getDocument);
router.put('/:id', authMiddleware, upload.single('file'), updateDocumentById);
router.delete('/:id', authMiddleware, deleteDocumentById);

module.exports = router;