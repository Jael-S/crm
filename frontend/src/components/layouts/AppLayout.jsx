import React from 'react';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Barra superior de navegación */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <span className="text-xl font-bold text-purple-600">CRM Educativo</span>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="flex flex-1">
        {/* Menú lateral básico */}
        <aside className="w-64 bg-white border-r border-gray-200 p-4 hidden md:block">
          <nav className="space-y-2">
            <a href="#" className="block px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg">
              Dashboard
            </a>
            <a href="#" className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
              Importar Leads (CSV)
            </a>
            <a href="#" className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
              Catálogos (Lookups)
            </a>
          </nav>
        </aside>

        {/* Zona dinámica de vistas */}
        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}