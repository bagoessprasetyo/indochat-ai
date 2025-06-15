export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chatbots: {
        Row: {
          ai_personality: string | null
          auto_reply_enabled: boolean | null
          business_description: string | null
          business_hours: Json | null
          created_at: string | null
          human_handover_keywords: string[] | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
          whatsapp_business_account_id: string | null
          whatsapp_number: string | null
        }
        Insert: {
          ai_personality?: string | null
          auto_reply_enabled?: boolean | null
          business_description?: string | null
          business_hours?: Json | null
          created_at?: string | null
          human_handover_keywords?: string[] | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
          whatsapp_business_account_id?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          ai_personality?: string | null
          auto_reply_enabled?: boolean | null
          business_description?: string | null
          business_hours?: Json | null
          created_at?: string | null
          human_handover_keywords?: string[] | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
          whatsapp_business_account_id?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_analytics: {
        Row: {
          ai_resolution_rate: number | null
          avg_response_time_seconds: number | null
          chatbot_id: string | null
          conversion_rate: number | null
          created_at: string | null
          customer_satisfaction_avg: number | null
          date: string
          id: string
          revenue_generated: number | null
          top_intents: Json | null
          total_conversations: number | null
          total_messages: number | null
        }
        Insert: {
          ai_resolution_rate?: number | null
          avg_response_time_seconds?: number | null
          chatbot_id?: string | null
          conversion_rate?: number | null
          created_at?: string | null
          customer_satisfaction_avg?: number | null
          date: string
          id?: string
          revenue_generated?: number | null
          top_intents?: Json | null
          total_conversations?: number | null
          total_messages?: number | null
        }
        Update: {
          ai_resolution_rate?: number | null
          avg_response_time_seconds?: number | null
          chatbot_id?: string | null
          conversion_rate?: number | null
          created_at?: string | null
          customer_satisfaction_avg?: number | null
          date?: string
          id?: string
          revenue_generated?: number | null
          top_intents?: Json | null
          total_conversations?: number | null
          total_messages?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_analytics_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assigned_to_human: boolean | null
          chatbot_id: string | null
          created_at: string | null
          customer_name: string | null
          customer_phone: string
          customer_profile_pic_url: string | null
          id: string
          last_message_at: string | null
          metadata: Json | null
          satisfaction_feedback: string | null
          satisfaction_rating: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to_human?: boolean | null
          chatbot_id?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone: string
          customer_profile_pic_url?: string | null
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          satisfaction_feedback?: string | null
          satisfaction_rating?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to_human?: boolean | null
          chatbot_id?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string
          customer_profile_pic_url?: string | null
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          satisfaction_feedback?: string | null
          satisfaction_rating?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          answer: string
          category: string | null
          chatbot_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          keywords: string[] | null
          question: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          answer: string
          category?: string | null
          chatbot_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          question: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          answer?: string
          category?: string | null
          chatbot_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          question?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          ai_confidence_score: number | null
          ai_generated: boolean | null
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          intent_detected: string | null
          is_from_customer: boolean
          media_url: string | null
          message_type: string | null
          processing_time_ms: number | null
          timestamp: string | null
          whatsapp_message_id: string | null
        }
        Insert: {
          ai_confidence_score?: number | null
          ai_generated?: boolean | null
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          intent_detected?: string | null
          is_from_customer: boolean
          media_url?: string | null
          message_type?: string | null
          processing_time_ms?: number | null
          timestamp?: string | null
          whatsapp_message_id?: string | null
        }
        Update: {
          ai_confidence_score?: number | null
          ai_generated?: boolean | null
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          intent_detected?: string | null
          is_from_customer?: boolean
          media_url?: string | null
          message_type?: string | null
          processing_time_ms?: number | null
          timestamp?: string | null
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          chatbot_id: string | null
          conversation_id: string | null
          created_at: string | null
          customer_address: string | null
          customer_name: string | null
          customer_phone: string
          discount_amount: number | null
          id: string
          notes: string | null
          order_number: string
          payment_link: string | null
          payment_method: string | null
          payment_reference: string | null
          payment_status: string | null
          products: Json
          shipping_cost: number | null
          shipping_method: string | null
          status: string | null
          subtotal_amount: number
          total_amount: number
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          chatbot_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          customer_address?: string | null
          customer_name?: string | null
          customer_phone: string
          discount_amount?: number | null
          id?: string
          notes?: string | null
          order_number: string
          payment_link?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          products: Json
          shipping_cost?: number | null
          shipping_method?: string | null
          status?: string | null
          subtotal_amount: number
          total_amount: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          chatbot_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          customer_address?: string | null
          customer_name?: string | null
          customer_phone?: string
          discount_amount?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_link?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          products?: Json
          shipping_cost?: number | null
          shipping_method?: string | null
          status?: string | null
          subtotal_amount?: number
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          chatbot_id: string | null
          created_at: string | null
          description: string | null
          dimensions: Json | null
          id: string
          images: string[] | null
          is_active: boolean | null
          min_stock_alert: number | null
          name: string
          original_price: number | null
          price: number
          sku: string | null
          stock_quantity: number | null
          tags: string[] | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          category?: string | null
          chatbot_id?: string | null
          created_at?: string | null
          description?: string | null
          dimensions?: Json | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          min_stock_alert?: number | null
          name: string
          original_price?: number | null
          price: number
          sku?: string | null
          stock_quantity?: number | null
          tags?: string[] | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          category?: string | null
          chatbot_id?: string | null
          created_at?: string | null
          description?: string | null
          dimensions?: Json | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          min_stock_alert?: number | null
          name?: string
          original_price?: number | null
          price?: number
          sku?: string | null
          stock_quantity?: number | null
          tags?: string[] | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          business_description: string | null
          business_goals: string | null
          business_name: string
          business_type: string | null
          city: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          industry: string | null
          onboarding_completed: boolean | null
          phone: string | null
          phone_number: string | null
          postal_code: string | null
          preferred_language: string | null
          province: string | null
          subscription_plan: string | null
          subscription_status: string | null
          subscription_tier: string | null
          target_audience: string | null
          timezone: string | null
          trial_ends_at: string | null
          updated_at: string | null
          website: string | null
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          business_description?: string | null
          business_goals?: string | null
          business_name: string
          business_type?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          industry?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          phone_number?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          province?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          target_audience?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          website?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          business_description?: string | null
          business_goals?: string | null
          business_name?: string
          business_type?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          industry?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          phone_number?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          province?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          target_audience?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          website?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          created_at: string | null
          date: string
          feature_used: string
          id: string
          metadata: Json | null
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          feature_used: string
          id?: string
          metadata?: Json | null
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          feature_used?: string
          id?: string
          metadata?: Json | null
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string | null
          description: string | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          name: string
          trigger_conditions: Json | null
          updated_at: string | null
          user_id: string | null
          workflow_steps: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_conditions?: Json | null
          updated_at?: string | null
          user_id?: string | null
          workflow_steps?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_conditions?: Json | null
          updated_at?: string | null
          user_id?: string | null
          workflow_steps?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "workflows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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

type PublicSchema = Database[keyof Database]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never