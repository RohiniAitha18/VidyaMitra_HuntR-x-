
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ResumeParser from './pages/ResumeParser';
import ResumeBuilder from './pages/ResumeBuilder';
import LearningPlan from './pages/LearningPlan';
import MockInterview from './pages/MockInterview';
import Quiz from './pages/Quiz';
import Progress from './pages/Progress';
import MarketPulse from './pages/MarketPulse';
import SalaryTool from './pages/SalaryTool';
import NetworkingHub from './pages/NetworkingHub';
import VConnect from './pages/VConnect';

const AuthenticatedApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = React.useState('dashboard');

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl"></div>
        <div className="h-4 w-32 bg-indigo-50 rounded-full"></div>
      </div>
    </div>
  );

  if (!user) return <Login />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onAction={setActiveTab} />;
      case 'resume-parse':
        return <ResumeParser />;
      case 'resume-build':
        return <ResumeBuilder />;
      case 'plan':
        return <LearningPlan />;
      case 'quiz':
        return <Quiz />;
      case 'interview':
        return <MockInterview />;
      case 'progress':
        return <Progress />;
      case 'market':
        return <MarketPulse />;
      case 'salary':
        return <SalaryTool />;
      case 'networking':
        return <NetworkingHub />;
      case 'vconnect':
        return <VConnect />;
      default:
        return <Dashboard onAction={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
};

export default App;
