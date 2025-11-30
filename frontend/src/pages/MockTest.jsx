// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
// import { Button } from '../components/ui/button';
// import { Badge } from '../components/ui/badge';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
// import { Separator } from '../components/ui/separator';
// import { Progress } from '../components/ui/progress';
// import {
//   Brain,
//   Clock,
//   FileText,
//   CheckCircle,
//   XCircle,
//   ArrowLeft,
//   ArrowRight,
//   Play,
//   History,
//   Target,
//   Award,
//   Timer,
//   BarChart3,
//   Loader2,
//   AlertCircle,
//   Info,
//   Settings,
//   Eye,
//   Trophy,
//   TrendingUp
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// const MockTest = () => {
//   const [currentView, setCurrentView] = useState('main'); // main, history, config, exam, results
//   const [jds, setJds] = useState([]);
//   const [selectedJd, setSelectedJd] = useState(null);
//   const [loadingJds, setLoadingJds] = useState(false);
//   const [jdError, setJdError] = useState(null);

//   // Exam configuration states
//   const [questionCount, setQuestionCount] = useState(15);
//   const [loadingExam, setLoadingExam] = useState(false);
//   const [examError, setExamError] = useState(null);

//   // Exam states
//   const [currentExam, setCurrentExam] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [userAnswers, setUserAnswers] = useState([]);
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [examStarted, setExamStarted] = useState(false);

//   // Assessment history states
//   const [attempts, setAttempts] = useState([]);
//   const [loadingAttempts, setLoadingAttempts] = useState(false);
//   const [attemptsError, setAttemptsError] = useState(null);
//   const [selectedAttempt, setSelectedAttempt] = useState(null);
//   const [attemptDetails, setAttemptDetails] = useState(null);
//   const [loadingDetails, setLoadingDetails] = useState(false);

//   // Time limits for different question counts
//   const TIME_LIMITS = {
//     15: 20, // 20 minutes for 15 questions
//     20: 30, // 30 minutes for 20 questions
//     30: 45  // 45 minutes for 30 questions
//   };

//   useEffect(() => {
//     if (currentView === 'main') {
//       fetchJDs();
//     }
//     // eslint-disable-next-line
//   }, [currentView]);

//   // Timer effect for exam
//   useEffect(() => {
//     let timer;
//     if (examStarted && timeLeft > 0) {
//       timer = setInterval(() => {
//         setTimeLeft(prev => {
//           if (prev <= 1) {
//             // Time's up - auto submit
//             handleSubmitExam();
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//     }
//     return () => clearInterval(timer);
//   }, [examStarted, timeLeft]);

//   // Fetch attempts when entering history view
//   useEffect(() => {
//     if (currentView === 'history') {
//       fetchAttempts();
//     }
//     // eslint-disable-next-line
//   }, [currentView]);

