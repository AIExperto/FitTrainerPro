import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useClients } from '../../hooks/useClients';
import { 
  Dumbbell, 
  Plus, 
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  User,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AddWorkoutModal } from './AddWorkoutModal';
import { CompleteWorkoutModal } from './CompleteWorkoutModal';

export function WorkoutsPage() {
  const { user } = useAuth();
  const { workouts, loading, completeWorkout } = useWorkouts();
  const { clients } = useClients();
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'pending'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredWorkouts = workouts.filter(workout => {
    if (activeTab === 'completed') return workout.completed;
    if (activeTab === 'pending') return !workout.completed;
    return true;
  });

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Cliente desconocido';
  };

  const handleCompleteWorkout = (workout: any) => {
    setSelectedWorkout(workout);
    setIsCompleteModalOpen(true);
  };

  const handleWorkoutCompletion = async (completionData: any) => {
    try {
      await completeWorkout(selectedWorkout.id, completionData);
      setIsCompleteModalOpen(false);
      setSelectedWorkout(null);
    } catch (error: any) {
      alert('Error al completar entrenamiento: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'trainer' ? 'Rutinas de Clientes' : 'Mis Rutinas'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {user?.role === 'trainer' 
              ? 'Gestiona las rutinas de entrenamiento de tus clientes'
              : 'Sigue tus rutinas de entrenamiento asignadas'
            }
          </p>
        </div>
        {user?.role === 'trainer' && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Rutina
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Todas ({workouts.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'completed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Completadas ({workouts.filter(w => w.completed).length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pendientes ({workouts.filter(w => !w.completed).length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {filteredWorkouts.map((workout) => (
              <div key={workout.id} className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 rounded-full ${workout.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {workout.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{workout.name}</h3>
                        {user?.role === 'trainer' && (
                          <div className="flex items-center space-x-2 mt-1">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{getClientName(workout.client_id)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(workout.date), 'dd MMM yyyy', { locale: es })}</span>
                      </div>
                      {workout.duration && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{workout.duration} min</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Activity className="w-4 h-4" />
                        <span>{workout.workout_exercises.length} ejercicios</span>
                      </div>
                    </div>

                    {/* Lista de ejercicios */}
                    <div className="space-y-2">
                      {workout.workout_exercises.map((exercise, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {exercise.exercises.name}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {exercise.sets} series × {exercise.reps} reps
                            {exercise.weight && ` • ${exercise.weight}kg`}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Notas y sensaciones */}
                    {workout.completed && (workout.feeling || workout.energy || workout.notes) && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          {workout.feeling && (
                            <div>
                              <span className="font-medium">Sensación: </span>
                              <span className="text-yellow-600">{'★'.repeat(workout.feeling)}</span>
                            </div>
                          )}
                          {workout.energy && (
                            <div>
                              <span className="font-medium">Energía: </span>
                              <span className="text-blue-600">{'⚡'.repeat(workout.energy)}</span>
                            </div>
                          )}
                        </div>
                        {workout.notes && (
                          <p className="mt-2 text-sm text-gray-700 italic">"{workout.notes}"</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col space-y-2 ml-4">
                    {!workout.completed && user?.role === 'client' && (
                      <button 
                        onClick={() => handleCompleteWorkout(workout)}
                        className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Marcar Completado
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredWorkouts.length === 0 && (
            <div className="text-center py-12">
              <Dumbbell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {activeTab === 'completed' ? 'No hay entrenamientos completados' :
                 activeTab === 'pending' ? 'No hay entrenamientos pendientes' :
                 'No hay entrenamientos'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {user?.role === 'trainer' 
                  ? 'Crea una rutina para tus clientes'
                  : 'Tu entrenador te asignará rutinas pronto'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      <AddWorkoutModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <CompleteWorkoutModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        onComplete={handleWorkoutCompletion}
        workoutName={selectedWorkout?.name || ''}
      />
    </div>
  );
}