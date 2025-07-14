const express = require("express");
const router = express.Router();
const multer = require("multer");
const analyzeController = require("../Controllers/analyzeController");
const auth = require("../middleware/authMiddleware");
const upload = multer({ dest: "uploads/" });

router.post("/analyze", auth,upload.single("resume"), analyzeController.analyze);

module.exports = router;
