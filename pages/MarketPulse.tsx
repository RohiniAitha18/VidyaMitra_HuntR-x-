
import React, { useState, useEffect } from 'react';
import { TrendingUp, Search, ExternalLink, Loader2, Sparkles, Zap, Globe } from 'lucide-react';
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

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <TrendingUp className="text-indigo-600" /> Market Pulse
          </h2>
          <p className="text-slate-500 font-medium mt-1">Real-time industry hiring trends powered by Google Search.</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="bg-white border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter job role..."
          />
          <button 
            onClick={fetchPulse}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            Update
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
          <p className="text-slate-500 font-medium animate-pulse italic">Scanning global job markets...</p>
        </div>
      ) : pulse ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-indigo-50/30">
              <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase text-indigo-600 tracking-widest bg-indigo-50 w-fit px-3 py-1 rounded-full">
                <Globe size={12} /> Live Insights
              </div>
              <div className="prose prose-slate max-w-none prose-sm font-medium leading-relaxed text-slate-600">
                {pulse.text.split('\n').map((para, i) => (
                  <p key={i} className="mb-4">{para}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-4 flex items-center gap-2">
                <Zap size={14} /> Quick Snapshot
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-xs text-white/60">Trend Velocity</span>
                  <span className="text-xs font-black text-green-400">High Growth</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-xs text-white/60">Keyword Surge</span>
                  <span className="text-xs font-black text-indigo-300">AI / Cloud Native</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Verified Sources</h3>
              <div className="space-y-3">
                {pulse.sources.map((source, i) => (
                  <a 
                    key={i} 
                    href={source.web?.uri} 
                    target="_blank" 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100"
                  >
                    <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Search size={14} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 truncate">{source.web?.title || 'External Source'}</span>
                    <ExternalLink size={12} className="text-slate-300 ml-auto" />
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
