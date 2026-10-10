import React from 'react';
import { useApp, ScreenTab } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setDraftWorkingQuote } = useApp();

  const handleNewClick = () => {
    setDraftWorkingQuote(null);
    setActiveTab('nuevo');
  };

  const navItems: { id: ScreenTab; label: string; icon: string; isSpecial?: boolean }[] = [
    { id: 'presupuestos', label: 'Presupuestos', icon: 'request_quote' },
    { id: 'nuevo', label: 'Nuevo', icon: 'add', isSpecial: true },
    { id: 'seguimiento', label: 'Seguimiento', icon: 'visibility' },
    { id: 'catalogo', label: 'Catálogo', icon: 'inventory_2' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-[#effdf3]/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.05)] border-t border-[#ddece2]">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-1">
        {navItems.map(item => {
          const isActive = activeTab === item.id;

          if (item.isSpecial) {
            return (
              <button
                key={item.id}
                onClick={handleNewClick}
                className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] transition-all ${
                  isActive ? 'text-[#005232]' : 'text-[#3f4942]'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#005232] flex items-center justify-center -mt-3 shadow-[0_4px_12px_rgba(0,82,50,0.35)] active:scale-90 transition-transform">
                  <span className="material-symbols-outlined text-white text-[24px]">add</span>
                </div>
                <span className="font-label-sm mt-0.5 font-bold">Nuevo</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] transition-colors ${
                isActive ? 'text-[#005232] font-semibold' : 'text-[#3f4942] hover:text-[#121e18]'
              }`}
            >
              <span className={`material-symbols-outlined text-[24px] ${isActive ? 'material-symbols-filled' : ''}`}>
                {item.icon}
              </span>
              <span className="font-label-sm mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
