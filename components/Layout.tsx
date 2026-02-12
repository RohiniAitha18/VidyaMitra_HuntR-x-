
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileSearch,
  FilePlus,
  Map, 
  GraduationCap, 
  Mic2, 
  BarChart3, 
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  TrendingUp,
  DollarSign,
  Share2,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SidebarItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  onClick: () => void 
}> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
        : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
    }`}
  >
    {icon}
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col p-6 z-50 
        transition-transform duration-300 ease-in-out no-print
        lg:translate-x-0 lg:static lg:h-screen
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">V</div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">VidyaMitra</h1>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-400 hover:text-indigo-600">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
          <SidebarItem 
            icon={<LayoutDashboard size={18} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => handleNavClick('dashboard')} 
          />
          
          <div className="pt-4 pb-2">
            <p className="text-[10px] font-black uppercase text-slate-400 px-4 tracking-widest">Market IQ</p>
          </div>
          <SidebarItem 
            icon={<TrendingUp size={18} />} 
            label="Market Pulse" 
            active={activeTab === 'market'} 
            onClick={() => handleNavClick('market')} 
          />
          <SidebarItem 
            icon={<DollarSign size={18} />} 
            label="Salary Tool" 
            active={activeTab === 'salary'} 
            onClick={() => handleNavClick('salary')} 
          />

          <div className="pt-4 pb-2">
            <p className="text-[10px] font-black uppercase text-slate-400 px-4 tracking-widest">Connect</p>
          </div>
          <SidebarItem 
            icon={<Users size={18} />} 
            label="VConnect" 
            active={activeTab === 'vconnect'} 
            onClick={() => handleNavClick('vconnect')} 
          />
          <SidebarItem 
            icon={<Share2 size={18} />} 
            label="Networking Hub" 
            active={activeTab === 'networking'} 
            onClick={() => handleNavClick('networking')} 
          />

          <div className="pt-4 pb-2">
            <p className="text-[10px] font-black uppercase text-slate-400 px-4 tracking-widest">Career Tools</p>
          </div>
          <SidebarItem 
            icon={<FileSearch size={18} />} 
            label="Resume Analysis" 
            active={activeTab === 'resume-parse'} 
            onClick={() => handleNavClick('resume-parse')} 
          />
          <SidebarItem 
            icon={<Map size={18} />} 
            label="Career Plan" 
            active={activeTab === 'plan'} 
            onClick={() => handleNavClick('plan')} 
          />
          
          <div className="pt-4 pb-2">
            <p className="text-[10px] font-black uppercase text-slate-400 px-4 tracking-widest">Training</p>
          </div>
          <SidebarItem 
            icon={<GraduationCap size={18} />} 
            label="Practice Quiz" 
            active={activeTab === 'quiz'} 
            onClick={() => handleNavClick('quiz')} 
          />
          <SidebarItem 
            icon={<Mic2 size={18} />} 
            label="Mock Interview" 
            active={activeTab === 'interview'} 
            onClick={() => handleNavClick('interview')} 
          />
          <SidebarItem 
            icon={<BarChart3 size={18} />} 
            label="Live Progress" 
            active={activeTab === 'progress'} 
            onClick={() => handleNavClick('progress')} 
          />
        </nav>

        <div className="pt-6 border-t border-slate-100 space-y-2">
          <SidebarItem icon={<LogOut size={18} />} label="Logout" onClick={signOut} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden print:overflow-visible">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-4 flex items-center justify-between z-30 no-print flex-shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-2 bg-slate-100 rounded-xl text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:block w-48 md:w-64 lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Find mentors, jobs, or skills..." 
                className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="text-right hidden xs:block">
                <p className="text-sm font-semibold text-slate-800 truncate max-w-[120px]">{user?.full_name || 'Guest'}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Verified User</p>
              </div>
              <img 
                src={user?.avatar_url || "https://picsum.photos/seed/user/100/100"} 
                alt="Profile" 
                className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-indigo-100 flex-shrink-0"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 print:p-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
