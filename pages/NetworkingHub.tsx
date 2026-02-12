
import React, { useState } from 'react';
import { Share2, Mail, Linkedin, Copy, Check, Wand2, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { generateNetworkingDraft } from '../services/gemini';

const NetworkingHub: React.FC = () => {
  const [role, setRole] = useState('');
  const [context, setContext] = useState('');
  const [type, setType] = useState<'linkedin' | 'email' | 'followup'>('linkedin');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!role || !context) return;
    setLoading(true);
    try {
      const text = await generateNetworkingDraft(type, role, context);
      setDraft(text || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-6 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Networking Hub</h2>
        <p className="text-slate-500 font-medium">High-impact drafts for LinkedIn, Cold Emails, and Follow-ups.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex gap-2">
            {(['linkedin', 'email', 'followup'] as const).map((t) => (
              <button 
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-3 rounded-xl border-2 transition-all text-[10px] font-black uppercase tracking-widest ${
                  type === t ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-50 text-slate-400 hover:border-slate-200'
                }`}
              >
                {t === 'linkedin' ? <Linkedin className="inline mr-1" size={14} /> : 
                 t === 'email' ? <Mail className="inline mr-1" size={14} /> : 
                 <MessageSquare className="inline mr-1" size={14} />}
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Recipient's Role</label>
              <input 
                type="text" placeholder="e.g. Hiring Manager at Google"
                value={role} onChange={e => setRole(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Connection Context</label>
              <textarea 
                placeholder="How do you know them? What's your goal? (e.g. Met at tech conference, want coffee chat)"
                value={context} onChange={e => setContext(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-medium h-40 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !role || !context}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
            Generate Draft
          </button>
        </div>

        <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative shadow-2xl flex flex-col h-full min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">AI Preview</h3>
            {draft && (
              <button 
                onClick={handleCopy}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                title="Copy to Clipboard"
              >
                {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <Sparkles className="animate-bounce text-indigo-400" size={32} />
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Drafting magic...</p>
              </div>
            ) : draft ? (
              <p className="text-sm leading-relaxed text-indigo-100 font-medium whitespace-pre-wrap">{draft}</p>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                <Share2 size={48} className="mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">Your draft will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkingHub;
