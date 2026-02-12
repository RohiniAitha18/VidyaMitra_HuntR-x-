
import React, { useState, useEffect } from 'react';
import { DollarSign, MapPin, Loader2, Info, Building2, TrendingDown, Target, Navigation } from 'lucide-react';
import { getSalaryInsights } from '../services/gemini';

const SalaryTool: React.FC = () => {
  const [role, setRole] = useState('Senior Software Engineer');
  const [location, setLocation] = useState('San Francisco, CA');
  const [insights, setInsights] = useState<{ text: string, sources: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("Geolocation permission denied or failed.", err)
      );
    }
  }, []);

  const fetchSalary = async () => {
    setLoading(true);
    try {
      const data = await getSalaryInsights(role, location, coords?.lat, coords?.lng);
      setInsights(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch salary insights. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSalary(); }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-green-600 to-teal-700 p-8 lg:p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl lg:text-4xl font-black mb-4">Precision Benchmarking</h2>
          <p className="text-green-50 mb-8 font-medium">Get location-aware salary data and cost-of-living adjustments for your next negotiation.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/20">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-green-200 tracking-widest ml-1">Target Role</label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-green-100" size={16} />
                <input 
                  type="text" value={role} onChange={e => setRole(e.target.value)}
                  className="w-full bg-white/20 border-none rounded-xl py-3 pl-10 pr-4 text-sm font-bold placeholder-green-100 focus:ring-2 focus:ring-white transition-all outline-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-green-200 tracking-widest ml-1">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-green-100" size={16} />
                <input 
                  type="text" value={location} onChange={e => setLocation(e.target.value)}
                  className="w-full bg-white/20 border-none rounded-xl py-3 pl-10 pr-4 text-sm font-bold placeholder-green-100 focus:ring-2 focus:ring-white transition-all outline-none"
                />
              </div>
            </div>
          </div>
          <button 
            onClick={fetchSalary}
            disabled={loading}
            className="mt-6 bg-white text-green-700 px-10 py-4 rounded-2xl font-black shadow-lg hover:bg-green-50 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <DollarSign size={20} />}
            Analyze Compensation
          </button>
        </div>
        <DollarSign className="absolute right-[-40px] bottom-[-40px] w-64 h-64 text-white/10 rotate-12" />
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-green-600" size={48} />
          <p className="text-slate-500 font-medium italic">Calculating regional market value...</p>
        </div>
      ) : insights ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
              <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><Navigation size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-800">Compensation Insights</h3>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-tight">{role} • {location}</p>
              </div>
            </div>
            
            <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed">
              {insights.text.split('\n').map((para, i) => (para.trim() ? <p key={i} className="mb-4">{para}</p> : null))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Location Sources</h3>
              <div className="space-y-2">
                {insights.sources.map((s: any, i: number) => (
                  <a 
                    key={i} href={s.web?.uri || s.maps?.uri} target="_blank"
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <Building2 size={16} className="text-indigo-600" />
                    <span className="text-xs font-bold text-slate-700 truncate">{s.web?.title || s.maps?.title || 'Data Source'}</span>
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

export default SalaryTool;
