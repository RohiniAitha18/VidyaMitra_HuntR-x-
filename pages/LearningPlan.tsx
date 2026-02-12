
import React, { useState } from 'react';
import { 
  Calendar, 
  PlayCircle, 
  ChevronRight, 
  CheckCircle, 
  Loader2, 
  Map, 
  Target, 
  Zap, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import { generateLearningPlan } from '../services/gemini';
import { WeeklyPlan } from '../types';

const LearningPlan: React.FC = () => {
  const [step, setStep] = useState<'setup' | 'loading' | 'roadmap'>('setup');
  const [targetRole, setTargetRole] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [plans, setPlans] = useState<WeeklyPlan[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim()) return;

    setStep('loading');
    setError(null);

    try {
      const skillsArray = currentSkills.split(',').map(s => s.trim()).filter(Boolean);
      const data = await generateLearningPlan(targetRole, skillsArray);
      
      if (data && data.length > 0) {
        setPlans(data);
        setStep('roadmap');
      } else {
        throw new Error("No data returned");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to map your journey. Please try a different role or set of skills.");
      setStep('setup');
    }
  };

  const handleToggleTask = (weekIdx: number, taskIdx: number) => {
    const newPlans = [...plans];
    newPlans[weekIdx].tasks[taskIdx].completed = !newPlans[weekIdx].tasks[taskIdx].completed;
    setPlans(newPlans);
  };

  if (step === 'setup') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 py-10">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100">
            <Map size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Career Architect</h2>
          <p className="text-slate-500 font-medium">Define your destination, and let Gemini map the most efficient path to mastery.</p>
        </div>

        <form onSubmit={handleGenerate} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-indigo-50 space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-2">
              <Target size={14} className="text-indigo-600" /> What is your target role?
            </label>
            <input 
              type="text" 
              placeholder="e.g. Senior DevOps Engineer, AI Researcher, Product Lead..." 
              className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-2">
              <Zap size={14} className="text-indigo-600" /> What do you already know?
            </label>
            <textarea 
              placeholder="e.g. JavaScript, Basic Python, Project Management (comma separated)" 
              className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none h-32 resize-none"
              value={currentSkills}
              onChange={(e) => setCurrentSkills(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-[0.98]"
          >
            Generate Roadmap <Sparkles size={18} />
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3">
             <RefreshCw size={16} /> {error}
          </div>
        )}
      </div>
    );
  }

  if (step === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <Map className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={32} />
        </div>
        <div className="text-center">
          <p className="text-slate-800 font-black text-xl mb-1 italic">Analyzing market demand...</p>
          <p className="text-slate-400 text-sm font-medium">Architecting your 4-week journey for {targetRole}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-indigo-100 text-indigo-600 rounded text-[10px] font-black uppercase tracking-widest">Personalized Route</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Your {targetRole} Roadmap</h2>
          <p className="text-slate-500 font-medium">A structured 4-week journey tailored to your current background.</p>
        </div>
        <button 
          onClick={() => setStep('setup')}
          className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]"
        >
          <RefreshCw size={14} /> New Roadmap
        </button>
      </div>

      <div className="space-y-6">
        {plans.map((week, weekIdx) => (
          <div key={week.week} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-indigo-50/20 overflow-hidden group hover:border-indigo-200 transition-all duration-300">
            <div className="p-8 flex flex-col lg:flex-row items-start gap-8">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex flex-col items-center justify-center border border-slate-100 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                <span className="text-[10px] font-black uppercase opacity-60">Week</span>
                <span className="text-3xl font-black leading-none">{week.week}</span>
              </div>
              
              <div className="flex-1 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">{week.topic}</h3>
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 text-[10px] font-black rounded-full border border-green-100 uppercase tracking-widest">
                    <Zap size={12} fill="currentColor" /> Week Focus
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {week.tasks.map((task, taskIdx) => (
                    <div 
                      key={taskIdx} 
                      onClick={() => handleToggleTask(weekIdx, taskIdx)}
                      className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                        task.completed 
                          ? 'bg-green-50/50 border-green-100' 
                          : 'bg-slate-50/50 border-transparent hover:border-indigo-100 hover:bg-white'
                      }`}
                    >
                      <div className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        task.completed 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'bg-white border-slate-200 text-transparent'
                      }`}>
                        <CheckCircle size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold tracking-tight ${task.completed ? 'text-green-800 line-through opacity-60' : 'text-slate-800'}`}>
                          {task.title}
                        </p>
                        <p className={`text-xs mt-1 leading-relaxed ${task.completed ? 'text-green-600' : 'text-slate-500'}`}>
                          {task.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {week.resourceLink && (
                  <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Curated Material</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">External Resource • Priority Study</p>
                      </div>
                    </div>
                    <a 
                      href={week.resourceLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-indigo-600 transition-all uppercase tracking-[0.1em]"
                    >
                      Explore Deeply <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-indigo-600 p-8 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-indigo-200 relative overflow-hidden">
        <div className="relative z-10">
          <h4 className="text-xl font-black mb-1">Consistency is Key 🏆</h4>
          <p className="text-indigo-100 text-sm font-medium">You have completed {plans.reduce((acc, w) => acc + w.tasks.filter(t => t.completed).length, 0)} of {plans.reduce((acc, w) => acc + w.tasks.length, 0)} tasks.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="relative z-10 bg-white text-indigo-600 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all"
        >
          Save as PDF
        </button>
        <Sparkles className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-white/10 rotate-12" />
      </div>
    </div>
  );
};

export default LearningPlan;
