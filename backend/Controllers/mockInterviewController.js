const MockInterview = require('../models/MockInterview');
const JD = require('../models/JD');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Using Gemini 2.5 Flash (latest model)
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_FALLBACK_MODEL = 'gemini-2.0-flash-exp'; // Fallback to 2.0 if 2.5 not available
const GEMINI_SECONDARY_FALLBACK = 'gemini-1.5-flash'; // Final fallback
const GEMINI_API_URL = (model) => `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`;

// Interview configuration
const INTERVIEW_DURATION = 30; // 30 minutes
const QUESTIONS_PER_INTERVIEW = 8; // ~4 minutes per question

// Generate interview questions based on JD
const generateInterviewQuestions = async (jdText, skills) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured.');
  }

  try {
    const prompt = `Generate exactly ${QUESTIONS_PER_INTERVIEW} interview questions for a ${INTERVIEW_DURATION}-minute technical interview.

Job Description: ${jdText.substring(0, 2000)}
Required Skills: ${skills.slice(0, 20).join(', ')}

Create professional questions covering:
- Technical skills (${Math.ceil(QUESTIONS_PER_INTERVIEW * 0.5)} questions)
- Problem-solving (${Math.ceil(QUESTIONS_PER_INTERVIEW * 0.25)} questions)  
- Behavioral (${Math.ceil(QUESTIONS_PER_INTERVIEW * 0.25)} questions)

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no text before or after. Start with { and end with }.

{"questions":[{"question":"Question text?","type":"technical","skill":"SkillName","expectedDuration":4}]}`;

    // Try Gemini 2.5 Flash first, with fallbacks
    let response;
    let modelUsed = GEMINI_MODEL;
    
    try {
      // Try Gemini 2.5 Flash
      response = await axios.post(`${GEMINI_API_URL(GEMINI_MODEL)}?key=${GEMINI_API_KEY}`, {
        contents: [{ parts: [{ text: prompt }] }]
      });
      console.log(`✅ Using Gemini 2.5 Flash model`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`⚠️ Model ${GEMINI_MODEL} not available, trying fallback ${GEMINI_FALLBACK_MODEL}`);
        modelUsed = GEMINI_FALLBACK_MODEL;
        try {
          // Try Gemini 2.0 Flash Experimental
          response = await axios.post(`${GEMINI_API_URL(GEMINI_FALLBACK_MODEL)}?key=${GEMINI_API_KEY}`, {
            contents: [{ parts: [{ text: prompt }] }]
          });
          console.log(`✅ Using Gemini 2.0 Flash Experimental (fallback)`);
        } catch (fallbackError) {
          if (fallbackError.response?.status === 404) {
            console.log(`⚠️ Model ${GEMINI_FALLBACK_MODEL} not available, using ${GEMINI_SECONDARY_FALLBACK}`);
            modelUsed = GEMINI_SECONDARY_FALLBACK;
            // Final fallback to Gemini 1.5 Flash
            response = await axios.post(`${GEMINI_API_URL(GEMINI_SECONDARY_FALLBACK)}?key=${GEMINI_API_KEY}`, {
              contents: [{ parts: [{ text: prompt }] }]
            });
            console.log(`✅ Using Gemini 1.5 Flash (secondary fallback)`);
          } else {
            throw fallbackError;
          }
        }
      } else {
        throw error;
      }
    }
    const generatedText = response.data.candidates[0].content.parts[0].text;
    console.log('[MockInterview] Raw Gemini response:', generatedText.substring(0, 200));
    
    // Extract JSON - be more aggressive in cleaning
    let cleanedText = generatedText.trim();
    
    // Remove markdown code blocks
    cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Find JSON object (from first { to last })
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error('No valid JSON object found in response');
    }
    
    cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
    
    // Fix common JSON issues - more aggressive
    cleanedText = cleanedText
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3') // Quote unquoted keys
      .replace(/:\s*'([^']*)'/g, ': "$1"') // Replace single quotes in string values
      .replace(/:\s*"([^"]*)"\s*([,}])/g, ': "$1"$2') // Ensure proper string quotes
      .replace(/:\s*(\d+\.?\d*)\s*([,}])/g, ': $1$2') // Ensure numbers aren't quoted
      .replace(/\n\s*\n/g, '\n') // Remove extra newlines
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\/\/.*$/gm, ''); // Remove line comments
    
    // Parse JSON with multiple attempts
    let questionsData;
    let parseError;
    try {
      questionsData = JSON.parse(cleanedText);
    } catch (err) {
      parseError = err;
      // Try one more aggressive fix
      try {
        // Remove any non-JSON characters between braces
        const questionsMatch = cleanedText.match(/"questions"\s*:\s*\[([\s\S]*?)\]/);
        if (questionsMatch) {
          // Reconstruct clean JSON
          cleanedText = `{"questions": [${questionsMatch[1]}]}`;
          questionsData = JSON.parse(cleanedText);
        } else {
          throw err;
        }
      } catch (retryError) {
        console.error('[MockInterview] JSON parse error:', parseError.message);
        console.error('[MockInterview] Full JSON (first 1000 chars):', cleanedText.substring(0, 1000));
        throw new Error(`Invalid JSON from Gemini: ${parseError.message}`);
      }
    }
    
    if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
      // Fallback: create basic questions if parsing fails
      console.warn('[MockInterview] Invalid response format, using fallback questions');
      return Array.from({ length: QUESTIONS_PER_INTERVIEW }, (_, i) => ({
        question: `Question ${i + 1}: Based on the job description, tell us about your relevant experience and skills.`,
        type: i < QUESTIONS_PER_INTERVIEW * 0.5 ? 'technical' : i < QUESTIONS_PER_INTERVIEW * 0.75 ? 'problem-solving' : 'behavioral',
        skill: skills[i % skills.length] || 'General',
        expectedDuration: 4
      }));
    }
    
    // Validate and clean questions
    const validQuestions = questionsData.questions
      .filter(q => q && q.question && typeof q.question === 'string')
      .map(q => ({
        question: q.question.trim(),
        type: q.type || 'technical',
        skill: q.skill || 'General',
        expectedDuration: q.expectedDuration || 4
      }));
    
    if (validQuestions.length === 0) {
      throw new Error('No valid questions generated');
    }
    
    return validQuestions;
  } catch (error) {
    console.error('[MockInterview] Error generating interview questions:', error.response?.data || error.message);
    throw new Error(`Failed to generate questions: ${error.response?.data?.error?.message || error.message}`);
  }
};

