import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../assets/tech-parallex.json';
import '../styles/landingpage.css';
import { Button } from '../components/ui/Button';
import { Rocket, Star, Activity, Layers, Lightbulb, Users, HelpCircle, MessageCircle } from 'lucide-react';
import { Parallax } from 'react-parallax';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere, Box } from '@react-three/drei';
import '@fontsource/orbitron/700.css';

const features = [
  {
    icon: <Rocket size={32} color="#0d6efd" />, title: 'AI Resume Match', desc: 'Match your resume with job descriptions using AI and get instant scores.'
  },
  {
    icon: <Activity size={32} color="#28a745" />, title: 'Mock Exams', desc: 'Take JD-specific mock tests to sharpen your skills before applying.'
  },
  {
    icon: <Star size={32} color="#ffc107" />, title: 'Interview Feedback', desc: 'Practice mock interviews and get personalized feedback.'
  },
  {
    icon: <Lightbulb size={32} color="#17a2b8" />, title: 'Insights & Resources', desc: 'Access curated resources to fill your skill gaps.'
  },
  {
    icon: <Layers size={32} color="#dc3545" />, title: 'Track Progress', desc: 'See your growth over time with detailed dashboards.'
  },
];

const howItWorks = [
  { step: 1, title: 'Upload Resume', desc: 'Easily upload your resume and job description.' },
  { step: 2, title: 'AI Analysis', desc: 'Our AI matches your skills and highlights gaps.' },
  { step: 3, title: 'Practice & Improve', desc: 'Take mock tests and interviews to level up.' },
  { step: 4, title: 'Track Progress', desc: 'Monitor your growth with dashboards.' },
];

const testimonials = [
  { name: 'Amit S.', role: 'Software Engineer', quote: 'NextHire helped me land my dream job with its AI-powered feedback and mock interviews!' },
  { name: 'Priya R.', role: 'Data Analyst', quote: 'The resume matcher and resources are top-notch. Highly recommended!' },
  { name: 'John D.', role: 'Product Manager', quote: 'The dashboard and progress tracking kept me motivated throughout my job search.' },
];

