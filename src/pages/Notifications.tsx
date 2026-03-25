import { useState } from 'react';
import { Bell, ArrowDownLeft, ShieldAlert, Zap } from 'lucide-react';

const DUMMY_NOTIFS = [];

export default function NotificationsView() {
  const [notifs, setNotifs] = useState(DUMMY_NOTIFS);

  const markAllRead = () => {
     setNotifs(notifs.map(n => ({...n, read: true})));
  };

  const getIcon = (type) => {
    switch (type) {
       case 'receive': return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
       case 'security': return <ShieldAlert className="w-5 h-5 text-red-500" />;
       case 'system': return <Zap className="w-5 h-5 text-[#00F0FF]" />;
       default: return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto w-full pb-24 md:pb-0 animate-in fade-in zoom-in-95 duration-300">
       <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/20 flex items-center justify-center">
                <Bell className="w-6 h-6 text-[#00F0FF]" />
             </div>
             <div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">Activity Alerts</h2>
                <p className="text-xs text-[#00F0FF] font-bold tracking-widest uppercase mt-0.5">{unreadCount} Unread</p>
             </div>
          </div>
          {unreadCount > 0 && (
             <button onClick={markAllRead} className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors bg-card border border-border px-4 py-2 rounded-lg">
                Mark all read
             </button>
          )}
       </div>

       <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
          {notifs.length === 0 ? (
             <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <Bell className="w-10 h-10 mb-2 opacity-20" />
                <p>No recent activity</p>
             </div>
          ) : (
             <div className="divide-y divide-border">
               {notifs.map(n => (
                  <div key={n.id} className={`p-4 md:p-6 flex items-start gap-4 transition-colors hover:bg-background/50 ${n.read ? 'opacity-70' : 'bg-background/80'}`}>
                     <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center shrink-0 shadow-sm mt-1">
                        {getIcon(n.type)}
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center justify-between gap-4 mb-1">
                           <h4 className={`text-sm font-bold ${n.read ? 'text-muted-foreground' : 'text-foreground'}`}>{n.title}</h4>
                           <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">{n.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{n.desc}</p>
                     </div>
                     {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-[#00F0FF] mt-2 shrink-0 animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.8)]"></div>
                     )}
                  </div>
               ))}
             </div>
          )}
       </div>
    </div>
  );
}
