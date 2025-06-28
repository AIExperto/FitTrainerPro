import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProgress } from '../../hooks/useProgress';
import { useWorkouts } from '../../hooks/useWorkouts';
import { Activity, Target, Calendar, TrendingUp, Dumbbell, Apple } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function ClientDashboard() {
  const { user } = useAuth();
  const { progress, loading: progressLoading } = useProgress();
  const { workouts, loading: workoutsLoading } = useWorkouts();
  
  if (progressLoading || workoutsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Datos para el gráfico de peso
  const weightData = progress.map(entry => ({
    date: format(new Date(entry.date), 'dd/MM'),
    peso: entry.weight,
    grasa: entry.body_fat || 0,
    musculo: entry.muscle_mass || 0
  }));

  const latestProgress = progress[progress.length - 1];
  const completedWorkouts = workouts.filter(w => w.completed).length;
  const totalWorkouts = workouts.length;

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          ¡Hola, {user?.name}!
        </h1>
        <p className="text-purple-100">
          Continúa con tu progreso hacia tus objetivos
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Peso Actual</p>
              <p className="text-3xl font-bold text-gray-900">
                {latestProgress?.weight || 0}
                <span className="text-lg font-normal text-gray-500">kg</span>
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">IMC</p>
              <p className="text-3xl font-bold text-gray-900">
                {latestProgress?.bmi?.toFixed(1) || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entrenamientos</p>
              <p className="text-3xl font-bold text-gray-900">
                {completedWorkouts}/{totalWorkouts}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Dumbbell className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">% Grasa</p>
              <p className="text-3xl font-bold text-gray-900">
                {latestProgress?.body_fat || 0}
                <span className="text-lg font-normal text-gray-500">%</span>
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de evolución */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Evolución de Peso</h2>
          <div className="h-64">
            {weightData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="peso" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Activity className="mx-auto h-8 w-8 mb-2" />
                  <p>No hay datos de progreso</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Entrenamientos recientes */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Entrenamientos Recientes</h2>
            <Dumbbell className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {workouts.slice(0, 4).map((workout) => (
              <div key={workout.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-full ${workout.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Dumbbell className={`w-4 h-4 ${workout.completed ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{workout.name}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(workout.date), 'dd MMM yyyy', { locale: es })}
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
            ))}
            {workouts.length === 0 && (
              <p className="text-gray-500 text-center py-4">No tienes entrenamientos asignados</p>
            )}
          </div>
        </div>
      </div>

      {/* Mediciones y próximas actividades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mediciones Actuales</h2>
          {latestProgress?.measurements && Object.keys(latestProgress.measurements).length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(latestProgress.measurements).map(([key, value]) => (
                <div key={key} className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 capitalize">{key}</p>
                  <p className="text-xl font-bold text-blue-600">{value}cm</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="mx-auto h-8 w-8 mb-2" />
              <p>No hay mediciones registradas</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximas Actividades</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Próximo entrenamiento</p>
                <p className="text-xs text-gray-500">Revisa tu calendario</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Activity className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Registro de progreso</p>
                <p className="text-xs text-gray-500">Actualiza tus mediciones</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <Apple className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Plan nutricional</p>
                <p className="text-xs text-gray-500">Consulta con tu entrenador</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}