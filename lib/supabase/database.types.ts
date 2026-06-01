/** Supabase database types (subset used by the app). */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: "user" | "assistant";
          content: string;
          tokens_used: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: "user" | "assistant";
          content: string;
          tokens_used?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: "user" | "assistant";
          content?: string;
          tokens_used?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      usage_daily: {
        Row: {
          user_id: string;
          date: string;
          message_count: number;
        };
        Insert: {
          user_id: string;
          date?: string;
          message_count?: number;
        };
        Update: {
          user_id?: string;
          date?: string;
          message_count?: number;
        };
        Relationships: [];
      };
      audit_events: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          metadata: Json;
          ip_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          metadata?: Json;
          ip_hash?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          metadata?: Json;
          ip_hash?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      message_feedback: {
        Row: {
          id: string;
          message_id: string;
          user_id: string;
          rating: "helpful" | "not_helpful";
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          user_id: string;
          rating: "helpful" | "not_helpful";
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          user_id?: string;
          rating?: "helpful" | "not_helpful";
          comment?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          title: string;
          storage_path: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          storage_path: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          storage_path?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      document_chunks: {
        Row: {
          id: string;
          document_id: string;
          content: string;
          embedding: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          content: string;
          embedding?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          content?: string;
          embedding?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      match_document_chunks: {
        Args: {
          query_embedding: string;
          match_count?: number;
          match_threshold?: number;
        };
        Returns: {
          id: string;
          document_id: string;
          content: string;
          metadata: Json;
          similarity: number;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type ConversationRow =
  Database["public"]["Tables"]["conversations"]["Row"];
export type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
export type MessageFeedbackRating = "helpful" | "not_helpful";
