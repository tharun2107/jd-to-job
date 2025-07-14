import React from "react";
import Navbar from "./pages/Navbar";
import Footer from "./pages/Footer";
import Home from "./pages/Home";
import "../styles/landingPage.css"; // Import your custom CSS for the landing page

function LandingPage() {
  return (
    <>
      <Navbar />
      <Home />
      <Footer />
    </>
  );
}

export default LandingPage;
