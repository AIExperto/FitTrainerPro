import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface WorkoutExercise {
  id: string;
  exercise_id: string;
  sets: number;
  reps: string;
  weight: number | null;
  rest_seconds: number | null;
  notes: string;
  order_index: number;
  exercises: {
    name: string;
    category: string;
  };
}

interface Workout {
  id: string;
  client_id: string;
  name: string;
  date: string;
  completed: boolean;
  duration: number | null;
  feeling: number | null;
  energy: number | null;
  notes: string;
  created_at: string;
  updated_at: string;
  workout_exercises: WorkoutExercise[];
}

export function useWorkouts(clientId?: string) {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkouts();
  }, [user, clientId]);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises (
            *,
            exercises (name, category)
          )
        `)
        .order('date', { ascending: false });

      if (user?.role === 'client') {
        query = query.eq('client_id', user.id);
      } else if (clientId) {
        query = query.eq('client_id', clientId);
      } else if (user?.role === 'trainer') {
        // Get workouts for all trainer's clients
        const { data: clientIds } = await supabase
          .from('profiles')
          .select('id')
          .eq('trainer_id', user.id);
        
        if (clientIds && clientIds.length > 0) {
          query = query.in('client_id', clientIds.map(c => c.id));
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setWorkouts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addWorkout = async (workoutData: {
    client_id: string;
    name: string;
    date: string;
    exercises: Array<{
      exercise_id: string;
      sets: number;
      reps: string;
      weight?: number;
      rest_seconds?: number;
    }>;
    notes?: string;
  }) => {
    try {
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          client_id: workoutData.client_id,
          name: workoutData.name,
          date: workoutData.date,
          notes: workoutData.notes || ''
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Add exercises
      const exercisesData = workoutData.exercises.map((exercise, index) => ({
        workout_id: workout.id,
        exercise_id: exercise.exercise_id,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
        rest_seconds: exercise.rest_seconds,
        order_index: index
      }));

      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(exercisesData);

      if (exercisesError) throw exercisesError;

      await fetchWorkouts();
      return workout;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const completeWorkout = async (workoutId: string, completionData: {
    feeling?: number;
    energy?: number;
    duration?: number;
    notes?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('workouts')
        .update({
          completed: true,
          ...completionData,
          updated_at: new Date().toISOString()
        })
        .eq('id', workoutId);

      if (error) throw error;
      await fetchWorkouts();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  return {
    workouts,
    loading,
    error,
    addWorkout,
    completeWorkout,
    refetch: fetchWorkouts
  };
}