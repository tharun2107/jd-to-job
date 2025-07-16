const axios = require('axios');

exports.getResources = async (req, res) => {
  try {
    console.log('Received skills for resources:', req.body.skills);
    const flaskRes = await axios.post('http://localhost:5000/api/resources', req.body);
    console.log('Flask /api/resources response:', flaskRes.data);
    res.json(flaskRes.data);
  } catch (err) {
    console.error('Error in resourcesController:', err.response ? err.response.data : err);
    res.status(500).json({ error: 'Resource fetch failed' });
  }
}; 