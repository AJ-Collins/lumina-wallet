import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import AuthTabs from '@/components/auth/AuthTabs';
import UnlockWallet from '@/components/auth/UnlockWallet';

export default function Auth() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [hasEncryptedWallet, setHasEncryptedWallet] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('encryptedWallet')) {
      setHasEncryptedWallet(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-10 h-10 border-4 border-[#00F0FF] border-t-[#FF00E5] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-12">
      {/* Main Solid Panel */}
      <div className="w-full max-w-md p-8 bg-card border border-border shadow-2xl rounded-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-background border border-border mb-6 neon-glow-magenta relative overflow-hidden">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#00F0FF] border-b-[#FF00E5] animate-[spin_4s_linear_infinite]"></div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00F0FF] to-[#FF00E5]"></div>
          </div>
          <h1 className="text-4xl font-black mb-1 tracking-wider text-foreground">
            NETWORK
          </h1>
          <p className="text-[10px] tracking-[0.3em] font-bold uppercase mb-4 text-[#FF00E5]">
            Innovate & Connect
          </p>
          <h2 className="text-2xl font-black text-foreground uppercase tracking-[0.2em] mt-2">
            LBC
          </h2>
        </div>

        {hasEncryptedWallet ? (
          <UnlockWallet onReset={() => setHasEncryptedWallet(false)} />
        ) : (
          <AuthTabs />
        )}
      </div>
    </div>
  );
}