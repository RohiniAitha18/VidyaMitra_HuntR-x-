
import React, { useState, useEffect } from 'react';
import { TrendingUp, Search, ExternalLink, Loader2, Sparkles, Zap, Globe, CheckCircle2 } from 'lucide-react';
import { getMarketPulse } from '../services/gemini';

const MarketPulse: React.FC = () => {
  const [role, setRole] = useState('Frontend Developer');
  const [pulse, setPulse] = useState<{ text: string, sources: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPulse = async () => {
    setLoading(true);
    try {
      const data = await getMarketPulse(role);
      setPulse(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPulse(); }, []);

  const renderBeautifiedContent = (text: string) => {
    // Simple parser to identify structure
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return null;

      // Handle Headers
      if (trimmedLine.startsWith('###')) {
        return <h3 key={i} className="text-xl font-black text-slate-800 mt-8 mb-4 border-l-4 border-indigo-600 pl-4 uppercase tracking-wider">{trimmedLine.replace(/###/g, '').trim()}</h3>;
      }
      
      // Handle Bullet Points
      if (trimmedLine.startsWith('*')) {
        const content = trimmedLine.replace(/^\*\s*/, '');
        // Check for bold pattern **Text**
        const parts = content.split(/(\*\*.*?\*\*)/);
        return (
          <div key={i} className="flex gap-3 mb-3 pl-2 group">
            <div className="mt-1.5"><CheckCircle2 size={14} className="text-indigo-500 group-hover:scale-125 transition-transform" /></div>
            <p className="text-sm font-medium text-slate-600 leading-relaxed">
              {parts.map((part, idx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={idx} className="text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md mx-0.5 font-black">{part.replace(/\*\*/g, '')}</strong>;
                }
                return part;
              })}
            </p>
          </div>
        );
      }

      // Default Paragraph
      const parts = trimmedLine.split(/(\*\*.*?\*\*)/);
      return (
        <p key={i} className="mb-6 text-sm font-medium text-slate-500 leading-relaxed italic border-l-2 border-slate-100 pl-4">
          {parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={idx} className="text-indigo-600 font-black not-italic">{part.replace(/\*\*/g, '')}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/50 backdrop-blur-md p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <TrendingUp className="text-indigo-600" size={28} />
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Market Pulse</h2>
          </div>
          <p className="text-slate-500 font-medium text-sm">Real-time industry insights powered by Google Intelligence.</p>
        </div>
        <div className="flex gap-2 p-2 bg-white rounded-2xl shadow-sm border border-slate-50">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
              type="text" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none w-48 lg:w-64"
              placeholder="Job Role..."
            />
          </div>
          <button 
            onClick={fetchPulse}
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} fill="currentColor" />}
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-indigo-50/50">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={28} />
          </div>
          <div className="text-center">
            <p className="text-slate-800 font-black text-xl mb-1 italic">Scanning 2025 Market Data...</p>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] animate-pulse">Synchronizing with global trends</p>
          </div>
        </div>
      ) : pulse ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 lg:p-12 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-indigo-50/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                 <Sparkles className="text-indigo-100" size={64} />
              </div>
              <div className="flex items-center gap-2 mb-8 text-[10px] font-black uppercase text-indigo-600 tracking-widest bg-indigo-50 w-fit px-4 py-1.5 rounded-full border border-indigo-100 shadow-sm">
                <Globe size={12} /> AI Generative Insight
              </div>
              <div className="ai-content">
                {renderBeautifiedContent(pulse.text)}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <h3 className="text-xs font-black uppercase tracking-[0.25em] text-indigo-400 mb-6 flex items-center gap-2">
                <Zap size={14} fill="currentColor" /> Strategic Brief
              </h3>
              <div className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Market Sentiment</span>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[78%] animate-pulse"></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-indigo-300 uppercase">
                    <span>Bearish</span>
                    <span>Bullish (78%)</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-colors">
                     <p className="text-[10px] font-black uppercase text-indigo-400 mb-1">Top Skill Surge</p>
                     <p className="text-sm font-bold">Generative UI Eng.</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-colors">
                     <p className="text-[10px] font-black uppercase text-green-400 mb-1">Growth Forecast</p>
                     <p className="text-sm font-bold">+24% Q3 2025</p>
                  </div>
                </div>
              </div>
              <TrendingUp className="absolute bottom-[-20px] right-[-20px] w-48 h-48 text-white/5 rotate-12" />
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Citations</h3>
                <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[8px] font-black">{pulse.sources.length} SOURCES</span>
              </div>
              <div className="space-y-3">
                {pulse.sources.map((source, i) => (
                  <a 
                    key={i} 
                    href={source.web?.uri} 
                    target="_blank" 
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-indigo-50 transition-all group border border-transparent hover:border-indigo-100"
                  >
                    <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                      <Search size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-700 truncate mb-0.5">{source.web?.title || 'Data Source'}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase truncate">Official Marketplace Data</p>
                    </div>
                    <ExternalLink size={14} className="text-slate-300 ml-auto group-hover:text-indigo-600 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MarketPulse;