//   const fetchJDs = async () => {
//     setLoadingJds(true);
//     setJdError(null);
//     setJds([]);
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get('http://localhost:5001/api/jds', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       console.log('API Response:', response.data);
//       const jdsArray = Array.isArray(response.data) ? response.data : [];
//       console.log('JDs Array:', jdsArray);
//       setJds(jdsArray);
//     } catch (error) {
//       console.error('Error fetching JDs:', error);
//       setJdError('Failed to load job descriptions. Please login again.');
//     } finally {
//       setLoadingJds(false);
//     }
//   };

//   const fetchAttempts = async () => {
//     setLoadingAttempts(true);
//     setAttemptsError(null);
//     setAttempts([]);
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get('http://localhost:5001/api/mocktest/attempts', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setAttempts(Array.isArray(response.data.attempts) ? response.data.attempts : []);
//     } catch (error) {
//       setAttemptsError('Failed to load assessment attempts. Please login again.');
//     } finally {
//       setLoadingAttempts(false);
//     }
//   };

//   const fetchAttemptDetails = async (attemptId) => {
//     setLoadingDetails(true);
//     setAttemptDetails(null);
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`http://localhost:5001/api/mocktest/result/${attemptId}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setAttemptDetails(response.data.mockTest);
//     } catch (error) {
//       setAttemptDetails(null);
//       alert('Failed to load attempt details.');
//     } finally {
//       setLoadingDetails(false);
//     }
//   };

//   const handleStartAssessment = () => {
//     if (selectedJd) {
//       setCurrentView('config');
//     }
//   };

//   const handleCreateExam = async () => {
//     if (!selectedJd) return;

//     setLoadingExam(true);
//     setExamError(null);

//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.post('http://localhost:5001/api/mocktest/create', {
//         jdId: selectedJd._id,
//         numberOfQuestions: questionCount,
//         timeLimit: TIME_LIMITS[questionCount]
//       }, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       console.log('Exam created:', response.data);

//       // Set up the exam
//       const examData = response.data.mockTest;
//       setCurrentExam(examData);
//       setUserAnswers(new Array(examData.questions.length).fill(null));
//       setTimeLeft(TIME_LIMITS[questionCount] * 60); // Convert to seconds
//       setCurrentQuestionIndex(0);
//       setExamStarted(true);
//       setCurrentView('exam');

//     } catch (error) {
//       console.error('Error creating exam:', error);
//       setExamError(error.response?.data?.message || 'Failed to create assessment. Please try again.');
//     } finally {
//       setLoadingExam(false);
//     }
//   };

//   const handleAnswerSelect = (selectedOption) => {
//     const newAnswers = [...userAnswers];
//     newAnswers[currentQuestionIndex] = selectedOption;
//     setUserAnswers(newAnswers);
//   };

//   const handleNextQuestion = () => {
//     if (currentQuestionIndex < currentExam.questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//     }
//   };

//   const handlePreviousQuestion = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//     }
//   };

//   const handleSubmitExam = async () => {
//     if (!currentExam) return;

//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.post('http://localhost:5001/api/mocktest/submit', {
//         mockTestId: currentExam.id,
//         answers: userAnswers.map((answer, index) => ({
//           questionIndex: index,
//           selectedOption: answer || 0
//         }))
//       }, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       console.log('Exam submitted:', response.data);
//       setCurrentView('results');
//       // You can store the results in state if needed

//     } catch (error) {
//       console.error('Error submitting exam:', error);
//       alert('Failed to submit exam. Please try again.');
//     }
//   };

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   console.log('Render - JDs:', jds, 'Selected JD:', selectedJd);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950">
//       <div className="max-w-6xl mx-auto py-8 px-4">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="text-center mb-8"
//         >
//           <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center justify-center gap-3 mb-4">
//             <Brain className="h-10 w-10" />
//             Mock Assessment
//           </h1>
//           <p className="text-gray-300 text-lg max-w-2xl mx-auto">
//             Practice with AI-generated questions based on your job descriptions
//           </p>
//         </motion.div>

//         {/* Navigation */}
//         <Card className="bg-gray-900/80 border border-blue-800 rounded-2xl shadow-2xl mb-8">
//           <div className="flex">
//             <Button
//               variant={currentView === 'main' ? 'default' : 'ghost'}
//               onClick={() => setCurrentView('main')}
//               className={`flex-1 rounded-none h-16 text-lg font-semibold ${currentView === 'main'
//                 ? 'bg-blue-600 hover:bg-blue-700 text-white'
//                 : 'text-gray-300 hover:bg-gray-800 hover:text-white'
//                 }`}
//             >
//               <Play className="mr-2 h-5 w-5" />
//               Take Assessment
//             </Button>
//             <Button
//               variant={currentView === 'history' ? 'default' : 'ghost'}
//               onClick={() => setCurrentView('history')}
//               className={`flex-1 rounded-none h-16 text-lg font-semibold ${currentView === 'history'
//                 ? 'bg-blue-600 hover:bg-blue-700 text-white'
//                 : 'text-gray-300 hover:bg-gray-800 hover:text-white'
//                 }`}
//             >
//               <History className="mr-2 h-5 w-5" />
//               Assessment History
//             </Button>
//           </div>
//         </Card>

//         {/* Main Content */}
//         <AnimatePresence mode="wait">
//           {currentView === 'main' && (
//             <motion.div
//               key="main"
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: 20 }}
//               transition={{ duration: 0.3 }}
//             >
//               <div className="text-center mb-10">
//                 <h2 className="text-3xl font-bold text-white mb-4">
//                   Welcome to Your Assessment
//                 </h2>
//                 <p className="text-gray-300 text-lg max-w-2xl mx-auto">
//                   Select a job description and configure your assessment to start practicing with AI-generated questions.
//                 </p>
//               </div>

//               {/* How it works */}
//               <Card className="bg-gray-900/80 border border-blue-800 rounded-2xl shadow-2xl mb-8">
//                 <CardHeader>
//                   <CardTitle className="text-xl font-bold text-blue-300 flex items-center gap-3">
//                     <Info className="h-6 w-6" />
//                     How the Assessment Works
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                     {[
//                       { step: '1', title: 'Select JD', desc: 'Choose from your existing job descriptions', icon: <FileText className="h-5 w-5" /> },
//                       { step: '2', title: 'Configure Test', desc: 'Select number of questions (15, 20, or 30)', icon: <Settings className="h-5 w-5" /> },
//                       { step: '3', title: 'Take Assessment', desc: 'Answer questions within the time limit', icon: <Timer className="h-5 w-5" /> },
//                       { step: '4', title: 'Get Feedback', desc: 'Receive detailed feedback and explanations', icon: <Award className="h-5 w-5" /> }
//                     ].map((item, index) => (
//                       <motion.div
//                         key={item.step}
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: index * 0.1 }}
//                         className="text-center"
//                       >
//                         <Card className="bg-gray-800/50 border border-gray-700 hover:border-blue-600 transition-colors">
//                           <CardContent className="pt-6">
//                             <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
//                               {item.icon}
//                             </div>
//                             <h4 className="text-lg font-semibold text-white mb-2">
//                               {item.title}
//                             </h4>
//                             <p className="text-gray-400 text-sm">
//                               {item.desc}
//                             </p>
//                           </CardContent>
//                         </Card>
//                       </motion.div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* JD Selection */}
//               <Card className="bg-gray-900/80 border border-blue-800 rounded-2xl shadow-2xl mb-8">
//                 <CardHeader>
//                   <CardTitle className="text-xl font-bold text-blue-300 flex items-center gap-3">
//                     <Target className="h-6 w-6" />
//                     Select Job Description
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   {loadingJds ? (
//                     <div className="flex items-center justify-center py-12">
//                       <Loader2 className="h-8 w-8 animate-spin text-blue-400 mr-3" />
//                       <span className="text-blue-200 text-lg">Loading job descriptions...</span>
//                     </div>
//                   ) : jdError ? (
//                       <div className="bg-red-950/30 border border-red-700 rounded-lg p-4">
//                         <div className="flex items-center gap-2 text-red-400">
//                           <AlertCircle className="h-5 w-5" />
//                           <span className="font-semibold">{jdError}</span>
//                         </div>
//                     </div>
//                   ) : jds.length === 0 ? (
//                         <div className="bg-blue-950/30 border border-blue-700 rounded-lg p-8 text-center">
//                           <FileText className="h-12 w-12 text-blue-400 mx-auto mb-4" />
//                           <p className="text-blue-200 font-semibold mb-2">No job descriptions found</p>
//                           <p className="text-blue-300 text-sm">
//                         Upload a job description first to get started with assessments.
//                       </p>
//                     </div>
//                   ) : (
//                           <div className="space-y-4">
//                       <select
//                         value={selectedJd ? selectedJd._id : ''}
//                         onChange={e => {
//                           const jd = jds.find(j => j._id === e.target.value);
//                           setSelectedJd(jd);
//                         }}
//                               className="w-full p-4 bg-gray-800 border border-blue-700 rounded-lg text-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
//                             >
//                               <option value="" className="text-gray-400">
//                                 -- Select a Job Description --
//                               </option>
//                               {jds.map(jd => (
//                                 <option key={jd._id} value={jd._id} className="text-gray-200">
//                                   {jd.jdText.slice(0, 80)}...
//                                 </option>
//                               ))}
//                             </select>

//                             {selectedJd && (
//                         <div className="bg-blue-950/30 border border-blue-700 rounded-lg p-4">
//                           <p className="text-blue-200 font-semibold">
//                             Selected: {selectedJd.jdText.slice(0, 60)}...
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>

//               {/* Start Test Button */}
//               <div className="text-center">
//                 <Button
//                   onClick={handleStartAssessment}
//                   disabled={!selectedJd}
//                   size="lg"
//                   className={`text-lg font-semibold px-8 py-4 ${selectedJd
//                     ? 'bg-green-600 hover:bg-green-700 text-white'
//                     : 'bg-gray-600 text-gray-400 cursor-not-allowed'
//                     }`}
//                 >
//                   <Play className="mr-2 h-5 w-5" />
//                   {selectedJd ? 'Start Assessment' : 'Select a Job Description First'}
//                 </Button>
//               </div>
//             </motion.div>
//           )}

//           {/* Exam Configuration View */}
//           {currentView === 'config' && (
//             <motion.div
//               key="config"
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: 20 }}
//               transition={{ duration: 0.3 }}
//             >
//               <div className="text-center mb-10">
//                 <h2 className="text-3xl font-bold text-white mb-4">
//                   Configure Your Assessment
//                 </h2>
//                 <p className="text-gray-300 text-lg max-w-2xl mx-auto">
//                   Choose your assessment settings and review the details before starting.
//                 </p>
//               </div>

//               {/* Selected JD Review */}
//               <Card className="bg-blue-950/30 border border-blue-700 rounded-2xl shadow-2xl mb-8">
//                 <CardHeader>
//                   <CardTitle className="text-lg font-semibold text-blue-200">
//                     Selected Job Description
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <p className="text-blue-300 leading-relaxed">
//                     {selectedJd?.jdText.slice(0, 120)}...
//                   </p>
//                 </CardContent>
//               </Card>

//               {/* Question Count Selection */}
//               <Card className="bg-gray-900/80 border border-blue-800 rounded-2xl shadow-2xl mb-8">
//                 <CardHeader>
//                   <CardTitle className="text-xl font-bold text-blue-300 flex items-center gap-3">
//                     <Settings className="h-6 w-6" />
//                     Assessment Configuration
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//                     {[15, 20, 30].map(count => (
//                       <motion.div
//                         key={count}
//                         whileHover={{ scale: 1.02 }}
//                         whileTap={{ scale: 0.98 }}
//                       >
//                         <Card
//                           className={`cursor-pointer transition-all duration-200 ${questionCount === count
//                             ? 'bg-blue-600/20 border-blue-600'
//                             : 'bg-gray-800/50 border-gray-700 hover:border-blue-600'
//                             }`}
//                           onClick={() => setQuestionCount(count)}
//                         >
//                           <CardContent className="pt-6 text-center">
//                             <div className={`text-4xl font-bold mb-2 ${questionCount === count ? 'text-blue-400' : 'text-gray-400'
//                               }`}>
//                               {count}
//                             </div>
//                             <div className={`font-semibold mb-1 ${questionCount === count ? 'text-blue-300' : 'text-gray-300'
//                               }`}>
//                               Questions
//                             </div>
//                             <div className={`text-sm ${questionCount === count ? 'text-blue-400' : 'text-gray-500'
//                               }`}>
//                               {TIME_LIMITS[count]} minutes
//                             </div>
//                           </CardContent>
//                         </Card>
//                       </motion.div>
//                     ))}
//                   </div>

//                   {/* Assessment Summary */}
//                   <Card className="bg-gray-800/50 border border-gray-700">
//                     <CardHeader>
//                       <CardTitle className="text-lg font-semibold text-white">
//                         Assessment Summary
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                         <div className="text-center">
//                           <div className="text-gray-400 text-sm font-medium mb-1">Questions</div>
//                           <div className="text-2xl font-bold text-white">{questionCount}</div>
//                         </div>
//                         <div className="text-center">
//                           <div className="text-gray-400 text-sm font-medium mb-1">Time Limit</div>
//                           <div className="text-2xl font-bold text-white">{TIME_LIMITS[questionCount]} min</div>
//                         </div>
//                         <div className="text-center">
//                           <div className="text-gray-400 text-sm font-medium mb-1">Difficulty</div>
//                           <div className="text-2xl font-bold text-white">Adaptive</div>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </CardContent>
//               </Card>

//               {/* Error Display */}
//               {examError && (
//                 <div className="bg-red-950/30 border border-red-700 rounded-lg p-4 mb-8">
//                   <div className="flex items-center gap-2 text-red-400">
//                     <AlertCircle className="h-5 w-5" />
//                     <span className="font-semibold">{examError}</span>
//                   </div>
//                 </div>
//               )}

//               {/* Action Buttons */}
//               <div className="flex gap-4 justify-center">
//                 <Button
//                   variant="outline"
//                   onClick={() => setCurrentView('main')}
//                   className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
//                 >
//                   <ArrowLeft className="mr-2 h-4 w-4" />
//                   Back
//                 </Button>
//                 <Button
//                   onClick={handleCreateExam}
//                   disabled={loadingExam}
//                   className="bg-green-600 hover:bg-green-700 text-white"
//                 >
//                   {loadingExam ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Creating Assessment...
//                     </>
//                   ) : (
//                       <>
//                         <Play className="mr-2 h-4 w-4" />
//                         Start Assessment
//                       </>
//                   )}
//                 </Button>
//               </div>
//             </motion.div>
//           )}

//           {/* Exam View */}
//           {currentView === 'exam' && currentExam && (
//             <motion.div
//               key="exam"
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: 20 }}
//               transition={{ duration: 0.3 }}
//             >
//               {/* Exam Header */}
//               <Card className="bg-gray-900/80 border border-blue-800 rounded-2xl shadow-2xl mb-8">
//                 <CardContent className="p-6">
//                   <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//                     <div>
//                       <h2 className="text-2xl font-bold text-white mb-2">
//                         Question {currentQuestionIndex + 1} of {currentExam.questions.length}
//                       </h2>
//                       <p className="text-gray-300">
//                         Skill: {currentExam.questions[currentQuestionIndex]?.skill}
//                       </p>
//                     </div>
//                     <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg ${timeLeft < 300 ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
//                       }`}>
//                       <Clock className="h-5 w-5" />
//                       {formatTime(timeLeft)}
//                     </div>
//                   </div>

