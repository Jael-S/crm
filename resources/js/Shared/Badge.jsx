import React from 'react';

export default function Badge({ children, variant = 'info', className = '' }) {
    const variants = {
        info: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 dark:border dark:border-blue-800/60",
        primary: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 dark:border dark:border-blue-800/60",
        success: "bg-green-100 text-green-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border dark:border-emerald-800/60",
        warning: "bg-yellow-100 text-yellow-800 dark:bg-amber-950/60 dark:text-amber-300 dark:border dark:border-amber-800/60",
        danger: "bg-red-100 text-red-800 dark:bg-rose-950/60 dark:text-rose-300 dark:border dark:border-rose-800/60",
        gray: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:border dark:border-slate-700",
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant] || variants.info} ${className}`}>
            {children}
        </span>
    );
}
