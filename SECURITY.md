# Security Policy

**Nebula** takes security and privacy very seriously. As a peer-to-peer, end-to-end encrypted messenger, we understand that the trust our users place in us depends entirely on the security of the application.

This document outlines our security philosophy, reporting procedures, and best practices for users.

---

## 🛡️ Security Philosophy

Nebula is built on the principle of **Zero Trust** — we assume that no infrastructure or network is safe, and all communication must be encrypted end-to-end.

### Core Security Principles

| Principle | Implementation |
|-----------|----------------|
| **End-to-End Encryption** | All messages, files, and calls are encrypted with AES-GCM before leaving your device |
| **No Server Storage** | Your data never leaves your device — all storage is local (IndexedDB) |
| **No Backend** | There is no central server to compromise or breach |
| **Encryption at Rest** | All local data is encrypted before being stored in IndexedDB |
| **Zero Knowledge** | We have no access to your messages, contacts, or files |
| **Open Source** | All code is publicly auditable |

---

## 🔐 Encryption Standards

| Algorithm | Usage |
|-----------|-------|
| **AES-GCM** | Symmetric encryption for messages, files, and calls (256-bit) |
| **PBKDF2** | Key derivation from room IDs (150,000 iterations, SHA-256) |
| **RSA-OAEP** | Optional public-key encryption for session key exchange (2048-bit) |
| **SHA-256** | Cryptographic hashing |

### What is Encrypted?

| Data Type | In Transit | At Rest |
|-----------|------------|---------|
| Text Messages | ✅ AES-GCM | ✅ AES-GCM |
| Files | ✅ AES-GCM | ✅ AES-GCM |
| Voice Messages | ✅ AES-GCM | ✅ AES-GCM |
| Media Calls | ✅ SRTP (WebRTC) | ❌ Not stored |
| Metadata (room IDs, member lists) | ⚠️ Shared via DataChannel | ✅ IndexedDB |
| Contact Information | ⚠️ Shared via DataChannel | ✅ IndexedDB |

---

## 🔍 Reporting a Vulnerability

### If You Discover a Security Vulnerability

**Please DO NOT** open a public issue on GitHub.

Instead, follow these steps:

### 📧 Step 1: Contact Us Directly

**Email:** [amirhosseinagrest@gmail.com]

**Encryption (PGP):** (Optional — provide your PGP key if available)

### 📋 Step 2: Provide Details

Please include as much information as possible:

```
Vulnerability Report
=====================

**Type:** [e.g., Remote Code Execution, Information Disclosure, DoS]
**Version:** [e.g., v1.0.0]
**Description:** [What is the vulnerability?]
**Steps to Reproduce:**
1. ...
2. ...
3. ...
**Impact:** [What could an attacker do?]
**Suggested Fix:** [Optional]
**Proof of Concept:** [Attach if available]
```

### ⏱️ Step 3: Response Timeline

| Timeframe | Action |
|-----------|--------|
| **24 hours** | Acknowledgment of receipt |
| **72 hours** | Initial assessment and severity classification |
| **7 days** | Fix or mitigation plan (if applicable) |
| **30 days** | Public disclosure (after fix) |

We follow **responsible disclosure** and will work with you to coordinate public disclosure after the issue has been addressed.

---

## 🛡️ Vulnerability Disclosure Policy

### What We Promise

- ✅ **Timely response** — we will acknowledge receipt within 24 hours
- ✅ **Transparent communication** — we will keep you updated on progress
- ✅ **Public acknowledgment** — we will credit researchers who responsibly disclose vulnerabilities (with consent)
- ✅ **Fix within reasonable timeframe** — we prioritize security fixes

### What We Ask

- ❌ **Do NOT** exploit the vulnerability for any reason
- ❌ **Do NOT** disclose the vulnerability publicly until we have released a fix
- ✅ **Do** provide detailed information to help us reproduce and fix the issue
- ✅ **Do** allow us time to investigate and patch

---

## 🧪 Security Best Practices for Users

### ✅ Recommended Practices

