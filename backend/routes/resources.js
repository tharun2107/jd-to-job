const express = require('express');
const router = express.Router();
const resourcesController = require('../Controllers/resourcesController');

router.post('/', resourcesController.getResources);

module.exports = router; 