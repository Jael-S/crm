import React from 'react';
import AppLayout from '@/Layouts/AppLayout';

export default function DashboardIndex() {
    return (
        <AppLayout header="Dashboard">
            <div className="bg-white p-6 rounded shadow">
                <p className="text-gray-700">Widgets del panel principal por rol </p>
            </div>
        </AppLayout>
    );
}