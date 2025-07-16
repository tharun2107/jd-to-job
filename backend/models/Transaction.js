const mongoose = require("mongoose");
const { Schema } = mongoose;

const TransactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  jdId: { type: Schema.Types.ObjectId, ref: 'JD', required: true },
  resumeMeta: {
    filename: String,
    uploadedAt: Date
  },
  ats: { type: Object },
  feedback: { type: String },
  learningResources: { type: Schema.Types.Mixed }, // <-- new field
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", TransactionSchema);
