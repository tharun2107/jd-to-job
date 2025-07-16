const express = require('express');
const router = express.Router();
const analyzeController = require('../Controllers/analyzeController');
const jdController = require('../Controllers/jdController');
const transactionController = require('../Controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Analyze resume
router.post('/analyze', authMiddleware, upload.single('resume'), analyzeController.analyze);

// Get all JDs for user
router.get('/jds', authMiddleware, jdController.getUserJDsWithSkills);

// Get all transactions for a JD
router.get('/transactions', authMiddleware, transactionController.getTransactionsByJD);

module.exports = router;
