
import React from 'react';

const Button = ({ children, type = 'button', onClick, variant = 'primary', className = '', disabled = false }) => {
    const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex justify-center items-center focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-md hover:shadow-lg",
        secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500",
        outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
        danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;
