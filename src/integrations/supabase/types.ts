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
      api_keys: {
        Row: {
          created_at: string | null
          id: string
          key_hash: string
          key_preview: string
          last_used_at: string | null
          name: string
          org_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key_hash: string
          key_preview: string
          last_used_at?: string | null
          name: string
          org_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key_hash?: string
          key_preview?: string
          last_used_at?: string | null
          name?: string
          org_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      drift_reports: {
        Row: {
          breaking_count: number | null
          changes: Json | null
          created_at: string | null
          id: string
          info_count: number | null
          new_content: string | null
          new_version: string | null
          old_content: string | null
          old_version: string | null
          spec_id: string | null
          warning_count: number | null
        }
        Insert: {
          breaking_count?: number | null
          changes?: Json | null
          created_at?: string | null
          id?: string
          info_count?: number | null
          new_content?: string | null
          new_version?: string | null
          old_content?: string | null
          old_version?: string | null
          spec_id?: string | null
          warning_count?: number | null
        }
        Update: {
          breaking_count?: number | null
          changes?: Json | null
          created_at?: string | null
          id?: string
          info_count?: number | null
          new_content?: string | null
          new_version?: string | null
          old_content?: string | null
          old_version?: string | null
          spec_id?: string | null
          warning_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "drift_reports_spec_id_fkey"
            columns: ["spec_id"]
            isOneToOne: false
            referencedRelation: "specs"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          id: string
          org_id: string | null
          role: string | null
          token: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          org_id?: string | null
          role?: string | null
          token?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          org_id?: string | null
          role?: string | null
          token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_requests: {
        Row: {
          created_at: string | null
          duration_ms: number | null
          id: string
          method: string | null
          mock_server_id: string | null
          path: string | null
          response_body: Json | null
          status_code: number | null
        }
        Insert: {
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          method?: string | null
          mock_server_id?: string | null
          path?: string | null
          response_body?: Json | null
          status_code?: number | null
        }
        Update: {
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          method?: string | null
          mock_server_id?: string | null
          path?: string | null
          response_body?: Json | null
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mock_requests_mock_server_id_fkey"
            columns: ["mock_server_id"]
            isOneToOne: false
            referencedRelation: "mock_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_servers: {
        Row: {
          created_at: string | null
          id: string
          org_id: string | null
          request_count: number | null
          spec_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          org_id?: string | null
          request_count?: number | null
          spec_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          org_id?: string | null
          request_count?: number | null
          spec_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mock_servers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mock_servers_spec_id_fkey"
            columns: ["spec_id"]
            isOneToOne: false
            referencedRelation: "specs"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          plan: string | null
          slug: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          plan?: string | null
          slug: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          plan?: string | null
          slug?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          org_id: string | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          org_id?: string | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          org_id?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      specs: {
        Row: {
          content: string
          created_at: string | null
          endpoint_count: number | null
          github_path: string | null
          github_repo: string | null
          id: string
          name: string
          org_id: string | null
          parsed_data: Json | null
          status: string | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          endpoint_count?: number | null
          github_path?: string | null
          github_repo?: string | null
          id?: string
          name: string
          org_id?: string | null
          parsed_data?: Json | null
          status?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          endpoint_count?: number | null
          github_path?: string | null
          github_repo?: string | null
          id?: string
          name?: string
          org_id?: string | null
          parsed_data?: Json | null
          status?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "specs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_org_id: { Args: never; Returns: string }
      ensure_user_workspace: {
        Args: { _email?: string; _full_name?: string }
        Returns: {
          full_name: string
          org_id: string
          profile_id: string
          role: string
        }[]
      }
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
