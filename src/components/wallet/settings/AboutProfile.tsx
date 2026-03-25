import { useState } from 'react';
import { userAPI } from '@/lib/api';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function AboutProfile({ onBack, defaultUsername = '', defaultBio = '' }) {
  const [username, setUsername] = useState(defaultUsername);
  const [bio, setBio] = useState(defaultBio);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async () => {
    try {
      setIsSaving(true);
      await userAPI.updateProfile({ username, bio });
      toast.success('Profile updated successfully');
      onBack();
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
       <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2 bg-card border border-border rounded-xl hover:bg-background transition-colors text-muted-foreground hover:text-foreground shadow-sm">
             <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-black text-foreground tracking-tight">About Profile</h2>
       </div>
       <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-6">
          <div className="space-y-2">
             <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Username</label>
             <Input 
               placeholder="Lumina Member" 
               value={username} 
               onChange={(e) => setUsername(e.target.value)} 
               className="bg-background border-border py-6 rounded-xl font-bold shadow-sm" 
             />
          </div>
          <div className="space-y-2">
             <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Public Bio</label>
             <textarea 
               rows={4}
               placeholder="Investor & Builder" 
               value={bio} 
               onChange={(e) => setBio(e.target.value)} 
               className="w-full bg-background border border-border rounded-xl p-4 font-medium text-sm focus:outline-none focus:border-[#00F0FF]/50 focus:ring-1 focus:ring-[#00F0FF]/50 transition-colors resize-none shadow-sm" 
             />
             <p className="text-[10px] text-muted-foreground mt-1">This bio will be visible to users searching for your Lumina address.</p>
          </div>
          <Button 
             className="w-full bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-background font-bold py-6 rounded-xl border-none text-base transition-transform hover:translate-y-[-2px] shadow-lg"
             onClick={handleUpdate}
             disabled={isSaving}
          >
             {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
             Save Changes
          </Button>
       </div>
    </div>
  );
}
