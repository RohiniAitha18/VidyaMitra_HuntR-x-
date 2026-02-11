
import React from 'react';
import { Sparkles, Trophy, Rocket, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { name: 'Week 1', score: 45 },
  { name: 'Week 2', score: 52 },
  { name: 'Week 3', score: 68 },
  { name: 'Week 4', score: 72 },
  { name: 'Week 5', score: 85 },
];

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string; sub: string }> = ({ 
  icon, label, value, color, sub 
}) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-xl ${color}`}>
        {icon}
      </div>
      <div className="text-right">
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
    </div>
    <p className="mt-4 text-xs font-medium text-slate-400">{sub}</p>
  </div>
);

const Dashboard: React.FC<{ onAction: (tab: string) => void }> = ({ onAction }) => {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-3xl font-bold mb-2">Welcome back, John! 👋</h2>
          <p className="text-indigo-100 text-lg mb-6">You've completed 85% of your React Path. Let's tackle your mock interview today to reach 90%!</p>
          <div className="flex gap-4">
            <button 
              onClick={() => onAction('interview')}
              className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-50 transition-colors shadow-lg"
            >
              Start Interview <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => onAction('progress')}
              className="bg-indigo-500/30 backdrop-blur-sm border border-white/20 px-6 py-2.5 rounded-xl font-bold hover:bg-white/10 transition-colors"
            >
              View History
            </button>
          </div>
        </div>
        <Sparkles className="absolute right-[-20px] top-[-20px] w-64 h-64 text-white/10 rotate-12" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Rocket className="text-orange-600" size={24} />}
          label="Skills Assessed"
          value="12"
          color="bg-orange-50"
          sub="+3 this week"
        />
        <StatCard 
          icon={<Trophy className="text-yellow-600" size={24} />}
          label="Achievements"
          value="8"
          color="bg-yellow-50"
          sub="New badge earned!"
        />
        <StatCard 
          icon={<CheckCircle2 className="text-green-600" size={24} />}
          label="Profile Score"
          value="85%"
          color="bg-green-50"
          sub="+5% this month"
        />
        <StatCard 
          icon={<Clock className="text-blue-600" size={24} />}
          label="Streak Days"
          value="15"
          color="bg-blue-50"
          sub="Keep it up!"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800">Skill Growth Progress</h3>
            <select className="bg-slate-50 border-none text-sm font-medium text-slate-500 rounded-lg px-3 py-1.5 focus:ring-0">
              <option>Last 30 Days</option>
              <option>Last 6 Months</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                />
                <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {[
              { type: 'resume', title: 'Completed Resume Analysis', time: '2 hours ago', icon: <FileText size={16} />, color: 'text-blue-600 bg-blue-50' },
              { type: 'quiz', title: 'Scored 92% in React Quiz', time: 'Yesterday', icon: <GraduationCap size={16} />, color: 'text-green-600 bg-green-50' },
              { type: 'plan', title: 'Started Python Learning Path', time: '3 days ago', icon: <Rocket size={16} />, color: 'text-orange-600 bg-orange-50' },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4">
                <div className={`mt-1 p-2 h-fit rounded-lg ${activity.color}`}>
                  {activity.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{activity.title}</p>
                  <p className="text-xs text-slate-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
};

// Required imports for local components
import { FileText, GraduationCap } from 'lucide-react';

export default Dashboard;
