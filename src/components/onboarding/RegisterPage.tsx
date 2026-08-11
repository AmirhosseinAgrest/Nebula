import { useState } from "react";
import { v4 as uuid } from "uuid";
import { Camera, Lock, ShieldCheck } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { TermsModal } from "@/components/onboarding/TermsModal";
import { Avatar } from "@/components/ui/Avatar";
import { fileToBase64 } from "@/lib/utils/file";
import { isValidBio, isValidDisplayName } from "@/lib/utils/validation";
import { APP_NAME, APP_TAGLINE } from "@/lib/utils/constants";

export function RegisterPage() {
  const register = useUserStore((s) => s.register);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [touched, setTouched] = useState(false);

  const nameValid = isValidDisplayName(name);
  const bioValid = isValidBio(bio);
  const canSubmit = nameValid && bioValid && agreed;

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setAvatar(base64);
  }

  function handleSubmit() {
    setTouched(true);
    if (!canSubmit) return;
    register({ id: uuid(), displayName: name.trim(), bio: bio.trim(), avatar });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F2F2F7] dark:bg-black px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1C1C1E] p-8 shadow-2xl shadow-black/5">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#007AFF] to-[#5856D6] shadow-lg shadow-blue-500/30">
            <Lock className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-[#8E8E93]">{APP_TAGLINE}</p>
        </div>

        <div className="mb-6 flex justify-center">
          <label className="group relative cursor-pointer">
            <Avatar name={name || "?"} src={avatar} size={92} />
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-all group-hover:bg-black/30">
              <Camera className="text-white opacity-0 transition-opacity group-hover:opacity-100" size={22} />
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
              Display Name <span className="text-[#FF3B30]">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              maxLength={50}
            />
            {touched && !nameValid && (
              <p className="mt-1 text-xs text-[#FF3B30]">Name must be between 3 and 50 characters.</p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-medium text-black dark:text-white">Bio</label>
              <span className="text-xs text-[#8E8E93]">{bio.length}/150</span>
            </div>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 150))}
              placeholder="Tell people a little about yourself (optional)"
              rows={3}
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 pt-2">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[#007AFF]"
            />
            <span className="text-sm text-black/70 dark:text-white/70">
              I agree to the{" "}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="font-medium text-[#007AFF] dark:text-[#0A84FF] hover:underline"
              >
                Terms & Conditions
              </button>
            </span>
          </label>

          <Button size="lg" className="mt-2 w-full" disabled={!canSubmit} onClick={handleSubmit}>
            Get Started
          </Button>

          <div className="flex items-center justify-center gap-1.5 pt-2 text-xs text-[#8E8E93]">
            <ShieldCheck size={14} className="text-[#34C759]" />
            No servers. No sign-up. Your identity never leaves this device unencrypted.
          </div>
        </div>
      </div>

      <TermsModal
        open={showTerms}
        onClose={() => setShowTerms(false)}
        onAgree={() => {
          setAgreed(true);
          setShowTerms(false);
        }}
      />
    </div>
  );
}
