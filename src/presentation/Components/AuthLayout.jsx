
import React from 'react';
import { Icon } from '@iconify/react';

const AuthLayout = ({ children, title, subtitle, wide = false }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 font-sans">
            <div className={`w-full ${wide ? 'max-w-3xl' : 'max-w-md'}`}>
                {/* Logo/Icon Section */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl shadow-lg mb-4">
                        <Icon icon="healthicons:diabetes" className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-1">
                        Glukosa
                    </h1>
                </div>

                {/* Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 overflow-hidden shadow-xl">
                    <div className="p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                        </div>
                        {children}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    © 2024 Glukosa. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default AuthLayout;
