import { ArrowUpRight, ArrowDownLeft, ExternalLink, History } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

// Safe wrapper — returns {} if called outside an Outlet (e.g. when used as a sub-component)
function useSafeOutletContext() {
  try {
    const ctx = useOutletContext<any>() ?? {};
    return ctx;
  } catch {
    return {} as any;
  }
}

export default function TransactionHistory({ transactions: propTransactions }: { transactions?: any[] }) {
  const ctx = useSafeOutletContext();
  const transactions = propTransactions ?? ctx?.history ?? [];
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount) => {
    return parseFloat(amount).toFixed(2);
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center mb-3">
          <History className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-foreground font-semibold text-sm">No Activity</p>
        <p className="text-xs text-muted-foreground mt-1">Your transactions will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full pb-6">
      <div className="flex items-center justify-between pb-3 border-b border-border mb-2 mx-2">
        <h2 className="text-sm font-bold text-foreground">Activity</h2>
        <span className="text-xs font-medium text-[#00F0FF] hover:text-[#FF00E5] cursor-pointer transition-colors">View All</span>
      </div>

      <div className="divide-y divide-border">
        {transactions.map((tx, i) => (
          <div
            key={i}
            className="py-3 hover:bg-background/50 transition-colors duration-200 flex items-center justify-between px-2 rounded-xl cursor-default"
          >
            {/* Left: Icon & Details */}
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 ${tx.err
                  ? 'bg-destructive/10 border-destructive/20 text-destructive'
                  : 'bg-[#00F0FF]/10 border-[#00F0FF]/20 text-[#00F0FF]'
                  }`}
              >
                {tx.err ? (
                  <ArrowUpRight className="w-5 h-5" />
                ) : (
                  <History className="w-5 h-5" />
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                </p>
                <div className="flex items-center gap-2">
                  {tx.confirmationStatus === 'finalized' ? (
                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-green-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                      Confirmed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-yellow-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse inline-block" />
                      Pending
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Amount & Date */}
            <div className="flex flex-col items-end shrink-0">
              <div className="flex items-center gap-1 text-[#00F0FF] hover:text-[#FF00E5] cursor-pointer transition-colors"
                onClick={() => window.open(`https://solana.fm/tx/${tx.signature}?cluster=devnet-solana`, '_blank')}>
                <span className="text-xs font-bold uppercase tracking-widest">Details</span>
                <ExternalLink className="w-3 h-3" />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDate(tx.blockTime * 1000)}
              </p>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}