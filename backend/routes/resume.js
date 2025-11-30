const express = require('express');
const router = express.Router();
const resumeController = require('../Controllers/resumeController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Get all resumes
router.get('/', resumeController.getResumes);

// Get single resume
router.get('/:resumeId', resumeController.getResume);

// Create resume
router.post('/', resumeController.createResume);

// Update resume
router.put('/:resumeId', resumeController.updateResume);

// Delete resume
router.delete('/:resumeId', resumeController.deleteResume);

module.exports = router;

