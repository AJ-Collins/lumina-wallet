import { useState, useEffect, useCallback, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { walletAPI } from '@/lib/api';
import NotificationDropdown from '@/components/wallet/NotificationDropdown';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, Send, ArrowDownToLine, History, Settings, Menu, X, Bell } from 'lucide-react';
import { toast } from 'sonner';

const navItems = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Send', path: '/send', icon: Send },
  { label: 'Receive', path: '/receive', icon: ArrowDownToLine },
  { label: 'Transactions', path: '/transactions', icon: History },
  { label: 'Settings', path: '/settings', icon: Settings },
];

const navLinkClass = ({ isActive }) =>
  `w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors font-bold tracking-wide ${isActive
    ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20 shadow-sm'
    : 'text-muted-foreground hover:bg-background hover:text-foreground'
  }`;

const mobileNavLinkClass = ({ isActive }) =>
  `flex flex-col items-center justify-center py-3 w-full transition-all ${isActive ? 'text-[#00F0FF]' : 'text-muted-foreground hover:text-foreground'
  }`;

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    } catch {
      if (!silent) toast.error('Failed to load wallet data');
    } finally {
      if (!silent) setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchWalletData(false);
    const interval = setInterval(() => fetchWalletData(true), 15_000);
    return () => clearInterval(interval);
  }, [fetchWalletData]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast.success('Logged out successfully');
    } catch {
      toast.error('Logout failed');
    }
  };

  // Context passed to all child routes via Outlet
  const outletContext = { balance, history, user, loading };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">

      {/* ── Mobile Header ── */}
      <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center neon-glow-magenta relative overflow-hidden">
            <div className="absolute inset-0 rounded-full border border-transparent border-t-[#00F0FF] border-b-[#FF00E5] animate-[spin_4s_linear_infinite]" />
            <img src="/lbc_logo.png" alt="LBC Logo" className="w-6 h-6 object-contain z-10" />
          </div>
          <span className="font-black tracking-widest text-foreground uppercase">LBC LUMINA</span>
        </div>
        <div className="flex items-center gap-2">
          <NavLink to="/notifications">
            <Button variant="ghost" size="icon" className="text-muted-foreground relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF00E5]" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF00E5]" />
            </Button>
          </NavLink>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-foreground">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <aside className={`fixed top-[57px] bottom-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-2xl md:shadow-none`}>

        {/* Logo */}
        <div className="hidden md:flex items-center gap-3 p-6 border-b border-border shrink-0">
          <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center neon-glow-magenta relative overflow-hidden shrink-0">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#00F0FF] border-b-[#FF00E5] animate-[spin_4s_linear_infinite]" />
            <img src="/lbc_logo.png" alt="LBC Logo" className="w-10 h-10 object-contain z-10" />
          </div>
          <span className="text-xl font-black tracking-widest text-foreground uppercase">LBC LUMINA</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto min-h-0">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={navLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
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

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background min-h-screen">
        <div className="max-w-[1400px] mx-auto p-4 md:p-8">

          {/* Notification icon (desktop) */}
          <div className="hidden md:flex justify-end mb-4">
            <NotificationDropdown onSeeAll={() => navigate('/notifications')} />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40">
              <div className="w-12 h-12 border-4 border-[#00F0FF] border-t-[#FF00E5] rounded-full animate-spin mb-6" />
            </div>
          ) : (
            // React Router renders the matched child route here
            <Outlet context={outletContext} />
          )}
        </div>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 px-2 flex items-center justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.5)] safe-area-bottom">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={mobileNavLinkClass}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 mb-1 ${isActive ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' : ''}`} />
                <span className="text-[10px] font-bold tracking-wider uppercase">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}