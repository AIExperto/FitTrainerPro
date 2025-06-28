import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'trainer' | 'client';
          trainer_id: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role: 'trainer' | 'client';
          trainer_id?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'trainer' | 'client';
          trainer_id?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          age: number;
          gender: 'male' | 'female' | 'other';
          height: number;
          current_weight: number;
          goals: string[];
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          age: number;
          gender: 'male' | 'female' | 'other';
          height: number;
          current_weight: number;
          goals?: string[];
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          age?: number;
          gender?: 'male' | 'female' | 'other';
          height?: number;
          current_weight?: number;
          goals?: string[];
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      progress_entries: {
        Row: {
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
        };
        Insert: {
          id?: string;
          client_id: string;
          date?: string;
          weight: number;
          body_fat?: number | null;
          muscle_mass?: number | null;
          measurements?: Record<string, any>;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          date?: string;
          weight?: number;
          body_fat?: number | null;
          muscle_mass?: number | null;
          measurements?: Record<string, any>;
          notes?: string;
          created_at?: string;
        };
      };
      exercises: {
        Row: {
          id: string;
          name: string;
          category: string;
          description: string;
          instructions: string[];
          target_muscles: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          description?: string;
          instructions?: string[];
          target_muscles?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          description?: string;
          instructions?: string[];
          target_muscles?: string[];
          created_at?: string;
        };
      };
      workouts: {
        Row: {
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
        };
        Insert: {
          id?: string;
          client_id: string;
          name: string;
          date?: string;
          completed?: boolean;
          duration?: number | null;
          feeling?: number | null;
          energy?: number | null;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          name?: string;
          date?: string;
          completed?: boolean;
          duration?: number | null;
          feeling?: number | null;
          energy?: number | null;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      workout_exercises: {
        Row: {
          id: string;
          workout_id: string;
          exercise_id: string;
          sets: number;
          reps: string;
          weight: number | null;
          rest_seconds: number | null;
          notes: string;
          order_index: number;
        };
        Insert: {
          id?: string;
          workout_id: string;
          exercise_id: string;
          sets: number;
          reps: string;
          weight?: number | null;
          rest_seconds?: number | null;
          notes?: string;
          order_index?: number;
        };
        Update: {
          id?: string;
          workout_id?: string;
          exercise_id?: string;
          sets?: number;
          reps?: string;
          weight?: number | null;
          rest_seconds?: number | null;
          notes?: string;
          order_index?: number;
        };
      };
      appointments: {
        Row: {
          id: string;
          client_id: string;
          trainer_id: string;
          date: string;
          start_time: string;
          end_time: string;
          location: string;
          type: 'personal' | 'group' | 'consultation';
          status: 'scheduled' | 'completed' | 'cancelled';
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          trainer_id: string;
          date: string;
          start_time: string;
          end_time: string;
          location: string;
          type: 'personal' | 'group' | 'consultation';
          status?: 'scheduled' | 'completed' | 'cancelled';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          trainer_id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          location?: string;
          type?: 'personal' | 'group' | 'consultation';
          status?: 'scheduled' | 'completed' | 'cancelled';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          from_id: string;
          to_id: string;
          content: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          from_id: string;
          to_id: string;
          content: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          from_id?: string;
          to_id?: string;
          content?: string;
          read?: boolean;
          created_at?: string;
        };
      };
    };
  };
}