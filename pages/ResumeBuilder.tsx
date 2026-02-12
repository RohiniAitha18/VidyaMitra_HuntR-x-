import React, { useState, useRef } from 'react';
import { Palette, Trash2, Wand2, Loader2, User, Mail, Phone, Briefcase, FileDown } from 'lucide-react';
import { optimizeResumeContent } from '../services/gemini';
import { ResumeData, ResumeTemplate } from '../types';
import { useProgress } from '../hooks/useProgress';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const ResumeBuilder: React.FC = () => {
  const { logActivity, addScore } = useProgress();
  const [template, setTemplate] = useState<ResumeTemplate>('professional');
  const resumeRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [data, setData] = useState<ResumeData>({
    name: 'John Doe',
    title: 'Software Engineer',
    email: 'john.doe@example.com',
    phone: '+91 9876543210',
    summary: 'Passionate software developer with 3+ years of experience building scalable web applications.',
    experience: [
      { company: 'Tech Corp', role: 'Full Stack Developer', duration: '2021 - Present', description: 'Developed high-performance React features. Optimized backend API response times by 40%.' }
    ],
    education: [
      { school: 'IIT Delhi', degree: 'B.Tech Computer Science', year: '2017 - 2021' }
    ],
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL']
  });
  const [loading, setLoading] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!resumeRef.current) {
      console.error("Resume reference missing");
      return;
    }
    
    setIsGenerating(true);
    console.log("Starting PDF generation...");
    
    try {
      // 1. Target the element - we want a clean, un-scaled version
      const element = resumeRef.current;
      
      // 2. Options for html2pdf
      const opt = {
        margin: [0, 0, 0, 0],
        filename: `${data.name.replace(/\s+/g, '_')}_Resume.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { 
          scale: 3, // High scale for crisp text
          useCORS: true, 
          letterRendering: true,
          scrollY: 0,
          scrollX: 0,
          windowWidth: 794, // Standard A4 width in pixels at 96dpi
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      };

      // 3. Execution - we use the worker API for better control
      // html2pdf usually triggers a download automatically with .save()
      await html2pdf().from(element).set(opt).save();
      
      console.log("PDF download triggered successfully");
      logActivity('resume', 'Generated and Downloaded Resume');
      addScore(2);
    } catch (err) {
      console.error('CRITICAL: PDF Download failed:', err);
      alert('PDF generation failed. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimize = async (field: string, value: string, path: string) => {
    setLoading(path);
    try {
      const optimized = await optimizeResumeContent(value, field);
      if (optimized) {
        if (field === 'summary') setData({ ...data, summary: optimized });
        else if (field === 'description') {
          const [index] = path.split('-').slice(1).map(Number);
          const newExp = [...data.experience];
          newExp[index].description = optimized;
          setData({ ...data, experience: newExp });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const addExperience = () => {
    setData({
      ...data,
      experience: [...data.experience, { company: '', role: '', duration: '', description: '' }]
    });
  };

  const removeExperience = (index: number) => {
    const newExp = [...data.experience];
    newExp.splice(index, 1);
    setData({ ...data, experience: newExp });
  };

  const templates = {
    professional: "font-serif",
    modern: "font-sans",
    minimalist: "font-light"
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 lg:space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">AI Resume Builder</h2>
          <p className="text-xs lg:text-sm text-slate-500 font-medium tracking-tight">Craft high-impact professional profiles effortlessly.</p>
        </div>
        <button 
          onClick={handleDownload}
          disabled={isGenerating}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95 disabled:opacity-70"
        >
          {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <FileDown size={20} />} 
          <span className="text-sm">{isGenerating ? 'Generating PDF...' : 'Download PDF'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Palette size={16} className="text-indigo-600" /> Style
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {['professional', 'modern', 'minimalist'].map((t) => (
                <button 
                  key={t}
                  onClick={() => setTemplate(t as ResumeTemplate)}
                  className={`py-3 rounded-xl border-2 transition-all capitalize text-[10px] font-black tracking-widest ${
                    template === t ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User size={14} className="text-indigo-600" /> Identity
              </h3>
              <div className="space-y-3">
                <input 
                  type="text" placeholder="Full Name" 
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-indigo-500" 
                  value={data.name} onChange={e => setData({...data, name: e.target.value})}
                />
                <input 
                  type="text" placeholder="Current Role" 
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-indigo-500" 
                  value={data.title} onChange={e => setData({...data, title: e.target.value})}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input 
                    type="email" placeholder="Email" 
                    className="p-4 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-indigo-500" 
                    value={data.email} onChange={e => setData({...data, email: e.target.value})}
                  />
                  <input 
                    type="text" placeholder="Phone" 
                    className="p-4 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-indigo-500" 
                    value={data.phone} onChange={e => setData({...data, phone: e.target.value})}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Briefcase size={14} className="text-indigo-600" /> Experience
                </h3>
                <button onClick={addExperience} className="text-indigo-600 text-[10px] font-black hover:underline uppercase tracking-widest">+ Add</button>
              </div>
              <div className="space-y-4">
                {data.experience.map((exp, i) => (
                  <div key={i} className="p-5 bg-slate-50 rounded-[1.5rem] relative space-y-4 group border border-transparent hover:border-slate-200 transition-all">
                    <button 
                      onClick={() => removeExperience(i)}
                      className="absolute -top-2 -right-2 p-2 bg-red-100 text-red-600 rounded-full opacity-0 lg:group-hover:opacity-100 transition-all shadow-sm z-10"
                    >
                      <Trash2 size={14} />
                    </button>
                    <input 
                      type="text" placeholder="Company Name" 
                      className="w-full bg-white border-none rounded-xl p-3 text-sm font-black focus:ring-2 focus:ring-indigo-500"
                      value={exp.company} onChange={e => {
                        const newExp = [...data.experience];
                        newExp[i].company = e.target.value;
                        setData({...data, experience: newExp});
                      }}
                    />
                    <div className="relative">
                      <textarea 
                        placeholder="Impact and achievements..." 
                        className="w-full bg-white border-none rounded-xl p-3 text-xs h-24 focus:ring-2 focus:ring-indigo-500 resize-none font-medium"
                        value={exp.description} onChange={e => {
                          const newExp = [...data.experience];
                          newExp[i].description = e.target.value;
                          setData({...data, experience: newExp});
                        }}
                      />
                      <button 
                        onClick={() => handleOptimize('description', exp.description, `exp-${i}`)}
                        className="absolute bottom-2 right-2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all"
                        title="AI Optimize"
                      >
                        {loading === `exp-${i}` ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Live Preview Pane */}
        <div className="lg:col-span-7 xl:col-span-8 bg-slate-100 rounded-[2.5rem] p-4 lg:p-8 overflow-hidden relative min-h-[500px]">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
          <div className="w-full h-full overflow-auto custom-scrollbar relative z-10 flex justify-center">
            {/* The actual resume container that gets captured */}
            <div 
              ref={resumeRef}
              className={`
                bg-white p-12 min-h-[1122px] w-[794px] shadow-2xl rounded-sm transition-all duration-500
                scale-[0.5] xs:scale-[0.6] sm:scale-[0.75] md:scale-90 lg:scale-[0.8] xl:scale-90 2xl:scale-100 origin-top
                ${templates[template]}
              `}
            >
              <div className="border-b-4 border-indigo-600 pb-6 mb-8 flex justify-between items-end gap-4">
                <div>
                  <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none truncate max-w-[500px]">{data.name}</h1>
                  <p className="text-2xl text-indigo-600 font-semibold mt-2">{data.title}</p>
                </div>
                <div className="text-right text-slate-600 space-y-1">
                  <p className="flex items-center justify-end gap-2 text-sm font-bold tracking-tight"><Mail size={14} className="text-indigo-600" /> {data.email}</p>
                  <p className="flex items-center justify-end gap-2 text-sm font-bold tracking-tight"><Phone size={14} className="text-indigo-600" /> {data.phone}</p>
                </div>
              </div>

              <div className="space-y-10">
                <section>
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 mb-4 flex items-center gap-3">
                    <span className="w-10 h-0.5 bg-indigo-100"></span> Summary
                  </h2>
                  <p className="text-slate-700 leading-relaxed text-base font-medium">{data.summary}</p>
                </section>

                <section>
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 mb-6 flex items-center gap-3">
                    <span className="w-10 h-0.5 bg-indigo-100"></span> Experience
                  </h2>
                  <div className="space-y-8">
                    {data.experience.map((exp, i) => (
                      <div key={i} className="relative pl-6 border-l-2 border-slate-100">
                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-indigo-600 rounded-full"></div>
                        <div className="flex justify-between items-baseline mb-2">
                          <h3 className="text-lg font-black text-slate-800">{exp.company || 'Company Name'}</h3>
                          <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">{exp.duration || 'Duration'}</span>
                        </div>
                        <p className="text-sm font-black text-indigo-600 mb-3 tracking-wide">{exp.role || 'Role'}</p>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-medium">{exp.description || 'Job description'}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="grid grid-cols-5 gap-12">
                  <section className="col-span-3">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 mb-6 flex items-center gap-3">
                      <span className="w-10 h-0.5 bg-indigo-100"></span> Education
                    </h2>
                    <div className="space-y-6">
                      {data.education.map((edu, i) => (
                        <div key={i}>
                          <p className="font-black text-slate-800 text-base">{edu.school}</p>
                          <p className="text-indigo-600 text-sm font-bold">{edu.degree}</p>
                          <p className="text-slate-400 text-[10px] font-black tracking-widest mt-1 uppercase">{edu.year}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section className="col-span-2">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 mb-6 flex items-center gap-3">
                      <span className="w-10 h-0.5 bg-indigo-100"></span> Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-[10px] font-black border border-slate-200 tracking-tight uppercase">
                          {s}
                        </span>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 lg:hidden">
            Scroll to view full resume
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;