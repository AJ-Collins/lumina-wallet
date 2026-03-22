# Lumina Wallet 💎

Lumina Wallet is a premium, non-custodial Solana wallet experience designed for speed, security, and elegance. Built with modern web technologies, it provides a seamless interface for managing your Solana assets with professional-grade tools.

![Lumina Wallet Banner](https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=2000)

## ✨ Key Features

- **🚀 Dynamic Dashboard**: A unified view of your LBC balance, wallet address, and real-time transaction activity.
- **🛡️ Non-Custodial Security**: 
  - Industry-standard BIP39 seed phrase management.
  - Secure "Unlock Wallet" flow for returning users.
  - Full control over your private keys.
- **💸 Native Send & Receive**: 
  - Integrated QR code scanner for hassle-free transfers.
  - Support for SPL tokens and native SOL.
- **📊 Real-time Analytics**: Visualized performance and transaction history powered by Recharts.
- **🎨 Premium UI/UX**: 
  - Sleek dark mode by default.
  - Fluid micro-animations with Framer Motion.
  - Responsive layouts for all devices.
- **🔌 DApp Integration**: Seamlessly connect to the Solana ecosystem via standard wallet protocols.

## 🛠️ Tech Stack

- **Core**: [React 18](https://reactjs.org/), [Vite](https://vitejs.dev/)
- **Blockchain**: [@solana/web3.js](https://solana-labs.github.io/solana-web3.js/), [@solana/wallet-adapter](https://github.com/solana-labs/wallet-adapter)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Visualization**: [Recharts](https://recharts.org/)
- **Validation**: [Zod](https://zod.dev/), [React Hook Form](https://react-hook-form.com/)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AJ-Collins/lumina-wallet.git
   cd lumina-wallet
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add your Solana RPC endpoint:
   ```env
   VITE_SOLANA_RPC_URL=your_rpc_endpoint_here
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```text
src/
├── components/     # Reusable UI components (shadcn/ui)
│   ├── auth/       # Authentication (Unlock, Import, Recover)
│   ├── wallet/     # Wallet-specific logic (Send, Receive, Settings)
│   └── ui/         # Base UI primitives
├── pages/          # Top-level page components (Dashboard, Auth)
├── hooks/          # Custom React hooks
├── lib/            # Utility libraries and configurations
└── utils/          # Helper functions and formatting
```

## 🔐 Security

Lumina Wallet is a non-custodial application. Your private keys and seed phrases are encrypted and stored locally on your device. Never share your recovery phrase with anyone.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by the Lumina Team.