// Analyze interview responses
const analyzeInterview = async (questions, responses) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured.');
  }

  try {
    // Build Q&A summary
    const qaSummary = questions.map((q, index) => 
      `Q${index + 1}: ${q.question}\nA${index + 1}: ${responses[index]?.transcript || 'No response'}`
    ).join('\n\n');

    const prompt = `You are a professional interview evaluator. Analyze these interview responses and provide detailed feedback.

INTERVIEW QUESTIONS AND RESPONSES:
${qaSummary}

EVALUATION CRITERIA:
- overallScore: 0-100 based on technical knowledge, communication, and relevance
- technicalCompetency: Rate as "Excellent", "Good", "Average", "Below Average", or "Poor"
- communicationSkills: Rate as "Excellent", "Good", "Average", "Below Average", or "Poor"
- strengths: List 2-4 specific things the candidate did well
- weaknesses: List 2-4 areas needing improvement
- detailedFeedback: 2-3 sentences of constructive feedback
- recommendations: 2-3 actionable tips for improvement

CRITICAL: Return ONLY valid JSON. No markdown code blocks. No backticks. Start with { and end with }.

EXACT FORMAT REQUIRED:
{"overallScore":65,"strengths":["Good understanding of basics","Clear communication"],"weaknesses":["Needs more depth","Could improve examples"],"technicalCompetency":"Average","communicationSkills":"Good","detailedFeedback":"The candidate showed basic understanding but needs to develop deeper technical knowledge. Communication was clear but answers lacked specific examples.","recommendations":["Study advanced concepts","Practice with real examples","Review documentation"]}`;

    // Try Gemini 2.5 Flash first, with fallbacks
    let response;
    let modelUsed = GEMINI_MODEL;
    
    try {
      // Try Gemini 2.5 Flash
      response = await axios.post(`${GEMINI_API_URL(GEMINI_MODEL)}?key=${GEMINI_API_KEY}`, {
        contents: [{ parts: [{ text: prompt }] }]
      });
      console.log(`✅ Using Gemini 2.5 Flash for analysis`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`⚠️ Model ${GEMINI_MODEL} not available, trying fallback ${GEMINI_FALLBACK_MODEL}`);
        modelUsed = GEMINI_FALLBACK_MODEL;
        try {
          // Try Gemini 2.0 Flash Experimental
          response = await axios.post(`${GEMINI_API_URL(GEMINI_FALLBACK_MODEL)}?key=${GEMINI_API_KEY}`, {
            contents: [{ parts: [{ text: prompt }] }]
          });
          console.log(`✅ Using Gemini 2.0 Flash Experimental for analysis (fallback)`);
        } catch (fallbackError) {
          if (fallbackError.response?.status === 404) {
            console.log(`⚠️ Model ${GEMINI_FALLBACK_MODEL} not available, using ${GEMINI_SECONDARY_FALLBACK}`);
            modelUsed = GEMINI_SECONDARY_FALLBACK;
            // Final fallback to Gemini 1.5 Flash
            response = await axios.post(`${GEMINI_API_URL(GEMINI_SECONDARY_FALLBACK)}?key=${GEMINI_API_KEY}`, {
              contents: [{ parts: [{ text: prompt }] }]
            });
            console.log(`✅ Using Gemini 1.5 Flash for analysis (secondary fallback)`);
          } else {
            throw fallbackError;
          }
        }
      } else {
        throw error;
      }
    }
    const generatedText = response.data.candidates[0].content.parts[0].text;
    console.log('[MockInterview] Raw analysis response:', generatedText.substring(0, 200));
    
    // Remove markdown code blocks
    let cleanedText = generatedText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();
    
    // Extract JSON object
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('No JSON object found in response');
    }
    
    let jsonText = cleanedText.substring(firstBrace, lastBrace + 1);
    
    // Fix common JSON issues from Gemini
    jsonText = jsonText
      // Remove backticks from inside strings (common issue)
      .replace(/`([^`]*)`/g, '$1')
      // Replace smart quotes with regular quotes
      .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
      .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
      // Replace curly apostrophes
      .replace(/'/g, "'")
      // Remove trailing commas before ] or }
      .replace(/,(\s*[}\]])/g, '$1')
      // Escape unescaped quotes inside strings (tricky - be careful)
      .replace(/"([^"]*)"(\s*[:,\]}])/g, (match, content, after) => {
        // Escape any internal quotes that aren't already escaped
        const escaped = content.replace(/(?<!\\)"/g, '\\"');
        return `"${escaped}"${after}`;
      });
    
    let analysisData;
    try {
      analysisData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('[MockInterview] Analysis JSON parse error:', parseError.message);
      console.error('[MockInterview] Problematic JSON:', jsonText.substring(0, 800));
      
      // Fallback: return a default analysis
      console.log('[MockInterview] Using fallback analysis');
      return {
        overallScore: 50,
        strengths: ['Completed the interview', 'Attempted all questions'],
        weaknesses: ['Analysis could not be fully processed'],
        technicalCompetency: 'Could not evaluate',
        communicationSkills: 'Could not evaluate',
        detailedFeedback: 'Thank you for completing the interview. Your responses have been recorded. Due to a technical issue, detailed analysis could not be generated. Please try again or contact support.',
        recommendations: ['Practice more', 'Review technical concepts'],
        questionWiseFeedback: []
      };
    }
    
    return analysisData;
  } catch (error) {
    console.error('[MockInterview] Error analyzing interview:', error.response?.data || error);
    throw new Error(`Failed to analyze interview: ${error.response?.data?.error?.message || error.message}`);
  }
};

// Create new mock interview
exports.createMockInterview = async (req, res) => {
  try {
    const { jdId } = req.body;
    const userId = req.user.id;

    if (!jdId) {
      return res.status(400).json({ error: 'JD ID is required' });
    }

    // Get JD
    const jd = await JD.findById(jdId);
    if (!jd) {
      return res.status(404).json({ error: 'JD not found' });
    }

    // Get skills from latest transaction
    const Transaction = require('../models/Transaction');
    const latestTransaction = await Transaction.findOne({ jdId }).sort({ createdAt: -1 });
    const skills = latestTransaction?.ats?.jdSkills || [];

    console.log(`[MockInterview] Generating questions for JD: ${jdId}, Skills: ${skills.length}`);

    // Generate interview questions
    let questions;
    try {
      questions = await generateInterviewQuestions(jd.jdText, skills);
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        throw new Error('No questions generated');
      }
      console.log(`[MockInterview] Generated ${questions.length} questions`);
    } catch (genError) {
      console.error('[MockInterview] Error generating questions:', genError);
      return res.status(500).json({ 
        error: 'Failed to generate interview questions',
        details: genError.message 
      });
    }

    // Create mock interview
    const mockInterview = new MockInterview({
      userId,
      jdId,
      questions: questions.map(q => ({
        question: q.question || 'Question not available',
        type: q.type || 'technical',
        skill: q.skill || 'General',
        expectedDuration: q.expectedDuration || 4,
        difficulty: 'medium'
      })),
      interviewStatus: 'in-progress',
      startTime: new Date(),
      scheduledDuration: INTERVIEW_DURATION,
      settings: {
        cameraEnabled: false,
        audioRecordingEnabled: true,
        questionsCount: questions.length,
        difficultyLevel: 'mixed'
      },
      responses: [],
      questionsAnswered: 0,
      currentQuestionIndex: 0
    });

    await mockInterview.save();

    console.log(`[MockInterview] Created interview ${mockInterview._id} (Attempt #${mockInterview.attemptNumber}) with ${questions.length} questions`);

    res.json({
      success: true,
      interview: {
        id: mockInterview._id,
        attemptNumber: mockInterview.attemptNumber,
        title: mockInterview.interviewTitle,
        questions: mockInterview.questions.map(q => ({
          question: q.question,
          type: q.type,
          skill: q.skill
        })),
        duration: mockInterview.scheduledDuration,
        startTime: mockInterview.startTime
      }
    });
  } catch (error) {
    console.error('Error creating mock interview:', error);
    res.status(500).json({ error: 'Failed to create mock interview' });
  }
};