//                   {/* Progress Bar */}
//                   <div className="mt-4">
//                     <div className="flex justify-between text-sm text-gray-400 mb-2">
//                       <span>Progress</span>
//                       <span>{Math.round(((currentQuestionIndex + 1) / currentExam.questions.length) * 100)}%</span>
//                     </div>
//                     <Progress
//                       value={((currentQuestionIndex + 1) / currentExam.questions.length) * 100}
//                       className="h-2"
//                     />
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Question */}
//               <Card className="bg-gray-900/80 border border-blue-800 rounded-2xl shadow-2xl mb-8">
//                 <CardContent className="p-8">
//                   <h3 className="text-xl font-semibold text-white mb-8 leading-relaxed">
//                     {currentExam.questions[currentQuestionIndex]?.question}
//                   </h3>

//                   {/* Options */}
//                   <div className="space-y-4">
//                     {currentExam.questions[currentQuestionIndex]?.options.map((option, index) => (
//                       <motion.button
//                         key={index}
//                         onClick={() => handleAnswerSelect(index)}
//                         className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${userAnswers[currentQuestionIndex] === index
//                           ? 'bg-blue-600 border-blue-600 text-white'
//                           : 'bg-gray-800 border-gray-700 text-gray-200 hover:border-blue-600 hover:bg-gray-800/80'
//                           }`}
//                         whileHover={{ scale: 1.01 }}
//                         whileTap={{ scale: 0.99 }}
//                       >
//                         <span className="font-bold mr-3">
//                           {String.fromCharCode(65 + index)}.
//                         </span>
//                         {option}
//                       </motion.button>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Navigation */}
//               <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
//                 <Button
//                   onClick={handlePreviousQuestion}
//                   disabled={currentQuestionIndex === 0}
//                   variant="outline"
//                   className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
//                 >
//                   <ArrowLeft className="mr-2 h-4 w-4" />
//                   Previous
//                 </Button>

