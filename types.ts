
export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  profileScore: number;
  streakDays: number;
}

export interface Skill {
  name: string;
  level: number; // 0-100
  category: string;
}

export interface ResumeAnalysis {
  atsScore: number;
  identifiedSkills: string[];
  strengths: string[];
  recommendations: string[];
  parsedInfo: {
    name?: string;
    email?: string;
    experienceSummary?: string;
  };
}

export interface LearningTask {
  title: string;
  description: string;
  completed: boolean;
}

export interface WeeklyPlan {
  week: number;
  topic: string;
  tasks: LearningTask[];
  resourceLink?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface InterviewMessage {
  role: 'interviewer' | 'candidate';
  text: string;
  timestamp: number;
}
