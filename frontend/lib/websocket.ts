type MessageHandler = (data: unknown) => void;
type ConnectionHandler = (connected: boolean) => void;

const MAX_RECONNECT_MS = 30_000;
const BASE_RECONNECT_MS = 1500;

class ChatWebSocket {
  private ws: WebSocket | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  /** When true, socket was closed on purpose — do not auto-reconnect. */
  private intentionalClose = false;
  private lastToken: string | null = null;
  private reconnectAttempt = 0;

  private emitConnection(connected: boolean): void {
    this.connectionHandlers.forEach((h) => {
      try {
        h(connected);
      } catch {
        /* ignore */
      }
    });
  }

  /** True when the chat socket is open and sends will work. */
  isReady(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  connect(token: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.intentionalClose = false;
    this.lastToken = token;

    const wsUrl = (process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:4000') + `/ws/chat?token=${token}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handlers.forEach((h) => h(data));
      } catch {
        // ignore malformed messages
      }
    };

    this.ws.onopen = () => {
      this.reconnectAttempt = 0;
      this.emitConnection(true);
    };

    this.ws.onclose = () => {
      this.ws = null;
      this.emitConnection(false);
      if (this.intentionalClose) return;
      const delay = Math.min(
        BASE_RECONNECT_MS * Math.pow(2, this.reconnectAttempt),
        MAX_RECONNECT_MS
      );
      this.reconnectAttempt += 1;
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        if (this.lastToken && !this.intentionalClose) this.connect(this.lastToken);
      }, delay);
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  disconnect(): void {
    this.intentionalClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempt = 0;
    this.ws?.close();
    this.ws = null;
    this.emitConnection(false);
  }

  send(type: 'direct' | 'group', conversationId: string, content: string): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    const trimmed = content.trim();
    if (!trimmed) return;
    this.ws.send(JSON.stringify({ type, conversationId, content: trimmed }));
  }

  onMessage(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  /** Subscribe to connection up/down (for UI status). */
  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }
}

// Singleton
export const chatWS = new ChatWebSocket();
