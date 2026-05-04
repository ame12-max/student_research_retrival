// backend/src/validators/index.js
const Joi = require('joi');

const searchSchema = Joi.object({
  query: Joi.string().min(1).max(200).required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10)
});

const documentUploadSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  author: Joi.string().max(100).optional().allow(''),
});

const loginSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(4).max(100).required()
});

const booleanSearchSchema = Joi.object({
  query: Joi.string().min(1).max(300).required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10)
});

// NEW: Relevance feedback schema
const relevanceFeedbackSchema = Joi.object({
  originalQuery: Joi.string().min(1).max(500).optional(),
  query: Joi.string().min(1).max(500).optional(),
  relevantDocIds: Joi.array().items(Joi.string()).min(1).required(),
  alpha: Joi.number().default(1.0),
  beta: Joi.number().default(0.5)
}).custom((value, helpers) => {
  // Ensure at least one of query or originalQuery is provided
  if (!value.query && !value.originalQuery) {
    return helpers.error('any.required', { message: 'Either query or originalQuery is required' });
  }
  return value;
});

module.exports = {
  searchSchema,
  documentUploadSchema,
  loginSchema,
  booleanSearchSchema,
  relevanceFeedbackSchema  
};