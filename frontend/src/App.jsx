// import ResumeUpload from './pages/ResumeUpload';

// function App() {
//   return <ResumeUpload/>;
// }
// export default App;

//src/App.jsx
// App.jsx


// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import Login from "./pages/Login";
// import Home from "./pages/Home";

// const App = () => {
//   const token = localStorage.getItem("token");

//   return (
//     <Routes>
//       <Route path="/login" element={<Login />} />
//       {/* <Route
//         path="/"
//         element={token ? <Home /> : <Navigate to="/login" replace />}
//       /> */}
//       <Route path="/home" element={<Home />} />
//       <Route
//         path="*"
//         element={<Navigate to={token ? "/" : "/login"} replace />}
//       />
//     </Routes>
//   );
// };

// export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './pages/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import ResumeUpload from './pages/ResumeUpload';
import Profile from './pages/Profile';
import AtsAnalysis from './pages/AtsAnalysis';
import Resources from './pages/Resources';
// import other pages as needed

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/resume-upload" element={<ResumeUpload />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ats-analysis" element={<AtsAnalysis />} />
        <Route path="/resources" element={<Resources />} />
        {/* Add other routes here */}
      </Routes>
    </>
  );
}

export default App;
