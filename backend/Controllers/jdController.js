const JD = require('../models/JD');
const Transaction = require('../models/Transaction'); // or whatever your analysis model is

exports.getUserJDsWithSkills = async (req, res) => {
  try {
    const userId = req.user.id;
    const jds = await JD.find({ userId }).sort({ createdAt: -1 });
    // For each JD, fetch the latest transaction/analysis and get its skills and resources
    const result = await Promise.all(jds.map(async jd => {
      const tx = await Transaction.findOne({ jdId: jd._id }).sort({ createdAt: -1 });
      return {
        ...jd.toObject(),
        skills: tx ? tx.ats.jdSkills || [] : [],
        resources: tx ? tx.learningResources || {} : {}
      };
    }));
    res.json(result);
  } catch (err) {
    console.error('Error fetching JDs with skills:', err);
    res.status(500).json({ error: 'Failed to fetch JDs with skills' });
  }
};

module.exports = exports; 