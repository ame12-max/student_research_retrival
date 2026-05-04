const express = require('express');
const { executeSearch, suggest, booleanSearchHandler, relevanceFeedback } = require('../controllers/searchController');
const { validate } = require('../middleware/validate');
const { relevanceFeedbackSchema , searchSchema, booleanSearchSchema} = require('../validators');

const router = express.Router();

router.post('/', validate(searchSchema), executeSearch);
router.get('/suggest', suggest);
router.post('/boolean', validate(booleanSearchSchema), booleanSearchHandler);
router.post('/feedback', validate(relevanceFeedbackSchema), relevanceFeedback);  

module.exports = router;