import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { BookProvider } from './contexts/BookContext';
import { BorrowRequestProvider } from './contexts/BorrowRequestContext';
import { TransactionProvider } from './contexts/TransactionContext';
import { StudentProvider } from './contexts/StudentContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ActivityProvider } from './contexts/ActivityContext';
import { QRCodeProvider } from './contexts/QRCodeContext';
import { GlobalSearchProvider } from './contexts/GlobalSearchContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { RBACProvider } from './contexts/RBACContext';
import AppRoutes from './routes/AppRoutes';
import QRCodeDialog from './components/qrcode/QRCodeDialog';
import PrintLabelDialog from './components/qrcode/PrintLabelDialog';
import CopyHistoryDrawer from './components/qrcode/CopyHistoryDrawer';
import CommandPalette from './components/search/CommandPalette';
import SavedFiltersDialog from './components/search/SavedFiltersDialog';
import ErrorBoundary from './components/common/ErrorBoundary';
import NetworkMonitor from './components/common/NetworkMonitor';
import PWAInstallPrompt from './components/common/PWAInstallPrompt';
import useQRCode from './hooks/useQRCode';
import useGlobalSearch from './hooks/useGlobalSearch';
import './styles/index.css';

const GlobalModals = () => {
  const {
    qrModalOpen,
    setQrModalOpen,
    printModalOpen,
    setPrintModalOpen,
    historyDrawerOpen,
    setHistoryDrawerOpen,
    selectedCopyHistory,
  } = useQRCode();

  const { savedFiltersDialogOpen, setSavedFiltersDialogOpen } = useGlobalSearch();

  return (
    <>
      <QRCodeDialog open={qrModalOpen} onClose={() => setQrModalOpen(false)} />
      <PrintLabelDialog open={printModalOpen} onClose={() => setPrintModalOpen(false)} />
      <CopyHistoryDrawer
        open={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        copy={selectedCopyHistory}
      />
      <CommandPalette />
      <SavedFiltersDialog
        open={savedFiltersDialogOpen}
        onClose={() => setSavedFiltersDialogOpen(false)}
      />
      <PWAInstallPrompt />
    </>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <BookProvider>
              <BorrowRequestProvider>
                <TransactionProvider>
                  <StudentProvider>
                    <AnalyticsProvider>
                      <NotificationProvider>
                        <ActivityProvider>
                          <SettingsProvider>
                            <RBACProvider>
                              <QRCodeProvider>
                                <GlobalSearchProvider>
                                  <NetworkMonitor />
                                  <AppRoutes />
                                  <GlobalModals />
                                  <Toaster
                                    position="top-right"
                                    toastOptions={{
                                      duration: 4000,
                                      style: {
                                        background: '#FFFFFF',
                                        color: '#0F172A',
                                        boxShadow: '0px 8px 24px rgba(15, 23, 42, 0.12)',
                                        borderRadius: '12px',
                                        padding: '12px 18px',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        border: '1px solid #E2E8F0',
                                      },
                                    }}
                                  />
                                </GlobalSearchProvider>
                              </QRCodeProvider>
                            </RBACProvider>
                          </SettingsProvider>
                        </ActivityProvider>
                      </NotificationProvider>
                    </AnalyticsProvider>
                  </StudentProvider>
                </TransactionProvider>
              </BorrowRequestProvider>
            </BookProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