//                 {/* Question Navigation */}
//                 <div className="flex gap-2 flex-wrap justify-center">
//                   {currentExam.questions.map((_, index) => (
//                     <Button
//                       key={index}
//                       onClick={() => setCurrentQuestionIndex(index)}
//                       variant="outline"
//                       size="sm"
//                       className={`w-10 h-10 p-0 ${index === currentQuestionIndex
//                         ? 'bg-blue-600 border-blue-600 text-white'
//                         : userAnswers[index] !== null
//                           ? 'bg-green-600 border-green-600 text-white'
//                           : 'border-gray-600 text-gray-300 hover:bg-gray-800'
//                         }`}
//                     >
//                       {index + 1}
//                     </Button>
//                   ))}
//                 </div>

//                 {currentQuestionIndex === currentExam.questions.length - 1 ? (
//                   <Button
//                     onClick={handleSubmitExam}
//                     className="bg-green-600 hover:bg-green-700 text-white"
//                   >
//                     <Trophy className="mr-2 h-4 w-4" />
//                     Submit Exam
//                   </Button>
//                 ) : (
//                     <Button
//                     onClick={handleNextQuestion}
//                       className="bg-blue-600 hover:bg-blue-700 text-white"
//                   >
//                     Next
//                       <ArrowRight className="ml-2 h-4 w-4" />
//                     </Button>
//                 )}
//               </div>
//             </motion.div>
//           )}

//           {/* Results View */}
//           {currentView === 'results' && (
//             <motion.div
//               key="results"
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.9 }}
//               transition={{ duration: 0.3 }}
//               className="text-center"
//             >
//               <Card className="bg-gray-900/80 border border-green-600 rounded-2xl shadow-2xl max-w-md mx-auto">
//                 <CardContent className="p-8">
//                   <Trophy className="h-16 w-16 text-green-400 mx-auto mb-4" />
//                   <h2 className="text-2xl font-bold text-white mb-4">
//                     Assessment Completed!
//                   </h2>
//                   <p className="text-gray-300 mb-6">
//                     Your assessment has been submitted successfully.
//                   </p>
//                   <Button
//                     onClick={() => setCurrentView('main')}
//                     className="bg-blue-600 hover:bg-blue-700 text-white"
//                   >
//                     <Play className="mr-2 h-4 w-4" />
//                     Take Another Assessment
//                   </Button>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           )}

