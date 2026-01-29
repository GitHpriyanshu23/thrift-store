import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext({ showToast: () => {} });

export const ToastProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('success');
  const timeoutRef = useRef(null);

  const hide = useCallback(() => {
    setOpen(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const showToast = useCallback((msg, opts = {}) => {
    const { type: t = 'success', duration = 2200 } = opts;
    setMessage(msg);
    setType(t);
    setOpen(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(hide, duration);
  }, [hide]);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {open && <Toast message={message} type={type} onClose={hide} />}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