const team = [
  { name: 'Rohit Sharma', role: 'Founder & CEO', img: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Sneha Patel', role: 'CTO', img: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'Alex Kim', role: 'Lead Designer', img: 'https://randomuser.me/api/portraits/men/65.jpg' },
];

const faqs = [
  { q: 'How does the AI resume matcher work?', a: 'It analyzes your resume and compares it to job descriptions using advanced NLP.' },
  { q: 'Is my data secure?', a: 'Absolutely. We use industry-standard encryption and never share your data.' },
  { q: 'Can I use mock interviews for any role?', a: 'Yes, our platform supports a wide range of job roles and industries.' },
];

const Home = () => {
  return (
    <div className="landing-root" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* 3D Universe Background */}
      <Canvas className="universe-3d-bg" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
        <ambientLight intensity={0.5} />
        <Stars radius={120} depth={80} count={9000} factor={6} fade speed={1} />
        {/* Add some floating 3D shapes for extra depth */}
        <Sphere args={[1, 32, 32]} position={[-8, 2, -10]}>
          <meshStandardMaterial color="#0ff" transparent opacity={0.18} />
        </Sphere>
        <Box args={[1.5, 1.5, 1.5]} position={[7, -2, -8]}>
          <meshStandardMaterial color="#0d6efd" transparent opacity={0.13} />
        </Box>
        <Sphere args={[0.7, 32, 32]} position={[2, 5, -7]}>
          <meshStandardMaterial color="#ff00cc" transparent opacity={0.15} />
        </Sphere>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.3} />
      </Canvas>
      {/* Centered Hero Section */}
      <section className="hero-section-glass" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
        <motion.div
          className='hero-glass-card'
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className='hero-title-futuristic'>NextHire: <span>Empowering Careers</span></h1>
          <p className='hero-subtitle-futuristic'>AI-powered, 3D, and human-centric job matching for the next generation of talent.</p>
          <Button className='cta-btn-glass'>Get Started</Button>
        </motion.div>
      </section>
      {/* Features Section with 3D/animated cards */}
      <section id="features" className="section features-section bg-light" style={{ position: 'relative', zIndex: 2 }}>
        <h2 className="section-title">Features</h2>
        <div className="features-flex">
          {features.map((feat, idx) => (
            <motion.div
              className="feature-card glass-card-3d"
              key={idx}
              whileHover={{ scale: 1.07, boxShadow: '0 8px 32px #0ff7' }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <div className="feature-icon">{feat.icon}</div>
              <h3 className="feature-title">{feat.title}</h3>
              <p className="feature-desc">{feat.desc}</p>
              {/* Add a floating 3D sphere for each card */}
              <Canvas className="feature-3d-canvas">
                <ambientLight intensity={0.3} />
                <Sphere args={[0.3, 32, 32]} position={[0, 0, 0]}>
                  <meshStandardMaterial color="#0ff" transparent opacity={0.18} />
                </Sphere>
              </Canvas>
            </motion.div>
          ))}
        </div>
      </section>
      {/* How It Works Section with animated steps */}
      <section id="how-it-works" className="section howitworks-section" style={{ position: 'relative', zIndex: 2 }}>
        <h2 className="section-title">How It Works</h2>
        <div className="howitworks-steps">
          {howItWorks.map((step, idx) => (
            <motion.div
              className="howitworks-step glass-card-3d"
              key={idx}
              whileHover={{ scale: 1.05, boxShadow: '0 4px 16px #0ff7' }}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <div className="howitworks-stepnum">{step.step}</div>
              <h4 className="howitworks-title">{step.title}</h4>
              <p className="howitworks-desc">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
      {/* Testimonials Section with glass cards */}
      <section id="testimonials" className="section testimonials-section" style={{ position: 'relative', zIndex: 2 }}>
        <h2 className="section-title">Testimonials</h2>
        <div className="testimonials-grid">
          {testimonials.map((t, idx) => (
            <motion.div
              className="testimonial-card glass-card-3d"
              key={idx}
              whileHover={{ scale: 1.04, boxShadow: '0 4px 16px #0ff7' }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <MessageCircle size={32} color="#0d6efd" />
              <p className="testimonial-quote">"{t.quote}"</p>
              <div className="testimonial-user">
                <span className="testimonial-name">{t.name}</span>
                <span className="testimonial-role">{t.role}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      {/* Team Section with glass cards */}
      <section id="team" className="section team-section bg-light" style={{ position: 'relative', zIndex: 2 }}>
        <h2 className="section-title">Meet the Team</h2>
        <div className="team-row">
          {team.map((member, idx) => (
            <motion.div
              className="team-card glass-card-3d"
              key={idx}
              whileHover={{ scale: 1.04, boxShadow: '0 4px 16px #0ff7' }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <img src={member.img} alt={member.name} className="team-img" />
              <h4 className="team-name">{member.name}</h4>
              <span className="team-role">{member.role}</span>
            </motion.div>
          ))}
        </div>
      </section>
      {/* FAQ Section with glass cards */}
      <section id="faq" className="section faq-section" style={{ position: 'relative', zIndex: 2 }}>
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq, idx) => (
            <motion.details
              className="faq-item glass-card-3d"
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
            >
              <summary className="faq-question"><HelpCircle size={20} /> {faq.q}</summary>
              <div className="faq-answer">{faq.a}</div>
            </motion.details>
          ))}
        </div>
      </section>
      {/* Contact Section with glass card */}
      <section id="contact" className="section contact-section bg-light" style={{ position: 'relative', zIndex: 2 }}>
        <h2 className="section-title">Contact Us</h2>
        <motion.form className="contact-form glass-card-3d"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={e => e.preventDefault()}>
          <input type="text" className="contact-input" placeholder="Your Name" required />
          <input type="email" className="contact-input" placeholder="Your Email" required />
          <textarea className="contact-input" placeholder="Your Message" rows={4} required />
          <Button className="contact-btn" type="submit">Send Message</Button>
        </motion.form>
      </section>
      {/* Footer */}
      <footer className="footer" style={{ position: 'relative', zIndex: 2 }}>
        &copy; {new Date().getFullYear()} NextHire. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;