import React from 'react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toastMessage, showToast } = useApp();

  if (!toastMessage) return null;

  return (
    <aside aria-label="Notificaciones" className="fixed bottom-20 left-4 right-4 max-w-sm mx-auto z-50 transition-all duration-300">
      <div className="bg-[#27332d] text-[#e6f4ea] px-4 py-3 rounded-xl shadow-xl flex items-center justify-between border border-[#3f4942]/40">
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <span className="material-symbols-outlined text-[#8bd6aa] text-[20px] flex-shrink-0">
            check_circle
          </span>
          <span className="font-body-md font-medium text-[13px] leading-snug line-clamp-2">
            {toastMessage}
          </span>
        </div>
        <button
          className="text-[#8bd6aa] font-label-sm uppercase hover:underline flex-shrink-0 ml-1 py-1 px-1.5"
          onClick={() => showToast('')}
        >
          Cerrar
        </button>
      </div>
    </aside>
  );
};
