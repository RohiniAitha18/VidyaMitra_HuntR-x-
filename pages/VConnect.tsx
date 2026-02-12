
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Heart, 
  X, 
  MessageCircle, 
  Search, 
  Filter, 
  Users, 
  Zap, 
  Sparkles, 
  Briefcase, 
  GraduationCap, 
  ChevronLeft, 
  Send,
  MoreVertical,
  CheckCheck,
  Award,
  Star,
  Target,
  ArrowRight,
  ShieldCheck,
  MapPin,
  TrendingUp,
  Brain,
  Layers,
  User as UserIcon,
  Info
} from 'lucide-react';
import { VConnectProfile, VConnection, VChatMessage } from '../types';

const MOCK_PROFILES: VConnectProfile[] = [
  // MENTORS (For Mentees to find)
  { id: 'm1', name: 'Sarah Chen', title: 'Staff Engineer', company: 'Meta', bio: 'Expert in L7 distributed systems. Mentored 20+ engineers into Senior/Staff roles. I focus on architectural thinking.', skills: ['System Design', 'Go', 'Distributed Systems'], avatar: 'https://i.pravatar.cc/300?u=sarah', role: 'mentor', experienceYears: 12, compatibilityScore: 94 },
  { id: 'm2', name: 'David Miller', title: 'Product Lead', company: 'Stripe', bio: 'Helping engineers move into Product Management. Focused on user-centric building and roadmap strategy.', skills: ['Product Strategy', 'Growth', 'UX'], avatar: 'https://i.pravatar.cc/300?u=david', role: 'mentor', experienceYears: 8, compatibilityScore: 88 },
  { id: 'm3', name: 'Aisha Kapoor', title: 'Design Architect', company: 'Airbnb', bio: 'Accessibility first. I help designers build design systems that scale across thousands of pages.', skills: ['Figma', 'Design Systems', 'A11y'], avatar: 'https://i.pravatar.cc/300?u=aisha', role: 'mentor', experienceYears: 10, compatibilityScore: 91 },
  { id: 'm4', name: 'Marcus Thorne', title: 'DevOps Lead', company: 'Netflix', bio: 'Kubernetes and Cloud-Native at scale. I help mentees master the art of the 99.99% uptime.', skills: ['K8s', 'AWS', 'SRE'], avatar: 'https://i.pravatar.cc/300?u=marcus', role: 'mentor', experienceYears: 15, compatibilityScore: 97 },
  { id: 'm5', name: 'Elena Rodriguez', title: 'AI Researcher', company: 'OpenAI', bio: 'Deep learning and LLM fine-tuning. Looking for talented engineers to guide into AI research.', skills: ['PyTorch', 'Python', 'NLP'], avatar: 'https://i.pravatar.cc/300?u=elena', role: 'mentor', experienceYears: 6, compatibilityScore: 95 },
  
  // MENTEES (For Mentors to find)
  { id: 's1', name: 'Liam Wilson', title: 'Junior Dev', company: 'Self-Employed', bio: 'Building my first SaaS. Struggling with backend scaling and database normalization.', skills: ['Node.js', 'Postgres'], avatar: 'https://i.pravatar.cc/300?u=liam', role: 'mentee', compatibilityScore: 85 },
  { id: 's2', name: 'Sofia Garcia', title: 'CS Senior', company: 'Stanford', bio: 'Aspiring AI researcher. Strong math background, but need guidance on real-world engineering practices.', skills: ['Python', 'Calculus'], avatar: 'https://i.pravatar.cc/300?u=sofia', role: 'mentee', compatibilityScore: 92 },
  { id: 's3', name: 'Jordan Lee', title: 'UX Designer', company: 'Agency', bio: 'Moving into Frontend Engineering. I want to build what I design. Need help with React/TS.', skills: ['React', 'CSS'], avatar: 'https://i.pravatar.cc/300?u=jordan', role: 'mentee', compatibilityScore: 89 },
  { id: 's4', name: 'Zoe Kemp', title: 'Backend Intern', company: 'Zeta', bio: 'Passionate about Rust and systems programming. Looking for a mentor who values code quality.', skills: ['Rust', 'Linux'], avatar: 'https://i.pravatar.cc/300?u=zoe', role: 'mentee', compatibilityScore: 93 },
  { id: 's5', name: 'Alex Rivera', title: 'Bootcamp Grad', company: 'N/A', bio: 'Just finished a 6-month intensive. Need help with the first "Big Tech" job hunt and interview prep.', skills: ['React', 'Firebase'], avatar: 'https://i.pravatar.cc/300?u=alex', role: 'mentee', compatibilityScore: 76 }
];

