import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { mnemonicToSeedSync, validateMnemonic } from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { Keypair } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { useAuth } from '@/lib/AuthContext';
import { encryptData } from '@/utils/encryption';

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

export default function ImportWallet() {
  const { login } = useAuth();
  const [importType, setImportType] = useState('phrase');
  const [privateKey, setPrivateKey] = useState('');
  const [phraseWords, setPhraseWords] = useState(Array(12).fill(''));
  const [password, setPassword] = useState('');
  const [importing, setImporting] = useState(false);

  const handlePaste = (e, index) => {
    if (importType !== 'phrase') return;
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const words = pastedData.trim().split(/[\s,]+/);
    if (words.length > 0) {
      const targetLength = words.length > 12 ? 24 : 12;
      const newPhraseWords = Array(targetLength).fill('');

      for (let i = 0; i < targetLength; i++) {
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

  const handleImport = async () => {
    try {
      setImporting(true);
      let keypair;
      let walletData;

      if (!password || password.length < 6) {
        toast.error('Please enter a password of at least 6 characters to secure your wallet locally');
        setImporting(false);
        return;
      }

      if (importType === 'privateKey') {
        if (!privateKey.trim()) {
          toast.error('Please enter your private key');
          return;
        }
        keypair = keypairFromPrivateKey(privateKey.trim());
        walletData = JSON.stringify({ type: 'privateKey', data: privateKey.trim() });
        sessionStorage.setItem('walletPrivateKey', privateKey.trim());
        sessionStorage.removeItem('walletMnemonic');
      } else {
        if (phraseWords.some(w => !w.trim())) {
          toast.error(`Please fill in all ${phraseWords.length} words of your recovery phrase`);
          return;
        }
        const phrase = phraseWords.map(w => w.replace(/[^a-zA-Z]/g, '').toLowerCase()).join(' ');
        if (!validateMnemonic(phrase)) {
          toast.error('Invalid recovery phrase — please check your words. Ensure they match exactly natively.');
          return;
        }
        keypair = keypairFromMnemonic(phrase);
        walletData = JSON.stringify({ type: 'phrase', data: phrase });
        sessionStorage.setItem('walletMnemonic', phrase);
        sessionStorage.removeItem('walletPrivateKey');
      }

      // Encrypt the wallet and save it locally
      const encryptedObj = await encryptData(walletData, password);
      localStorage.setItem('encryptedWallet', JSON.stringify(encryptedObj));

      const address = keypair.publicKey.toBase58();
      const signFn = async (messageBytes) =>
        nacl.sign.detached(messageBytes, keypair.secretKey);

      await login(address, signFn);
      toast.success('Wallet imported successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to import wallet');
    } finally {
      setImporting(false);
    }
  };

  const isFormValid = (importType === 'privateKey'
    ? privateKey.trim().length > 0
    : phraseWords.every(w => w.trim().length > 0)) && password.length >= 6;

  return (
    <div className="space-y-6">
      {/* Import Type Selector */}
      <div className="grid grid-cols-2 gap-2 bg-background border border-border rounded-xl p-1 shadow-inner">
        <button
          onClick={() => setImportType('phrase')}
          className={`py-3 px-3 rounded-lg text-xs font-bold transition-all uppercase tracking-widest ${importType === 'phrase'
              ? 'bg-card text-[#00F0FF] shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground border border-transparent'
            }`}
        >
          Recovery Phrase
        </button>
        <button
          onClick={() => setImportType('privateKey')}
          className={`py-3 px-3 rounded-lg text-xs font-bold transition-all uppercase tracking-widest ${importType === 'privateKey'
              ? 'bg-card text-[#FF00E5] shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground border border-transparent'
            }`}
        >
          Private Key
        </button>
      </div>

      {/* Input */}
      <div className="p-5 bg-card border border-border rounded-xl shadow-lg">
        {importType === 'privateKey' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-[#FF00E5]" />
              <p className="text-xs text-[#FF00E5] font-bold uppercase tracking-widest">Secret Private Key</p>
            </div>
            <Input
              type="password"
              placeholder="Paste your base58 private key"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              disabled={importing}
              className="bg-background border-border font-mono text-sm py-6 rounded-xl hover:border-[#FF00E5]/50 focus:border-[#FF00E5] transition-colors"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse"></div>
                <p className="text-xs text-[#00F0FF] font-bold uppercase tracking-widest">{phraseWords.length}-Word Secret Phrase</p>
              </div>
              <button onClick={() => setPhraseWords(phraseWords.length === 12 ? [...phraseWords, ...Array(12).fill('')] : phraseWords.slice(0, 12))} className="text-xs font-bold text-[#FF00E5] hover:underline whitespace-nowrap ml-4 transition-all">
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
                    className="w-full bg-background border border-border rounded-lg py-2.5 pl-8 pr-2 text-foreground font-mono text-xs font-bold focus:outline-none focus:border-[#00F0FF]/50 focus:ring-1 focus:ring-[#00F0FF]/50 transition-colors shadow-sm"
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
        )}
      </div>

      {/* Password to encrypt the wallet locally */}
      <div className="p-4 bg-background border border-border rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-[#00F0FF]" />
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Unlock Password</p>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Set a password to securely encrypt and save this imported wallet on this device for easy access later.</p>
        <Input
          type="password"
          placeholder="Minimum 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={importing}
          className="bg-card border-border font-mono text-sm py-5 rounded-lg focus:border-[#00F0FF]/50 transition-colors"
        />
      </div>

      <Button
        onClick={handleImport}
        disabled={importing || !isFormValid}
        className={`w-full text-background font-black py-6 rounded-xl transition-all disabled:opacity-50 border-none text-base ${importType === 'phrase' ? 'bg-[#00F0FF] hover:bg-[#00F0FF]/90' : 'bg-[#FF00E5] hover:bg-[#FF00E5]/90'
          }`}
      >
        {importing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Importing Wallet...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 mr-2" />
            Import Wallet
          </>
        )}
      </Button>
    </div>
  );
}