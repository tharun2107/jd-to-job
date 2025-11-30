import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import animationData from '../assets/tech-parallex.json';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../components/ui';
import {
  Rocket,
  Star,
  Zap,
  Target,
  TrendingUp,
  Globe,
  Shield,
  ArrowRight,
  CheckCircle,
  MessageCircle,
  Users,
  Award,
  Play,
  ArrowUpRight,
  CheckCircle2,
  BarChart3,
  Brain,
  Cpu,
  Database,
  Lock
} from 'lucide-react';

const features = [
  {
    icon: <Rocket className="h-6 w-6" />,
    title: "AI-Powered ATS Analysis",
    desc: "Advanced resume parsing with intelligent skill matching and scoring algorithms.",
    color: "text-blue-400",
    link: "/resume-upload"
  },
  {
    icon: <Target className="h-6 w-6" />,
    title: "Smart Job Matching",
    desc: "Precise job-description analysis with personalized recommendations.",
    color: "text-green-400",
    link: "/ats-analysis"
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Mock Assessments",
    desc: "AI-generated tests based on job requirements with detailed feedback.",
    color: "text-purple-400",
    link: "/mock-test"
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Performance Tracking",
    desc: "Comprehensive analytics and progress monitoring for career growth.",
    color: "text-orange-400",
    link: "/dashboard"
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Learning Resources",
    desc: "Curated educational content and skill development materials.",
    color: "text-cyan-400",
    link: "/resources"
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Secure & Private",
    desc: "Enterprise-grade security with complete data privacy protection.",
    color: "text-red-400",
    link: "/profile"
  }
];

const testimonials = [
  {
    quote: "NextHire helped me understand exactly what employers are looking for. My ATS score improved by 40%!",
    name: "Sarah Johnson",
    role: "Software Engineer",
    company: "TechCorp",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    improvement: "40%"
  },
  {
    quote: "The mock tests are incredibly realistic. I felt much more confident in my actual interviews.",
    name: "Michael Chen",
    role: "Product Manager",
    company: "InnovateLab",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    improvement: "85%"
  },
  {
    quote: "Finally, a platform that actually helps you improve rather than just analyze. Highly recommended!",
    name: "Emily Rodriguez",
    role: "UX Designer",
    company: "DesignStudio",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    improvement: "92%"
  }
];

const faqs = [
  {
    q: "How accurate is the ATS analysis?",
    a: "Our AI-powered analysis achieves 95%+ accuracy in skill matching and scoring, using advanced NLP and machine learning algorithms."
  },
  {
    q: "What file formats are supported?",
    a: "We support PDF, DOCX, and TXT formats for resumes. Job descriptions can be pasted as text or uploaded as documents."
  },
  {
    q: "Are my data and resumes secure?",
    a: "Absolutely. We use enterprise-grade encryption and never share your data with third parties. Your privacy is our top priority."
  },
  {
    q: "How do the mock tests work?",
    a: "Mock tests are generated using AI based on the job description skills. Questions are tailored to the specific role and experience level."
  },
  {
    q: "Can I retake assessments?",
    a: "Yes! You can retake assessments multiple times to track your improvement and practice different scenarios."
  }
];

const stats = [
  { number: "50K+", label: "Active Users", icon: <Users className="h-5 w-5" /> },
  { number: "95%", label: "ATS Accuracy", icon: <CheckCircle2 className="h-5 w-5" /> },
  { number: "2M+", label: "Resumes Analyzed", icon: <Database className="h-5 w-5" /> },
  { number: "500+", label: "Companies Trust Us", icon: <Shield className="h-5 w-5" /> }
];

const Home = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="container mx-auto px-4 py-24 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 1.2,
                  ease: "easeOut",
                  delay: 0.2
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <Badge variant="secondary" className="mb-6 bg-blue-900/20 text-blue-300 border-blue-700">
                    <Star className="h-3 w-3 mr-1" />
                    AI-Powered Career Platform
                  </Badge>
                </motion.div>

                <motion.h1
                  className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6 text-white"
                  initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: 1.5,
                    ease: "easeOut",
                    delay: 0.8
                  }}
                >
                  Transform Your
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Career</span>
                </motion.h1>

                <motion.p
                  className="mt-6 text-lg text-gray-300 sm:text-xl max-w-3xl mx-auto mb-8"
                  initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: 1.2,
                    ease: "easeOut",
                    delay: 1.2
                  }}
                >
                  AI-powered resume analysis, smart skill matching, and personalized career development tools
                  to help you land your dream job.
                </motion.p>

                <motion.div
                  className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
                  initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: 1.0,
                    ease: "easeOut",
                    delay: 1.5
                  }}
                >
                  <Button size="lg" className="text-base px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                 
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Stats Section */}
        <div className="container mx-auto px-4 pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.8,
                  delay: 2.0 + (index * 0.1),
                  ease: "easeOut"
                }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-2 text-blue-400">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-white">{stat.number}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-white">
              Everything you need to succeed
            </h2>
            <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
              Comprehensive tools designed to help you stand out in today's competitive job market
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
              >
                <Link to={feature.link}>
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gray-800/50 border-gray-700 hover:border-blue-600 hover:bg-gray-800/70 group">
                    <CardHeader>
                      <div className={`w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center ${feature.color} mb-4 group-hover:bg-gray-600 transition-colors`}>
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl text-white group-hover:text-blue-300 transition-colors">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base text-gray-300 group-hover:text-gray-200 transition-colors">
                        {feature.desc}
                      </CardDescription>
                      <div className="mt-4 flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
                        <span className="text-sm font-medium">Learn more</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-white">
              How it works
            </h2>
            <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
              Simple steps to transform your career prospects
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Upload Resume & JD", desc: "Upload your resume and the job description you're targeting." },
              { step: "02", title: "AI Analysis", desc: "Our AI analyzes skills, experience, and job requirements." },
              { step: "03", title: "Get Insights", desc: "Receive detailed feedback, scores, and improvement suggestions." },
              { step: "04", title: "Practice & Improve", desc: "Take mock tests and access learning resources to enhance skills." }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <Card className="border-0 shadow-lg bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                      {step.step}
                    </div>
                    <CardTitle className="text-xl text-white">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-gray-300">
                      {step.desc}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-white">
              What our users say
            </h2>
            <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
              Join thousands of professionals who have transformed their careers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg bg-gray-800/50 border-gray-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <MessageCircle className="h-6 w-6 text-blue-400 mr-3" />
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <blockquote className="text-lg text-gray-200 mb-6 italic">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full mr-4 object-cover"
                        />
                        <div>
                          <div className="font-semibold text-white">{testimonial.name}</div>
                          <div className="text-sm text-gray-400">{testimonial.role} at {testimonial.company}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-400">{testimonial.improvement}</div>
                        <div className="text-sm text-gray-400">Improvement</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-white">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              Everything you need to know about NextHire
            </p>
          </motion.div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-gray-700">
                <AccordionTrigger className="text-left text-lg font-semibold text-white hover:text-blue-400">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-base text-gray-300">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900/50">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6 text-white">
              Ready to transform your career?
            </h2>
            <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
              Join thousands of professionals who have already improved their job prospects with NextHire
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-base px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
             
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-white">NextHire</h3>
              <p className="text-gray-400">
                AI-powered career platform helping professionals succeed in the modern job market.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">ATS Analysis</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mock Tests</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Learning Resources</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Career Tracking</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} NextHire. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;



