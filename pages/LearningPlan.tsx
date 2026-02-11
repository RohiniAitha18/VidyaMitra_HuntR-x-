
import React, { useState, useEffect } from 'react';
import { Calendar, PlayCircle, ChevronRight, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { generateLearningPlan } from '../services/gemini';
import { WeeklyPlan } from '../types';

const LearningPlan: React.FC = () => {
  const [plans, setPlans] = useState<WeeklyPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const data = await generateLearningPlan("Full Stack Engineer", ["JavaScript", "HTML", "CSS"]);
        setPlans(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="text-slate-500 font-medium italic">Curating your personalized 4-week journey...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Your Learning Roadmap</h2>
          <p className="text-slate-500">Mastering Full Stack Development in 4 Weeks</p>
        </div>
        <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
          <Calendar size={18} />
          Nov 2025 - Dec 2025
        </div>
      </div>

      <div className="space-y-6">
        {plans.map((week) => (
          <div key={week.week} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group">
            <div className="p-6 flex items-start gap-6">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex flex-col items-center justify-center border border-slate-200 shrink-0">
                <span className="text-xs font-bold text-slate-400 uppercase">Week</span>
                <span className="text-2xl font-black text-indigo-600">{week.week}</span>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800">{week.topic}</h3>
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                    In Progress
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {week.tasks.map((task, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                      <button className="mt-0.5 rounded-full border border-slate-300 w-5 h-5 flex items-center justify-center hover:border-indigo-500">
                        {task.completed && <CheckCircle size={16} className="text-green-500" />}
                      </button>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 leading-tight">{task.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{task.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {week.resourceLink && (
                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                        <PlayCircle size={18} />
                      </div>
                      <div className="text-sm">
                        <p className="font-bold text-slate-800 leading-none">Recommended Resource</p>
                        <p className="text-xs text-slate-500 mt-1">Video Tutorial • 2h 45m</p>
                      </div>
                    </div>
                    <a 
                      href={week.resourceLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 flex items-center gap-1 text-sm font-bold hover:underline"
                    >
                      Watch <ChevronRight size={16} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningPlan;
