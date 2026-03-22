import { useState, useEffect } from 'react';
import { Search, ArrowRight, ArrowLeft, User, Wallet, Info, Loader2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { walletAPI } from '@/lib/api';
import QRScanner from './QRScanner';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, createAssociatedTokenAccountInstruction } from '@solana/spl-token';

export default function SendToken({ balance }) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [step, setStep] = useState('recipient'); // 'recipient', 'amount'
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [recentContacts, setRecentContacts] = useState([]);

  useEffect(() => {
    walletAPI.getContacts()
      .then((contacts) => {
        const mapped = contacts.map(c => ({
          address: c.contactAddress,
          name: c.name || 'Saved Contact',
          icon: User
        }));
        setRecentContacts(mapped);
      })
      .catch(console.error);
  }, []);

  const handleSelectRecipient = (address) => {
    setRecipient(address);
    setStep('amount');
  };

  const handleScan = (address) => {
    setRecipient(address);
    setShowScanner(false);
  };

  const currentBalance = balance || '0.00';

  return (
    <div className="max-w-xl mx-auto mt-4 w-full">
      <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden min-h-[500px] flex flex-col relative">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center bg-background/50 sticky top-0 z-10 w-full">
          {step === 'amount' && (
            <button
              onClick={() => setStep('recipient')}
              className="mr-4 text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-xl font-bold text-foreground mx-auto">
            {step === 'recipient' ? 'Send LBC Token' : 'Enter Amount'}
          </h2>
          {step === 'amount' && <div className="w-9" />} {/* Spacer for centering */}
        </div>

        {step === 'recipient' ? (
          <div className="p-6 flex-1 flex flex-col w-full">
            <div className="relative mb-8 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search or enter Lumina address"
                className="w-full bg-background border border-border rounded-xl py-4 pl-12 pr-12 text-foreground focus:outline-none focus:border-[#00F0FF]/50 focus:ring-1 focus:ring-[#00F0FF]/50 transition-all font-mono text-sm placeholder:font-sans"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
              <button
                onClick={() => setShowScanner(true)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-card border border-border hover:border-[#00F0FF]/50 text-muted-foreground hover:text-[#00F0FF] transition-all"
                title="Scan QR Code"
              >
                <QrCode className="w-5 h-5" />
              </button>
            </div>

            {showScanner && (
              <QRScanner
                onScan={handleScan}
                onClose={() => setShowScanner(false)}
              />
            )}

            {recipient.length > 20 ? (
              <div className="flex-1 flex flex-col items-center justify-center w-full">
                <div className="w-16 h-16 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/20 flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-[#00F0FF]" />
                </div>
                <p className="text-foreground font-bold font-mono bg-background px-4 py-2 border border-border rounded-lg mb-6 max-w-full truncate text-sm">
                  {recipient}
                </p>
                <Button
                  onClick={() => setStep('amount')}
                  className="w-full bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-background font-bold py-6 rounded-xl border-none text-base shadow-lg transition-transform hover:translate-y-[-2px]"
                >
                  Continue <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="flex-1 w-full">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-2">Recent Contacts</p>
                <div className="space-y-2 w-full">
                  {recentContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 opacity-40">
                      <User className="w-8 h-8 mb-2" />
                      <p className="text-xs font-bold uppercase tracking-widest">No recent contacts</p>
                    </div>
                  ) : recentContacts.map((contact, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectRecipient(contact.address)}
                      className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-background border border-transparent hover:border-border transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center group-hover:border-[#00F0FF]/50 transition-colors">
                          <contact.icon className="w-5 h-5 text-muted-foreground group-hover:text-[#00F0FF]" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-foreground">{contact.name}</p>
                          <p className="text-xs font-mono text-muted-foreground mt-0.5">{contact.address}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 flex-1 flex flex-col justify-between w-full">
            <div className="w-full">
              <div className="bg-background rounded-xl p-4 border border-border flex items-center justify-between mb-8 group cursor-pointer hover:border-foreground/20 transition-colors w-full" onClick={() => setStep('recipient')}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Sending to</p>
                    <p className="text-sm font-mono text-foreground">{recipient.length > 15 ? `${recipient.slice(0, 6)}...${recipient.slice(-6)}` : recipient}</p>
                  </div>
                </div>
                <div className="bg-card px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-muted-foreground group-hover:text-foreground">
                  Edit
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-8 w-full">
                <div className="flex items-center justify-center gap-2 mb-6 px-4 py-2 bg-[#FF00E5]/10 border border-[#FF00E5]/20 rounded-full w-fit">
                  <div className="w-2 h-2 rounded-full bg-[#FF00E5]"></div>
                  <p className="text-xs font-bold text-[#FF00E5] uppercase tracking-widest">LBC Token</p>
                </div>
                <div className="relative w-full overflow-hidden flex items-center justify-center mb-6 px-4">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="text-6xl font-black text-foreground bg-transparent w-fit min-w-[2ch] max-w-[6ch] text-center outline-none placeholder:text-foreground/20 p-0"
                    autoFocus
                  />
                  <span className="text-4xl font-bold text-foreground/50 ml-3 mt-2">LBC</span>
                </div>

                <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2 w-full">
                  Available: {currentBalance} LBC
                  <button onClick={() => setAmount(currentBalance)} className="text-[#00F0FF] hover:text-[#FF00E5] font-bold uppercase text-[10px] tracking-wider px-2 py-0.5 bg-[#00F0FF]/10 rounded border border-[#00F0FF]/20 ml-2 transition-colors">Max</button>
                </p>
              </div>
            </div>

            <div className="mt-8 w-full">
              <div className="bg-background/50 rounded-xl p-4 border border-border mb-6 flex items-start gap-3 w-full">
                <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  Sending tokens on the Lumina Network is nearly instantaneous. Please ensure the destination address is correct as blockchain transactions are irreversible.
                </div>
              </div>

              <Button
                className="w-full bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-background font-bold py-6 rounded-xl border-none text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-transform hover:translate-y-[-2px]"
                disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(currentBalance) || isSending}
                onClick={async () => {
                  try {
                    setIsSending(true);

                    if (!publicKey) throw new Error("Wallet not connected");

                    const mintPubkey = new PublicKey(import.meta.env.VITE_PUBLIC_LBC_MINT);
                    const recipientPubkey = new PublicKey(recipient);

                    const senderATA = await getAssociatedTokenAddress(mintPubkey, publicKey);
                    const recipientATA = await getAssociatedTokenAddress(mintPubkey, recipientPubkey);

                    const mintInfo = await connection.getParsedAccountInfo(mintPubkey);
                    const data = mintInfo.value?.data;
                    const decimals = (data && 'parsed' in data) ? data.parsed?.info?.decimals || 9 : 9;
                    const rawAmount = Math.floor(parseFloat(amount) * Math.pow(10, decimals));

                    const transaction = new Transaction();

                    const recipientAtaInfo = await connection.getAccountInfo(recipientATA);
                    if (!recipientAtaInfo) {
                      transaction.add(
                        createAssociatedTokenAccountInstruction(
                          publicKey,
                          recipientATA,
                          recipientPubkey,
                          mintPubkey
                        )
                      );
                    }

                    transaction.add(
                      createTransferInstruction(
                        senderATA,
                        recipientATA,
                        publicKey,
                        rawAmount
                      )
                    );

                    const latestBlockhash = await connection.getLatestBlockhash();
                    transaction.recentBlockhash = latestBlockhash.blockhash;
                    transaction.feePayer = publicKey;

                    // Wallet adapter handles signing - no manual keypair needed
                    const signature = await sendTransaction(transaction, connection);

                    await connection.confirmTransaction({
                      signature,
                      ...latestBlockhash
                    }, 'confirmed');

                    await walletAPI.confirmSend({
                      txSignature: signature,       // was: signature
                      toAddress: recipient,         // was: recipient
                      amount: parseFloat(amount)
                    });

                    try {
                      await walletAPI.saveContact({
                        contactAddress: recipient,
                        name: `Contact ${recipient.slice(0, 4)}`
                      });
                      
                      // Refresh contacts list quietly
                      walletAPI.getContacts()
                        .then(contacts => {
                          setRecentContacts(contacts.map(c => ({
                            address: c.contactAddress,
                            name: c.name || 'Saved Contact',
                            icon: User
                          })));
                        })
                        .catch(err => console.log('Silently failed to refresh contacts:', err));
                    } catch (e) {
                      console.error('Failed to save contact:', e);
                    }

                    toast.success(`Successfully sent ${amount} LBC to ${recipient.slice(0, 6)}...`);
                    setStep('recipient');
                    setAmount('');
                    setRecipient('');
                  } catch (err) {
                    console.error('Transaction error:', err);
                    toast.error(err.message || 'Failed to send transaction');
                  } finally {
                    setIsSending(false);
                  }
                }}
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Broadcasting...
                  </>
                ) : (
                  'Review & Send'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
