
import { useState, useEffect } from 'react';
import { persistenceService } from '../services/supabase';

export const useProgress = () => {
  const [profile, setProfile] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [prof, act, growth] = await Promise.all([
      persistenceService.getProfile(),
      persistenceService.getActivities(),
      persistenceService.getSkillGrowth()
    ]);
    setProfile(prof);
    setActivities(act);
    setGrowthData(growth);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addScore = async (amount: number) => {
    const newScore = Math.min(100, (profile?.profile_score || 0) + amount);
    const updated = await persistenceService.updateProfile({ profile_score: newScore });
    setProfile(updated);
  };

  const logActivity = async (type: string, title: string) => {
    const updated = await persistenceService.addActivity({ type, title });
    setActivities(updated);
  };

  const saveFeedback = async (feedback: { topic: string, score: number, total: number, message: string }) => {
    await persistenceService.saveQuizFeedback(feedback);
  };

  return { profile, activities, growthData, loading, addScore, logActivity, saveFeedback, refresh: fetchData };
};
