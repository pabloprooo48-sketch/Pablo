/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { ProfileModal } from './components/ProfileModal';
import { DashboardScreen } from './screens/DashboardScreen';
import { NewQuoteScreen } from './screens/NewQuoteScreen';
import { FollowUpScreen } from './screens/FollowUpScreen';
import { QuoteDetailScreen } from './screens/QuoteDetailScreen';
import { CatalogScreen } from './screens/CatalogScreen';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="bg-[#effdf3] min-h-screen flex flex-col font-body-md text-[#121e18] selection:bg-[#a6f3c5] selection:text-[#002111]">
      <Header />

      <main className="flex-1 w-full pt-16 pb-20 bg-[#effdf3]">
        {activeTab === 'presupuestos' && <DashboardScreen />}
        {activeTab === 'nuevo' && <NewQuoteScreen />}
        {activeTab === 'seguimiento' && <FollowUpScreen />}
        {activeTab === 'detalle' && <QuoteDetailScreen />}
        {activeTab === 'catalogo' && <CatalogScreen />}
      </main>

      <BottomNav />
      <Toast />
      <ProfileModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