//           {/* History View */}
//           {currentView === 'history' && (
//             <motion.div
//               key="history"
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: 20 }}
//               transition={{ duration: 0.3 }}
//             >
//               <div className="text-center mb-10">
//                 <h2 className="text-3xl font-bold text-white mb-4">
//                   Assessment History
//                 </h2>
//                 <p className="text-gray-300 text-lg">
//                   View your previous assessment attempts and results.
//                 </p>
//               </div>

//               {loadingAttempts ? (
//                 <div className="flex items-center justify-center py-12">
//                   <Loader2 className="h-8 w-8 animate-spin text-blue-400 mr-3" />
//                   <span className="text-blue-200 text-lg">Loading attempts...</span>
//                 </div>
//               ) : attemptsError ? (
//                   <div className="bg-red-950/30 border border-red-700 rounded-lg p-4">
//                     <div className="flex items-center gap-2 text-red-400">
//                       <AlertCircle className="h-5 w-5" />
//                       <span className="font-semibold">{attemptsError}</span>
//                     </div>
//                   </div>
//               ) : attempts.length === 0 ? (
//                     <Card className="bg-gray-900/80 border border-gray-700 rounded-2xl shadow-2xl max-w-md mx-auto">
//                       <CardContent className="p-12 text-center">
//                         <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//                         <p className="text-gray-300 font-semibold mb-2">
//                           No assessment attempts found
//                         </p>
//                         <p className="text-gray-400 text-sm">
//                           Complete your first assessment to see results here
//                         </p>
//                       </CardContent>
//                     </Card>
//               ) : (
//                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {attempts.map((attempt, index) => (
//                           <motion.div
//                       key={attempt.id}
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ delay: index * 0.1 }}
//                           >
//                             <Card
//                               className="bg-gray-900/80 border border-gray-700 hover:border-blue-600 transition-colors cursor-pointer"
//                               onClick={() => {
//                                 setSelectedAttempt(attempt.id);
//                                 fetchAttemptDetails(attempt.id);
//                               }}
//                             >
//                               <CardContent className="p-6">
//                                 <div className="flex items-start justify-between mb-4">
//                                   <h3 className="text-lg font-semibold text-white line-clamp-2">
//                                     {attempt.jdText?.slice(0, 60)}...
//                                   </h3>
//                                   <Badge className="bg-blue-600 text-white">
//                                     View Details
//                                   </Badge>
//                                 </div>

//                                 <div className="space-y-2 text-sm">
//                                   <div className="text-gray-400">
//                                     {new Date(attempt.startTime).toLocaleString()}
//                                   </div>
//                                   <div className="flex items-center gap-4">
//                                     <span className="text-green-400 font-bold">
//                                       {attempt.evaluation?.percentage != null ? `${attempt.evaluation.percentage}%` : '--'}
//                                     </span>
//                                     <span className="text-gray-400">
//                                       Score: {attempt.evaluation?.totalScore ?? '--'}
//                                     </span>
//                                   </div>
//                                   <div className="flex items-center gap-4">
//                                     <span className={`font-semibold ${attempt.examStatus === 'completed' ? 'text-green-400' :
//                                       attempt.examStatus === 'timeout' ? 'text-red-400' : 'text-yellow-400'
//                                       }`}>
//                                       {attempt.examStatus.charAt(0).toUpperCase() + attempt.examStatus.slice(1)}
//                                     </span>
//                                     <span className="text-gray-400">
//                                       {attempt.timeTaken != null ? `${attempt.timeTaken} min` : '--'}
//                                     </span>
//                                   </div>
//                                 </div>
//                               </CardContent>
//                             </Card>
//                           </motion.div>
//                   ))}
//                 </div>
//               )}

//               {/* Attempt Details Dialog */}
//               <Dialog open={!!selectedAttempt} onOpenChange={() => {
//                 setSelectedAttempt(null);
//                 setAttemptDetails(null);
//               }}>
//                 <DialogContent className="bg-gray-900 border-blue-800 max-w-4xl max-h-[80vh] overflow-y-auto">
//                   <DialogHeader>
//                     <DialogTitle className="text-2xl font-bold text-blue-300 flex items-center gap-2">
//                       <Eye className="h-6 w-6" />
//                       Assessment Details
//                     </DialogTitle>
//                   </DialogHeader>

//                   {loadingDetails || !attemptDetails ? (
//                     <div className="flex items-center justify-center py-12">
//                       <Loader2 className="h-8 w-8 animate-spin text-blue-400 mr-3" />
//                       <span className="text-blue-200 text-lg">Loading details...</span>
//                     </div>
//                   ) : (
//                       <div className="space-y-6">
//                       <div>
//                           <h3 className="text-xl font-bold text-white mb-2">
//                           {attemptDetails.jdText?.slice(0, 80)}...
//                           </h3>
//                           <p className="text-gray-400">
//                           Attempted on: {new Date(attemptDetails.startTime).toLocaleString()}
//                           </p>
//                         </div>

//                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                           <div className="text-center">
//                             <div className="text-2xl font-bold text-green-400">
//                             {attemptDetails.evaluation?.percentage != null ? `${attemptDetails.evaluation.percentage}%` : '--'}
//                             </div>
//                             <div className="text-sm text-gray-400">Score</div>
//                           </div>
//                           <div className="text-center">
//                             <div className="text-2xl font-bold text-blue-400">
//                               {attemptDetails.evaluation?.totalScore ?? '--'}
//                             </div>
//                             <div className="text-sm text-gray-400">Total Score</div>
//                           </div>
//                           <div className="text-center">
//                             <div className="text-2xl font-bold text-purple-400">
//                               {attemptDetails.timeTaken != null ? `${attemptDetails.timeTaken} min` : '--'}
//                             </div>
//                             <div className="text-sm text-gray-400">Time Taken</div>
//                           </div>
//                           <div className="text-center">
//                             <div className={`text-2xl font-bold ${attemptDetails.examStatus === 'completed' ? 'text-green-400' :
//                               attemptDetails.examStatus === 'timeout' ? 'text-red-400' : 'text-yellow-400'
//                               }`}>
//                               {attemptDetails.examStatus.charAt(0).toUpperCase() + attemptDetails.examStatus.slice(1)}
//                             </div>
//                             <div className="text-sm text-gray-400">Status</div>
//                         </div>
//                         </div>

