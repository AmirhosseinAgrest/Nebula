import Peer, { type DataConnection, type MediaConnection } from "peerjs";
import { ICE_SERVERS } from "@/lib/utils/constants";
import type { WireMessage } from "@/types/wire.types";

type Listener<T> = (payload: T) => void;

/**
 * Tiny type-safe pub/sub used instead of Node's EventEmitter (browser-only runtime).
 */
class Emitter<Events extends Record<string, any>> {
  private listeners: { [K in keyof Events]?: Set<Listener<Events[K]>> } = {};

  on<K extends keyof Events>(event: K, cb: Listener<Events[K]>) {
    if (!this.listeners[event]) this.listeners[event] = new Set();
    this.listeners[event]!.add(cb);
    return () => this.listeners[event]!.delete(cb);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]) {
    this.listeners[event]?.forEach((cb) => cb(payload));
  }
}

interface PeerManagerEvents {
  ready: { id: string };
  data: { message: WireMessage; fromPeerId: string };
  "peer-connected": { peerId: string };
  "peer-disconnected": { peerId: string };
  "incoming-call": { call: MediaConnection };
  error: { error: Error };
}

class PeerManager extends Emitter<PeerManagerEvents> {
  peer: Peer | null = null;
  private connections = new Map<string, DataConnection>();
  private pendingSends = new Map<string, WireMessage[]>();
  myId: string | null = null;

  init(userId: string) {
    if (this.peer && !this.peer.destroyed) return;
    this.myId = userId;

    this.peer = new Peer(userId, {
      config: { iceServers: ICE_SERVERS },
      debug: 1,
    });

    this.peer.on("open", (id) => this.emit("ready", { id }));

    this.peer.on("connection", (conn) => this.registerConnection(conn));

    this.peer.on("call", (call) => this.emit("incoming-call", { call }));

    this.peer.on("error", (err) => {
      // "peer-unavailable" just means the contact is currently offline - not fatal.
      this.emit("error", { error: err as unknown as Error });
    });

    this.peer.on("disconnected", () => {
      // Attempt to reconnect to the signaling broker automatically.
      this.peer?.reconnect();
    });
  }

  private registerConnection(conn: DataConnection) {
    this.connections.set(conn.peer, conn);

    conn.on("open", () => {
      this.emit("peer-connected", { peerId: conn.peer });
      const queued = this.pendingSends.get(conn.peer);
      if (queued) {
        queued.forEach((msg) => conn.send(msg));
        this.pendingSends.delete(conn.peer);
      }
    });

    conn.on("data", (data) => {
      this.emit("data", { message: data as WireMessage, fromPeerId: conn.peer });
    });

    conn.on("close", () => {
      this.connections.delete(conn.peer);
      this.emit("peer-disconnected", { peerId: conn.peer });
    });

    conn.on("error", () => {
      this.connections.delete(conn.peer);
    });
  }

  /** Establish (or reuse) a DataConnection to a remote peer. */
  connectTo(peerId: string): DataConnection | null {
    if (!this.peer || peerId === this.myId) return null;
    const existing = this.connections.get(peerId);
    if (existing && existing.open) return existing;

    const conn = this.peer.connect(peerId, { reliable: true });
    this.registerConnection(conn);
    return conn;
  }

  isConnected(peerId: string): boolean {
    return !!this.connections.get(peerId)?.open;
  }

  /** Send a wire message to one peer, queuing it if the connection isn't open yet. */
  send(peerId: string, message: WireMessage) {
    if (peerId === this.myId) return; // never send to self over the wire
    const conn = this.connectTo(peerId);
    if (conn && conn.open) {
      conn.send(message);
    } else {
      const queue = this.pendingSends.get(peerId) ?? [];
      queue.push(message);
      this.pendingSends.set(peerId, queue);
    }
  }

  broadcast(peerIds: string[], message: WireMessage) {
    peerIds.forEach((id) => this.send(id, message));
  }

  callPeer(peerId: string, stream: MediaStream): MediaConnection | null {
    if (!this.peer) return null;
    return this.peer.call(peerId, stream);
  }

  destroy() {
    this.connections.forEach((c) => c.close());
    this.connections.clear();
    this.peer?.destroy();
    this.peer = null;
  }
}

export const peerManager = new PeerManager();
