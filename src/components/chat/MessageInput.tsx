import { useEffect, useRef, useState } from "react";
import { Mic, Paperclip, Send, Smile, Square, X, Edit3, Reply as ReplyIcon } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { useUIStore } from "@/store/uiStore";
import { fileToBase64 } from "@/lib/utils/file";
import { MAX_FILE_SIZE_BYTES, MAX_VOICE_DURATION_SEC } from "@/lib/utils/constants";
import { formatDuration } from "@/lib/utils/date";
import { cn } from "@/utils/cn";
import { EmojiPicker } from "./EmojiPicker";

interface MessageInputProps {
  roomId: string;
}

export function MessageInput({ roomId }: MessageInputProps) {
  const sendText = useChatStore((s) => s.sendText);
  const sendFile = useChatStore((s) => s.sendFile);
  const sendTypingSignal = useChatStore((s) => s.sendTypingSignal);
  const editMessage = useChatStore((s) => s.editMessage);
  const replyingTo = useUIStore((s) => s.replyingTo);
  const editingMessage = useUIStore((s) => s.editingMessage);
  const setReplyingTo = useUIStore((s) => s.setReplyingTo);
  const setEditingMessage = useUIStore((s) => s.setEditingMessage);
  const showToast = useUIStore((s) => s.showToast);

  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (editingMessage) setText(editingMessage.content);
  }, [editingMessage]);

  function handleTextChange(val: string) {
    setText(val);
    sendTypingSignal(roomId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => sendTypingSignal(roomId, false), 1500);
  }

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (editingMessage) {
      await editMessage(roomId, editingMessage.id, trimmed);
      setEditingMessage(null);
    } else {
      await sendText(roomId, trimmed, replyingTo);
      setReplyingTo(null);
    }
    setText("");
    sendTypingSignal(roomId, false);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_BYTES) {
      showToast("File is too large. Maximum size is 20 MB.", "error");
      return;
    }
    const base64 = await fileToBase64(file);
    await sendFile(roomId, { name: file.name, size: file.size, mime: file.type || "application/octet-stream", data: base64 }, "file");
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const base64 = await fileToBase64(blob);
        const duration = recordSeconds;
        setRecordSeconds(0);
        await sendFile(roomId, { name: "voice-message.webm", size: blob.size, mime: "audio/webm", data: base64 }, "voice", duration);
      };
      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev + 1 >= MAX_VOICE_DURATION_SEC) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      showToast("Microphone access is required to record voice messages.", "error");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
  }

  return (
    <div className="border-t border-black/5 dark:border-white/10 bg-white dark:bg-[#0F0F10] px-4 py-3">
      {(replyingTo || editingMessage) && (
        <div className="mb-2 flex items-center justify-between rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E] px-3 py-2">
          <div className="flex items-center gap-2 text-[13px] text-black dark:text-white">
            {editingMessage ? <Edit3 size={14} className="text-[#007AFF]" /> : <ReplyIcon size={14} className="text-[#007AFF]" />}
            <div>
              <p className="font-medium">{editingMessage ? "Editing message" : `Replying to ${replyingTo?.senderName || "message"}`}</p>
              <p className="max-w-xs truncate text-[#8E8E93]">{editingMessage ? editingMessage.content : replyingTo?.content}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setReplyingTo(null);
              setEditingMessage(null);
              setText("");
            }}
            className="text-[#8E8E93]"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {isRecording ? (
        <div className="flex items-center gap-3 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E] px-4 py-2.5">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
          <span className="flex-1 text-sm text-black dark:text-white">Recording… {formatDuration(recordSeconds)}</span>
          <button onClick={stopRecording} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF3B30] text-white">
            <Square size={16} fill="white" />
          </button>
        </div>
      ) : (
        <div className="flex items-end gap-2">
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#8E8E93] transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Paperclip size={20} />
          </button>

          <div className="relative flex-1">
            <div className="flex items-end gap-1 rounded-3xl bg-[#F2F2F7] dark:bg-[#2C2C2E] px-3 py-1.5">
              <button
                onClick={() => setShowEmoji((v) => !v)}
                className="mb-1.5 flex h-7 w-7 shrink-0 items-center justify-center text-[#8E8E93]"
              >
                <Smile size={19} />
              </button>
              <textarea
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Message"
                rows={1}
                className="max-h-32 flex-1 resize-none bg-transparent py-2 text-[15px] text-black dark:text-white placeholder:text-[#8E8E93] outline-none"
              />
            </div>
            {showEmoji && (
              <EmojiPicker
                onEmojiClick={(emoji) => {
                  setText((t) => t + emoji);
                }}
                onClose={() => setShowEmoji(false)}
              />
            )}
          </div>

          {text.trim() ? (
            <button
              onClick={handleSend}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#007AFF] dark:bg-[#0A84FF] text-white shadow-sm transition-transform active:scale-90"
            >
              <Send size={17} />
            </button>
          ) : (
            <button
              onClick={startRecording}
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-transform active:scale-90 bg-[#007AFF] dark:bg-[#0A84FF]",
              )}
            >
              <Mic size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
