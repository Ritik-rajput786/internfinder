import React from 'react';

const ConfirmModal = ({ open, title = 'Confirm', message = 'Are you sure?', onConfirm, onCancel, confirmText = 'Yes', cancelText = 'No' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-700 mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 rounded border" onClick={onCancel}>{cancelText}</button>
          <button className="px-4 py-2 rounded bg-red-600 text-white" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
