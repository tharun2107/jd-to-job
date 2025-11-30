import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../components/ui/navigation-menu';
import { Button } from '../components/ui/Button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet';
import {
  Menu,
  X,
  User,
  FileText,
  BookOpen,
  Brain,
  FileEdit,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Rocket,
  Target,
  Zap,
  TrendingUp,
  Globe,
  Shield
} from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('token');

  const navigationItems = [
    {
      title: "Resume Upload",
      href: "/resume-upload",
      description: "Upload and analyze your resume with AI",
      icon: <FileText className="h-4 w-4" />
    },
    {
      title: "ATS Analyzer",
      href: "/ats-analysis",
      description: "AI-powered resume analysis and skill matching",
      icon: <BarChart3 className="h-4 w-4" />
    },
    {
      title: "Resources",
      href: "/resources",
      description: "Curated learning materials and skill development",
      icon: <BookOpen className="h-4 w-4" />
    },
    {
      title: "Mock Test",
      href: "/mock-test",
      description: "AI-generated assessments based on job requirements",
      icon: <Brain className="h-4 w-4" />
    },
    {
      title: "Resume Builder",
      href: "/resume-builder",
      description: "Create professional resumes with AI assistance",
      icon: <FileEdit className="h-4 w-4" />
    },
    {
      title: "Mock Interview",
      href: "/mock-interview",
      description: "Practice interviews with AI feedback",
      icon: <MessageSquare className="h-4 w-4" />
    },
    {
      title: "Dashboard",
      href: "/dashboard",
      description: "Track your progress and performance",
      icon: <BarChart3 className="h-4 w-4" />
    }
  ];

  const features = [
    {
      title: "AI-Powered Analysis",
      description: "Advanced resume parsing with intelligent skill matching",
      icon: <Rocket className="h-5 w-5" />,
      href: "/ats-analysis"
    },
    {
      title: "Smart Matching",
      description: "Precise job-description analysis with recommendations",
      icon: <Target className="h-5 w-5" />,
      href: "/resume-upload"
    },
    {
      title: "Mock Assessments",
      description: "AI-generated tests with detailed feedback",
      icon: <Zap className="h-5 w-5" />,
      href: "/mock-test"
    },
    {
      title: "Performance Tracking",
      description: "Comprehensive analytics for career growth",
      icon: <TrendingUp className="h-5 w-5" />,
      href: "/dashboard"
    },
    {
      title: "Learning Resources",
      description: "Curated educational content and materials",
      icon: <Globe className="h-5 w-5" />,
      href: "/resources"
    },
    {
      title: "Mock Interview",
      description: "Practice interviews with AI feedback",
      icon: <Shield className="h-5 w-5" />,
      href: "/mock-interview"
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                NextHire
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/"
                      className={`group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                        isActive('/') ? 'bg-gray-800 text-white' : 'text-gray-300'
                      }`}
                    >
                      Home
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {isLoggedIn && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-gray-300 hover:bg-gray-800 hover:text-white">
                      Features
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {features.map((feature, index) => (
                          <Link
                            key={index}
                            to={feature.href}
                            className="group relative flex cursor-pointer select-none items-center rounded-md p-3 text-sm leading-none no-underline outline-none transition-colors hover:bg-gray-800 hover:text-white"
                          >
                            <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white">
                              {feature.icon}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white group-hover:text-white">
                                {feature.title}
                              </div>
                              <div className="text-xs text-gray-400 group-hover:text-gray-300">
                                {feature.description}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}

                {isLoggedIn && navigationItems.map((item, index) => (
                  <NavigationMenuItem key={index}>
                    <NavigationMenuLink asChild>
                      <Link
                        to={item.href}
                        className={`group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                          isActive(item.href) ? 'bg-gray-800 text-white' : 'text-gray-300'
                        }`}
                      >
                        {item.title}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Login/Profile Button */}
            <div className="ml-6">
              {isLoggedIn ? (
                <Link to="/profile">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-gray-900 border-gray-700">
                <SheetHeader>
                  <SheetTitle className="text-white">NextHire</SheetTitle>
                  <SheetDescription className="text-gray-400">
                    AI-powered career platform
                  </SheetDescription>
                </SheetHeader>
                
                <div className="mt-6 space-y-4">
                  {/* Mobile Navigation Links */}
                  <div className="space-y-2">
                    <Link
                      to="/"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive('/') 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <span>Home</span>
                    </Link>
                    
                    {isLoggedIn && navigationItems.map((item, index) => (
                      <Link
                        key={index}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                          isActive(item.href) 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        {item.icon}
                        <span>{item.title}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Mobile Login/Profile Button */}
                  <div className="pt-4 border-t border-gray-700">
                    {isLoggedIn ? (
                      <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          Login
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
