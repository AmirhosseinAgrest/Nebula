import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { initOfflineQueueListener } from "@/lib/sync/queueManager";

// Register the offline-first Service Worker (app shell caching for offline PWA use).
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Non-fatal: the app still works fully online without the SW.
    });
  });
}

// Start listening for reconnection so any queued offline messages auto-flush.
initOfflineQueueListener();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
