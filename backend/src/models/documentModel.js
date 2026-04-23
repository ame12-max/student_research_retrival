// src/models/documentModel.js
const fs = require('fs');
const path = require('path');

const documentsFilePath = path.join(__dirname, '../../data/documents.json');

// Ensure data folder and file exist
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

const getAllDocuments = () => {
  return readDocuments();
};

const getDocumentById = (id) => {
  const docs = readDocuments();
  return docs.find(doc => doc.id === id);
};

const createDocument = async (title, author, filename, content, filePath) => {
  const docs = readDocuments();
  const newDoc = {
    id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    title,
    author: author || '',
    filename,
    filePath,
    uploadDate: new Date().toISOString(),
    content,
    wordCount: content.split(/\s+/).length
  };
  docs.push(newDoc);
  writeDocuments(docs);
  return newDoc;
};

// Also update updateDocument to allow updating filePath
const updateDocument = async (id, updates) => {
  const docs = readDocuments();
  const index = docs.findIndex(doc => doc.id === id);
  if (index === -1) return null;
  docs[index] = { ...docs[index], ...updates };
  if (updates.content) {
    docs[index].wordCount = updates.content.split(/\s+/).length;
  }
  writeDocuments(docs);
  return docs[index];
};


const deleteDocument = async (id) => {
  const docs = readDocuments();
  const newDocs = docs.filter(doc => doc.id !== id);
  if (newDocs.length === docs.length) return false;
  writeDocuments(newDocs);
  return true;
};

module.exports = {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument
};