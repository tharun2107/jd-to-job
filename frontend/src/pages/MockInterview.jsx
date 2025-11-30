import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Debug imports - log each one
import * as CardComponents from '../components/ui/card';
import * as ButtonComponents from '../components/ui/Button';
import * as ProgressComponents from '../components/ui/progress';
import * as BadgeComponents from '../components/ui/badge';

console.log('Card imports:', CardComponents);
console.log('Button imports:', ButtonComponents);
console.log('Progress imports:', ProgressComponents);
console.log('Badge imports:', BadgeComponents);

// Extract components with fallbacks
const Card = CardComponents.Card;
const CardContent = CardComponents.CardContent;
const CardHeader = CardComponents.CardHeader;
const CardTitle = CardComponents.CardTitle;
const Button = ButtonComponents.Button;
const Progress = ProgressComponents.Progress;
const Badge = BadgeComponents.Badge;

// Verify all components
console.log('Card:', Card);
console.log('CardContent:', CardContent);
console.log('CardHeader:', CardHeader);
console.log('CardTitle:', CardTitle);
console.log('Button:', Button);
console.log('Progress:', Progress);
console.log('Badge:', Badge);

// Icons from lucide-react
import {
  Mic,
  MicOff,
  Play,
  CheckCircle,
  Clock,
  Brain,
  TrendingUp,
  AlertCircle,
  Loader2,
  Camera,
  CameraOff,
  Video,
  History,
  ArrowLeft,
  Eye,
  Calendar,
  Award
} from 'lucide-react';

console.log('Lucide icons:', { Mic, MicOff, Play, CheckCircle, Clock, Brain, TrendingUp, AlertCircle, Loader2 });

const getToken = () => localStorage.getItem('token');

