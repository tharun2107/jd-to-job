import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema({
  questionId: mongoose.Schema.Types.ObjectId,
  selected: String,
  isCorrect: Boolean
});

const MockAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest' },
  score: Number,
  correct: Number,
  wrong: Number,
  selectedAnswers: [AnswerSchema],
  attemptedAt: { type: Date, default: Date.now }
});

export default mongoose.model("MockAttempt", MockAttemptSchema);