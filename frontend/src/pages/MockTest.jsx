import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MockTest = () => {
  const [currentView, setCurrentView] = useState('main'); // main, history, config, exam, results
  const [jds, setJds] = useState([]);
  const [selectedJd, setSelectedJd] = useState(null);
  const [loadingJds, setLoadingJds] = useState(false);
  const [jdError, setJdError] = useState(null);

  // Exam configuration states
  const [questionCount, setQuestionCount] = useState(15);
  const [loadingExam, setLoadingExam] = useState(false);
  const [examError, setExamError] = useState(null);

  // Exam states
  const [currentExam, setCurrentExam] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);

  // Time limits for different question counts
  const TIME_LIMITS = {
    15: 20, // 20 minutes for 15 questions
    20: 30, // 30 minutes for 20 questions
    30: 45  // 45 minutes for 30 questions
  };

  useEffect(() => {
    if (currentView === 'main') {
      fetchJDs();
    }
    // eslint-disable-next-line
  }, [currentView]);

  // Timer effect for exam
  useEffect(() => {
    let timer;
    if (examStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up - auto submit
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, timeLeft]);

  const fetchJDs = async () => {
    setLoadingJds(true);
    setJdError(null);
    setJds([]);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/jds', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('API Response:', response.data);
      const jdsArray = Array.isArray(response.data) ? response.data : [];
      console.log('JDs Array:', jdsArray);
      setJds(jdsArray);
    } catch (error) {
      console.error('Error fetching JDs:', error);
      setJdError('Failed to load job descriptions. Please login again.');
    } finally {
      setLoadingJds(false);
    }
  };

  const handleStartAssessment = () => {
    if (selectedJd) {
      setCurrentView('config');
    }
  };

  const handleCreateExam = async () => {
    if (!selectedJd) return;

    setLoadingExam(true);
    setExamError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5001/api/mocktest/create', {
        jdId: selectedJd._id,
        numberOfQuestions: questionCount,
        timeLimit: TIME_LIMITS[questionCount]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Exam created:', response.data);

      // Set up the exam
      const examData = response.data.mockTest;
      setCurrentExam(examData);
      setUserAnswers(new Array(examData.questions.length).fill(null));
      setTimeLeft(TIME_LIMITS[questionCount] * 60); // Convert to seconds
      setCurrentQuestionIndex(0);
      setExamStarted(true);
      setCurrentView('exam');

    } catch (error) {
      console.error('Error creating exam:', error);
      setExamError(error.response?.data?.message || 'Failed to create assessment. Please try again.');
    } finally {
      setLoadingExam(false);
    }
  };

  const handleAnswerSelect = (selectedOption) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = selectedOption;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentExam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitExam = async () => {
    if (!currentExam) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5001/api/mocktest/submit', {
        mockTestId: currentExam.id,
        answers: userAnswers.map((answer, index) => ({
          questionIndex: index,
          selectedOption: answer || 0
        }))
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Exam submitted:', response.data);
      setCurrentView('results');
      // You can store the results in state if needed

    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Failed to submit exam. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  console.log('Render - JDs:', jds, 'Selected JD:', selectedJd);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      padding: '20px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{
        maxWidth: 1000,
        margin: '0 auto',
        background: '#ffffff',
        borderRadius: 16,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '40px 32px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: 42,
            fontWeight: 800,
            margin: 0,
            marginBottom: 12,
            letterSpacing: '-0.02em'
          }}>
            Mock Assessment
          </h1>
          <p style={{
            fontSize: 18,
            opacity: 0.9,
            margin: 0,
            fontWeight: 400
          }}>
            Practice with AI-generated questions based on your job descriptions
          </p>
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <button
            onClick={() => setCurrentView('main')}
            style={{
              flex: 1,
              background: currentView === 'main' ? '#667eea' : 'transparent',
              color: currentView === 'main' ? 'white' : '#64748b',
              border: 'none',
              padding: '20px 24px',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              borderBottom: currentView === 'main' ? '3px solid #4f46e5' : 'none'
            }}
          >
            Take Assessment
          </button>
          <button
            onClick={() => setCurrentView('history')}
            style={{
              flex: 1,
              background: currentView === 'history' ? '#667eea' : 'transparent',
              color: currentView === 'history' ? 'white' : '#64748b',
              border: 'none',
              padding: '20px 24px',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              borderBottom: currentView === 'history' ? '3px solid #4f46e5' : 'none'
            }}
          >
            Assessment History
          </button>
        </div>

        {/* Main Content */}
        <div style={{ padding: '40px 32px' }}>
          {currentView === 'main' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <h2 style={{
                  color: '#1e293b',
                  fontSize: 28,
                  fontWeight: 700,
                  marginBottom: 16
                }}>
                  Welcome to Your Assessment
                </h2>
                <p style={{
                  color: '#64748b',
                  fontSize: 16,
                  lineHeight: 1.6,
                  maxWidth: 600,
                  margin: '0 auto'
                }}>
                  Select a job description and configure your assessment to start practicing with AI-generated questions.
                </p>
              </div>

              {/* How it works */}
              <div style={{
                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                padding: 32,
                borderRadius: 12,
                marginBottom: 40,
                border: '1px solid #cbd5e1'
              }}>
                <h3 style={{
                  color: '#1e293b',
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <span style={{
                    background: '#667eea',
                    color: 'white',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 700
                  }}>
                    ℹ
                  </span>
                  How the Assessment Works
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: 20
                }}>
                  {[
                    { step: '1', title: 'Select JD', desc: 'Choose from your existing job descriptions' },
                    { step: '2', title: 'Configure Test', desc: 'Select number of questions (15, 20, or 30)' },
                    { step: '3', title: 'Take Assessment', desc: 'Answer questions within the time limit' },
                    { step: '4', title: 'Get Feedback', desc: 'Receive detailed feedback and explanations' }
                  ].map(item => (
                    <div key={item.step} style={{
                      background: 'white',
                      padding: 20,
                      borderRadius: 8,
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{
                        background: '#667eea',
                        color: 'white',
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 700,
                        marginBottom: 12
                      }}>
                        {item.step}
                      </div>
                      <h4 style={{
                        color: '#1e293b',
                        fontSize: 16,
                        fontWeight: 600,
                        margin: '0 0 8px 0'
                      }}>
                        {item.title}
                      </h4>
                      <p style={{
                        color: '#64748b',
                        fontSize: 14,
                        margin: 0,
                        lineHeight: 1.5
                      }}>
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* JD Selection */}
              <div style={{
                background: 'white',
                padding: 32,
                borderRadius: 12,
                border: '2px solid #e2e8f0',
                marginBottom: 32
              }}>
                <h3 style={{
                  color: '#1e293b',
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <span style={{
                    background: '#10b981',
                    color: 'white',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 700
                  }}>
                    📋
                  </span>
                  Select Job Description
                </h3>

                {loadingJds ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 40,
                    color: '#667eea',
                    fontSize: 16,
                    fontWeight: 600
                  }}>
                    <div style={{
                      width: 20,
                      height: 20,
                      border: '2px solid #667eea',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginRight: 12
                    }}></div>
                    Loading job descriptions...
                  </div>
                ) : jdError ? (
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    padding: 16,
                    borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600
                    }}>
                      {jdError}
                    </div>
                  ) : jds.length === 0 ? (
                    <div style={{
                      background: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      color: '#0369a1',
                      padding: 20,
                      borderRadius: 8,
                      textAlign: 'center'
                    }}>
                      <p style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>
                        No job descriptions found
                      </p>
                      <p style={{ margin: 0, fontSize: 14, opacity: 0.8 }}>
                        Upload a job description first to get started with assessments.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <select
                        value={selectedJd ? selectedJd._id : ''}
                        onChange={e => {
                          const jd = jds.find(j => j._id === e.target.value);
                          setSelectedJd(jd);
                        }}
                        style={{
                          width: '100%',
                        padding: '16px 20px',
                        borderRadius: 8,
                        border: '2px solid #d1d5db',
                        fontSize: 16,
                              background: 'white',
                              color: '#374151',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              outline: 'none'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#667eea';
                              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#d1d5db';
                              e.target.style.boxShadow = 'none';
                            }}
                          >
                            <option value="" style={{ color: '#9ca3af' }}>
                              -- Select a Job Description --
                            </option>
                            {jds.map(jd => (
                        <option key={jd._id} value={jd._id} style={{ color: '#374151' }}>
                          {jd.jdText.slice(0, 80)}...
                        </option>
                      ))}
                          </select>

                          {selectedJd && (
                            <div style={{
                              background: '#f0f9ff',
                              border: '1px solid #bae6fd',
                              borderRadius: 8,
                              padding: 16,
                              marginTop: 16
                            }}>
                              <p style={{
                                margin: 0,
                                color: '#0369a1',
                                fontSize: 14,
                                fontWeight: 600
                              }}>
                                Selected: {selectedJd.jdText.slice(0, 60)}...
                              </p>
                            </div>
                          )}
                  </div>
                )}
              </div>

              {/* Start Test Button */}
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={handleStartAssessment}
                  style={{
                    background: selectedJd
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : '#d1d5db',
                    color: 'white',
                    border: 'none',
                    padding: '18px 48px',
                    borderRadius: 12,
                    cursor: selectedJd ? 'pointer' : 'not-allowed',
                    fontSize: 18,
                    fontWeight: 700,
                    transition: 'all 0.2s ease',
                    boxShadow: selectedJd ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                    transform: selectedJd ? 'translateY(0)' : 'none'
                  }}
                  disabled={!selectedJd}
                  onMouseEnter={(e) => {
                    if (selectedJd) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedJd) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                    }
                  }}
                >
                  {selectedJd ? 'Start Assessment' : 'Select a Job Description First'}
                </button>
              </div>
            </div>
          )}

          {/* Exam Configuration View */}
          {currentView === 'config' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <h2 style={{
                  color: '#1e293b',
                  fontSize: 28,
                  fontWeight: 700,
                  marginBottom: 16
                }}>
                  Configure Your Assessment
                </h2>
                <p style={{
                  color: '#64748b',
                  fontSize: 16,
                  lineHeight: 1.6,
                  maxWidth: 600,
                  margin: '0 auto'
                }}>
                  Choose your assessment settings and review the details before starting.
                </p>
              </div>

              {/* Selected JD Review */}
              <div style={{
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: 12,
                padding: 24,
                marginBottom: 32
              }}>
                <h3 style={{
                  color: '#0369a1',
                  fontSize: 18,
                  fontWeight: 600,
                  marginBottom: 12
                }}>
                  Selected Job Description
                </h3>
                <p style={{
                  color: '#0369a1',
                  fontSize: 14,
                  lineHeight: 1.5,
                  margin: 0
                }}>
                  {selectedJd?.jdText.slice(0, 120)}...
                </p>
              </div>

              {/* Question Count Selection */}
              <div style={{
                background: 'white',
                padding: 32,
                borderRadius: 12,
                border: '2px solid #e2e8f0',
                marginBottom: 32
              }}>
                <h3 style={{
                  color: '#1e293b',
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 24,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <span style={{
                    background: '#f59e0b',
                    color: 'white',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 700
                  }}>
                    ⚙️
                  </span>
                  Assessment Configuration
                </h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 20,
                  marginBottom: 24
                }}>
                  {[15, 20, 30].map(count => (
                    <div
                      key={count}
                      onClick={() => setQuestionCount(count)}
                      style={{
                        background: questionCount === count ? '#fef3c7' : '#f8fafc',
                        border: questionCount === count ? '2px solid #f59e0b' : '2px solid #e2e8f0',
                        borderRadius: 12,
                        padding: 24,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{
                        fontSize: 32,
                        fontWeight: 700,
                        color: questionCount === count ? '#d97706' : '#64748b',
                        marginBottom: 8
                      }}>
                        {count}
                      </div>
                      <div style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: questionCount === count ? '#d97706' : '#64748b',
                        marginBottom: 4
                      }}>
                        Questions
                      </div>
                      <div style={{
                        fontSize: 12,
                        color: questionCount === count ? '#92400e' : '#94a3b8'
                      }}>
                        {TIME_LIMITS[count]} minutes
                      </div>
                    </div>
                  ))}
                </div>

                {/* Assessment Summary */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: 20
                }}>
                  <h4 style={{
                    color: '#1e293b',
                    fontSize: 16,
                    fontWeight: 600,
                    marginBottom: 12
                  }}>
                    Assessment Summary
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: 16
                  }}>
                    <div>
                      <div style={{ color: '#64748b', fontSize: 12, fontWeight: 500 }}>Questions</div>
                      <div style={{ color: '#1e293b', fontSize: 18, fontWeight: 700 }}>{questionCount}</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: 12, fontWeight: 500 }}>Time Limit</div>
                      <div style={{ color: '#1e293b', fontSize: 18, fontWeight: 700 }}>{TIME_LIMITS[questionCount]} min</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: 12, fontWeight: 500 }}>Difficulty</div>
                      <div style={{ color: '#1e293b', fontSize: 18, fontWeight: 700 }}>Adaptive</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {examError && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: 16,
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 24,
                  textAlign: 'center'
                }}>
                  {examError}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: 16,
                justifyContent: 'center'
              }}>
                <button
                  onClick={() => setCurrentView('main')}
                  style={{
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: '2px solid #e2e8f0',
                    padding: '16px 32px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    fontSize: 16,
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handleCreateExam}
                  disabled={loadingExam}
                  style={{
                    background: loadingExam
                      ? '#d1d5db'
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '16px 32px',
                    borderRadius: 12,
                    cursor: loadingExam ? 'not-allowed' : 'pointer',
                    fontSize: 16,
                    fontWeight: 700,
                    transition: 'all 0.2s ease',
                    boxShadow: loadingExam ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  {loadingExam ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 16,
                        height: 16,
                        border: '2px solid white',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Creating Assessment...
                    </div>
                  ) : (
                    'Start Assessment'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Exam View */}
          {currentView === 'exam' && currentExam && (
            <div>
              {/* Exam Header */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: 20,
                marginBottom: 24,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h2 style={{
                    color: '#1e293b',
                    fontSize: 24,
                    fontWeight: 700,
                    margin: 0
                  }}>
                    Question {currentQuestionIndex + 1} of {currentExam.questions.length}
                  </h2>
                  <p style={{
                    color: '#64748b',
                    fontSize: 14,
                    margin: '4px 0 0 0'
                  }}>
                    Skill: {currentExam.questions[currentQuestionIndex]?.skill}
                  </p>
                </div>
                <div style={{
                  background: timeLeft < 300 ? '#ef4444' : '#10b981',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: 8,
                  fontSize: 18,
                  fontWeight: 700,
                  minWidth: 80,
                  textAlign: 'center'
                }}>
                  {formatTime(timeLeft)}
                </div>
              </div>

              {/* Question */}
              <div style={{
                background: 'white',
                border: '2px solid #e2e8f0',
                borderRadius: 12,
                padding: 32,
                marginBottom: 24
              }}>
                <h3 style={{
                  color: '#1e293b',
                  fontSize: 18,
                  fontWeight: 600,
                  marginBottom: 24,
                  lineHeight: 1.6
                }}>
                  {currentExam.questions[currentQuestionIndex]?.question}
                </h3>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {currentExam.questions[currentQuestionIndex]?.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      style={{
                        background: userAnswers[currentQuestionIndex] === index ? '#667eea' : '#f8fafc',
                        color: userAnswers[currentQuestionIndex] === index ? 'white' : '#374151',
                        border: `2px solid ${userAnswers[currentQuestionIndex] === index ? '#667eea' : '#e2e8f0'}`,
                        borderRadius: 8,
                        padding: '16px 20px',
                        fontSize: 16,
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontWeight: userAnswers[currentQuestionIndex] === index ? 600 : 400
                      }}
                    >
                      <span style={{ marginRight: 12, fontWeight: 700 }}>
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24
              }}>
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  style={{
                    background: currentQuestionIndex === 0 ? '#d1d5db' : '#667eea',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: 8,
                    cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                    fontSize: 16,
                    fontWeight: 600
                  }}
                >
                  Previous
                </button>

                <div style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  {currentExam.questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      style={{
                        width: 40,
                        height: 40,
                        background: index === currentQuestionIndex ? '#667eea' :
                          userAnswers[index] !== null ? '#10b981' : '#e2e8f0',
                        color: index === currentQuestionIndex ? 'white' : '#374151',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 600
                      }}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                {currentQuestionIndex === currentExam.questions.length - 1 ? (
                  <button
                    onClick={handleSubmitExam}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: 16,
                      fontWeight: 700
                    }}
                  >
                    Submit Exam
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    style={{
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: 16,
                      fontWeight: 600
                    }}
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Results View */}
          {currentView === 'results' && (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{
                color: '#1e293b',
                fontSize: 28,
                fontWeight: 700,
                marginBottom: 16
              }}>
                Assessment Completed!
              </h2>
              <p style={{
                color: '#64748b',
                fontSize: 16,
                marginBottom: 40
              }}>
                Your assessment has been submitted successfully.
              </p>
              <button
                onClick={() => setCurrentView('main')}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  fontSize: 16,
                  fontWeight: 700
                }}
              >
                Take Another Assessment
              </button>
            </div>
          )}

          {currentView === 'history' && (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{
                color: '#1e293b',
                fontSize: 28,
                fontWeight: 700,
                marginBottom: 16
              }}>
                Assessment History
              </h2>
              <p style={{
                color: '#64748b',
                fontSize: 16,
                marginBottom: 40
              }}>
                View your previous assessment attempts and results.
              </p>
              <div style={{
                background: '#f8fafc',
                border: '2px dashed #cbd5e1',
                borderRadius: 12,
                padding: 60,
                margin: '0 auto',
                maxWidth: 400
              }}>
                <div style={{
                  fontSize: 48,
                  color: '#cbd5e1',
                  marginBottom: 16
                }}>
                  📊
                </div>
                <p style={{
                  color: '#64748b',
                  fontSize: 16,
                  margin: 0,
                  fontWeight: 500
                }}>
                  No assessment attempts found
                </p>
                <p style={{
                  color: '#94a3b8',
                  fontSize: 14,
                  margin: '8px 0 0 0'
                }}>
                  Complete your first assessment to see results here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MockTest; 