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
      airport_clearance_appointment_history: {
        Row: {
          appointment_type: string
          changed_at: string
          changed_by: string | null
          id: string
          new_date: string
          new_hire_id: string
          notes: string | null
          old_date: string | null
        }
        Insert: {
          appointment_type: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_date: string
          new_hire_id: string
          notes?: string | null
          old_date?: string | null
        }
        Update: {
          appointment_type?: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_date?: string
          new_hire_id?: string
          notes?: string | null
          old_date?: string | null
        }
        Relationships: []
      }
      amex_connections: {
        Row: {
          access_token: string
          connection_status: string | null
          created_at: string | null
          cursor: string | null
          id: string
          institution_name: string | null
          item_id: string
          last_error: string | null
          last_synced_at: string | null
          profile_id: string
          updated_at: string | null
        }
        Insert: {
          access_token: string
          connection_status?: string | null
          created_at?: string | null
          cursor?: string | null
          id?: string
          institution_name?: string | null
          item_id: string
          last_error?: string | null
          last_synced_at?: string | null
          profile_id: string
          updated_at?: string | null
        }
        Update: {
          access_token?: string
          connection_status?: string | null
          created_at?: string | null
          cursor?: string | null
          id?: string
          institution_name?: string | null
          item_id?: string
          last_error?: string | null
          last_synced_at?: string | null
          profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "amex_connections_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "amex_connections_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_employee_expense_summary"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      amex_transactions: {
        Row: {
          account_id: string
          amount: number
          approved_at: string | null
          approved_by: string | null
          business_purpose: string | null
          category: string[] | null
          connection_id: string
          created_at: string | null
          date: string
          description: string | null
          expense_category: string | null
          id: string
          merchant_name: string | null
          notes: string | null
          payment_channel: string | null
          pending: boolean | null
          profile_id: string
          qb_expense_id: string | null
          qb_synced: boolean | null
          qb_synced_at: string | null
          receipt_uploaded: boolean | null
          receipt_url: string | null
          rejection_reason: string | null
          status: string | null
          store_id: number | null
          submitted_at: string | null
          transaction_id: string
          updated_at: string | null
        }
        Insert: {
          account_id: string
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          business_purpose?: string | null
          category?: string[] | null
          connection_id: string
          created_at?: string | null
          date: string
          description?: string | null
          expense_category?: string | null
          id?: string
          merchant_name?: string | null
          notes?: string | null
          payment_channel?: string | null
          pending?: boolean | null
          profile_id: string
          qb_expense_id?: string | null
          qb_synced?: boolean | null
          qb_synced_at?: string | null
          receipt_uploaded?: boolean | null
          receipt_url?: string | null
          rejection_reason?: string | null
          status?: string | null
          store_id?: number | null
          submitted_at?: string | null
          transaction_id: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          business_purpose?: string | null
          category?: string[] | null
          connection_id?: string
          created_at?: string | null
          date?: string
          description?: string | null
          expense_category?: string | null
          id?: string
          merchant_name?: string | null
          notes?: string | null
          payment_channel?: string | null
          pending?: boolean | null
          profile_id?: string
          qb_expense_id?: string | null
          qb_synced?: boolean | null
          qb_synced_at?: string | null
          receipt_uploaded?: boolean | null
          receipt_url?: string | null
          rejection_reason?: string | null
          status?: string | null
          store_id?: number | null
          submitted_at?: string | null
          transaction_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "amex_transactions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "amex_transactions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "v_employee_expense_summary"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "amex_transactions_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "amex_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "amex_transactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "amex_transactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_employee_expense_summary"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "amex_transactions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "amex_transactions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "v_store_monthly_spending"
            referencedColumns: ["store_id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employee_expense_summary"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      backlog_items: {
        Row: {
          ai_priority_factors: Json | null
          ai_recommendation: string | null
          backlog_category: string
          backlog_status: string | null
          budget_allocation_id: string | null
          business_impact: string | null
          created_at: string | null
          deferral_justification: string | null
          deferred_at: string | null
          deferred_by: string | null
          dependent_on_project: string | null
          estimated_cost: number | null
          estimated_fix_timing: string | null
          id: string
          justification: string
          priority_score: number | null
          region: string
          regional_notes: string | null
          regional_priority: number | null
          reviewed_at: string | null
          reviewed_by_regional_lead: string | null
          roi_potential: string | null
          similar_issue_cluster_id: string | null
          target_completion_date: string | null
          updated_at: string | null
          work_order_id: string | null
        }
        Insert: {
          ai_priority_factors?: Json | null
          ai_recommendation?: string | null
          backlog_category: string
          backlog_status?: string | null
          budget_allocation_id?: string | null
          business_impact?: string | null
          created_at?: string | null
          deferral_justification?: string | null
          deferred_at?: string | null
          deferred_by?: string | null
          dependent_on_project?: string | null
          estimated_cost?: number | null
          estimated_fix_timing?: string | null
          id?: string
          justification: string
          priority_score?: number | null
          region: string
          regional_notes?: string | null
          regional_priority?: number | null
          reviewed_at?: string | null
          reviewed_by_regional_lead?: string | null
          roi_potential?: string | null
          similar_issue_cluster_id?: string | null
          target_completion_date?: string | null
          updated_at?: string | null
          work_order_id?: string | null
        }
        Update: {
          ai_priority_factors?: Json | null
          ai_recommendation?: string | null
          backlog_category?: string
          backlog_status?: string | null
          budget_allocation_id?: string | null
          business_impact?: string | null
          created_at?: string | null
          deferral_justification?: string | null
          deferred_at?: string | null
          deferred_by?: string | null
          dependent_on_project?: string | null
          estimated_cost?: number | null
          estimated_fix_timing?: string | null
          id?: string
          justification?: string
          priority_score?: number | null
          region?: string
          regional_notes?: string | null
          regional_priority?: number | null
          reviewed_at?: string | null
          reviewed_by_regional_lead?: string | null
          roi_potential?: string | null
          similar_issue_cluster_id?: string | null
          target_completion_date?: string | null
          updated_at?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "backlog_items_deferred_by_fkey"
            columns: ["deferred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backlog_items_deferred_by_fkey"
            columns: ["deferred_by"]
            isOneToOne: false
            referencedRelation: "v_employee_expense_summary"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "backlog_items_reviewed_by_regional_lead_fkey"
            columns: ["reviewed_by_regional_lead"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backlog_items_reviewed_by_regional_lead_fkey"
            columns: ["reviewed_by_regional_lead"]
            isOneToOne: false
            referencedRelation: "v_employee_expense_summary"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "backlog_items_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: true
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_recipients: {
        Row: {
          bounced_at: string | null
          campaign_id: string
          clicked_at: string | null
          created_at: string
          delivered_at: string | null
          email: string
          id: string
          name: string | null
          opened_at: string | null
          sent_at: string | null
          status: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          bounced_at?: string | null
          campaign_id: string
          clicked_at?: string | null
          created_at?: string
          delivered_at?: string | null
          email: string
          id?: string
          name?: string | null
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          bounced_at?: string | null
          campaign_id?: string
          clicked_at?: string | null
          created_at?: string
          delivered_at?: string | null
          email?: string
          id?: string
          name?: string | null
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      career_path_progress: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          employee_id: string
          id: string
          is_completed: boolean | null
          manager_approved: boolean | null
          manager_notes: string | null
          template_item_id: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          employee_id: string
          id?: string
          is_completed?: boolean | null
          manager_approved?: boolean | null
          manager_notes?: string | null
          template_item_id: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          employee_id?: string
          id?: string
          is_completed?: boolean | null
          manager_approved?: boolean | null
          manager_notes?: string | null
          template_item_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "career_path_progress_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "certified_managers_registry"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "career_path_progress_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_path_progress_template_item_id_fkey"
            columns: ["template_item_id"]
            isOneToOne: false
            referencedRelation: "career_path_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      career_path_templates: {
        Row: {
          created_at: string | null
          day_label: string
          day_number: number
          estimated_minutes: number | null
          id: string
          instructions: string | null
          is_required: boolean | null
          item_order: number
          item_title: string
          item_type: string
          position_name: string
          requires_manager_approval: boolean | null
          section_name: string
          training_module_id: string | null
          training_module_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_label: string
          day_number: number
          estimated_minutes?: number | null
          id?: string
          instructions?: string | null
          is_required?: boolean | null
          item_order: number
          item_title: string
          item_type: string
          position_name: string
          requires_manager_approval?: boolean | null
          section_name: string
          training_module_id?: string | null
          training_module_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_label?: string
          day_number?: number
          estimated_minutes?: number | null
          id?: string
          instructions?: string | null
          is_required?: boolean | null
          item_order?: number
          item_title?: string
          item_type?: string
          position_name?: string
          requires_manager_approval?: boolean | null
          section_name?: string
          training_module_id?: string | null
          training_module_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cash_deposits: {
        Row: {
          business_date: string
          created_at: string | null
          created_by_user_id: string | null
          deposit_amount: number
          deposit_date: string
          deposited_by_name: string
          id: string
          notes: string | null
          receipt_image_url: string
          store_number: string
          submission_type: string
          updated_at: string | null
        }
        Insert: {
          business_date: string
          created_at?: string | null
          created_by_user_id?: string | null
          deposit_amount: number
          deposit_date: string
          deposited_by_name: string
          id?: string
          notes?: string | null
          receipt_image_url: string
          store_number: string
          submission_type?: string
          updated_at?: string | null
        }
        Update: {
          business_date?: string
          created_at?: string | null
          created_by_user_id?: string | null
          deposit_amount?: number
          deposit_date?: string
          deposited_by_name?: string
          id?: string
          notes?: string | null
          receipt_image_url?: string
          store_number?: string
          submission_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_deposits_store_number_fkey"
            columns: ["store_number"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_number"]
          },
          {
            foreignKeyName: "cash_deposits_store_number_fkey"
            columns: ["store_number"]
            isOneToOne: false
            referencedRelation: "v_employee_expense_summary"
            referencedColumns: ["store_number"]
          },
          {
            foreignKeyName: "cash_deposits_store_number_fkey"
            columns: ["store_number"]
            isOneToOne: false
            referencedRelation: "v_store_monthly_spending"
            referencedColumns: ["store_number"]
          },
        ]
      }
      catering_campaign_recipients: {
        Row: {
          bounced_at: string | null
          campaign_id: string | null
          clicked_at: string | null
          created_at: string | null
          customer_email: string
          customer_name: string | null
          delivered_at: string | null
          id: string
          opened_at: string | null
          sent_at: string | null
          status: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          bounced_at?: string | null
          campaign_id?: string | null
          clicked_at?: string | null
          created_at?: string | null
          customer_email: string
          customer_name?: string | null
          delivered_at?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          bounced_at?: string | null
          campaign_id?: string | null
          clicked_at?: string | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string | null
          delivered_at?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catering_campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "catering_email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      catering_crm_callbacks: {
        Row: {
          assigned_to: string | null
          callback_type: string
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          id: string
          lead_id: string
          notes: string | null
          priority: string
          scheduled_for: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          callback_type: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          lead_id: string
          notes?: string | null
          priority?: string
          scheduled_for: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          callback_type?: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          lead_id?: string
          notes?: string | null
          priority?: string
          scheduled_for?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catering_crm_callbacks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "catering_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      catering_crm_interactions: {
        Row: {
          created_at: string | null
          created_by: string | null
          direction: string | null
          id: string
          interaction_type: string
          lead_id: string
          notes: string | null
          outcome: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          direction?: string | null
          id?: string
          interaction_type: string
          lead_id: string
          notes?: string | null
          outcome?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          direction?: string | null
          id?: string
          interaction_type?: string
          lead_id?: string
          notes?: string | null
          outcome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catering_crm_interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "catering_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      catering_customers: {
        Row: {
          address: string | null
          city: string | null
          company_name: string | null
          created_at: string | null
          customer_name: string | null
          email: Json | null
          first_order_date: string | null
          id: string
          last_order_date: string | null
          phone: string | null
          state: string | null
          total_orders: number | null
          total_spent: number | null
          updated_at: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          customer_name?: string | null
          email?: Json | null
          first_order_date?: string | null
          id?: string
          last_order_date?: string | null
          phone?: string | null
          state?: string | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          customer_name?: string | null
          email?: Json | null
          first_order_date?: string | null
          id?: string
          last_order_date?: string | null
          phone?: string | null
          state?: string | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      catering_email_campaigns: {
        Row: {
          campaign_name: string
          content: Json
          created_at: string | null
          created_by: string | null
          design_json: Json | null
          from_email: string
          from_name: string
          id: string
          recipient_count: number | null
          recipient_filter: Json | null
          sent_at: string | null
          status: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          campaign_name: string
          content: Json
          created_at?: string | null
          created_by?: string | null
          design_json?: Json | null
          from_email: string
          from_name: string
          id?: string
          recipient_count?: number | null
          recipient_filter?: Json | null
          sent_at?: string | null
          status?: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          campaign_name?: string
          content?: Json
          created_at?: string | null
          created_by?: string | null
          design_json?: Json | null
          from_email?: string
          from_name?: string
          id?: string
          recipient_count?: number | null
          recipient_filter?: Json | null
          sent_at?: string | null
          status?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      catering_email_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          design_json: Json
          id: string
          is_public: boolean | null
          name: string
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          design_json: Json
          id?: string
          is_public?: boolean | null
          name: string
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          design_json?: Json
          id?: string
          is_public?: boolean | null
          name?: string
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      catering_leads: {
        Row: {
          assigned_to: string | null
          campaign_id: string | null
          campaign_slug: string | null
          company_name: string | null
          contacted_at: string | null
          converted_at: string | null
          created_at: string | null
          email: string
          estimated_order_value: number | null
          event_type: string | null
          expected_close_date: string | null
          id: string
          last_interaction_at: string | null
          lead_score: number | null
          marketing_consent: boolean | null
          message: string | null
          name: string
          next_callback_at: string | null
          notes: string | null
          phone: string
          source: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          campaign_id?: string | null
          campaign_slug?: string | null
          company_name?: string | null
          contacted_at?: string | null
          converted_at?: string | null
          created_at?: string | null
          email: string
          estimated_order_value?: number | null
          event_type?: string | null
          expected_close_date?: string | null
          id?: string
          last_interaction_at?: string | null
          lead_score?: number | null
          marketing_consent?: boolean | null
          message?: string | null
          name: string
          next_callback_at?: string | null
          notes?: string | null
          phone: string
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          campaign_id?: string | null
          campaign_slug?: string | null
          company_name?: string | null
          contacted_at?: string | null
          converted_at?: string | null
          created_at?: string | null
          email?: string
          estimated_order_value?: number | null
          event_type?: string | null
          expected_close_date?: string | null
          id?: string
          last_interaction_at?: string | null
          lead_score?: number | null
          marketing_consent?: boolean | null
          message?: string | null
          name?: string
          next_callback_at?: string | null
          notes?: string | null
          phone?: string
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catering_leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "catering_email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      catering_locations: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          manager_name: string | null
          phone: string | null
          region: string | null
          state: string | null
          store_name: string | null
          store_number: string
          updated_at: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          manager_name?: string | null
          phone?: string | null
          region?: string | null
          state?: string | null
          store_name?: string | null
          store_number: string
          updated_at?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          manager_name?: string | null
          phone?: string | null
          region?: string | null
          state?: string | null
          store_name?: string | null
          store_number?: string
          updated_at?: string | null
          zip?: string | null
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
      catering_reports: {
        Row: {
          created_at: string | null
          email_received_date: string | null
          filename: string
          id: string
          processed_at: string | null
          report_date: string
          report_end_date: string | null
          report_start_date: string | null
          store_number: string
          total_orders: number | null
          total_revenue: number | null
        }
        Insert: {
          created_at?: string | null
          email_received_date?: string | null
          filename: string
          id?: string
          processed_at?: string | null
          report_date: string
          report_end_date?: string | null
          report_start_date?: string | null
          store_number: string
          total_orders?: number | null
          total_revenue?: number | null
        }
        Update: {
          created_at?: string | null
          email_received_date?: string | null
          filename?: string
          id?: string
          processed_at?: string | null
          report_date?: string
          report_end_date?: string | null
          report_start_date?: string | null
          store_number?: string
          total_orders?: number | null
          total_revenue?: number | null
        }
        Relationships: []
      }
      catering_unsubscribe_list: {
        Row: {
          created_at: string | null
          email: string
          id: string
          ip_address: string | null
          reason: string | null
          unsubscribed_at: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          ip_address?: string | null
          reason?: string | null
          unsubscribed_at?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          reason?: string | null
          unsubscribed_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      certification_locations: {
        Row: {
          address: string | null
          city: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          is_active: boolean | null
          location_name: string
          state: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          location_name: string
          state?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          location_name?: string
          state?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      certification_patches: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          patch_description: string | null
          patch_icon: string | null
          patch_name: string
          required_position_ids: string[] | null
          requires_internal_employee: boolean | null
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          patch_description?: string | null
          patch_icon?: string | null
          patch_name: string
          required_position_ids?: string[] | null
          requires_internal_employee?: boolean | null
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          patch_description?: string | null
          patch_icon?: string | null
          patch_name?: string
          required_position_ids?: string[] | null
          requires_internal_employee?: boolean | null
        }
        Relationships: []
      }
      certification_requests: {
        Row: {
          accounting_notified_at: string | null
          accounting_notified_by: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          certification_date: string | null
          certification_location: string | null
          created_at: string
          employee_id: string | null
          external_company_address: string | null
          external_company_name: string | null
          fast_track_confirmation_number: string | null
          fast_track_registered_at: string | null
          id: string
          notes: string | null
          patch_issued_at: string | null
          patch_issued_by: string | null
          patch_tracking_number: string | null
          requester_market: string
          requester_store_number: string
          requester_user_id: string | null
          status: string
          trainee_email: string
          trainee_first_name: string
          trainee_last_name: string
          trainee_phone: string | null
          trainee_store_number: string
          trainee_type: string
          trainer_name: string | null
          updated_at: string
          verification_notes: string | null
          verification_requested_at: string | null
          verification_requested_by: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          accounting_notified_at?: string | null
          accounting_notified_by?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          certification_date?: string | null
          certification_location?: string | null
          created_at?: string
          employee_id?: string | null
          external_company_address?: string | null
          external_company_name?: string | null
          fast_track_confirmation_number?: string | null
          fast_track_registered_at?: string | null
          id?: string
          notes?: string | null
          patch_issued_at?: string | null
          patch_issued_by?: string | null
          patch_tracking_number?: string | null
          requester_market: string
          requester_store_number: string
          requester_user_id?: string | null
          status?: string
          trainee_email: string
          trainee_first_name: string
          trainee_last_name: string
          trainee_phone?: string | null
          trainee_store_number: string
          trainee_type: string
          trainer_name?: string | null
          updated_at?: string
          verification_notes?: string | null
          verification_requested_at?: string | null
          verification_requested_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          accounting_notified_at?: string | null
          accounting_notified_by?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          certification_date?: string | null
          certification_location?: string | null
          created_at?: string
          employee_id?: string | null
          external_company_address?: string | null
          external_company_name?: string | null
          fast_track_confirmation_number?: string | null
          fast_track_registered_at?: string | null
          id?: string
          notes?: string | null
          patch_issued_at?: string | null
          patch_issued_by?: string | null
          patch_tracking_number?: string | null
          requester_market?: string
          requester_store_number?: string
          requester_user_id?: string | null
          status?: string
          trainee_email?: string
          trainee_first_name?: string
          trainee_last_name?: string
          trainee_phone?: string | null
          trainee_store_number?: string
          trainee_type?: string
          trainer_name?: string | null
          updated_at?: string
          verification_notes?: string | null
          verification_requested_at?: string | null
          verification_requested_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certification_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "certified_managers_registry"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "certification_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      completion_metrics: {
        Row: {
          category: string | null
          class: string | null
          completed_count: number | null
          completion_percentage: number | null
          created_at: string | null
          id: string
          import_batch_id: string | null
          in_progress_count: number | null
          metric_date: string
          not_started_count: number | null
          store_id: number | null
          total_employees: number | null
        }
        Insert: {
          category?: string | null
          class?: string | null
          completed_count?: number | null
          completion_percentage?: number | null
          created_at?: string | null
          id?: string
          import_batch_id?: string | null
          in_progress_count?: number | null
          metric_date: string
          not_started_count?: number | null
          store_id?: number | null
          total_employees?: number | null
        }
        Update: {
          category?: string | null
          class?: string | null
          completed_count?: number | null
          completion_percentage?: number | null
          created_at?: string | null
          id?: string
          import_batch_id?: string | null
          in_progress_count?: number | null
          metric_date?: string
          not_started_count?: number | null
          store_id?: number | null
          total_employees?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "completion_metrics_import_batch_id_fkey"
            columns: ["import_batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completion_metrics_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "completion_metrics_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "v_store_monthly_spending"
            referencedColumns: ["store_id"]
          },
        ]
      }
      critical_feedback_approvals: {
        Row: {
          approved_at: string
          approver_role: string
          approver_user_id: string
          created_at: string
          executive_notes: string | null
          feedback_id: string
          id: string
        }
        Insert: {
          approved_at?: string
          approver_role: string
          approver_user_id: string
          created_at?: string
          executive_notes?: string | null
          feedback_id: string
          id?: string
        }
        Update: {
          approved_at?: string
          approver_role?: string
          approver_user_id?: string
          created_at?: string
          executive_notes?: string | null
          feedback_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "critical_feedback_approvals_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "customer_feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_feedback: {
        Row: {
          approval_status: string | null
          assignee: string | null
          auto_escalated: boolean | null
          calculated_score: number | null
          case_number: string
          ceo_approved_at: string | null
          channel: string
          complaint_category: string
          created_at: string
          customer_called: boolean | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_responded_at: string | null
          customer_response_sentiment: string | null
          director_approved_at: string | null
          dm_approved_at: string | null
          ee_action: string | null
          escalated_at: string | null
          escalated_by: string | null
          executive_notes: string | null
          feedback_date: string
          feedback_text: string | null
          id: string
          market: string
          order_number: string | null
          outreach_method: string | null
          outreach_sent_at: string | null
          period: string | null
          priority: string | null
          rating: number | null
          ready_for_dm_resolution: boolean | null
          resolution_notes: string | null
          resolution_status: string | null
          sla_deadline: string | null
          store_number: string
          time_of_day: string | null
          updated_at: string
          user_id: string
          viewed: boolean | null
          vp_approved_at: string | null
        }
        Insert: {
          approval_status?: string | null
          assignee?: string | null
          auto_escalated?: boolean | null
          calculated_score?: number | null
          case_number: string
          ceo_approved_at?: string | null
          channel: string
          complaint_category: string
          created_at?: string
          customer_called?: boolean | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_responded_at?: string | null
          customer_response_sentiment?: string | null
          director_approved_at?: string | null
          dm_approved_at?: string | null
          ee_action?: string | null
          escalated_at?: string | null
          escalated_by?: string | null
          executive_notes?: string | null
          feedback_date: string
          feedback_text?: string | null
          id?: string
          market: string
          order_number?: string | null
          outreach_method?: string | null
          outreach_sent_at?: string | null
          period?: string | null
          priority?: string | null
          rating?: number | null
          ready_for_dm_resolution?: boolean | null
          resolution_notes?: string | null
          resolution_status?: string | null
          sla_deadline?: string | null
          store_number: string
          time_of_day?: string | null
          updated_at?: string
          user_id: string
          viewed?: boolean | null
          vp_approved_at?: string | null
        }
        Update: {
          approval_status?: string | null
          assignee?: string | null
          auto_escalated?: boolean | null
          calculated_score?: number | null
          case_number?: string
          ceo_approved_at?: string | null
          channel?: string
          complaint_category?: string
          created_at?: string
          customer_called?: boolean | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_responded_at?: string | null
          customer_response_sentiment?: string | null
          director_approved_at?: string | null
          dm_approved_at?: string | null
          ee_action?: string | null
          escalated_at?: string | null
          escalated_by?: string | null
          executive_notes?: string | null
          feedback_date?: string
          feedback_text?: string | null
          id?: string
          market?: string
          order_number?: string | null
          outreach_method?: string | null
          outreach_sent_at?: string | null
          period?: string | null
          priority?: string | null
          rating?: number | null
          ready_for_dm_resolution?: boolean | null
          resolution_notes?: string | null
          resolution_status?: string | null
          sla_deadline?: string | null
          store_number?: string
          time_of_day?: string | null
          updated_at?: string
          user_id?: string
          viewed?: boolean | null
          vp_approved_at?: string | null
        }
        Relationships: []
      }
      customer_outreach_log: {
        Row: {
          created_at: string
          delivery_status: string | null
          direction: string | null
          email_message_id: string | null
          email_thread_id: string | null
          feedback_id: string
          from_email: string | null
          id: string
          message_content: string | null
          outreach_method: string
          replied_to_id: string | null
          response_received: boolean | null
          response_sentiment: string | null
          sent_at: string
          subject: string | null
          to_email: string | null
        }
        Insert: {
          created_at?: string
          delivery_status?: string | null
          direction?: string | null
          email_message_id?: string | null
          email_thread_id?: string | null
          feedback_id: string
          from_email?: string | null
          id?: string
          message_content?: string | null
          outreach_method: string
          replied_to_id?: string | null
          response_received?: boolean | null
          response_sentiment?: string | null
          sent_at?: string
          subject?: string | null
          to_email?: string | null
        }
        Update: {
          created_at?: string
          delivery_status?: string | null
          direction?: string | null
          email_message_id?: string | null
          email_thread_id?: string | null
          feedback_id?: string
          from_email?: string | null
          id?: string
          message_content?: string | null
          outreach_method?: string
          replied_to_id?: string | null
          response_received?: boolean | null
          response_sentiment?: string | null
          sent_at?: string
          subject?: string | null
          to_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_outreach_log_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "customer_feedback"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_outreach_log_replied_to_id_fkey"
            columns: ["replied_to_id"]
            isOneToOne: false
            referencedRelation: "customer_outreach_log"
            referencedColumns: ["id"]
          },
        ]
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
      daily_summary_log: {
        Row: {
          created_at: string
          id: string
          metrics: Json | null
          recipient_email: string
          region: string | null
          sent_at: string
          summary_date: string
          summary_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          metrics?: Json | null
          recipient_email: string
          region?: string | null
          sent_at?: string
          summary_date: string
          summary_type: string
        }
        Update: {
          created_at?: string
          id?: string
          metrics?: Json | null
          recipient_email?: string
          region?: string | null
          sent_at?: string
          summary_date?: string
          summary_type?: string
        }
        Relationships: []
      }
      debug_webhooks: {
        Row: {
          content_type: string | null
          created_at: string | null
          headers: Json | null
          id: string
          method: string | null
          raw_data: Json
          timestamp: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string | null
          headers?: Json | null
          id?: string
          method?: string | null
          raw_data: Json
          timestamp?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string | null
          headers?: Json | null
          id?: string
          method?: string | null
          raw_data?: Json
          timestamp?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          code: string | null
          created_at: string
          id: string
          is_active: boolean | null
          manager_name: string | null
          name: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          manager_name?: string | null
          name: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          manager_name?: string | null
          name?: string
        }
        Relationships: []
      }
      deposit_reconciliation_history: {
        Row: {
          action: string
          cash_deposit_id: string
          created_at: string
          id: string
          new_expected_amount: number | null
          new_status: string | null
          new_variance_explanation: string | null
          notes: string | null
          old_expected_amount: number | null
          old_status: string | null
          old_variance_explanation: string | null
          performed_by: string | null
          reconciliation_id: string | null
        }
        Insert: {
          action: string
          cash_deposit_id: string
          created_at?: string
          id?: string
          new_expected_amount?: number | null
          new_status?: string | null
          new_variance_explanation?: string | null
          notes?: string | null
          old_expected_amount?: number | null
          old_status?: string | null
          old_variance_explanation?: string | null
          performed_by?: string | null
          reconciliation_id?: string | null
        }
        Update: {
          action?: string
          cash_deposit_id?: string
          created_at?: string
          id?: string
          new_expected_amount?: number | null
          new_status?: string | null
          new_variance_explanation?: string | null
          notes?: string | null
          old_expected_amount?: number | null
          old_status?: string | null
          old_variance_explanation?: string | null
          performed_by?: string | null
          reconciliation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deposit_reconciliation_history_cash_deposit_id_fkey"
            columns: ["cash_deposit_id"]
            isOneToOne: false
            referencedRelation: "cash_deposits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposit_reconciliation_history_reconciliation_id_fkey"
            columns: ["reconciliation_id"]
            isOneToOne: false
            referencedRelation: "deposit_reconciliations"
            referencedColumns: ["id"]
          },
        ]
      }
      deposit_reconciliations: {
        Row: {
          actual_deposit: number | null
          business_date: string
          created_at: string | null
          deposit_count: number | null
          expected_am_shift: number | null
          expected_amount: number | null
          expected_deposit: number | null
          expected_pm_shift: number | null
          house_account_closures: number | null
          house_account_count: number | null
          id: string
          net_variance: number | null
          notes: string | null
          reconciled_at: string | null
          reconciled_by: string | null
          status: string
          store_number: string
          updated_at: string | null
          variance: number | null
          variance_amount: number | null
          variance_explained: number | null
        }
        Insert: {
          actual_deposit?: number | null
          business_date: string
          created_at?: string | null
          deposit_count?: number | null
          expected_am_shift?: number | null
          expected_amount?: number | null
          expected_deposit?: number | null
          expected_pm_shift?: number | null
          house_account_closures?: number | null
          house_account_count?: number | null
          id?: string
          net_variance?: number | null
          notes?: string | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          status?: string
          store_number: string
          updated_at?: string | null
          variance?: number | null
          variance_amount?: number | null
          variance_explained?: number | null
        }
        Update: {
          actual_deposit?: number | null
          business_date?: string
          created_at?: string | null
          deposit_count?: number | null
          expected_am_shift?: number | null
          expected_amount?: number | null
          expected_deposit?: number | null
          expected_pm_shift?: number | null
          house_account_closures?: number | null
          house_account_count?: number | null
          id?: string
          net_variance?: number | null
          notes?: string | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          status?: string
          store_number?: string
          updated_at?: string | null
          variance?: number | null
          variance_amount?: number | null
          variance_explained?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deposit_reconciliations_store_number_fkey"
            columns: ["store_number"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_number"]
          },
          {
            foreignKeyName: "deposit_reconciliations_store_number_fkey"
            columns: ["store_number"]
            isOneToOne: false
            referencedRelation: "v_employee_expense_summary"
            referencedColumns: ["store_number"]
          },
          {
            foreignKeyName: "deposit_reconciliations_store_number_fkey"
            columns: ["store_number"]
            isOneToOne: false
            referencedRelation: "v_store_monthly_spending"
            referencedColumns: ["store_number"]
          },
        ]
      }
      deposit_submission_log: {
        Row: {
          created_at: string | null
          error_message: string | null
          form_data: Json
          id: string
          ip_address: unknown
          related_record_id: string
          related_table: string
          submission_type: string
          submitted_at: string | null
          submitted_by_name: string | null
          success: boolean
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          form_data: Json
          id?: string
          ip_address?: unknown
          related_record_id: string
          related_table: string
          submission_type: string
          submitted_at?: string | null
          submitted_by_name?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          form_data?: Json
          id?: string
          ip_address?: unknown
          related_record_id?: string
          related_table?: string
          submission_type?: string
          submitted_at?: string | null
          submitted_by_name?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          content: Json
          created_at: string
          created_by: string | null
          id: string
          name: string
          recipient_count: number | null
          sent_at: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          recipient_count?: number | null
          sent_at?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          recipient_count?: number | null
          sent_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          category: string
          created_at: string
          description: string | null
          email_body: string
          id: string
          subject_line: string
          template_key: string
          template_name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          email_body: string
          id?: string
          subject_line: string
          template_key: string
          template_name: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          email_body?: string
          id?: string
          subject_line?: string
          template_key?: string
          template_name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      employee_onboarding: {
        Row: {
          company_policies: string | null
          created_at: string | null
          email: string | null
          emergency_contacts: string | null
          experience: string | null
          first_name: string | null
          form_i9: string | null
          hire_date: string | null
          id: number
          last_name: string | null
          manager: string | null
          onboarding_status: string | null
          override_status: string | null
          override_status_by: string | null
          override_status_on: string | null
          payment_options: string | null
          prehire: string | null
          processed_at: string | null
          review_documents: string | null
          tax_withholding: string | null
          updated_at: string | null
          upload_documents: string | null
        }
        Insert: {
          company_policies?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contacts?: string | null
          experience?: string | null
          first_name?: string | null
          form_i9?: string | null
          hire_date?: string | null
          id?: number
          last_name?: string | null
          manager?: string | null
          onboarding_status?: string | null
          override_status?: string | null
          override_status_by?: string | null
          override_status_on?: string | null
          payment_options?: string | null
          prehire?: string | null
          processed_at?: string | null
          review_documents?: string | null
          tax_withholding?: string | null
          updated_at?: string | null
          upload_documents?: string | null
        }
        Update: {
          company_policies?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contacts?: string | null
          experience?: string | null
          first_name?: string | null
          form_i9?: string | null
          hire_date?: string | null
          id?: number
          last_name?: string | null
          manager?: string | null
          onboarding_status?: string | null
          override_status?: string | null
          override_status_by?: string | null
          override_status_on?: string | null
          payment_options?: string | null
          prehire?: string | null
          processed_at?: string | null
          review_documents?: string | null
          tax_withholding?: string | null
          updated_at?: string | null
          upload_documents?: string | null
        }
        Relationships: []
      }
      employee_training_completions: {
        Row: {
          completed_date: string | null
          created_at: string | null
          employee_id: string
          employee_name: string | null
          id: string
          import_batch_id: string | null
          is_completed: boolean | null
          market: string | null
          metric_date: string | null
          module_view_time: number | null
          position: string | null
          status: string | null
          store_number: string | null
          training_duration: number | null
          training_title: string
        }
        Insert: {
          completed_date?: string | null
          created_at?: string | null
          employee_id: string
          employee_name?: string | null
          id?: string
          import_batch_id?: string | null
          is_completed?: boolean | null
          market?: string | null
          metric_date?: string | null
          module_view_time?: number | null
          position?: string | null
          status?: string | null
          store_number?: string | null
          training_duration?: number | null
          training_title: string
        }
        Update: {
          completed_date?: string | null
          created_at?: string | null
          employee_id?: string
          employee_name?: string | null
          id?: string
          import_batch_id?: string | null
          is_completed?: boolean | null
          market?: string | null
          metric_date?: string | null
          module_view_time?: number | null
          position?: string | null
          status?: string | null
          store_number?: string | null
          training_duration?: number | null
          training_title?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          certification_achieved_date: string | null
          certification_request_id: string | null
          created_at: string | null
          full_name: string
          id: string
          is_active: boolean | null
          is_certified_manager: boolean | null
          position_id: string | null
          profile_id: string | null
          store_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          certification_achieved_date?: string | null
          certification_request_id?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          is_certified_manager?: boolean | null
          position_id?: string | null
          profile_id?: string | null
          store_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          certification_achieved_date?: string | null
          certification_request_id?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          is_certified_manager?: boolean | null
          position_id?: string | null
          profile_id?: string | null
          store_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_certification_request_id_fkey"
            columns: ["certification_request_id"]
            isOneToOne: false
            referencedRelation: "certification_requests"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "employees_store_number_fkey"
            columns: ["store_number"]
            isOneToOne: false
            referencedRelation: "v_employee_expense_summary"
            referencedColumns: ["store_number"]
          },
          {
            foreignKeyName: "employees_store_number_fkey"
            columns: ["store_number"]
            isOneToOne: false
            referencedRelation: "v_store_monthly_spending"
            referencedColumns: ["store_number"]
          },
        ]
      }
      escalation_log: {
        Row: {
          created_at: string
          escalated_at: string
          escalated_by: string | null
          escalated_from: string
          escalated_to: string
          escalation_reason: string
          executive_notes: string | null
          feedback_id: string
          id: string
          resolved_at: string | null
        }
        Insert: {
          created_at?: string
          escalated_at?: string
          escalated_by?: string | null
          escalated_from: string
          escalated_to: string
          escalation_reason: string
          executive_notes?: string | null
          feedback_id: string
          id?: string
          resolved_at?: string | null
        }
        Update: {
          created_at?: string
          escalated_at?: string
          escalated_by?: string | null
          escalated_from?: string
          escalated_to?: string
          escalation_reason?: string
          executive_notes?: string | null
          feedback_id?: string
          id?: string
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escalation_log_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "customer_feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_report_items: {
        Row: {
          created_at: string | null
          id: string
          report_id: string
          transaction_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          report_id: string
          transaction_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          report_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_report_items_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "expense_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_report_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "amex_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_reports: {
        Row: {
          created_at: string | null
          id: string
          paid_at: string | null
          profile_id: string
          report_period_end: string
          report_period_start: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submitted_at: string | null
          submitted_by: string | null
          total_amount: number | null
          transaction_count: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          paid_at?: string | null
          profile_id: string
          report_period_end: string
          report_period_start: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          total_amount?: number | null
          transaction_count?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          paid_at?: string | null
          profile_id?: string
          report_period_end?: string
          report_period_start?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          total_amount?: number | null
          transaction_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_employee_expense_summary"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "expense_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "v_employee_expense_summary"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "expense_reports_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_reports_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "v_employee_expense_summary"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      guest_feedback_notes: {
        Row: {
          created_at: string
          created_by_name: string
          created_by_user_id: string
          feedback_id: string
          id: string
          mentioned_users: string[] | null
          note_text: string
          note_type: string
        }
        Insert: {
          created_at?: string
          created_by_name: string
          created_by_user_id: string
          feedback_id: string
          id?: string
          mentioned_users?: string[] | null
          note_text: string
          note_type: string
        }
        Update: {
          created_at?: string
          created_by_name?: string
          created_by_user_id?: string
          feedback_id?: string
          id?: string
          mentioned_users?: string[] | null
          note_text?: string
          note_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_feedback_notes_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "customer_feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      house_account_customers: {
        Row: {
          created_at: string | null
          current_balance: number | null
          email: string | null
          id: string
          is_active: boolean | null
          last_transaction_date: string | null
          name: string
          notes: string | null
          phone: string | null
          status: string | null
          store_number: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_balance?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_transaction_date?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          store_number?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_balance?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_transaction_date?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          store_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      house_account_transactions: {
        Row: {
          closed_at: string | null
          closed_by_user_id: string | null
          created_at: string | null
          created_by_user_id: string | null
          house_account_customer_id: string
          id: string
          notes: string | null
          order_amount: number
          order_date: string
          paid_date: string | null
          payment_method: string | null
          payment_notes: string | null
          status: string
          store_number: string
          updated_at: string | null
        }
        Insert: {
          closed_at?: string | null
          closed_by_user_id?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          house_account_customer_id: string
          id?: string
          notes?: string | null
          order_amount: number
          order_date: string
          paid_date?: string | null
          payment_method?: string | null
          payment_notes?: string | null
          status?: string
          store_number: string
          updated_at?: string | null
        }
        Update: {
          closed_at?: string | null
          closed_by_user_id?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          house_account_customer_id?: string
          id?: string
          notes?: string | null
          order_amount?: number
          order_date?: string
          paid_date?: string | null
          payment_method?: string | null
          payment_notes?: string | null
          status?: string
          store_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "house_account_transactions_house_account_customer_id_fkey"
            columns: ["house_account_customer_id"]
            isOneToOne: false
            referencedRelation: "house_account_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "house_account_transactions_store_number_fkey"
            columns: ["store_number"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_number"]
          },
          {
            foreignKeyName: "house_account_transactions_store_number_fkey"
            columns: ["store_number"]
            isOneToOne: false
            referencedRelation: "v_employee_expense_summary"
            referencedColumns: ["store_number"]
          },
          {
            foreignKeyName: "house_account_transactions_store_number_fkey"
            columns: ["store_number"]
            isOneToOne: false
            referencedRelation: "v_store_monthly_spending"
            referencedColumns: ["store_number"]
          },
        ]
      }
      hr_notification_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          notification_type: string
          read_at: string | null
          recipient_email: string
          sent_at: string
          status: string
          ticket_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          notification_type: string
          read_at?: string | null
          recipient_email: string
          sent_at?: string
          status?: string
          ticket_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          notification_type?: string
          read_at?: string | null
          recipient_email?: string
          sent_at?: string
          status?: string
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_notification_log_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "payroll_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      import_batches: {
        Row: {
          batch_name: string
          completed_count: number | null
          completion_rate: number | null
          created_at: string | null
          file_hash: string | null
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
          file_hash?: string | null
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
          file_hash?: string | null
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
      internal_feedback: {
        Row: {
          archived: boolean
          archived_at: string | null
          browser_info: Json | null
          category: string
          created_at: string
          description: string
          id: string
          page_context: string | null
          page_url: string | null
          priority: string
          screenshot_path: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          archived_at?: string | null
          browser_info?: Json | null
          category: string
          created_at?: string
          description: string
          id?: string
          page_context?: string | null
          page_url?: string | null
          priority?: string
          screenshot_path?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          archived_at?: string | null
          browser_info?: Json | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          page_context?: string | null
          page_url?: string | null
          priority?: string
          screenshot_path?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      manager_approval_notifications: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          manager_user_id: string | null
          requested_at: string
          reviewed_at: string | null
          reviewer_notes: string | null
          status: string
          template_item_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          manager_user_id?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewer_notes?: string | null
          status?: string
          template_item_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          manager_user_id?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewer_notes?: string | null
          status?: string
          template_item_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manager_approval_notifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "certified_managers_registry"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "manager_approval_notifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manager_approval_notifications_template_item_id_fkey"
            columns: ["template_item_id"]
            isOneToOne: false
            referencedRelation: "career_path_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      manager_certification_requests: {
        Row: {
          approved_at: string | null
          created_at: string
          dm_email: string
          dm_name: string
          dm_position: string
          employee_id: string | null
          id: string
          market: string
          position_name: string
          rejected_at: string | null
          rejection_reason: string | null
          request_notes: string | null
          requested_at: string
          requester_user_id: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          store_number: string
          trainee_email: string
          trainee_fast_track_username: string
          trainee_home_store_number: string
          trainee_name: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          dm_email?: string
          dm_name?: string
          dm_position?: string
          employee_id?: string | null
          id?: string
          market: string
          position_name: string
          rejected_at?: string | null
          rejection_reason?: string | null
          request_notes?: string | null
          requested_at?: string
          requester_user_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          store_number: string
          trainee_email?: string
          trainee_fast_track_username?: string
          trainee_home_store_number?: string
          trainee_name?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          dm_email?: string
          dm_name?: string
          dm_position?: string
          employee_id?: string | null
          id?: string
          market?: string
          position_name?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          request_notes?: string | null
          requested_at?: string
          requester_user_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          store_number?: string
          trainee_email?: string
          trainee_fast_track_username?: string
          trainee_home_store_number?: string
          trainee_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      manager_reminder_log: {
        Row: {
          created_at: string | null
          id: string
          recipient_email: string
          reminder_level: string
          sent_at: string | null
          status: string | null
          ticket_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          recipient_email: string
          reminder_level: string
          sent_at?: string | null
          status?: string | null
          ticket_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          recipient_email?: string
          reminder_level?: string
          sent_at?: string | null
          status?: string | null
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manager_reminder_log_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "payroll_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      manager_review_log: {
        Row: {
          action: string
          created_at: string
          id: string
          manager_id: string
          notes: string | null
          reviewed_at: string
          ticket_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          manager_id: string
          notes?: string | null
          reviewed_at?: string
          ticket_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          manager_id?: string
          notes?: string | null
          reviewed_at?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manager_review_log_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "manager_review_log_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "payroll_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      market_sales_by_period: {
        Row: {
          avg_order_value: number | null
          created_at: string | null
          id: string
          market_code: string
          market_name: string
          period_id: string | null
          store_count: number | null
          total_orders: number | null
          total_sales: number | null
        }
        Insert: {
          avg_order_value?: number | null
          created_at?: string | null
          id?: string
          market_code: string
          market_name: string
          period_id?: string | null
          store_count?: number | null
          total_orders?: number | null
          total_sales?: number | null
        }
        Update: {
          avg_order_value?: number | null
          created_at?: string | null
          id?: string
          market_code?: string
          market_name?: string
          period_id?: string | null
          store_count?: number | null
          total_orders?: number | null
          total_sales?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_sales_by_period_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "sales_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      market_sales_data: {
        Row: {
          area_manager: string | null
          created_at: string
          id: string
          market_code: string
          market_name: string
          period_id: string | null
          total_orders: number | null
          total_sales: number | null
        }
        Insert: {
          area_manager?: string | null
          created_at?: string
          id?: string
          market_code: string
          market_name: string
          period_id?: string | null
          total_orders?: number | null
          total_sales?: number | null
        }
        Update: {
          area_manager?: string | null
          created_at?: string
          id?: string
          market_code?: string
          market_name?: string
          period_id?: string | null
          total_orders?: number | null
          total_sales?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_sales_data_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "sales_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      markets: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      new_hire_setup_tasks: {
        Row: {
          adp_employee_id: string | null
          adp_user_id: string | null
          airport_background_check_complete: boolean | null
          airport_background_check_complete_at: string | null
          airport_badge_issued: boolean | null
          airport_badge_issued_at: string | null
          airport_badge_pickup_appointment_date: string | null
          airport_badge_request_sent: boolean | null
          airport_badge_request_sent_at: string | null
          airport_fingerprint_appointment_date: string | null
          airport_fingerprinting_complete: boolean | null
          airport_fingerprinting_complete_at: string | null
          associate_id: string | null
          clearance_email_sent: boolean | null
          clearance_email_sent_at: string | null
          company_policies_complete: boolean | null
          company_policies_completed_at: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          drivers_license_verified: boolean | null
          drivers_license_verified_at: string | null
          emergency_contacts_complete: boolean | null
          emergency_contacts_completed_at: string | null
          fhc_complete: boolean | null
          fhc_completed_at: string | null
          handbook_signed: boolean | null
          handbook_signed_at: string | null
          i9_complete: boolean | null
          i9_completed_at: string | null
          i9_documents_received: boolean | null
          i9_list_a_document_number: string | null
          i9_list_a_document_type: string | null
          i9_list_a_expiration: string | null
          i9_list_a_issuing_authority: string | null
          i9_list_b_document_number: string | null
          i9_list_b_document_type: string | null
          i9_list_b_expiration: string | null
          i9_list_b_issuing_authority: string | null
          i9_list_c_document_number: string | null
          i9_list_c_document_type: string | null
          i9_list_c_expiration: string | null
          i9_list_c_issuing_authority: string | null
          i9_video_call_complete: boolean | null
          id: string
          insurance_card_verified: boolean | null
          insurance_card_verified_at: string | null
          insurance_info_verified: boolean | null
          insurance_info_verified_at: string | null
          makeshift_sent: boolean | null
          makeshift_sent_at: string | null
          mvr_approved: boolean | null
          mvr_approved_at: string | null
          mvr_clearance_at: string | null
          mvr_clearance_complete: boolean | null
          new_hire_id: string
          oe_sent_complete: boolean | null
          oe_sent_completed_at: string | null
          onboarding_sent: boolean | null
          onboarding_sent_at: string | null
          payment_options_complete: boolean | null
          payment_options_completed_at: string | null
          review_documents_complete: boolean | null
          review_documents_completed_at: string | null
          servsafe_complete: boolean | null
          servsafe_completed_at: string | null
          tax_withholding_complete: boolean | null
          tax_withholding_completed_at: string | null
          updated_at: string
          upload_documents_complete: boolean | null
          upload_documents_completed_at: string | null
          welcome_text_sent: boolean | null
          welcome_text_sent_at: string | null
        }
        Insert: {
          adp_employee_id?: string | null
          adp_user_id?: string | null
          airport_background_check_complete?: boolean | null
          airport_background_check_complete_at?: string | null
          airport_badge_issued?: boolean | null
          airport_badge_issued_at?: string | null
          airport_badge_pickup_appointment_date?: string | null
          airport_badge_request_sent?: boolean | null
          airport_badge_request_sent_at?: string | null
          airport_fingerprint_appointment_date?: string | null
          airport_fingerprinting_complete?: boolean | null
          airport_fingerprinting_complete_at?: string | null
          associate_id?: string | null
          clearance_email_sent?: boolean | null
          clearance_email_sent_at?: string | null
          company_policies_complete?: boolean | null
          company_policies_completed_at?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          drivers_license_verified?: boolean | null
          drivers_license_verified_at?: string | null
          emergency_contacts_complete?: boolean | null
          emergency_contacts_completed_at?: string | null
          fhc_complete?: boolean | null
          fhc_completed_at?: string | null
          handbook_signed?: boolean | null
          handbook_signed_at?: string | null
          i9_complete?: boolean | null
          i9_completed_at?: string | null
          i9_documents_received?: boolean | null
          i9_list_a_document_number?: string | null
          i9_list_a_document_type?: string | null
          i9_list_a_expiration?: string | null
          i9_list_a_issuing_authority?: string | null
          i9_list_b_document_number?: string | null
          i9_list_b_document_type?: string | null
          i9_list_b_expiration?: string | null
          i9_list_b_issuing_authority?: string | null
          i9_list_c_document_number?: string | null
          i9_list_c_document_type?: string | null
          i9_list_c_expiration?: string | null
          i9_list_c_issuing_authority?: string | null
          i9_video_call_complete?: boolean | null
          id?: string
          insurance_card_verified?: boolean | null
          insurance_card_verified_at?: string | null
          insurance_info_verified?: boolean | null
          insurance_info_verified_at?: string | null
          makeshift_sent?: boolean | null
          makeshift_sent_at?: string | null
          mvr_approved?: boolean | null
          mvr_approved_at?: string | null
          mvr_clearance_at?: string | null
          mvr_clearance_complete?: boolean | null
          new_hire_id: string
          oe_sent_complete?: boolean | null
          oe_sent_completed_at?: string | null
          onboarding_sent?: boolean | null
          onboarding_sent_at?: string | null
          payment_options_complete?: boolean | null
          payment_options_completed_at?: string | null
          review_documents_complete?: boolean | null
          review_documents_completed_at?: string | null
          servsafe_complete?: boolean | null
          servsafe_completed_at?: string | null
          tax_withholding_complete?: boolean | null
          tax_withholding_completed_at?: string | null
          updated_at?: string
          upload_documents_complete?: boolean | null
          upload_documents_completed_at?: string | null
          welcome_text_sent?: boolean | null
          welcome_text_sent_at?: string | null
        }
        Update: {
          adp_employee_id?: string | null
          adp_user_id?: string | null
          airport_background_check_complete?: boolean | null
          airport_background_check_complete_at?: string | null
          airport_badge_issued?: boolean | null
          airport_badge_issued_at?: string | null
          airport_badge_pickup_appointment_date?: string | null
          airport_badge_request_sent?: boolean | null
          airport_badge_request_sent_at?: string | null
          airport_fingerprint_appointment_date?: string | null
          airport_fingerprinting_complete?: boolean | null
          airport_fingerprinting_complete_at?: string | null
          associate_id?: string | null
          clearance_email_sent?: boolean | null
          clearance_email_sent_at?: string | null
          company_policies_complete?: boolean | null
          company_policies_completed_at?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          drivers_license_verified?: boolean | null
          drivers_license_verified_at?: string | null
          emergency_contacts_complete?: boolean | null
          emergency_contacts_completed_at?: string | null
          fhc_complete?: boolean | null
          fhc_completed_at?: string | null
          handbook_signed?: boolean | null
          handbook_signed_at?: string | null
          i9_complete?: boolean | null
          i9_completed_at?: string | null
          i9_documents_received?: boolean | null
          i9_list_a_document_number?: string | null
          i9_list_a_document_type?: string | null
          i9_list_a_expiration?: string | null
          i9_list_a_issuing_authority?: string | null
          i9_list_b_document_number?: string | null
          i9_list_b_document_type?: string | null
          i9_list_b_expiration?: string | null
          i9_list_b_issuing_authority?: string | null
          i9_list_c_document_number?: string | null
          i9_list_c_document_type?: string | null
          i9_list_c_expiration?: string | null
          i9_list_c_issuing_authority?: string | null
          i9_video_call_complete?: boolean | null
          id?: string
          insurance_card_verified?: boolean | null
          insurance_card_verified_at?: string | null
          insurance_info_verified?: boolean | null
          insurance_info_verified_at?: string | null
          makeshift_sent?: boolean | null
          makeshift_sent_at?: string | null
          mvr_approved?: boolean | null
          mvr_approved_at?: string | null
          mvr_clearance_at?: string | null
          mvr_clearance_complete?: boolean | null
          new_hire_id?: string
          oe_sent_complete?: boolean | null
          oe_sent_completed_at?: string | null
          onboarding_sent?: boolean | null
          onboarding_sent_at?: string | null
          payment_options_complete?: boolean | null
          payment_options_completed_at?: string | null
          review_documents_complete?: boolean | null
          review_documents_completed_at?: string | null
          servsafe_complete?: boolean | null
          servsafe_completed_at?: string | null
          tax_withholding_complete?: boolean | null
          tax_withholding_completed_at?: string | null
          updated_at?: string
          upload_documents_complete?: boolean | null
          upload_documents_completed_at?: string | null
          welcome_text_sent?: boolean | null
          welcome_text_sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "new_hire_setup_tasks_new_hire_id_fkey"
            columns: ["new_hire_id"]
            isOneToOne: false
            referencedRelation: "new_hire_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      new_hire_submissions: {
        Row: {
          annual_salary: number | null
          applicant_email: string
          applicant_phone: string
          auto_insurance_carrier: string | null
          created_at: string
          date_of_birth: string | null
          drivers_license_number: string | null
          drivers_license_state: string | null
          email_address: string
          employment_type: string | null
          estimated_start_date: string
          fhc_expiration: string | null
          fhc_number: string | null
          first_name: string
          has_food_handlers_card: boolean | null
          has_servsafe: boolean | null
          hiring_manager: string
          id: string
          id_expiration_date: string | null
          id_number: string | null
          id_photo_back_url: string | null
          id_photo_front_url: string | null
          id_photo_uploaded_at: string | null
          id_type: string | null
          id_upload_requested_at: string | null
          id_upload_token: string | null
          id_upload_token_expires_at: string | null
          is_airport_store: boolean | null
          is_rehire: boolean | null
          last_name: string
          license_expiration_date: string | null
          market: string
          middle_name: string | null
          mvr_approval: boolean | null
          policy_expiration_date: string | null
          policy_number: string | null
          position: string
          referral_name: string | null
          security_clearance_notes: string | null
          security_clearance_required: boolean | null
          security_clearance_status: string | null
          servsafe_expiration: string | null
          servsafe_number: string | null
          sign_on_bonus: string | null
          state_of_residence: string | null
          status: string | null
          store_number: string
          submitted_by: string | null
          updated_at: string
          wage: number
          wage_within_scale: string | null
          will_be_driving: boolean | null
        }
        Insert: {
          annual_salary?: number | null
          applicant_email: string
          applicant_phone: string
          auto_insurance_carrier?: string | null
          created_at?: string
          date_of_birth?: string | null
          drivers_license_number?: string | null
          drivers_license_state?: string | null
          email_address: string
          employment_type?: string | null
          estimated_start_date: string
          fhc_expiration?: string | null
          fhc_number?: string | null
          first_name: string
          has_food_handlers_card?: boolean | null
          has_servsafe?: boolean | null
          hiring_manager: string
          id?: string
          id_expiration_date?: string | null
          id_number?: string | null
          id_photo_back_url?: string | null
          id_photo_front_url?: string | null
          id_photo_uploaded_at?: string | null
          id_type?: string | null
          id_upload_requested_at?: string | null
          id_upload_token?: string | null
          id_upload_token_expires_at?: string | null
          is_airport_store?: boolean | null
          is_rehire?: boolean | null
          last_name: string
          license_expiration_date?: string | null
          market: string
          middle_name?: string | null
          mvr_approval?: boolean | null
          policy_expiration_date?: string | null
          policy_number?: string | null
          position: string
          referral_name?: string | null
          security_clearance_notes?: string | null
          security_clearance_required?: boolean | null
          security_clearance_status?: string | null
          servsafe_expiration?: string | null
          servsafe_number?: string | null
          sign_on_bonus?: string | null
          state_of_residence?: string | null
          status?: string | null
          store_number: string
          submitted_by?: string | null
          updated_at?: string
          wage: number
          wage_within_scale?: string | null
          will_be_driving?: boolean | null
        }
        Update: {
          annual_salary?: number | null
          applicant_email?: string
          applicant_phone?: string
          auto_insurance_carrier?: string | null
          created_at?: string
          date_of_birth?: string | null
          drivers_license_number?: string | null
          drivers_license_state?: string | null
          email_address?: string
          employment_type?: string | null
          estimated_start_date?: string
          fhc_expiration?: string | null
          fhc_number?: string | null
          first_name?: string
          has_food_handlers_card?: boolean | null
          has_servsafe?: boolean | null
          hiring_manager?: string
          id?: string
          id_expiration_date?: string | null
          id_number?: string | null
          id_photo_back_url?: string | null
          id_photo_front_url?: string | null
          id_photo_uploaded_at?: string | null
          id_type?: string | null
          id_upload_requested_at?: string | null
          id_upload_token?: string | null
          id_upload_token_expires_at?: string | null
          is_airport_store?: boolean | null
          is_rehire?: boolean | null
          last_name?: string
          license_expiration_date?: string | null
          market?: string
          middle_name?: string | null
          mvr_approval?: boolean | null
          policy_expiration_date?: string | null
          policy_number?: string | null
          position?: string
          referral_name?: string | null
          security_clearance_notes?: string | null
          security_clearance_required?: boolean | null
          security_clearance_status?: string | null
          servsafe_expiration?: string | null
          servsafe_number?: string | null
          sign_on_bonus?: string | null
          state_of_residence?: string | null
          status?: string | null
          store_number?: string
          submitted_by?: string | null
          updated_at?: string
          wage?: number
          wage_within_scale?: string | null
          will_be_driving?: boolean | null
        }
        Relationships: []
      }
      notification_log: {
        Row: {
          error_message: string | null
          id: string
          notification_type: string
          read_at: string | null
          recipient_email: string
          sent_at: string
          status: string | null
          work_order_id: string | null
        }
        Insert: {
          error_message?: string | null
          id?: string
          notification_type: string
          read_at?: string | null
          recipient_email: string
          sent_at?: string
          status?: string | null
          work_order_id?: string | null
        }
        Update: {
          error_message?: string | null
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
      onboarding_steps: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
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
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "v_store_monthly_spending"
            referencedColumns: ["store_id"]
          },
        ]
      }
      orders_backup: {
        Row: {
          business_date: string | null
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
          order_id: number | null
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
          business_date?: string | null
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
          order_id?: number | null
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
          business_date?: string | null
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
          order_id?: number | null
          order_reference?: string | null
          order_total?: number | null
          original_order_id?: string | null
          processed_at?: string | null
          source_file?: string | null
          store_id?: number | null
          sub_total?: number | null
          tax?: number | null
        }
        Relationships: []
      }
      payroll_ticket_comments: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string
          id: string
          is_internal: boolean
          parent_id: string | null
          ticket_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string
          id?: string
          is_internal?: boolean
          parent_id?: string | null
          ticket_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          parent_id?: string | null
          ticket_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_ticket_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "payroll_ticket_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "payroll_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_ticket_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payroll_ticket_history: {
        Row: {
          action: string
          changed_at: string
          changed_by: string | null
          field_changed: string | null
          id: string
          new_value: string | null
          notes: string | null
          old_value: string | null
          ticket_id: string
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: string | null
          field_changed?: string | null
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          ticket_id: string
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string | null
          field_changed?: string | null
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_ticket_history_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "payroll_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_tickets: {
        Row: {
          acknowledgment_confirmed: boolean | null
          affected_employee_id: string | null
          affected_employee_name: string | null
          assigned_to: string | null
          attachments: Json | null
          closed_at: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          date_of_birth: string | null
          description: string
          employee_visible_notes: string | null
          expected_resolution_date: string | null
          hr_specialist: string | null
          id: string
          internal_notes: string[] | null
          main_category: string | null
          manager_email: string | null
          manager_id: string | null
          manager_name: string | null
          manager_review_action: string | null
          manager_review_notes: string | null
          manager_reviewed_at: string | null
          market: string
          pay_period_end: string | null
          pay_period_start: string | null
          payroll_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          ssn_last_four: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          store_number: string
          sub_category: string | null
          submitted_by: string | null
          submitter_type: string
          ticket_number: string
          updated_at: string
          urgency_level: Database["public"]["Enums"]["ticket_urgency"]
          verification_method: string | null
        }
        Insert: {
          acknowledgment_confirmed?: boolean | null
          affected_employee_id?: string | null
          affected_employee_name?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          closed_at?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          date_of_birth?: string | null
          description: string
          employee_visible_notes?: string | null
          expected_resolution_date?: string | null
          hr_specialist?: string | null
          id?: string
          internal_notes?: string[] | null
          main_category?: string | null
          manager_email?: string | null
          manager_id?: string | null
          manager_name?: string | null
          manager_review_action?: string | null
          manager_review_notes?: string | null
          manager_reviewed_at?: string | null
          market: string
          pay_period_end?: string | null
          pay_period_start?: string | null
          payroll_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          ssn_last_four?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          store_number: string
          sub_category?: string | null
          submitted_by?: string | null
          submitter_type: string
          ticket_number?: string
          updated_at?: string
          urgency_level?: Database["public"]["Enums"]["ticket_urgency"]
          verification_method?: string | null
        }
        Update: {
          acknowledgment_confirmed?: boolean | null
          affected_employee_id?: string | null
          affected_employee_name?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          closed_at?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          date_of_birth?: string | null
          description?: string
          employee_visible_notes?: string | null
          expected_resolution_date?: string | null
          hr_specialist?: string | null
          id?: string
          internal_notes?: string[] | null
          main_category?: string | null
          manager_email?: string | null
          manager_id?: string | null
          manager_name?: string | null
          manager_review_action?: string | null
          manager_review_notes?: string | null
          manager_reviewed_at?: string | null
          market?: string
          pay_period_end?: string | null
          pay_period_start?: string | null
          payroll_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          ssn_last_four?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          store_number?: string
          sub_category?: string | null
          submitted_by?: string | null
          submitter_type?: string
          ticket_number?: string
          updated_at?: string
          urgency_level?: Database["public"]["Enums"]["ticket_urgency"]
          verification_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_tickets_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      pending_ticket_reviews: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          manager_email: string
          session_token: string
          ticket_id: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          manager_email: string
          session_token: string
          ticket_id: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          manager_email?: string
          session_token?: string
          ticket_id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_ticket_reviews_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "payroll_tickets"
            referencedColumns: ["id"]
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
      portal_access_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          portal_id: string
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          portal_id: string
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          portal_id?: string
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      portal_access_definitions: {
        Row: {
          access_scope: Database["public"]["Enums"]["access_scope_type"] | null
          can_edit: boolean | null
          can_manage: boolean | null
          can_view: boolean | null
          created_at: string
          id: string
          portal_id: string
          portal_role_id: string
        }
        Insert: {
          access_scope?: Database["public"]["Enums"]["access_scope_type"] | null
          can_edit?: boolean | null
          can_manage?: boolean | null
          can_view?: boolean | null
          created_at?: string
          id?: string
          portal_id: string
          portal_role_id: string
        }
        Update: {
          access_scope?: Database["public"]["Enums"]["access_scope_type"] | null
          can_edit?: boolean | null
          can_manage?: boolean | null
          can_view?: boolean | null
          created_at?: string
          id?: string
          portal_id?: string
          portal_role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_access_definitions_portal_role_id_fkey"
            columns: ["portal_role_id"]
            isOneToOne: false
            referencedRelation: "portal_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          role_display_name: string
          role_name: Database["public"]["Enums"]["portal_role_type"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          role_display_name: string
          role_name: Database["public"]["Enums"]["portal_role_type"]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          role_display_name?: string
          role_name?: Database["public"]["Enums"]["portal_role_type"]
        }
        Relationships: []
      }
      portal_scope_assignments: {
        Row: {
          created_at: string | null
          id: string
          market: string | null
          portal_id: string
          region: string | null
          scope_level: Database["public"]["Enums"]["access_scope_type"]
          store_number: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          market?: string | null
          portal_id: string
          region?: string | null
          scope_level: Database["public"]["Enums"]["access_scope_type"]
          store_number?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          market?: string | null
          portal_id?: string
          region?: string | null
          scope_level?: Database["public"]["Enums"]["access_scope_type"]
          store_number?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      position_onboarding_requirements: {
        Row: {
          created_at: string | null
          id: string
          position_id: string
          requires_fhc: boolean | null
          requires_handbook: boolean | null
          requires_i9: boolean | null
          requires_mvr_clearance: boolean | null
          requires_servsafe: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          position_id: string
          requires_fhc?: boolean | null
          requires_handbook?: boolean | null
          requires_i9?: boolean | null
          requires_mvr_clearance?: boolean | null
          requires_servsafe?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          position_id?: string
          requires_fhc?: boolean | null
          requires_handbook?: boolean | null
          requires_i9?: boolean | null
          requires_mvr_clearance?: boolean | null
          requires_servsafe?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "position_onboarding_requirements_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: true
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
      }
      position_systems_requirements: {
        Row: {
          created_at: string | null
          id: string
          other_system_name: string | null
          position_id: string
          requires_adp_access: boolean | null
          requires_associate_id: boolean | null
          requires_makeshift: boolean | null
          requires_other_system: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          other_system_name?: string | null
          position_id: string
          requires_adp_access?: boolean | null
          requires_associate_id?: boolean | null
          requires_makeshift?: boolean | null
          requires_other_system?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          other_system_name?: string | null
          position_id?: string
          requires_adp_access?: boolean | null
          requires_associate_id?: boolean | null
          requires_makeshift?: boolean | null
          requires_other_system?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "position_systems_requirements_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: true
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
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
          slack_user_id: string | null
          store_id: number | null
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
          slack_user_id?: string | null
          store_id?: number | null
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
          slack_user_id?: string | null
          store_id?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "profiles_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "v_store_monthly_spending"
            referencedColumns: ["store_id"]
          },
        ]
      }
      rewards_transactions: {
        Row: {
          created_at: string | null
          customer_id: string | null
          description: string | null
          id: string
          order_id: number | null
          points_amount: number
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          order_id?: number | null
          points_amount: number
          transaction_date?: string
          transaction_type: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          order_id?: number | null
          points_amount?: number
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "rewards_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
          },
        ]
      }
      sales_funnel_activities: {
        Row: {
          activity_date: string
          activity_type: string
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          id: string
          notes: string | null
          stage: string
          store_id: number | null
          value: number | null
        }
        Insert: {
          activity_date?: string
          activity_type: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          id?: string
          notes?: string | null
          stage: string
          store_id?: number | null
          value?: number | null
        }
        Update: {
          activity_date?: string
          activity_type?: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          id?: string
          notes?: string | null
          stage?: string
          store_id?: number | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_funnel_activities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "sales_funnel_activities_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "sales_funnel_activities_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "v_store_monthly_spending"
            referencedColumns: ["store_id"]
          },
        ]
      }
      sales_periods: {
        Row: {
          created_at: string
          end_date: string
          id: string
          period_number: number
          start_date: string
          year: number
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          period_number: number
          start_date: string
          year: number
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          period_number?: number
          start_date?: string
          year?: number
        }
        Relationships: []
      }
      services_wsr: {
        Row: {
          amount: number
          class_code: string
          created_at: string | null
          description: string
          id: number
          legal_entity: string
          sales_item: string
          store_name: string
          store_number: number
          week_ending: string
        }
        Insert: {
          amount: number
          class_code: string
          created_at?: string | null
          description: string
          id?: number
          legal_entity: string
          sales_item: string
          store_name: string
          store_number: number
          week_ending: string
        }
        Update: {
          amount?: number
          class_code?: string
          created_at?: string | null
          description?: string
          id?: number
          legal_entity?: string
          sales_item?: string
          store_name?: string
          store_number?: number
          week_ending?: string
        }
        Relationships: []
      }
      sexual_harassment_training_completions: {
        Row: {
          certificate_url: string
          completion_date: string
          created_at: string | null
          employee_id: string | null
          employee_name: string
          expires_at: string
          id: string
          is_california_employee: boolean | null
          is_new_hire_completion: boolean | null
          market: string | null
          position_name: string | null
          region: string | null
          state: string
          status: string
          store_number: string
          training_type: string
          updated_at: string | null
          upload_notes: string | null
          uploaded_by: string | null
        }
        Insert: {
          certificate_url: string
          completion_date: string
          created_at?: string | null
          employee_id?: string | null
          employee_name: string
          expires_at: string
          id?: string
          is_california_employee?: boolean | null
          is_new_hire_completion?: boolean | null
          market?: string | null
          position_name?: string | null
          region?: string | null
          state: string
          status?: string
          store_number: string
          training_type: string
          updated_at?: string | null
          upload_notes?: string | null
          uploaded_by?: string | null
        }
        Update: {
          certificate_url?: string
          completion_date?: string
          created_at?: string | null
          employee_id?: string | null
          employee_name?: string
          expires_at?: string
          id?: string
          is_california_employee?: boolean | null
          is_new_hire_completion?: boolean | null
          market?: string | null
          position_name?: string | null
          region?: string | null
          state?: string
          status?: string
          store_number?: string
          training_type?: string
          updated_at?: string | null
          upload_notes?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      sla_notifications: {
        Row: {
          created_at: string
          feedback_id: string
          id: string
          notification_type: string
          sent_at: string
        }
        Insert: {
          created_at?: string
          feedback_id: string
          id?: string
          notification_type: string
          sent_at?: string
        }
        Update: {
          created_at?: string
          feedback_id?: string
          id?: string
          notification_type?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sla_notifications_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "customer_feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      store_region_groups: {
        Row: {
          created_at: string | null
          market: string
          region_group: string
        }
        Insert: {
          created_at?: string | null
          market: string
          region_group: string
        }
        Update: {
          created_at?: string | null
          market?: string
          region_group?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          email: string | null
          entity: string | null
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
          entity?: string | null
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
          entity?: string | null
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
      sync_history: {
        Row: {
          connection_id: string
          created_at: string | null
          error_message: string | null
          id: string
          status: string | null
          sync_completed_at: string | null
          sync_started_at: string
          transactions_added: number | null
          transactions_modified: number | null
          transactions_removed: number | null
        }
        Insert: {
          connection_id: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          status?: string | null
          sync_completed_at?: string | null
          sync_started_at: string
          transactions_added?: number | null
          transactions_modified?: number | null
          transactions_removed?: number | null
        }
        Update: {
          connection_id?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          status?: string | null
          sync_completed_at?: string | null
          sync_started_at?: string
          transactions_added?: number | null
          transactions_modified?: number | null
          transactions_removed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_history_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "amex_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      systems_access: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      training_catalog: {
        Row: {
          career_path_day: number | null
          category: string | null
          class: string | null
          created_at: string | null
          id: string
          is_live: boolean | null
          is_observation: boolean | null
          last_seen_date: string | null
          position: string[] | null
          training_name: string
          training_provider: string | null
          updated_at: string | null
        }
        Insert: {
          career_path_day?: number | null
          category?: string | null
          class?: string | null
          created_at?: string | null
          id?: string
          is_live?: boolean | null
          is_observation?: boolean | null
          last_seen_date?: string | null
          position?: string[] | null
          training_name: string
          training_provider?: string | null
          updated_at?: string | null
        }
        Update: {
          career_path_day?: number | null
          category?: string | null
          class?: string | null
          created_at?: string | null
          id?: string
          is_live?: boolean | null
          is_observation?: boolean | null
          last_seen_date?: string | null
          position?: string[] | null
          training_name?: string
          training_provider?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      training_company_avg: {
        Row: {
          avg_completion: number | null
          id: number
          inserted_at: string | null
          training: string | null
        }
        Insert: {
          avg_completion?: number | null
          id?: number
          inserted_at?: string | null
          training?: string | null
        }
        Update: {
          avg_completion?: number | null
          id?: number
          inserted_at?: string | null
          training?: string | null
        }
        Relationships: []
      }
      training_completion_detailed: {
        Row: {
          completion_pct: number | null
          employee_name: string | null
          id: number
          position: string | null
          source_type: string | null
          status_group: string | null
          store: string | null
          training: string | null
          uploaded_at: string | null
        }
        Insert: {
          completion_pct?: number | null
          employee_name?: string | null
          id?: number
          position?: string | null
          source_type?: string | null
          status_group?: string | null
          store?: string | null
          training?: string | null
          uploaded_at?: string | null
        }
        Update: {
          completion_pct?: number | null
          employee_name?: string | null
          id?: number
          position?: string | null
          source_type?: string | null
          status_group?: string | null
          store?: string | null
          training?: string | null
          uploaded_at?: string | null
        }
        Relationships: []
      }
      training_employee_avg: {
        Row: {
          avg_completion: number | null
          employee_name: string | null
          id: number
          inserted_at: string | null
          store: string | null
          training: string | null
        }
        Insert: {
          avg_completion?: number | null
          employee_name?: string | null
          id?: number
          inserted_at?: string | null
          store?: string | null
          training?: string | null
        }
        Update: {
          avg_completion?: number | null
          employee_name?: string | null
          id?: number
          inserted_at?: string | null
          store?: string | null
          training?: string | null
        }
        Relationships: []
      }
      training_records: {
        Row: {
          assigned_date: string | null
          completed_date: string | null
          completion_pct: number | null
          created_at: string | null
          due_date: string | null
          employee_id: string | null
          employee_name: string | null
          id: string
          import_batch_id: string | null
          inserted_at: string | null
          module_view_time: number | null
          position: string | null
          registration_date: string | null
          sheet: string | null
          source_file: string | null
          start_date: string | null
          status: string | null
          status_group: string | null
          store: string | null
          store_id: string | null
          store_location: string | null
          store_number: string | null
          training: string | null
          training_duration: number | null
          training_hours: number | null
          training_id: string | null
          training_title: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_date?: string | null
          completed_date?: string | null
          completion_pct?: number | null
          created_at?: string | null
          due_date?: string | null
          employee_id?: string | null
          employee_name?: string | null
          id?: string
          import_batch_id?: string | null
          inserted_at?: string | null
          module_view_time?: number | null
          position?: string | null
          registration_date?: string | null
          sheet?: string | null
          source_file?: string | null
          start_date?: string | null
          status?: string | null
          status_group?: string | null
          store?: string | null
          store_id?: string | null
          store_location?: string | null
          store_number?: string | null
          training?: string | null
          training_duration?: number | null
          training_hours?: number | null
          training_id?: string | null
          training_title?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_date?: string | null
          completed_date?: string | null
          completion_pct?: number | null
          created_at?: string | null
          due_date?: string | null
          employee_id?: string | null
          employee_name?: string | null
          id?: string
          import_batch_id?: string | null
          inserted_at?: string | null
          module_view_time?: number | null
          position?: string | null
          registration_date?: string | null
          sheet?: string | null
          source_file?: string | null
          start_date?: string | null
          status?: string | null
          status_group?: string | null
          store?: string | null
          store_id?: string | null
          store_location?: string | null
          store_number?: string | null
          training?: string | null
          training_duration?: number | null
          training_hours?: number | null
          training_id?: string | null
          training_title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      training_store_avg: {
        Row: {
          avg_completion: number | null
          id: number
          inserted_at: string | null
          store: string | null
          training: string | null
        }
        Insert: {
          avg_completion?: number | null
          id?: number
          inserted_at?: string | null
          store?: string | null
          training?: string | null
        }
        Update: {
          avg_completion?: number | null
          id?: number
          inserted_at?: string | null
          store?: string | null
          training?: string | null
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
      user_market_permissions: {
        Row: {
          created_at: string | null
          id: string
          market_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          market_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          market_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_market_permissions_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          can_access_catering_dev: boolean | null
          can_access_facilities_dev: boolean | null
          can_access_guest_feedback_dev: boolean | null
          can_access_hr_dev: boolean | null
          can_access_kpi_dev: boolean | null
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
          can_access_kpi_dev?: boolean | null
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
          can_access_kpi_dev?: boolean | null
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
      user_portal_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          portal_role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          portal_role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          portal_role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_portal_roles_portal_role_id_fkey"
            columns: ["portal_role_id"]
            isOneToOne: false
            referencedRelation: "portal_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_store_permissions: {
        Row: {
          created_at: string | null
          id: string
          store_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          store_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          store_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_store_permissions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "user_store_permissions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "v_store_monthly_spending"
            referencedColumns: ["store_id"]
          },
        ]
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
          image_urls: Json | null
          is_recurring: boolean | null
          market: string
          notes: string[] | null
          parts_delivery_date: string | null
          previous_status: string | null
          priority: string
          recurrence_confidence_score: number | null
          recurrence_reason: string | null
          recurrence_source_id: string | null
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
          image_urls?: Json | null
          is_recurring?: boolean | null
          market: string
          notes?: string[] | null
          parts_delivery_date?: string | null
          previous_status?: string | null
          priority: string
          recurrence_confidence_score?: number | null
          recurrence_reason?: string | null
          recurrence_source_id?: string | null
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
          image_urls?: Json | null
          is_recurring?: boolean | null
          market?: string
          notes?: string[] | null
          parts_delivery_date?: string | null
          previous_status?: string | null
          priority?: string
          recurrence_confidence_score?: number | null
          recurrence_reason?: string | null
          recurrence_source_id?: string | null
          repair_type?: string
          status?: string
          store_number?: string
          updated_at?: string
          user_id?: string
          vendor_scheduled_date?: string | null
          vendor_scheduled_timeframe?: string | null
          viewed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_recurrence_source_id_fkey"
            columns: ["recurrence_source_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders_backup_migration: {
        Row: {
          assignee: string | null
          completed_at: string | null
          cost: number | null
          created_at: string | null
          defer_reason: string | null
          deferred_at: string | null
          deferred_by: string | null
          description: string | null
          ecosure: string | null
          id: string | null
          image_url: string | null
          image_urls: Json | null
          is_recurring: boolean | null
          market: string | null
          notes: string[] | null
          parts_delivery_date: string | null
          previous_status: string | null
          priority: string | null
          recurrence_confidence_score: number | null
          recurrence_reason: string | null
          recurrence_source_id: string | null
          repair_type: string | null
          status: string | null
          store_number: string | null
          updated_at: string | null
          user_id: string | null
          vendor_scheduled_date: string | null
          vendor_scheduled_timeframe: string | null
          viewed: boolean | null
        }
        Insert: {
          assignee?: string | null
          completed_at?: string | null
          cost?: number | null
          created_at?: string | null
          defer_reason?: string | null
          deferred_at?: string | null
          deferred_by?: string | null
          description?: string | null
          ecosure?: string | null
          id?: string | null
          image_url?: string | null
          image_urls?: Json | null
          is_recurring?: boolean | null
          market?: string | null
          notes?: string[] | null
          parts_delivery_date?: string | null
          previous_status?: string | null
          priority?: string | null
          recurrence_confidence_score?: number | null
          recurrence_reason?: string | null
          recurrence_source_id?: string | null
          repair_type?: string | null
          status?: string | null
          store_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          vendor_scheduled_date?: string | null
          vendor_scheduled_timeframe?: string | null
          viewed?: boolean | null
        }
        Update: {
          assignee?: string | null
          completed_at?: string | null
          cost?: number | null
          created_at?: string | null
          defer_reason?: string | null
          deferred_at?: string | null
          deferred_by?: string | null
          description?: string | null
          ecosure?: string | null
          id?: string | null
          image_url?: string | null
          image_urls?: Json | null
          is_recurring?: boolean | null
          market?: string | null
          notes?: string[] | null
          parts_delivery_date?: string | null
          previous_status?: string | null
          priority?: string | null
          recurrence_confidence_score?: number | null
          recurrence_reason?: string | null
          recurrence_source_id?: string | null
          repair_type?: string | null
          status?: string | null
          store_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          vendor_scheduled_date?: string | null
          vendor_scheduled_timeframe?: string | null
          viewed?: boolean | null
        }
        Relationships: []
      }
      wsr_dmr: {
        Row: {
          amount: number | null
          created_at: string | null
          date: string
          driver_name: string
          id: number
          metric: string
          shift: string
          shift_num: number
          store_number: string
          week_ending_date: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          date: string
          driver_name: string
          id?: number
          metric: string
          shift: string
          shift_num: number
          store_number: string
          week_ending_date: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          date?: string
          driver_name?: string
          id?: number
          metric?: string
          shift?: string
          shift_num?: number
          store_number?: string
          week_ending_date?: string
        }
        Relationships: []
      }
      wsr_dmr_daily: {
        Row: {
          amount_of_checks: number | null
          cash_due: number | null
          created_at: string | null
          date: string
          dmr: number | null
          driver_name: string
          id: number
          net_sales: number | null
          num_of_checks: number | null
          store_number: string
          taxable_income: number | null
          tips: number | null
          total_miles: number | null
          total_sales: number | null
          week_ending_date: string
        }
        Insert: {
          amount_of_checks?: number | null
          cash_due?: number | null
          created_at?: string | null
          date: string
          dmr?: number | null
          driver_name: string
          id?: number
          net_sales?: number | null
          num_of_checks?: number | null
          store_number: string
          taxable_income?: number | null
          tips?: number | null
          total_miles?: number | null
          total_sales?: number | null
          week_ending_date: string
        }
        Update: {
          amount_of_checks?: number | null
          cash_due?: number | null
          created_at?: string | null
          date?: string
          dmr?: number | null
          driver_name?: string
          id?: number
          net_sales?: number | null
          num_of_checks?: number | null
          store_number?: string
          taxable_income?: number | null
          tips?: number | null
          total_miles?: number | null
          total_sales?: number | null
          week_ending_date?: string
        }
        Relationships: []
      }
      wsr_financial: {
        Row: {
          amount: number | null
          created_at: string | null
          date: string
          financial_category: string
          shift: string
          store_number: string
          updated_at: string | null
          week_ending: string
          week_number: number | null
          year: number | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          date: string
          financial_category: string
          shift: string
          store_number: string
          updated_at?: string | null
          week_ending: string
          week_number?: number | null
          year?: number | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          date?: string
          financial_category?: string
          shift?: string
          store_number?: string
          updated_at?: string | null
          week_ending?: string
          week_number?: number | null
          year?: number | null
        }
        Relationships: []
      }
      wsr_financial_daily: {
        Row: {
          amount: number | null
          created_at: string | null
          date: string
          id: number
          line_item: string
          store_number: string
          week_ending: string
          week_number: number
          year: number
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          date: string
          id?: number
          line_item: string
          store_number: string
          week_ending: string
          week_number: number
          year: number
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          date?: string
          id?: number
          line_item?: string
          store_number?: string
          week_ending?: string
          week_number?: number
          year?: number
        }
        Relationships: []
      }
      wsr_headers: {
        Row: {
          city: string | null
          created_at: string | null
          general_manager: string | null
          processed_at: string | null
          state: string | null
          store_location: string | null
          store_number: string
          updated_at: string | null
          week_ending: string
          week_number: number | null
          year: number | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          general_manager?: string | null
          processed_at?: string | null
          state?: string | null
          store_location?: string | null
          store_number: string
          updated_at?: string | null
          week_ending: string
          week_number?: number | null
          year?: number | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          general_manager?: string | null
          processed_at?: string | null
          state?: string | null
          store_location?: string | null
          store_number?: string
          updated_at?: string | null
          week_ending?: string
          week_number?: number | null
          year?: number | null
        }
        Relationships: []
      }
      wsr_inventory: {
        Row: {
          category: string
          cos_dollars: number | null
          cos_percent: number | null
          created_at: string | null
          store_number: string
          updated_at: string | null
          week_ending: string
          week_number: number | null
          year: number | null
        }
        Insert: {
          category: string
          cos_dollars?: number | null
          cos_percent?: number | null
          created_at?: string | null
          store_number: string
          updated_at?: string | null
          week_ending: string
          week_number?: number | null
          year?: number | null
        }
        Update: {
          category?: string
          cos_dollars?: number | null
          cos_percent?: number | null
          created_at?: string | null
          store_number?: string
          updated_at?: string | null
          week_ending?: string
          week_number?: number | null
          year?: number | null
        }
        Relationships: []
      }
      wsr_labor: {
        Row: {
          created_at: string | null
          date: string
          dmr_expense: number | null
          labor_dollars: number | null
          labor_type: string
          ot_pay: number | null
          penalty_pay: number | null
          shift: string
          store_number: string
          straight_pay: number | null
          total_miles: number | null
          updated_at: string | null
          week_ending: string
          week_number: number | null
          year: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          dmr_expense?: number | null
          labor_dollars?: number | null
          labor_type: string
          ot_pay?: number | null
          penalty_pay?: number | null
          shift: string
          store_number: string
          straight_pay?: number | null
          total_miles?: number | null
          updated_at?: string | null
          week_ending: string
          week_number?: number | null
          year?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          dmr_expense?: number | null
          labor_dollars?: number | null
          labor_type?: string
          ot_pay?: number | null
          penalty_pay?: number | null
          shift?: string
          store_number?: string
          straight_pay?: number | null
          total_miles?: number | null
          updated_at?: string | null
          week_ending?: string
          week_number?: number | null
          year?: number | null
        }
        Relationships: []
      }
      wsr_labor_cost_summary: {
        Row: {
          amount: number | null
          as_of: string
          category: string
          date: string
          id: number
          labor_percent: number | null
          store_number: string
          uploaded_at: string | null
          week_ending: string | null
          week_number: number | null
          year: number | null
        }
        Insert: {
          amount?: number | null
          as_of: string
          category: string
          date: string
          id?: number
          labor_percent?: number | null
          store_number: string
          uploaded_at?: string | null
          week_ending?: string | null
          week_number?: number | null
          year?: number | null
        }
        Update: {
          amount?: number | null
          as_of?: string
          category?: string
          date?: string
          id?: number
          labor_percent?: number | null
          store_number?: string
          uploaded_at?: string | null
          week_ending?: string | null
          week_number?: number | null
          year?: number | null
        }
        Relationships: []
      }
      wsr_labor_daily: {
        Row: {
          created_at: string | null
          date: string
          driver_dmr_expense: number | null
          driver_labor: number | null
          driver_ot_pay: number | null
          driver_penalty_pay: number | null
          driver_straight_pay: number | null
          id: number
          inshop_labor: number | null
          labor_percentage: number | null
          manager_labor: number | null
          overtime_labor: number | null
          store_number: string
          total_labor: number | null
          week_ending: string
          week_number: number
          wsr_labor_dollars: number | null
          wsr_labor_overtime: number | null
          wsr_labor_percent: number | null
          year: number
        }
        Insert: {
          created_at?: string | null
          date: string
          driver_dmr_expense?: number | null
          driver_labor?: number | null
          driver_ot_pay?: number | null
          driver_penalty_pay?: number | null
          driver_straight_pay?: number | null
          id?: number
          inshop_labor?: number | null
          labor_percentage?: number | null
          manager_labor?: number | null
          overtime_labor?: number | null
          store_number: string
          total_labor?: number | null
          week_ending: string
          week_number: number
          wsr_labor_dollars?: number | null
          wsr_labor_overtime?: number | null
          wsr_labor_percent?: number | null
          year: number
        }
        Update: {
          created_at?: string | null
          date?: string
          driver_dmr_expense?: number | null
          driver_labor?: number | null
          driver_ot_pay?: number | null
          driver_penalty_pay?: number | null
          driver_straight_pay?: number | null
          id?: number
          inshop_labor?: number | null
          labor_percentage?: number | null
          manager_labor?: number | null
          overtime_labor?: number | null
          store_number?: string
          total_labor?: number | null
          week_ending?: string
          week_number?: number
          wsr_labor_dollars?: number | null
          wsr_labor_overtime?: number | null
          wsr_labor_percent?: number | null
          year?: number
        }
        Relationships: []
      }
      wsr_labor_metrics: {
        Row: {
          created_at: string | null
          date: string
          metric_name: string
          metric_value: number | null
          shift: string
          store_number: string
          updated_at: string | null
          week_ending: string
          week_number: number
          year: number
        }
        Insert: {
          created_at?: string | null
          date: string
          metric_name: string
          metric_value?: number | null
          shift: string
          store_number: string
          updated_at?: string | null
          week_ending: string
          week_number: number
          year: number
        }
        Update: {
          created_at?: string | null
          date?: string
          metric_name?: string
          metric_value?: number | null
          shift?: string
          store_number?: string
          updated_at?: string | null
          week_ending?: string
          week_number?: number
          year?: number
        }
        Relationships: []
      }
      wsr_sales: {
        Row: {
          category: string
          category_type: string | null
          created_at: string | null
          date: string
          quantity: number | null
          sales_amount: number | null
          shift: string
          store_number: string
          updated_at: string | null
          week_ending: string
          week_number: number | null
          year: number | null
        }
        Insert: {
          category: string
          category_type?: string | null
          created_at?: string | null
          date: string
          quantity?: number | null
          sales_amount?: number | null
          shift: string
          store_number: string
          updated_at?: string | null
          week_ending: string
          week_number?: number | null
          year?: number | null
        }
        Update: {
          category?: string
          category_type?: string | null
          created_at?: string | null
          date?: string
          quantity?: number | null
          sales_amount?: number | null
          shift?: string
          store_number?: string
          updated_at?: string | null
          week_ending?: string
          week_number?: number | null
          year?: number | null
        }
        Relationships: []
      }
      wsr_sales_daily: {
        Row: {
          adjusted_sales: number | null
          box_lunch: number | null
          cookie: number | null
          created_at: string | null
          date: string
          day_old_bread: number | null
          del_club: number | null
          del_combos: number | null
          del_pop: number | null
          del_side: number | null
          del_sub: number | null
          delivery_fee: number | null
          doordash: number | null
          fresh_bread: number | null
          grubhub: number | null
          id: number
          in_club: number | null
          in_combos: number | null
          in_pop: number | null
          in_side: number | null
          in_sub: number | null
          loyalty_coupon: number | null
          modifiers: number | null
          net_employee_freebies: number | null
          net_manager_freebies: number | null
          num_of_checks: number | null
          num_of_sales: number | null
          other_promo: number | null
          other_revenue: number | null
          over_rings: number | null
          platters: number | null
          royalty_sales: number | null
          sampling: number | null
          store_number: string
          total_deductions: number | null
          total_of_above: number | null
          total_online_orders: number | null
          total_quantity: number | null
          ubereats: number | null
          waste: number | null
          week_ending: string
          week_number: number
          year: number
        }
        Insert: {
          adjusted_sales?: number | null
          box_lunch?: number | null
          cookie?: number | null
          created_at?: string | null
          date: string
          day_old_bread?: number | null
          del_club?: number | null
          del_combos?: number | null
          del_pop?: number | null
          del_side?: number | null
          del_sub?: number | null
          delivery_fee?: number | null
          doordash?: number | null
          fresh_bread?: number | null
          grubhub?: number | null
          id?: number
          in_club?: number | null
          in_combos?: number | null
          in_pop?: number | null
          in_side?: number | null
          in_sub?: number | null
          loyalty_coupon?: number | null
          modifiers?: number | null
          net_employee_freebies?: number | null
          net_manager_freebies?: number | null
          num_of_checks?: number | null
          num_of_sales?: number | null
          other_promo?: number | null
          other_revenue?: number | null
          over_rings?: number | null
          platters?: number | null
          royalty_sales?: number | null
          sampling?: number | null
          store_number: string
          total_deductions?: number | null
          total_of_above?: number | null
          total_online_orders?: number | null
          total_quantity?: number | null
          ubereats?: number | null
          waste?: number | null
          week_ending: string
          week_number: number
          year: number
        }
        Update: {
          adjusted_sales?: number | null
          box_lunch?: number | null
          cookie?: number | null
          created_at?: string | null
          date?: string
          day_old_bread?: number | null
          del_club?: number | null
          del_combos?: number | null
          del_pop?: number | null
          del_side?: number | null
          del_sub?: number | null
          delivery_fee?: number | null
          doordash?: number | null
          fresh_bread?: number | null
          grubhub?: number | null
          id?: number
          in_club?: number | null
          in_combos?: number | null
          in_pop?: number | null
          in_side?: number | null
          in_sub?: number | null
          loyalty_coupon?: number | null
          modifiers?: number | null
          net_employee_freebies?: number | null
          net_manager_freebies?: number | null
          num_of_checks?: number | null
          num_of_sales?: number | null
          other_promo?: number | null
          other_revenue?: number | null
          over_rings?: number | null
          platters?: number | null
          royalty_sales?: number | null
          sampling?: number | null
          store_number?: string
          total_deductions?: number | null
          total_of_above?: number | null
          total_online_orders?: number | null
          total_quantity?: number | null
          ubereats?: number | null
          waste?: number | null
          week_ending?: string
          week_number?: number
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      certified_managers_registry: {
        Row: {
          certification_achieved_date: string | null
          certification_request_date: string | null
          certification_status: string | null
          days_since_certification: number | null
          employee_id: string | null
          employee_name: string | null
          is_active: boolean | null
          is_certified_manager: boolean | null
          market: string | null
          position_name: string | null
          recently_certified: boolean | null
          store_name: string | null
          store_number: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_store_number_fkey"
            columns: ["store_number"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_number"]
          },
          {
            foreignKeyName: "employees_store_number_fkey"
            columns: ["store_number"]
            isOneToOne: false
            referencedRelation: "v_employee_expense_summary"
            referencedColumns: ["store_number"]
          },
          {
            foreignKeyName: "employees_store_number_fkey"
            columns: ["store_number"]
            isOneToOne: false
            referencedRelation: "v_store_monthly_spending"
            referencedColumns: ["store_number"]
          },
        ]
      }
      v_daily_deposit_tracking: {
        Row: {
          actual_total: number | null
          business_date: string | null
          deposit_ids: string | null
          expected_total: number | null
          match_status: string | null
          store_name: string | null
          store_number: string | null
          submitted_at: string | null
          submitted_by: string | null
          submitted_date: string | null
          variance: number | null
          variance_abs: number | null
        }
        Relationships: []
      }
      v_employee_expense_summary: {
        Row: {
          approved_amount: number | null
          email: string | null
          entity: string | null
          first_name: string | null
          last_name: string | null
          last_transaction_date: string | null
          missing_receipts: number | null
          pending_amount: number | null
          profile_id: string | null
          store_name: string | null
          store_number: string | null
          total_amount: number | null
          total_transactions: number | null
        }
        Relationships: []
      }
      v_entity_monthly_spending: {
        Row: {
          employee_count: number | null
          entity: string | null
          month: string | null
          total_amount: number | null
          transaction_count: number | null
        }
        Relationships: []
      }
      v_store_monthly_spending: {
        Row: {
          avg_transaction_amount: number | null
          employee_count: number | null
          entity: string | null
          month: string | null
          store_id: number | null
          store_name: string | null
          store_number: string | null
          total_amount: number | null
          transaction_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_user_market_permission: {
        Args: { target_market_name: string; target_user_id: string }
        Returns: undefined
      }
      add_user_store_permission: {
        Args: { target_store_number: string; target_user_id: string }
        Returns: undefined
      }
      assign_portal_auth_role: {
        Args: { p_assigned_by: string; p_role_id: string; p_user_id: string }
        Returns: string
      }
      assign_portal_auth_scope: {
        Args: {
          p_assigned_by: string
          p_market?: string
          p_portal_id: string
          p_region?: string
          p_scope_level: string
          p_store_number?: string
          p_user_id: string
        }
        Returns: string
      }
      calculate_completion_metrics: {
        Args: { p_batch_id: string; p_metric_date: string }
        Returns: undefined
      }
      calculate_completion_metrics_with_hierarchy: {
        Args: { p_batch_id: string; p_metric_date: string }
        Returns: undefined
      }
      calculate_day_training_completion: {
        Args: { p_day_number: number; p_employee_id: string }
        Returns: Json
      }
      calculate_feedback_score: {
        Args: {
          complaint_category: string
          customer_response_sentiment: string
          feedback_date: string
          outreach_sent_at: string
        }
        Returns: number
      }
      check_critical_feedback_approvals: {
        Args: { feedback_id_param: string }
        Returns: boolean
      }
      check_red_carpet_badge: {
        Args: { period_uuid: string; user_uuid: string }
        Returns: boolean
      }
      check_sla_violations: { Args: never; Returns: undefined }
      check_sniper_badge: {
        Args: { period_uuid: string; user_uuid: string }
        Returns: boolean
      }
      check_speed_demon_badge: {
        Args: { period_uuid: string; user_uuid: string }
        Returns: boolean
      }
      cleanup_old_wsr_data: { Args: never; Returns: number }
      create_training_snapshot: {
        Args: { p_batch_id: string; p_snapshot_date: string }
        Returns: undefined
      }
      distinct_states: {
        Args: never
        Returns: {
          state: string
        }[]
      }
      find_critical_orders_without_notifications: {
        Args: { days_back?: number }
        Returns: {
          created_at: string
          description: string
          market: string
          missing_notification_count: number
          priority: string
          store_number: string
          work_order_id: string
        }[]
      }
      generate_display_name: {
        Args: { email: string; first_name: string; last_name: string }
        Returns: string
      }
      generate_id_upload_token: { Args: never; Returns: string }
      get_aggregated_customers: {
        Args: never
        Returns: {
          customer_name: string
          email: string
          first_order_date: string
          last_order_date: string
          location: string
          order_count: number
          phone: string
          state: string
          total_spent: number
        }[]
      }
      get_all_employees_r2r_progress: {
        Args: {
          store_num: string
          target_category: string
          target_class: string
        }
        Returns: {
          completed_date: string
          employee_id: string
          employee_name: string
          overall_r2r_completion: number
          percent_complete: number
          status: string
          training_module_name: string
        }[]
      }
      get_catering_metrics: {
        Args: { cutoff_date?: string }
        Returns: {
          active_locations: number
          avg_order_value: number
          last_updated: string
          total_customers: number
          total_orders: number
          total_revenue: number
        }[]
      }
      get_class_category_counts:
        | {
            Args: { target_class: string }
            Returns: {
              category: string
              completed: number
              completion_rate: number
              in_progress: number
              not_started: number
              total_employees: number
            }[]
          }
        | {
            Args: { target_category: string; target_class: string }
            Returns: {
              completed: number
              completion_rate: number
              in_progress: number
              not_started: number
              total_employees: number
            }[]
          }
      get_class_employee_counts: {
        Args: { target_class: string }
        Returns: {
          completed: number
          completion_rate: number
          in_progress: number
          not_started: number
          total_employees: number
        }[]
      }
      get_class_market_category_counts: {
        Args: { target_class: string; target_market: string }
        Returns: {
          category: string
          completed: number
          completion_rate: number
          in_progress: number
          not_started: number
          total_employees: number
        }[]
      }
      get_class_market_counts: {
        Args: { target_class: string }
        Returns: {
          completed: number
          completion_rate: number
          in_progress: number
          market: string
          not_started: number
          total_employees: number
        }[]
      }
      get_company_completion_trends:
        | {
            Args: never
            Returns: {
              completed: number
              completion_rate: number
              date_point: string
              in_progress: number
              not_started: number
              total: number
            }[]
          }
        | {
            Args: { module_id?: string }
            Returns: {
              completed: number
              completion_rate: number
              date_point: string
              in_progress: number
              not_started: number
              total: number
            }[]
          }
        | {
            Args: { target_category?: string }
            Returns: {
              completed: number
              completion_rate: number
              date_point: string
              in_progress: number
              not_started: number
              total: number
            }[]
          }
      get_company_employee_counts: {
        Args: { target_category?: string }
        Returns: {
          completed: number
          completion_rate: number
          in_progress: number
          not_started: number
          total_employees: number
        }[]
      }
      get_company_lto_completion_trends: {
        Args: { training_title: string }
        Returns: {
          completed: number
          completion_rate: number
          date_point: string
          in_progress: number
          not_started: number
          total: number
        }[]
      }
      get_company_lto_employee_counts: {
        Args: { training_title: string }
        Returns: {
          completed: number
          completion_rate: number
          in_progress: number
          not_started: number
          total_employees: number
        }[]
      }
      get_company_position_completion_rates: {
        Args: { target_class: string }
        Returns: {
          completed: number
          completion_rate: number
          employee_position: string
          in_progress: number
          not_started: number
          total_employees: number
        }[]
      }
      get_crm_metrics: { Args: { user_uuid?: string }; Returns: Json }
      get_current_user_email: { Args: never; Returns: string }
      get_employee_career_path: {
        Args: { p_employee_id: string }
        Returns: {
          approved_at: string
          approved_by: string
          completed_at: string
          completed_by: string
          day_label: string
          day_number: number
          estimated_minutes: number
          instructions: string
          is_complete: boolean
          is_required: boolean
          item_order: number
          item_title: string
          item_type: string
          manager_approved: boolean
          manager_notes: string
          position_name: string
          requires_manager_approval: boolean
          section_name: string
          template_item_id: string
          training_complete: boolean
          training_completion_percentage: number
          training_module_id: string
          training_module_name: string
          training_verification: Json
        }[]
      }
      get_employee_class_category_completions: {
        Args: {
          store_num: string
          target_category: string
          target_class: string
        }
        Returns: {
          completed_date: string
          employee_id: string
          employee_name: string
          percent_complete: number
          status: string
          training_module_name: string
        }[]
      }
      get_employee_lto_completions: {
        Args: { store_num: string; training_title: string }
        Returns: {
          completed_date: string
          employee_id: string
          employee_name: string
          percent_complete: number
          status: string
          training_module_name: string
        }[]
      }
      get_employee_training_summary: {
        Args: {
          p_market?: string
          p_max_completion?: number
          p_min_completion?: number
          p_position?: string
          p_store_number?: string
        }
        Returns: {
          completed_trainings: number
          completion_rate: number
          employee_id: string
          employee_name: string
          employee_position: string
          in_progress_trainings: number
          last_activity_date: string
          market: string
          not_started_trainings: number
          store_number: string
          total_trainings: number
        }[]
      }
      get_executive_hierarchy: {
        Args: { p_market: string; p_store_number: string }
        Returns: {
          display_name: string
          email: string
          notification_level: number
          role: string
          user_id: string
        }[]
      }
      get_harassment_training_by_market: {
        Args: { p_state: string }
        Returns: {
          completed: number
          compliance_rate: number
          expired: number
          expiring_soon: number
          market: string
          not_completed: number
          total_employees: number
        }[]
      }
      get_harassment_training_by_region: {
        Args: never
        Returns: {
          completed: number
          compliance_rate: number
          expired: number
          expiring_soon: number
          not_completed: number
          region: string
          total_employees: number
        }[]
      }
      get_harassment_training_by_state: {
        Args: { p_region: string }
        Returns: {
          completed: number
          compliance_rate: number
          expired: number
          expiring_soon: number
          is_california: boolean
          not_completed: number
          state: string
          total_employees: number
        }[]
      }
      get_harassment_training_by_store: {
        Args: { p_market: string }
        Returns: {
          completed: number
          compliance_rate: number
          expired: number
          expiring_soon: number
          not_completed: number
          store_name: string
          store_number: string
          total_employees: number
        }[]
      }
      get_harassment_training_company_overview: {
        Args: never
        Returns: {
          california_current: number
          california_employees: number
          completed_current: number
          compliance_rate: number
          expired: number
          expiring_soon: number
          not_completed: number
          total_employees: number
        }[]
      }
      get_harassment_training_employees: {
        Args: { p_store_number: string }
        Returns: {
          certificate_url: string
          completion_date: string
          days_until_expiration: number
          employee_id: string
          employee_name: string
          expires_at: string
          is_california_employee: boolean
          position_name: string
          status: string
          training_type: string
        }[]
      }
      get_manager_approval_requests: {
        Args: { p_manager_user_id?: string }
        Returns: {
          day_label: string
          employee_id: string
          employee_name: string
          item_title: string
          item_type: string
          notification_id: string
          requested_at: string
          status: string
          store_number: string
          template_item_id: string
        }[]
      }
      get_manager_for_market: {
        Args: { market_name: string }
        Returns: {
          manager_email: string
          manager_name: string
        }[]
      }
      get_market_analysis: {
        Args: {
          cutoff_date?: string
          period_id?: string
          previous_cutoff_date?: string
          region_filter?: string
        }
        Returns: {
          avg_order_value: number
          market_name: string
          market_type: string
          orders: number
          percentage: number
          revenue: number
        }[]
      }
      get_market_class_category_counts: {
        Args: { target_category: string; target_class: string }
        Returns: {
          completed: number
          completion_rate: number
          in_progress: number
          market: string
          not_started: number
          total_employees: number
        }[]
      }
      get_market_completion_trends:
        | {
            Args: never
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
        | {
            Args: { module_id?: string }
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
        | {
            Args: { target_category?: string }
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
      get_market_employee_counts: {
        Args: { target_category?: string }
        Returns: {
          completed: number
          completion_rate: number
          in_progress: number
          market: string
          not_started: number
          total_employees: number
        }[]
      }
      get_market_lto_employee_counts: {
        Args: { training_title: string }
        Returns: {
          completed: number
          completion_rate: number
          in_progress: number
          market: string
          not_started: number
          total_employees: number
        }[]
      }
      get_market_position_completion_rates: {
        Args: { target_class: string; target_market: string }
        Returns: {
          completed: number
          completion_rate: number
          employee_position: string
          in_progress: number
          not_started: number
          total_employees: number
        }[]
      }
      get_market_r2r_completion_rate: {
        Args: { target_market: string }
        Returns: number
      }
      get_pending_approvals_for_user: {
        Args: { user_uuid: string }
        Returns: {
          approval_id: string
          approver_role: string
          backlog_category: string
          backlog_item_id: string
          description: string
          estimated_cost: number
          market: string
          requested_at: string
          store_number: string
          work_order_id: string
        }[]
      }
      get_portal_access: {
        Args: { _portal_id: string; _user_id: string }
        Returns: {
          access_scope: string
          can_edit: boolean
          can_manage: boolean
          can_view: boolean
          role_names: string
        }[]
      }
      get_required_approvers_for_feedback: {
        Args: { feedback_market: string; feedback_store: string }
        Returns: {
          approval_order: number
          display_name: string
          email: string
          role: string
          user_id: string
        }[]
      }
      get_sales_trend: {
        Args: { cutoff_date?: string; end_date?: string; period_id?: string }
        Returns: {
          date: string
          orders: number
          revenue: number
        }[]
      }
      get_store_class_category_counts: {
        Args: {
          target_category: string
          target_class: string
          target_market: string
        }
        Returns: {
          completed: number
          completion_rate: number
          in_progress: number
          manager: string
          not_started: number
          store_name: string
          store_number: string
          total_employees: number
        }[]
      }
      get_store_class_category_counts_with_employee_average:
        | {
            Args: { target_class: string; target_market: string }
            Returns: {
              category: string
              completed: number
              completion_rate: number
              in_progress: number
              not_started: number
              total_employees: number
            }[]
          }
        | {
            Args: {
              target_category: string
              target_class: string
              target_market: string
            }
            Returns: {
              completed: number
              completion_rate: number
              employee_average: number
              in_progress: number
              manager: string
              not_started: number
              store_name: string
              store_number: string
              total_employees: number
            }[]
          }
      get_store_completion_trends:
        | {
            Args: { target_market: string }
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
        | {
            Args: { module_id?: string; target_market: string }
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
        | {
            Args: { target_category?: string; target_market: string }
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
      get_store_employee_counts: {
        Args: { target_category?: string; target_market: string }
        Returns: {
          completed: number
          completion_rate: number
          in_progress: number
          manager: string
          not_started: number
          store_name: string
          store_number: string
          total_employees: number
        }[]
      }
      get_store_lto_completion_trends: {
        Args: { target_market: string; training_title: string }
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
      get_store_lto_employee_counts: {
        Args: { target_market: string; training_title: string }
        Returns: {
          completed: number
          completion_rate: number
          in_progress: number
          manager: string
          not_started: number
          store_name: string
          store_number: string
          total_employees: number
        }[]
      }
      get_store_performance: {
        Args: {
          cutoff_date: string
          previous_cutoff_date: string
          region_filter?: string
        }
        Returns: {
          avg_order_value: number
          growth_percent: number
          last_order_date: string
          region: string
          store_id: number
          store_name: string
          store_number: string
          total_orders: number
          total_revenue: number
        }[]
      }
      get_store_position_completion_rates: {
        Args: {
          target_class: string
          target_market: string
          target_store: string
        }
        Returns: {
          completed: number
          completion_rate: number
          employee_position: string
          in_progress: number
          not_started: number
          total_employees: number
        }[]
      }
      get_store_rankings: {
        Args: { p_state?: string; p_week_ending?: string }
        Returns: {
          city: string
          labor_percent: number
          rank: number
          state: string
          store_number: string
          weekly_sales: number
        }[]
      }
      get_team_member_average_progress: {
        Args: never
        Returns: {
          avg_completion_rate: number
          status_0_25: number
          status_100: number
          status_26_50: number
          status_51_75: number
          status_76_99: number
          total_employees: number
        }[]
      }
      get_top_stores: {
        Args: {
          cutoff_date?: string
          end_date?: string
          limit_count?: number
          period_id?: string
        }
        Returns: {
          orders: number
          revenue: number
          store_name: string
          store_number: string
        }[]
      }
      get_training_completions_for_store:
        | {
            Args: { store_num: string }
            Returns: {
              completed_date: string
              employee_id: string
              employee_name: string
              percent_complete: number
              status: string
              training_module_name: string
            }[]
          }
        | {
            Args: { store_num: string; target_category?: string }
            Returns: {
              completed_date: string
              employee_id: string
              employee_name: string
              percent_complete: number
              status: string
              training_module_name: string
            }[]
          }
        | {
            Args: { module_id?: string; store_num: string }
            Returns: {
              completed_date: string
              employee_id: string
              employee_name: string
              percent_complete: number
              status: string
              training_module_name: string
            }[]
          }
      get_training_market_breakdown: {
        Args: { region_group_filter: string; training_type: string }
        Returns: {
          avg_completion: number
          market: string
          store_count: number
        }[]
      }
      get_training_region_breakdown: {
        Args: { training_type: string }
        Returns: {
          avg_completion: number
          market_count: number
          region_group: string
          store_count: number
        }[]
      }
      get_training_store_breakdown: {
        Args: { market_filter: string; training_type: string }
        Returns: {
          avg_completion: number
          inserted_at: string
          manager: string
          store: string
          store_name: string
        }[]
      }
      get_user_accessible_markets: {
        Args: { user_uuid: string }
        Returns: {
          display_name: string
          id: string
          name: string
        }[]
      }
      get_user_accessible_stores: {
        Args: { market_filter?: string; user_uuid: string }
        Returns: {
          region: string
          store_id: number
          store_name: string
          store_number: string
        }[]
      }
      get_user_display_info: {
        Args: never
        Returns: {
          display_name: string
          first_name: string
          last_name: string
          user_id: string
        }[]
      }
      get_user_scope_for_portal: {
        Args: { _portal_id: string; _user_id: string }
        Returns: {
          markets: string[]
          regions: string[]
          scope_level: string
          store_numbers: string[]
        }[]
      }
      has_portal_role: {
        Args: { _role_name: string; _user_id: string }
        Returns: boolean
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_dm: { Args: { user_uuid: string }; Returns: boolean }
      is_executive: { Args: { user_uuid: string }; Returns: boolean }
      is_jsonb_array_of_strings: { Args: { j: Json }; Returns: boolean }
      is_portal_master_admin: { Args: { _user_id: string }; Returns: boolean }
      jsonb_try_parse: { Args: { txt: string }; Returns: Json }
      normalize_market: { Args: { market_name: string }; Returns: string }
      process_approval: {
        Args: { p_notes?: string; p_notification_id: string; p_status: string }
        Returns: boolean
      }
      query_portal_auth_access_definitions: {
        Args: never
        Returns: {
          can_comment: boolean
          can_edit: boolean
          can_manage: boolean
          can_view: boolean
          id: string
          portal_id: string
          portal_role_id: string
          role_display_name: string
          role_name: string
        }[]
      }
      query_portal_auth_audit_log: {
        Args: { p_limit?: number }
        Returns: {
          change_details: Json
          change_type: string
          changed_by: string
          created_at: string
          id: string
          portal_id: string
          user_id: string
        }[]
      }
      query_portal_auth_custom_permissions: {
        Args: { p_user_id: string }
        Returns: {
          assigned_at: string
          assigned_by: string
          can_comment: boolean
          can_edit: boolean
          can_manage: boolean
          can_view: boolean
          id: string
          portal_id: string
          user_id: string
        }[]
      }
      query_portal_auth_roles: {
        Args: never
        Returns: {
          created_at: string
          description: string
          id: string
          is_active: boolean
          role_display_name: string
          role_name: string
        }[]
      }
      query_portal_auth_scope_assignments: {
        Args: { p_user_id: string }
        Returns: {
          assigned_at: string
          assigned_by: string
          id: string
          market: string
          portal_id: string
          region: string
          scope_level: string
          status: string
          store_number: string
          user_id: string
        }[]
      }
      query_portal_auth_user_roles: {
        Args: { p_user_id: string }
        Returns: {
          assigned_at: string
          assigned_by: string
          id: string
          portal_role_id: string
          role_description: string
          role_display_name: string
          role_is_active: boolean
          role_name: string
          user_id: string
        }[]
      }
      query_portal_auth_users_with_roles: {
        Args: never
        Returns: {
          display_name: string
          email: string
          first_name: string
          last_name: string
          portal_roles: Json
          user_id: string
        }[]
      }
      refresh_wsr_analytics: { Args: never; Returns: undefined }
      remove_user_market_permission: {
        Args: { target_market_name: string; target_user_id: string }
        Returns: undefined
      }
      remove_user_store_permission: {
        Args: { target_store_number: string; target_user_id: string }
        Returns: undefined
      }
      revoke_portal_auth_role: {
        Args: { p_revoked_by: string; p_user_role_id: string }
        Returns: boolean
      }
      revoke_portal_auth_scope: {
        Args: { p_revoked_by: string; p_scope_id: string }
        Returns: boolean
      }
      rollback_work_orders_migration: { Args: never; Returns: undefined }
      set_portal_auth_custom_permission: {
        Args: {
          p_can_comment: boolean
          p_can_edit: boolean
          p_can_manage: boolean
          p_can_view: boolean
          p_granted_by: string
          p_portal_id: string
          p_user_id: string
        }
        Returns: string
      }
      submit_approval_request: {
        Args: { p_employee_id: string; p_template_item_id: string }
        Returns: string
      }
      user_has_market_access: {
        Args: { target_market: string; user_id: string }
        Returns: boolean
      }
      user_has_market_access_v2: {
        Args: { target_market_name: string; user_uuid: string }
        Returns: boolean
      }
      user_has_store_access: {
        Args: { target_store_number: string; user_uuid: string }
        Returns: boolean
      }
      validate_work_orders_migration: {
        Args: never
        Returns: {
          check_name: string
          details: string
          status: string
        }[]
      }
    }
    Enums: {
      access_scope_type: "none" | "store" | "region" | "all"
      app_role: "admin" | "director" | "manager" | "user" | "vp" | "ceo"
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
      portal_role_type:
        | "master_admin"
        | "corporate"
        | "hr_restricted"
        | "regional_director"
        | "district_manager"
        | "gm"
        | "store_user"
      ticket_status:
        | "submitted"
        | "pending_manager"
        | "under_review"
        | "in_progress"
        | "resolved"
        | "rejected_by_manager"
        | "closed"
      ticket_urgency: "critical" | "high" | "medium" | "low"
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
      access_scope_type: ["none", "store", "region", "all"],
      app_role: ["admin", "director", "manager", "user", "vp", "ceo"],
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
      portal_role_type: [
        "master_admin",
        "corporate",
        "hr_restricted",
        "regional_director",
        "district_manager",
        "gm",
        "store_user",
      ],
      ticket_status: [
        "submitted",
        "pending_manager",
        "under_review",
        "in_progress",
        "resolved",
        "rejected_by_manager",
        "closed",
      ],
      ticket_urgency: ["critical", "high", "medium", "low"],
      training_status: ["Completed", "In Progress", "Not Started"],
    },
  },
} as const
