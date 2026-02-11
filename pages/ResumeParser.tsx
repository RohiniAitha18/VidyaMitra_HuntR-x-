
import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, Target, Zap } from 'lucide-react';
import { analyzeResume } from '../services/gemini';
import { ResumeAnalysis } from '../types';

const ResumeParser: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setLoading(true);
      setError(null);
      
      try {
        // In a real app, you'd extract text from the PDF first.
        // For this demo, we'll simulate text extraction
        const simulatedText = "John Doe, Software Engineer with 3 years of experience in React and Node.js. Skilled in TypeScript, AWS, and PostgreSQL.";
        const analysis = await analyzeResume(simulatedText);
        setResult(analysis);
      } catch (err) {
        setError("Failed to analyze resume. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">Let's Build Your AI Profile</h2>
        <p className="text-slate-500">Upload your resume to get instant ATS scores and skill mapping.</p>
      </div>

      {/* Upload Zone */}
      <div className="bg-white border-2 border-dashed border-indigo-200 rounded-3xl p-12 text-center transition-all hover:border-indigo-400 hover:bg-indigo-50 group">
        <input 
          type="file" 
          id="resume-upload" 
          className="hidden" 
          accept=".pdf,.doc,.docx"
          onChange={handleFileUpload}
        />
        <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            {loading ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">
            {file ? file.name : 'Click to upload or drag & drop'}
          </h3>
          <p className="text-slate-400 text-sm">Supported formats: PDF, DOC, DOCX (Max 5MB)</p>
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
              <p className="text-slate-500 text-sm font-medium mb-2">ATS Match Score</p>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32">
                  <circle className="text-slate-100" strokeWidth="10" stroke="currentColor" fill="transparent" r="50" cx="64" cy="64" />
                  <circle 
                    className="text-indigo-600" strokeWidth="10" strokeDasharray={314} 
                    strokeDashoffset={314 - (314 * result.atsScore) / 100}
                    strokeLinecap="round" stroke="currentColor" fill="transparent" r="50" cx="64" cy="64" 
                  />
                </svg>
                <span className="absolute text-3xl font-bold text-slate-800">{result.atsScore}%</span>
              </div>
              <p className="mt-4 text-sm text-indigo-600 font-bold">Excellent profile!</p>
            </div>

            {/* Stats Summary */}
            <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                <FileText className="text-slate-400" />
                <div>
                  <h4 className="font-bold text-slate-800">Experience Summary</h4>
                  <p className="text-sm text-slate-500">{result.parsedInfo.experienceSummary || 'Identified relevant experience in target domain.'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.identifiedSkills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-green-600">
                <Zap size={20} />
                <h4 className="font-bold">Key Strengths</h4>
              </div>
              <ul className="space-y-3">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-indigo-600">
                <Target size={20} />
                <h4 className="font-bold">Recommendations</h4>
              </div>
              <ul className="space-y-3">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <Sparkles size={16} className="text-indigo-400 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
              Continue to Career Path
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeParser;