// Submit interview response (audio or text)
exports.submitInterviewResponse = async (req, res) => {
  try {
    const { interviewId, questionIndex, audioFile, transcript } = req.body;
    const userId = req.user.id;

    const interview = await MockInterview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    if (interview.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (interview.interviewStatus !== 'in-progress') {
      return res.status(400).json({ error: 'Interview not in progress' });
    }

    // If audio file provided, convert to text (you'll need to implement speech-to-text)
    let finalTranscript = transcript;
    if (audioFile) {
      // TODO: Implement speech-to-text conversion
      // For now, use transcript if provided
      finalTranscript = transcript || 'Audio response recorded';
    }

    // Store response
    if (!interview.responses) {
      interview.responses = [];
    }

    interview.responses[questionIndex] = {
      questionIndex,
      transcript: finalTranscript,
      audioUrl: audioFile ? `/uploads/interviews/${interviewId}_q${questionIndex}.webm` : null,
      timestamp: new Date()
    };

    // Update progress tracking
    interview.questionsAnswered = interview.responses.filter(r => r && r.transcript).length;
    interview.currentQuestionIndex = questionIndex;

    await interview.save();

    res.json({
      success: true,
      message: 'Response saved',
      nextQuestion: questionIndex + 1 < interview.questions.length ? questionIndex + 1 : null
    });
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ error: 'Failed to submit response' });
  }
};

