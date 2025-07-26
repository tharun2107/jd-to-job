const MockTest = require('../models/MockTest');
const JD = require('../models/JD');
const axios = require('axios');

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

//
// --- THE FIX ---
// Use a model name that is confirmed to be in your list of available models.
//
const GEMINI_MODEL = 'gemini-1.5-flash'; 

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent`;

// Check if Gemini API key is configured
if (!GEMINI_API_KEY) {
  console.error('❌ FATAL: GEMINI_API_KEY environment variable is not set!');
  console.error('Please add GEMINI_API_KEY=your_api_key_here to your .env file and restart the server.');
} else {
  console.log(`✅ GEMINI_API_KEY loaded successfully.`);
}

// Time limits for different question counts
const TIME_LIMITS = {
  15: 20, // 20 minutes for 15 questions
  20: 30, // 30 minutes for 20 questions
  30: 45  // 45 minutes for 30 questions
};

// Generate questions using Gemini API
const generateQuestions = async (jdText, skills, numberOfQuestions) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please check server logs.');
  }

  try {
    console.log(`--- Initiating Question Generation ---`);
    console.log(`✅ Using Model: ${GEMINI_MODEL}`); // This will now show the correct, available model
    console.log(`Target URL: ${GEMINI_API_URL}`);

    const prompt = `You are an expert technical interviewer. Based on the following Job Description (JD), create ${numberOfQuestions} multiple choice questions (MCQs) for a mock exam. Each question should:
- Be relevant to the JD and the listed skills: ${skills.join(', ')}
- Have exactly 4 options (A, B, C, D)
- Vary in difficulty as appropriate for the JD
- Focus on practical, real-world scenarios
- Cover a range of topics from the JD

Job Description:
"""
${jdText}
"""

Return the result in this exact JSON format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "skill": "skill_name"
    }
  ]
}
Note: correctAnswer should be the index (0-3) of the correct option.`;

    console.log('🚀 Making request to Gemini API...');
    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [{ parts: [{ text: prompt }] }]
    });

    console.log('✅ Gemini API response received');
    const generatedText = response.data.candidates[0].content.parts[0].text;
    
    // Clean potential markdown formatting from the response
    const cleanedText = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
    const questionsData = JSON.parse(cleanedText);
    
    console.log('✅ Parsed questions data successfully.');
    return questionsData.questions;
  } catch (error) {
    console.error('❌ Error generating questions:', error.message);
    if (error.response) {
      console.error('🔍 API Response Status:', error.response.status);
      console.error('🔍 API Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
};

// Evaluate answers using Gemini API (with explanation and suggestion)
const evaluateAnswers = async (questions, userAnswers) => {
  try {
    const prompt = `Evaluate the following user answers for a technical mock exam. For each question, provide:
- Whether the answer is correct
- The correct answer
- A detailed explanation
- If the user was wrong, a suggestion to improve on the specific topic/skill

Questions and User Answers:
${questions.map((q, index) => `
Question ${index + 1}: ${q.question}
Options: ${q.options.map((opt, i) => `${i}: ${opt}`).join(', ')}
Correct Answer: ${q.options[q.correctAnswer]}
User's Answer: ${q.options[userAnswers[index]?.selectedOption || 0]}
Skill: ${q.skill}
`).join('\n')}

