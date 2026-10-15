import React, { useEffect } from 'react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="toast-container" id="toastContainer" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div className={`toast ${toast.isSuccess !== false ? 'toast-success' : ''}`}>
      <div>
        <strong>{toast.title}</strong>
        <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>{toast.message}</div>
      </div>
      <button
        type="button"
        style={{ color: '#FFF', fontSize: '1.2rem', marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
        onClick={() => onDismiss(toast.id)}
        aria-label="Close notification"
      >
        &times;
      </button>
    </div>
  );
};
