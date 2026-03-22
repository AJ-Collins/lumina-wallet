import { useState } from 'react';
import { ArrowLeft, Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RecoveryPhraseReveal({ onBack }) {
  const [showPhrases, setShowPhrases] = useState(false);

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
          
          {!showPhrases ? (
             <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl bg-background/50 hover:bg-background hover:border-[#00F0FF]/30 transition-all cursor-pointer group" onClick={() => setShowPhrases(true)}>
                <Eye className="w-10 h-10 mb-4 text-muted-foreground group-hover:text-[#00F0FF] transition-colors" />
                <h3 className="text-foreground font-bold mb-2">Tap to Reveal Phrase</h3>
                <p className="text-xs text-muted-foreground text-center">Ensure no one else is looking at your screen.</p>
             </div>
          ) : (
             <div className="space-y-6 animate-in zoom-in-95 duration-200">
                <div className="p-8 border-2 border-dashed border-border rounded-xl bg-background/30 text-center flex flex-col items-center">
                   <Shield className="w-12 h-12 mb-4 text-[#FF00E5] opacity-20" />
                   <h3 className="text-foreground font-bold mb-2 uppercase tracking-widest">Secret Phrase Not Stored</h3>
                   <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                     For your security, Lumina Network does not store your secret recovery phrase on this device's local memory after the initial setup. 
                     <br/><br/>
                     If you didn't save it during creation, your funds are at risk. Always ensure you have an offline backup.
                   </p>
                </div>
                
                <div className="p-4 bg-background border border-border rounded-xl">
                   <Button onClick={() => setShowPhrases(false)} className="w-full bg-card border border-border hover:bg-background text-foreground py-6 rounded-xl font-bold shadow-sm transition-all group">
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
