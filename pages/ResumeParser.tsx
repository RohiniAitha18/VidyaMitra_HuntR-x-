
import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, Target, Zap, Flame, ShieldCheck, XCircle } from 'lucide-react';
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
    <div className="max-w-5xl mx-auto space-y-6 lg:space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 lg:px-0">
        <div className="text-left space-y-1">
          <h2 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">AI Profile Engine</h2>
          <p className="text-xs lg:text-sm text-slate-500 font-medium">Instant ATS analysis and skill mapping.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-fit">
          <button 
            onClick={() => setRoastMode(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${!roastMode ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <ShieldCheck size={14} /> Professional
          </button>
          <button 
            onClick={() => setRoastMode(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${roastMode ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Flame size={14} /> Roast Mode
          </button>
        </div>
      </div>

      <div className={`mx-4 lg:mx-0 border-2 border-dashed rounded-[2rem] p-8 lg:p-12 text-center transition-all group shadow-sm ${
        roastMode ? 'border-orange-200 bg-orange-50/30 hover:border-orange-400' : 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50'
      }`}>
        <input 
          type="file" 
          id="resume-upload" 
          className="hidden" 
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileUpload}
        />
        <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
          <div className={`w-16 h-16 lg:w-20 lg:h-20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg ${
            roastMode ? 'bg-orange-100 text-orange-600 shadow-orange-100' : 'bg-indigo-100 text-indigo-600 shadow-indigo-100'
          }`}>
            {loading ? <Loader2 className="animate-spin" size={32} /> : roastMode ? <Flame size={32} /> : <Upload size={32} />}
          </div>
          <h3 className="text-lg lg:text-xl font-black text-slate-800 mb-2 truncate max-w-[280px]">
            {file ? file.name : roastMode ? 'Upload for Brutal Feedback' : 'Drop Resume Here'}
          </h3>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">PDF, PNG, JPG (Max 5MB)</p>
        </label>
      </div>

      {error && (
        <div className="mx-4 lg:mx-0 bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-bold tracking-tight">{error}</p>
        </div>
      )}

      {result && (
        <div className="px-4 lg:px-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">ATS Match Score</p>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-28 h-28 lg:w-32 lg:h-32">
                  <circle className="text-slate-100" strokeWidth="10" stroke="currentColor" fill="transparent" r="50" cx="64" cy="64" />
                  <circle 
                    className={roastMode ? "text-orange-600" : "text-indigo-600"} strokeWidth="10" strokeDasharray={314} 
                    strokeDashoffset={314 - (314 * result.atsScore) / 100}
                    strokeLinecap="round" stroke="currentColor" fill="transparent" r="50" cx="64" cy="64" 
                  />
                </svg>
                <span className="absolute text-3xl font-black text-slate-800 tracking-tighter">{result.atsScore}%</span>
              </div>
              <p className={`mt-6 text-sm font-black uppercase tracking-widest ${roastMode ? 'text-orange-600' : 'text-indigo-600'}`}>
                {roastMode ? 'Roast Complete' : 'Analysis Complete'}
              </p>
            </div>

            <div className="lg:col-span-2 bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-start gap-4 pb-6 border-b border-slate-50">
                <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                  <FileText size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">
                    {roastMode ? 'Recruiter Roast' : 'Experience Summary'}
                  </h4>
                  <p className={`text-sm font-medium leading-relaxed italic ${roastMode ? 'text-orange-700' : 'text-slate-500'}`}>
                    "{result.parsedInfo.experienceSummary || 'Extracted summary of your professional background.'}"
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.identifiedSkills.map((skill, i) => (
                  <span key={i} className={`px-4 py-2 rounded-xl text-[10px] font-black border uppercase tracking-tight ${
                    roastMode ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                  }`}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${roastMode ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                  {roastMode ? <Flame size={18} /> : <Zap size={18} />}
                </div>
                <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">
                  {roastMode ? 'Aggressive Critique' : 'Profile Strengths'}
                </h4>
              </div>
              <ul className="space-y-4">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium leading-snug">
                    {/* Fixed XCircle icon rendering by adding it to imports */}
                    {roastMode ? <XCircle size={16} className="text-orange-500 mt-0.5 shrink-0" /> : <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />}
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Target size={18} /></div>
                <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">AI Recommendations</h4>
              </div>
              <ul className="space-y-4">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium leading-snug">
                    <Sparkles size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                    {r}
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
