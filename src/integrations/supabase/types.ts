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
      admin_profiles: {
        Row: {
          admin_id: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      appointment_feedback: {
        Row: {
          appointment_id: string
          comment: string | null
          created_at: string
          doctor_user_id: string
          id: string
          patient_id: string
          rating: number
        }
        Insert: {
          appointment_id: string
          comment?: string | null
          created_at?: string
          doctor_user_id: string
          id?: string
          patient_id: string
          rating: number
        }
        Update: {
          appointment_id?: string
          comment?: string | null
          created_at?: string
          doctor_user_id?: string
          id?: string
          patient_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "appointment_feedback_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          created_at: string
          doctor_id: string
          doctor_user_id: string
          duration_min: number
          ended_at: string | null
          fee: number
          id: string
          mode: Database["public"]["Enums"]["appointment_mode"]
          patient_id: string
          patient_notes: string | null
          payment_id: string | null
          razorpay_order_id: string | null
          room_url: string | null
          scheduled_at: string
          started_at: string | null
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          doctor_user_id: string
          duration_min?: number
          ended_at?: string | null
          fee?: number
          id?: string
          mode?: Database["public"]["Enums"]["appointment_mode"]
          patient_id: string
          patient_notes?: string | null
          payment_id?: string | null
          razorpay_order_id?: string | null
          room_url?: string | null
          scheduled_at: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          doctor_user_id?: string
          duration_min?: number
          ended_at?: string | null
          fee?: number
          id?: string
          mode?: Database["public"]["Enums"]["appointment_mode"]
          patient_id?: string
          patient_notes?: string | null
          payment_id?: string | null
          razorpay_order_id?: string | null
          room_url?: string | null
          scheduled_at?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_notes: {
        Row: {
          appointment_id: string
          assessment: string | null
          created_at: string
          doctor_user_id: string
          id: string
          objective: string | null
          plan: string | null
          subjective: string | null
          updated_at: string
        }
        Insert: {
          appointment_id: string
          assessment?: string | null
          created_at?: string
          doctor_user_id: string
          id?: string
          objective?: string | null
          plan?: string | null
          subjective?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          assessment?: string | null
          created_at?: string
          doctor_user_id?: string
          id?: string
          objective?: string | null
          plan?: string | null
          subjective?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_notes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_applications: {
        Row: {
          admin_notes: string | null
          bio: string | null
          clinic_name: string | null
          consultation_fee: number
          created_at: string
          email: string
          experience_years: number
          full_name: string
          gov_id_url: string | null
          id: string
          languages: string[]
          license_url: string | null
          phone: string
          photo_url: string | null
          qualification: string
          registration_number: string
          reviewed_at: string | null
          reviewed_by: string | null
          specialization: string
          status: Database["public"]["Enums"]["doctor_app_status"]
          updated_at: string
          user_id: string
          working_hours: Json
        }
        Insert: {
          admin_notes?: string | null
          bio?: string | null
          clinic_name?: string | null
          consultation_fee?: number
          created_at?: string
          email: string
          experience_years?: number
          full_name: string
          gov_id_url?: string | null
          id?: string
          languages?: string[]
          license_url?: string | null
          phone: string
          photo_url?: string | null
          qualification: string
          registration_number: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialization: string
          status?: Database["public"]["Enums"]["doctor_app_status"]
          updated_at?: string
          user_id: string
          working_hours?: Json
        }
        Update: {
          admin_notes?: string | null
          bio?: string | null
          clinic_name?: string | null
          consultation_fee?: number
          created_at?: string
          email?: string
          experience_years?: number
          full_name?: string
          gov_id_url?: string | null
          id?: string
          languages?: string[]
          license_url?: string | null
          phone?: string
          photo_url?: string | null
          qualification?: string
          registration_number?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialization?: string
          status?: Database["public"]["Enums"]["doctor_app_status"]
          updated_at?: string
          user_id?: string
          working_hours?: Json
        }
        Relationships: []
      }
      doctor_availability: {
        Row: {
          created_at: string
          day_of_week: number
          doctor_user_id: string
          end_time: string
          id: string
          start_time: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          doctor_user_id: string
          end_time: string
          id?: string
          start_time: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          doctor_user_id?: string
          end_time?: string
          id?: string
          start_time?: string
        }
        Relationships: []
      }
      doctors: {
        Row: {
          application_id: string | null
          bio: string | null
          consultation_fee: number
          created_at: string
          experience_years: number
          full_name: string
          id: string
          is_active: boolean
          languages: string[]
          photo_url: string | null
          professional_id: string | null
          qualification: string | null
          rating: number
          specialization: string
          updated_at: string
          user_id: string
          verified: boolean
        }
        Insert: {
          application_id?: string | null
          bio?: string | null
          consultation_fee?: number
          created_at?: string
          experience_years?: number
          full_name: string
          id?: string
          is_active?: boolean
          languages?: string[]
          photo_url?: string | null
          professional_id?: string | null
          qualification?: string | null
          rating?: number
          specialization: string
          updated_at?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          application_id?: string | null
          bio?: string | null
          consultation_fee?: number
          created_at?: string
          experience_years?: number
          full_name?: string
          id?: string
          is_active?: boolean
          languages?: string[]
          photo_url?: string | null
          professional_id?: string | null
          qualification?: string | null
          rating?: number
          specialization?: string
          updated_at?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "doctors_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "doctor_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          meta: Json
          read_at: string | null
          recipient_user_id: string
          sender_user_id: string | null
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          meta?: Json
          read_at?: string | null
          recipient_user_id: string
          sender_user_id?: string | null
          title: string
          type: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          meta?: Json
          read_at?: string | null
          recipient_user_id?: string
          sender_user_id?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      prescription_items: {
        Row: {
          created_at: string
          dosage: string | null
          duration: string | null
          frequency: string | null
          id: string
          instructions: string | null
          medicine: string
          order_index: number
          prescription_id: string
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          medicine: string
          order_index?: number
          prescription_id: string
        }
        Update: {
          created_at?: string
          dosage?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          medicine?: string
          order_index?: number
          prescription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescription_items_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          advice: string | null
          appointment_id: string
          created_at: string
          diagnosis: string | null
          doctor_id: string
          doctor_user_id: string
          follow_up_date: string | null
          id: string
          issued_at: string | null
          patient_id: string
          pdf_path: string | null
          updated_at: string
        }
        Insert: {
          advice?: string | null
          appointment_id: string
          created_at?: string
          diagnosis?: string | null
          doctor_id: string
          doctor_user_id: string
          follow_up_date?: string | null
          id?: string
          issued_at?: string | null
          patient_id: string
          pdf_path?: string | null
          updated_at?: string
        }
        Update: {
          advice?: string | null
          appointment_id?: string
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string
          doctor_user_id?: string
          follow_up_date?: string | null
          id?: string
          issued_at?: string | null
          patient_id?: string
          pdf_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      resolve_admin_email: {
        Args: { _admin_id: string }
        Returns: {
          email: string
        }[]
      }
      resolve_doctor_email: {
        Args: { _professional_id: string }
        Returns: {
          application_status: Database["public"]["Enums"]["doctor_app_status"]
          email: string
          is_active: boolean
        }[]
      }
    }
    Enums: {
      app_role: "patient" | "doctor" | "admin"
      appointment_mode: "video" | "clinic"
      appointment_status:
        | "pending_payment"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      doctor_app_status:
        | "pending"
        | "approved"
        | "rejected"
        | "needs_info"
        | "suspended"
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
    Enums: {
      app_role: ["patient", "doctor", "admin"],
      appointment_mode: ["video", "clinic"],
      appointment_status: [
        "pending_payment",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      doctor_app_status: [
        "pending",
        "approved",
        "rejected",
        "needs_info",
        "suspended",
      ],
    },
  },
} as const
