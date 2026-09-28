import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function AppLayout({ header, children }) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar / Barra Lateral */}
            <aside className="w-64 bg-indigo-900 text-white flex flex-col shadow-md">
                <div className="p-5 text-2xl font-bold tracking-wider border-b border-indigo-800">
                    CRM Educativo
                </div>
                
                <nav className="flex-1 p-4 space-y-2">
                    <Link 
                        href="/dashboard" 
                        className="block px-4 py-2 rounded hover:bg-indigo-700 transition"
                    >
                        Dashboard
                    </Link>
                    <Link 
                        href="/leads" 
                        className="block px-4 py-2 rounded hover:bg-indigo-700 transition"
                    >
                        Gestión de Leads
                    </Link>
                    <Link 
                        href="/pipeline" 
                        className="block px-4 py-2 rounded hover:bg-indigo-700 transition"
                    >
                        Kanban / Pipeline
                    </Link>
                    <Link 
                        href="/importador" 
                        className="block px-4 py-2 rounded hover:bg-indigo-700 transition"
                    >
                        Importar CSV
                    </Link>
                </nav>

                <div className="p-4 border-t border-indigo-800 text-sm text-indigo-300">
                    Rol: {auth?.user?.role || 'Invitado'}
                </div>
            </aside>

            {/* Contenido Principal */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8">
                    <h1 className="text-xl font-semibold text-gray-800">
                        {header || 'Panel General'}
                    </h1>
                    <div className="text-sm text-gray-600">
                        {auth?.user?.name || 'Usuario'}
                    </div>
                </header>

                <main className="p-8 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}