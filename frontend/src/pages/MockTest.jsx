import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const MockTest = () => {
  const [jds, setJds] = useState([]);
  const [selectedJd, setSelectedJd] = useState(null);
  const [examConfig, setExamConfig] = useState({
    numberOfQuestions: 15,
    experienceLevel: 'fresher'
  });
  const [currentTest, setCurrentTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [showAttempts, setShowAttempts] = useState(false);

  // Timer effect
  useEffect(() => {
    let timer;
    if (examStarted && timeLeft > 0 && !examCompleted) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, timeLeft, examCompleted]);

  // Fetch JDs on component mount
  useEffect(() => {
    fetchJDs();
    fetchAttempts();
  }, []);

  const fetchJDs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/jds', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJds(response.data.jds);
    } catch (error) {
      console.error('Error fetching JDs:', error);
    }
  };

  const fetchAttempts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/mocktest/attempts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttempts(response.data.attempts);
    } catch (error) {
      console.error('Error fetching attempts:', error);
    }
  };

  const handleStartExam = async () => {
    if (!selectedJd) {
      alert('Please select a Job Description');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/mocktest/create', {
        jdId: selectedJd._id,
        numberOfQuestions: examConfig.numberOfQuestions,
        experienceLevel: examConfig.experienceLevel
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { mockTest } = response.data;
      setCurrentTest(mockTest);
      setTimeLeft(mockTest.examConfig.timeLimit * 60); // Convert to seconds
      setAnswers(new Array(mockTest.questions.length).fill(null));
      setExamStarted(true);
      setCurrentQuestion(0);
    } catch (error) {
      console.error('Error starting exam:', error);
      alert('Failed to start exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = { selectedOption: optionIndex };
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < currentTest.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitExam = async () => {
    if (answers.some(answer => answer === null)) {
      const confirmed = window.confirm('Some questions are unanswered. Do you want to submit anyway?');
      if (!confirmed) return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/mocktest/submit', {
        mockTestId: currentTest.id,
        answers: answers.map((answer, index) => ({
          questionIndex: index,
          selectedOption: answer ? answer.selectedOption : 0
        }))
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setResult(response.data.result);
      setExamCompleted(true);
      fetchAttempts(); // Refresh attempts list
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Failed to submit exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!currentTest) return 0;
    return ((currentQuestion + 1) / currentTest.questions.length) * 100;
  };

  const getAnsweredCount = () => {
    return answers.filter(answer => answer !== null).length;
  };

  if (examCompleted && result) {
    return (
      <div className="mocktest-root" style={{ maxWidth: 1200, margin: '0 auto', padding: 32, marginTop: 80, background: 'linear-gradient(135deg, #e3f2fd 0%, #f6f8fa 100%)', minHeight: '100vh', borderRadius: 24 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 32, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
        >
          <h2 style={{ textAlign: 'center', color: '#0d47a1', fontWeight: 900, fontSize: 32, marginBottom: 24 }}>Exam Results</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
            <div style={{ background: 'linear-gradient(135deg, #4caf50, #66bb6a)', color: 'white', padding: 24, borderRadius: 16, textAlign: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Score</h3>
              <div style={{ fontSize: 48, fontWeight: 900 }}>{result.totalScore}/{currentTest.questions.length}</div>
              <div style={{ fontSize: 20, opacity: 0.9 }}>{result.percentage.toFixed(1)}%</div>
            </div>
            
            <div style={{ background: 'linear-gradient(135deg, #2196f3, #42a5f5)', color: 'white', padding: 24, borderRadius: 16, textAlign: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Time Taken</h3>
              <div style={{ fontSize: 32, fontWeight: 900 }}>{result.timeTaken} min</div>
              <div style={{ fontSize: 16, opacity: 0.9 }}>out of {currentTest.examConfig.timeLimit} min</div>
            </div>
          </div>

          <div style={{ background: '#f5f5f5', padding: 20, borderRadius: 12, marginBottom: 24 }}>
            <h3 style={{ color: '#0d47a1', marginBottom: 16 }}>Overall Feedback</h3>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: '#333' }}>{result.overallFeedback}</p>
          </div>

          {result.areasToImprove.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ color: '#0d47a1', marginBottom: 16 }}>Areas to Improve</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {result.areasToImprove.map((area, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={{ background: '#fff3cd', border: '1px solid #ffeaa7', padding: 12, marginBottom: 8, borderRadius: 8, color: '#856404' }}
                  >
                    • {area}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <button
              onClick={() => {
                setExamCompleted(false);
                setResult(null);
                setCurrentTest(null);
                setSelectedJd(null);
              }}
              style={{ background: '#1976d2', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 16, fontWeight: 600 }}
            >
              Take Another Test
            </button>
            <button
              onClick={() => setShowAttempts(true)}
              style={{ background: '#4caf50', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 16, fontWeight: 600 }}
            >
              View All Attempts
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showAttempts) {
    return (
      <div className="mocktest-root" style={{ maxWidth: 1200, margin: '0 auto', padding: 32, marginTop: 80, background: 'linear-gradient(135deg, #e3f2fd 0%, #f6f8fa 100%)', minHeight: '100vh', borderRadius: 24 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <h2 style={{ color: '#0d47a1', fontWeight: 900, fontSize: 32 }}>Mock Test History</h2>
            <button
              onClick={() => setShowAttempts(false)}
              style={{ background: '#1976d2', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 16, fontWeight: 600 }}
            >
              Take New Test
            </button>
          </div>

          {attempts.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', fontSize: 18 }}>No test attempts found.</div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {attempts.map((attempt, index) => (
                <motion.div
                  key={attempt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{ background: 'rgba(255,255,255,0.9)', padding: 20, borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ color: '#0d47a1', margin: 0, fontSize: 18 }}>Test #{attempts.length - index}</h3>
                    <span style={{ background: attempt.evaluation.percentage >= 70 ? '#4caf50' : attempt.evaluation.percentage >= 50 ? '#ff9800' : '#f44336', color: 'white', padding: '4px 12px', borderRadius: 12, fontSize: 14 }}>
                      {attempt.evaluation.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <p style={{ color: '#666', marginBottom: 8, fontSize: 14 }}>{attempt.jdText.slice(0, 100)}...</p>
                  <div style={{ display: 'flex', gap: 16, fontSize: 14, color: '#666' }}>
                    <span>Questions: {attempt.examConfig.numberOfQuestions}</span>
                    <span>Level: {attempt.examConfig.experienceLevel}</span>
                    <span>Time: {attempt.timeTaken}min</span>
                    <span>Date: {new Date(attempt.startTime).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  if (examStarted && currentTest) {
    return (
      <div className="mocktest-root" style={{ maxWidth: 1000, margin: '0 auto', padding: 24, marginTop: 80, background: 'linear-gradient(135deg, #e3f2fd 0%, #f6f8fa 100%)', minHeight: '100vh', borderRadius: 24 }}>
        {/* Header with timer and progress */}
        <div style={{ background: 'rgba(255,255,255,0.9)', padding: 20, borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ color: '#0d47a1', margin: 0, fontWeight: 700 }}>Mock Test</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ background: timeLeft < 300 ? '#f44336' : '#4caf50', color: 'white', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 18 }}>
                {formatTime(timeLeft)}
              </div>
              <button
                onClick={handleSubmitExam}
                style={{ background: '#f44336', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
              >
                Submit
              </button>
            </div>
          </div>
          
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 14, color: '#666' }}>Progress</span>
              <span style={{ fontSize: 14, color: '#666' }}>{getAnsweredCount()}/{currentTest.questions.length} answered</span>
            </div>
            <div style={{ background: '#e0e0e0', borderRadius: 8, height: 8 }}>
              <div style={{ background: '#4caf50', height: '100%', borderRadius: 8, width: `${getProgressPercentage()}%`, transition: 'width 0.3s' }}></div>
            </div>
          </div>
        </div>

        {/* Question */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          style={{ background: 'rgba(255,255,255,0.9)', padding: 32, borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
        >
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '4px 12px', borderRadius: 12, fontSize: 14, fontWeight: 600 }}>
                Question {currentQuestion + 1} of {currentTest.questions.length}
              </span>
              <span style={{ background: '#f3e5f5', color: '#7b1fa2', padding: '4px 12px', borderRadius: 12, fontSize: 14, fontWeight: 600 }}>
                {currentTest.questions[currentQuestion].skill}
              </span>
            </div>
            <h3 style={{ color: '#0d47a1', fontSize: 20, lineHeight: 1.5, margin: 0 }}>{currentTest.questions[currentQuestion].question}</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {currentTest.questions[currentQuestion].options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswerSelect(index)}
                style={{
                  background: answers[currentQuestion]?.selectedOption === index ? '#e3f2fd' : 'white',
                  border: answers[currentQuestion]?.selectedOption === index ? '2px solid #1976d2' : '2px solid #e0e0e0',
                  padding: '16px 20px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 16,
                  transition: 'all 0.2s',
                  color: '#333'
                }}
              >
                <span style={{ fontWeight: 600, marginRight: 12 }}>{String.fromCharCode(65 + index)}.</span>
                {option}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestion === 0}
            style={{
              background: currentQuestion === 0 ? '#ccc' : '#1976d2',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 8,
              cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
              fontSize: 16,
              fontWeight: 600
            }}
          >
            Previous
          </button>
          
          <div style={{ display: 'flex', gap: 8 }}>
            {currentTest.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                style={{
                  background: answers[index] ? '#4caf50' : currentQuestion === index ? '#1976d2' : '#e0e0e0',
                  color: answers[index] || currentQuestion === index ? 'white' : '#666',
                  border: 'none',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={handleNextQuestion}
            disabled={currentQuestion === currentTest.questions.length - 1}
            style={{
              background: currentQuestion === currentTest.questions.length - 1 ? '#ccc' : '#1976d2',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 8,
              cursor: currentQuestion === currentTest.questions.length - 1 ? 'not-allowed' : 'pointer',
              fontSize: 16,
              fontWeight: 600
            }}
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mocktest-root" style={{ maxWidth: 1000, margin: '0 auto', padding: 32, marginTop: 80, background: 'linear-gradient(135deg, #e3f2fd 0%, #f6f8fa 100%)', minHeight: '100vh', borderRadius: 24 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 style={{ textAlign: 'center', color: '#0d47a1', fontWeight: 900, fontSize: 36, marginBottom: 32 }}>Mock Test</h2>

        {/* JD Selection */}
        <div style={{ background: 'rgba(255,255,255,0.9)', padding: 24, borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#0d47a1', marginBottom: 16, fontWeight: 700 }}>Select Job Description</h3>
          {jds.length === 0 ? (
            <div style={{ color: '#666', textAlign: 'center', padding: 20 }}>No job descriptions found. Upload a JD to get started!</div>
          ) : (
            <div style={{ position: 'relative' }}>
              <select
                value={selectedJd ? selectedJd._id : ''}
                onChange={(e) => {
                  const jd = jds.find(j => j._id === e.target.value);
                  setSelectedJd(jd);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '2px solid #e0e0e0',
                  fontSize: 16,
                  background: 'white'
                }}
              >
                <option value="">-- Select a Job Description --</option>
                {jds.map(jd => (
                  <option key={jd._id} value={jd._id}>
                    {jd.jdText.slice(0, 80)}...
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Exam Configuration */}
        <div style={{ background: 'rgba(255,255,255,0.9)', padding: 24, borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#0d47a1', marginBottom: 16, fontWeight: 700 }}>Exam Configuration</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Number of Questions</label>
              <select
                value={examConfig.numberOfQuestions}
                onChange={(e) => setExamConfig({ ...examConfig, numberOfQuestions: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 8,
                  border: '2px solid #e0e0e0',
                  fontSize: 16
                }}
              >
                <option value={15}>15 Questions (20 min)</option>
                <option value={20}>20 Questions (30 min)</option>
                <option value={30}>30 Questions (45 min)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Experience Level</label>
              <select
                value={examConfig.experienceLevel}
                onChange={(e) => setExamConfig({ ...examConfig, experienceLevel: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 8,
                  border: '2px solid #e0e0e0',
                  fontSize: 16
                }}
              >
                <option value="fresher">Fresher</option>
                <option value="2-4 years">2-4 Years</option>
                <option value="5+ years">5+ Years</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <button
            onClick={handleStartExam}
            disabled={!selectedJd || loading}
            style={{
              background: !selectedJd || loading ? '#ccc' : '#4caf50',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: 8,
              cursor: !selectedJd || loading ? 'not-allowed' : 'pointer',
              fontSize: 18,
              fontWeight: 700
            }}
          >
            {loading ? 'Starting Exam...' : 'Start Exam'}
          </button>
          
          <button
            onClick={() => setShowAttempts(true)}
            style={{
              background: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 18,
              fontWeight: 700
            }}
          >
            View History
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MockTest; 