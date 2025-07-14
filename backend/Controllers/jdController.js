const JD = require('../models/JD');

exports.getUserJDs = async (req, res) => {
  try {
    const userId = req.user.id;
    const jds = await JD.find({ userId }).sort({ createdAt: -1 });
    res.json(jds);
  } catch (err) {
    console.error('Error fetching JDs:', err);
    res.status(500).json({ error: 'Failed to fetch JDs' });
  }
};

module.exports = exports; 