import { useState, useRef, useEffect } from 'react';
import { Bell, ArrowDownLeft, ShieldAlert, Zap, ArrowRight } from 'lucide-react';

const DUMMY_NOTIFS = [];

export default function NotificationDropdown({ onSeeAll }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState(DUMMY_NOTIFS);
  const ref = useRef(null);
 
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
 
  const unreadCount = notifs.filter(n => !n.read).length;
 
  const getIcon = (type) => {
    switch (type) {
       case 'receive': return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
       case 'security': return <ShieldAlert className="w-4 h-4 text-red-500" />;
       case 'system': return <Zap className="w-4 h-4 text-[#00F0FF]" />;
       default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };
 
  return (
    <div className="relative" ref={ref}>
       <button 
          onClick={() => setOpen(!open)}
          className={`relative rounded-xl w-10 h-10 flex items-center justify-center transition-colors ${open ? 'bg-[#00F0FF]/10 border border-[#00F0FF]/50 text-[#00F0FF]' : 'bg-card border border-border hover:border-[#00F0FF]/50 text-muted-foreground hover:text-foreground shadow-sm'}`}
       >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
             <span className="absolute -top-1 -right-1 flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF00E5] opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF00E5] ring-2 ring-background"></span>
             </span>
          )}
       </button>
 
       {open && (
         <div className="absolute top-[calc(100%+8px)] right-0 w-80 bg-card border border-border rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between px-3 py-2 mb-1">
               <span className="text-xs font-bold uppercase tracking-widest text-[#00F0FF]">Alerts</span>
               {unreadCount > 0 && <span className="text-[10px] bg-[#FF00E5] text-white px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>}
            </div>
 
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
               {notifs.length === 0 ? (
                 <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                    <Bell className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest opacity-40">No new alerts</p>
                 </div>
               ) : notifs.map(n => (
                  <div key={n.id} className="p-3 rounded-xl hover:bg-background/80 transition-colors cursor-pointer flex gap-3 group">
                     <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                        {getIcon(n.type)}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                           <p className={`text-sm font-bold truncate ${n.read ? 'text-muted-foreground' : 'text-foreground'}`}>{n.title}</p>
                           <span className="text-[10px] font-mono text-muted-foreground">{n.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{n.desc}</p>
                     </div>
                  </div>
               ))}
            </div>

            <button 
               onClick={() => { setOpen(false); onSeeAll(); }}
               className="w-full mt-2 p-3 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-background/80 rounded-xl transition-colors flex items-center justify-center border-t border-border"
            >
               View All Activity <ArrowRight className="w-3 h-3 ml-1" />
            </button>
         </div>
       )}
    </div>
  );
}
