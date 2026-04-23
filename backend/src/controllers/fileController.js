const path = require('path');
const { getDocumentById } = require('../models/documentModel');

const serveDocumentFile = (req, res) => {
  const { id } = req.params;
  const doc = getDocumentById(id);
  if (!doc) {
    return res.status(404).json({ status: 'error', message: 'Document not found' });
  }

  // For PDF, we need the original file. The content in DB is extracted text.
  // We didn't store the original file path. We'll store the uploaded file.
  // Since we only store content, we cannot serve the original PDF as binary.
  // Option: Also store original file path on disk. Let's implement that.

  // Simpler: For PDF, we send the extracted text as plain text? Not good.
  // Better: Extend document model to store originalFilePath.
  // We'll implement that now.
};

module.exports = { serveDocumentFile };