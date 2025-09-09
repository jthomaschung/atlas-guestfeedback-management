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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_icon: string
          created_at: string
          criteria: Json
          description: string
          id: string
          name: string
        }
        Insert: {
          badge_icon: string
          created_at?: string
          criteria: Json
          description: string
          id?: string
          name: string
        }
        Update: {
          badge_icon?: string
          created_at?: string
          criteria?: Json
          description?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      catering_orders: {
        Row: {
          address: string | null
          business_date: string | null
          business_day: string | null
          catering_delivery_charge: number | null
          city: string | null
          customer_name: string | null
          delivery_charge: number | null
          email: Json | null
          email_date: string | null
          has_ez_cater: boolean | null
          id: number
          order_id: number | null
          order_reference: string | null
          order_total: number | null
          phone: string | null
          processed_at: string | null
          report_end_date: string | null
          report_start_date: string | null
          source_file: string | null
          state: string | null
          store_number: string | null
          sub_total: number | null
          tax: number | null
          total_delivery_fees: number | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          business_date?: string | null
          business_day?: string | null
          catering_delivery_charge?: number | null
          city?: string | null
          customer_name?: string | null
          delivery_charge?: number | null
          email?: Json | null
          email_date?: string | null
          has_ez_cater?: boolean | null
          id?: number
          order_id?: number | null
          order_reference?: string | null
          order_total?: number | null
          phone?: string | null
          processed_at?: string | null
          report_end_date?: string | null
          report_start_date?: string | null
          source_file?: string | null
          state?: string | null
          store_number?: string | null
          sub_total?: number | null
          tax?: number | null
          total_delivery_fees?: number | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          business_date?: string | null
          business_day?: string | null
          catering_delivery_charge?: number | null
          city?: string | null
          customer_name?: string | null
          delivery_charge?: number | null
          email?: Json | null
          email_date?: string | null
          has_ez_cater?: boolean | null
          id?: number
          order_id?: number | null
          order_reference?: string | null
          order_total?: number | null
          phone?: string | null
          processed_at?: string | null
          report_end_date?: string | null
          report_start_date?: string | null
          source_file?: string | null
          state?: string | null
          store_number?: string | null
          sub_total?: number | null
          tax?: number | null
          total_delivery_fees?: number | null
          zip?: string | null
        }
        Relationships: []
      }
      customer_feedback: {
        Row: {
          assignee: string | null
          case_number: string
          channel: string
          complaint_category: string
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          ee_action: string | null
          feedback_date: string
          feedback_text: string | null
          id: string
          market: string
          period: string | null
          priority: string | null
          rating: number | null
          resolution_notes: string | null
          resolution_status: string | null
          store_number: string
          updated_at: string
          user_id: string
          viewed: boolean | null
        }
        Insert: {
          assignee?: string | null
          case_number: string
          channel: string
          complaint_category: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          ee_action?: string | null
          feedback_date: string
          feedback_text?: string | null
          id?: string
          market: string
          period?: string | null
          priority?: string | null
          rating?: number | null
          resolution_notes?: string | null
          resolution_status?: string | null
          store_number: string
          updated_at?: string
          user_id: string
          viewed?: boolean | null
        }
        Update: {
          assignee?: string | null
          case_number?: string
          channel?: string
          complaint_category?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          ee_action?: string | null
          feedback_date?: string
          feedback_text?: string | null
          id?: string
          market?: string
          period?: string | null
          priority?: string | null
          rating?: number | null
          resolution_notes?: string | null
          resolution_status?: string | null
          store_number?: string
          updated_at?: string
          user_id?: string
          viewed?: boolean | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          company_name: string | null
          created_at: string | null
          customer_id: string
          customer_name: string | null
          emails: Json | null
          first_order_date: string | null
          last_order_date: string | null
          phones: Json | null
          points_balance: number | null
          primary_email: string | null
          primary_phone: string | null
          rewards_tier: string | null
          total_orders: number | null
          total_spent: number | null
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          customer_id?: string
          customer_name?: string | null
          emails?: Json | null
          first_order_date?: string | null
          last_order_date?: string | null
          phones?: Json | null
          points_balance?: number | null
          primary_email?: string | null
          primary_phone?: string | null
          rewards_tier?: string | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          customer_id?: string
          customer_name?: string | null
          emails?: Json | null
          first_order_date?: string | null
          last_order_date?: string | null
          phones?: Json | null
          points_balance?: number | null
          primary_email?: string | null
          primary_phone?: string | null
          rewards_tier?: string | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          is_active: boolean | null
          position_id: string | null
          profile_id: string | null
          store_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          position_id?: string | null
          profile_id?: string | null
          store_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          position_id?: string | null
          profile_id?: string | null
          store_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_store_number_fkey"
            columns: ["store_number"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_number"]
          },
        ]
      }
      import_batches: {
        Row: {
          batch_name: string
          completed_count: number | null
          completion_rate: number | null
          created_at: string | null
          file_name: string | null
          id: string
          imported_by: string | null
          in_progress_count: number | null
          not_started_count: number | null
          notes: string | null
          report_generated_date: string | null
          total_records: number | null
        }
        Insert: {
          batch_name: string
          completed_count?: number | null
          completion_rate?: number | null
          created_at?: string | null
          file_name?: string | null
          id?: string
          imported_by?: string | null
          in_progress_count?: number | null
          not_started_count?: number | null
          notes?: string | null
          report_generated_date?: string | null
          total_records?: number | null
        }
        Update: {
          batch_name?: string
          completed_count?: number | null
          completion_rate?: number | null
          created_at?: string | null
          file_name?: string | null
          id?: string
          imported_by?: string | null
          in_progress_count?: number | null
          not_started_count?: number | null
          notes?: string | null
          report_generated_date?: string | null
          total_records?: number | null
        }
        Relationships: []
      }
      notification_log: {
        Row: {
          id: string
          notification_type: string
          read_at: string | null
          recipient_email: string
          sent_at: string
          status: string | null
          work_order_id: string | null
        }
        Insert: {
          id?: string
          notification_type: string
          read_at?: string | null
          recipient_email: string
          sent_at?: string
          status?: string | null
          work_order_id?: string | null
        }
        Update: {
          id?: string
          notification_type?: string
          read_at?: string | null
          recipient_email?: string
          sent_at?: string
          status?: string | null
          work_order_id?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_on_assignment: boolean | null
          email_on_completion: boolean | null
          email_on_tagged: boolean | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_on_assignment?: boolean | null
          email_on_completion?: boolean | null
          email_on_tagged?: boolean | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_on_assignment?: boolean | null
          email_on_completion?: boolean | null
          email_on_tagged?: boolean | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          business_date: string
          catering_delivery_charge: number | null
          customer_id: string | null
          delivery_address: string | null
          delivery_charge: number | null
          delivery_city: string | null
          delivery_email: Json | null
          delivery_name: string | null
          delivery_phone: string | null
          delivery_state: string | null
          delivery_zip: string | null
          has_ez_cater: boolean | null
          order_id: number
          order_reference: string | null
          order_total: number | null
          original_order_id: string | null
          processed_at: string | null
          source_file: string | null
          store_id: number | null
          sub_total: number | null
          tax: number | null
        }
        Insert: {
          business_date: string
          catering_delivery_charge?: number | null
          customer_id?: string | null
          delivery_address?: string | null
          delivery_charge?: number | null
          delivery_city?: string | null
          delivery_email?: Json | null
          delivery_name?: string | null
          delivery_phone?: string | null
          delivery_state?: string | null
          delivery_zip?: string | null
          has_ez_cater?: boolean | null
          order_id?: number
          order_reference?: string | null
          order_total?: number | null
          original_order_id?: string | null
          processed_at?: string | null
          source_file?: string | null
          store_id?: number | null
          sub_total?: number | null
          tax?: number | null
        }
        Update: {
          business_date?: string
          catering_delivery_charge?: number | null
          customer_id?: string | null
          delivery_address?: string | null
          delivery_charge?: number | null
          delivery_city?: string | null
          delivery_email?: Json | null
          delivery_name?: string | null
          delivery_phone?: string | null
          delivery_state?: string | null
          delivery_zip?: string | null
          has_ez_cater?: boolean | null
          order_id?: number
          order_reference?: string | null
          order_total?: number | null
          original_order_id?: string | null
          processed_at?: string | null
          source_file?: string | null
          store_id?: number | null
          sub_total?: number | null
          tax?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          },
        ]
      }
      pending_work_order_redirects: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          session_token: string
          work_order_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          session_token: string
          work_order_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          session_token?: string
          work_order_id?: string
        }
        Relationships: []
      }
      periods: {
        Row: {
          created_at: string
          end_date: string
          id: string
          name: string
          period_number: number
          start_date: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          name: string
          period_number: number
          start_date: string
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          name?: string
          period_number?: number
          start_date?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      positions: {
        Row: {
          created_at: string | null
          id: string
          position_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          position_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          position_name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          email: string | null
          is_active: boolean | null
          manager: string | null
          phone: string | null
          region: string | null
          state: string | null
          store_id: number
          store_name: string | null
          store_number: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          is_active?: boolean | null
          manager?: string | null
          phone?: string | null
          region?: string | null
          state?: string | null
          store_id?: number
          store_name?: string | null
          store_number: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          is_active?: boolean | null
          manager?: string | null
          phone?: string | null
          region?: string | null
          state?: string | null
          store_id?: number
          store_name?: string | null
          store_number?: string
          zip?: string | null
        }
        Relationships: []
      }
      training_completions: {
        Row: {
          completed_date: string | null
          created_at: string | null
          data_as_of_date: string | null
          due_date: string | null
          employee_id: string
          id: string
          import_batch_id: string | null
          module_view_time: number | null
          percent_complete: number | null
          percent_of_division: number | null
          status: string | null
          store_id: number | null
          store_number: string | null
          training_duration: number | null
          training_module_id: string
          updated_at: string | null
        }
        Insert: {
          completed_date?: string | null
          created_at?: string | null
          data_as_of_date?: string | null
          due_date?: string | null
          employee_id: string
          id?: string
          import_batch_id?: string | null
          module_view_time?: number | null
          percent_complete?: number | null
          percent_of_division?: number | null
          status?: string | null
          store_id?: number | null
          store_number?: string | null
          training_duration?: number | null
          training_module_id: string
          updated_at?: string | null
        }
        Update: {
          completed_date?: string | null
          created_at?: string | null
          data_as_of_date?: string | null
          due_date?: string | null
          employee_id?: string
          id?: string
          import_batch_id?: string | null
          module_view_time?: number | null
          percent_complete?: number | null
          percent_of_division?: number | null
          status?: string | null
          store_id?: number | null
          store_number?: string | null
          training_duration?: number | null
          training_module_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_completions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_completions_import_batch_id_fkey"
            columns: ["import_batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_completions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "training_completions_training_module_id_fkey"
            columns: ["training_module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      training_completions_history: {
        Row: {
          completed_date: string | null
          data_as_of_date: string
          data_as_of_utc_day: string | null
          due_date: string | null
          employee_id: string
          id: string
          import_batch_id: string | null
          inserted_at: string
          module_view_time: number | null
          percent_complete: number | null
          percent_of_division: number | null
          status: Database["public"]["Enums"]["training_status"]
          store_id: number | null
          training_duration: number | null
          training_module_id: string
        }
        Insert: {
          completed_date?: string | null
          data_as_of_date: string
          data_as_of_utc_day?: string | null
          due_date?: string | null
          employee_id: string
          id?: string
          import_batch_id?: string | null
          inserted_at?: string
          module_view_time?: number | null
          percent_complete?: number | null
          percent_of_division?: number | null
          status: Database["public"]["Enums"]["training_status"]
          store_id?: number | null
          training_duration?: number | null
          training_module_id: string
        }
        Update: {
          completed_date?: string | null
          data_as_of_date?: string
          data_as_of_utc_day?: string | null
          due_date?: string | null
          employee_id?: string
          id?: string
          import_batch_id?: string | null
          inserted_at?: string
          module_view_time?: number | null
          percent_complete?: number | null
          percent_of_division?: number | null
          status?: Database["public"]["Enums"]["training_status"]
          store_id?: number | null
          training_duration?: number | null
          training_module_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_completions_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_completions_history_import_batch_id_fkey"
            columns: ["import_batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_completions_history_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "training_completions_history_training_module_id_fkey"
            columns: ["training_module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      training_modules: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          external_key: string | null
          id: string
          is_active: boolean | null
          module_group: string | null
          module_name: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          external_key?: string | null
          id?: string
          is_active?: boolean | null
          module_group?: string | null
          module_name: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          external_key?: string | null
          id?: string
          is_active?: boolean | null
          module_group?: string | null
          module_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          period_id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          period_id: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          period_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
        ]
      }
      user_hierarchy: {
        Row: {
          created_at: string
          director_id: string | null
          id: string
          manager_id: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          director_id?: string | null
          id?: string
          manager_id?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          director_id?: string | null
          id?: string
          manager_id?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          can_access_catering_dev: boolean | null
          can_access_facilities_dev: boolean | null
          can_access_guest_feedback_dev: boolean | null
          can_access_hr_dev: boolean | null
          can_access_training_dev: boolean | null
          created_at: string
          id: string
          is_development_user: boolean | null
          markets: string[] | null
          stores: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          can_access_catering_dev?: boolean | null
          can_access_facilities_dev?: boolean | null
          can_access_guest_feedback_dev?: boolean | null
          can_access_hr_dev?: boolean | null
          can_access_training_dev?: boolean | null
          created_at?: string
          id?: string
          is_development_user?: boolean | null
          markets?: string[] | null
          stores?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          can_access_catering_dev?: boolean | null
          can_access_facilities_dev?: boolean | null
          can_access_guest_feedback_dev?: boolean | null
          can_access_hr_dev?: boolean | null
          can_access_training_dev?: boolean | null
          created_at?: string
          id?: string
          is_development_user?: boolean | null
          markets?: string[] | null
          stores?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      work_orders: {
        Row: {
          assignee: string | null
          completed_at: string | null
          cost: number | null
          created_at: string
          defer_reason: string | null
          deferred_at: string | null
          deferred_by: string | null
          description: string
          ecosure: string
          id: string
          image_url: string | null
          market: string
          notes: string[] | null
          previous_status: string | null
          priority: string
          repair_type: string
          status: string
          store_number: string
          updated_at: string
          user_id: string
          vendor_scheduled_date: string | null
          vendor_scheduled_timeframe: string | null
          viewed: boolean | null
        }
        Insert: {
          assignee?: string | null
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          defer_reason?: string | null
          deferred_at?: string | null
          deferred_by?: string | null
          description: string
          ecosure: string
          id?: string
          image_url?: string | null
          market: string
          notes?: string[] | null
          previous_status?: string | null
          priority: string
          repair_type: string
          status?: string
          store_number: string
          updated_at?: string
          user_id: string
          vendor_scheduled_date?: string | null
          vendor_scheduled_timeframe?: string | null
          viewed?: boolean | null
        }
        Update: {
          assignee?: string | null
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          defer_reason?: string | null
          deferred_at?: string | null
          deferred_by?: string | null
          description?: string
          ecosure?: string
          id?: string
          image_url?: string | null
          market?: string
          notes?: string[] | null
          previous_status?: string | null
          priority?: string
          repair_type?: string
          status?: string
          store_number?: string
          updated_at?: string
          user_id?: string
          vendor_scheduled_date?: string | null
          vendor_scheduled_timeframe?: string | null
          viewed?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      completion_trends: {
        Row: {
          as_of_day: string | null
          completed: number | null
          in_progress: number | null
          module_name: string | null
          not_started: number | null
          total: number | null
          training_module_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_completions_history_training_module_id_fkey"
            columns: ["training_module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      v_training_trend: {
        Row: {
          as_of_day: string | null
          completed: number | null
          in_progress: number | null
          module_name: string | null
          not_started: number | null
          percent_complete: number | null
          total: number | null
        }
        Relationships: []
      }
      v_training_trend_with_store: {
        Row: {
          as_of_day: string | null
          completed: number | null
          in_progress: number | null
          module_name: string | null
          not_started: number | null
          percent_complete_with_store: number | null
          total_with_store: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_red_carpet_badge: {
        Args: { period_uuid: string; user_uuid: string }
        Returns: boolean
      }
      check_sniper_badge: {
        Args: { period_uuid: string; user_uuid: string }
        Returns: boolean
      }
      check_speed_demon_badge: {
        Args: { period_uuid: string; user_uuid: string }
        Returns: boolean
      }
      generate_display_name: {
        Args: { email: string; first_name: string; last_name: string }
        Returns: string
      }
      get_company_completion_trends: {
        Args:
          | Record<PropertyKey, never>
          | { module_id?: string }
          | { target_category?: string }
        Returns: {
          completed: number
          completion_rate: number
          date_point: string
          in_progress: number
          not_started: number
          total: number
        }[]
      }
      get_current_user_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_market_completion_trends: {
        Args:
          | Record<PropertyKey, never>
          | { module_id?: string }
          | { target_category?: string }
        Returns: {
          completed: number
          completion_rate: number
          date_point: string
          in_progress: number
          market: string
          not_started: number
          total: number
        }[]
      }
      get_store_completion_trends: {
        Args:
          | { module_id?: string; target_market: string }
          | { target_category?: string; target_market: string }
          | { target_market: string }
        Returns: {
          completed: number
          completion_rate: number
          date_point: string
          in_progress: number
          not_started: number
          store_name: string
          store_number: string
          total: number
        }[]
      }
      get_training_completions_for_store: {
        Args:
          | { module_id?: string; store_num: string }
          | { store_num: string }
          | { store_num: string; target_category?: string }
        Returns: {
          completed_date: string
          employee_id: string
          employee_name: string
          percent_complete: number
          status: string
          training_module_name: string
        }[]
      }
      get_user_display_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          display_name: string
          first_name: string
          last_name: string
          user_id: string
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_jsonb_array_of_strings: {
        Args: { j: Json }
        Returns: boolean
      }
      jsonb_try_parse: {
        Args: { txt: string }
        Returns: Json
      }
      normalize_market: {
        Args: { market_name: string }
        Returns: string
      }
      user_has_market_access: {
        Args: { target_market: string; user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      complaint_category:
        | "sandwich_made_wrong"
        | "slow_service"
        | "rude_service"
        | "product_issue"
        | "closed_early"
        | "praise"
        | "missing_item"
        | "credit_card_issue"
        | "bread_quality"
        | "out_of_product"
        | "other"
        | "cleanliness"
        | "possible_food_poisoning"
        | "loyalty_program_issues"
      feedback_channel: "yelp" | "qualtrics" | "jimmy_johns"
      training_status: "Completed" | "In Progress" | "Not Started"
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
      complaint_category: [
        "sandwich_made_wrong",
        "slow_service",
        "rude_service",
        "product_issue",
        "closed_early",
        "praise",
        "missing_item",
        "credit_card_issue",
        "bread_quality",
        "out_of_product",
        "other",
        "cleanliness",
        "possible_food_poisoning",
        "loyalty_program_issues",
      ],
      feedback_channel: ["yelp", "qualtrics", "jimmy_johns"],
      training_status: ["Completed", "In Progress", "Not Started"],
    },
  },
} as const
