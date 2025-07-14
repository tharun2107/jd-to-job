const mongoose = require('mongoose');

const JDSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jdText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  // Optionally: title, company, etc.
});

module.exports = mongoose.model('JD', JDSchema); 