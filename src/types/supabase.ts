// types/supabase.ts

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
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          full_name: string | null
          avatar_url: string | null
          email: string | null
          bio: string | null
          website: string | null
          linkedin_url: string | null
          github_url: string | null
          twitter_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string | null
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
          bio?: string | null
          website?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          twitter_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string | null
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
          bio?: string | null
          website?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          twitter_url?: string | null
        }
      }
      portfolios: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          user_id: string
          title: string
          description: string | null
          published: boolean
          theme: string | null
          custom_domain: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string | null
          user_id: string
          title: string
          description?: string | null
          published?: boolean
          theme?: string | null
          custom_domain?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string | null
          user_id?: string
          title?: string
          description?: string | null
          published?: boolean
          theme?: string | null
          custom_domain?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          portfolio_id: string
          title: string
          description: string | null
          image_url: string | null
          project_url: string | null
          github_url: string | null
          technologies: string[] | null
          order_index: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string | null
          portfolio_id: string
          title: string
          description?: string | null
          image_url?: string | null
          project_url?: string | null
          github_url?: string | null
          technologies?: string[] | null
          order_index?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string | null
          portfolio_id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          project_url?: string | null
          github_url?: string | null
          technologies?: string[] | null
          order_index?: number
        }
      }
      resumes: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          user_id: string
          title: string
          content: Json
          is_primary: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string | null
          user_id: string
          title: string
          content: Json
          is_primary?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string | null
          user_id?: string
          title?: string
          content?: Json
          is_primary?: boolean
        }
      }
      cover_letters: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          user_id: string
          title: string
          content: string
          job_title: string | null
          company: string | null
          tone: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string | null
          user_id: string
          title: string
          content: string
          job_title?: string | null
          company?: string | null
          tone?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string | null
          user_id?: string
          title?: string
          content?: string
          job_title?: string | null
          company?: string | null
          tone?: string | null
        }
      }
      mock_interviews: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          user_id: string
          job_title: string
          questions: Json | null
          answers: Json | null
          feedback: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string | null
          user_id: string
          job_title: string
          questions?: Json | null
          answers?: Json | null
          feedback?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string | null
          user_id?: string
          job_title?: string
          questions?: Json | null
          answers?: Json | null
          feedback?: Json | null
        }
      }
      job_alerts: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          user_id: string
          job_title: string
          location: string | null
          keywords: string[] | null
          frequency: string
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string | null
          user_id: string
          job_title: string
          location?: string | null
          keywords?: string[] | null
          frequency?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string | null
          user_id?: string
          job_title?: string
          location?: string | null
          keywords?: string[] | null
          frequency?: string
          is_active?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
