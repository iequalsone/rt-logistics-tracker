import { useEffect, useRef } from "react";

export interface WebSocketOptions {
  onMessage: (data: unknown) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (err: Event) => void;
  url: string;
}

export function useWebSocket({
  url,
  onMessage,
  onOpen,
  onClose,
  onError,
}: WebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let shouldReconnect = true;

    function connect() {
      ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onopen = () => {
        onOpen?.();
      };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch {
          // ignore parse errors
        }
      };
      ws.onerror = (err) => {
        onError?.(err);
      };
      ws.onclose = () => {
        onClose?.();
        if (shouldReconnect) {
          reconnectTimeout = setTimeout(connect, 2000);
        }
      };
    }
    connect();
    return () => {
      shouldReconnect = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, [url]);

  return wsRef;
}
