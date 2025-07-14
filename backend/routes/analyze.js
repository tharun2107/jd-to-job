const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const analyzeController = require('../Controllers/analyzeController');
const auth = require('../middleware/authMiddleware');

router.post('/analyze', auth, upload.single('resume'), analyzeController.analyze);

module.exports = router;
