const Resume = require('../models/Resume');

// Get all resumes for user
exports.getResumes = async (req, res) => {
  try {
    const userId = req.user.id;
    const resumes = await Resume.find({ userId })
      .sort({ updatedAt: -1 })
      .select('name template updatedAt createdAt');
    
    res.json({ success: true, resumes });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
};

// Get single resume
exports.getResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const { resumeId } = req.params;
    
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    res.json({ success: true, resume });
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
};

// Create new resume
exports.createResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, template, photoUrl, resumeData, skillsGroups } = req.body;
    
    const resume = new Resume({
      userId,
      name: name || 'My Resume',
      template: template || 'classic',
      photoUrl,
      resumeData,
      skillsGroups
    });
    
    await resume.save();
    res.json({ success: true, resume });
  } catch (error) {
    console.error('Error creating resume:', error);
    res.status(500).json({ error: 'Failed to create resume' });
  }
};

// Update resume
exports.updateResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const { resumeId } = req.params;
    const { name, template, photoUrl, resumeData, skillsGroups } = req.body;
    
    const resume = await Resume.findOneAndUpdate(
      { _id: resumeId, userId },
      { 
        name, 
        template, 
        photoUrl, 
        resumeData, 
        skillsGroups,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    res.json({ success: true, resume });
  } catch (error) {
    console.error('Error updating resume:', error);
    res.status(500).json({ error: 'Failed to update resume' });
  }
};

// Delete resume
exports.deleteResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const { resumeId } = req.params;
    
    const resume = await Resume.findOneAndDelete({ _id: resumeId, userId });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    res.json({ success: true, message: 'Resume deleted' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
};

