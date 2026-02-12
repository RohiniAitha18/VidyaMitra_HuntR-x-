
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (process.env as any).SUPABASE_URL || 'https://placeholder-url.supabase.co';
const SUPABASE_ANON_KEY = (process.env as any).SUPABASE_ANON_KEY || 'placeholder-key';

// This client will handle auth and data
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Mock storage for demo if keys are placeholders
const MOCK_STORAGE_KEY = 'vidyamitra_mock_db';

const getMockDB = () => {
  const data = localStorage.getItem(MOCK_STORAGE_KEY);
  return data ? JSON.parse(data) : {
    profile: {
      full_name: 'John Doe',
      avatar_url: 'https://picsum.photos/seed/user/100/100',
      profile_score: 65,
      streak_days: 12,
      skills_assessed: 8,
      achievements: 5
    },
    activities: [
      { type: 'resume', title: 'Completed Resume Analysis', time: '2 hours ago' },
      { type: 'quiz', title: 'Scored 92% in React Quiz', time: 'Yesterday' }
    ],
    skill_growth: [
      { name: 'Week 1', score: 45 },
      { name: 'Week 2', score: 52 },
      { name: 'Week 3', score: 68 },
      { name: 'Week 4', score: 72 },
      { name: 'Week 5', score: 85 }
    ],
    quiz_feedback: []
  };
};

export const persistenceService = {
  getProfile: async () => {
    return getMockDB().profile;
  },
  updateProfile: async (updates: any) => {
    const db = getMockDB();
    db.profile = { ...db.profile, ...updates };
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
    return db.profile;
  },
  getActivities: async () => {
    return getMockDB().activities;
  },
  addActivity: async (activity: any) => {
    const db = getMockDB();
    db.activities.unshift({ ...activity, time: 'Just now' });
    if (db.activities.length > 10) db.activities.pop();
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
    return db.activities;
  },
  getSkillGrowth: async () => {
    return getMockDB().skill_growth;
  },
  saveQuizFeedback: async (feedback: { topic: string, score: number, total: number, message: string }) => {
    const db = getMockDB();
    if (!db.quiz_feedback) db.quiz_feedback = [];
    db.quiz_feedback.push({ ...feedback, timestamp: Date.now() });
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
    return true;
  }
};
