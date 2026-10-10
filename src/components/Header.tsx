import React from 'react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, setIsProfileModalOpen } = useApp();

  const getSubhead = () => {
    switch (activeTab) {
      case 'presupuestos':
        return 'Presupuestos';
      case 'nuevo':
        return 'Nuevo Presupuesto';
      case 'seguimiento':
        return 'Seguimiento';
      case 'catalogo':
        return 'Catálogo y Precios';
      case 'detalle':
        return 'Detalle De Presupuesto';
      default:
        return 'Presupuestos';
    }
  };

  const isDetail = activeTab === 'detalle';

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-[#effdf3]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#ddece2]">
      <div className="h-16 px-4 max-w-lg mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {isDetail && (
            <button
              aria-label="Volver"
              className="min-w-[40px] min-h-[40px] flex items-center justify-center -ml-2 text-[#121e18] hover:text-[#005232] transition-colors active:scale-90"
              onClick={() => setActiveTab('presupuestos')}
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
          )}

          <img
            alt="Propuestas Rápidas Logo"
            className="h-8 w-auto object-contain cursor-pointer"
            onClick={() => setActiveTab('presupuestos')}
            src="https://lh3.googleusercontent.com/aida/AEtjO1U7GwizxgudM_Pxe1P_Sv23WKi0UYuD1WVS5y8qaIiFM8nqDviq4ifIHj_RvM8MP3fctAq1uScD33ujOzrWg1Gs8--xfNA9eSVgKZ1YMpAEEUSQYzDxYnkuCAw79Rf6ZpHboT9xnumZ1O1g9hCxNwyS_xpVCjJRkcK1KYsVmLAnhkLYIiUXl3WBZbPdv-yeWe_yCw84sA4k8D2Y4It3RPh8hiPsJXQ_mTXED5-EUUo-OErdsODlMykhW58"
          />

          <div className="flex flex-col min-w-0">
            <span
              onClick={() => setActiveTab('presupuestos')}
              className="font-headline-sm text-[#005232] uppercase tracking-tight truncate leading-none cursor-pointer"
            >
              {isDetail ? 'Detalle De Presupuesto' : 'Reformas & Pintura Pro'}
            </span>
            {!isDetail && (
              <span className="font-label-sm text-[#3f4942] truncate">
                {getSubhead()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ddece2] cursor-pointer hover:bg-[#d8e6dc] transition-colors"
            title="Sincronizado PWA Offline en este dispositivo"
          >
            <span className="material-symbols-outlined text-[#005232] text-[16px]">cloud_done</span>
            <span className="font-label-sm text-[#005232]">PWA</span>
          </div>

          <button
            onClick={() => setIsProfileModalOpen(true)}
            aria-label="Perfil y ajustes"
            className="w-8 h-8 rounded-full bg-[#005232] flex items-center justify-center active:scale-95 transition-transform shadow-sm"
          >
            <span className="material-symbols-outlined text-white text-[18px]">person</span>
          </button>
        </div>
      </div>
    </header>
  );
};
