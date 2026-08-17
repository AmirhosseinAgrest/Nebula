# 🌌 Nebula

> **Serverless. Peer-to-Peer. End-to-End Encrypted.**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/AmirhosseinAgrest/Nebula)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blueviolet.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF.svg)](https://vitejs.dev/)
[![Netlify Status](https://img.shields.io/badge/Netlify-Live-success.svg)](https://nebulatalk.netlify.app)

---

**Nebula** is a completely **serverless**, **decentralized**, **peer-to-peer** messenger built on WebRTC. No servers, no databases, no sign-ups — just you and your contacts, connected directly through the browser.

All messages, calls, and files are **end-to-end encrypted** using AES-GCM. Your data never touches a central server — it lives only on your device and travels directly to your recipients.

🔐 **Zero servers. Zero trust. Zero compromises.**

---

## ✨ Features

### 🚀 Core
- **True Serverless Architecture** — No backend, no cloud, no databases
- **WebRTC Peer-to-Peer** — Direct browser-to-browser connections
- **End-to-End Encryption** — AES-GCM with PBKDF2-derived session keys
- **Offline-First** — Messages are queued and synced when you reconnect
- **Progressive Web App** — Installable on mobile and desktop

### 💬 Messaging
- Text messages with rich formatting
- File sharing (up to 20 MB)
- Voice messages (up to 2 minutes)
- Reply, Edit, Delete, and Forward
- Emoji Reactions
- Pin messages and rooms
- Read Receipts
- Typing indicators

### 👥 Groups & Contacts
- Direct one-on-one chats
- Group chats (up to 5 members)
- Saved Messages (self-chat)
- Favorite and Pin rooms
- Contact blocking

### 📞 Calls
- Audio calls
- Video calls (360p to 1080p)
- Toggle microphone and camera during calls
- Picture-in-picture local preview

### 🎨 User Experience
- Dark / Light mode
- Responsive design (mobile + desktop)
- Smooth animations
- Context menus (right-click / long-press)
- Toast notifications
- Search chats
- Filter by: All, Favorites, Saved, Groups

### 🔐 Security
- End-to-end encryption for all messages, files, and calls
- Encrypted at-rest storage (IndexedDB)
- Encrypted backup/restore with passphrase
- User identity = Peer ID (never stored anywhere)
- No data collection, no telemetry

---

## 📸 Screenshots

> *Screenshots coming soon — the app is fully functional and ready to use!*

---

## 🌐 Live Demo

You can try the live version of Nebula here:

👉 **[nebulatalk.netlify.app](https://nebulatalk.netlify.app)**

> **Note**: Since Nebula is a peer-to-peer messenger, you'll need to share your Peer ID with a friend to test the messaging features. Open the app in two different browsers or devices to see it in action!

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         BROWSER                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │   React UI    │  │  Zustand      │  │  IndexedDB    │   │
│  │   (Vite)      │  │  Stores       │  │  (Dexie)      │   │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘   │
│          │                  │                  │           │
│  ┌───────▼──────────────────▼──────────────────▼───────┐   │
│  │              Application Layer                       │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  Crypto (Web Crypto API)                   │   │   │
│  │  │  • AES-GCM • PBKDF2 • RSA-OAEP            │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  Queue Manager                             │   │   │
│  │  │  • Offline queue • Auto-flush on reconnect │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  Peer Manager (PeerJS)                     │   │   │
│  │  │  • WebRTC connections • DataChannel • Media│   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                               │
└────────────────────────────┼───────────────────────────────┘
                             │ WebRTC (P2P)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                     OTHER PEERS (Browsers)                   │
│  • Direct DataChannel connections                            │
│  • MediaStream for calls                                     │
│  • No central server involved                                │
└─────────────────────────────────────────────────────────────┘
```

### 🔐 Encryption Flow

1. **Room Creation** — Each room (direct or group) has a unique ID
2. **Session Key** — PBKDF2 derives a 256-bit AES-GCM key from the room ID
3. **Message Encryption** — Messages encrypted with AES-GCM before transmission
4. **At-Rest Encryption** — Messages encrypted again before storing in IndexedDB
5. **Backup Encryption** — Full chat history encrypted with user-chosen passphrase

### 📡 Offline-First Flow

```
User sends message
        │
        ▼
   Encrypt message
        │
        ▼
┌───────────────────┐
│  Is peer online?   │
└───────────────────┘
    │ Yes          │ No
    ▼              ▼
Send via WebRTC   Add to queue
    │              │
    ▼              ▼
   Delivered     Wait for reconnection
                 │
                 ▼
              Auto-flush queue
```

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 19, TypeScript, Vite 7 |
| **Styling** | Tailwind CSS 4, clsx, tailwind-merge |
| **State Management** | Zustand (with persist) |
| **Database** | Dexie (IndexedDB wrapper) |
| **P2P / WebRTC** | PeerJS |
| **Crypto** | Web Crypto API (AES-GCM, PBKDF2, RSA-OAEP) |
| **Routing** | React Router v7 |
| **Icons** | Lucide React |
| **UUID** | uuid (v4) |
| **PWA** | Service Worker, Manifest |

---

## 📦 Installation

### Prerequisites
- Node.js (v20.19+ or v22.12+)
- npm or pnpm

### Clone & Install

```bash
# Clone the repository
git clone https://github.com/AmirhosseinAgrest/Nebula.git
cd Nebula

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev
```

### Build for Production

```bash
npm run build
# or
pnpm build
```

The output will be in the `dist/` folder as a single HTML file (using `vite-plugin-singlefile`).

---

## 🚀 Usage

### Getting Started

1. **Open the app** in your browser (or install as PWA)
2. **Create your profile** — choose a display name and optional avatar
3. **Share your Peer ID** with friends
4. **Start chatting** — paste your friend's Peer ID and connect

### Your Peer ID

Your Peer ID is your **decentralized identity** — it's generated locally and never stored anywhere. Share it with friends so they can start a chat with you.

### Security Tips

- **Never share your Peer ID publicly** — anyone with your Peer ID can message you
- **Choose a strong backup passphrase** — your chat history is encrypted with it
- **Clear your browser data** to permanently delete all local data
- **No server-side backups** — your data lives only on your device

---

## 🤝 Contributing

We welcome contributions from the community!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

---

## 🧪 Development

### Project Structure

```
src/
├── components/     # React components
│   ├── call/       # Call UI
│   ├── chat/       # Chat components
│   ├── onboarding/ # Registration
│   ├── settings/   # Settings modal
│   ├── sidebar/    # Sidebar and modals
│   └── ui/         # Reusable UI primitives
├── hooks/          # Custom React hooks
├── lib/            # Core logic
│   ├── backup/     # Backup/restore
│   ├── crypto/     # Encryption
│   ├── db/         # IndexedDB repositories
│   ├── sync/       # Offline queue
│   ├── utils/      # Utilities
│   └── webrtc/     # PeerJS management
├── store/          # Zustand stores
├── types/          # TypeScript types
└── utils/          # Shared utilities
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `pnpm dev` | Start with pnpm |
| `pnpm build` | Build with pnpm |

---

## 🔒 Security

### Encryption Standards

- **Symmetric Encryption**: AES-GCM with 256-bit keys
- **Key Derivation**: PBKDF2 with 150,000 iterations
- **Key Exchange**: RSA-OAEP (2048-bit)
- **Hash Function**: SHA-256

### Privacy Guarantees

- ✅ No data collection
- ✅ No telemetry
- ✅ No analytics
- ✅ No server-side storage
- ✅ No third-party tracking
- ✅ All data stored locally on your device
- ✅ Open source — fully auditable

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [PeerJS](https://peerjs.com/) — WebRTC made simple
- [Dexie.js](https://dexie.org/) — IndexedDB wrapper
- [Zustand](https://zustand-demo.pmnd.rs/) — Minimal state management
- [Vite](https://vitejs.dev/) — Next-gen frontend tooling
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework
- [Lucide](https://lucide.dev/) — Beautiful icons

---

## 📞 Contact

- **Author**: Amirhossein Agrest
- **GitHub**: [@AmirhosseinAgrest](https://github.com/AmirhosseinAgrest)

---

<div align="center">
  <strong>Built with ❤️ — No servers. No tracking. Just privacy.</strong>
</div>