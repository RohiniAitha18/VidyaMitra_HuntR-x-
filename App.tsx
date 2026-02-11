
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ResumeParser from './pages/ResumeParser';
import LearningPlan from './pages/LearningPlan';
import MockInterview from './pages/MockInterview';
import Quiz from './pages/Quiz';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onAction={setActiveTab} />;
      case 'resume':
        return <ResumeParser />;
      case 'plan':
        return <LearningPlan />;
      case 'quiz':
        return <Quiz />;
      case 'interview':
        return <MockInterview />;
      case 'progress':
        return (
          <div className="text-center py-20 space-y-4">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600 mb-4">
              <BarChart3 size={40} />
            </div>
            <h2 className="text-3xl font-bold text-slate-800">Advanced Analytics</h2>
            <p className="text-slate-500 max-w-md mx-auto">This module is currently processing your latest assessment data. Check back in a few hours for deep insights.</p>
          </div>
        );
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

// Required local import for placeholder
import { BarChart3 } from 'lucide-react';

export default App;
