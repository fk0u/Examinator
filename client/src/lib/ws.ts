// ─── WebSocket Client ───────────────────────────────────
// Native WebSocket client with auto-reconnect for realtime proctor updates

export type WsMessageHandler = (data: any) => void;

export class ExaminatorWs {
  private ws: WebSocket | null = null;
  private url: string;
  private handlers: Map<string, WsMessageHandler[]> = new Map();
  private reconnectTimer: any = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;

  constructor(url: string = "ws://localhost:5000/ws/proctor") {
    this.url = url;
  }

  /** Connect to WebSocket server */
  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log("🔌 WebSocket connected");
      this.reconnectAttempts = 0;
      this.emit("connected", {});
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data);
      } catch {
        console.error("Failed to parse WS message:", event.data);
      }
    };

    this.ws.onclose = () => {
      console.log("🔌 WebSocket disconnected");
      this.emit("disconnected", {});
      this.tryReconnect();
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  /** Send a typed message */
  send(type: string, payload: Record<string, any> = {}) {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not connected, queueing message");
      return;
    }

    this.ws.send(JSON.stringify({ type, ...payload }));
  }

  /** Register event handler */
  on(type: string, handler: WsMessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
  }

  /** Remove event handler */
  off(type: string, handler: WsMessageHandler) {
    const handlers = this.handlers.get(type);
    if (handlers) {
      this.handlers.set(
        type,
        handlers.filter((h) => h !== handler)
      );
    }
  }

  /** Emit event to handlers */
  private emit(type: string, data: any) {
    const handlers = this.handlers.get(type) || [];
    handlers.forEach((h) => h(data));

    // Also emit to wildcard handlers
    const wildcardHandlers = this.handlers.get("*") || [];
    wildcardHandlers.forEach((h) => h({ type, ...data }));
  }

  /** Try to reconnect */
  private tryReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnect attempts reached");
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      console.log(
        `🔄 Reconnecting (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );
      this.connect();
    }, delay);
  }

  /** Disconnect */
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.maxReconnectAttempts = 0; // Prevent auto-reconnect
    this.ws?.close();
    this.ws = null;
  }
}

// Singleton instance
let wsInstance: ExaminatorWs | null = null;

export function getWsClient(): ExaminatorWs {
  if (!wsInstance) {
    wsInstance = new ExaminatorWs();
  }
  return wsInstance;
}
