import { Copy, ArrowUpRight, ArrowDownToLine } from 'lucide-react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import TransactionHistory from './TransactionHistory';
import { toast } from 'sonner';

export default function Overview() {
  const { balance, history, user } = useOutletContext<any>();
  const navigate = useNavigate();

  const copyAddress = () => {
    navigator.clipboard.writeText(user?.walletAddress || '');
    toast.success('Address copied');
  };

  const displayName = user?.username?.trim();
  const truncatedName = displayName?.length > 15 ? `${displayName.slice(0, 15)}...` : displayName;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Hero Card ── */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-[#00F0FF]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-[#FF00E5]/10 blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }}
        />

        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-[#00F0FF] mb-1">Lumina Network</p>
              <h2
                className="text-2xl md:text-3xl font-black text-foreground"
                title={`Welcome back${displayName ? `, ${displayName}` : ''} 👋`}
              >
                Welcome back{truncatedName ? `, ${truncatedName}` : ''} 👋
              </h2>
              <p className="text-sm text-muted-foreground mt-1 truncate">
                Your Lumina wallet — only you hold the keys.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-background border border-border rounded-full px-4 py-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Solana Devnet</span>
            </div>
          </div>

          <div className="border-t border-border/60 mb-6" />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
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

            <div className="flex flex-col gap-3 items-start md:items-end">
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 bg-background border border-border rounded-full px-3 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-gradient-to-tr from-[#00F0FF] to-[#FF00E5]" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">LBC · SPL Token</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/send')}
                  className="flex items-center gap-2 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-background font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg hover:-translate-y-0.5"
                >
                  <ArrowUpRight className="w-4 h-4" /> Send
                </button>
                <button
                  onClick={() => navigate('/receive')}
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
  );
}