Return the evaluation in this exact JSON format:
{
  "totalScore": 15,
  "percentage": 75.0,
  "feedback": [
    {
      "questionIndex": 0,
      "isCorrect": true,
      "correctAnswer": "Correct answer text",
      "explanation": "Detailed explanation why this is correct",
      "suggestion": "Suggestion to improve if wrong, else empty string",
      "skillFocus": "Specific skill area to focus on"
    }
  ],
  "overallFeedback": "Overall performance feedback",
  "areasToImprove": ["Area 1", "Area 2", "Area 3"]
}`;

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [{ parts: [{ text: prompt }] }]
    });
    const generatedText = response.data.candidates[0].content.parts[0].text;
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response format from Gemini API');
    const evaluationData = JSON.parse(jsonMatch[0]);
    return evaluationData;
  } catch (error) {
    console.error('Error evaluating answers:', error);
    throw new Error('Failed to evaluate answers');
  }
};

// Create new mock test (no experienceLevel)
exports.createMockTest = async (req, res) => {
  try {
    const { jdId, numberOfQuestions } = req.body;
    const userId = req.user.id;

    if (![15, 20, 30].includes(numberOfQuestions)) {
      return res.status(400).json({ error: 'Invalid number of questions' });
    }

    // Get JD and skills
    const jd = await JD.findById(jdId);
    if (!jd) {
      return res.status(404).json({ error: 'JD not found' });
    }
    const Transaction = require('../models/Transaction');
    const latestTransaction = await Transaction.findOne({ jdId }).sort({ createdAt: -1 });
    if (!latestTransaction || !latestTransaction.ats || !latestTransaction.ats.jdSkills) {
      return res.status(400).json({ error: 'No skills found for this JD' });
    }
    const skills = latestTransaction.ats.jdSkills;

    // Generate questions using Gemini (now uses full JD text)
    const questions = await generateQuestions(jd.jdText, skills, numberOfQuestions);

    // Create mock test
    const mockTest = new MockTest({
      userId,
      jdId,
      examConfig: {
        numberOfQuestions,
        timeLimit: TIME_LIMITS[numberOfQuestions]
      },
      questions,
      examStatus: 'in-progress',
      startTime: new Date()
    });
    await mockTest.save();
    res.json({
      success: true,
      mockTest: {
        id: mockTest._id,
        questions: mockTest.questions.map(q => ({
          question: q.question,
          options: q.options,
          skill: q.skill
        })),
        examConfig: mockTest.examConfig,
        startTime: mockTest.startTime
      }
    });
  } catch (error) {
    console.error('Error creating mock test:', error);
    res.status(500).json({ error: 'Failed to create mock test' });
  }
};

// Submit mock test answers
exports.submitMockTest = async (req, res) => {
  try {
    const { mockTestId, answers } = req.body;
    const userId = req.user.id;

    // Find mock test
    const mockTest = await MockTest.findById(mockTestId);
    if (!mockTest) {
      return res.status(404).json({ error: 'Mock test not found' });
    }

    if (mockTest.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (mockTest.examStatus !== 'in-progress') {
      return res.status(400).json({ error: 'Test already submitted' });
    }

    // Process user answers
    const userAnswers = answers.map((answer, index) => ({
      questionIndex: index,
      selectedOption: answer.selectedOption,
      isCorrect: answer.selectedOption === mockTest.questions[index].correctAnswer
    }));

    // Evaluate answers using Gemini
    let evaluation = await evaluateAnswers(mockTest.questions, userAnswers);

    // Ensure every feedback item has a non-empty suggestion
    if (evaluation && Array.isArray(evaluation.feedback)) {
      evaluation.feedback = evaluation.feedback.map(fb => ({
        ...fb,
        suggestion: typeof fb.suggestion === 'string' && fb.suggestion.trim() !== ''
          ? fb.suggestion
          : 'No suggestion provided.'
      }));
    }

    // Update mock test
    mockTest.userAnswers = userAnswers;
    mockTest.evaluation = evaluation;
    mockTest.examStatus = 'completed';
    mockTest.endTime = new Date();
    mockTest.timeTaken = Math.round((mockTest.endTime - mockTest.startTime) / (1000 * 60)); // minutes

    await mockTest.save();

    res.json({
      success: true,
      result: {
        totalScore: evaluation.totalScore,
        percentage: evaluation.percentage,
        feedback: evaluation.feedback,
        overallFeedback: evaluation.overallFeedback,
        areasToImprove: evaluation.areasToImprove,
        timeTaken: mockTest.timeTaken
      }
    });

  } catch (error) {
    console.error('Error submitting mock test:', error);
    res.status(500).json({ error: 'Failed to submit mock test' });
  }
};

// Get user's mock test attempts
exports.getMockTestAttempts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jdId } = req.query;

    const query = { userId };
    if (jdId) {
      query.jdId = jdId;
    }

    const attempts = await MockTest.find(query)
      .populate('jdId', 'jdText')
      .sort({ createdAt: -1 })
      .select('-questions -userAnswers -evaluation.feedback');

    res.json({
      success: true,
      attempts: attempts.map(attempt => ({
        id: attempt._id,
        jdText: attempt.jdId.jdText,
        examConfig: attempt.examConfig,
        evaluation: {
          totalScore: attempt.evaluation.totalScore,
          percentage: attempt.evaluation.percentage,
          overallFeedback: attempt.evaluation.overallFeedback
        },
        examStatus: attempt.examStatus,
        startTime: attempt.startTime,
        endTime: attempt.endTime,
        timeTaken: attempt.timeTaken
      }))
    });

  } catch (error) {
    console.error('Error getting mock test attempts:', error);
    res.status(500).json({ error: 'Failed to get mock test attempts' });
  }
};

// Get specific mock test result
exports.getMockTestResult = async (req, res) => {
  try {
    const { mockTestId } = req.params;
    const userId = req.user.id;

    const mockTest = await MockTest.findById(mockTestId)
      .populate('jdId', 'jdText');

    if (!mockTest) {
      return res.status(404).json({ error: 'Mock test not found' });
    }

    if (mockTest.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      success: true,
      mockTest: {
        id: mockTest._id,
        jdText: mockTest.jdId.jdText,
        examConfig: mockTest.examConfig,
        questions: mockTest.questions,
        userAnswers: mockTest.userAnswers,
        evaluation: mockTest.evaluation,
        examStatus: mockTest.examStatus,
        startTime: mockTest.startTime,
        endTime: mockTest.endTime,
        timeTaken: mockTest.timeTaken
      }
    });

  } catch (error) {
    console.error('Error getting mock test result:', error);
    res.status(500).json({ error: 'Failed to get mock test result' });
  }
}; 