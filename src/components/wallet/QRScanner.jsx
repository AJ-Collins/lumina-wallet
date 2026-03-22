import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function QRScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ]
      },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
        scanner.clear();
      },
      (errorMessage) => {
        // Silent error for each frame scan failure
      }
    );

    return () => {
      scanner.clear().catch(err => console.error('Scanner cleanup error:', err));
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col p-4 md:p-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8 max-w-xl mx-auto w-full">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/20 flex items-center justify-center">
               <Camera className="w-5 h-5 text-[#00F0FF]" />
            </div>
            <div>
               <h2 className="text-xl font-black text-foreground tracking-tight">Scan QR Code</h2>
               <p className="text-[10px] text-[#00F0FF] font-bold tracking-widest uppercase">Center the address in the box</p>
            </div>
         </div>
         <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-background/80" 
            onClick={onClose}
         >
            <X className="w-6 h-6" />
         </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div 
          id="qr-reader" 
          className="w-full max-w-sm rounded-2xl overflow-hidden border-2 border-[#00F0FF]/30 shadow-[0_0_50px_rgba(0,240,255,0.15)] bg-card"
        ></div>
        
        {error && (
           <div className="mt-8 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 max-w-sm">
              <ShieldAlert className="w-5 h-5 text-destructive" />
              <p className="text-xs text-destructive font-bold">{error}</p>
           </div>
        )}

        <div className="mt-8 text-center max-w-xs">
           <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              Scan a Lumina Network or Solana address to automatically fill the recipient field.
           </p>
        </div>
      </div>
      
      <div className="mt-auto pb-8 flex justify-center">
         <Button 
            onClick={onClose}
            className="bg-card border border-border hover:bg-background text-foreground px-12 py-6 rounded-2xl font-bold transition-all"
         >
            Cancel Scanning
         </Button>
      </div>

      <style>{`
        #qr-reader {
          border: none !important;
        }
        #qr-reader__scan_region {
           background: transparent !important;
        }
        #qr-reader img {
           display: none;
        }
        #qr-reader__dashboard {
           padding: 20px !important;
           background: transparent !important;
        }
        #qr-reader__dashboard_section_csr button {
           background: #00F0FF !important;
           color: #000 !important;
           border: none !important;
           padding: 10px 20px !important;
           border-radius: 12px !important;
           font-weight: 800 !important;
           text-transform: uppercase !important;
           letter-spacing: 1px !important;
           font-size: 11px !important;
           transition: all 0.2s ease !important;
        }
        #qr-reader__dashboard_section_csr button:hover {
           background: #FF00E5 !important;
           box-shadow: 0 0 15px rgba(255, 0, 229, 0.4) !important;
        }
        #qr-reader__header_message {
            display: none !important;
        }
      `}</style>
    </div>
  );
}
