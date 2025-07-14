const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  // userId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User",
  //   required: true,
  // },
  // jobTitle: String,
  // jobDescription: String,
  // resumeText: String,
  // matchedSkills: [String],
  // missingSkills: [String],
  // score: Number,
userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jdText: { type: String, required: true },
  ats: {
    score: Number,
    matchedSkills: [String],
    missingSkills: [String],
    jdSkills: [String],
    groupedResumeSkills: Object,       // flexible
    groupedJdSkills: Object,
    groupedMissingSkills: Object,
    resumeSkillsBySection: Object
  },

  // ✅ Resources per skill
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

  // ✅ Mock exam attempts
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

  // ✅ Mock interview feedback
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
