const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema({
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
  examConfig: {
    numberOfQuestions: {
      type: Number,
      required: true,
      enum: [15, 20, 30]
    },
    experienceLevel: {
      type: String,
      enum: ['fresher', '2-4 years', '5+ years'],
      default: 'fresher' // Make it optional with default
    },
    timeLimit: {
      type: Number, // in minutes
      required: true
    }
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: [{
      type: String,
      required: true
    }],
    correctAnswer: {
      type: Number, // index of correct option (0-3)
      required: true
    },
    skill: {
      type: String,
      required: true
    }
  }],
  userAnswers: [{
    questionIndex: {
      type: Number,
      required: true
    },
    selectedOption: {
      type: Number, // index of selected option (0-3)
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  }],
  evaluation: {
    totalScore: {
      type: Number,
      required: false // Only required when exam is completed
    },
    percentage: {
      type: Number,
      required: false // Only required when exam is completed
    },
    feedback: [{
      questionIndex: {
        type: Number,
        required: true
      },
      isCorrect: {
        type: Boolean,
        required: true
      },
      correctAnswer: {
        type: String,
        required: true
      },
      explanation: {
        type: String,
        required: true
      },
      suggestion: {
        type: String,
        required: true,
        default: '' // Allow empty string
      },
      skillFocus: {
        type: String,
        required: true
      }
    }],
    overallFeedback: {
      type: String,
      required: false // Only required when exam is completed
    },
    areasToImprove: [{
      type: String
    }]
  },
  examStatus: {
    type: String,
    enum: ['in-progress', 'completed', 'timeout'],
    default: 'in-progress'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  timeTaken: {
    type: Number // in minutes
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MockTest', mockTestSchema);
