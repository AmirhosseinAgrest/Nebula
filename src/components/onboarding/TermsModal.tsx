import { ShieldCheck, Code2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { APP_NAME, GITHUB_URL } from "@/lib/utils/constants";

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
  onAgree: () => void;
}

export function TermsModal({ open, onClose, onAgree }: TermsModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Terms & Conditions" className="max-w-2xl">
      <div className="space-y-5 text-[15px] leading-relaxed text-black/80 dark:text-white/80">
        <div className="flex items-center gap-2 rounded-xl bg-[#34C759]/10 px-4 py-3 text-[#248A3D] dark:text-[#30D158]">
          <ShieldCheck size={20} />
          <span className="font-medium">
            {APP_NAME} is a fully decentralized, serverless, end-to-end encrypted messenger.
          </span>
        </div>

        <section>
          <h3 className="mb-1 font-semibold text-black dark:text-white">1. Platform Introduction</h3>
          <p>
            {APP_NAME} connects you directly to your contacts using WebRTC (peer-to-peer) technology. There is no
            central chat server, no backend API, and no cloud database. A minimal public signaling broker is used only
            to help two devices discover each other's network address to open a direct connection — it never sees,
            stores, or relays your messages, files, or calls.
          </p>
        </section>

        <section>
          <h3 className="mb-1 font-semibold text-black dark:text-white">2. Privacy Policy</h3>
          <p>
            All of your data — messages, contacts, media, settings — is stored exclusively on your own device inside
            your browser's IndexedDB storage. We do not collect, transmit, or have access to any of your personal
            information. Every message is encrypted end-to-end using AES-GCM before it ever leaves your device.
            Uninstalling the app or clearing your browser storage permanently deletes your local data — there is no
            server-side backup, by design.
          </p>
        </section>

        <section>
          <h3 className="mb-1 font-semibold text-black dark:text-white">3. User Obligations</h3>
          <p>By using {APP_NAME}, you agree that you will not:</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>Use the platform for illegal activity of any kind.</li>
            <li>Harass, threaten, or abuse other users.</li>
            <li>Send spam, malware, or unsolicited bulk messages.</li>
            <li>Attempt to compromise the security, privacy, or devices of other users.</li>
          </ul>
        </section>

        <section>
          <h3 className="mb-1 font-semibold text-black dark:text-white">4. Age Restriction</h3>
          <p>
            By using {APP_NAME}, you confirm that you are at least the minimum age required to use digital services in
            your country of residence.
          </p>
        </section>

        <section>
          <h3 className="mb-1 font-semibold text-black dark:text-white">5. Open Source</h3>
          <p className="flex flex-wrap items-center gap-2">
            This project is fully open-source. You are welcome to audit, fork, and contribute to the source code.
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-[#007AFF] dark:text-[#0A84FF] hover:underline"
            >
              <Code2 size={16} /> View on GitHub
            </a>
          </p>
        </section>

        <section>
          <h3 className="mb-1 font-semibold text-black dark:text-white">6. Responsibilities & Liability</h3>
          <p>
            You are solely responsible for the content you send and receive. Since {APP_NAME} has no visibility into
            any communication, the development team cannot and does not moderate content, and is not liable for any
            misuse of the platform by its users.
          </p>
        </section>

        <Button className="w-full" size="lg" onClick={onAgree}>
          <ShieldCheck size={18} /> I Agree
        </Button>
      </div>
    </Modal>
  );
}