//                         <Separator className="bg-gray-700" />

//                         <div className="space-y-4">
//                           <div>
//                             <h4 className="text-lg font-semibold text-white mb-2">Overall Feedback</h4>
//                             <p className="text-gray-300">
//                               {attemptDetails.evaluation?.overallFeedback ?? 'No feedback available.'}
//                             </p>
//                           </div>

//                           <div>
//                             <h4 className="text-lg font-semibold text-white mb-2">Areas to Improve</h4>
//                             <p className="text-gray-300">
//                             {Array.isArray(attemptDetails.evaluation?.areasToImprove) && attemptDetails.evaluation.areasToImprove.length > 0
//                               ? attemptDetails.evaluation.areasToImprove.join(', ')
//                                 : 'No specific areas identified.'}
//                             </p>
//                           </div>
//                         </div>

//                         <Separator className="bg-gray-700" />

//                         <div>
//                           <h4 className="text-lg font-semibold text-white mb-4">Question-wise Feedback</h4>
//                           <div className="space-y-4">
//                           {Array.isArray(attemptDetails.evaluation?.feedback) && attemptDetails.evaluation.feedback.length > 0 ? (
//                             attemptDetails.evaluation.feedback.map((fb, idx) => (
//                               <Card key={idx} className={`${fb.isCorrect ? 'bg-green-950/30 border-green-700' : 'bg-red-950/30 border-red-700'
//                                 }`}>
//                                 <CardContent className="p-4">
//                                   <div className="flex items-center gap-3 mb-3">
//                                     <Badge className={fb.isCorrect ? 'bg-green-600' : 'bg-red-600'}>
//                                       {fb.isCorrect ? 'Correct' : 'Wrong'}
//                                     </Badge>
//                                     <span className="text-white font-semibold">
//                                       Q{fb.questionIndex + 1} - {fb.skillFocus}
//                                     </span>
//                                   </div>

//                                   <div className="space-y-2 text-sm">
//                                     <p className="text-white font-medium">
//                                       {attemptDetails.questions[fb.questionIndex]?.question}
//                                     </p>
//                                     <p className="text-gray-300">
//                                       <span className="font-medium">Your Answer:</span> {attemptDetails.questions[fb.questionIndex]?.options?.[attemptDetails.userAnswers?.[fb.questionIndex]?.selectedOption] ?? 'N/A'}
//                                     </p>
//                                     <p className="text-gray-300">
//                                       <span className="font-medium">Correct Answer:</span> {fb.correctAnswer}
//                                     </p>
//                                     <p className="text-gray-300">
//                                       <span className="font-medium">Explanation:</span> {fb.explanation}
//                                     </p>
//                                     <p className="text-gray-300">
//                                       <span className="font-medium">Suggestion:</span> {fb.suggestion}
//                                     </p>
//                                   </div>
//                                 </CardContent>
//                               </Card>
//                             ))
//                           ) : (
//                                 <p className="text-gray-400">No feedback available.</p>
//                           )}
//                         </div>
//                         </div>
//                     </div>
//                   )}
//                 </DialogContent>
//               </Dialog>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// };

