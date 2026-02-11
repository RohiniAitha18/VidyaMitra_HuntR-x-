
import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Map, 
  GraduationCap, 
  Mic2, 
  BarChart3, 
  Settings, 
  LogOut,
  Bell,
  Search
} from 'lucide-react';

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
    <span class="font-medium">{label}</span>
  </button>
);

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">V</div>
          <h1 className="text-xl font-bold text-slate-800">VidyaMitra</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={<FileText size={20} />} 
            label="Resume Build" 
            active={activeTab === 'resume'} 
            onClick={() => setActiveTab('resume')} 
          />
          <SidebarItem 
            icon={<Map size={20} />} 
            label="Career Plan" 
            active={activeTab === 'plan'} 
            onClick={() => setActiveTab('plan')} 
          />
          <SidebarItem 
            icon={<GraduationCap size={20} />} 
            label="Practice Quiz" 
            active={activeTab === 'quiz'} 
            onClick={() => setActiveTab('quiz')} 
          />
          <SidebarItem 
            icon={<Mic2 size={20} />} 
            label="Mock Interview" 
            active={activeTab === 'interview'} 
            onClick={() => setActiveTab('interview')} 
          />
          <SidebarItem 
            icon={<BarChart3 size={20} />} 
            label="Progress" 
            active={activeTab === 'progress'} 
            onClick={() => setActiveTab('progress')} 
          />
        </nav>

        <div className="pt-6 border-t border-slate-100 space-y-2">
          <SidebarItem icon={<Settings size={20} />} label="Settings" onClick={() => {}} />
          <SidebarItem icon={<LogOut size={20} />} label="Logout" onClick={() => {}} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search skills, roles, resources..." 
              className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">John Doe</p>
                <p className="text-xs text-slate-500">Student @ IIT Delhi</p>
              </div>
              <img 
                src="https://picsum.photos/seed/user/100/100" 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-indigo-100"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
