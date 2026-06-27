/**
 * Shared type definitions for the Voice Agent dashboard.
 * These mirror the backend Pydantic models.
 */

export type IntentType =
  | "book_room"
  | "send_email"
  | "search_web"
  | "open_url"
  | "calendar_add"
  | "play_music"
  | "clarify"
  | "general"
  | string;

export interface ExtractedEntities {
  date?:     string;
  time?:     string;
  task?:     string;
  location?: string;
  person?:   string;
  subject?:  string;
  url?:      string;
  [key: string]: string | undefined;
}

export interface AgentResponse {
  intent:     IntentType;
  confidence: number;
  entities:   ExtractedEntities;
  reply:      string;
  action?:    "navigate" | "click" | "type" | "wait" | "done";
  action_url?: string;
  latency_ms?: number;
}

export interface MissionRecord {
  id:        string;
  command:   string;
  response:  AgentResponse;
  timestamp: string;
  status:    "success" | "clarify" | "failed";
}
