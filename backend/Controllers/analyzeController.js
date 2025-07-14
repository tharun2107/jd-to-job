// const axios = require("axios");
// const fs = require("fs");
// const FormData = require("form-data");

// exports.analyze = async (req, res) => {
//   try {
//     const form = new FormData();
//     console.log("hi");
//     form.append("resume", fs.createReadStream(req.file.path));
//     form.append("job_description", req.body.job_description);
//     console.log("Sending file:", req.file.path);

//     const response = await axios.post("http://localhost:5000/analyze", form, {
//       headers: form.getHeaders(),
//     });

//     fs.unlinkSync(req.file.path); // cleanup
//     res.json(response.data);
//     console.log("Response from ML Service:", response.data);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "ML Service failed" });
//   }
// };


const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const Transaction = require("../models/Transaction");

exports.analyze = async (req, res) => {
  try {
    console.log("🔍 Received resume upload request");

    if (!req.file) {
      console.error("❌ No resume file found in request");
      return res.status(400).json({ error: "Resume file is missing" });
    }

    if (!req.body.job_description) {
      console.error("❌ No job description provided");
      return res.status(400).json({ error: "Job description is missing" });
    }

    if (!req.user || !req.user.id) {
      console.error("❌ Unauthorized request. No user ID found in token.");
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("📎 Resume path:", req.file.path);
    console.log("📝 JD Text:", req.body.job_description.slice(0, 100), "..."); // Only first 100 chars
    console.log("👤 User ID:", req.user.id);

    const form = new FormData();
    form.append("resume", fs.createReadStream(req.file.path));
    form.append("job_description", req.body.job_description);

    console.log("📤 Sending data to ATS service at http://localhost:5000/analyze");

    const response = await axios.post("http://localhost:5000/analyze", form, {
      headers: form.getHeaders(),
    });

    console.log("✅ Response received from ATS service");

    fs.unlinkSync(req.file.path); // Cleanup uploaded file
    console.log("🧹 Temp file deleted:", req.file.path);

    const atsResult = response.data;
    console.log("📊 ATS Result:", JSON.stringify(atsResult, null, 2));

    // Safe extraction of ATS data
 const transaction = new Transaction({
  userId: req.user.id,
  jdText: req.body.job_description,
  ats: {
    score: atsResult?.score || 0,
    matchedSkills: atsResult?.matched_skills || [],
    missingSkills: atsResult?.missing_skills || [],
    jdSkills: atsResult?.jd_skills || [],
    groupedResumeSkills: atsResult?.grouped_resume_skills || {},
    groupedJdSkills: atsResult?.grouped_jd_skills || {},
    groupedMissingSkills: atsResult?.grouped_missing_skills || {},
    resumeSkillsBySection: atsResult?.resume_skills_by_section || {}
   },
  });

   console.log("📦 Transaction ready to save:", JSON.stringify(transaction, null, 2));

    await transaction.save();
    console.log("✅ Transaction saved successfully with ID:", transaction._id);

    res.json({
      message: "Saved successfully",
      transactionId: transaction._id,
      score: atsResult?.score,
      matchedSkills: atsResult?.matched_skills,
      missingSkills: atsResult?.missing_skills,
      groupedResumeSkills: atsResult?.grouped_resume_skills,
      groupedJdSkills: atsResult?.grouped_jd_skills,
      groupedMissingSkills: atsResult?.grouped_missing_skills,
      resumeSkillsBySection: atsResult?.resume_skills_by_section,
      jdSkills: atsResult?.jd_skills
    });
    console.log("🔗 Response sent to frontend:", JSON.stringify({
      message: "Saved successfully",
      transactionId: transaction._id,
      score: atsResult?.score,
      matchedSkills: atsResult?.matched_skills,
      missingSkills: atsResult?.missing_skills,
      groupedResumeSkills: atsResult?.grouped_resume_skills,
      groupedJdSkills: atsResult?.grouped_jd_skills,
      groupedMissingSkills: atsResult?.grouped_missing_skills,
      resumeSkillsBySection: atsResult?.resume_skills_by_section,
      jdSkills: atsResult?.jd_skills
    }, null, 2));

  } catch (err) {
    console.error("🔥 Error in analyze controller:");
    console.error(err);

    if (fs.existsSync(req.file?.path)) {
      fs.unlinkSync(req.file.path); // cleanup on error
    }

    res.status(500).json({ error: "Internal Server Error in analyzeController" });
  }
};
