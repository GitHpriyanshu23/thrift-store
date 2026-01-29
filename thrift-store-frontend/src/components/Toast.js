import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

  return createPortal(
    <div className="fixed top-20 right-4 z-[9999] animate-slideInFromRight">
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md`}>
        <span className="text-2xl font-bold">{icon}</span>
        <span className="font-medium flex-1">{message}</span>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-200 text-xl font-bold ml-2"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>,
    document.body
  );
}

export default Toast;
