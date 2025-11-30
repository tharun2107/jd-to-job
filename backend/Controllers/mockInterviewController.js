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
    const prompt = `You are a senior technical interviewer and career coach with extensive experience evaluating candidates. Analyze this candidate's performance in a comprehensive technical interview.

Interview Questions and Candidate Responses:

${questions.map((q, index) => `
Question ${index + 1} (Type: ${q.type}, Skill: ${q.skill || 'General'}): ${q.question}
Candidate's Response: ${responses[index]?.transcript || 'No response provided'}
`).join('\n')}

Provide a comprehensive, professional evaluation that includes:

1. **Overall Assessment Score (0-100)**: Based on technical knowledge, communication clarity, problem-solving approach, and relevance of answers

2. **Strengths**: List 3-5 specific, concrete strengths demonstrated in their answers. Be specific and reference actual points from their responses.

3. **Areas for Improvement**: List 3-5 constructive areas where the candidate can improve. Be specific and actionable.

4. **Technical Competency**: Evaluate their technical knowledge depth, accuracy, and ability to apply concepts. Rate as: Excellent/Good/Moderate/Needs Improvement.

5. **Communication Skills**: Assess clarity, structure, conciseness, and ability to explain complex concepts. Rate as: Excellent/Good/Moderate/Needs Improvement.

6. **Detailed Feedback**: Provide 2-3 paragraphs of comprehensive feedback covering overall performance, standout moments, and key observations.

7. **Recommendations**: Provide 3-5 actionable recommendations for improvement, including specific skills to focus on, practice areas, and resources.

8. **Question-wise Feedback**: For each question, provide:
   - Score (0-10)
   - What they did well
   - What could be improved
   - Specific suggestions

Be thorough, fair, and constructive. Focus on helping the candidate improve.

Return the result in this exact JSON format (no markdown, no code blocks, just pure JSON):
{
  "overallScore": 75,
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["area 1", "area 2"],
  "technicalCompetency": "Good understanding of core concepts",
  "communicationSkills": "Clear and articulate",
  "detailedFeedback": "Overall assessment...",
  "recommendations": ["recommendation 1", "recommendation 2"],
  "questionWiseFeedback": [
    {
      "questionIndex": 0,
      "score": 8,
      "feedback": "Good answer, but could be more detailed",
      "strengths": ["point 1"],
      "improvements": ["point 2"]
    }
  ]
}`;

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
    
    // Extract JSON with better handling
    let jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini API - no JSON found');
    }
    
    let jsonText = jsonMatch[0];
    
    // Try to fix common JSON issues
    jsonText = jsonText
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .replace(/'/g, '"') // Replace single quotes
      .replace(/(\w+):/g, '"$1":'); // Add quotes to unquoted keys
    
    let analysisData;
    try {
      analysisData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('[MockInterview] Analysis JSON parse error:', parseError.message);
      console.error('[MockInterview] Problematic JSON:', jsonText.substring(0, 500));
      throw new Error(`Invalid JSON in analysis response: ${parseError.message}`);
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
      questions,
      interviewStatus: 'in-progress',
      startTime: new Date(),
      duration: INTERVIEW_DURATION,
      responses: []
    });

    await mockInterview.save();

    console.log(`[MockInterview] Created interview ${mockInterview._id} with ${questions.length} questions`);

    res.json({
      success: true,
      interview: {
        id: mockInterview._id,
        questions: questions.map(q => ({
          question: q.question || 'Question not available',
          type: q.type || 'technical',
          skill: q.skill || 'General'
        })),
        duration: mockInterview.duration,
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

    // Update interview
    interview.interviewStatus = 'completed';
    interview.endTime = new Date();
    interview.analysis = analysis;
    interview.overallScore = analysis.overallScore;
    interview.strengths = analysis.strengths;
    interview.weaknesses = analysis.weaknesses;

    await interview.save();

    res.json({
      success: true,
      analysis: {
        overallScore: analysis.overallScore,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        technicalCompetency: analysis.technicalCompetency,
        communicationSkills: analysis.communicationSkills,
        detailedFeedback: analysis.detailedFeedback,
        recommendations: analysis.recommendations,
        questionWiseFeedback: analysis.questionWiseFeedback
      },
      duration: Math.round((interview.endTime - interview.startTime) / (1000 * 60))
    });
  } catch (error) {
    console.error('Error completing interview:', error);
    res.status(500).json({ error: 'Failed to complete interview' });
  }
};

// Get user's interview attempts
exports.getInterviewAttempts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jdId } = req.query;

    const query = { userId };
    if (jdId) {
      query.jdId = jdId;
    }

    const attempts = await MockInterview.find(query)
      .populate('jdId', 'jdText')
      .sort({ createdAt: -1 })
      .select('-questions -responses -analysis.questionWiseFeedback');

    res.json({
      success: true,
      attempts: attempts.map(attempt => ({
        id: attempt._id,
        jdText: attempt.jdId?.jdText,
        interviewStatus: attempt.interviewStatus,
        overallScore: attempt.overallScore,
        startTime: attempt.startTime,
        endTime: attempt.endTime,
        duration: attempt.duration
      }))
    });
  } catch (error) {
    console.error('Error getting interview attempts:', error);
    res.status(500).json({ error: 'Failed to get interview attempts' });
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

