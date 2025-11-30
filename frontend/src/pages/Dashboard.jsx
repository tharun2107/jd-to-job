import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Award,
  BookOpen,
  Brain,
  MessageSquare,
  ArrowRight,
  Loader2,
  FileText,
  CheckCircle
} from 'lucide-react';

const getToken = () => localStorage.getItem('token');

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [mockTestStats, setMockTestStats] = useState(null);
  const [interviewStats, setInterviewStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch mock test attempts
      const [testResponse, interviewResponse] = await Promise.allSettled([
        axios.get('http://localhost:5001/api/mocktest/attempts', { headers }),
        axios.get('http://localhost:5001/api/mockinterview/history', { headers })
      ]);

      // Process mock test stats
      if (testResponse.status === 'fulfilled') {
        const attempts = testResponse.value.data.attempts || [];
        const completedTests = attempts.filter(a => a.examStatus === 'completed');
        const avgScore = completedTests.length > 0
          ? Math.round(completedTests.reduce((sum, a) => sum + (a.evaluation?.percentage || 0), 0) / completedTests.length)
          : 0;
        
        setMockTestStats({
          total: attempts.length,
          completed: completedTests.length,
          averageScore: avgScore,
          highestScore: Math.max(...completedTests.map(a => a.evaluation?.percentage || 0), 0)
        });
      }

      // Process interview stats
      if (interviewResponse.status === 'fulfilled') {
        const interviews = interviewResponse.value.data.interviews || [];
        const completedInterviews = interviews.filter(i => i.status === 'completed');
        const avgScore = completedInterviews.length > 0
          ? Math.round(completedInterviews.reduce((sum, i) => sum + (i.score || 0), 0) / completedInterviews.length)
          : 0;
        
        setInterviewStats({
          total: interviews.length,
          completed: completedInterviews.length,
          averageScore: avgScore,
          highestScore: Math.max(...completedInterviews.map(i => i.score || 0), 0)
        });

        // Combine recent activity
        const allActivity = [
          ...interviews.slice(0, 3).map(i => ({ 
            type: 'interview', 
            title: 'Mock Interview', 
            score: i.score,
            date: i.createdAt,
            status: i.status
          })),
          ...(testResponse.status === 'fulfilled' 
            ? testResponse.value.data.attempts.slice(0, 3).map(t => ({
                type: 'test',
                title: 'Mock Test',
                score: t.evaluation?.percentage,
                date: t.startTime,
                status: t.examStatus
              }))
            : []
          )
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
        
        setRecentActivity(allActivity);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className={`bg-gray-900/80 border border-gray-800 rounded-xl p-6 hover:border-${color}-500/50 transition-all`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-500/20`}>
          <Icon className={`h-6 w-6 text-${color}-400`} />
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-gray-400 text-sm">{title}</div>
      {subtitle && <div className="text-gray-500 text-xs mt-1">{subtitle}</div>}
    </div>
  );

  const QuickAction = ({ icon: Icon, title, description, href, color }) => (
    <Link to={href} className="block">
      <div className={`bg-gray-900/60 border border-gray-800 rounded-xl p-5 hover:border-${color}-500/50 hover:bg-gray-900/80 transition-all group`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg bg-${color}-500/20`}>
            <Icon className={`h-5 w-5 text-${color}-400`} />
          </div>
          <div className="flex-1">
            <div className="text-white font-medium group-hover:text-blue-400 transition-colors">
              {title}
            </div>
            <div className="text-gray-500 text-sm">{description}</div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-blue-400 transition-colors" />
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Track your progress and performance</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6 text-red-300">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Brain}
            title="Mock Tests Completed"
            value={mockTestStats?.completed || 0}
            subtitle={`${mockTestStats?.total || 0} total attempts`}
            color="blue"
          />
          <StatCard
            icon={MessageSquare}
            title="Mock Interviews"
            value={interviewStats?.completed || 0}
            subtitle={`${interviewStats?.total || 0} total attempts`}
            color="purple"
          />
          <StatCard
            icon={Target}
            title="Avg Test Score"
            value={`${mockTestStats?.averageScore || 0}%`}
            subtitle={`Best: ${mockTestStats?.highestScore || 0}%`}
            color="green"
          />
          <StatCard
            icon={Award}
            title="Avg Interview Score"
            value={`${interviewStats?.averageScore || 0}/100`}
            subtitle={`Best: ${interviewStats?.highestScore || 0}/100`}
            color="yellow"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QuickAction
                icon={FileText}
                title="Upload Resume"
                description="Analyze your resume with AI"
                href="/resume-upload"
                color="blue"
              />
              <QuickAction
                icon={BarChart3}
                title="ATS Analysis"
                description="Check resume compatibility"
                href="/ats-analysis"
                color="cyan"
              />
              <QuickAction
                icon={Brain}
                title="Start Mock Test"
                description="Practice with AI assessments"
                href="/mock-test"
                color="purple"
              />
              <QuickAction
                icon={MessageSquare}
                title="Mock Interview"
                description="Practice with AI interviewer"
                href="/mock-interview"
                color="green"
              />
              <QuickAction
                icon={BookOpen}
                title="Learning Resources"
                description="Curated materials for you"
                href="/resources"
                color="yellow"
              />
              <QuickAction
                icon={FileText}
                title="Resume Builder"
                description="Create professional resume"
                href="/resume-builder"
                color="pink"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-gray-600 text-sm mt-1">
                    Start a mock test or interview to see your progress
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'interview' ? 'bg-purple-500/20' : 'bg-blue-500/20'
                      }`}>
                        {activity.type === 'interview' 
                          ? <MessageSquare className="h-4 w-4 text-purple-400" />
                          : <Brain className="h-4 w-4 text-blue-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">
                          {activity.title}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {new Date(activity.date).toLocaleDateString()}
                        </div>
                      </div>
                      {activity.status === 'completed' && activity.score !== undefined && (
                        <div className="flex items-center gap-1 text-green-400 text-sm">
                          <CheckCircle className="h-4 w-4" />
                          {activity.score}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Progress Overview</h2>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Mock Tests</span>
                  <span className="text-white font-medium">{mockTestStats?.completed || 0} completed</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
                    style={{ width: `${Math.min((mockTestStats?.completed || 0) * 10, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Mock Interviews</span>
                  <span className="text-white font-medium">{interviewStats?.completed || 0} completed</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                    style={{ width: `${Math.min((interviewStats?.completed || 0) * 10, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Overall Progress</span>
                  <span className="text-white font-medium">
                    {((mockTestStats?.averageScore || 0) + (interviewStats?.averageScore || 0)) / 2 || 0}%
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                    style={{ width: `${((mockTestStats?.averageScore || 0) + (interviewStats?.averageScore || 0)) / 2}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

