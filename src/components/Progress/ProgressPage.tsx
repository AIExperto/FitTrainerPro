import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProgress } from '../../hooks/useProgress';
import { 
  TrendingUp, 
  Plus, 
  Weight,
  Activity,
  Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AddProgressModal } from './AddProgressModal';

export function ProgressPage() {
  const { user } = useAuth();
  const { progress, loading, addProgress } = useProgress();
  const [selectedMetric, setSelectedMetric] = useState<'weight' | 'body_fat' | 'muscle_mass'>('weight');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const chartData = progress.map(entry => ({
    date: format(new Date(entry.date), 'dd/MM'),
    peso: entry.weight,
    grasa: entry.body_fat || 0,
    musculo: entry.muscle_mass || 0,
    imc: entry.bmi || 0
  }));

  const latestProgress = progress[progress.length - 1];
  const previousProgress = progress[progress.length - 2];

  const getChange = (current?: number, previous?: number) => {
    if (!current || !previous) return null;
    const change = current - previous;
    return {
      value: Math.abs(change),
      isPositive: change > 0,
      percentage: ((change / previous) * 100).toFixed(1)
    };
  };

  const weightChange = getChange(latestProgress?.weight, previousProgress?.weight);
  const bodyFatChange = getChange(latestProgress?.body_fat, previousProgress?.body_fat);
  const muscleMassChange = getChange(latestProgress?.muscle_mass, previousProgress?.muscle_mass);

  const handleAddProgress = async (progressData: any) => {
    try {
      await addProgress(progressData);
      setIsAddModalOpen(false);
    } catch (error: any) {
      alert('Error al agregar medición: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Progreso</h1>
          <p className="mt-1 text-sm text-gray-600">
            Sigue tu evolución física y objetivos
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Medición
        </button>
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
              {weightChange && (
                <p className={`text-sm ${weightChange.isPositive ? 'text-red-600' : 'text-green-600'}`}>
                  {weightChange.isPositive ? '+' : '-'}{weightChange.value}kg ({weightChange.percentage}%)
                </p>
              )}
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Weight className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">% Grasa Corporal</p>
              <p className="text-3xl font-bold text-gray-900">
                {latestProgress?.body_fat || 0}
                <span className="text-lg font-normal text-gray-500">%</span>
              </p>
              {bodyFatChange && (
                <p className={`text-sm ${bodyFatChange.isPositive ? 'text-red-600' : 'text-green-600'}`}>
                  {bodyFatChange.isPositive ? '+' : '-'}{bodyFatChange.value}% ({bodyFatChange.percentage}%)
                </p>
              )}
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Masa Muscular</p>
              <p className="text-3xl font-bold text-gray-900">
                {latestProgress?.muscle_mass || 0}
                <span className="text-lg font-normal text-gray-500">kg</span>
              </p>
              {muscleMassChange && (
                <p className={`text-sm ${muscleMassChange.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {muscleMassChange.isPositive ? '+' : '-'}{muscleMassChange.value}kg ({muscleMassChange.percentage}%)
                </p>
              )}
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
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
              <p className="text-sm text-gray-500">
                {latestProgress?.bmi && latestProgress.bmi < 18.5 ? 'Bajo peso' :
                 latestProgress?.bmi && latestProgress.bmi < 25 ? 'Normal' :
                 latestProgress?.bmi && latestProgress.bmi < 30 ? 'Sobrepeso' : 'Obesidad'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de evolución */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Evolución Temporal</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedMetric('weight')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                selectedMetric === 'weight'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Peso
            </button>
            <button
              onClick={() => setSelectedMetric('body_fat')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                selectedMetric === 'body_fat'
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              % Grasa
            </button>
            <button
              onClick={() => setSelectedMetric('muscle_mass')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                selectedMetric === 'muscle_mass'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Masa Muscular
            </button>
          </div>
        </div>
        
        <div className="h-80">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey={selectedMetric === 'weight' ? 'peso' : selectedMetric === 'body_fat' ? 'grasa' : 'musculo'}
                  stroke={selectedMetric === 'weight' ? '#3B82F6' : selectedMetric === 'body_fat' ? '#F97316' : '#10B981'}
                  strokeWidth={3}
                  dot={{ fill: selectedMetric === 'weight' ? '#3B82F6' : selectedMetric === 'body_fat' ? '#F97316' : '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <TrendingUp className="mx-auto h-8 w-8 mb-2" />
                <p>No hay datos de progreso</p>
                <p className="text-sm">Agrega tu primera medición</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historial de mediciones */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Historial de Mediciones</h2>
        {progress.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Peso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % Grasa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Masa Muscular
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IMC
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {progress.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {format(new Date(entry.date), 'dd MMM yyyy', { locale: es })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.weight} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.body_fat || 'N/A'}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.muscle_mass || 'N/A'} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.bmi?.toFixed(1) || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="mx-auto h-8 w-8 mb-2" />
            <p>No hay mediciones registradas</p>
            <p className="text-sm">Agrega tu primera medición para comenzar a hacer seguimiento</p>
          </div>
        )}
      </div>

      <AddProgressModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddProgress}
      />
    </div>
  );
}