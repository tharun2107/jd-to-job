// // src/pages/Home.js
// import React from "react";

// const Home = () => {
//   const user = JSON.parse(localStorage.getItem("user"));

//   const logout = () => {
//     localStorage.clear();
//     window.location.href = "/login";
//   };

//   return (
//     <div className="container text-center mt-5">
//       <h2>Welcome, {user?.name}</h2>
//       <img src={user?.profilePic} alt="Profile" width="100" className="rounded-circle" />
//       <p>{user?.email}</p>
//       <button className="btn btn-danger mt-3" onClick={logout}>Logout</button>
//     </div>
//   );
// };

// export default Home;

// import React from "react";
// import { Rocket, Star, Activity, Layers, Lightbulb } from "lucide-react";
// import { Button } from "../components/ui/Button";
// import { motion } from "framer-motion";

// const features = [
//   {
//     icon: <Rocket className="text-primary" size={32} />,
//     title: "AI Resume Match",
//     desc: "Match your resume with job descriptions using AI and get instant scores.",
//   },
//   {
//     icon: <Activity className="text-success" size={32} />,
//     title: "Mock Exams",
//     desc: "Take JD-specific mock tests to sharpen your skills before applying.",
//   },
//   {
//     icon: <Star className="text-warning" size={32} />,
//     title: "Interview Feedback",
//     desc: "Practice mock interviews and get personalized feedback.",
//   },
//   {
//     icon: <Lightbulb className="text-info" size={32} />,
//     title: "Insights & Resources",
//     desc: "Access curated resources to fill your skill gaps.",
//   },
//   {
//     icon: <Layers className="text-danger" size={32} />,
//     title: "Track Progress",
//     desc: "See your growth over time with detailed dashboards.",
//   },
// ];

// export default function HomePage() {
//   return (
//     <div className="bg-dark text-light">
//       {/* Navbar */}
//       <nav className="navbar navbar-expand-lg navbar-dark bg-black sticky-top shadow">
//         <div className="container-fluid">
//           <a className="navbar-brand fw-bold" href="#">CareerForge 🚀</a>
//           <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
//             <span className="navbar-toggler-icon" />
//           </button>
//           <div className="collapse navbar-collapse" id="navbarNav">
//             <ul className="navbar-nav me-auto mb-2 mb-lg-0">
//               <li className="nav-item"><a className="nav-link" href="#about">About</a></li>
//               <li className="nav-item"><a className="nav-link" href="#features">Features</a></li>
//               <li className="nav-item"><a className="nav-link" href="#contact">Contact</a></li>
//             </ul>
//             <Button className="btn btn-primary">Login</Button>
//           </div>
//         </div>
//       </nav>

//       {/* Hero */}
//       <section className="container py-5 d-flex flex-column flex-md-row align-items-center justify-content-between">
//         <div className="col-md-6">
//           <motion.h1
//             className="display-4 fw-bold"
//             initial={{ opacity: 0, y: -50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 1 }}
//           >
//             Your Career, Supercharged ⚡
//           </motion.h1>
//           <p className="lead mt-3 text-light">
//             We help you conquer job descriptions with intelligent resume matching, personalized mock tests, and interview prep tailored for success.
//           </p>
//           <Button className="btn btn-primary btn-lg mt-3">Get Started Now</Button>
//         </div>
//         <motion.img
//           src="https://source.unsplash.com/720x600/?startup,tech"
//           alt="Hero"
//           className="img-fluid rounded-4 shadow-lg mt-5 mt-md-0"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.5 }}
//         />
//       </section>

//       {/* Features */}
//       <section id="features" className="bg-black py-5">
//         <div className="container">
//           <h2 className="text-center mb-5 display-5 fw-bold">Features</h2>
//           <div className="row">
//             {features.map((feat, index) => (
//               <motion.div
//                 key={index}
//                 className="col-md-4 mb-4"
//                 whileHover={{ scale: 1.05 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <div className="card bg-dark text-light h-100 p-3 border-secondary">
//                   <div className="mb-3">{feat.icon}</div>
//                   <h5 className="card-title">{feat.title}</h5>
//                   <p className="card-text">{feat.desc}</p>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* About */}
//       <section id="about" className="bg-secondary py-5">
//         <div className="container text-center text-white">
//           <h2 className="display-5 fw-bold">About Us</h2>
//           <p className="lead mt-3">
//             CareerForge is more than a tool — it’s your career accelerator.
//             We combine AI with expert insights to help you land your dream job faster.
//           </p>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer id="contact" className="bg-black text-center text-muted py-3">
//         &copy; {new Date().getFullYear()} CareerForge. All rights reserved.
//       </footer>
//     </div>
//   );
// }

