import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import '../styles/atsanalysis.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const getToken = () => localStorage.getItem('token');

const AtsAnalysis = () => {
  const [jds, setJds] = useState([]);
  const [analyses, setAnalyses] = useState({}); // { jdId: [transactions] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingFor, setUploadingFor] = useState(null); // jdId
  const [file, setFile] = useState(null);
  const [expandedJD, setExpandedJD] = useState({}); // { jdId: true/false }
  const [modalTx, setModalTx] = useState(null); // transaction for modal

  useEffect(() => {
    const fetchJDsAndAnalyses = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        // 1. Fetch all JDs for the user
        const jdRes = await axios.get('http://localhost:5001/api/jds', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJds(jdRes.data);
        // 2. For each JD, fetch all analyses
        const analysesObj = {};
        for (const jd of jdRes.data) {
          const txRes = await axios.get(`http://localhost:5001/api/transactions?jdId=${jd._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          analysesObj[jd._id] = txRes.data;
        }
        setAnalyses(analysesObj);
      } catch (err) {
        setError('Failed to load ATS analysis history.');
      } finally {
        setLoading(false);
      }
    };
    fetchJDsAndAnalyses();
  }, []);

  const handleUpload = async (jdId, e) => {
    e.preventDefault();
    if (!file) {
      toast.warn('Please upload a file.');
      return;
    }
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('job_description', jds.find(jd => jd._id === jdId).jdText);
    setUploadingFor(jdId);
    try {
      const token = getToken();
      await axios.post('http://localhost:5001/api/analyze', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      // Refresh analyses for this JD
      const txRes = await axios.get(`http://localhost:5001/api/transactions?jdId=${jdId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalyses(a => ({ ...a, [jdId]: txRes.data }));
      setFile(null);
      toast.success('Resume uploaded successfully!');
    } catch (err) {
      toast.error('Upload failed.');
    } finally {
      setUploadingFor(null);
    }
  };

  const toggleJD = (jdId) => {
    setExpandedJD(prev => ({ ...prev, [jdId]: !prev[jdId] }));
  };

  // Modal for resume analysis details
  const AnalysisModal = ({ tx, onClose }) => {
    if (!tx) return null;
    const ats = tx.ats || {};
    return (
      <div className="atsanalysis-modal-overlay" onClick={onClose}>
        <div className="atsanalysis-modal" onClick={e => e.stopPropagation()}>
          <button className="atsanalysis-modal-close" onClick={onClose}>&times;</button>
          <h4 className="atsanalysis-modal-title">Resume Analysis Details</h4>
          <div className="atsanalysis-modal-section">
            <h6>JD Skills</h6>
            <div className="atsanalysis-badges">
              {(ats.jdSkills || []).map((skill, i) => (
                <span key={i} className="badge badge-jd">{skill}</span>
              ))}
            </div>
          </div>
          <div className="atsanalysis-modal-section">
            <h6>Resume Skills</h6>
            <div className="atsanalysis-badges">
              {(ats.resumeSkills || []).map((skill, i) => (
                <span key={i} className="badge badge-resume">{skill}</span>
              ))}
            </div>
          </div>
          <div className="atsanalysis-modal-section">
            <h6>Matched Skills</h6>
            <div className="atsanalysis-badges">
              {(ats.matchedSkills || []).length ? (ats.matchedSkills || []).map((skill, i) => (
                <span key={i} className="badge badge-matched">{skill}</span>
              )) : <span className="text-muted">None</span>}
            </div>
          </div>
          <div className="atsanalysis-modal-section">
            <h6>Missing Skills</h6>
            <div className="atsanalysis-badges">
              {(ats.missingSkills || []).length ? (ats.missingSkills || []).map((skill, i) => (
                <span key={i} className="badge badge-missing">{skill}</span>
              )) : <span className="text-muted">None</span>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="atsanalysis-root"><div className="atsanalysis-loading">Loading...</div></div>;
  if (error) return <div className="atsanalysis-root"><div className="atsanalysis-error">{error}</div></div>;

  return (
    <div className="atsanalysis-root">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <h2 className="atsanalysis-title">ATS Analysis History</h2>
      {jds.length === 0 && <div className="atsanalysis-empty">No job descriptions found. Upload a resume to get started!</div>}
      {jds.map(jd => (
        <div className="atsanalysis-jd-card" key={jd._id}>
          <div className="atsanalysis-jd-header">
            <h4 className="atsanalysis-jd-title">JD: <span>{expandedJD[jd._id] ? jd.jdText : jd.jdText.slice(0, 150)}{jd.jdText.length > 150 && !expandedJD[jd._id] ? '...' : ''}</span></h4>
            <button className="atsanalysis-jd-expand" onClick={() => toggleJD(jd._id)}>
              {expandedJD[jd._id] ? 'Show Less' : 'View Full JD'}
            </button>
            <span className="atsanalysis-jd-date">Created: {new Date(jd.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="atsanalysis-upload-form">
            <form onSubmit={e => handleUpload(jd._id, e)}>
              <input type="file" accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,text/plain" onChange={e => setFile(e.target.files[0])} />
              <button type="submit" className="btn btn-primary" disabled={uploadingFor === jd._id}>
                {uploadingFor === jd._id ? 'Uploading...' : 'Upload New Resume'}
              </button>
            </form>
          </div>
          <div className="atsanalysis-analyses-list">
            <div className="atsanalysis-bargraph-container">
              <h5>Resume Uploads & ATS Scores</h5>
              <div className="atsanalysis-bargraph">
                {analyses[jd._id]?.length ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={analyses[jd._id].map((tx, i) => ({
                      name: tx.resumeMeta?.filename || `Resume ${i + 1}`,
                      score: tx.ats?.score || 0,
                      date: new Date(tx.resumeMeta?.uploadedAt || tx.createdAt).toLocaleDateString()
                    }))} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="score" fill="#0d6efd" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="atsanalysis-empty">No resume uploads for this JD yet.</div>}
              </div>
              <ul className="atsanalysis-analyses-ul">
                {analyses[jd._id]?.map((tx, i) => (
                  <li key={tx._id} className="atsanalysis-analysis-item">
                    <span className="atsanalysis-analysis-filename">{tx.resumeMeta?.filename || `Resume ${i + 1}`}</span>
                    <span className="atsanalysis-analysis-score">Score: <b>{tx.ats?.score ?? 'N/A'}%</b></span>
                    <span className="atsanalysis-analysis-date">{new Date(tx.resumeMeta?.uploadedAt || tx.createdAt).toLocaleString()}</span>
                    <button className="atsanalysis-analysis-details" onClick={() => setModalTx(tx)}>View Details</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
      <AnalysisModal tx={modalTx} onClose={() => setModalTx(null)} />
    </div>
  );
};

export default AtsAnalysis; 