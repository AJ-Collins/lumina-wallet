import { useMemo } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Toaster } from 'sonner';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

import Overview from './pages/Overview';
import SendToken from './pages/SendToken';
import ReceiveToken from './pages/ReceiveToken';
import TransactionHistory from './pages/TransactionHistory';
import NotificationsView from './pages/Notifications';
import SettingsView from './pages/Settings';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

import '@solana/wallet-adapter-react-ui/styles.css';

const SOLANA_NETWORK = 'devnet';

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />

      {/* Dashboard layout with nested child routes */}
      <Route path="/" element={<Dashboard />}>
        <Route path="dashboard" element={<Overview />} />
        <Route path="send" element={<SendToken />} />
        <Route path="receive" element={<ReceiveToken />} />
        <Route path="transactions" element={<TransactionHistory />} />
        <Route path="notifications" element={<NotificationsView />} />
        <Route path="settings" element={<SettingsView />} />
      </Route>

      <Route path="*" element={<div className="flex items-center justify-center h-screen text-foreground">Page not found</div>} />
    </Routes>
  );
};

export default function App() {
  const endpoint = useMemo(() => clusterApiUrl(SOLANA_NETWORK), []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AuthProvider>
            <Router>
              <AppRoutes />
            </Router>
            <Toaster />
          </AuthProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}