const express = require('express');
const router = express.Router();
const mockInterviewController = require('../Controllers/mockInterviewController');
const authMiddleware = require('../middleware/authMiddleware');

// Create new mock interview
router.post('/create', authMiddleware, mockInterviewController.createMockInterview);

// Submit interview response
router.post('/submit-response', authMiddleware, mockInterviewController.submitInterviewResponse);

// Complete interview and get analysis
router.post('/complete', authMiddleware, mockInterviewController.completeInterview);

// Get user's interview attempts
router.get('/attempts', authMiddleware, mockInterviewController.getInterviewAttempts);

// Get specific interview result
router.get('/result/:interviewId', authMiddleware, mockInterviewController.getInterviewResult);

module.exports = router;

