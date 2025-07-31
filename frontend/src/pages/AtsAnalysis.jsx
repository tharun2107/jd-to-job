import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Separator } from '../components/ui/separator';
import {
  BarChart3,
  FileText,
  Upload,
  Eye,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Target,
  Clock,
  FileUp,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      <Dialog open={!!tx} onOpenChange={() => onClose()}>
        <DialogContent className="bg-gray-900 border-blue-800 max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-300 flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Resume Analysis Details
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-3">
              <h6 className="text-lg font-semibold text-blue-200 flex items-center gap-2">
                <Target className="h-5 w-5" />
                JD Skills
              </h6>
              <div className="flex flex-wrap gap-2">
                {(ats.jdSkills || []).map((skill, i) => (
                  <Badge key={i} className="bg-blue-600 text-white hover:bg-blue-700">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator className="bg-blue-800" />

            <div className="space-y-3">
              <h6 className="text-lg font-semibold text-purple-200 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resume Skills
              </h6>
              <div className="flex flex-wrap gap-2">
                {(ats.resumeSkills || []).map((skill, i) => (
                  <Badge key={i} className="bg-purple-600 text-white hover:bg-purple-700">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator className="bg-blue-800" />

            <div className="space-y-3">
              <h6 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Matched Skills
              </h6>
              <div className="flex flex-wrap gap-2">
                {(ats.matchedSkills || []).length ? (ats.matchedSkills || []).map((skill, i) => (
                  <Badge key={i} className="bg-green-600 text-white hover:bg-green-700">
                    {skill}
                  </Badge>
                )) : <span className="text-gray-400 italic">None</span>}
              </div>
            </div>

            <Separator className="bg-blue-800" />

            <div className="space-y-3">
              <h6 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Missing Skills
              </h6>
              <div className="flex flex-wrap gap-2">
                {(ats.missingSkills || []).length ? (ats.missingSkills || []).map((skill, i) => (
                  <Badge key={i} className="bg-red-600 text-white hover:bg-red-700">
                    {skill}
                  </Badge>
                )) : <span className="text-gray-400 italic">None</span>}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
        <p className="text-blue-200 text-lg">Loading ATS Analysis...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950 flex items-center justify-center">
      <div className="text-center">
        <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-200 text-lg">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <BarChart3 className="h-10 w-10" />
            ATS Analysis History
          </h2>
        </motion.div>

        {jds.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No job descriptions found. Upload a resume to get started!</p>
          </motion.div>
        )}

        <AnimatePresence>
          {jds.map((jd, index) => (
            <motion.div
              key={jd._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-gray-900/80 border border-blue-800 rounded-2xl shadow-2xl">
                <CardHeader className="pb-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-blue-300 mb-2">
                        Job Description
                      </CardTitle>
                      <p className="text-blue-200 leading-relaxed">
                        {expandedJD[jd._id] ? jd.jdText : jd.jdText.slice(0, 150)}
                        {jd.jdText.length > 150 && !expandedJD[jd._id] ? '...' : ''}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        onClick={() => toggleJD(jd._id)}
                        className="border-blue-600 text-blue-300 hover:bg-blue-600 hover:text-white"
                      >
                        {expandedJD[jd._id] ? 'Show Less' : 'View Full JD'}
                      </Button>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar className="h-4 w-4" />
                        {new Date(jd.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Upload Form */}
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <form onSubmit={e => handleUpload(jd._id, e)} className="flex flex-col sm:flex-row gap-4 items-end">
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,text/plain"
                          onChange={e => setFile(e.target.files[0])}
                          className="bg-gray-800 border-blue-700 text-blue-200 file:bg-blue-600 file:border-0 file:text-white file:rounded-md file:px-4 file:py-2 file:mr-4 file:hover:bg-blue-700 file:transition-colors"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={uploadingFor === jd._id}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {uploadingFor === jd._id ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Upload New Resume
                          </div>
                        )}
                      </Button>
                    </form>
                  </div>

                  {/* Chart and Analysis List */}
                  <div className="space-y-6">
                    <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
                      <h5 className="text-lg font-semibold text-blue-200 mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Resume Uploads & ATS Scores
                      </h5>

                      {analyses[jd._id]?.length ? (
                        <div className="space-y-6">
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={analyses[jd._id].map((tx, i) => ({
                                name: tx.resumeMeta?.filename || `Resume ${i + 1}`,
                                score: tx.ats?.score || 0,
                                date: new Date(tx.resumeMeta?.uploadedAt || tx.createdAt).toLocaleDateString()
                              }))} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                <YAxis domain={[0, 100]} stroke="#9CA3AF" />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                    color: '#F3F4F6'
                                  }}
                                />
                                <Legend />
                                <Bar dataKey="score" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          <Separator className="bg-gray-700" />

                          <div className="space-y-3">
                            <h6 className="text-md font-semibold text-gray-300">Analysis History</h6>
                            <div className="space-y-2">
                              {analyses[jd._id]?.map((tx, i) => (
                                <motion.div
                                  key={tx._id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.1 }}
                                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-800/50 rounded-lg p-3 border border-gray-700 hover:bg-gray-800/70 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-blue-400" />
                                    <span className="text-blue-200 font-medium">
                                      {tx.resumeMeta?.filename || `Resume ${i + 1}`}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-400">Score:</span>
                                      <span className="font-bold text-blue-400">{tx.ats?.score ?? 'N/A'}%</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-400">
                                      <Clock className="h-3 w-3" />
                                      {new Date(tx.resumeMeta?.uploadedAt || tx.createdAt).toLocaleString()}
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setModalTx(tx)}
                                      className="border-blue-600 text-blue-300 hover:bg-blue-600 hover:text-white"
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      Details
                                    </Button>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-400">No resume uploads for this JD yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnalysisModal tx={modalTx} onClose={() => setModalTx(null)} />
    </div>
  );
};

export default AtsAnalysis; 