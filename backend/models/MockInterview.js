const mongoose = require("mongoose");

// Question-wise feedback schema
const QuestionFeedbackSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  question: String,
  userResponse: String,
  score: { type: Number, min: 0, max: 10 },
  feedback: String,
  strengths: [String],
  improvements: [String],
  skillAssessed: String
}, { _id: false });

// Valid rating values
const VALID_RATINGS = [
  'Excellent', 'Very Good', 'Good', 'Above Average', 'Average', 
  'Moderate', 'Below Average', 'Needs Improvement', 'Poor', 'Very Poor',
  'Could not evaluate', 'Not Applicable'
];

// Interview analysis/feedback schema
const InterviewAnalysisSchema = new mongoose.Schema({
  overallScore: { type: Number, min: 0, max: 100 },
  strengths: [String],
  weaknesses: [String],
  technicalCompetency: {
    rating: { type: String },  // Removed enum restriction - will normalize in controller
    details: String
  },
  communicationSkills: {
    rating: { type: String },  // Removed enum restriction - will normalize in controller
    details: String
  },
  problemSolving: {
    rating: { type: String },  // Removed enum restriction - will normalize in controller
    details: String
  },
  detailedFeedback: String,
  recommendations: [String],
  questionWiseFeedback: [QuestionFeedbackSchema],
  analyzedAt: { type: Date, default: Date.now }
}, { _id: false });

// Response schema for each question
const ResponseSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  transcript: String,
  audioUrl: String,
  duration: Number, // seconds taken to answer
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

// Question schema
const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['technical', 'behavioral', 'problem-solving', 'situational'],
    default: 'technical'
  },
  skill: String,
  expectedDuration: { type: Number, default: 4 }, // minutes
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
}, { _id: false });

// Main Mock Interview Schema
const MockInterviewSchema = new mongoose.Schema({
  // User and JD reference
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  jdId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'JD', 
    required: true,
    index: true
  },
  
  // Interview metadata
  attemptNumber: { type: Number, default: 1 }, // Which attempt for this JD
  interviewTitle: String, // Auto-generated or custom title
  
  // Questions asked in this interview
  questions: [QuestionSchema],
  
  // User responses
  responses: [ResponseSchema],
  
  // Interview status
  interviewStatus: { 
    type: String, 
    enum: ['not-started', 'in-progress', 'completed', 'cancelled', 'abandoned'], 
    default: 'not-started',
    index: true
  },
  
  // Timing
  scheduledDuration: { type: Number, default: 30 }, // planned duration in minutes
  actualDuration: Number, // actual time taken in minutes
  startTime: Date,
  endTime: Date,
  
  // Interview settings used
  settings: {
    cameraEnabled: { type: Boolean, default: false },
    audioRecordingEnabled: { type: Boolean, default: true },
    questionsCount: { type: Number, default: 8 },
    difficultyLevel: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'mixed' }
  },
  
  // Analysis and feedback (populated after completion)
  analysis: InterviewAnalysisSchema,
  
  // Quick access scores (duplicated for easy querying)
  overallScore: { type: Number, min: 0, max: 100 },
  
  // Progress tracking
  questionsAnswered: { type: Number, default: 0 },
  currentQuestionIndex: { type: Number, default: 0 },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for efficient querying
MockInterviewSchema.index({ userId: 1, jdId: 1 });
MockInterviewSchema.index({ userId: 1, createdAt: -1 });
MockInterviewSchema.index({ jdId: 1, createdAt: -1 });
MockInterviewSchema.index({ userId: 1, interviewStatus: 1 });

// Pre-save middleware to update timestamps and attempt number
MockInterviewSchema.pre('save', async function(next) {
  this.updatedAt = new Date();
  
  // Calculate attempt number for new interviews
  if (this.isNew) {
    const count = await this.constructor.countDocuments({
      userId: this.userId,
      jdId: this.jdId
    });
    this.attemptNumber = count + 1;
    this.interviewTitle = `Interview Attempt #${this.attemptNumber}`;
  }
  
  next();
});

// Virtual for interview duration
MockInterviewSchema.virtual('durationMinutes').get(function() {
  if (this.startTime && this.endTime) {
    return Math.round((this.endTime - this.startTime) / (1000 * 60));
  }
  return null;
});

// Static method to get interview history for a user
MockInterviewSchema.statics.getHistoryByUser = async function(userId, options = {}) {
  const { limit = 20, skip = 0, jdId = null, status = null } = options;
  
  const query = { userId };
  if (jdId) query.jdId = jdId;
  if (status) query.interviewStatus = status;
  
  return this.find(query)
    .populate('jdId', 'jdText')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-questions -responses');
};

// Static method to get interview history for a JD
MockInterviewSchema.statics.getHistoryByJD = async function(jdId, userId, options = {}) {
  const { limit = 10, skip = 0 } = options;
  
  return this.find({ jdId, userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('attemptNumber overallScore interviewStatus startTime endTime createdAt analysis.overallScore analysis.strengths analysis.weaknesses');
};

// Static method to get stats for a user
MockInterviewSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalInterviews: { $sum: 1 },
        completedInterviews: {
          $sum: { $cond: [{ $eq: ['$interviewStatus', 'completed'] }, 1, 0] }
        },
        averageScore: { $avg: '$overallScore' },
        highestScore: { $max: '$overallScore' },
        totalTimeSpent: { $sum: '$actualDuration' }
      }
    }
  ]);
  
  return stats[0] || {
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0,
    highestScore: 0,
    totalTimeSpent: 0
  };
};

// Instance method to mark interview as completed
MockInterviewSchema.methods.complete = function(analysisData) {
  this.interviewStatus = 'completed';
  this.endTime = new Date();
  this.actualDuration = Math.round((this.endTime - this.startTime) / (1000 * 60));
  this.analysis = analysisData;
  this.overallScore = analysisData.overallScore;
  this.questionsAnswered = this.responses.length;
  return this.save();
};

module.exports = mongoose.model("MockInterview", MockInterviewSchema);
