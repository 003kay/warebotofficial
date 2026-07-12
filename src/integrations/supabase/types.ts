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
      discord_sessions: {
        Row: {
          access_token: string
          avatar: string | null
          created_at: string
          expires_at: string
          id: string
          refresh_token: string
          updated_at: string
          user_discord_id: string
          username: string
        }
        Insert: {
          access_token: string
          avatar?: string | null
          created_at?: string
          expires_at: string
          id?: string
          refresh_token: string
          updated_at?: string
          user_discord_id: string
          username: string
        }
        Update: {
          access_token?: string
          avatar?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          refresh_token?: string
          updated_at?: string
          user_discord_id?: string
          username?: string
        }
        Relationships: []
      }
      ticket_panel_options: {
        Row: {
          category_id: string | null
          created_at: string
          description: string
          emoji: string
          id: string
          label: string
          panel_id: string
          position: number
          support_role_ids: string[]
          ticket_name_format: string
          updated_at: string
          welcome_message: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string
          emoji?: string
          id?: string
          label?: string
          panel_id: string
          position?: number
          support_role_ids?: string[]
          ticket_name_format?: string
          updated_at?: string
          welcome_message?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string
          emoji?: string
          id?: string
          label?: string
          panel_id?: string
          position?: number
          support_role_ids?: string[]
          ticket_name_format?: string
          updated_at?: string
          welcome_message?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_panel_options_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "ticket_panels"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_panels: {
        Row: {
          button_emoji: string
          button_label: string
          button_style: string
          category_id: string | null
          channel_id: string | null
          claim_button_emoji: string
          claim_button_label: string
          claim_button_style: string
          close_button_emoji: string
          close_button_label: string
          close_button_style: string
          close_command: string
          color: string
          command_prefix: string
          created_at: string
          delete_command: string
          description: string
          dropdown_placeholder: string
          guild_id: string
          id: string
          log_channel_id: string | null
          owner_discord_id: string
          panel_message_id: string | null
          panel_type: string
          reopen_command: string
          support_role_ids: string[]
          title: string
          updated_at: string
          welcome_message: string
        }
        Insert: {
          button_emoji?: string
          button_label?: string
          button_style?: string
          category_id?: string | null
          channel_id?: string | null
          claim_button_emoji?: string
          claim_button_label?: string
          claim_button_style?: string
          close_button_emoji?: string
          close_button_label?: string
          close_button_style?: string
          close_command?: string
          color?: string
          command_prefix?: string
          created_at?: string
          delete_command?: string
          description?: string
          dropdown_placeholder?: string
          guild_id: string
          id?: string
          log_channel_id?: string | null
          owner_discord_id: string
          panel_message_id?: string | null
          panel_type?: string
          reopen_command?: string
          support_role_ids?: string[]
          title?: string
          updated_at?: string
          welcome_message?: string
        }
        Update: {
          button_emoji?: string
          button_label?: string
          button_style?: string
          category_id?: string | null
          channel_id?: string | null
          claim_button_emoji?: string
          claim_button_label?: string
          claim_button_style?: string
          close_button_emoji?: string
          close_button_label?: string
          close_button_style?: string
          close_command?: string
          color?: string
          command_prefix?: string
          created_at?: string
          delete_command?: string
          description?: string
          dropdown_placeholder?: string
          guild_id?: string
          id?: string
          log_channel_id?: string | null
          owner_discord_id?: string
          panel_message_id?: string | null
          panel_type?: string
          reopen_command?: string
          support_role_ids?: string[]
          title?: string
          updated_at?: string
          welcome_message?: string
        }
        Relationships: []
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
