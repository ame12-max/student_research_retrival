// testPreprocess.js (run with node testPreprocess.js)
const { preprocess, getTermFreqMap } = require('./src/services/preprocessingService');

const sample = "The information retrieval system is designed to retrieve relevant documents from a large collection. Running and running, the systems were connected.";
console.log("Original:", sample);
const tokens = preprocess(sample);
console.log("Processed tokens:", tokens);

const freq = getTermFreqMap(tokens);
console.log("Term frequency map:", Object.fromEntries(freq));