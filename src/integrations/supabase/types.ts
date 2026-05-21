export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attractions: {
        Row: {
          area: string | null
          coords: string | null
          created_at: string
          duration: string | null
          estimated_wait: string | null
          id: string
          lightning_lane: boolean
          must_do: boolean
          name: string
          park_id: string
          position: number
          strategy_tip: string | null
          type: string | null
        }
        Insert: {
          area?: string | null
          coords?: string | null
          created_at?: string
          duration?: string | null
          estimated_wait?: string | null
          id?: string
          lightning_lane?: boolean
          must_do?: boolean
          name: string
          park_id: string
          position?: number
          strategy_tip?: string | null
          type?: string | null
        }
        Update: {
          area?: string | null
          coords?: string | null
          created_at?: string
          duration?: string | null
          estimated_wait?: string | null
          id?: string
          lightning_lane?: boolean
          must_do?: boolean
          name?: string
          park_id?: string
          position?: number
          strategy_tip?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attractions_park_id_fkey"
            columns: ["park_id"]
            isOneToOne: false
            referencedRelation: "parks"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          assignee: string | null
          category: string | null
          created_at: string
          deadline: string | null
          id: string
          resolution: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee?: string | null
          category?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          resolution?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee?: string | null
          category?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          resolution?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      days: {
        Row: {
          created_at: string
          date: string
          id: string
          park_id: string | null
          position: number
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          park_id?: string | null
          position?: number
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          park_id?: string | null
          position?: number
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "days_park_id_fkey"
            columns: ["park_id"]
            isOneToOne: false
            referencedRelation: "parks"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_steps: {
        Row: {
          attraction_id: string | null
          created_at: string
          day_id: string
          id: string
          is_key_moment: boolean
          label: string
          note: string | null
          position: number
          time: string | null
        }
        Insert: {
          attraction_id?: string | null
          created_at?: string
          day_id: string
          id?: string
          is_key_moment?: boolean
          label: string
          note?: string | null
          position?: number
          time?: string | null
        }
        Update: {
          attraction_id?: string | null
          created_at?: string
          day_id?: string
          id?: string
          is_key_moment?: boolean
          label?: string
          note?: string | null
          position?: number
          time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_steps_attraction_id_fkey"
            columns: ["attraction_id"]
            isOneToOne: false
            referencedRelation: "attractions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_steps_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "days"
            referencedColumns: ["id"]
          },
        ]
      }
      parks: {
        Row: {
          address: string | null
          arrival_tip: string | null
          created_at: string
          hours: string | null
          id: string
          name: string
        }
        Insert: {
          address?: string | null
          arrival_tip?: string | null
          created_at?: string
          hours?: string | null
          id?: string
          name: string
        }
        Update: {
          address?: string | null
          arrival_tip?: string | null
          created_at?: string
          hours?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      timeline_items: {
        Row: {
          coords: string | null
          created_at: string
          day_id: string
          id: string
          label: string
          maps_query: string | null
          note: string | null
          position: number
          star: boolean
          time: string | null
          warn: boolean
        }
        Insert: {
          coords?: string | null
          created_at?: string
          day_id: string
          id?: string
          label: string
          maps_query?: string | null
          note?: string | null
          position?: number
          star?: boolean
          time?: string | null
          warn?: boolean
        }
        Update: {
          coords?: string | null
          created_at?: string
          day_id?: string
          id?: string
          label?: string
          maps_query?: string | null
          note?: string | null
          position?: number
          star?: boolean
          time?: string | null
          warn?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "timeline_items_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "days"
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
