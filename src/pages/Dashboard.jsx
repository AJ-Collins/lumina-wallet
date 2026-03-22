import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { walletAPI } from '@/lib/api';
import TransactionHistory from '@/components/wallet/TransactionHistory';
import SendToken from '@/components/wallet/SendToken';
import ReceiveToken from '@/components/wallet/ReceiveToken';
import SettingsView from '@/components/wallet/Settings';
import NotificationsView from '@/components/wallet/NotificationsView';
import NotificationDropdown from '@/components/wallet/NotificationDropdown';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, Send, ArrowDownToLine, History, Settings, Menu, X, Bell, Copy, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');

  const isFetchingRef = useRef(false);

  const fetchWalletData = useCallback(async (silent = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      if (!silent) setLoading(true);
      const [balanceData, historyData] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getHistory(),
      ]);
      setBalance(balanceData?.balance ?? 0);
      setHistory(historyData?.transactions ?? []);
    } catch (err) {
      if (!silent) toast.error('Failed to load wallet data');
    } finally {
      if (!silent) setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchWalletData(false);
    const POLL_INTERVAL = 15_000;
    const interval = setInterval(() => fetchWalletData(true), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchWalletData]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(user?.walletAddress || '');
    toast.success('Address copied');
  };

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Send Token', icon: Send },
    { label: 'Receive Token', icon: ArrowDownToLine },
    { label: 'Transactions', icon: History },
    { label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center neon-glow-magenta relative overflow-hidden">
            <div className="absolute inset-0 rounded-full border border-transparent border-t-[#00F0FF] border-b-[#FF00E5] animate-[spin_4s_linear_infinite]"></div>
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#00F0FF] to-[#FF00E5]"></div>
          </div>
          <span className="font-black tracking-widest text-foreground uppercase">LBC</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground relative"
            onClick={() => {
              setActiveTab('Notifications');
              setIsMobileMenuOpen(false);
            }}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF00E5] animate-ping"></span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF00E5]"></span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-foreground">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed top-[57px] bottom-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-2xl md:shadow-none`}>
          {/* Logo - moved out of scroll div, added shrink-0 */}
          <div className="hidden md:flex items-center gap-3 p-6 border-b border-border shrink-0">
            <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center neon-glow-magenta relative overflow-hidden shrink-0">
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#00F0FF] border-b-[#FF00E5] animate-[spin_4s_linear_infinite]"></div>
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#00F0FF] to-[#FF00E5]"></div>
            </div>
            <span className="text-xl font-black tracking-widest text-foreground uppercase">LBC LUMINA</span>
          </div>

          {/* Scrollable nav - flex-1 and overflow-y-auto and min-h-0 */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto min-h-0">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setActiveTab(item.label);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors font-bold tracking-wide ${activeTab === item.label
                  ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20 shadow-sm'
                  : 'text-muted-foreground hover:bg-background hover:text-foreground'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Footer - moved out of scroll div, added shrink-0, removed mt-auto */}
          <div className="p-4 border-t border-border shrink-0 bg-card">
            <div className="bg-background rounded-xl p-3 mb-4 border border-border flex flex-col gap-2">
              <p className="text-[10px] uppercase tracking-widest text-[#FF00E5] font-bold">Connected Address</p>
              <code className="text-xs font-mono text-foreground truncate block">
                {user?.walletAddress || 'Loading...'}
              </code>
            </div>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 py-5 rounded-xl transition-colors font-bold"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Disconnect Wallet
            </Button>
          </div>
      </aside>

      {/* Main Desktop Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background min-h-screen">
        <div className="max-w-[1400px] mx-auto p-4 md:p-8">

          {/* Page header — hidden for Overview, shown for all other tabs */}
          {activeTab !== 'Overview' && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-foreground">{activeTab}</h1>
                {/* <p className="text-sm text-muted-foreground mt-1 font-medium">
                  {activeTab === 'Send Token' && 'Securely send LBC to any Lumina Network address.'}
                  {activeTab === 'Receive Token' && 'View your receiving details securely.'}
                  {activeTab === 'Transactions' && 'Complete ledger history of your wallet.'}
                  {activeTab === 'Notifications' && 'Recent activity, alerts, and system updates.'}
                  {activeTab === 'Settings' && 'Manage your wallet preferences.'}
                </p> */}
              </div>
              <div className="hidden md:flex items-center gap-4">
                <NotificationDropdown onSeeAll={() => setActiveTab('Notifications')} />
              </div>
            </div>
          )}

          {/* Overview: notification icon floats top-right */}
          {activeTab === 'Overview' && (
            <div className="hidden md:flex justify-end mb-4">
              <NotificationDropdown onSeeAll={() => setActiveTab('Notifications')} />
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40">
              <div className="w-12 h-12 border-4 border-[#00F0FF] border-t-[#FF00E5] rounded-full animate-spin mb-6"></div>
              {/* <p className="text-muted-foreground animate-pulse font-bold tracking-wider uppercase text-sm">Syncing Ledger...</p> */}
            </div>
          ) : (
            <>
              {activeTab === 'Overview' && (
                <div className="flex flex-col gap-6">

                  {/* ── Unified Hero Card ── */}
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                    {/* Glow blobs */}
                    <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-[#00F0FF]/10 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-[#FF00E5]/10 blur-3xl pointer-events-none" />
                    {/* Dot grid */}
                    <div
                      className="absolute inset-0 opacity-[0.03] pointer-events-none"
                      style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }}
                    />

                    <div className="relative z-10 p-6 md:p-8">
                      {/* Top: greeting + network pill */}
                      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-[#00F0FF] mb-1">Lumina Network</p>
                          <h2 className="text-2xl md:text-3xl font-black text-foreground">
                            Welcome back{user?.username ? `, ${user.username}` : ''} 👋
                          </h2>
                          <p className="text-sm text-muted-foreground mt-1">
                            Your self-custodial wallet — only you hold the keys.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-background border border-border rounded-full px-4 py-2 shrink-0">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Solana Devnet</span>
                        </div>
                      </div>

                      <div className="border-t border-border/60 mb-6" />

                      {/* Balance + address / badges + actions */}
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        {/* Left: balance + copyable address */}
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Available Balance</p>
                          <div className="flex items-baseline gap-3">
                            <span className="text-5xl md:text-6xl font-black text-foreground tracking-tighter">
                              {balance?.toLocaleString() ?? '0.00'}
                            </span>
                            <span className="text-xl font-bold text-[#00F0FF]">LBC</span>
                          </div>
                          <button
                            onClick={copyAddress}
                            className="mt-3 flex items-center gap-2 bg-background border border-border hover:border-[#00F0FF]/40 rounded-full px-3 py-1.5 transition-colors group"
                          >
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
                            <code className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                              {user?.walletAddress?.slice(0, 6)}...{user?.walletAddress?.slice(-6)}
                            </code>
                            <Copy className="w-3 h-3 text-muted-foreground group-hover:text-[#00F0FF] transition-colors" />
                          </button>
                        </div>

                        {/* Right: info badges + action buttons */}
                        <div className="flex flex-col gap-3 items-start md:items-end">
                          <div className="flex flex-wrap gap-2">
                            <div className="flex items-center gap-1.5 bg-background border border-border rounded-full px-3 py-1.5">
                              <span className="w-2 h-2 rounded-full bg-gradient-to-tr from-[#00F0FF] to-[#FF00E5]" />
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">LBC · SPL Token</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-background border border-border rounded-full px-3 py-1.5">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">🔐 Non-Custodial</span>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => setActiveTab('Send Token')}
                              className="flex items-center gap-2 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-background font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg hover:-translate-y-0.5"
                            >
                              <ArrowUpRight className="w-4 h-4" /> Send
                            </button>
                            <button
                              onClick={() => setActiveTab('Receive Token')}
                              className="flex items-center gap-2 bg-background border border-border hover:border-[#FF00E5]/50 hover:text-[#FF00E5] text-foreground font-bold text-sm px-5 py-2.5 rounded-xl transition-all"
                            >
                              <ArrowDownToLine className="w-4 h-4" /> Receive
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Transaction History ── */}
                  <div className="rounded-2xl border border-border bg-card p-4 md:p-6">
                    <TransactionHistory transactions={history} />
                  </div>

                </div>
              )}

              {activeTab === 'Send Token' && (
                <SendToken balance={balance} />
              )}

              {activeTab === 'Receive Token' && (
                <ReceiveToken />
              )}

              {activeTab === 'Transactions' && (
                <div className="max-w-6xl mx-auto w-full pb-24 md:pb-0">
                  <TransactionHistory transactions={history} />
                </div>
              )}

              {activeTab === 'Notifications' && (
                <NotificationsView />
              )}

              {activeTab === 'Settings' && (
                <SettingsView />
              )}
            </>
          )}
        </div>
      </main>

      {/* Mobile Sticky Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 px-2 flex items-center justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.5)] safe-area-bottom">
        {navItems.map((item) => {
          const isActive = activeTab === item.label;
          return (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={`flex flex-col items-center justify-center py-3 w-full transition-all ${isActive ? 'text-[#00F0FF]' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <item.icon className={`w-5 h-5 mb-1 ${isActive ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' : ''}`} />
              <span className="text-[10px] font-bold tracking-wider uppercase">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
}