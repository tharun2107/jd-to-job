import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../assets/tech-parallex.json';
import '../styles/landingpage.css';
import { Button } from '../components/ui/Button';
import { Rocket, Star, Activity, Layers, Lightbulb, Users, HelpCircle, MessageCircle } from 'lucide-react';

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
    <div className="landing-root">
      {/* Hero Section */}
      <section className="section hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Your Career, Supercharged <span role="img" aria-label="zap">⚡</span></h1>
            <p className="hero-subtitle">
              Conquer job descriptions with intelligent resume matching, personalized mock tests, and interview prep tailored for success.
            </p>
            <Button className="cta-btn" onClick={() => window.location.href = '/login'}>Get Started Now</Button>
          </div>
          <div className="hero-animation">
            <div className="parallax-container">
              <Lottie animationData={animationData} className="lottie-animation" />
              <div className="parallax-bg" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section features-section bg-light">
        <h2 className="section-title">Features</h2>
        <div className="features-grid">
          {features.map((feat, idx) => (
            <div className="feature-card" key={idx}>
              <div className="feature-icon">{feat.icon}</div>
              <h3 className="feature-title">{feat.title}</h3>
              <p className="feature-desc">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section howitworks-section">
        <h2 className="section-title">How It Works</h2>
        <div className="howitworks-steps">
          {howItWorks.map((step, idx) => (
            <div className="howitworks-step" key={idx}>
              <div className="howitworks-stepnum">{step.step}</div>
              <h4 className="howitworks-title">{step.title}</h4>
              <p className="howitworks-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="section testimonials-section">
        <h2 className="section-title">Testimonials</h2>
        <div className="testimonials-grid">
          {testimonials.map((t, idx) => (
            <div className="testimonial-card" key={idx}>
              <MessageCircle size={32} color="#0d6efd" />
              <p className="testimonial-quote">"{t.quote}"</p>
              <div className="testimonial-user">
                <span className="testimonial-name">{t.name}</span>
                <span className="testimonial-role">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="section team-section bg-light">
        <h2 className="section-title">Meet the Team</h2>
        <div className="team-grid">
          {team.map((member, idx) => (
            <div className="team-card" key={idx}>
              <img src={member.img} alt={member.name} className="team-img" />
              <h4 className="team-name">{member.name}</h4>
              <span className="team-role">{member.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section faq-section">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq, idx) => (
            <details className="faq-item" key={idx}>
              <summary className="faq-question"><HelpCircle size={20} /> {faq.q}</summary>
              <div className="faq-answer">{faq.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section contact-section bg-light">
        <h2 className="section-title">Contact Us</h2>
        <form className="contact-form" onSubmit={e => e.preventDefault()}>
          <input type="text" className="contact-input" placeholder="Your Name" required />
          <input type="email" className="contact-input" placeholder="Your Email" required />
          <textarea className="contact-input" placeholder="Your Message" rows={4} required />
          <Button className="contact-btn" type="submit">Send Message</Button>
        </form>
      </section>

      {/* Footer */}
      <footer className="footer">
        &copy; {new Date().getFullYear()} NextHire. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;