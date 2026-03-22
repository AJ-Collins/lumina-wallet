import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { generateMnemonic as bip39Generate, mnemonicToSeedSync, validateMnemonic } from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { Keypair } from '@solana/web3.js';
import nacl from 'tweetnacl';
import { useAuth } from '@/lib/AuthContext';
import { encryptData } from '@/utils/encryption';
import { Input } from '@/components/ui/input';
import { Lock } from 'lucide-react';

const SOLANA_DERIVATION_PATH = "m/44'/501'/0'/0'";

/**
 * Derives a Solana Keypair from a BIP-39 mnemonic using the standard
 * Solana derivation path m/44'/501'/0'/0'.
 */
function keypairFromMnemonic(mnemonic) {
  const seed = mnemonicToSeedSync(mnemonic); // 64-byte Buffer
  const { key } = derivePath(SOLANA_DERIVATION_PATH, seed.toString('hex'));
  return Keypair.fromSeed(key); // key is the 32-byte private seed
}

export default function CreateWallet() {
  const { login } = useAuth();
  const [mnemonic, setMnemonic] = useState(null);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);

  const generateMnemonic = () => {
    const phrase = bip39Generate(128); // 12-word phrase
    setMnemonic(phrase);
    setConfirmed(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreate = async () => {
    if (!confirmed) {
      toast.error('Please confirm you have saved your recovery phrase');
      return;
    }
    if (!validateMnemonic(mnemonic)) {
      toast.error('Invalid recovery phrase — please regenerate');
      return;
    }

    if (!password || password.length < 6) {
      toast.error('Please enter a password of at least 6 characters to secure your wallet locally');
      return;
    }

    try {
      setCreating(true);

      // 1. Derive the Solana keypair from the mnemonic seed
      const keypair = keypairFromMnemonic(mnemonic);
      const address = keypair.publicKey.toBase58();
      
      // Encrypt the mnemonic and save it locally so the user can unlock later
      const walletData = JSON.stringify({ type: 'phrase', data: mnemonic });
      const encryptedObj = await encryptData(walletData, password);
      localStorage.setItem('encryptedWallet', JSON.stringify(encryptedObj));
      
      sessionStorage.setItem('walletMnemonic', mnemonic);

      // 2. Build the sign function that AuthContext.login() will call with the challenge bytes
      const signFn = async (messageBytes) => {
        return nacl.sign.detached(messageBytes, keypair.secretKey);
      };

      // 3. Run the full challenge → sign → verify flow
      await login(address, signFn);

      toast.success('Wallet created successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to create wallet');
    } finally {
      setCreating(false);
    }
  };

  if (!mnemonic) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-card border border-border rounded-lg">
          <p className="text-sm text-muted-foreground mb-4">
            Create a new Solana wallet. You'll receive a recovery phrase to restore your wallet anytime.
          </p>
          <Button
            onClick={generateMnemonic}
            className="w-full bg-gradient-to-r from-cyan-500 to-magenta-500 hover:from-cyan-600 hover:to-magenta-600 text-white font-semibold py-2 rounded-lg transition-all"
          >
            Generate Wallet
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Keep your recovery phrase safe and secure
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recovery Phrase */}
      <div className="p-5 bg-card border border-border rounded-xl shadow-lg">
        <div className="flex items-center gap-2 mb-4">
           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
           <p className="text-xs text-red-500 font-bold uppercase tracking-widest">Secret Recovery Phrase</p>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
          {mnemonic.split(' ').map((word, i) => (
            <div key={i} className="flex items-center bg-background border border-border rounded-lg px-3 py-2.5 shadow-sm hover:border-[#00F0FF]/50 transition-colors cursor-default">
              <span className="text-muted-foreground text-[10px] w-5 font-mono select-none">{i + 1}.</span>
              <span className="text-foreground font-mono text-xs font-bold tracking-wider">{word}</span>
            </div>
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="w-full bg-background border-border hover:bg-card hover:border-[#00F0FF]/50 transition-all font-bold group"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-500" />
              <span className="text-green-500">Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-[#00F0FF]" />
              Copy Phrase
            </>
          )}
        </Button>
      </div>

      {/* Confirmation */}
      <label className="flex items-start gap-3 p-4 bg-background border border-border rounded-xl cursor-pointer hover:border-[#00F0FF]/50 transition-colors group">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-[#00F0FF]"
        />
        <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
          I have saved my secret recovery phrase securely.
        </span>
      </label>

      {/* Password to encrypt the wallet locally */}
      <div className="p-4 bg-background border border-border rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-[#00F0FF]" />
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Unlock Password</p>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Set a password to securely encrypt and save this wallet on this device for easy access later.</p>
        <Input
          type="password"
          placeholder="Minimum 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={creating}
          className="bg-card border-border font-mono text-sm py-5 rounded-lg focus:border-[#00F0FF]/50 transition-colors"
        />
      </div>

      <Button
        onClick={handleCreate}
        disabled={!confirmed || !password || password.length < 6 || creating}
        className="w-full bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-background font-black py-6 rounded-xl transition-all disabled:opacity-50 border-none text-base"
      >
        {creating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Creating Wallet...
          </>
        ) : (
          'Create Wallet'
        )}
      </Button>
    </div>
  );
}