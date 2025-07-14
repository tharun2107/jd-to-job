import React, { useState } from 'react';
import axios from 'axios';
import ResultBox from './ResumeBox';
import Lottie from 'lottie-react';
import uploadAnimation from '../assets/tech-parallex.json'; // Use your own or a new Lottie JSON for upload
import '../styles/resumeupload.css';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !jdText) {
      alert("Please upload a resume and enter a Job Description.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("job_description", jdText);

    const token = localStorage.getItem('token');
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post("http://localhost:5001/api/analyze", formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setResult(res.data);
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-upload-root">
      <div className="resume-upload-card">
        <h2 className="resume-upload-title">Resume + JD Analyzer</h2>
        <form onSubmit={handleSubmit} className="resume-upload-form">
          <div className="mb-3">
            <label className="form-label">Upload Resume (PDF)</label>
            <input type="file" className="form-control" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
          </div>
          <div className="mb-3">
            <label className="form-label">Job Description</label>
            <textarea
              className="form-control"
              rows="6"
              placeholder="Paste job description here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze Resume'}
          </button>
        </form>
        {loading && (
          <div className="resume-upload-lottie">
            <Lottie animationData={uploadAnimation} style={{ height: 180 }} />
            <p className="text-center mt-2">Analyzing your resume...</p>
          </div>
        )}
        {result && <ResultBox result={result} />}
      </div>
    </div>
  );
};

export default ResumeUpload;
