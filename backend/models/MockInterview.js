import mongoose from "mongoose";

const MockInterviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: String,
  feedback: String,
  score: Number,
  strengths: [String],
  weaknesses: [String],
  interviewDate: { type: Date, default: Date.now }
});

export default mongoose.model("MockInterview", MockInterviewSchema);