// export default MockTest;



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

  // Assessment history states
  const [attempts, setAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [attemptsError, setAttemptsError] = useState(null);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [attemptDetails, setAttemptDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Exam result state
  const [examResult, setExamResult] = useState(null);
  const [submittingExam, setSubmittingExam] = useState(false);

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

  // Fetch attempts when entering history view
  useEffect(() => {
    if (currentView === 'history') {
      fetchAttempts();
    }
    // eslint-disable-next-line
  }, [currentView]);

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

  const fetchAttempts = async () => {
    setLoadingAttempts(true);
    setAttemptsError(null);
    setAttempts([]);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/mocktest/attempts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttempts(Array.isArray(response.data.attempts) ? response.data.attempts : []);
    } catch (error) {
      setAttemptsError('Failed to load assessment attempts. Please login again.');
    } finally {
      setLoadingAttempts(false);
    }
  };

  const fetchAttemptDetails = async (attemptId) => {
    setLoadingDetails(true);
    setAttemptDetails(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5001/api/mocktest/result/${attemptId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttemptDetails(response.data.mockTest);
    } catch (error) {
      setAttemptDetails(null);
      alert('Failed to load attempt details.');
    } finally {
      setLoadingDetails(false);
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
    if (!currentExam || submittingExam) return;

    setSubmittingExam(true);
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
      // Store the results
      setExamResult(response.data.result);
      setCurrentView('results');

    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Failed to submit exam. Please try again.');
    } finally {
      setSubmittingExam(false);
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
                    disabled={submittingExam}
                    style={{
                      background: submittingExam 
                        ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' 
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: 8,
                      cursor: submittingExam ? 'not-allowed' : 'pointer',
                      fontSize: 16,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: submittingExam ? 0.8 : 1
                    }}
                  >
                    {submittingExam ? (
                      <>
                        <span style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid white',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                        Please wait, submitting...
                      </>
                    ) : (
                      'Submit Exam'
                    )}
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
          {currentView === 'results' && examResult && (
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <h2 style={{
                color: '#1e293b',
                fontSize: 28,
                fontWeight: 700,
                marginBottom: 16,
                textAlign: 'center'
              }}>
                Assessment Completed! 🎉
              </h2>
              
              {/* Score Display */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 16,
                padding: 32,
                textAlign: 'center',
                marginBottom: 24,
                color: 'white'
              }}>
                <div style={{ fontSize: 64, fontWeight: 700 }}>
                  {examResult.percentage}%
                </div>
                <div style={{ fontSize: 18, opacity: 0.9 }}>
                  Score: {examResult.totalScore} / {currentExam?.questions?.length || questionCount}
                </div>
                {examResult.timeTaken && (
                  <div style={{ fontSize: 14, opacity: 0.8, marginTop: 8 }}>
                    Time taken: {examResult.timeTaken} minutes
                  </div>
                )}
              </div>

              {/* Overall Feedback */}
              {examResult.overallFeedback && (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 24
                }}>
                  <h3 style={{ color: '#166534', marginBottom: 8, fontSize: 16, fontWeight: 600 }}>
                    Overall Feedback
                  </h3>
                  <p style={{ color: '#15803d', margin: 0, lineHeight: 1.6 }}>
                    {examResult.overallFeedback}
                  </p>
                </div>
              )}

              {/* Areas to Improve */}
              {examResult.areasToImprove && examResult.areasToImprove.length > 0 && (
                <div style={{
                  background: '#fef3c7',
                  border: '1px solid #fcd34d',
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 24
                }}>
                  <h3 style={{ color: '#92400e', marginBottom: 12, fontSize: 16, fontWeight: 600 }}>
                    Areas to Improve
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {examResult.areasToImprove.map((area, idx) => (
                      <span key={idx} style={{
                        background: '#fef08a',
                        color: '#854d0e',
                        padding: '6px 12px',
                        borderRadius: 20,
                        fontSize: 14,
                        fontWeight: 500
                      }}>
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Question-wise Feedback */}
              {examResult.feedback && examResult.feedback.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ color: '#1e293b', marginBottom: 16, fontSize: 18, fontWeight: 600 }}>
                    Question-wise Feedback
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {examResult.feedback.map((fb, idx) => (
                      <div key={idx} style={{
                        background: fb.isCorrect ? '#f0fdf4' : '#fef2f2',
                        border: `1px solid ${fb.isCorrect ? '#86efac' : '#fca5a5'}`,
                        borderRadius: 12,
                        padding: 16
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <span style={{ fontSize: 20 }}>{fb.isCorrect ? '✅' : '❌'}</span>
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>Question {idx + 1}</span>
                          {fb.skillFocus && (
                            <span style={{
                              background: '#e0e7ff',
                              color: '#4338ca',
                              padding: '2px 8px',
                              borderRadius: 12,
                              fontSize: 12
                            }}>
                              {fb.skillFocus}
                            </span>
                          )}
                        </div>
                        <p style={{ color: '#475569', margin: '0 0 8px 0', fontSize: 14 }}>
                          <b>Correct Answer:</b> {fb.correctAnswer}
                        </p>
                        {fb.explanation && (
                          <p style={{ color: '#64748b', margin: '0 0 8px 0', fontSize: 14 }}>
                            <b>Explanation:</b> {fb.explanation}
                          </p>
                        )}
                        {!fb.isCorrect && fb.suggestion && (
                          <p style={{ color: '#ea580c', margin: 0, fontSize: 14 }}>
                            <b>💡 Tip:</b> {fb.suggestion}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    setCurrentView('main');
                    setExamResult(null);
                    setCurrentExam(null);
                    setExamStarted(false);
                  }}
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
                <button
                  onClick={() => setCurrentView('history')}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    padding: '16px 32px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    fontSize: 16,
                    fontWeight: 600
                  }}
                >
                  View History
                </button>
              </div>
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
              {loadingAttempts ? (
                <div style={{ color: '#667eea', fontWeight: 600, fontSize: 18, margin: '40px 0' }}>Loading attempts...</div>
              ) : attemptsError ? (
                <div style={{ color: '#dc2626', fontWeight: 600, fontSize: 16, margin: '40px 0' }}>{attemptsError}</div>
              ) : attempts.length === 0 ? (
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
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: 24,
                  margin: '0 auto',
                  maxWidth: 900
                }}>
                  {attempts.map(attempt => (
                    <div
                      key={attempt.id}
                      onClick={() => {
                        setSelectedAttempt(attempt.id);
                        fetchAttemptDetails(attempt.id);
                      }}
                      style={{
                        background: '#f8fafc',
                        border: '2px solid #e2e8f0',
                        borderRadius: 14,
                        padding: 28,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(16,24,40,0.06)',
                        transition: 'box-shadow 0.2s',
                        textAlign: 'left',
                        position: 'relative',
                        minHeight: 180
                      }}
                    >
                      <div style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: '#1e293b',
                        marginBottom: 8
                      }}>{attempt.jdText?.slice(0, 60)}...</div>
                      <div style={{ color: '#64748b', fontSize: 14, marginBottom: 8 }}>
                        {new Date(attempt.startTime).toLocaleString()}
                      </div>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ color: '#10b981', fontWeight: 700, fontSize: 16 }}>
                          {attempt.evaluation?.percentage != null ? `${attempt.evaluation.percentage}%` : '--'}
                        </span>
                        <span style={{ color: '#64748b', fontSize: 14 }}>
                          Score: {attempt.evaluation?.totalScore ?? '--'}
                        </span>
                        <span style={{
                          color: attempt.examStatus === 'completed' ? '#10b981' : attempt.examStatus === 'timeout' ? '#ef4444' : '#f59e0b',
                          fontWeight: 600,
                          fontSize: 14
                        }}>
                          {attempt.examStatus.charAt(0).toUpperCase() + attempt.examStatus.slice(1)}
                        </span>
                      </div>
                      <div style={{ color: '#64748b', fontSize: 14 }}>
                        Time Taken: {attempt.timeTaken != null ? `${attempt.timeTaken} min` : '--'}
                      </div>
                      <div style={{
                        position: 'absolute',
                        top: 18,
                        right: 18,
                        background: '#667eea',
                        color: 'white',
                        borderRadius: 8,
                        padding: '4px 12px',
                        fontSize: 13,
                        fontWeight: 600
                      }}>
                        View Details
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Attempt Details Modal */}
              {selectedAttempt && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  background: 'rgba(30,41,59,0.45)',
                  zIndex: 1000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    background: 'white',
                    borderRadius: 16,
                    maxWidth: 700,
                    width: '95vw',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 8px 32px rgba(16,24,40,0.18)',
                    padding: 36,
                    position: 'relative'
                  }}>
                    <button
                      onClick={() => {
                        setSelectedAttempt(null);
                        setAttemptDetails(null);
                      }}
                      style={{
                        position: 'absolute',
                        top: 18,
                        right: 18,
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 16px',
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: 'pointer',
                        zIndex: 10
                      }}
                    >
                      Close
                    </button>
                    {loadingDetails || !attemptDetails ? (
                      <div style={{ color: '#667eea', fontWeight: 600, fontSize: 18, margin: '40px 0' }}>Loading details...</div>
                    ) : (
                      <div>
                        <h2 style={{ color: '#1e293b', fontWeight: 800, fontSize: 24, marginBottom: 8 }}>
                          {attemptDetails.jdText?.slice(0, 80)}...
                        </h2>
                        <div style={{ color: '#64748b', fontSize: 15, marginBottom: 12 }}>
                          Attempted on: {new Date(attemptDetails.startTime).toLocaleString()}
                        </div>
                        <div style={{ display: 'flex', gap: 24, marginBottom: 18 }}>
                          <span style={{ color: '#10b981', fontWeight: 700, fontSize: 18 }}>
                            {attemptDetails.evaluation?.percentage != null ? `${attemptDetails.evaluation.percentage}%` : '--'}
                          </span>
                          <span style={{ color: '#64748b', fontSize: 15 }}>
                            Score: {attemptDetails.evaluation?.totalScore ?? '--'}
                          </span>
                          <span style={{ color: '#64748b', fontSize: 15 }}>
                            Time Taken: {attemptDetails.timeTaken != null ? `${attemptDetails.timeTaken} min` : '--'}
                          </span>
                          <span style={{
                            color: attemptDetails.examStatus === 'completed' ? '#10b981' : attemptDetails.examStatus === 'timeout' ? '#ef4444' : '#f59e0b',
                            fontWeight: 600,
                            fontSize: 15
                          }}>
                            {attemptDetails.examStatus.charAt(0).toUpperCase() + attemptDetails.examStatus.slice(1)}
                          </span>
                        </div>
                        <div style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 10,
                          padding: 18,
                          marginBottom: 18
                        }}>
                          <div style={{ color: '#1e293b', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Overall Feedback</div>
                          <div style={{ color: '#64748b', fontSize: 15 }}>{attemptDetails.evaluation?.overallFeedback ?? 'No feedback.'}</div>
                        </div>
                        <div style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 10,
                          padding: 18,
                          marginBottom: 18
                        }}>
                          <div style={{ color: '#1e293b', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Areas to Improve</div>
                          <div style={{ color: '#64748b', fontSize: 15 }}>
                            {Array.isArray(attemptDetails.evaluation?.areasToImprove) && attemptDetails.evaluation.areasToImprove.length > 0
                              ? attemptDetails.evaluation.areasToImprove.join(', ')
                              : 'No specific areas.'}
                          </div>
                        </div>
                        <div style={{ color: '#1e293b', fontWeight: 700, fontSize: 18, margin: '18px 0 10px 0' }}>Question-wise Feedback</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                          {Array.isArray(attemptDetails.evaluation?.feedback) && attemptDetails.evaluation.feedback.length > 0 ? (
                            attemptDetails.evaluation.feedback.map((fb, idx) => (
                              <div key={idx} style={{
                                background: fb.isCorrect ? '#e0f7fa' : '#fef2f2',
                                border: `2px solid ${fb.isCorrect ? '#10b981' : '#ef4444'}`,
                                borderRadius: 10,
                                padding: 18
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                  <span style={{
                                    background: fb.isCorrect ? '#10b981' : '#ef4444',
                                    color: 'white',
                                    borderRadius: 6,
                                    padding: '2px 10px',
                                    fontWeight: 700,
                                    fontSize: 14
                                  }}>{fb.isCorrect ? 'Correct' : 'Wrong'}</span>
                                  <span style={{ color: '#1e293b', fontWeight: 600, fontSize: 15 }}>
                                    Q{fb.questionIndex + 1} - {fb.skillFocus}
                                  </span>
                                </div>
                                <div style={{ color: '#1e293b', fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
                                  {attemptDetails.questions[fb.questionIndex]?.question}
                                </div>
                                <div style={{ color: '#64748b', fontSize: 15, marginBottom: 6 }}>
                                  <b>Your Answer:</b> {attemptDetails.questions[fb.questionIndex]?.options?.[attemptDetails.userAnswers?.[fb.questionIndex]?.selectedOption] ?? 'N/A'}
                                </div>
                                <div style={{ color: '#64748b', fontSize: 15, marginBottom: 6 }}>
                                  <b>Correct Answer:</b> {fb.correctAnswer}
                                </div>
                                <div style={{ color: '#64748b', fontSize: 15, marginBottom: 6 }}>
                                  <b>Explanation:</b> {fb.explanation}
                                </div>
                                <div style={{ color: '#64748b', fontSize: 15 }}>
                                  <b>Suggestion:</b> {fb.suggestion}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div style={{ color: '#64748b', fontSize: 15 }}>No feedback available.</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
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