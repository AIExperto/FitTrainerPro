import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ProgressEntry {
  id: string;
  client_id: string;
  date: string;
  weight: number;
  body_fat: number | null;
  muscle_mass: number | null;
  bmi: number | null;
  measurements: Record<string, any>;
  notes: string;
  created_at: string;
}

export function useProgress(clientId?: string) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetClientId = clientId || user?.id;

  useEffect(() => {
    if (targetClientId) {
      fetchProgress();
    }
  }, [targetClientId]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('progress_entries')
        .select('*')
        .eq('client_id', targetClientId)
        .order('date', { ascending: true });

      if (error) throw error;
      setProgress(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addProgress = async (progressData: {
    date: string;
    weight: number;
    body_fat?: number;
    muscle_mass?: number;
    measurements?: Record<string, any>;
    notes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('progress_entries')
        .insert({
          client_id: targetClientId!,
          ...progressData
        })
        .select()
        .single();

      if (error) throw error;
      
      setProgress(prev => [...prev, data]);
      return data;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  return {
    progress,
    loading,
    error,
    addProgress,
    refetch: fetchProgress
  };
}