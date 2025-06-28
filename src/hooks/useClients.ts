import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Client {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  current_weight: number;
  goals: string[];
  notes: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useClients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'trainer') {
      fetchClients();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          clients (*)
        `)
        .eq('role', 'client')
        .eq('trainer_id', user?.id);

      if (error) throw error;

      const clientsData = data?.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        ...profile.clients[0]
      })) || [];

      setClients(clientsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (clientData: {
    name: string;
    email: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    height: number;
    current_weight: number;
    goals: string[];
    notes: string;
  }) => {
    try {
      // This would typically involve creating a user account for the client
      // For now, we'll just show a success message
      throw new Error('La funcionalidad de agregar clientes requiere configuración adicional de autenticación');
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  return {
    clients,
    loading,
    error,
    addClient,
    refetch: fetchClients
  };
}