// Complete interview and get analysis
exports.completeInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;
    const userId = req.user.id;

    const interview = await MockInterview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    if (interview.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (interview.interviewStatus !== 'in-progress') {
      return res.status(400).json({ error: 'Interview already completed' });
    }

    // Analyze interview
    const analysis = await analyzeInterview(interview.questions, interview.responses || []);
    
    console.log('[MockInterview] Analysis received:', JSON.stringify({
      overallScore: analysis.overallScore,
      technicalCompetency: analysis.technicalCompetency,
      communicationSkills: analysis.communicationSkills,
      strengthsCount: analysis.strengths?.length || 0,
      weaknessesCount: analysis.weaknesses?.length || 0
    }));

    // Update interview with analysis
    interview.interviewStatus = 'completed';
    interview.endTime = new Date();
    interview.actualDuration = Math.round((interview.endTime - interview.startTime) / (1000 * 60));
    interview.questionsAnswered = (interview.responses || []).filter(r => r && r.transcript).length;
    
    // Extract rating strings (Gemini returns these as strings)
    const techRating = analysis.technicalCompetency || 'Not evaluated';
    const commRating = analysis.communicationSkills || 'Not evaluated';
    
    // Store analysis in proper format
    interview.analysis = {
      overallScore: analysis.overallScore || 0,
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      technicalCompetency: {
        rating: techRating,
        details: ''
      },
      communicationSkills: {
        rating: commRating,
        details: ''
      },
      problemSolving: {
        rating: 'Not evaluated',
        details: ''
      },
      detailedFeedback: analysis.detailedFeedback || 'No detailed feedback available.',
      recommendations: analysis.recommendations || [],
      questionWiseFeedback: (analysis.questionWiseFeedback || []).map((qf, idx) => ({
        questionIndex: qf.questionIndex || idx,
        question: interview.questions[qf.questionIndex || idx]?.question || '',
        userResponse: interview.responses[qf.questionIndex || idx]?.transcript || '',
        score: qf.score || 0,
        feedback: qf.feedback || '',
        strengths: qf.strengths || [],
        improvements: qf.improvements || [],
        skillAssessed: interview.questions[qf.questionIndex || idx]?.skill || 'General'
      })),
      analyzedAt: new Date()
    };
    
    // Quick access score
    interview.overallScore = analysis.overallScore || 0;

    await interview.save();

    console.log(`[MockInterview] Completed interview ${interview._id} with score ${analysis.overallScore}`);
    console.log(`[MockInterview] Analysis - Tech: ${techRating}, Comm: ${commRating}`);

    // Return analysis to frontend with proper structure
    res.json({
      success: true,
      analysis: {
        overallScore: analysis.overallScore || 0,
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        technicalCompetency: techRating,  // Send as string for frontend
        communicationSkills: commRating,  // Send as string for frontend
        detailedFeedback: analysis.detailedFeedback || 'No detailed feedback available.',
        recommendations: analysis.recommendations || [],
        questionWiseFeedback: analysis.questionWiseFeedback || []
      },
      attemptNumber: interview.attemptNumber,
      duration: interview.actualDuration
    });
  } catch (error) {
    console.error('Error completing interview:', error);
    
    // Return a fallback analysis if everything fails
    res.json({
      success: true,
      analysis: {
        overallScore: 50,
        strengths: ['Completed the interview', 'Showed effort in answering questions'],
        weaknesses: ['Analysis could not be fully processed due to technical issue'],
        technicalCompetency: 'Could not evaluate',
        communicationSkills: 'Could not evaluate',
        detailedFeedback: 'Thank you for completing the interview. Due to a technical issue, we could not generate a detailed analysis. Your responses have been recorded. Please try again later for a full evaluation.',
        recommendations: ['Practice technical concepts', 'Review common interview questions', 'Work on communication skills'],
        questionWiseFeedback: []
      },
      duration: 0
    });
  }
};

