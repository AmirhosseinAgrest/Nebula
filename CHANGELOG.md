# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-07-07

### 🎉 Initial Release

Nebula is now available as an open-source, serverless, peer-to-peer messenger!

### ✨ Added

#### Core Features
- **Peer-to-Peer Architecture** — Direct WebRTC connections using PeerJS
- **End-to-End Encryption** — AES-GCM encryption for all messages, files, and calls
- **Offline-First** — Messages are queued and auto-synced when reconnecting
- **Progressive Web App** — Installable on mobile and desktop devices
- **Zero Server Dependency** — No backend, no databases, no sign-ups

#### Messaging
- Text messages with rich formatting
- File sharing (up to 20 MB)
- Voice messages (up to 2 minutes)
- Reply to messages
- Edit messages (for sender)
- Delete messages (for everyone)
- Forward messages to other chats
- Emoji reactions (❤️ 👍 😂 😮 😢 😡)
- Pin messages to top of chat
- Read receipts
- Typing indicators

#### Chats & Rooms
- Direct one-on-one chats
- Group chats (up to 5 members)
- Saved Messages (self-chat for notes)
- Pin rooms to top
- Favorite rooms for quick access
- Room search with filtering
- Tab filtering: All Chats, Favorites, Saved, Groups
- Unread count badges
- Last message preview

#### Calls
- Audio calls with mute/unmute
- Video calls with camera on/off
- Video quality selection (360p, 480p, 720p, 1080p)
- Picture-in-picture local preview
- Call duration timer
- Incoming call notification UI

#### User Experience
- Dark / Light mode with system preference detection
- Responsive design (mobile + desktop)
- Smooth animations (fade, scale, bubble)
- Context menus (right-click / long-press)
- Toast notifications
- Offline banner with connection status
- Avatar with deterministic colors
- Online/offline status indicators

#### Security & Privacy
- **End-to-End Encryption** — AES-GCM with PBKDF2-derived keys
- **Encryption at Rest** — All local data encrypted in IndexedDB
- **Encrypted Backup** — AES-GCM encrypted JSON export/import with passphrase
- **Blocklist** — Block unwanted contacts
- **Privacy Settings** — Toggle read receipts and online status
- **No Data Collection** — Zero telemetry, zero analytics
- **Open Source** — Fully auditable codebase

#### Settings
- Profile management (display name, bio, avatar)
- Dark mode toggle
- Read receipts toggle
- Online status toggle
- Font size selection (small, medium, large)
- Backup export/import with passphrase
- Blocked users management
- Copy your Peer ID

#### Database & Storage
- **IndexedDB** with Dexie wrapper
- Encrypted at-rest storage for all data
- Message repository with encryption
- Room repository with CRUD operations
- User repository for contact management
- Blocklist repository
- Queue manager for offline messages

#### Developer Features
- **TypeScript** — Full type safety
- **Vite** — Fast development and build tool
- **Zustand** — State management with persistence
- **Tailwind CSS** — Utility-first styling with dark mode
- **Service Worker** — Offline-first caching
- **PWA Manifest** — Installable web app
- **Single-file Build** — `vite-plugin-singlefile` for easy deployment

#### Utilities
- Date formatting (time, day labels, relative time)
- File handling (base64 conversion, chunking, size formatting)
- Avatar generation (deterministic colors and initials)
- Input validation (display names, bios, peer IDs)
- Constants management

---

### 🐛 Known Issues

#### Current Limitations

| Issue | Status | Impact |
|-------|--------|--------|
| **TURN Server** — Some networks (strict NAT) may fail to establish P2P connections | ⚠️ Limited | Users behind strict NAT may need a TURN server |
| **File Transfer** — Large files (20 MB) may be slow on poor connections | ⚠️ Performance | Files above 10 MB may experience delays |
| **Group Calls** — Group voice/video calls are not yet supported | ❌ Missing | Only one-on-one calls supported |
| **Message Search** — No search within chat history yet | ❌ Missing | Users cannot search old messages |
| **Push Notifications** — No native push notifications | ❌ Missing | Users must check the app manually |
| **Message Deletion** — "Delete for everyone" only works when both peers are online | ⚠️ Limited | Offline peers won't see the deletion until they reconnect |
| **Browser Compatibility** — WebRTC may not work on older browsers | ⚠️ Limited | Modern Chrome, Firefox, Edge, Safari supported |

---

### 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| React | 19.2.6 | UI library |
| TypeScript | 5.9.3 | Type safety |
| Vite | 7.3.2 | Build tool |
| Tailwind CSS | 4.1.17 | Styling |
| Zustand | 5.0.14 | State management |
| Dexie | 4.4.4 | IndexedDB wrapper |
| PeerJS | 1.5.5 | WebRTC P2P connections |
| React Router | 7.18.1 | Routing |
| Lucide React | 1.23.0 | Icons |
| uuid | 14.0.1 | Unique IDs |

---

### 🔐 Security Considerations

#### Known Security Features
- ✅ AES-GCM encryption (256-bit)
- ✅ PBKDF2 key derivation (150,000 iterations)
- ✅ RSA-OAEP public-key encryption (2048-bit)
- ✅ Encrypted at-rest storage
- ✅ Encrypted backup/restore
- ✅ No server-side data storage
- ✅ No telemetry or analytics

#### Recommended Security Best Practices
- 🔒 **Use a strong backup passphrase** — choose something memorable but hard to guess
- 🔒 **Share your Peer ID only with trusted contacts**
- 🔒 **Keep your browser updated** for the latest security patches
- 🔒 **Clear browser data** when using shared devices

---

### 📝 Documentation

- [README.md](README.md) — Project overview, features, and installation
- [CONTRIBUTING.md](CONTRIBUTING.md) — How to contribute
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) — Community guidelines
- [SECURITY.md](SECURITY.md) — Security policy and reporting

---

### 👥 Contributors

We would like to thank the following contributors for their work on this release:

- **Amirhossein Agrest** — Creator and Lead Developer

*— This list will grow as more contributors join!*

---

## 🔄 Version History

| Version | Release Date | Changes |
|---------|-------------|---------|
| **1.0.0** | 2026-07-07 | Initial release |

---

## 📚 References

- [Keep a Changelog](https://keepachangelog.com/) — Changelog format standard
- [Semantic Versioning](https://semver.org/) — Versioning standard
- [Conventional Commits](https://www.conventionalcommits.org/) — Commit message convention

---

<div align="center">
  <strong>Thank you for using Nebula! 🚀</strong>
</div>