import React from 'react';

export default function Button({ children, onClick, type = 'submit', variant = 'primary' }) {
    const baseStyles = "px-4 py-2 rounded font-medium transition focus:outline-none";
    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700",
        secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
        danger: "bg-red-600 text-white hover:bg-red-700",
    };

    return (
        <button type={type} onClick={onClick} className={`${baseStyles} ${variants[variant] || variants.primary}`}>
            {children}
        </button>
    );
}