// Get user's interview history (all interviews)
exports.getInterviewHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jdId, status, limit = 20, skip = 0 } = req.query;

    const query = { userId };
    if (jdId) query.jdId = jdId;
    if (status) query.interviewStatus = status;

    const [interviews, total] = await Promise.all([
      MockInterview.find(query)
        .populate('jdId', 'jdText')
        .sort({ createdAt: -1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .select('attemptNumber interviewTitle interviewStatus overallScore startTime endTime actualDuration createdAt analysis.overallScore analysis.strengths analysis.weaknesses'),
      MockInterview.countDocuments(query)
    ]);

    res.json({
      success: true,
      interviews: interviews.map(interview => ({
        id: interview._id,
        attemptNumber: interview.attemptNumber,
        title: interview.interviewTitle,
        jdId: interview.jdId?._id,
        jdPreview: interview.jdId?.jdText?.substring(0, 100) + '...',
        status: interview.interviewStatus,
        score: interview.overallScore || interview.analysis?.overallScore,
        strengths: interview.analysis?.strengths || [],
        weaknesses: interview.analysis?.weaknesses || [],
        startTime: interview.startTime,
        endTime: interview.endTime,
        duration: interview.actualDuration,
        createdAt: interview.createdAt
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + interviews.length < total
      }
    });
  } catch (error) {
    console.error('Error getting interview history:', error);
    res.status(500).json({ error: 'Failed to get interview history' });
  }
};

// Get interviews for a specific JD
exports.getInterviewsByJD = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jdId } = req.params;

    const interviews = await MockInterview.find({ userId, jdId })
      .sort({ createdAt: -1 })
      .select('attemptNumber interviewTitle interviewStatus overallScore startTime endTime actualDuration createdAt analysis.overallScore analysis.strengths analysis.weaknesses analysis.detailedFeedback');

    res.json({
      success: true,
      jdId,
      totalAttempts: interviews.length,
      interviews: interviews.map(interview => ({
        id: interview._id,
        attemptNumber: interview.attemptNumber,
        title: interview.interviewTitle,
        status: interview.interviewStatus,
        score: interview.overallScore || interview.analysis?.overallScore,
        strengths: interview.analysis?.strengths || [],
        weaknesses: interview.analysis?.weaknesses || [],
        feedback: interview.analysis?.detailedFeedback,
        startTime: interview.startTime,
        endTime: interview.endTime,
        duration: interview.actualDuration,
        createdAt: interview.createdAt
      }))
    });
  } catch (error) {
    console.error('Error getting JD interviews:', error);
    res.status(500).json({ error: 'Failed to get JD interviews' });
  }
};

