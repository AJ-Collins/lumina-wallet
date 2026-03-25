import { Copy, Eye, EyeOff, Send, ArrowDownToLine, Wallet, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function WalletCard({ balance, onNavigate }) {
  const { user } = useAuth();
  const [showBalance, setShowBalance] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(user?.walletAddress || '');
    toast.success('Address copied');
  };

  return (
    <div className="flex flex-col items-center pt-2 pb-4">

      {/* Balance Section */}
      <div className="text-center mb-6 relative group w-full">
        <p className="text-sm text-muted-foreground mb-2 font-medium">Available Balance</p>
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-foreground tracking-tighter">
              {showBalance ? balance?.toLocaleString() || '0.00' : '••••••'}
            </span>
            {showBalance && (
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                LBC
              </span>
            )}
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="text-muted-foreground hover:text-foreground transition-colors absolute right-4 opacity-0 group-hover:opacity-100"
          >
            {showBalance ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-[#00F0FF] to-[#FF00E5]"></div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">LBC Token</p>
        </div>
      </div>

      {/* Address Section */}
      <button
        onClick={copyAddress}
        className="bg-background rounded-full px-4 py-2 border border-border hover:border-foreground/20 transition-colors flex items-center gap-2 group mb-8"
      >
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <code className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">
          {user?.walletAddress?.slice(0, 4)}...{user?.walletAddress?.slice(-4)}
        </code>
        <Copy className="w-3 h-3 text-muted-foreground group-hover:text-foreground" />
      </button>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 w-full px-4">
        <Button
          onClick={() => onNavigate && onNavigate('Send Token')}
          className="w-full bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-background font-bold py-6 rounded-xl transition-all border-none text-base"
        >
          <ArrowUpRight className="w-5 h-5 mr-2" />
          Send
        </Button>
        <Button
          variant="outline"
          onClick={() => onNavigate && onNavigate('Receive Token')}
          className="w-full bg-background border-border hover:border-[#FF00E5]/50 hover:bg-background text-foreground font-bold py-6 rounded-xl transition-all hover:text-[#FF00E5] text-base"
        >
          <ArrowDownToLine className="w-5 h-5 mr-2" />
          Receive
        </Button>
      </div>
    </div>
  );
}