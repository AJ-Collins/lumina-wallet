import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { mnemonicToSeedSync, validateMnemonic } from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { Keypair } from '@solana/web3.js';
import nacl from 'tweetnacl';
import { useAuth } from '@/lib/AuthContext';
import { encryptData } from '@/utils/encryption';
import { Input } from '@/components/ui/input';
import { Lock } from 'lucide-react';

const SOLANA_DERIVATION_PATH = "m/44'/501'/0'/0'";

function keypairFromMnemonic(mnemonic) {
  const seed = mnemonicToSeedSync(mnemonic);
  const { key } = derivePath(SOLANA_DERIVATION_PATH, seed.toString('hex'));
  return Keypair.fromSeed(key);
}

export default function RecoverWallet() {
  const { login } = useAuth();
  const [phraseWords, setPhraseWords] = useState(Array(12).fill(''));
  const [password, setPassword] = useState('');
  const [recovering, setRecovering] = useState(false);

  const handlePaste = (e, index) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const words = pastedData.trim().split(/[\s,]+/);
    if (words.length > 0) {
      // Provide exactly enough slots for the pasted length, max 24, minimum 12
      const targetLength = words.length > 12 ? 24 : 12;
      const newPhraseWords = Array(targetLength).fill('');
      
      // Copy existing words up to index, if they exist and are relevant
      for(let i=0; i<targetLength; i++) {
         if (i < phraseWords.length) {
            newPhraseWords[i] = phraseWords[i];
         }
      }
      
      let wordIndex = 0;
      for (let i = index; i < targetLength && wordIndex < words.length; i++) {
         newPhraseWords[i] = words[wordIndex].replace(/[^a-zA-Z]/g, '').toLowerCase();
         wordIndex++;
      }
      setPhraseWords(newPhraseWords);
    }
  };

  const handleWordChange = (val, index) => {
    const newWords = [...phraseWords];
    newWords[index] = val.trim();
    setPhraseWords(newWords);
  };

  const togglePhraseLength = () => {
    if (phraseWords.length === 12) {
      setPhraseWords([...phraseWords, ...Array(12).fill('')]);
    } else {
      setPhraseWords(phraseWords.slice(0, 12));
    }
  };

  const handleRecover = async () => {
    if (phraseWords.some(w => !w.trim())) {
      toast.error(`Please fill in all ${phraseWords.length} words of your recovery phrase`);
      return;
    }

    if (!password || password.length < 6) {
      toast.error('Please enter a password of at least 6 characters to secure your wallet locally');
      return;
    }

    const phrase = phraseWords.map(w => w.replace(/[^a-zA-Z]/g, '').toLowerCase()).join(' ');

    if (!validateMnemonic(phrase)) {
      toast.error('Invalid recovery phrase — please check your words. Ensure they match exactly natively.');
      return;
    }

    try {
      setRecovering(true);

      // Derive keypair from mnemonic and sign challenge
      const keypair = keypairFromMnemonic(phrase);
      
      const walletData = JSON.stringify({ type: 'phrase', data: phrase });
      const encryptedObj = await encryptData(walletData, password);
      localStorage.setItem('encryptedWallet', JSON.stringify(encryptedObj));
      const address = keypair.publicKey.toBase58();
      const signFn = async (messageBytes) =>
        nacl.sign.detached(messageBytes, keypair.secretKey);

      await login(address, signFn);
      toast.success('Wallet recovered successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to recover wallet');
    } finally {
      setRecovering(false);
    }
  };

  const isFormValid = phraseWords.every(w => w.trim().length > 0) && password.length >= 6;

  return (
    <div className="space-y-6">
      <div className="p-5 bg-card border border-border rounded-xl shadow-lg">
        <div className="flex items-center gap-2 mb-4">
           <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
           <p className="text-xs text-amber-500 font-bold uppercase tracking-widest">Recover Existing Wallet</p>
        </div>
        
        <div className="flex items-center justify-between mb-4">
           <p className="text-xs text-muted-foreground">
             Enter your {phraseWords.length}-word recovery phrase to regain access to your wallet and assets.
           </p>
           <button onClick={togglePhraseLength} className="text-xs font-bold text-[#FF00E5] hover:underline whitespace-nowrap ml-4 transition-all">
             Use {phraseWords.length === 12 ? '24' : '12'} Words instead
           </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
           {phraseWords.map((word, i) => (
             <div key={i} className="relative flex items-center">
               <span className="absolute left-3 text-[10px] text-muted-foreground font-mono pointer-events-none select-none">{i + 1}.</span>
               <input
                 type="text"
                 value={word}
                 onChange={(e) => handleWordChange(e.target.value, i)}
                 onPaste={(e) => handlePaste(e, i)}
                 className="w-full bg-background border border-border rounded-lg py-2.5 pl-8 pr-2 text-foreground font-mono text-xs font-bold focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors shadow-sm"
                 autoComplete="off"
                 autoCorrect="off"
                 autoCapitalize="off"
                 spellCheck="false"
               />
             </div>
           ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">Paste anywhere in the inputs to auto-fill all 12 words.</p>
      </div>

      {/* Password to encrypt the wallet locally */}
      <div className="p-4 bg-background border border-border rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-amber-500" />
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Unlock Password</p>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Set a password to securely encrypt and save this recovered wallet on this device for easy access later.</p>
        <Input
          type="password"
          placeholder="Minimum 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={recovering}
          className="bg-card border-border font-mono text-sm py-5 rounded-lg focus:border-amber-500/50 transition-colors"
        />
      </div>

      <Button
        onClick={handleRecover}
        disabled={recovering || !isFormValid}
        className="w-full bg-amber-500 hover:bg-amber-600 text-background font-black py-6 rounded-xl transition-all disabled:opacity-50 border-none text-base"
      >
        {recovering ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Recovering Wallet...
          </>
        ) : (
          <>
            <RotateCcw className="w-5 h-5 mr-2" />
            Recover Wallet
          </>
        )}
      </Button>
    </div>
  );
}