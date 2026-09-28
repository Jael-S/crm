import React, { useEffect, useState } from 'react';
import AppLayout from './components/layouts/AppLayout';
import api from './api/axios';

export default function App() {
  const [etapas, setEtapas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Llamada al endpoint de lookups que creaste en el backend
    api.get('/lookups/etapas')
      .then(response => {
        // Asumiendo que tu API devuelve los datos en una propiedad data o directamente el array
        setEtapas(response.data.data || response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al conectar con el backend:", err);
        setError("No se pudo conectar con el backend de Laravel. Asegúrate de que esté encendido.");
        setLoading(false);
      });
  }, []);

  return (
    <AppLayout>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Bienvenido al CRM </h1>
        <div className="border-t border-gray-100 pt-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Etapas del Pipeline (Cargadas desde Laravel):</h2>

          {loading && <p className="text-purple-600 animate-pulse">Cargando etapas del backend...</p>}
          {error && <p className="text-red-500 font-medium bg-red-50 p-3 rounded-lg">{error}</p>}

          {!loading && !error && etapas.length > 0 && (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {etapas.map((etapa, index) => (
                <li key={etapa.id || index} className="bg-purple-50 border border-purple-100 p-3 rounded-lg flex items-center justify-between">
                  <span className="font-medium text-purple-900">{etapa.nombre || etapa}</span>
                  <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded font-bold">Fija</span>
                </li>
              ))}
            </ul>
          )}

          {!loading && !error && etapas.length === 0 && (
            <p className="text-gray-500">No se encontraron etapas registradas en el seeder.</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}