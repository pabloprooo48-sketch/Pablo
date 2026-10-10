import React, { createContext, useContext, useState, useEffect } from 'react';
import { Quote, BusinessProfile, FollowUpItem, CatalogItem, LineItem } from '../types';
import { initialQuotes, initialBusinessProfile, initialFollowUps, initialCatalogItems } from '../data/initialData';
import { generateQuoteRef } from '../utils/formatters';

export type ScreenTab = 'presupuestos' | 'nuevo' | 'seguimiento' | 'catalogo' | 'detalle';

interface AppContextType {
  quotes: Quote[];
  activeTab: ScreenTab;
  setActiveTab: (tab: ScreenTab) => void;
  selectedQuoteId: string | null;
  setSelectedQuoteId: (id: string | null) => void;
  businessProfile: BusinessProfile;
  updateBusinessProfile: (profile: Partial<BusinessProfile>) => void;
  followUps: FollowUpItem[];
  catalog: CatalogItem[];
  addCatalogItem: (item: Omit<CatalogItem, 'id'>) => void;
  createQuote: (quoteData: Partial<Quote>) => Quote;
  updateQuote: (id: string, quoteData: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
  snoozeFollowUp: (id: string, days?: number) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  draftWorkingQuote: Partial<Quote> | null;
  setDraftWorkingQuote: React.Dispatch<React.SetStateAction<Partial<Quote> | null>>;
  navigateToDetail: (quoteId: string) => void;
  navigateToEdit: (quoteId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_QUOTES = 'reformas_pintura_quotes_v1';
const LOCAL_STORAGE_KEY_PROFILE = 'reformas_pintura_profile_v1';
const LOCAL_STORAGE_KEY_FOLLOWUPS = 'reformas_pintura_followups_v1';
const LOCAL_STORAGE_KEY_CATALOG = 'reformas_pintura_catalog_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quotes, setQuotes] = useState<Quote[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_QUOTES);
      return saved ? JSON.parse(saved) : initialQuotes;
    } catch {
      return initialQuotes;
    }
  });

  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
      return saved ? JSON.parse(saved) : initialBusinessProfile;
    } catch {
      return initialBusinessProfile;
    }
  });

  const [followUps, setFollowUps] = useState<FollowUpItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_FOLLOWUPS);
      return saved ? JSON.parse(saved) : initialFollowUps;
    } catch {
      return initialFollowUps;
    }
  });

  const [catalog, setCatalog] = useState<CatalogItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CATALOG);
      return saved ? JSON.parse(saved) : initialCatalogItems;
    } catch {
      return initialCatalogItems;
    }
  });

  const [activeTab, setActiveTab] = useState<ScreenTab>('presupuestos');
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(initialQuotes[0].id);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [draftWorkingQuote, setDraftWorkingQuote] = useState<Partial<Quote> | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_QUOTES, JSON.stringify(quotes));
    } catch (e) {
      console.warn('Storage sync issue:', e);
    }
  }, [quotes]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(businessProfile));
    } catch (e) {
      console.warn('Storage sync issue:', e);
    }
  }, [businessProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_FOLLOWUPS, JSON.stringify(followUps));
    } catch (e) {
      console.warn('Storage sync issue:', e);
    }
  }, [followUps]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CATALOG, JSON.stringify(catalog));
    } catch (e) {
      console.warn('Storage sync issue:', e);
    }
  }, [catalog]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  const createQuote = (quoteData: Partial<Quote>): Quote => {
    const newId = `quote-${Date.now()}`;
    const newRef = quoteData.ref || generateQuoteRef(quotes.length);
    const newQuote: Quote = {
      id: newId,
      ref: newRef,
      clientName: quoteData.clientName || 'Nuevo Cliente',
      clientPhone: quoteData.clientPhone || '+34 600 000 000',
      clientEmail: quoteData.clientEmail || '',
      clientAddress: quoteData.clientAddress || '',
      conceptSummary: quoteData.conceptSummary || 'Presupuesto de trabajos',
      items: quoteData.items || [],
      photos: quoteData.photos || [],
      ivaRate: quoteData.ivaRate !== undefined ? quoteData.ivaRate : 21,
      validityDays: quoteData.validityDays || 15,
      status: quoteData.status || 'draft',
      statusLabel: quoteData.statusLabel || 'Borrador · Guardado local',
      statusType: quoteData.statusType || 'draft',
      dateCreated: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
      customMessage: quoteData.customMessage || `Hola ${quoteData.clientName || 'cliente'}, te paso el presupuesto para los trabajos acordados. Cualquier duda me dices.`,
    };

    setQuotes(prev => [newQuote, ...prev]);
    showToast(`Presupuesto ${newRef} guardado correctamente`);
    return newQuote;
  };

  const updateQuote = (id: string, quoteData: Partial<Quote>) => {
    setQuotes(prev =>
      prev.map(q => {
        if (q.id === id) {
          return { ...q, ...quoteData };
        }
        return q;
      })
    );
  };

  const deleteQuote = (id: string) => {
    setQuotes(prev => prev.filter(q => q.id !== id));
    showToast('Presupuesto eliminado');
  };

  const snoozeFollowUp = (id: string, days = 2) => {
    setFollowUps(prev =>
      prev.map(fu => {
        if (fu.id === id) {
          return {
            ...fu,
            snoozedUntil: `Pospuesto ${days} días`,
          };
        }
        return fu;
      })
    );
    showToast(`Aviso de seguimiento pospuesto ${days} días`);
  };

  const updateBusinessProfile = (profile: Partial<BusinessProfile>) => {
    setBusinessProfile(prev => ({ ...prev, ...profile }));
    showToast('Datos de empresa actualizados');
  };

  const addCatalogItem = (item: Omit<CatalogItem, 'id'>) => {
    const newItem: CatalogItem = {
      ...item,
      id: `cat-${Date.now()}`,
    };
    setCatalog(prev => [newItem, ...prev]);
    showToast('Nueva partida añadida al catálogo');
  };

  const navigateToDetail = (quoteId: string) => {
    setSelectedQuoteId(quoteId);
    setActiveTab('detalle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToEdit = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (quote) {
      setDraftWorkingQuote(quote);
      setSelectedQuoteId(quoteId);
      setActiveTab('nuevo');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AppContext.Provider
      value={{
        quotes,
        activeTab,
        setActiveTab,
        selectedQuoteId,
        setSelectedQuoteId,
        businessProfile,
        updateBusinessProfile,
        followUps,
        catalog,
        addCatalogItem,
        createQuote,
        updateQuote,
        deleteQuote,
        snoozeFollowUp,
        toastMessage,
        showToast,
        isProfileModalOpen,
        setIsProfileModalOpen,
        draftWorkingQuote,
        setDraftWorkingQuote,
        navigateToDetail,
        navigateToEdit,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
