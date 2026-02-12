
import React, { useState } from 'react';
import { CheckCircle2, XCircle, ChevronRight, Loader2, Trophy, ArrowRight, RefreshCw, Sparkles, BrainCircuit, Target, Star, MessageSquare } from 'lucide-react';
import { getQuiz } from '../services/gemini';
import { QuizQuestion, Difficulty } from '../types';
import { useProgress } from '../hooks/useProgress';

const Quiz: React.FC = () => {
  const { logActivity, addScore, saveFeedback } = useProgress();
  
  // App States
  const [quizState, setQuizState] = useState<'config' | 'loading' | 'quiz' | 'finished'>('config');
  const [config, setConfig] = useState({ topic: '', difficulty: Difficulty.MEDIUM });
  
  // Quiz Engine States
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  
  // Feedback States
  const [feedback, setFeedback] = useState('');
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  // Added logic to handle starting/restarting the quiz, making it reusable even without a form event
  const handleStartQuiz = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!config.topic.trim()) return;

    setQuizState('loading');
    setScore(0);
    setCurrentIndex(0);
    setSubmitted(false);
    setSelectedOption(null);
    setFeedback('');
    setFeedbackSaved(false);

    try {
      const data = await getQuiz(config.topic, config.difficulty);
      setQuestions(data);
      setQuizState('quiz');
    } catch (err) {
      console.error(err);
      setQuizState('config');
      alert("Failed to generate quiz. Please try a more common topic.");
    }
  };

  const handleOptionSelect = (idx: number) => {
    if (submitted) return;
    setSelectedOption(idx);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setSubmitted(false);
    } else {
      setQuizState('finished');
      logActivity('quiz', `Completed ${config.topic} quiz (${config.difficulty})`);
      addScore(5);
    }
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setSubmitted(true);
    if (selectedOption === questions[currentIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) return;
    await saveFeedback({
      topic: config.topic,
      score,
      total: questions.length,
      message: feedback
    });
    setFeedbackSaved(true);
  };

  if (quizState === 'config') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100">
            <BrainCircuit size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">AI Skills Lab</h2>
          <p className="text-slate-500 font-medium">Test your knowledge on any topic, generated in real-time by Gemini.</p>
        </div>

        <form onSubmit={handleStartQuiz} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-indigo-50 space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">What do you want to be tested on?</label>
            <div className="relative">
              <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" size={20} />
              <input 
                type="text" 
                placeholder="e.g. React Hooks, System Design, Python Basics..." 
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                value={config.topic}
                onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Select Difficulty Level</label>
            <div className="grid grid-cols-3 gap-3">
              {[Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD].map((level) => (
                <button 
                  key={level}
                  type="button"
                  onClick={() => setConfig({ ...config, difficulty: level })}
                  className={`py-4 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-widest ${
                    config.difficulty === level 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                      : 'border-slate-50 text-slate-400 hover:border-slate-200 bg-slate-50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-[0.98]"
          >
            Generate Quiz <Sparkles size={18} />
          </button>
        </form>
      </div>
    );
  }

  if (quizState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={32} />
        </div>
        <div className="text-center">
          <p className="text-slate-800 font-black text-xl mb-1 italic">Brainstorming questions...</p>
          <p className="text-slate-400 text-sm font-medium">Curating a fresh {config.difficulty} quiz for "{config.topic}"</p>
        </div>
      </div>
    );
  }

  if (quizState === 'finished') {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in duration-500">
        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-2xl text-center space-y-8 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
          <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-[2rem] flex items-center justify-center mx-auto rotate-12">
            <Trophy size={48} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Assessment Complete!</h2>
            <p className="text-slate-500 mt-2 font-medium">You nailed {score} out of {questions.length} correct for <span className="text-indigo-600 font-bold">{config.topic}</span>.</p>
          </div>
          <div className="text-7xl font-black text-indigo-600 tracking-tighter">{percentage}%</div>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setQuizState('config')}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 text-slate-700 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
            >
              <RefreshCw size={18} /> New Topic
            </button>
            <button 
              onClick={() => handleStartQuiz()}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest text-xs"
            >
              Retry This <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><MessageSquare size={18} /></div>
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Share Your Feedback</h3>
          </div>
          
          {feedbackSaved ? (
            <div className="bg-green-50 border border-green-100 p-6 rounded-2xl flex flex-col items-center text-center gap-2">
              <Star className="text-green-600 fill-green-600" size={32} />
              <p className="text-green-800 font-black">Feedback Saved!</p>
              <p className="text-green-600 text-sm font-medium">Thank you for helping us improve VidyaMitra.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <textarea 
                placeholder="How was the quiz? Were the questions accurate? Let us know..."
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium h-32 focus:ring-2 focus:ring-indigo-500 resize-none"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <button 
                onClick={handleFeedbackSubmit}
                disabled={!feedback.trim()}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                Submit Feedback
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Quiz Interface
  const current = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
             <span className="px-2 py-1 bg-indigo-100 text-indigo-600 rounded text-[10px] font-black uppercase tracking-widest">{config.difficulty}</span>
             <h2 className="text-xl font-black text-slate-800 tracking-tight">{config.topic}</h2>
          </div>
          <div className="h-2 w-48 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Score: {score}</div>
          <div className="text-xs font-black text-slate-500 bg-slate-100 px-4 py-2 rounded-full tracking-widest uppercase">
            {currentIndex + 1} / {questions.length}
          </div>
        </div>
      </div>

      <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-indigo-50/50 space-y-8">
        <h3 className="text-xl lg:text-2xl font-black text-slate-800 leading-tight">{current.question}</h3>
        
        <div className="grid grid-cols-1 gap-4">
          {current.options.map((option, idx) => {
            const isCorrect = submitted && idx === current.correctAnswer;
            const isWrong = submitted && selectedOption === idx && idx !== current.correctAnswer;
            const isActive = selectedOption === idx;

            return (
              <button 
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                disabled={submitted}
                className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left group ${
                  isCorrect ? 'bg-green-50 border-green-500 text-green-700' :
                  isWrong ? 'bg-red-50 border-red-500 text-red-700' :
                  isActive ? 'bg-indigo-50 border-indigo-600 text-indigo-700' :
                  'bg-white border-slate-100 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="font-bold text-sm lg:text-base">{option}</span>
                </div>
                {isCorrect && <CheckCircle2 size={24} className="shrink-0" />}
                {isWrong && <XCircle size={24} className="shrink-0" />}
              </button>
            );
          })}
        </div>

        {submitted && (
          <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100/50 animate-in fade-in slide-in-from-top-2">
            <h4 className="font-black text-indigo-700 flex items-center gap-2 mb-2 text-xs uppercase tracking-widest">
              <Sparkles size={16} /> Gemini Explanation
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">{current.explanation}</p>
          </div>
        )}

        <div className="pt-4 flex justify-between items-center border-t border-slate-50">
          <button 
            onClick={() => { if(window.confirm("Abort quiz?")) setQuizState('config'); }}
            className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
          >
            Quit Quiz
          </button>
          {!submitted ? (
            <button 
              disabled={selectedOption === null}
              onClick={handleSubmit}
              className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl disabled:opacity-50 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest text-xs active:scale-95"
            >
              Submit Answer
            </button>
          ) : (
            <button 
              onClick={handleNext}
              className="flex items-center gap-2 px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest text-xs active:scale-95"
            >
              {currentIndex < questions.length - 1 ? 'Next Challenge' : 'See Results'} <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
