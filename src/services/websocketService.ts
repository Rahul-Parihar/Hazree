/**
 * WebSocket Service for Hazree Customer / Employee Portal
 * Handles real-time event streaming for attendance punches, HR overrides, and status updates.
 */

type WebSocketCallback = (event: any) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Set<WebSocketCallback> = new Set();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private isConnecting: boolean = false;

  private getWebSocketUrl(): string {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const wsProto = apiUrl.startsWith('https') ? 'wss:' : 'ws:';
    const cleanHost = apiUrl.replace(/^https?:\/\//, '');
    return `${wsProto}//${cleanHost}/ws/attendance`;
  }

  public connect(companyId?: string | number, employeeId?: string | number) {
    if (typeof window === 'undefined') return;
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    let connectUrl = this.getWebSocketUrl();
    const params = new URLSearchParams();
    if (companyId) params.append('company_id', String(companyId).replace('cmp_', ''));
    if (employeeId) params.append('employee_id', String(employeeId).replace('emp_', ''));
    const qs = params.toString();
    if (qs) connectUrl += `?${qs}`;

    this.isConnecting = true;

    try {
      this.socket = new WebSocket(connectUrl);

      this.socket.onopen = () => {
        this.isConnecting = false;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }

        // Heartbeat ping every 25 seconds
        this.pingTimer = setInterval(() => {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: 'PING' }));
          }
        }, 25000);
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          this.listeners.forEach((callback) => {
            try {
              callback(parsed);
            } catch (err) {
              console.error('Error in Customer WS event callback:', err);
            }
          });
        } catch (e) {
          // Non-JSON message
        }
      };

      this.socket.onerror = () => {
        // Socket error handled in onclose
      };

      this.socket.onclose = () => {
        this.isConnecting = false;
        if (this.pingTimer) {
          clearInterval(this.pingTimer);
          this.pingTimer = null;
        }
        // Auto-reconnect after 3 seconds
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect(companyId, employeeId);
          }, 3000);
        }
      };
    } catch (e) {
      this.isConnecting = false;
    }
  }

  public subscribe(callback: WebSocketCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const wsService = new WebSocketService();
