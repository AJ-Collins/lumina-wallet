import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { User, Shield, Key, Bell, Pencil, ChevronRight } from 'lucide-react';
import AboutProfile from './settings/AboutProfile';
import ChangePassword from './settings/ChangePassword';
import RecoveryPhraseReveal from './settings/RecoveryPhraseReveal';
import NotificationSettings from './settings/NotificationSettings';

export default function Settings() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('main'); // 'main', 'profile', 'notifications', 'password', 'phrase'

  if (activeView === 'profile') {
    return <AboutProfile onBack={() => setActiveView('main')} defaultUsername={user?.username || 'Lumina Member'} defaultBio={user?.bio || ''} />;
  }

  if (activeView === 'password') {
    return <ChangePassword onBack={() => setActiveView('main')} />;
  }

  if (activeView === 'phrase') {
    return <RecoveryPhraseReveal onBack={() => setActiveView('main')} />;
  }
  
  if (activeView === 'notifications') {
    return <NotificationSettings onBack={() => setActiveView('main')} />;
  }

  // --- Main Settings View ---
  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in duration-300 pb-24 md:pb-0">
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8 mb-6 flex flex-col md:flex-row items-center gap-6 md:gap-8">
         <div className="relative group cursor-pointer" onClick={() => setActiveView('profile')}>
            <div className="w-24 h-24 rounded-full bg-background border-2 border-border flex items-center justify-center overflow-hidden shadow-lg hover:border-[#00F0FF]/50 transition-colors">
               <User className="w-10 h-10 text-muted-foreground group-hover:text-[#00F0FF] transition-colors" />
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-card border border-border rounded-full flex items-center justify-center shadow-lg group-hover:border-[#FF00E5] transition-colors">
               <Pencil className="w-4 h-4 text-muted-foreground group-hover:text-[#FF00E5]" />
            </div>
         </div>
         
         <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-2xl font-black text-foreground tracking-tight mb-1">Lumina Member</h2>
            <div className="flex items-center gap-2 mt-1 px-3 py-1 bg-background border border-border rounded-lg inline-flex">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <p className="font-mono text-xs font-bold tracking-widest text-muted-foreground uppercase">
                  ACTIVE
               </p>
            </div>
            <p className="text-xs text-muted-foreground mt-3 font-mono bg-background px-3 py-1.5 rounded border border-border">
               {user?.walletAddress || 'Loading...'}
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-6 py-4 border-b border-border bg-background/50">
               <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">General</h3>
            </div>
            <div className="p-2 flex-1">
               <button onClick={() => setActiveView('profile')} className="flex items-center justify-between w-full p-4 rounded-xl hover:bg-background transition-colors group">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center group-hover:border-[#00F0FF]/50 transition-colors">
                        <User className="w-5 h-5 text-muted-foreground group-hover:text-[#00F0FF]" />
                     </div>
                     <div className="text-left">
                        <p className="text-sm font-bold text-foreground">About Profile</p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">Edit username and bio</p>
                     </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-border group-hover:text-[#00F0FF]" />
               </button>

               <button onClick={() => setActiveView('notifications')} className="flex items-center justify-between w-full p-4 rounded-xl hover:bg-background transition-colors group">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center group-hover:border-[#00F0FF]/50 transition-colors">
                        <Bell className="w-5 h-5 text-muted-foreground group-hover:text-[#00F0FF]" />
                     </div>
                     <div className="text-left">
                        <p className="text-sm font-bold text-foreground">Notifications</p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">Manage push alerts</p>
                     </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-border group-hover:text-[#00F0FF]" />
               </button>
            </div>
         </div>

         <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-6 py-4 border-b border-border bg-background/50 flex items-center gap-2">
               <h3 className="text-sm font-bold text-foreground tracking-wide uppercase text-red-500">Security</h3>
               <Shield className="w-4 h-4 text-red-500" />
            </div>
            <div className="p-2 flex-1">
               <button onClick={() => setActiveView('password')} className="flex items-center justify-between w-full p-4 rounded-xl hover:bg-background transition-colors group">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center group-hover:border-red-500/50 transition-colors">
                        <Key className="w-5 h-5 text-muted-foreground group-hover:text-red-500" />
                     </div>
                     <div className="text-left">
                        <p className="text-sm font-bold text-foreground">Change Password</p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">Update local encryption key</p>
                     </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-border group-hover:text-red-500" />
               </button>
               
               <button onClick={() => setActiveView('phrase')} className="flex items-center justify-between w-full p-4 rounded-xl hover:bg-background transition-colors group">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center group-hover:border-red-500/50 transition-colors">
                        <Shield className="w-5 h-5 text-muted-foreground group-hover:text-red-500" />
                     </div>
                     <div className="text-left">
                        <p className="text-sm font-bold text-foreground">Recovery Phrase</p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">Reveal secret phrase</p>
                     </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-border group-hover:text-red-500" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
