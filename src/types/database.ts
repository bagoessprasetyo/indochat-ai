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
          email: string
          business_name: string
          business_type: string
          phone_number: string | null
          address: string | null
          city: string | null
          province: string | null
          postal_code: string | null
          subscription_plan: 'starter' | 'professional' | 'enterprise'
          subscription_status: 'active' | 'inactive' | 'trial' | 'cancelled'
          trial_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          business_name: string
          business_type: string
          phone_number?: string | null
          address?: string | null
          city?: string | null
          province?: string | null
          postal_code?: string | null
          subscription_plan?: 'starter' | 'professional' | 'enterprise'
          subscription_status?: 'active' | 'inactive' | 'trial' | 'cancelled'
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          business_name?: string
          business_type?: string
          phone_number?: string | null
          address?: string | null
          city?: string | null
          province?: string | null
          postal_code?: string | null
          subscription_plan?: 'starter' | 'professional' | 'enterprise'
          subscription_status?: 'active' | 'inactive' | 'trial' | 'cancelled'
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chatbots: {
        Row: {
          id: string
          profile_id: string
          name: string
          whatsapp_phone_number: string
          whatsapp_phone_number_id: string
          whatsapp_business_account_id: string
          welcome_message: string
          fallback_message: string
          business_hours_start: string | null
          business_hours_end: string | null
          timezone: string
          is_active: boolean
          ai_model: 'gemini' | 'openai'
          response_tone: 'formal' | 'casual' | 'friendly'
          max_response_length: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          name: string
          whatsapp_phone_number: string
          whatsapp_phone_number_id: string
          whatsapp_business_account_id: string
          welcome_message: string
          fallback_message: string
          business_hours_start?: string | null
          business_hours_end?: string | null
          timezone?: string
          is_active?: boolean
          ai_model?: 'gemini' | 'openai'
          response_tone?: 'formal' | 'casual' | 'friendly'
          max_response_length?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          name?: string
          whatsapp_phone_number?: string
          whatsapp_phone_number_id?: string
          whatsapp_business_account_id?: string
          welcome_message?: string
          fallback_message?: string
          business_hours_start?: string | null
          business_hours_end?: string | null
          timezone?: string
          is_active?: boolean
          ai_model?: 'gemini' | 'openai'
          response_tone?: 'formal' | 'casual' | 'friendly'
          max_response_length?: number
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          chatbot_id: string
          customer_phone: string
          customer_name: string | null
          status: 'active' | 'closed' | 'transferred'
          last_message_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chatbot_id: string
          customer_phone: string
          customer_name?: string | null
          status?: 'active' | 'closed' | 'transferred'
          last_message_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chatbot_id?: string
          customer_phone?: string
          customer_name?: string | null
          status?: 'active' | 'closed' | 'transferred'
          last_message_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          whatsapp_message_id: string | null
          sender_type: 'customer' | 'bot' | 'agent'
          content: string
          message_type: 'text' | 'image' | 'document' | 'audio' | 'video'
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          whatsapp_message_id?: string | null
          sender_type: 'customer' | 'bot' | 'agent'
          content: string
          message_type?: 'text' | 'image' | 'document' | 'audio' | 'video'
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          whatsapp_message_id?: string | null
          sender_type?: 'customer' | 'bot' | 'agent'
          content?: string
          message_type?: 'text' | 'image' | 'document' | 'audio' | 'video'
          metadata?: Json | null
          created_at?: string
        }
      }
      knowledge_base: {
        Row: {
          id: string
          chatbot_id: string
          question: string
          answer: string
          category: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chatbot_id: string
          question: string
          answer: string
          category?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chatbot_id?: string
          question?: string
          answer?: string
          category?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          profile_id: string
          name: string
          description: string | null
          price: number
          currency: string
          sku: string | null
          stock_quantity: number | null
          category: string | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          name: string
          description?: string | null
          price: number
          currency?: string
          sku?: string | null
          stock_quantity?: number | null
          category?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          name?: string
          description?: string | null
          price?: number
          currency?: string
          sku?: string | null
          stock_quantity?: number | null
          category?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          profile_id: string
          conversation_id: string | null
          customer_phone: string
          customer_name: string | null
          customer_address: string | null
          total_amount: number
          currency: string
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method: string | null
          midtrans_order_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          conversation_id?: string | null
          customer_phone: string
          customer_name?: string | null
          customer_address?: string | null
          total_amount: number
          currency?: string
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method?: string | null
          midtrans_order_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          conversation_id?: string | null
          customer_phone?: string
          customer_name?: string | null
          customer_address?: string | null
          total_amount?: number
          currency?: string
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method?: string | null
          midtrans_order_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workflows: {
        Row: {
          id: string
          profile_id: string
          name: string
          description: string | null
          n8n_workflow_id: string
          trigger_type: 'webhook' | 'schedule' | 'manual'
          trigger_config: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          name: string
          description?: string | null
          n8n_workflow_id: string
          trigger_type?: 'webhook' | 'schedule' | 'manual'
          trigger_config?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          name?: string
          description?: string | null
          n8n_workflow_id?: string
          trigger_type?: 'webhook' | 'schedule' | 'manual'
          trigger_config?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      conversation_analytics: {
        Row: {
          id: string
          profile_id: string
          date: string
          total_conversations: number
          total_messages: number
          avg_response_time: number | null
          customer_satisfaction: number | null
          conversion_rate: number | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          date: string
          total_conversations?: number
          total_messages?: number
          avg_response_time?: number | null
          customer_satisfaction?: number | null
          conversion_rate?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          date?: string
          total_conversations?: number
          total_messages?: number
          avg_response_time?: number | null
          customer_satisfaction?: number | null
          conversion_rate?: number | null
          created_at?: string
        }
      }
      usage_tracking: {
        Row: {
          id: string
          profile_id: string
          feature_name: string
          usage_count: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          feature_name: string
          usage_count?: number
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          feature_name?: string
          usage_count?: number
          date?: string
          created_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}