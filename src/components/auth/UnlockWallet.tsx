import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Unlock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { derivePath } from 'ed25519-hd-key';
import { Keypair } from '@solana/web3.js';
import { mnemonicToSeedSync } from 'bip39';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { useAuth } from '@/lib/AuthContext';
import { decryptData } from '@/utils/encryption';

const SOLANA_DERIVATION_PATH = "m/44'/501'/0'/0'";

function keypairFromMnemonic(mnemonic) {
  const seed = mnemonicToSeedSync(mnemonic);
  const { key } = derivePath(SOLANA_DERIVATION_PATH, seed.toString('hex'));
  return Keypair.fromSeed(key);
}

function keypairFromPrivateKey(base58Key) {
  const secretKey = bs58.decode(base58Key);
  return Keypair.fromSecretKey(secretKey);
}

export default function UnlockWallet({ onReset }) {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [unlocking, setUnlocking] = useState(false);

  const handleUnlock = async (e) => {
    e?.preventDefault();
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    try {
      setUnlocking(true);
      const encryptedWalletStr = localStorage.getItem('encryptedWallet');
      if (!encryptedWalletStr) {
        throw new Error('No secured wallet found on this device');
      }

      const encryptedObj = JSON.parse(encryptedWalletStr);
      let decryptedStr;

      try {
        decryptedStr = await decryptData(encryptedObj, password);
      } catch (err) {
        throw new Error('Invalid password. Please try again.');
      }

      const walletData = JSON.parse(decryptedStr);
      let keypair;

      if (walletData.type === 'phrase') {
        keypair = keypairFromMnemonic(walletData.data);
      } else if (walletData.type === 'privateKey') {
        keypair = keypairFromPrivateKey(walletData.data);
      } else {
         throw new Error('Invalid wallet data format');
      }

      const address = keypair.publicKey.toBase58();
      const signFn = async (messageBytes) =>
        nacl.sign.detached(messageBytes, keypair.secretKey);

      await login(address, signFn);
      toast.success('Wallet unlocked successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to unlock wallet');
    } finally {
      setUnlocking(false);
    }
  };

  const clearWallet = () => {
    if (confirm('Are you sure you want to remove this wallet from this device? Make sure you have backed up your recovery phrase!')) {
       localStorage.removeItem('encryptedWallet');
       onReset();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-background border border-border mb-2 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
           <Unlock className="w-8 h-8 text-[#00F0FF]" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Welcome Back</h2>
        <p className="text-sm text-muted-foreground">Enter your password to unlock your wallet</p>
      </div>

      <form onSubmit={handleUnlock} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={unlocking}
            autoFocus
            className="bg-background border-border font-mono text-center text-lg py-6 rounded-xl focus:border-[#00F0FF]/50 shadow-sm transition-colors"
          />
        </div>

        <Button
          type="submit"
          disabled={unlocking || !password}
          className="w-full bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-background font-black py-6 rounded-xl transition-all disabled:opacity-50 border-none text-base shadow-lg"
        >
          {unlocking ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Unlocking...
            </>
          ) : (
            'Unlock Wallet'
          )}
        </Button>
      </form>

      <div className="pt-6 border-t border-border/50 text-center">
        <button
          type="button"
          onClick={clearWallet}
          className="inline-flex items-center text-xs text-muted-foreground hover:text-red-500 transition-colors group"
        >
          <AlertTriangle className="w-3 h-3 mr-1 group-hover:animate-pulse" />
          Remove wallet from this device
        </button>
      </div>
    </div>
  );
}
