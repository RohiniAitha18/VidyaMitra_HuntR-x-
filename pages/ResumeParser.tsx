
import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, Target, Zap, Flame, ShieldCheck, XCircle, Quotes } from 'lucide-react';
import { analyzeResume } from '../services/gemini';
import { ResumeAnalysis } from '../types';

const ResumeParser: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roastMode, setRoastMode] = useState(false);

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setLoading(true);
      setError(null);
      setResult(null);
      
      try {
        const base64Data = await readFileAsBase64(selectedFile);
        const analysis = await analyzeResume({
          data: base64Data,
          mimeType: selectedFile.type || 'application/pdf'
        }, undefined, roastMode);
        setResult(analysis);
      } catch (err: any) {
        console.error("Analysis Error:", err);
        setError(`Analysis failed: ${err.message || 'Please try a different file.'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 lg:space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 lg:px-0">
        <div className="text-left space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100">
                <Target size={24} />
             </div>
             <h2 className="text-3xl font-black text-slate-800 tracking-tight">AI Profile Sentinel</h2>
          </div>
          <p className="text-xs lg:text-sm text-slate-500 font-bold uppercase tracking-widest mt-2 ml-14">Brutally Honest Career Intelligence</p>
        </div>
        
        <div className="flex bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm w-fit">
          <button 
            onClick={() => setRoastMode(false)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${!roastMode ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <ShieldCheck size={14} /> Professional
          </button>
          <button 
            onClick={() => setRoastMode(true)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${roastMode ? 'bg-orange-600 text-white shadow-xl shadow-orange-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Flame size={14} /> Roast Mode
          </button>
        </div>
      </div>

      <div className={`mx-4 lg:mx-0 border-4 border-dashed rounded-[3rem] p-10 lg:p-16 text-center transition-all group shadow-2xl shadow-indigo-50/20 ${
        roastMode ? 'border-orange-200 bg-orange-50/30 hover:border-orange-400' : 'border-indigo-100 bg-white hover:border-indigo-400 hover:bg-indigo-50/30'
      }`}>
        <input 
          type="file" 
          id="resume-upload" 
          className="hidden" 
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileUpload}
        />
        <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
          <div className={`w-20 h-20 lg:w-24 lg:h-24 rounded-[2.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-2xl ${
            roastMode ? 'bg-orange-600 text-white shadow-orange-200' : 'bg-indigo-600 text-white shadow-indigo-200'
          }`}>
            {loading ? <Loader2 className="animate-spin" size={40} /> : roastMode ? <Flame size={40} /> : <Upload size={40} />}
          </div>
          <h3 className="text-xl lg:text-3xl font-black text-slate-800 mb-3 truncate max-w-[400px]">
            {file ? file.name : roastMode ? 'Drag for Emotional Damage' : 'Upload Your Blueprint'}
          </h3>
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">Ready for {roastMode ? 'destruction' : 'analysis'}</p>
        </label>
      </div>

      {error && (
        <div className="mx-4 lg:mx-0 bg-red-50 border-2 border-red-100 text-red-600 p-6 rounded-[2rem] flex items-center gap-4 animate-in shake duration-300">
          <XCircle size={28} />
          <p className="text-sm font-black uppercase tracking-widest">{error}</p>
        </div>
      )}

      {result && (
        <div className="px-4 lg:px-0 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-indigo-50/30 text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Zap size={120} fill="currentColor" className="text-indigo-600" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-10">Marketability Index</p>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-40 h-40 lg:w-48 lg:h-48 transform -rotate-90">
                  <circle className="text-slate-50" strokeWidth="12" stroke="currentColor" fill="transparent" r="70" cx="80" cy="80" />
                  <circle 
                    className={roastMode ? "text-orange-600" : "text-indigo-600"} strokeWidth="12" strokeDasharray={440} 
                    strokeDashoffset={440 - (440 * result.atsScore) / 100}
                    strokeLinecap="round" stroke="currentColor" fill="transparent" r="70" cx="80" cy="80" 
                    style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                   <span className="text-5xl font-black text-slate-800 tracking-tighter">{result.atsScore}%</span>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">ATS Sync</span>
                </div>
              </div>
              <div className={`mt-10 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest inline-block ${roastMode ? 'bg-orange-50 text-orange-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {roastMode ? 'Critique Finalized' : 'Elite Status Identified'}
              </div>
            </div>

            <div className="lg:col-span-8 bg-white p-10 lg:p-14 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-indigo-50/20 space-y-8 relative overflow-hidden">
              <div className="flex items-start gap-6 pb-10 border-b border-slate-100">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-slate-900 text-white rounded-2xl"><FileText size={20} /></div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">
                      {roastMode ? 'The Brutal Assessment' : 'Executive Overview'}
                    </h4>
                  </div>
                  <div className={`text-lg font-bold leading-relaxed relative pl-10 ${roastMode ? 'text-orange-900' : 'text-slate-600'}`}>
                    <span className="absolute left-0 top-0 text-6xl opacity-20 font-serif leading-none text-indigo-400">“</span>
                    <p className="italic relative z-10">{result.parsedInfo.experienceSummary || 'No summary extracted.'}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Key Skill Archetypes</p>
                 <div className="flex flex-wrap gap-3">
                  {result.identifiedSkills.map((skill, i) => (
                    <span key={i} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black border uppercase tracking-widest shadow-sm hover:scale-105 transition-all ${
                      roastMode ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-indigo-600 text-white border-transparent'
                    }`}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-indigo-50/10">
              <div className="flex items-center gap-4 mb-8">
                <div className={`p-3 rounded-2xl shadow-lg ${roastMode ? 'bg-orange-600 text-white' : 'bg-green-600 text-white'}`}>
                  {roastMode ? <Flame size={22} /> : <Zap size={22} />}
                </div>
                <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">
                  {roastMode ? 'Hard Truths' : 'Core Strengths'}
                </h4>
              </div>
              <ul className="space-y-6">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-4 text-sm font-bold text-slate-600 leading-relaxed group">
                    <div className={`mt-1 shrink-0 ${roastMode ? 'text-orange-500' : 'text-green-500'}`}>
                      {roastMode ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                    </div>
                    <span className="group-hover:text-slate-900 transition-colors">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-indigo-50/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><Sparkles size={22} /></div>
                <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">AI Optimization Strategy</h4>
              </div>
              <ul className="space-y-6">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-4 text-sm font-bold text-slate-600 leading-relaxed group">
                    <div className="mt-1 shrink-0 text-indigo-400">
                      <Target size={18} />
                    </div>
                    <span className="group-hover:text-indigo-600 transition-colors">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeParser;
