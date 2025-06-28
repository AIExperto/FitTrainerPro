import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useClients } from '../../hooks/useClients';
import { useWorkouts } from '../../hooks/useWorkouts';
import { Users, Calendar, Activity, TrendingUp, MessageSquare, Clock } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';

export function TrainerDashboard() {
  const { user } = useAuth();
  const { clients, loading: clientsLoading } = useClients();
  const { workouts, loading: workoutsLoading } = useWorkouts();

  if (clientsLoading || workoutsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalClients = clients.length;
  const activeClients = clients.length; // All clients are considered active for now
  const completedWorkouts = workouts.filter(w => w.completed).length;
  const pendingMessages = 0; // Placeholder

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          ¡Bienvenido de vuelta, {user?.name}!
        </h1>
        <p className="text-blue-100">
          Aquí tienes un resumen de tu actividad como entrenador
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clientes</p>
              <p className="text-3xl font-bold text-gray-900">{totalClients}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
              <p className="text-3xl font-bold text-gray-900">{activeClients}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entrenamientos</p>
              <p className="text-3xl font-bold text-gray-900">{completedWorkouts}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mensajes</p>
              <p className="text-3xl font-bold text-gray-900">{pendingMessages}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <MessageSquare className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entrenamientos recientes */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Entrenamientos Recientes</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {workouts.slice(0, 5).map((workout) => {
              const client = clients.find(c => c.id === workout.client_id);
              return (
                <div key={workout.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full ${workout.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Activity className={`w-4 h-4 ${workout.completed ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{workout.name}</p>
                    <p className="text-sm text-gray-500">
                      {client?.name} • {format(new Date(workout.date), 'dd MMM yyyy', { locale: es })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      workout.completed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {workout.completed ? 'Completado' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              );
            })}
            {workouts.length === 0 && (
              <p className="text-gray-500 text-center py-4">No hay entrenamientos registrados</p>
            )}
          </div>
        </div>

        {/* Clientes recientes */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Clientes Recientes</h2>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {clients.slice(0, 4).map((client) => (
              <div key={client.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex-shrink-0">
                  {client.avatar_url ? (
                    <img src={client.avatar_url} alt={client.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{client.name}</p>
                  <p className="text-sm text-gray-500">
                    {client.current_weight}kg • {client.age} años
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {format(new Date(client.created_at), 'dd MMM', { locale: es })}
                  </p>
                </div>
              </div>
            ))}
            {clients.length === 0 && (
              <p className="text-gray-500 text-center py-4">No tienes clientes registrados</p>
            )}
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
        <div className="space-y-4">
          {workouts.filter(w => w.completed).slice(0, 3).map((workout) => {
            const client = clients.find(c => c.id === workout.client_id);
            return (
              <div key={workout.id} className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Activity className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    {client?.name} completó "{workout.name}"
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(workout.updated_at), 'dd MMM yyyy HH:mm', { locale: es })}
                  </p>
                </div>
              </div>
            );
          })}
          {workouts.filter(w => w.completed).length === 0 && (
            <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
          )}
        </div>
      </div>
    </div>
  );
}