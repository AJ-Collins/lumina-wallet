import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function ConnectWallet() {
  const { login } = useAuth();
  const { publicKey, signMessage, disconnect } = useWallet();
  const [connecting, setConnecting] = useState(false);

  const handleSignIn = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!signMessage) {
      toast.error('Your wallet does not support message signing');
      return;
    }

    try {
      setConnecting(true);
      const address = publicKey.toBase58();

      // The sign function: wallet adapter's signMessage returns a Uint8Array
      const signFn = async (messageBytes) => signMessage(messageBytes);

      // Full challenge → sign → verify handled by AuthContext
      await login(address, signFn);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to sign in');
      disconnect(); // allow retry
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 pt-4">
        {!publicKey ? (
          <div className="w-full text-center space-y-4">
            <p className="text-sm text-muted-foreground mb-4 h-[40px]">
              Connect your Solana wallet to securely access the LBC Network API.
            </p>
            <WalletMultiButton className="w-full !justify-center !bg-card !border !border-border hover:!border-[#00F0FF]/50 hover:!bg-background transition-colors !rounded-xl !py-6 !font-semibold !text-foreground" />
          </div>
        ) : (
          <div className="w-full space-y-4">
            <div className="p-4 bg-background rounded-lg border border-border text-center relative overflow-hidden">
              <p className="text-xs text-muted-foreground mb-1">Connected Wallet Identity</p>
              <code className="text-sm font-mono text-[#00F0FF]">
                {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}
              </code>
            </div>

            <Button
              onClick={handleSignIn}
              disabled={connecting}
              className="w-full bg-gradient-to-r from-[#00F0FF] to-[#FF00E5] hover:opacity-90 text-white font-semibold py-6 rounded-lg transition-all shadow-[0_0_20px_rgba(255,0,229,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] border-none"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2 drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
                  Sign In to LBC
                </>
              )}
            </Button>
            
            <button
              onClick={() => disconnect()}
              className="text-xs text-zinc-500 hover:text-red-400 w-full text-center mt-2 transition"
            >
              Disconnect Wallet
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-center text-zinc-600/80 mt-6">
        Authentication issues a JWT token via cryptographic verification. 
        It does not cost any SOL.
      </p>
    </div>
  );
}