// import React, { useState } from "react";
// import { Rocket, Star, Activity, Layers, Lightbulb } from "lucide-react";
// import { motion } from "framer-motion";
// import { Button } from "../components/ui/Button";
// import Lottie from "lottie-react";
// import animationData from "../assets/tech-parallex.json"
// import Navbar from "./Navbar";
// const features = [
//   {
//     icon: <Rocket className="text-primary" size={32} />,
//     title: "AI Resume Match",
//     desc: "Match your resume with job descriptions using AI and get instant scores.",
//   },
//   {
//     icon: <Activity className="text-success" size={32} />,
//     title: "Mock Exams",
//     desc: "Take JD-specific mock tests to sharpen your skills before applying.",
//   },
//   {
//     icon: <Star className="text-warning" size={32} />,
//     title: "Interview Feedback",
//     desc: "Practice mock interviews and get personalized feedback.",
//   },
//   {
//     icon: <Lightbulb className="text-info" size={32} />,
//     title: "Insights & Resources",
//     desc: "Access curated resources to fill your skill gaps.",
//   },
//   {
//     icon: <Layers className="text-danger" size={32} />,
//     title: "Track Progress",
//     desc: "See your growth over time with detailed dashboards.",
//   },
// ];

// export default function HomePage() {
//   const [navOpen, setNavOpen] = useState(false);

//   return (
//     <div className="bg-dark text-light">

// <Navbar/>

//       {/* Hero */}
//       <section className="container py-5 d-flex flex-column flex-lg-row align-items-center justify-content-between">
//         <div className="col-lg-6 text-center text-lg-start">
//           <motion.h1
//             className="display-4 fw-bold"
//             initial={{ opacity: 0, y: -50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 1 }}
//           >
//             Your Career, Supercharged ⚡
//           </motion.h1>
//           <p className="lead mt-3">
//             We help you conquer job descriptions with intelligent resume matching, personalized mock tests, and interview prep tailored for success.
//           </p>
//           <Button className="btn btn-primary btn-lg mt-3">Get Started Now</Button>
//         </div>
//         <motion.div
//           className="col-lg-6 mt-5 mt-lg-0 text-center"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.5 }}
//         >
//           <Lottie animationData={animationData} style={{ height: "auto", maxHeight: 400, width: "100%" }} />
//         </motion.div>
//       </section>

//       {/* Features */}
//       <section id="features" className="bg-black py-5">
//         <div className="container">
//           <h2 className="text-center mb-5 display-5 fw-bold">Features</h2>
//           <div className="row">
//             {features.map((feat, index) => (
//               <motion.div
//                 key={index}
//                 className="col-12 col-md-6 col-lg-4 mb-4"
//                 whileHover={{ scale: 1.05 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <div className="card bg-dark text-light h-100 p-3 border-secondary">
//                   <div className="mb-3">{feat.icon}</div>
//                   <h5 className="card-title">{feat.title}</h5>
//                   <p className="card-text">{feat.desc}</p>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* About */}
//       <section id="about" className="py-5" style={{ background: "linear-gradient(135deg, #1c1c1c, #2b2b2b)" }}>
//         <div className="container text-center text-white">
//           <h2 className="display-5 fw-bold mb-4">About Us</h2>
//           <p className="lead px-3 px-md-5">
//             CareerForge is more than a tool — it’s your career accelerator.
//             We combine AI with expert insights to help you land your dream job faster.
//             Analyze your resume, take mock tests, prepare for interviews and level up — all in one place.
//           </p>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer id="contact" className="bg-black text-center text-muted py-3">
//         &copy; {new Date().getFullYear()} CareerForge. All rights reserved.
//       </footer>
//     </div>
//   );
// }

import React from 'react';

const Home = () => {
  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Welcome to NextHire 🚀</h1>
      <p className="lead text-center">Your one-stop platform for ATS-based Resume Analysis, Learning Resources, Mock Tests, and Interview Simulations.</p>

      <div className="row mt-5">
        <div className="col-md-6">
          <h3>📄 Resume + JD Analyzer</h3>
          <p>Upload your resume and job description to see ATS score, matched & missing skills, and recommended improvements.</p>
        </div>

        <div className="col-md-6">
          <h3>🎯 Mock Tests & Interview</h3>
          <p>Test your skills through realistic mock exams and simulated interviews aligned with your job role and skills.</p>
        </div>
      </div>

      <div className="mt-5 text-center">
        <h4>Ready to get hired?</h4>
        <p>Login using your Google account to get started!</p>
      </div>
    </div>
  );
};

export default Home;
