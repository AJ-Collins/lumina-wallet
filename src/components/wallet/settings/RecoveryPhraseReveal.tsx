import { useState } from 'react';
import { ArrowLeft, Shield, Eye, EyeOff, Lock, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { decryptData } from '@/utils/encryption';

export default function RecoveryPhraseReveal({ onBack }: { onBack: () => void }) {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPhrases, setShowPhrases] = useState(false);
  const [mnemonicList, setMnemonicList] = useState<string[]>([]);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleUnlock = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    try {
      setIsUnlocking(true);
      const encryptedWalletStr = localStorage.getItem('encryptedWallet');
      if (!encryptedWalletStr) {
        throw new Error('No secured wallet found on this device.');
      }

      const encryptedObj = JSON.parse(encryptedWalletStr);
      let decryptedStr;

      try {
        decryptedStr = await decryptData(encryptedObj, password);
      } catch (err) {
        throw new Error('Invalid password. Please try again.');
      }

      const walletData = JSON.parse(decryptedStr);

      if (walletData.type !== 'phrase') {
        throw new Error('Local wallet is not stored as a recovery phrase. It may be a private key.');
      }

      setMnemonicList(walletData.data.split(' '));
      setIsUnlocked(true);
      setPassword(''); // Clear password from memory
      toast.success('Wallet unlocked successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to unlock wallet');
    } finally {
      setIsUnlocking(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mnemonicList.join(' '));
    setCopied(true);
    toast.success('Phrase copied securely.');
    setTimeout(() => setCopied(false), 2000);
  };

  const lockWalletAgain = () => {
    setIsUnlocked(false);
    setShowPhrases(false);
    setMnemonicList([]);
    setPassword('');
    toast.success('Wallet locked.');
    onBack();
  };

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
       <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2 bg-card border border-border rounded-xl hover:bg-background transition-colors text-muted-foreground hover:text-foreground shadow-sm">
             <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
             <h2 className="text-2xl font-black text-foreground tracking-tight">Recovery Phrase</h2>
          </div>
       </div>

       <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8 flex items-start gap-4 shadow-sm">
             <Shield className="w-6 h-6 text-red-500 shrink-0 mt-1 animate-pulse" />
             <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="text-foreground font-black text-red-500 block mb-1 tracking-wider uppercase">Critical Warning</span> 
                Never share this Secret Recovery Phrase with anyone. Literally anyone with this 12-word phrase has permanent and full access to your funds. Lumina Support will never ask for this. Please write it down and store it offline.
             </p>
          </div>
          
          {!isUnlocked ? (
            <form onSubmit={handleUnlock} className="p-6 border border-border rounded-xl bg-background/50 text-center flex flex-col items-center">
              <Lock className="w-12 h-12 mb-4 text-[#00F0FF] opacity-80" />
              <h3 className="text-foreground font-bold mb-2 uppercase tracking-widest">Unlock to View</h3>
              <p className="text-xs text-muted-foreground max-w-sm mb-6 leading-relaxed">
                 Enter your local wallet password to decrypt and view your secure recovery phrase.
              </p>
              <Input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full max-w-xs mb-4 text-center font-mono focus:border-[#00F0FF]/50 transition-colors"
              />
              <Button type="submit" disabled={isUnlocking || !password} className="w-full max-w-xs bg-[#00F0FF] text-background hover:bg-[#00F0FF]/90 font-bold transition-all shadow-lg border-none text-base">
                {isUnlocking ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Decrypt & Unlock'}
              </Button>
            </form>
          ) : !showPhrases ? (
             <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl bg-background/50 hover:bg-background hover:border-[#00F0FF]/30 transition-all cursor-pointer group" onClick={() => setShowPhrases(true)}>
                <Eye className="w-10 h-10 mb-4 text-muted-foreground group-hover:text-[#00F0FF] transition-colors" />
                <h3 className="text-foreground font-bold mb-2">Tap to Reveal Phrase</h3>
                <p className="text-xs text-muted-foreground text-center">Ensure no one else is looking at your screen.</p>
             </div>
          ) : (
             <div className="space-y-6 animate-in zoom-in-95 duration-200">
                <div className="p-6 bg-background border border-border rounded-xl">
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                     {mnemonicList.map((word, i) => (
                       <div key={i} className="flex items-center bg-card border border-border rounded-lg px-3 py-2.5 shadow-sm hover:border-[#00F0FF]/50 transition-colors cursor-default">
                         <span className="text-muted-foreground text-[10px] w-5 font-mono select-none flex-shrink-0">{i + 1}.</span>
                         <span className="text-foreground font-mono text-xs font-bold tracking-wider truncate">{word}</span>
                       </div>
                     ))}
                   </div>
                   
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={copyToClipboard}
                     className="w-full bg-card border-border hover:bg-background hover:border-[#00F0FF]/50 transition-all font-bold group"
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
                
                <div className="p-4 bg-background border border-border rounded-xl">
                   <Button onClick={lockWalletAgain} className="w-full bg-card border border-border hover:bg-background hover:text-red-500 text-foreground py-6 rounded-xl font-bold shadow-sm transition-all group">
                      <EyeOff className="w-5 h-5 mr-2 text-muted-foreground group-hover:text-red-500" />
                      Close & Lock
                   </Button>
                </div>
             </div>
          )}
       </div>
    </div>
  );
}
