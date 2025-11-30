const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  name: { 
    type: String, 
    required: true,
    default: 'My Resume'
  },
  template: {
    type: String,
    enum: ['classic', 'professional', 'modern', 'executive'],
    default: 'classic'
  },
  photoUrl: String,
  resumeData: {
    personalInfo: {
      name: String,
      email: String,
      phone: String,
      links: [{
        label: String,
        url: String
      }]
    },
    summary: String,
    experience: [{
      company: String,
      role: String,
      duration: String,
      details: [String]
    }],
    education: [{
      degree: String,
      branch: String,
      institution: String,
      location: String,
      duration: String,
      cgpa: String,
      extra: String
    }],
    projects: [{
      title: String,
      techStack: [String],
      links: [{
        label: String,
        url: String
      }],
      monthYear: String,
      description: [String]
    }],
    certifications: [{
      name: String
    }],
    achievements: [{
      point: [String]
    }],
    hobbies: [{
      point: [String]
    }],
    customSections: [{
      title: String,
      items: [String]
    }]
  },
  skillsGroups: [{
    name: String,
    skills: [String]
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ResumeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Resume", ResumeSchema);

