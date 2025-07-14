const express = require("express");
const { googleAuthHandler } = require("../Controllers/googleAuth");

const router = express.Router();

router.post("/google", googleAuthHandler);

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
