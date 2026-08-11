# Contributing to Nebula

First off, thank you for considering contributing to Nebula! 🎉 

Nebula is a community-driven, open-source project. We believe that privacy and secure communication should be accessible to everyone, and we welcome contributions from developers of all skill levels.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)
- [Security Issues](#security-issues)
- [Style Guide](#style-guide)
- [Testing](#testing)
- [Documentation](#documentation)
- [License](#license)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

---

## 🤔 How Can I Contribute?

### Types of Contributions

| Type | Description |
|------|-------------|
| 🐛 **Bug Reports** | Found a bug? Let us know! |
| 💡 **Feature Requests** | Have an idea? Share it! |
| 📝 **Documentation** | Improve our docs, readme, or comments |
| 🧪 **Testing** | Write tests or report edge cases |
| 💻 **Code** | Fix bugs, add features, refactor |
| 🌍 **Translation** | Help translate the app |
| 🎨 **UI/UX** | Design improvements |

### Good First Issues

If you're new to the project, look for issues labeled:

- `good-first-issue` — Beginner-friendly tasks
- `help-wanted` — Tasks that need attention
- `documentation` — Doc improvements

---

## 🛠️ Development Setup

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20.19+ or 22.12+ |
| npm | 10+ |
| pnpm (optional) | 8+ |

### Setup Steps

```bash
# 1. Fork the repository
# Click the "Fork" button on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/Nebula.git
cd Nebula

# 3. Add upstream remote
git remote add upstream https://github.com/AmirhosseinAgrest/Nebula.git

# 4. Install dependencies
npm install
# or
pnpm install

# 5. Start development server
npm run dev
# or
pnpm dev

# 6. Open http://localhost:5173
```

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run type-check` | Run TypeScript type checking |

---

## 📁 Project Structure

```
Nebula/
├── public/
│   ├── icons/
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── icon.svg
│   ├── manifest.json     # PWA manifest
│   └── sw.js             # Service worker
├── src/
│   ├── components/       # React components
│   │   ├── call/         # Call UI components
│   │   ├── chat/         # Chat components
│   │   ├── onboarding/   # Registration components
│   │   ├── settings/     # Settings modal
│   │   ├── sidebar/      # Sidebar components
│   │   └── ui/           # Reusable UI primitives
│   ├── hooks/            # Custom React hooks
│   │   ├── useOnlineStatus.ts
│   │   ├── usePeer.ts
│   │   └── useTheme.ts
│   ├── lib/              # Core business logic
│   │   ├── backup/       # Backup/restore
│   │   ├── crypto/       # E2EE encryption
│   │   ├── db/           # IndexedDB repositories
│   │   ├── sync/         # Offline queue
│   │   ├── utils/        # Utilities
│   │   └── webrtc/       # PeerJS management
│   ├── store/            # Zustand stores
│   │   ├── callStore.ts
│   │   ├── chatStore.ts
│   │   ├── settingsStore.ts
│   │   ├── uiStore.ts
│   │   └── userStore.ts
│   ├── types/            # TypeScript type definitions
│   │   ├── call.types.ts
│   │   ├── message.types.ts
│   │   ├── room.types.ts
│   │   ├── user.types.ts
│   │   └── wire.types.ts
│   ├── utils/            # Shared utilities
│   │   └── cn.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .gitignore
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── index.html
├── LICENSE
├── package-lock.json
├── package.json
├── README.md
├── SECURITY.md
├── tsconfig.json
└── vite.config.ts
```

---

## 📝 Coding Standards

### TypeScript

- **Use TypeScript** for all new code
- **Define explicit types** for all props, state, and functions
- **Avoid `any`** — use `unknown` and type guards when necessary
- **Use interfaces** for objects, **type aliases** for unions

```typescript
// ✅ Good
interface MessageProps {
  content: string;
  timestamp: number;
  senderId: string;
}

function MessageBubble({ content, timestamp, senderId }: MessageProps) {
  // ...
}

// ❌ Bad
function MessageBubble(props: any) {
  // ...
}
```

### React

- **Functional components** with hooks
- **Use `useMemo` and `useCallback`** for expensive operations
- **Keep components focused** — one responsibility per component
- **Use custom hooks** for reusable logic

```tsx
// ✅ Good
export function useTheme() {
  const darkMode = useSettingsStore((s) => s.darkMode);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);
  return { darkMode };
}

// ❌ Bad — theme logic in component
function App() {
  const darkMode = localStorage.getItem('theme') === 'dark';
  // ... mixed concerns
}
```

### State Management (Zustand)

- **Keep stores focused** — one store per domain
- **Use selectors** to avoid unnecessary re-renders
- **Use `persist` middleware** for persisted state

```tsx
// ✅ Good
const user = useUserStore((s) => s.currentUser);
const displayName = useUserStore((s) => s.currentUser?.displayName);

// ❌ Bad — entire store re-renders on any change
const store = useUserStore();
```

### Styling (Tailwind)

- **Use `cn` utility** for conditional classes
- **Support dark mode** with `dark:` prefix
- **Use design tokens** (colors, spacing, typography) consistently

```tsx
// ✅ Good
<div className={cn(
  "rounded-xl px-4 py-3",
  isActive ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800",
  className
)} />

// ❌ Bad — no dark mode support
<div className="bg-white text-black" />
```

---

## 📝 Commit Convention

We follow **[Conventional Commits](https://www.conventionalcommits.org/)**:

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(chat): add voice messages` |
| `fix` | Bug fix | `fix(call): fix audio not working` |
| `docs` | Documentation | `docs(readme): update installation guide` |
| `style` | Code style (formatting) | `style: format with prettier` |
| `refactor` | Code refactoring | `refactor(store): simplify chat store` |
| `perf` | Performance improvement | `perf(ui): memoize chat messages` |
| `test` | Add or update tests | `test(crypto): add encryption tests` |
| `chore` | Build/tooling changes | `chore: update vite to v7` |
| `ci` | CI/CD changes | `ci: add GitHub Actions workflow` |

### Examples

```
feat(chat): add message reactions
fix(call): resolve video quality issue
docs(security): update security policy
refactor(store): extract chat logic to custom hook
```

---

## 🔄 Pull Request Process

### Before Submitting

1. **Check existing PRs** — ensure you're not duplicating work
2. **Update your branch** — rebase on latest `main`
3. **Run tests** — ensure all tests pass
4. **Self-review** — review your own code before submitting

### PR Title Format

```
<type>(<scope>): <description>
```

Example: `feat(chat): add voice message support`

### PR Description Template

```markdown
## Description
<!-- Describe the changes you've made -->

## Related Issue
<!-- Link to the issue this PR addresses -->
Closes #123

## Type of Change
<!-- Check the boxes that apply -->
- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 📝 Documentation update
- [ ] 🧹 Code refactor
- [ ] ⚡ Performance improvement
- [ ] 🧪 Test update

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have self-reviewed my code
- [ ] I have added tests that prove my fix/feature works
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have checked the performance impact

## Screenshots (if UI change)
<!-- Add screenshots to help reviewers -->

## Additional Notes
<!-- Any additional context for reviewers -->
```

### Review Process

1. **At least 1 approval** from a maintainer
2. **All CI checks must pass** (build, lint, type-check)
3. **No merge conflicts** — rebase if needed
4. **Squash and merge** — maintain a clean commit history

---

## 🐛 Reporting Bugs

### Before Submitting a Bug Report

1. **Search existing issues** — it might already be reported
2. **Check the FAQ** — it might be a known limitation
3. **Reproduce with latest version** — it might be fixed

### Bug Report Template

```markdown
## Description
<!-- What happened? -->

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll to '...'
4. See error

## Expected Behavior
<!-- What should have happened? -->

## Actual Behavior
<!-- What actually happened? -->

## Environment
- OS: [e.g., Windows 11, macOS 15]
- Browser: [e.g., Chrome 120, Safari 17]
- Version: [e.g., v1.0.0]

## Screenshots / Console Logs
<!-- If applicable, add screenshots and logs -->

## Additional Context
<!-- Any other relevant information -->
```

---

## 💡 Feature Requests

We welcome feature requests! Please include:

- **Clear description** of the feature
- **Use case** — why is this needed?
- **Alternative solutions** you've considered
- **Any relevant context** (screenshots, mockups)

---

## 🔒 Security Issues

If you discover a security vulnerability, please **DO NOT** open a public issue.

**Contact us directly** by email or through a private security advisory on GitHub.

We take security seriously and will respond to reports promptly.

---

## 🎨 Style Guide

### Imports Order

```typescript
// 1. External libraries
import React, { useEffect, useState } from 'react';
import { create } from 'zustand';
import { v4 as uuid } from 'uuid';

// 2. Internal libraries
import { cn } from '@/utils/cn';
import { useChatStore } from '@/store/chatStore';

// 3. Types
import type { ChatMessage } from '@/types/message.types';

// 4. Components
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

// 5. Styles
import './styles.css';
```

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Component | PascalCase | `ChatWindow.tsx` |
| Hook | camelCase with `use` | `usePeer.ts` |
| Store | camelCase with `Store` | `chatStore.ts` |
| Type | kebab-case with `.types` | `message.types.ts` |
| Utility | camelCase | `date.ts` |

### Component Organization

```tsx
// 1. Imports
// 2. Types/Interfaces
// 3. Helper functions
// 4. Main component
// 5. Sub-components
// 6. Exports
```

---

## 🧪 Testing

### Unit Tests (Coming Soon)

```tsx
// src/lib/crypto/keys.test.ts
import { encryptMessage, decryptMessage, generateSessionKey } from './keys';

describe('Crypto', () => {
  it('should encrypt and decrypt messages correctly', async () => {
    const key = await generateSessionKey('test-room');
    const plain = 'Hello, world!';
    const encrypted = await encryptMessage(plain, key);
    const decrypted = await decryptMessage(encrypted, key);
    expect(decrypted).toBe(plain);
  });
});
```

### Manual Testing Checklist

- [ ] Messages send and receive correctly
- [ ] Encryption works end-to-end
- [ ] Offline queue works
- [ ] File upload and download
- [ ] Voice messages
- [ ] Calls (audio and video)
- [ ] Dark mode
- [ ] Responsive design
- [ ] PWA installation

---

## 📚 Documentation

### Where to Update Documentation

| File | Content |
|------|---------|
| `README.md` | Project overview, features, installation |
| `CONTRIBUTING.md` | How to contribute (this file) |
| `CODE_OF_CONDUCT.md` | Community guidelines |
| `SECURITY.md` | Security policy |
| `LICENSE` | MIT license |
| JSDoc Comments | Code documentation |

### JSDoc Guidelines

```typescript
/**
 * Encrypts a plaintext message using AES-GCM.
 *
 * @param plainText - The plaintext message to encrypt
 * @param key - The AES-GCM session key
 * @returns Base64-encoded string (IV + ciphertext)
 *
 * @example
 * const key = await generateSessionKey('room-123');
 * const encrypted = await encryptMessage('Hello, world!', key);
 */
export async function encryptMessage(
  plainText: string,
  key: CryptoKey
): Promise<string> {
  // ...
}
```

---

## 📄 License

By contributing to Nebula, you agree that your contributions will be licensed under the MIT License.

---

## 💬 Questions?

- **Discussions**: [GitHub Discussions](https://github.com/AmirhosseinAgrest/Nebula/discussions)
- **Issues**: [GitHub Issues](https://github.com/AmirhosseinAgrest/Nebula/issues)
- **Email**: [amirhosseinagrest@gmail.com]

---

<div align="center">
  <strong>Thank you for contributing to Nebula! 🙏</strong>
  <br />
  <sub>— Privacy starts with us.</sub>
</div>