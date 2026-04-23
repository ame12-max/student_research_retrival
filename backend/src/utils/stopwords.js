// src/utils/stopwords.js
const stopwords = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
  'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself',
  'they', 'them', 'their', 'theirs', 'themselves',
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'have', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'this', 'to', 'was', 'were',
  'will', 'with', 'but', 'or', 'so', 'for', 'nor', 'yet', 'do', 'does', 'did',
  'can', 'may', 'would', 'could', 'should', 'might', 'must', 'am', 'been', 'being',
  'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having',
  'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor',
  'so', 'yet', 'of', 'to', 'in', 'for', 'on', 'with', 'at', 'by', 'about', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under',
  'again', 'further', 'then', 'once', 'here', 'there', 'all', 'any', 'both', 'each',
  'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'than', 'that', 'then', 'these', 'those', 'very', 'just', 'but', 'do',
  'does', 'did', 'doing', 'have', 'has', 'had', 'having'
]);

const isStopword = (word) => stopwords.has(word);

module.exports = { stopwords, isStopword };