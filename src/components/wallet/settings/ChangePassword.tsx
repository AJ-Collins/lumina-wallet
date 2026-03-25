import { useState } from 'react';
import { userAPI } from '@/lib/api';
import { ArrowLeft, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function ChangePassword({ onBack }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async () => {
    try {
      setIsSaving(true);
      await userAPI.updateSecurity({ oldPassword, newPassword });
      toast.success('Security settings updated successfully');
      onBack();
    } catch (err) {
      toast.error(err.message || 'Failed to update security keys');
    } finally {
      setIsSaving(false);
      setOldPassword('');
      setNewPassword('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
       <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2 bg-card border border-border rounded-xl hover:bg-background transition-colors text-muted-foreground hover:text-foreground shadow-sm">
             <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
             <h2 className="text-2xl font-black text-foreground tracking-tight">Security Lock</h2>
             <Shield className="w-5 h-5 text-red-500" />
          </div>
       </div>
       <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
             <Shield className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
             <div className="text-xs text-muted-foreground leading-relaxed">
                Your password enforces a local encryption barrier over your Lumina master key. If you forget your new password, you will need your 12-word Recovery Phrase to restore access.
             </div>
          </div>

          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Current Password</label>
                <Input 
                  type="password"
                  value={oldPassword} 
                  onChange={(e) => setOldPassword(e.target.value)} 
                  className="bg-background border-border py-6 rounded-xl font-mono shadow-sm focus:border-red-500/50 focus:ring-red-500/50" 
                  placeholder="••••••••"
                />
             </div>
             <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">New Password</label>
                <Input 
                  type="password"
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  className="bg-background border-border py-6 rounded-xl font-mono shadow-sm focus:border-red-500/50 focus:ring-red-500/50" 
                  placeholder="••••••••"
                />
             </div>
          </div>
          <Button 
             className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-6 rounded-xl border-none text-base transition-transform hover:translate-y-[-2px] shadow-lg disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50"
             onClick={handleUpdate}
             disabled={isSaving || !oldPassword || !newPassword}
          >
             {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Shield className="w-5 h-5 mr-2" />}
             Update Local Key
          </Button>
       </div>
    </div>
  );
}
