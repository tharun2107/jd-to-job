import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  questionText: String,
  options: [String],
  correctAnswer: String,
  explanation: String
});

const MockTestSchema = new mongoose.Schema({
  title: String,
  role: String,
  questions: [QuestionSchema]
});

export default mongoose.model("MockTest", MockTestSchema);
