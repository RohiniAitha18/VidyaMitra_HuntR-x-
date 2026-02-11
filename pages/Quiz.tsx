
import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ChevronRight, Loader2, Trophy, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import { getQuiz } from '../services/gemini';
import { QuizQuestion, Difficulty } from '../types';

const Quiz: React.FC = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    setLoading(true);
    setFinished(false);
    setCurrentIndex(0);
    setScore(0);
    setSubmitted(false);
    try {
      const data = await getQuiz("JavaScript", Difficulty.MEDIUM);
      setQuestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
      setFinished(true);
    }
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setSubmitted(true);
    if (selectedOption === questions[currentIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="text-slate-500 font-medium">Generating your customized quiz...</p>
      </div>
    );
  }

  if (finished) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-3xl border border-slate-100 shadow-xl text-center space-y-8">
        <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto">
          <Trophy size={48} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Assessment Complete!</h2>
          <p className="text-slate-500 mt-2">You scored {score} out of {questions.length} questions correctly.</p>
        </div>
        <div className="text-5xl font-black text-indigo-600">{percentage}%</div>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={loadQuiz}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
          >
            <RefreshCw size={18} /> Retake Quiz
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
            View Analytics <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  const current = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Skill Check</h2>
          <p className="text-slate-500">Domain: JavaScript Fundamentals</p>
        </div>
        <div className="text-sm font-bold text-slate-400 bg-slate-100 px-4 py-2 rounded-full">
          Question {currentIndex + 1} / {questions.length}
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
        <h3 className="text-xl font-bold text-slate-800">{current.question}</h3>
        
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
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
                  isCorrect ? 'bg-green-50 border-green-500 text-green-700' :
                  isWrong ? 'bg-red-50 border-red-500 text-red-700' :
                  isActive ? 'bg-indigo-50 border-indigo-600 text-indigo-700' :
                  'bg-white border-slate-100 hover:border-slate-300 text-slate-600'
                }`}
              >
                <span className="font-semibold">{option}</span>
                {isCorrect && <CheckCircle2 size={20} />}
                {isWrong && <XCircle size={20} />}
              </button>
            );
          })}
        </div>

        {submitted && (
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
              <Sparkles className="text-indigo-600" size={18} /> Explanation
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">{current.explanation}</p>
          </div>
        )}

        <div className="pt-4 flex justify-end">
          {!submitted ? (
            <button 
              disabled={selectedOption === null}
              onClick={handleSubmit}
              className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl disabled:opacity-50 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
            >
              Submit Answer
            </button>
          ) : (
            <button 
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
            >
              {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'} <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
