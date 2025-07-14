const Transaction = require('../models/Transaction');

exports.getTransactionsByJD = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jdId } = req.query;
    if (!jdId) return res.status(400).json({ error: 'jdId is required' });
    const txs = await Transaction.find({ userId, jdId }).sort({ createdAt: -1 });
    res.json(txs);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

module.exports = exports; 