const MockInterview = () => {
  const navigate = useNavigate();
  const [jds, setJds] = useState([]);
  const [selectedJd, setSelectedJd] = useState(null);
  const [interview, setInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responses, setResponses] = useState([]);
  const [interviewStatus, setInterviewStatus] = useState('not-started');
  const [timeRemaining, setTimeRemaining] = useState(30 * 60);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  
  // History states
  const [showHistory, setShowHistory] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedPastInterview, setSelectedPastInterview] = useState(null);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const videoRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

  // Load JDs
  useEffect(() => {
    const fetchJDs = async () => {
      try {
        const token = getToken();
        const res = await axios.get('http://localhost:5001/api/jds', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJds(res.data);
      } catch (err) {
        console.error('Error fetching JDs:', err);
        setError('Failed to load job descriptions');
      }
    };
    fetchJDs();
  }, []);

  // Fetch interview history
  const fetchInterviewHistory = async () => {
    setLoadingHistory(true);
    try {
      const token = getToken();
      const res = await axios.get('http://localhost:5001/api/mockinterview/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInterviewHistory(res.data.interviews || []);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load interview history');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Fetch specific interview details
  const fetchInterviewDetails = async (interviewId) => {
    setLoadingHistory(true);
    try {
      const token = getToken();
      const res = await axios.get(`http://localhost:5001/api/mockinterview/result/${interviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedPastInterview(res.data.interview);
    } catch (err) {
      console.error('Error fetching interview details:', err);
      setError('Failed to load interview details');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Timer
  useEffect(() => {
    if (interviewStatus === 'in-progress' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleCompleteInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [interviewStatus, timeRemaining]);

  // Speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };
    }
  }, []);

  // Camera toggle function
  const toggleCamera = async () => {
    if (cameraEnabled) {
      // Stop camera
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraEnabled(false);
    } else {
      // Start camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 320, height: 240, facingMode: 'user' },
          audio: false 
        });
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraEnabled(true);
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Could not access camera. Please check permissions.');
      }
    }
  };

  // Connect video stream to video element when stream changes
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(err => console.log('Video play error:', err));
    }
  }, [cameraStream]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Start interview
  const handleStartInterview = async () => {
    if (!selectedJd) {
      setError('Please select a job description');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await axios.post(
        'http://localhost:5001/api/mockinterview/create',
        { jdId: selectedJd._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Interview response:', res.data);
      
      if (!res.data || !res.data.interview) {
        throw new Error('Invalid response from server');
      }
      if (!res.data.interview.questions || !Array.isArray(res.data.interview.questions) || res.data.interview.questions.length === 0) {
        throw new Error('No questions in interview response');
      }
      
      setInterview(res.data.interview);
      setInterviewStatus('in-progress');
      setCurrentQuestionIndex(0);
      setTimeRemaining(30 * 60);
    } catch (err) {
      console.error('Error starting interview:', err);
      setError(err.response?.data?.error || err.message || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  // Speak question
  const speakQuestion = (question) => {
    if (!synthRef.current || !question) return;
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(question);
    utterance.rate = 0.9;
    synthRef.current.speak(utterance);
  };

  // Start/Stop recording
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
      } else {
        setError('Speech recognition not available');
      }
    }
  };

  // Submit response
  const handleSubmitResponse = async () => {
    if (!transcript.trim()) {
      setError('Please provide a response');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      await axios.post(
        'http://localhost:5001/api/mockinterview/submit-response',
        {
          interviewId: interview.id,
          questionIndex: currentQuestionIndex,
          transcript: transcript
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newResponses = [...responses];
      newResponses[currentQuestionIndex] = transcript;
      setResponses(newResponses);

      if (currentQuestionIndex < interview.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setTranscript('');
      } else {
        handleCompleteInterview();
      }
    } catch (err) {
      console.error('Error submitting response:', err);
      setError('Failed to submit response');
    } finally {
      setLoading(false);
      if (isRecording) toggleRecording();
    }
  };

  // Complete interview
  const handleCompleteInterview = async () => {
    setLoading(true);
    if (isRecording) toggleRecording();
    
    try {
      const token = getToken();
      const res = await axios.post(
        'http://localhost:5001/api/mockinterview/complete',
        { interviewId: interview.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAnalysis(res.data.analysis);
      setInterviewStatus('completed');
    } catch (err) {
      console.error('Error completing interview:', err);
      setError('Failed to complete interview');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = interview?.questions?.[currentQuestionIndex];

  // Check for undefined components before rendering
  if (!Card || !CardContent || !CardHeader || !CardTitle || !Button || !Progress || !Badge) {
    return (
      <div style={{ padding: '20px', color: 'white', background: '#1a1a2e', minHeight: '100vh' }}>
        <h1>Component Loading Error</h1>
        <p>Some UI components failed to load:</p>
        <ul>
          <li>Card: {Card ? '✅' : '❌'}</li>
          <li>CardContent: {CardContent ? '✅' : '❌'}</li>
          <li>CardHeader: {CardHeader ? '✅' : '❌'}</li>
          <li>CardTitle: {CardTitle ? '✅' : '❌'}</li>
          <li>Button: {Button ? '✅' : '❌'}</li>
          <li>Progress: {Progress ? '✅' : '❌'}</li>
          <li>Badge: {Badge ? '✅' : '❌'}</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              AI Mock Interview
            </h1>
            <p className="text-gray-400">
              Practice with AI-powered interviews tailored to your job description
            </p>
          </div>
          
          {/* History Toggle Button */}
          {interviewStatus === 'not-started' && !showHistory && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={() => {
                  setShowHistory(true);
                  fetchInterviewHistory();
                }}
                variant="outline"
                className="border-purple-600 text-purple-300 hover:bg-purple-900/20"
              >
                <History className="mr-2 h-4 w-4" />
                View Past Interviews
              </Button>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="ml-4 text-red-400 hover:text-red-200"
            >
              ✕
            </button>
          </div>
        )}

        {/* History View */}
        {showHistory && !selectedPastInterview && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <History className="h-6 w-6 text-purple-400" />
                Interview History
              </h2>
              <Button
                onClick={() => setShowHistory(false)}
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to New Interview
              </Button>
            </div>

            {loadingHistory ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading history...</p>
              </div>
            ) : interviewHistory.length === 0 ? (
              <Card className="bg-gray-900/80 border-gray-700">
                <CardContent className="py-12 text-center">
                  <History className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No past interviews found</p>
                  <p className="text-gray-500 text-sm mt-2">Complete your first interview to see it here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {interviewHistory.map((item) => (
                  <Card 
                    key={item.id} 
                    className="bg-gray-900/80 border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer"
                    onClick={() => fetchInterviewDetails(item.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={`${
                              item.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'
                            }`}>
                              {item.status === 'completed' ? 'Completed' : 'In Progress'}
                            </Badge>
                            {item.attemptNumber && (
                              <span className="text-gray-400 text-sm">
                                Attempt #{item.attemptNumber}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm line-clamp-2 mb-2">
                            {item.jdPreview || 'Job Description'}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                            {item.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {item.duration} min
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          {item.score !== undefined && item.score !== null && (
                            <div className="mb-2">
                              <div className="text-3xl font-bold text-blue-400">{item.score}</div>
                              <div className="text-gray-500 text-xs">Score</div>
                            </div>
                          )}
                          <Button size="sm" variant="outline" className="border-purple-600 text-purple-300">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Past Interview Details View */}
        {showHistory && selectedPastInterview && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Award className="h-6 w-6 text-yellow-400" />
                Interview Feedback
              </h2>
              <Button
                onClick={() => setSelectedPastInterview(null)}
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to History
              </Button>
            </div>

            {/* Score Display */}
            {selectedPastInterview.analysis && (
              <Card className="bg-gray-900/80 border-blue-800 mb-6">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      {selectedPastInterview.analysis.overallScore || 0}/100
                    </div>
                    <p className="text-gray-400 mt-2">Overall Performance Score</p>
                  </div>

                  {/* Strengths */}
                  {selectedPastInterview.analysis.strengths && selectedPastInterview.analysis.strengths.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-green-400 mb-2 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Strengths
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedPastInterview.analysis.strengths.map((s, idx) => (
                          <Badge key={idx} className="bg-green-600 text-white">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weaknesses */}
                  {selectedPastInterview.analysis.weaknesses && selectedPastInterview.analysis.weaknesses.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Areas to Improve
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedPastInterview.analysis.weaknesses.map((w, idx) => (
                          <Badge key={idx} className="bg-yellow-600 text-white">{w}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detailed Feedback */}
                  {selectedPastInterview.analysis.detailedFeedback && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-blue-300 mb-2">Detailed Feedback</h3>
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <p className="text-gray-300 whitespace-pre-wrap">
                          {selectedPastInterview.analysis.detailedFeedback}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {selectedPastInterview.analysis.recommendations && selectedPastInterview.analysis.recommendations.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-purple-400 mb-2">Recommendations</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-300">
                        {selectedPastInterview.analysis.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Questions & Responses */}
            {selectedPastInterview.questions && selectedPastInterview.questions.length > 0 && (
              <Card className="bg-gray-900/80 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-blue-300">Questions & Your Responses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedPastInterview.questions.map((q, idx) => (
                    <div key={idx} className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-2">
                        <Badge className="bg-blue-600">Q{idx + 1}</Badge>
                        <p className="text-white font-medium">{q.question}</p>
                      </div>
                      <div className="ml-10 mt-2">
                        <p className="text-gray-400 text-sm mb-1">Your Response:</p>
                        <p className="text-gray-300 text-sm bg-gray-900/50 rounded p-2">
                          {selectedPastInterview.responses?.[idx]?.transcript || 'No response recorded'}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Back Button */}
            <div className="mt-6 text-center">
              <Button
                onClick={() => {
                  setSelectedPastInterview(null);
                  setShowHistory(false);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Start New Interview
              </Button>
            </div>
          </div>
        )}

        {/* Setup Section */}
        {interviewStatus === 'not-started' && !showHistory && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-gray-900/80 border-blue-800">
              <CardHeader>
                <CardTitle className="text-blue-300">Select Job Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {jds.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    No job descriptions found. Please upload a resume first.
                  </p>
                ) : (
                  <React.Fragment>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {jds.map((jd) => (
                        <div
                          key={jd._id}
                          onClick={() => setSelectedJd(jd)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            selectedJd?._id === jd._id
                              ? 'border-blue-500 bg-blue-900/20'
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          <p className="text-white text-sm line-clamp-2">
                            {jd.jdText ? jd.jdText.substring(0, 200) + '...' : 'No description'}
                          </p>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={handleStartInterview}
                      disabled={!selectedJd || loading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? (
                        <React.Fragment>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Starting...
                        </React.Fragment>
                      ) : (
                        'Start Interview'
                      )}
                    </Button>
                  </React.Fragment>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Interview Section */}
        {interviewStatus === 'in-progress' && interview && interview.questions && interview.questions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Interviewer Panel */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-900/80 border-blue-800 h-full">
                <CardHeader>
                  <CardTitle className="text-blue-300 flex items-center justify-between">
                    <span>AI Interviewer</span>
                    <Badge className="bg-green-600">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(timeRemaining)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* AI Avatar */}
                  <div className="h-40 w-full bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <div className="text-5xl mb-2">🤖</div>
                      <p className="text-gray-400 text-sm">AI Interviewer</p>
                    </div>
                  </div>
                  
                  {/* Your Camera Feed */}
                  <div className="relative">
                    <div className="h-40 w-full bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                      {/* Always render video element, hide when camera is off */}
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className={`w-full h-full object-cover ${cameraEnabled ? 'block' : 'hidden'}`}
                        style={{ transform: 'scaleX(-1)' }} // Mirror the video
                      />
                      {!cameraEnabled && (
                        <div className="text-center">
                          <CameraOff className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">Camera Off</p>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={toggleCamera}
                      size="sm"
                      className={`absolute bottom-2 right-2 ${
                        cameraEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {cameraEnabled ? (
                        <React.Fragment>
                          <CameraOff className="h-4 w-4 mr-1" />
                          Off
                        </React.Fragment>
                      ) : (
                        <React.Fragment>
                          <Camera className="h-4 w-4 mr-1" />
                          On
                        </React.Fragment>
                      )}
                    </Button>
                    <p className="text-gray-400 text-xs text-center mt-1">Your Camera</p>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-gray-400 text-sm">
                      Question {currentQuestionIndex + 1} of {interview.questions.length}
                    </p>
                    <Progress
                      value={((currentQuestionIndex + 1) / interview.questions.length) * 100}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Question & Response Panel */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="bg-gray-900/80 border-blue-800">
                <CardHeader>
                  <CardTitle className="text-blue-300 flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Interview Question
                    {currentQuestion && (
                      <Badge className="ml-auto">
                        {currentQuestion.type || 'technical'}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-white text-lg">
                      {currentQuestion?.question || 'Loading question...'}
                    </p>
                  </div>

                  {currentQuestion?.question && (
                    <Button
                      onClick={() => speakQuestion(currentQuestion.question)}
                      variant="outline"
                      className="border-blue-600 text-blue-300"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Listen to Question
                    </Button>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Your Response
                    </label>
                    <textarea
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      placeholder="Start speaking or type your answer here..."
                      className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />

                    <div className="flex gap-2">
                      <Button
                        onClick={toggleRecording}
                        className={`flex-1 ${
                          isRecording
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {isRecording ? (
                          <React.Fragment>
                            <MicOff className="mr-2 h-4 w-4" />
                            Stop Recording
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            <Mic className="mr-2 h-4 w-4" />
                            Start Recording
                          </React.Fragment>
                        )}
                      </Button>
                      <Button
                        onClick={handleSubmitResponse}
                        disabled={!transcript.trim() || loading}
                        className={`flex-1 ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                      >
                        {loading ? (
                          <React.Fragment>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {currentQuestionIndex < interview.questions.length - 1 
                              ? 'Please wait, saving response...' 
                              : 'Please wait, analyzing interview...'}
                          </React.Fragment>
                        ) : currentQuestionIndex < interview.questions.length - 1 ? (
                          'Next Question'
                        ) : (
                          'Complete Interview'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Results Section */}
        {interviewStatus === 'completed' && analysis && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="bg-gray-900/80 border-blue-800">
              <CardHeader>
                <CardTitle className="text-blue-300 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Interview Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {analysis.overallScore || 0}/100
                  </div>
                  <p className="text-gray-400 mt-2">Overall Performance Score</p>
                </div>

                {analysis.strengths && analysis.strengths.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Strengths
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.strengths.map((strength, idx) => (
                        <Badge key={idx} className="bg-green-600 text-white">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Areas for Improvement
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.weaknesses.map((weakness, idx) => (
                        <Badge key={idx} className="bg-yellow-600 text-white">
                          {weakness}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical & Communication Scores */}
                {(analysis.technicalCompetency || analysis.communicationSkills) && (
                  <div className="grid grid-cols-2 gap-4">
                    {analysis.technicalCompetency && (
                      <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                        <p className="text-gray-400 text-sm mb-1">Technical Competency</p>
                        <p className="text-xl font-semibold text-blue-300">{analysis.technicalCompetency}</p>
                      </div>
                    )}
                    {analysis.communicationSkills && (
                      <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                        <p className="text-gray-400 text-sm mb-1">Communication Skills</p>
                        <p className="text-xl font-semibold text-cyan-300">{analysis.communicationSkills}</p>
                      </div>
                    )}
                  </div>
                )}

                {analysis.detailedFeedback && (
                  <div>
                    <h3 className="text-lg font-semibold text-blue-300 mb-3">Detailed Feedback</h3>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <p className="text-gray-300 whitespace-pre-wrap">
                        {analysis.detailedFeedback}
                      </p>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-purple-400 mb-3">Recommendations</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                      {analysis.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={() => {
                      setInterviewStatus('not-started');
                      setInterview(null);
                      setAnalysis(null);
                      setCurrentQuestionIndex(0);
                      setResponses([]);
                      setTranscript('');
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Start New Interview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterview;
