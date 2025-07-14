const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JD',
    required: true
  },
  resumeMeta: {
    filename: String,
    uploadedAt: { type: Date, default: Date.now }
  },
  ats: {
    score: Number,
    matchedSkills: [String],
    missingSkills: [String],
    jdSkills: [String],
    groupedResumeSkills: Object,
    groupedJdSkills: Object,
    groupedMissingSkills: Object,
    resumeSkillsBySection: Object
  },
  skillRecommendations: [
    {
      skill: String,
      resources: [
        {
          title: String,
          url: String,
          type: {
            type: String,
            enum: ["video", "article", "course", "documentation", "tool"],
            default: "article",
          },
          provider: String,
          description: String,
        }
      ]
    }
  ],
  mockExams: [
    {
      attemptNumber: Number,
      date: { type: Date, default: Date.now },
      questions: [
        {
          question: String,
          options: [String],
          correctAnswer: String,
          selectedAnswer: String,
          isCorrect: Boolean,
        }
      ],
      score: Number
    }
  ],
  mockInterviews: [
    {
      date: { type: Date, default: Date.now },
      feedback: String,
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      interviewer: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Transaction", TransactionSchema);
