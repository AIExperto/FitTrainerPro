import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Exercise {
  id: string;
  name: string;
  category: string;
  description: string;
  instructions: string[];
  target_muscles: string[];
  created_at: string;
}

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (error) throw error;
      setExercises(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    exercises,
    loading,
    error,
    refetch: fetchExercises
  };
}