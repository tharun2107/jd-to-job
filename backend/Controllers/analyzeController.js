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
const JD = require("../models/JD");
// Feedback generator (port of feedback.py)
function generateFeedbackSummary(score, matchedSkills, missingSkills, jobRole = "") {
  const role = jobRole ? jobRole.charAt(0).toUpperCase() + jobRole.slice(1) : "this role";
  let feedback = "";
  if (score >= 85) feedback = `You are an excellent fit for the ${role}. `;
  else if (score >= 60) feedback = `You are a good fit for the ${role}. `;
  else if (score >= 40) feedback = `You are a moderate fit for the ${role}. `;
  else feedback = `You currently have limited alignment with the ${role} requirements. `;
  if (matchedSkills && matchedSkills.length) {
    const skillsStr = matchedSkills.slice(0, 5).join(", ");
    feedback += `You already demonstrate strengths in ${skillsStr}. `;
  }
  if (missingSkills && missingSkills.length) {
    if (score >= 60) feedback += "Improving your proficiency in ";
    else feedback += "To become a stronger candidate, focus on learning ";
    feedback += missingSkills.slice(0, 5).join(", ") + ". ";
  }
  if (score < 60) feedback += "Keep working on these areas to improve your alignment.";
  else feedback += "You're very close — polish a few more skills and you're there!";
  return feedback;
}

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
    console.log("📝 JD Text:", req.body.job_description.slice(0, 100), "...");
    console.log("👤 User ID:", req.user.id);
    let jd = await JD.findOne({ userId: req.user.id, jdText: req.body.job_description });
    if (!jd) {
      jd = await JD.create({ userId: req.user.id, jdText: req.body.job_description });
      console.log("🆕 Created new JD:", jd._id);
    } else {
      console.log("🔗 Found existing JD:", jd._id);
    }
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
    // Generate feedback
    const feedback = generateFeedbackSummary(
      atsResult?.score || 0,
      atsResult?.matched_skills || [],
      atsResult?.missing_skills || [],
      req.body.job_role || ""
    );
    // Flatten all resume skills from resume_skills_by_section
    function flattenResumeSkills(resumeSkillsBySection) {
      if (!resumeSkillsBySection) return [];
      const all = [];
      Object.values(resumeSkillsBySection).forEach(arr => {
        if (Array.isArray(arr)) all.push(...arr);
      });
      return Array.from(new Set(all));
    }
    const flatResumeSkills = atsResult?.resume_skills || flattenResumeSkills(atsResult?.resume_skills_by_section);
    // Fetch learning resources for JD skills
    let learningResources = {};
    if (atsResult?.jd_skills && atsResult.jd_skills.length > 0) {
      try {
        // Call the backend's /api/resources endpoint (proxy to Flask)
        const lrRes = await axios.post('http://localhost:5001/api/resources', { skills: atsResult.jd_skills }, {
          headers: {
            'Authorization': req.headers['authorization'] || '',
            'Content-Type': 'application/json',
          },
        });
        learningResources = lrRes.data.resources || {};
        console.log('Fetched learning resources for JD:', learningResources);
      } catch (err) {
        console.error('Error fetching learning resources:', err.response ? err.response.data : err);
      }
    }
    // 2. Create a new Transaction for this resume upload
    const transaction = new Transaction({
      userId: req.user.id,
      jdId: jd._id,
      resumeMeta: {
        filename: req.file.originalname,
        uploadedAt: new Date()
      },
      ats: {
        score: atsResult?.score || 0,
        matchedSkills: atsResult?.matched_skills || [],
        missingSkills: atsResult?.missing_skills || [],
        jdSkills: atsResult?.jd_skills || [],
        resumeSkills: flatResumeSkills,
        groupedResumeSkills: atsResult?.grouped_resume_skills || {},
        groupedJdSkills: atsResult?.grouped_jd_skills || {},
        groupedMissingSkills: atsResult?.grouped_missing_skills || {},
        resumeSkillsBySection: atsResult?.resume_skills_by_section || {}
      },
      feedback,
      learningResources // <-- store resources
    });
    console.log("📦 Transaction ready to save:", JSON.stringify(transaction, null, 2));
    await transaction.save();
    console.log("✅ Transaction saved successfully with ID:", transaction._id);
    res.json({
      message: "Saved successfully",
      transactionId: transaction._id,
      jdId: jd._id,
      score: atsResult?.score,
      matchedSkills: atsResult?.matched_skills,
      missingSkills: atsResult?.missing_skills,
      groupedResumeSkills: atsResult?.grouped_resume_skills,
      groupedJdSkills: atsResult?.grouped_jd_skills,
      groupedMissingSkills: atsResult?.grouped_missing_skills,
      resumeSkillsBySection: atsResult?.resume_skills_by_section,
      resumeSkills: flatResumeSkills,
      jdSkills: atsResult?.jd_skills,
      resumeMeta: {
        filename: req.file.originalname,
        uploadedAt: transaction.resumeMeta.uploadedAt
      },
      feedback,
      learningResources // <-- return resources
    });
    console.log("🔗 Response sent to frontend:", JSON.stringify({
      message: "Saved successfully",
      transactionId: transaction._id,
      jdId: jd._id,
      score: atsResult?.score,
      matchedSkills: atsResult?.matched_skills,
      missingSkills: atsResult?.missing_skills,
      groupedResumeSkills: atsResult?.grouped_resume_skills,
      groupedJdSkills: atsResult?.grouped_jd_skills,
      groupedMissingSkills: atsResult?.grouped_missing_skills,
      resumeSkillsBySection: atsResult?.resume_skills_by_section,
      resumeSkills: flatResumeSkills,
      jdSkills: atsResult?.jd_skills,
      resumeMeta: {
        filename: req.file.originalname,
        uploadedAt: transaction.resumeMeta.uploadedAt
      },
      feedback
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
