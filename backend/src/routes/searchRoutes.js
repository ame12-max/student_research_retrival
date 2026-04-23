const express = require('express');
const { executeSearch, suggest, booleanSearchHandler, relevanceFeedback } = require('../controllers/searchController');

const router = express.Router();

router.post('/', executeSearch);
router.get('/suggest', suggest);
router.post('/boolean', booleanSearchHandler);
router.post('/feedback', relevanceFeedback);

module.exports = router;