import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useIDEStore } from '../stores/ideStore';
import { X, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const icons = {
  info: <Info size={16} className="text-blue-400" />,
  success: <CheckCircle size={16} className="text-green-400" />,
  warning: <AlertTriangle size={16} className="text-yellow-400" />,
  error: <XCircle size={16} className="text-red-400" />,
};

export function ToastManager() {
  const { notifications, removeNotification } = useIDEStore();

  return (
    <div className="fixed bottom-10 right-10 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <ToastItem key={notification.id} notification={notification} onRemove={() => removeNotification(notification.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ notification, onRemove }: { notification: any, onRemove: () => void, key?: React.Key }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className="bg-[#252526] border border-ide-border text-gray-200 px-4 py-3 rounded-md shadow-2xl flex items-center gap-3 min-w-[300px] pointer-events-auto"
    >
      {icons[notification.type as keyof typeof icons] || icons.info}
      <span className="flex-1 text-sm">{notification.message}</span>
      <button onClick={onRemove} className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-[#3c3c3c] transition-colors">
        <X size={14} />
      </button>
    </motion.div>
  );
}