export default function VConnect() {
  const [activeView, setActiveView] = useState<'onboarding' | 'discover' | 'matches' | 'chat' | 'profile'>('onboarding');
  const [currentUserRole, setCurrentUserRole] = useState<'mentee' | 'mentor'>('mentee');
  const [targetPreference, setTargetPreference] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<VConnection[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<VConnection | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Intelligent filter: if I am a mentee, I see mentors. If I am a mentor, I see mentees.
  const discoveryPool = useMemo(() => {
    return MOCK_PROFILES.filter(p => {
      const isCorrectType = currentUserRole === 'mentee' ? p.role === 'mentor' : p.role === 'mentee';
      if (!isCorrectType) return false;
      if (!targetPreference) return true;
      const searchStr = (p.title + p.skills.join(' ') + p.bio).toLowerCase();
      return searchStr.includes(targetPreference.toLowerCase());
    });
  }, [currentUserRole, targetPreference]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedMatch?.messages]);

  const handleStartDiscovery = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveView('discover');
    setCurrentIndex(0);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      const profile = discoveryPool[currentIndex];
      const synergyPoints = profile.skills.slice(0, 2).join(' & ');
      
      const newMatch: VConnection = {
        id: `match_${profile.id}_${Date.now()}`,
        profile,
        unreadCount: 1,
        messages: [{
          id: `msg_${Date.now()}`,
          senderId: profile.id,
          text: `Hi there! I saw we both have experience with ${synergyPoints}. I'd love to connect and share some insights.`,
          timestamp: Date.now()
        }]
      };

      setMatches(prev => [newMatch, ...prev]);
      setShowMatchAnimation(true);
    } else {
      nextProfile();
    }
  };

  const nextProfile = () => {
    if (currentIndex < discoveryPool.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Wrap for demo
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !selectedMatch) return;
    const newMessage: VChatMessage = { id: `user_msg_${Date.now()}`, senderId: 'me', text: chatInput, timestamp: Date.now() };
    const updatedMatch = { ...selectedMatch, messages: [...selectedMatch.messages, newMessage], lastMessage: chatInput, unreadCount: 0 };
    setMatches(matches.map(m => m.id === selectedMatch.id ? updatedMatch : m));
    setSelectedMatch(updatedMatch);
    setChatInput('');
  };

  const renderOnboarding = () => (
    <div className="max-w-xl mx-auto py-12 space-y-8 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-indigo-100 mb-4 rotate-3">
          <Brain size={48} />
        </div>
        <h2 className="text-4xl font-black text-slate-800 tracking-tighter">AI Synergy Setup</h2>
        <p className="text-slate-500 font-medium">To provide accurate matches, tell us who you are in the ecosystem.</p>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-indigo-50/50 space-y-10">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.25em] ml-2">I am entering as a...</label>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setCurrentUserRole('mentee')}
              className={`p-8 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all ${currentUserRole === 'mentee' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 shadow-xl shadow-indigo-100/50' : 'border-slate-50 text-slate-400 bg-slate-50/50 hover:border-slate-200'}`}
            >
              <GraduationCap size={40} />
              <span className="font-black text-xs uppercase tracking-widest">Mentee</span>
            </button>
            <button 
              onClick={() => setCurrentUserRole('mentor')}
              className={`p-8 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all ${currentUserRole === 'mentor' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 shadow-xl shadow-indigo-100/50' : 'border-slate-50 text-slate-400 bg-slate-50/50 hover:border-slate-200'}`}
            >
              <Award size={40} />
              <span className="font-black text-xs uppercase tracking-widest">Mentor</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleStartDiscovery} className="space-y-6">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.25em] ml-2">
              {currentUserRole === 'mentee' ? "Target Specialization" : "Area of Guidance"}
            </label>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-600" size={20} />
              <input 
                type="text" 
                placeholder="e.g. AI Researcher, Backend Eng, UX Design..."
                value={targetPreference}
                onChange={(e) => setTargetPreference(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 active:scale-95"
          >
            Launch Sync <Zap size={18} fill="currentColor" />
          </button>
        </form>
      </div>
    </div>
  );

  const renderDiscover = () => {
    if (discoveryPool.length === 0) {
      return (
        <div className="text-center py-24 space-y-6 animate-in zoom-in-95">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
             <Search size={48} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Zero Synergy Matches</h3>
          <p className="text-slate-500 max-w-xs mx-auto">The network hasn't found profiles matching "{targetPreference}" yet. Try a broader search.</p>
          <button onClick={() => setActiveView('onboarding')} className="text-indigo-600 font-black uppercase text-xs tracking-widest hover:underline">Adjust Preference</button>
        </div>
      );
    }

    const profile = discoveryPool[currentIndex];
    return (
      <div className="max-w-md mx-auto h-full flex flex-col justify-center animate-in zoom-in-95 duration-500 pb-12">
        <div className="relative aspect-[3/4.5] rounded-[3.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(79,70,229,0.3)] border border-slate-100 group bg-white">
          <img 
            src={profile.avatar} 
            alt={profile.name} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent opacity-95" />
          
          {/* Synergy Radar Overlays */}
          <div className="absolute top-8 left-8 flex flex-col gap-3">
            <div className="px-5 py-2.5 bg-indigo-600/90 backdrop-blur-xl rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl border border-white/20">
              <Sparkles size={14} className="text-yellow-300 animate-pulse" /> {profile.compatibilityScore}% Compatibility
            </div>
            {profile.experienceYears && (
              <div className="px-5 py-2.5 bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.2em] w-fit shadow-lg">
                <Star size={12} className="inline mr-1 text-yellow-300" /> {profile.experienceYears}Y Impact
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-10 text-white space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="text-4xl font-black tracking-tighter leading-none">{profile.name}</h3>
                <ShieldCheck size={22} className="text-indigo-400" />
              </div>
              <p className="text-indigo-400 font-bold text-lg flex items-center gap-2 tracking-tight uppercase">
                <Briefcase size={18} /> {profile.title} @ {profile.company}
              </p>
            </div>
            
            <p className="text-sm font-medium leading-relaxed opacity-90 line-clamp-3 bg-white/5 p-4 rounded-2xl backdrop-blur-md border border-white/10 italic">
              "{profile.bio}"
            </p>

            <div className="space-y-4">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 border-b border-white/10 pb-2">Why you match (AI Analysis)</p>
               <div className="flex flex-wrap gap-2">
                {profile.skills.map((s, i) => (
                  <span key={i} className="px-4 py-2 bg-indigo-600/30 backdrop-blur-xl rounded-xl text-[10px] font-black uppercase tracking-tighter border border-white/20">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
               <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Success Rate</span>
                  <span className="text-xs font-black text-green-400">98% Satisfied</span>
               </div>
               <div className="flex flex-col text-right">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Status</span>
                  <span className="text-xs font-black flex items-center gap-1 justify-end"><TrendingUp size={12} /> Active Now</span>
               </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-12 flex items-center justify-center gap-8">
          <button 
            onClick={() => handleSwipe('left')}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-2xl border border-slate-100 hover:text-red-500 hover:scale-110 active:scale-95 transition-all group"
          >
            <X size={36} strokeWidth={3} />
          </button>
          
          <button 
            onClick={() => handleSwipe('right')}
            className="w-28 h-28 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-full flex items-center justify-center text-white shadow-[0_24px_48px_-12px_rgba(79,70,229,0.5)] hover:scale-110 active:scale-95 transition-all group relative"
          >
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Heart size={48} fill="currentColor" />
          </button>

          <button 
             onClick={() => setActiveView('onboarding')}
             className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-2xl border border-slate-100 hover:text-indigo-600 hover:scale-110 active:scale-95 transition-all"
          >
            <Filter size={28} strokeWidth={3} />
          </button>
        </div>
      </div>
    );
  };

  const renderMatches = () => (
    <div className="max-w-5xl mx-auto space-y-10 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-4 lg:px-0">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-100">
              <Layers size={32} />
           </div>
           <div>
             <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase tracking-widest text-sm">Synergy Hub</h2>
             <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">{matches.length} CONNECTIONS ACTIVE</p>
           </div>
        </div>
        <button onClick={() => setActiveView('discover')} className="px-10 py-4 bg-white border border-slate-100 text-indigo-600 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-indigo-50 transition-all shadow-sm">
           Back to Discovery
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="bg-white p-24 rounded-[4rem] text-center border border-slate-100 shadow-xl space-y-10">
          <div className="w-32 h-32 bg-indigo-50 text-indigo-200 rounded-[3rem] flex items-center justify-center mx-auto rotate-6 border-4 border-dashed border-indigo-100">
            <Users size={64} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Your Hub is Empty</h3>
            <p className="text-slate-500 font-medium max-w-xs mx-auto">Start swiping on profiles in Discovery to build your verified synergy network.</p>
          </div>
          <button 
            onClick={() => setActiveView('discover')}
            className="px-12 py-5 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200"
          >
            Go Discover
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 lg:px-0">
          {matches.map((match) => (
            <div 
              key={match.id}
              onClick={() => { setSelectedMatch(match); setActiveView('chat'); }}
              className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:scale-[1.03] transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="flex items-center gap-5 mb-8">
                <div className="relative">
                  <img src={match.profile.avatar} className="w-20 h-20 rounded-[1.75rem] object-cover ring-4 ring-indigo-50 shadow-sm" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-slate-800 tracking-tight truncate text-xl">{match.profile.name}</h4>
                  <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest truncate mt-1">{match.profile.title}</p>
                </div>
              </div>
              
              <div className="bg-slate-50 p-5 rounded-2xl mb-8 group-hover:bg-indigo-50 transition-colors border border-slate-100 group-hover:border-indigo-100">
                <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed italic">
                  "{match.lastMessage || `AI Matched on ${match.profile.skills[0]}. Ready to sync?`}"
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                   <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Sparkles size={14} />
                   </div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{match.profile.compatibilityScore}% SYNC</span>
                </div>
                <button className="w-12 h-12 bg-white border border-slate-100 text-indigo-600 rounded-[1.25rem] flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-md group-hover:shadow-indigo-200">
                  <MessageCircle size={22} fill="currentColor" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderChat = () => {
    if (!selectedMatch) return null;
    return (
      <div className="max-w-6xl mx-auto h-[calc(100vh-200px)] flex flex-col bg-white rounded-[4rem] border border-slate-100 shadow-[0_32px_128px_-32px_rgba(79,70,229,0.2)] overflow-hidden animate-in slide-in-from-right-10 duration-500">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveView('matches')} className="p-4 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all hover:bg-indigo-50">
              <ChevronLeft size={24} />
            </button>
            <div className="relative">
              <img src={selectedMatch.profile.avatar} className="w-16 h-16 rounded-[1.5rem] object-cover" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-black text-slate-800 leading-none">{selectedMatch.profile.name}</h3>
                <ShieldCheck size={20} className="text-indigo-600" />
              </div>
              <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.25em] mt-2">Verified Synergy: {selectedMatch.profile.skills[0]} Specialist</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button className="p-4 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all border border-slate-100"><Award size={24} /></button>
             <button className="p-4 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all border border-slate-100"><MoreVertical size={24} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar bg-[radial-gradient(#f8fafc_1px,transparent_1px)] [background-size:20px_20px]">
          {selectedMatch.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[65%] p-6 rounded-[2rem] shadow-sm text-sm font-medium leading-relaxed ${
                msg.senderId === 'me' 
                  ? 'bg-slate-900 text-white rounded-tr-none shadow-xl shadow-indigo-100' 
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-xl shadow-slate-100/50'
              }`}>
                {msg.text}
                <div className={`text-[9px] mt-4 flex items-center gap-2 font-black uppercase tracking-widest ${msg.senderId === 'me' ? 'text-indigo-300/60' : 'text-slate-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {msg.senderId === 'me' && <CheckCheck size={14} className="text-indigo-400" />}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-10 bg-white border-t border-slate-100">
          <div className="flex items-center gap-5 bg-slate-50 p-2.5 rounded-[2.5rem] border border-slate-200 shadow-inner">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Message your synergy match..."
              className="flex-1 bg-transparent border-none py-5 px-8 text-sm font-bold focus:ring-0 outline-none"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!chatInput.trim()}
              className="p-5 bg-indigo-600 text-white rounded-[1.75rem] shadow-2xl shadow-indigo-200 disabled:opacity-50 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
            >
              <Send size={24} fill="currentColor" />
            </button>
          </div>
          <div className="mt-8 flex items-center gap-4 overflow-x-auto custom-scrollbar no-scrollbar py-2">
             <span className="text-[10px] font-black uppercase text-slate-400 shrink-0 tracking-[0.25em]">Quick Suggestions:</span>
             <button onClick={() => setChatInput(`How did you get started at ${selectedMatch.profile.company}?`)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-[10px] font-black rounded-xl whitespace-nowrap hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm">Industry Insight 🏗️</button>
             <button onClick={() => setChatInput(`Can you help me with my ${selectedMatch.profile.skills[0]} learning path?`)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-[10px] font-black rounded-xl whitespace-nowrap hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm">Skill Roadmap 💻</button>
             <button onClick={() => setChatInput(`Let's book a 15-minute intro call!`)} className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black rounded-xl whitespace-nowrap hover:bg-indigo-600 transition-all shadow-lg">Schedule Intro 📅</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Platform Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-4 lg:px-0 bg-white/50 backdrop-blur-md p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-100 ring-4 ring-white">
            <Users size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter leading-none">VConnect</h2>
            <div className="flex items-center gap-2 mt-2">
               <span className="flex items-center gap-1 text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full"><Brain size={12} /> Synergy AI Active</span>
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">{currentUserRole === 'mentee' ? 'Mentee Mode' : 'Mentor Mode'}</span>
            </div>
          </div>
        </div>

        {activeView !== 'onboarding' && (
          <div className="flex flex-wrap gap-2 bg-white p-2 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50">
            <button 
              onClick={() => setActiveView('discover')}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'discover' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200' : 'text-slate-500 hover:bg-indigo-50'}`}
            >
              <Zap size={14} fill="currentColor" /> Discovery
            </button>
            <button 
              onClick={() => setActiveView('matches')}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'matches' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200' : 'text-slate-500 hover:bg-indigo-50'}`}
            >
              <Heart size={14} fill="currentColor" /> My Hub
              {matches.length > 0 && <span className="ml-1 w-5 h-5 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-white font-black">{matches.length}</span>}
            </button>
          </div>
        )}
      </div>

      <div className="min-h-[700px] px-4 lg:px-0">
        {activeView === 'onboarding' && renderOnboarding()}
        {activeView === 'discover' && renderDiscover()}
        {activeView === 'matches' && renderMatches()}
        {activeView === 'chat' && renderChat()}
      </div>

      {/* SYNERGY MATCH OVERLAY */}
      {showMatchAnimation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="text-center space-y-12 animate-in zoom-in-75 duration-700 max-w-2xl px-10">
            <div className="flex items-center justify-center gap-12 relative">
              <div className="relative z-10">
                <img src="https://i.pravatar.cc/300?u=me" className="w-40 h-40 rounded-[3rem] border-8 border-indigo-600 shadow-[0_0_64px_rgba(79,70,229,0.5)]" />
                <div className="absolute -top-6 -left-6 bg-white p-4 rounded-3xl shadow-2xl text-indigo-600 font-black text-xs uppercase tracking-widest rotate-[-10deg]">Me</div>
              </div>
              
              <div className="absolute z-0 w-96 h-96 bg-indigo-600/30 blur-[100px] rounded-full animate-pulse"></div>
              
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-red-500 shadow-[0_0_64px_rgba(255,255,255,0.4)] animate-bounce relative z-20">
                <Heart size={48} fill="currentColor" />
              </div>

              <div className="relative z-10">
                <img src={discoveryPool[currentIndex]?.avatar} className="w-40 h-40 rounded-[3rem] border-8 border-violet-600 shadow-[0_0_64px_rgba(124,58,237,0.5)]" />
                <div className="absolute -top-6 -right-6 bg-white p-4 rounded-3xl shadow-2xl text-indigo-600 font-black text-xs uppercase tracking-widest rotate-[10deg]">{discoveryPool[currentIndex]?.role}</div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-8xl font-black text-white italic tracking-tighter leading-none bg-gradient-to-r from-indigo-400 via-white to-violet-400 bg-clip-text text-transparent">V-SYNERGY!</h2>
              <p className="text-indigo-200 font-black text-2xl uppercase tracking-[0.4em]">{discoveryPool[currentIndex]?.name} is waiting in your hub</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <button 
                  onClick={() => { setShowMatchAnimation(false); nextProfile(); }}
                  className="px-12 py-5 bg-white/10 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/20"
                >
                  Keep Swiping
                </button>
                <button 
                  onClick={() => { setShowMatchAnimation(false); setActiveView('matches'); }}
                  className="px-16 py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_64px_rgba(79,70,229,0.4)]"
                >
                  Start Conversation
                </button>
            </div>
            
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] text-white/10 animate-pulse pointer-events-none -z-10" />
          </div>
        </div>
      )}
    </div>
  );
}
