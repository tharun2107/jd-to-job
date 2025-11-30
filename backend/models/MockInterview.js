const mongoose = require("mongoose");

const MockInterviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jdId: { type: mongoose.Schema.Types.ObjectId, ref: 'JD', required: true },
  questions: [{
    question: String,
    type: { type: String, enum: ['technical', 'behavioral', 'problem-solving'] },
    skill: String,
    expectedDuration: Number
  }],
  responses: [{
    questionIndex: Number,
    transcript: String,
    audioUrl: String,
    timestamp: Date
  }],
  interviewStatus: { 
    type: String, 
    enum: ['in-progress', 'completed', 'cancelled'], 
    default: 'in-progress' 
  },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  duration: { type: Number, default: 30 }, // minutes
  analysis: {
    overallScore: Number,
    strengths: [String],
    weaknesses: [String],
    technicalCompetency: String,
    communicationSkills: String,
    detailedFeedback: String,
    recommendations: [String],
    questionWiseFeedback: [{
      questionIndex: Number,
      score: Number,
      feedback: String,
      strengths: [String],
      improvements: [String]
    }]
  },
  overallScore: Number,
  strengths: [String],
  weaknesses: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("MockInterview", MockInterviewSchema);