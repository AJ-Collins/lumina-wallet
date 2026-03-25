import { useState } from 'react';
import { ArrowLeft, Bell } from 'lucide-react';

export default function NotificationSettings({ onBack }) {
  const [alerts, setAlerts] = useState({
    transactions: true,
    security: true,
    marketing: false,
    network: true
  });

  const toggleAlert = (key) => setAlerts(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
       <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2 bg-card border border-border rounded-xl hover:bg-background transition-colors text-muted-foreground hover:text-foreground shadow-sm">
             <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
             <h2 className="text-2xl font-black text-foreground tracking-tight">Notifications</h2>
             <Bell className="w-5 h-5 text-[#00F0FF]" />
          </div>
       </div>

       <div className="bg-card border border-border rounded-2xl p-2 shadow-xl">
          {[
            { key: 'transactions', title: 'Transaction Alerts', desc: 'Get notified for incoming & outgoing sends' },
            { key: 'security', title: 'Security Alerts', desc: 'Important warnings about your keys or unusual logins' },
            { key: 'network', title: 'Network Updates', desc: 'Mainnet congestion or upgrade announcements' },
            { key: 'marketing', title: 'Promotions', desc: 'News about Lumina wallet features and airdrops' },
          ].map((item, idx) => (
             <div key={item.key} className={`flex items-center justify-between p-4 ${idx !== 3 ? 'border-b border-border/50' : ''}`}>
                <div>
                   <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                   <p className="text-xs text-muted-foreground mt-0.5 font-medium">{item.desc}</p>
                </div>
                <button 
                  onClick={() => toggleAlert(item.key)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out relative ${alerts[item.key] ? 'bg-[#00F0FF]' : 'bg-muted'}`}
                >
                   <div className={`w-4 h-4 rounded-full bg-background shadow-sm transition-transform duration-200 ease-in-out ${alerts[item.key] ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
             </div>
          ))}
       </div>
    </div>
  );
}
