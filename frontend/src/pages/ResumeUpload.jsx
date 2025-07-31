import React, { useState } from 'react';
import axios from 'axios';
import ResultBox from './ResumeBox';
import Lottie from 'lottie-react';
import uploadAnimation from '../assets/tech-parallex.json';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Upload, FileText, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-gray-900/80 border border-blue-800 rounded-2xl shadow-2xl">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
                <Brain className="h-8 w-8" />
                Resume + JD Analyzer
              </CardTitle>
              <p className="text-gray-400 mt-2">Upload your resume and job description for AI-powered analysis</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="resume" className="text-blue-200 font-semibold flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Resume (PDF, DOCX, TXT)
                  </Label>
                  <Input
                    id="resume"
                    type="file"
                    accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,text/plain"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="bg-gray-800 border-blue-700 text-blue-200 file:bg-blue-600 file:border-0 file:text-white file:rounded-md file:px-4 file:py-2 file:mr-4 file:hover:bg-blue-700 file:transition-colors"
                  />
                  {file && (
                    <p className="text-sm text-green-400 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Selected: {file.name}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="jd" className="text-blue-200 font-semibold">
                    Job Description
                  </Label>
                  <Textarea
                    id="jd"
                    rows={6}
                    placeholder="Paste job description here..."
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    className="bg-gray-800 border-blue-700 text-blue-200 placeholder:text-gray-500 resize-none"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Analyzing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Analyze Resume
                    </div>
                  )}
                </Button>
              </form>
              
              {loading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-8"
                >
                  <div className="w-48 h-48">
                    <Lottie animationData={uploadAnimation} />
                  </div>
                  <p className="text-blue-300 text-lg font-medium mt-4">Analyzing your resume...</p>
                  <p className="text-gray-400 text-sm mt-2">This may take a few moments</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
          >
            <ResultBox result={result} />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;
