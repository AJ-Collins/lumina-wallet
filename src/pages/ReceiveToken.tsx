import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/lib/AuthContext';
import { Copy, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ReceiveToken() {
  const { user } = useAuth();
  const address = user?.walletAddress || 'Loading...';

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  return (
    <div className="max-w-md mx-auto mt-4 w-full">
      <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col relative">
        <div className="px-6 py-5 border-b border-border bg-background/50 text-center">
          <h2 className="text-xl font-bold text-foreground mx-auto tracking-wide">
            Receive LBC
          </h2>
        </div>

        <div className="p-8 flex flex-col items-center">
           <div className="bg-white p-4 rounded-2xl shadow-lg mb-8 border-4 border-white/10">
              <QRCodeSVG 
                value={address} 
                size={220}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"H"}
                includeMargin={false}
              />
           </div>

           <div className="bg-background border border-border rounded-xl p-4 w-full text-center relative mb-8 group cursor-pointer hover:border-[#00F0FF]/50 transition-all font-mono shadow-sm" onClick={copyAddress}>
              <p className="text-sm font-semibold text-foreground break-all tracking-tight leading-relaxed">{address}</p>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-card px-3 py-1 rounded-full border border-border text-[10px] uppercase font-bold text-muted-foreground group-hover:text-[#00F0FF] flex items-center gap-1 transition-colors shadow-sm">
                 <Copy className="w-3 h-3" />
                 Copy Address
              </div>
           </div>

           <div className="bg-background/50 rounded-xl p-4 border border-border flex items-start gap-3 w-full">
              <AlertCircle className="w-5 h-5 text-[#FF00E5] shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground leading-relaxed">
                 <span className="text-foreground font-bold">Important:</span> Only send Lumina Network (LBC) compatible assets to this exact address. Sending other assets may result in permanent loss.
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
