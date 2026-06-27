"use client";
import { useEffect, useRef, useCallback, useState } from "react";

export type WSMessage =
  | { type: "heard";   text: string }
  | { type: "think";   intent: string; confidence: number; entities: Record<string, string>; latency_ms?: number; reply?: string }
  | { type: "action";  url: string }
  | { type: "result";  text: string }
  | { type: "error";   text: string }
  | { type: "clarify"; text: string }
  | { type: "screenshot"; data: string }     // base64 PNG
  | { type: "pong" };

interface UseAgentWSOptions {
  url: string;
  onMessage: (msg: WSMessage) => void;
  autoReconnect?: boolean;
}

export function useAgentWS({ url, onMessage, autoReconnect = true }: UseAgentWSOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        // Start heartbeat
        const hb = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "ping" }));
          else clearInterval(hb);
        }, 20_000);
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data) as WSMessage;
          onMessageRef.current(msg);
        } catch { /* ignore malformed */ }
      };

      ws.onclose = () => {
        setConnected(false);
        if (autoReconnect) setTimeout(connect, 3000);
      };

      ws.onerror = () => ws.close();
    } catch { /* WS not available yet */ }
  }, [url, autoReconnect]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect on unmount
        wsRef.current.close();
      }
    };
  }, [connect]);

  const send = useCallback((data: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { connected, send };
}