// Get user interview stats
exports.getInterviewStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await MockInterview.aggregate([
      { $match: { userId: new (require('mongoose').Types.ObjectId)(userId) } },
      {
        $group: {
          _id: null,
          totalInterviews: { $sum: 1 },
          completedInterviews: {
            $sum: { $cond: [{ $eq: ['$interviewStatus', 'completed'] }, 1, 0] }
          },
          averageScore: { 
            $avg: { $ifNull: ['$overallScore', '$analysis.overallScore'] }
          },
          highestScore: { 
            $max: { $ifNull: ['$overallScore', '$analysis.overallScore'] }
          },
          totalTimeSpent: { $sum: { $ifNull: ['$actualDuration', 0] } }
        }
      }
    ]);

    const result = stats[0] || {
      totalInterviews: 0,
      completedInterviews: 0,
      averageScore: 0,
      highestScore: 0,
      totalTimeSpent: 0
    };

    // Get recent progress (last 5 completed interviews)
    const recentProgress = await MockInterview.find({
      userId,
      interviewStatus: 'completed',
      overallScore: { $exists: true }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('overallScore createdAt');

    res.json({
      success: true,
      stats: {
        ...result,
        averageScore: Math.round(result.averageScore || 0),
        completionRate: result.totalInterviews > 0 
          ? Math.round((result.completedInterviews / result.totalInterviews) * 100) 
          : 0
      },
      recentProgress: recentProgress.map(p => ({
        score: p.overallScore,
        date: p.createdAt
      }))
    });
  } catch (error) {
    console.error('Error getting interview stats:', error);
    res.status(500).json({ error: 'Failed to get interview stats' });
  }
};

// Get specific interview result
exports.getInterviewResult = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const userId = req.user.id;

    const interview = await MockInterview.findById(interviewId)
      .populate('jdId', 'jdText');

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    if (interview.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      success: true,
      interview: {
        id: interview._id,
        jdText: interview.jdId?.jdText,
        questions: interview.questions,
        responses: interview.responses,
        analysis: interview.analysis,
        interviewStatus: interview.interviewStatus,
        startTime: interview.startTime,
        endTime: interview.endTime,
        duration: interview.duration
      }
    });
  } catch (error) {
    console.error('Error getting interview result:', error);
    res.status(500).json({ error: 'Failed to get interview result' });
  }
};

