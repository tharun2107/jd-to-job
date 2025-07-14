import React, { useState } from 'react';
import axios from 'axios';
import ResultBox from './ResumeBox';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!file || !jdText) {
  //     alert("Please upload a resume and enter a Job Description.");
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append("resume", file);
  //   formData.append("job_description", jdText);

  //   setLoading(true);
  //   try {
  //     console.log("Sending file:", file.name);
  //     console.log("Job Description:", jdText);
  //     const res = await axios.post("http://localhost:5001/api/analyze", formData);
  //     setResult(res.data);
  //     console.log("Response from backend:", res.data);
  //   } catch (err) {
  //     console.error(err);
  //     console.error("Error response:", err.response);
  //     alert("Something went wrong. Try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!file || !jdText) {
    alert("Please upload a resume and enter a Job Description.");
    return;
  }

  const formData = new FormData();
  formData.append("resume", file);
  formData.append("job_description", jdText);

  const token = localStorage.getItem('token'); // 🔐 JWT from login
console.log("token:", token);
  setLoading(true);
  try {
    const res = await axios.post("http://localhost:5001/api/analyze", formData, {
      headers: {
        "Authorization": `Bearer ${token}`, // 🔐 Secure the request
        "Content-Type": "multipart/form-data"
      }
    });
    setResult(res.data);
    console.log("Response from backend:", res.data);
  } catch (err) {
    console.error("Error:", err);
    alert("Something went wrong.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Resume + JD Analyzer</h2>
      <form onSubmit={handleSubmit}>
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
        <button type="submit" className="btn btn-primary w-100">
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      </form>

      {result && <ResultBox result={result} />}
    </div>
  );
};

export default ResumeUpload;
