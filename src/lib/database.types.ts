export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          name: string
          phone: string | null
          company: string | null
          source: string | null
          status: 'lead' | 'following' | 'high_intent' | 'closed' | 'lost'
          owner_id: string | null
          ai_score: number
          last_contact_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
          is_public: boolean
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          company?: string | null
          source?: string | null
          status?: 'lead' | 'following' | 'high_intent' | 'closed' | 'lost'
          owner_id?: string | null
          ai_score?: number
          last_contact_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          is_public?: boolean
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          company?: string | null
          source?: string | null
          status?: 'lead' | 'following' | 'high_intent' | 'closed' | 'lost'
          owner_id?: string | null
          ai_score?: number
          last_contact_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          is_public?: boolean
        }
      }
      interactions: {
        Row: {
          id: string
          customer_id: string
          user_id: string
          content: string
          type: 'phone' | 'wechat' | 'meeting' | 'email' | 'other'
          ai_suggested_reply: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          user_id: string
          content: string
          type?: 'phone' | 'wechat' | 'meeting' | 'email' | 'other'
          ai_suggested_reply?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          user_id?: string
          content?: string
          type?: 'phone' | 'wechat' | 'meeting' | 'email' | 'other'
          ai_suggested_reply?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      public_pool: {
        Row: {
          id: string
          name: string
          phone: string | null
          company: string | null
          source: string | null
          ai_score: number
          last_contact_at: string | null
          created_at: string
        }
      }
    }
    Functions: {
      move_to_public_pool: {
        Args: Record<string, never>
        Returns: void
      }
      claim_customer: {
        Args: {
          customer_id: string
        }
        Returns: void
      }
      calculate_ai_score: {
        Args: {
          customer_id: string
        }
        Returns: number
      }
    }
  }
}
