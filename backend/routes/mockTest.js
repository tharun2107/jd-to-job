const express = require('express');
const router = express.Router();
const mockTestController = require('../Controllers/mockTestController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create new mock test
router.post('/create', mockTestController.createMockTest);

// Submit mock test answers
router.post('/submit', mockTestController.submitMockTest);

// Get user's mock test attempts
router.get('/attempts', mockTestController.getMockTestAttempts);

// Get specific mock test result
router.get('/result/:mockTestId', mockTestController.getMockTestResult);

module.exports = router; 