| Practice | Why |
|----------|-----|
| **Use a strong backup passphrase** | Your chat history is encrypted with this passphrase — choose something memorable but hard to guess |
| **Share your Peer ID carefully** | Anyone with your Peer ID can message you — only share with trusted contacts |
| **Keep your browser updated** | Security patches are regularly released for modern browsers |
| **Clear your data when done** | If you're using a shared device, clear IndexedDB data after use |
| **Use private browsing** | For an extra layer of privacy, use incognito/private mode |
| **Report suspicious behavior** | If you receive unexpected messages, block the user and report |

### ❌ Practices to Avoid

| Practice | Why |
|----------|-----|
| **Sharing your Peer ID publicly** | Anyone with your Peer ID can message you |
| **Using the same passphrase everywhere** | Use unique passphrases for different services |
| **Ignoring security warnings** | Pay attention to browser security warnings |
| **Downloading from untrusted sources** | Only use the official GitHub repository |

---

## 🧑‍💻 Security for Developers

### Code Security Guidelines

When contributing code, please follow these guidelines:

#### 1. Cryptographic Operations
- **Use only the Web Crypto API** — do not implement custom cryptography
- **Never hardcode keys** — all keys must be generated or derived at runtime
- **Validate all inputs** — sanitize user input before processing

#### 2. Data Storage
- **Encrypt data before storing** — use the `messageRepo` and `crypto` layers
- **Never store plaintext secrets** — all sensitive data must be encrypted
- **Use Dexie for IndexedDB** — do not use localStorage for sensitive data

#### 3. Network Communication
- **All messages must be encrypted** — never send plaintext over DataChannel
- **Validate message origins** — ensure messages come from expected peers
- **Handle errors gracefully** — don't leak information through error messages

#### 4. Input Validation
- **Sanitize all user input** — prevent XSS and injection attacks
- **Validate Peer IDs** — ensure they match expected format
- **File size limits** — enforce maximum file size (20 MB)

### Code Review Checklist

- [ ] Does this change introduce any security vulnerabilities?
- [ ] Are all cryptographic operations using the Web Crypto API?
- [ ] Is all sensitive data encrypted before storage?
- [ ] Are all inputs properly validated?
- [ ] Are error messages informative without exposing sensitive information?
- [ ] Has the code been reviewed for injection vulnerabilities?

---

## 🔄 Security Updates

### Where We Announce Security Updates

- **GitHub Releases** — [https://github.com/AmirhosseinAgrest/Nebula/releases](https://github.com/AmirhosseinAgrest/Nebula/releases)
- **Security Advisories** — GitHub Security Advisories

### How to Stay Informed

1. **Watch the repository** on GitHub
2. **Subscribe to releases** notifications
3. **Follow the project** on social media (if available)

---

## 🧪 Security Audits

As an open-source project, we encourage independent security audits and researchers to review our code.

### Current Audit Status

| Audit | Status |
|-------|--------|
| **Internal Code Review** | ✅ Ongoing |
| **Community Review** | ✅ Encouraged |
| **Third-Party Audit** | ⏳ Planned (community-funded) |

If you are a security researcher interested in auditing the code, please contact us at [amirhosseinagrest@gmail.com].

---

## 🏆 Responsible Disclosure Acknowledgments

We thank the following security researchers for their responsible disclosure contributions:

*— This list is currently empty. We'll update it as we receive reports.*

---

## 📄 License

This security policy is released under the MIT License and can be freely used and adapted by other projects.

---

## 📞 Contact

- **Security Reports:** [amirhosseinagrest@gmail.com]
- **GitHub Issues:** [https://github.com/AmirhosseinAgrest/Nebula/issues](https://github.com/AmirhosseinAgrest/Nebula/issues) (for non-security bugs only)
- **GitHub Security Advisories:** [https://github.com/AmirhosseinAgrest/Nebula/security](https://github.com/AmirhosseinAgrest/Nebula/security)

---

<div align="center">
  <strong>Security is not a feature — it's a fundamental right. 🔐</strong>
</div>