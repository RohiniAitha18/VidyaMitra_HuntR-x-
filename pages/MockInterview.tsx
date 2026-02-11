
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Loader2, PlayCircle, StopCircle, User, Bot, Sparkles, MessageSquare } from 'lucide-react';
import { getInterviewQuestions } from '../services/gemini';
import { InterviewMessage } from '../types';

const MockInterview: React.FC = () => {
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial AI greeting
    const startInterview = async () => {
      setLoading(true);
      try {
        const greeting = await getInterviewQuestions("Frontend Developer");
        setMessages([{
          role: 'interviewer',
          text: greeting || "Hello! Let's start the interview. Can you tell me about yourself?",
          timestamp: Date.now()
        }]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    startInterview();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: InterviewMessage = {
      role: 'candidate',
      text: input,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Logic for follow-up questions
      const aiResponse = await getInterviewQuestions("Frontend Developer (Follow-up)");
      setMessages(prev => [...prev, {
        role: 'interviewer',
        text: aiResponse || "That's interesting. Can you elaborate more on that?",
        timestamp: Date.now()
      }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-180px)]">
      {/* Interview Header */}
      <div className="flex items-center justify-between mb-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
            <Bot size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">AI Mock Interview</h2>
            <p className="text-sm text-slate-500 font-medium">Session: Frontend Software Engineer</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Analysis</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-6 px-4 mb-6">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex items-start gap-4 ${msg.role === 'candidate' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${msg.role === 'candidate' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-indigo-600'}`}>
              {msg.role === 'candidate' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
              msg.role === 'candidate' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white border border-slate-100 rounded-tl-none text-slate-700'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-slate-400 italic text-sm">
            <Loader2 className="animate-spin" size={16} />
            AI is thinking...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xl shadow-indigo-50 flex items-center gap-4">
        <button 
          onClick={() => setIsRecording(!isRecording)}
          className={`p-3 rounded-2xl transition-all ${
            isRecording 
              ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200' 
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {isRecording ? <StopCircle size={24} /> : <Mic size={24} />}
        </button>
        <div className="flex-1 relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isRecording ? "Listening..." : "Type your answer here..."}
            className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl disabled:opacity-50 hover:bg-indigo-700 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
      <p className="text-center text-slate-400 text-xs mt-4 flex items-center justify-center gap-1">
        <Sparkles size={12} /> Powered by Gemini AI • Audio will be transcribed in real-time
      </p>
    </div>
  );
};

export default MockInterview;
