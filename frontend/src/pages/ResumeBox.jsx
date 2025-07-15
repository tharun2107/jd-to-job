import React from 'react';
import '../styles/resumeupload.css';

const SkillGroup = ({ title, skills }) => (
  <div className="mb-3">
    <h6>{title}</h6>
    <div>
      {(skills || []).map((skill, index) => (
        <span key={index} className="badge bg-secondary me-2 mb-1">{skill}</span>
      ))}
    </div>
  </div>
);

const ResultBox = ({ result }) => {
  if (!result) return null;

  return (
    <div className="result-box-animated card mt-5">
      <div className="card-header">
        <h5 className="mb-0">Skill Match Report</h5>
      </div>
      <div className="card-body">
        <p><strong>Score:</strong> {result.score ?? 'N/A'}%</p>
        <h6 className="mt-4">Matched Skills</h6>
        {result.matchedSkills?.length || result.matched_skills?.length ? (
          (result.matchedSkills || result.matched_skills).map((skill, i) => (
            <span key={i} className="badge bg-success me-2 mb-1">{skill}</span>
          ))
        ) : (
          <p className="text-muted">No matched skills found</p>
        )}
        <h6 className="mt-4">Missing Skills</h6>
        {result.missingSkills?.length || result.missing_skills?.length ? (
          (result.missingSkills || result.missing_skills).map((skill, i) => (
            <span key={i} className="badge bg-danger me-2 mb-1">{skill}</span>
          ))
        ) : (
          <p className="text-muted">No missing skills</p>
        )}
        <h5 className="mt-4">Grouped Resume Skills</h5>
        {result.groupedResumeSkills || result.grouped_resume_skills
          ? Object.entries(result.groupedResumeSkills || result.grouped_resume_skills).map(([section, groups], index) => (
            <div key={index} className="mb-3">
              <h6 className="text-primary">{section}</h6>
              {groups && Object.entries(groups).map(([groupName, skills], i) => (
                <SkillGroup key={i} title={groupName} skills={skills} />
              ))}
            </div>
          ))
          : <p className="text-muted">No grouped skills available</p>
        }
        {/* Feedback and Resume Meta */}
        {(result.feedback || result.feedback) && (
          <div className="mt-4">
            <h6 className="text-info">Feedback</h6>
            <p>{result.feedback}</p>
          </div>
        )}
        {(result.resumeMeta || result.resume_meta) && (
          <div className="mt-3">
            <h6 className="text-secondary">Resume Info</h6>
            <p><strong>Filename:</strong> {(result.resumeMeta?.filename || result.resume_meta?.filename) ?? 'N/A'}</p>
            <p><strong>Uploaded At:</strong> {result.resumeMeta?.uploadedAt ? new Date(result.resumeMeta.uploadedAt).toLocaleString() : (result.resume_meta?.uploadedAt ? new Date(result.resume_meta.uploadedAt).toLocaleString() : 'N/A')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultBox;
