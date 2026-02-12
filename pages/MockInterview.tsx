
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Loader2, StopCircle, User, Bot, Sparkles, AlertCircle, Upload, Briefcase, FileText, Play, ArrowLeft } from 'lucide-react';
import { getInterviewQuestions, analyzeResume } from '../services/gemini';
import { InterviewMessage } from '../types';
import { GoogleGenAI, Modality, LiveServerMessage, Blob } from '@google/genai';

// Audio Helpers
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const MockInterview: React.FC = () => {
  // Setup States
  const [step, setStep] = useState<'setup' | 'interview'>('setup');
  const [role, setRole] = useState('Frontend Developer');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeSummary, setResumeSummary] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  // Interview States
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<any>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);

  // Transcriptions for real-time display
  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleStartInterview = async () => {
    setLoading(true);
    setError(null);
    let contextStr = "";

    try {
      if (resumeFile) {
        setIsParsing(true);
        const base64Data = await readFileAsBase64(resumeFile);
        const analysis = await analyzeResume({
          data: base64Data,
          mimeType: resumeFile.type || 'application/pdf'
        });
        contextStr = `Name: ${analysis.parsedInfo.name}, Summary: ${analysis.parsedInfo.experienceSummary}, Skills: ${analysis.identifiedSkills.join(', ')}`;
        setResumeSummary(contextStr);
        setIsParsing(false);
      }

      setStep('interview');
      const greeting = await getInterviewQuestions(role, contextStr);
      setMessages([{
        role: 'interviewer',
        text: greeting || `Hello! I'm here to interview you for the ${role} position. Shall we begin?`,
        timestamp: Date.now()
      }]);
    } catch (err) {
      console.error(err);
      setError("Failed to initialize interview. The AI service might be busy.");
    } finally {
      setLoading(false);
      setIsParsing(false);
    }
  };

  const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startRecording = async () => {
    try {
      setError(null);
      setIsRecording(true);
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Setup Audio Contexts
      inputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const systemInstruction = `You are a professional technical hiring manager conducting a mock interview for the ${role} role. ${resumeSummary ? `Candidate Profile: ${resumeSummary}.` : ''} Ask targeted, challenging questions one by one. Maintain a professional and observant tone.`;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log("Live session opened");
            const source = inputAudioCtxRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioCtxRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioCtxRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioCtxRef.current) {
              const ctx = outputAudioCtxRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            if (message.serverContent?.inputTranscription) {
              currentInputTranscription.current += message.serverContent.inputTranscription.text;
              setInput(currentInputTranscription.current);
            }
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscription.current += message.serverContent.outputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              const userText = currentInputTranscription.current;
              const aiText = currentOutputTranscription.current;

              if (userText || aiText) {
                setMessages(prev => [
                  ...prev,
                  ...(userText ? [{ role: 'candidate', text: userText, timestamp: Date.now() }] as InterviewMessage[] : []),
                  ...(aiText ? [{ role: 'interviewer', text: aiText, timestamp: Date.now() }] as InterviewMessage[] : [])
                ]);
              }
              
              currentInputTranscription.current = '';
              currentOutputTranscription.current = '';
              setInput('');
            }
          },
          onerror: (e) => {
            console.error("Live session error", e);
            setError("The AI connection was lost. Please try restarting the session.");
            stopRecording();
          },
          onclose: () => {
            console.log("Live session closed");
            stopRecording();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: systemInstruction,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error(err);
      setError("Failed to start Live Interview. Please ensure your microphone is working and try again.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setInput('');
  };

  const handleManualSend = async () => {
    if (!input.trim() || loading || isRecording) return;

    const userMsg: InterviewMessage = {
      role: 'candidate',
      text: input,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const aiResponse = await getInterviewQuestions(`${role} (Follow-up to response: ${input})`, resumeSummary || undefined);
      setMessages(prev => [...prev, {
        role: 'interviewer',
        text: aiResponse || "That's an interesting perspective. Tell me more about your process.",
        timestamp: Date.now()
      }]);
    } catch (err) {
      console.error(err);
      setError("AI failed to respond. Please try typing your answer again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const resetInterview = () => {
    stopRecording();
    setStep('setup');
    setMessages([]);
    setInput('');
    setResumeFile(null);
    setResumeSummary(null);
    setError(null);
  };

  if (step === 'setup') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 py-10">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100">
            <Bot size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Interview Lab</h2>
          <p className="text-slate-500 font-medium">Configure your session to practice for a specific career role.</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-indigo-50 space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-2">
              <Briefcase size={14} className="text-indigo-600" /> Target Job Role
            </label>
            <input 
              type="text" 
              placeholder="e.g. Senior Product Manager, Backend Dev, HR Analyst..." 
              className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-2">
              <FileText size={14} className="text-indigo-600" /> Upload Resume (Optional)
            </label>
            <div className={`relative border-2 border-dashed rounded-2xl p-6 transition-all ${resumeFile ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-slate-300 bg-slate-50'}`}>
              <input 
                type="file" 
                id="interview-resume" 
                className="hidden" 
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="interview-resume" className="cursor-pointer flex flex-col items-center">
                <Upload size={24} className={`${resumeFile ? 'text-indigo-600' : 'text-slate-400'} mb-2`} />
                <p className="text-xs font-bold text-slate-600">
                  {resumeFile ? resumeFile.name : 'Click to upload resume for context'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">PDF or Image (Max 5MB)</p>
              </label>
            </div>
          </div>

          <button 
            onClick={handleStartInterview}
            disabled={loading || !role.trim()}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
            {isParsing ? 'Parsing Resume...' : 'Start Session'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold">
            <AlertCircle size={18} />
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-180px)]">
      {/* Interview Header */}
      <div className="flex items-center justify-between mb-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={resetInterview} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Back to Setup">
            <ArrowLeft size={20} />
          </button>
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
            <Bot size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Mock Interview</h2>
            <p className="text-sm text-slate-500 font-medium truncate max-w-[200px]">Role: {role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {isRecording ? 'Listening Live' : 'Ready'}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm font-bold">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-6 px-4 mb-6 custom-scrollbar">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex items-start gap-4 ${msg.role === 'candidate' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${msg.role === 'candidate' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border border-slate-200 text-indigo-600'}`}>
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
            AI Recruiter is thinking...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className={`bg-white p-4 rounded-3xl border transition-all duration-300 shadow-xl shadow-indigo-50 flex items-center gap-4 ${isRecording ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-100'}`}>
        <button 
          onClick={toggleRecording}
          className={`p-3 rounded-2xl transition-all ${
            isRecording 
              ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200 hover:bg-red-600' 
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
          title={isRecording ? "Stop Recording" : "Start Voice Interview"}
        >
          {isRecording ? <StopCircle size={24} /> : <Mic size={24} />}
        </button>
        <div className="flex-1 relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleManualSend()}
            readOnly={isRecording}
            placeholder={isRecording ? "Listening to your response..." : "Type your answer here..."}
            className={`w-full bg-slate-50 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 transition-all ${isRecording ? 'text-indigo-600 font-bold' : ''}`}
          />
          {!isRecording && (
            <button 
              onClick={handleManualSend}
              disabled={!input.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl disabled:opacity-50 hover:bg-indigo-700 transition-colors"
            >
              <Send size={18} />
            </button>
          )}
        </div>
      </div>
      <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-widest mt-4 flex items-center justify-center gap-1">
        <Sparkles size={12} className="text-indigo-600" /> Powered by Gemini AI • Context-Aware Interview
      </p>
    </div>
  );
};

export default MockInterview;
