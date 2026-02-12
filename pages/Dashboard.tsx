
import React from 'react';
import { Sparkles, Trophy, Rocket, ArrowRight, CheckCircle2, Clock, FileText, GraduationCap, Loader2 } from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useProgress } from '../hooks/useProgress';

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string; sub: string }> = ({ 
  icon, label, value, color, sub 
}) => (
  <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-xl ${color}`}>
        {icon}
      </div>
      <div className="text-right">
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</p>
        <h3 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
      </div>
    </div>
    <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub}</p>
  </div>
);

const Dashboard: React.FC<{ onAction: (tab: string) => void }> = ({ onAction }) => {
  const { profile, activities, growthData, loading } = useProgress();

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
      <p className="text-slate-400 font-medium italic">Assembling your workspace...</p>
    </div>
  );

  const firstName = profile?.full_name?.split(' ')[0] || 'Member';

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl p-6 lg:p-10 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-2xl lg:text-4xl font-black mb-3 leading-tight">Welcome back, {firstName}! 👋</h2>
          <p className="text-indigo-100 text-sm lg:text-lg mb-8 opacity-90 leading-relaxed">
            You've completed <span className="font-black text-white">{profile?.profile_score}%</span> of your Career Path. 
            Keep the momentum high!
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => onAction('interview')}
              className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all shadow-lg active:scale-95"
            >
              Start Interview <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => onAction('progress')}
              className="bg-indigo-500/30 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-2xl font-black hover:bg-white/10 transition-all active:scale-95 text-center"
            >
              Analytics
            </button>
          </div>
        </div>
        <Sparkles className="absolute right-[-20px] top-[-20px] w-48 lg:w-64 h-48 lg:h-64 text-white/10 rotate-12 pointer-events-none" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard 
          icon={<Rocket className="text-orange-600" size={20} />}
          label="Skills"
          value={profile?.skills_assessed?.toString() || '0'}
          color="bg-orange-50"
          sub="+3 this week"
        />
        <StatCard 
          icon={<Trophy className="text-yellow-600" size={20} />}
          label="Awards"
          value={profile?.achievements?.toString() || '0'}
          color="bg-yellow-50"
          sub="New badge unlocked"
        />
        <StatCard 
          icon={<CheckCircle2 className="text-green-600" size={20} />}
          label="Profile"
          value={`${profile?.profile_score}%`}
          color="bg-green-50"
          sub="+5% trend"
        />
        <StatCard 
          icon={<Clock className="text-blue-600" size={20} />}
          label="Streak"
          value={profile?.streak_days?.toString() || '0'}
          color="bg-blue-50"
          sub="Days active"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Progress Chart */}
        <div className="lg:col-span-2 bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <h3 className="text-lg lg:text-xl font-black text-slate-800 tracking-tight uppercase tracking-widest text-xs">Skill Growth Progress</h3>
            <select className="bg-slate-50 border-none text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500">
              <option>Last 30 Days</option>
              <option>Last 6 Months</option>
            </select>
          </div>
          <div className="h-[250px] lg:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} 
                />
                <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Recent Activity</h3>
          <div className="space-y-6 flex-1">
            {activities.length > 0 ? activities.map((activity, i) => (
              <div key={i} className="flex gap-4 group">
                <div className={`mt-1 p-2 h-fit rounded-xl ${activity.type === 'resume' ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50'}`}>
                  {activity.type === 'resume' ? <FileText size={16} /> : <GraduationCap size={16} />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{activity.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{activity.time}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-400 italic">No recent activity</p>
            )}
          </div>
          <button className="w-full mt-8 py-3 text-xs font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100">
            Full Log
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
