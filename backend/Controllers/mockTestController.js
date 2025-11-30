const MockTest = require('../models/MockTest');
const JD = require('../models/JD');
const axios = require('axios');

// Gemini API configuration with Gemini 2.5 and fallbacks
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_FALLBACK_MODEL = 'gemini-2.0-flash-exp';
const GEMINI_SECONDARY_FALLBACK = 'gemini-1.5-flash';
const GEMINI_API_URL = (model) => `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`;

// Check if Gemini API key is configured
if (!GEMINI_API_KEY) {
  console.error('❌ FATAL: GEMINI_API_KEY environment variable is not set!');
  console.error('Please add GEMINI_API_KEY=your_api_key_here to your .env file and restart the server.');
} else {
  console.log(`✅ GEMINI_API_KEY loaded for MockTest. Primary model: ${GEMINI_MODEL}`);
}

// Helper function to call Gemini API with fallbacks
const callGeminiAPI = async (prompt) => {
  let response;
  let modelUsed = GEMINI_MODEL;

  try {
    // Try Gemini 2.5 Flash first
    response = await axios.post(`${GEMINI_API_URL(GEMINI_MODEL)}?key=${GEMINI_API_KEY}`, {
      contents: [{ parts: [{ text: prompt }] }]
    });
    console.log(`✅ [MockTest] Using Gemini 2.5 Flash`);
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(`⚠️ [MockTest] Model ${GEMINI_MODEL} not available, trying ${GEMINI_FALLBACK_MODEL}`);
      modelUsed = GEMINI_FALLBACK_MODEL;
      try {
        response = await axios.post(`${GEMINI_API_URL(GEMINI_FALLBACK_MODEL)}?key=${GEMINI_API_KEY}`, {
          contents: [{ parts: [{ text: prompt }] }]
        });
        console.log(`✅ [MockTest] Using Gemini 2.0 Flash (fallback)`);
      } catch (fallbackError) {
        if (fallbackError.response?.status === 404) {
          console.log(`⚠️ [MockTest] Model ${GEMINI_FALLBACK_MODEL} not available, using ${GEMINI_SECONDARY_FALLBACK}`);
          modelUsed = GEMINI_SECONDARY_FALLBACK;
          response = await axios.post(`${GEMINI_API_URL(GEMINI_SECONDARY_FALLBACK)}?key=${GEMINI_API_KEY}`, {
            contents: [{ parts: [{ text: prompt }] }]
          });
          console.log(`✅ [MockTest] Using Gemini 1.5 Flash (secondary fallback)`);
        } else {
          throw fallbackError;
        }
      }
    } else {
      throw error;
    }
  }

  return {
    text: response.data.candidates[0].content.parts[0].text,
    model: modelUsed
  };
};

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
    console.log(`[MockTest] Generating ${numberOfQuestions} questions...`);

    const prompt = `Generate ${numberOfQuestions} multiple choice questions for a technical assessment.

Job Description: ${jdText.substring(0, 2000)}
Required Skills: ${skills.slice(0, 15).join(', ')}

Create questions that:
- Test practical knowledge of the skills
- Have exactly 4 options each
- Mix easy, medium, and hard difficulty
- Cover different topics from the JD

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks. Start with { and end with }.

{"questions":[{"question":"What is...?","options":["Option A","Option B","Option C","Option D"],"correctAnswer":0,"skill":"JavaScript"}]}

Note: correctAnswer is the index (0-3) of the correct option.`;

    const result = await callGeminiAPI(prompt);
    console.log(`[MockTest] Response from ${result.model}`);
    
    // Clean and parse response
    let cleanedText = result.text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();
    
    // Find JSON object
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
    }
    
    // Fix common JSON issues
    cleanedText = cleanedText
      .replace(/,(\s*[}\]])/g, '$1')
      .replace(/`/g, '');
    
    const questionsData = JSON.parse(cleanedText);
    
    if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
      throw new Error('Invalid questions format');
    }
    
    console.log(`[MockTest] Generated ${questionsData.questions.length} questions successfully`);
    return questionsData.questions;
  } catch (error) {
    console.error('[MockTest] Error generating questions:', error.message);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
};

// Evaluate answers using Gemini API (with explanation and suggestion)
const evaluateAnswers = async (questions, userAnswers) => {
  try {
    // Calculate basic score first
    let correctCount = 0;
    userAnswers.forEach((answer, index) => {
      if (answer.selectedOption === questions[index].correctAnswer) {
        correctCount++;
      }
    });
    const basicScore = correctCount;
    const basicPercentage = Math.round((correctCount / questions.length) * 100);

    const qaSummary = questions.map((q, index) => 
      `Q${index + 1} (${q.skill}): ${q.question}\nCorrect: ${q.options[q.correctAnswer]}\nUser chose: ${q.options[userAnswers[index]?.selectedOption ?? 0]}\nResult: ${userAnswers[index]?.selectedOption === q.correctAnswer ? 'CORRECT' : 'WRONG'}`
    ).join('\n\n');

    const prompt = `Evaluate this mock test and provide feedback.

Test Results:
${qaSummary}

Score: ${correctCount}/${questions.length} (${basicPercentage}%)

Provide feedback for each question and overall assessment.

CRITICAL: Return ONLY valid JSON. No markdown. Start with { end with }.

{"totalScore":${correctCount},"percentage":${basicPercentage},"feedback":[{"questionIndex":0,"isCorrect":true,"correctAnswer":"answer text","explanation":"why this is correct","suggestion":"tip to improve","skillFocus":"skill name"}],"overallFeedback":"Overall performance summary","areasToImprove":["Area 1","Area 2"]}`;

    const result = await callGeminiAPI(prompt);
    console.log(`[MockTest] Evaluation from ${result.model}`);
    
    // Extract JSON
    let cleanedText = result.text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();
    
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
    }
    
    // Fix common JSON issues
    cleanedText = cleanedText
      .replace(/,(\s*[}\]])/g, '$1')
      .replace(/`/g, '');
    
    let evaluationData;
    try {
      evaluationData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('[MockTest] JSON parse error, using fallback evaluation');
      // Return fallback evaluation
      return {
        totalScore: basicScore,
        percentage: basicPercentage,
        feedback: questions.map((q, idx) => ({
          questionIndex: idx,
          isCorrect: userAnswers[idx]?.selectedOption === q.correctAnswer,
          correctAnswer: q.options[q.correctAnswer],
          explanation: `The correct answer is "${q.options[q.correctAnswer]}"`,
          suggestion: userAnswers[idx]?.selectedOption === q.correctAnswer ? '' : `Review ${q.skill} concepts`,
          skillFocus: q.skill
        })),
        overallFeedback: `You scored ${basicScore} out of ${questions.length} (${basicPercentage}%). ${basicPercentage >= 70 ? 'Good job!' : 'Keep practicing!'}`,
        areasToImprove: [...new Set(questions.filter((q, idx) => userAnswers[idx]?.selectedOption !== q.correctAnswer).map(q => q.skill))].slice(0, 3)
      };
    }
    
    // Ensure required fields exist
    evaluationData.totalScore = evaluationData.totalScore ?? basicScore;
    evaluationData.percentage = evaluationData.percentage ?? basicPercentage;
    
    return evaluationData;
  } catch (error) {
    console.error('[MockTest] Error evaluating answers:', error);
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