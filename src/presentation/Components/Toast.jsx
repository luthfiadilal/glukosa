import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';

const Toast = ({ message, type = 'success', onClose }) => {
    const config = {
        success: {
            icon: 'heroicons:check-circle',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            iconColor: 'text-green-600',
            textColor: 'text-green-800',
        },
        error: {
            icon: 'heroicons:x-circle',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            iconColor: 'text-red-600',
            textColor: 'text-red-800',
        },
    };

    const style = config[type] || config.success;

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`${style.bgColor} ${style.borderColor} ${style.textColor} px-4 py-3 rounded-xl border shadow-lg flex items-center gap-3 min-w-[300px] max-w-md`}
        >
            <Icon icon={style.icon} className={`w-5 h-5 ${style.iconColor} flex-shrink-0`} />
            <p className="text-sm font-medium flex-1">{message}</p>
            <button
                onClick={onClose}
                className={`${style.iconColor} hover:opacity-70 transition-opacity`}
            >
                <Icon icon="heroicons:x-mark" className="w-5 h-5" />
            </button>
        </motion.div>
    );
};

export default Toast;
