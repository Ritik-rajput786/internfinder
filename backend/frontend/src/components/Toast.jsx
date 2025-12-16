import { useEffect, useState } from 'react';

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const { message, type = 'info', duration = 3000 } = e.detail || {};
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    };

    window.addEventListener('appToast', handler);
    return () => window.removeEventListener('appToast', handler);
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="fixed top-6 right-6 z-50 space-y-3">
      {toasts.map((t) => (
        <div key={t.id} className={`min-w-[220px] max-w-sm px-4 py-2 rounded shadow-lg text-sm ${t.type === 'error' ? 'bg-red-50 text-red-800 border border-red-100' : 'bg-green-50 text-green-800 border border-green-100'}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
};

export default Toast;
