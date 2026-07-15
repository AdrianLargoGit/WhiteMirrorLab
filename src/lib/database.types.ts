export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type AppLanguage = 'es' | 'en'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string
          avatar_url: string | null
          country: string | null
          preferred_language: AppLanguage | null
          karma_score: number
          votes_received_positive: number
          votes_received_negative: number
          is_bot: boolean
          accepted_terms_version: string | null
          accepted_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'karma_score' | 'votes_received_positive' | 'votes_received_negative' | 'is_bot' | 'created_at'> & {
          karma_score?: number
          votes_received_positive?: number
          votes_received_negative?: number
          is_bot?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      posts: {
        Row: {
          id: string
          user_id: string
          image_url: string
          caption: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['posts']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['posts']['Insert']>
      }
      stories: {
        Row: {
          id: string
          user_id: string
          media_url: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['stories']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['stories']['Insert']>
      }
      votes: {
        Row: {
          id: string
          voter_id: string
          receiver_id: string        // 🔴 Actualizado: El usuario que recibe el voto/karma
          pulse_id: string | null    // 🔴 Actualizado: ID del pulse si es un voto a un pulse
          posts_id: string | null    // 🔴 Actualizado: ID del post/foto si es un voto a una foto
          vote_type: 1 | -1
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['votes']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
          pulse_id?: string | null
          posts_id?: string | null
        }
        Update: Partial<Database['public']['Tables']['votes']['Insert']>
      }
      behavioral_analytics: {
        Row: {
          id: string
          session_hash_id: string
          country: string | null
          event_type: string
          target_post_id: string | null
          target_pulse_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['behavioral_analytics']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['behavioral_analytics']['Insert']>
      }
      pulses: {
        Row: {
          id: string
          user_id: string
          body: string
          reply_to_id: string | null
          reply_count: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['pulses']['Row'], 'id' | 'reply_count' | 'created_at'> & {
          id?: string
          reply_count?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['pulses']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      app_language: AppLanguage
    }
  }
}

export type Profile     = Database['public']['Tables']['profiles']['Row']
export type Post        = Database['public']['Tables']['posts']['Row']
export type Story       = Database['public']['Tables']['stories']['Row']
export type Pulse       = Database['public']['Tables']['pulses']['Row']

export type PulseWithProfile  = Pulse & { profile: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'karma_score'> }

export type VoteType = 1 | -1
