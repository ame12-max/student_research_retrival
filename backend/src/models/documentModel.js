// backend/src/models/documentModel.js
const fs = require('fs');
const path = require('path') ;
const { pool, useDatabase } = require('../config/db.js');

const documentsFilePath = path.join(__dirname, '../../data/documents.json');

// Ensure JSON file exists (fallback)
if (!fs.existsSync(path.dirname(documentsFilePath))) {
  fs.mkdirSync(path.dirname(documentsFilePath), { recursive: true });
}
if (!fs.existsSync(documentsFilePath)) {
  fs.writeFileSync(documentsFilePath, JSON.stringify([], null, 2));
}

const readDocuments = () => {
  const data = fs.readFileSync(documentsFilePath, 'utf8');
  return JSON.parse(data);
};

const writeDocuments = (docs) => {
  fs.writeFileSync(documentsFilePath, JSON.stringify(docs, null, 2));
};

// Get all documents (checks both sources)
// Get all documents
const getAllDocuments = async () => {
  if (useDatabase && pool) {
    try {
      const result = await pool.query('SELECT * FROM documents ORDER BY upload_date DESC');
      // Map PostgreSQL column names to camelCase and format date
      return result.rows.map(doc => ({
        id: doc.id,
        title: doc.title,
        author: doc.author || '',
        filename: doc.filename,
        filePath: doc.file_path,
        content: doc.content,
        wordCount: doc.word_count || 0,
        uploadDate: doc.upload_date ? new Date(doc.upload_date).toISOString() : new Date().toISOString()
      }));
    } catch (err) {
      console.error('PostgreSQL query failed, falling back to JSON:', err.message);
    }
  }
  const docs = readDocuments();
  return docs.map(doc => ({
    ...doc,
    uploadDate: doc.uploadDate || new Date().toISOString()
  }));
};

// Get single document by ID
 // Get single document by ID
const getDocumentById = async (id) => {
  if (useDatabase && pool) {
    try {
      const result = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          title: row.title,
          author: row.author || '',
          filename: row.filename,
          filePath: row.file_path || '',
          content: row.content || '',
          wordCount: row.word_count || 0,
          uploadDate: row.upload_date || new Date().toISOString()
        };
      }
      return null;
    } catch (err) {
      console.error('PostgreSQL query failed:', err.message);
    }
  }
  const docs = readDocuments();
  return docs.find(doc => doc.id === id);
};

// Create document (saves to both if database is active)
// Create document
const createDocument = async (title, author, filename, content, filePath = '') => {
  const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const wordCount = content.split(/\s+/).length;
  const uploadDate = new Date().toISOString();

  const newDoc = {
    id, title, author: author || '', filename, filePath, uploadDate, content, wordCount
  };

  // Save to PostgreSQL if available
  if (useDatabase && pool) {
    try {
      await pool.query(
        `INSERT INTO documents (id, title, author, filename, file_path, content, word_count, upload_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, title, author || '', filename, filePath, content, wordCount, uploadDate]
      );
      console.log(`Document ${id} saved to PostgreSQL`);
    } catch (err) {
      console.error('Failed to save to PostgreSQL:', err.message);
    }
  }

  // Always save to JSON as backup/fallback
  const docs = readDocuments();
  docs.push(newDoc);
  writeDocuments(docs);

  return newDoc;
};

// Update document
 const updateDocument = async (id, updates) => {
  if (useDatabase) {
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(updates)) {
      const dbKey = key === 'filePath' ? 'file_path' : key;
      fields.push(`${dbKey} = $${idx++}`);
      values.push(value);
    }
    values.push(id);
    await pool.query(`UPDATE documents SET ${fields.join(', ')} WHERE id = $${idx}`, values);
  }

  // Update JSON
  const docs = readDocuments();
  const index = docs.findIndex(doc => doc.id === id);
  if (index !== -1) {
    docs[index] = { ...docs[index], ...updates };
    if (updates.content) docs[index].wordCount = updates.content.split(/\s+/).length;
    writeDocuments(docs);
  }

  return getDocumentById(id);
};

// Delete document
 const deleteDocument = async (id) => {
  if (useDatabase) {
    await pool.query('DELETE FROM documents WHERE id = $1', [id]);
  }

  const docs = readDocuments();
  const newDocs = docs.filter(doc => doc.id !== id);
  writeDocuments(newDocs);
  return true;
};

module.exports = {
  getAllDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  getDocumentById
};