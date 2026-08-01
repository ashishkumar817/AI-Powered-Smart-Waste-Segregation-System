import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import GlassCard from './GlassCard';

const ActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'alert', // 'alert', 'confirm', 'danger'
  confirmText = 'OK',
  cancelText = 'Cancel'
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={type === 'alert' ? onClose : undefined}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
          className="relative w-full max-w-sm z-10"
        >
          <GlassCard tilt={false} className="bg-white/95 dark:bg-[#0f1929]/95 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-2xl p-6 relative overflow-hidden">
            
            {/* Decorative background glow */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none ${
              type === 'danger' ? 'bg-red-500' : type === 'alert' ? 'bg-blue-500' : 'bg-primary-green'
            }`} />

            {/* Header / Icon */}
            <div className="flex items-start gap-4 mb-4">
              <div className={`p-3 rounded-full flex-shrink-0 ${
                type === 'danger' ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' :
                type === 'alert' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' :
                'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400'
              }`}>
                {type === 'danger' ? <AlertTriangle size={24} /> :
                 type === 'alert' ? <Info size={24} /> :
                 <CheckCircle size={24} />}
              </div>
              
              <div className="flex-1 pt-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              {type !== 'alert' && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                  {cancelText}
                </button>
              )}
              
              <button
                onClick={() => {
                  if (onConfirm) onConfirm();
                  onClose();
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-all shadow-md ${
                  type === 'danger' 
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                    : type === 'alert'
                    ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20'
                    : 'bg-primary-green hover:bg-emerald-600 shadow-primary-green/20'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ActionModal;
