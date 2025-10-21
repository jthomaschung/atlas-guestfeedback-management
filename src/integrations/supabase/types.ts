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
      backlog_activity_log: {
        Row: {
          action_details: Json | null
          action_type: string
          backlog_item_id: string
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          backlog_item_id: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          backlog_item_id?: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "backlog_activity_log_backlog_item_id_fkey"
            columns: ["backlog_item_id"]
            isOneToOne: false
            referencedRelation: "backlog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backlog_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      backlog_approvals: {
        Row: {
          approval_notes: string | null
          approval_status: string
          approver_role: string
          approver_user_id: string
          backlog_item_id: string
          created_at: string | null
          id: string
          requested_at: string | null
          responded_at: string | null
        }
        Insert: {
          approval_notes?: string | null
          approval_status?: string
          approver_role: string
          approver_user_id: string
          backlog_item_id: string
          created_at?: string | null
          id?: string
          requested_at?: string | null
          responded_at?: string | null
        }
        Update: {
          approval_notes?: string | null
          approval_status?: string
          approver_role?: string
          approver_user_id?: string
          backlog_item_id?: string
          created_at?: string | null
          id?: string
          requested_at?: string | null
          responded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "backlog_approvals_backlog_item_id_fkey"
            columns: ["backlog_item_id"]
            isOneToOne: false
            referencedRelation: "backlog_items"
            referencedColumns: ["id"]
          },
        ]
      }
      backlog_comments: {
        Row: {
          backlog_item_id: string
          comment_text: string
          comment_type: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backlog_item_id: string
          comment_text: string
          comment_type?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backlog_item_id?: string
          comment_text?: string
          comment_type?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "backlog_comments_backlog_item_id_fkey"
            columns: ["backlog_item_id"]
            isOneToOne: false
            referencedRelation: "backlog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backlog_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
            foreignKeyName: "backlog_items_reviewed_by_regional_lead_fkey"
            columns: ["reviewed_by_regional_lead"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
      backlog_regional_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by_user_id: string | null
          assigned_role: string
          assigned_user_id: string
          backlog_item_id: string
          id: string
          notes: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by_user_id?: string | null
          assigned_role: string
          assigned_user_id: string
          backlog_item_id: string
          id?: string
          notes?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by_user_id?: string | null
          assigned_role?: string
          assigned_user_id?: string
          backlog_item_id?: string
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "backlog_regional_assignments_assigned_by_user_id_fkey"
            columns: ["assigned_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "backlog_regional_assignments_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "backlog_regional_assignments_backlog_item_id_fkey"
            columns: ["backlog_item_id"]
            isOneToOne: false
            referencedRelation: "backlog_items"
            referencedColumns: ["id"]
          },
        ]
      }
      backlog_votes: {
        Row: {
          backlog_item_id: string
          created_at: string | null
          id: string
          notes: string | null
          user_id: string
          vote_type: string
          vote_weight: number | null
        }
        Insert: {
          backlog_item_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          user_id: string
          vote_type: string
          vote_weight?: number | null
        }
        Update: {
          backlog_item_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          user_id?: string
          vote_type?: string
          vote_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "backlog_votes_backlog_item_id_fkey"
            columns: ["backlog_item_id"]
            isOneToOne: false
            referencedRelation: "backlog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backlog_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      backlog_workflow_history: {
        Row: {
          backlog_item_id: string
          change_reason: string | null
          changed_by_user_id: string | null
          created_at: string | null
          from_status: string
          id: string
          to_status: string
        }
        Insert: {
          backlog_item_id: string
          change_reason?: string | null
          changed_by_user_id?: string | null
          created_at?: string | null
          from_status: string
          id?: string
          to_status: string
        }
        Update: {
          backlog_item_id?: string
          change_reason?: string | null
          changed_by_user_id?: string | null
          created_at?: string | null
          from_status?: string
          id?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "backlog_workflow_history_backlog_item_id_fkey"
            columns: ["backlog_item_id"]
            isOneToOne: false
            referencedRelation: "backlog_items"
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
          campaign_id: string | null
          campaign_slug: string | null
          contacted_at: string | null
          converted_at: string | null
          created_at: string | null
          email: string
          id: string
          marketing_consent: boolean | null
          message: string | null
          name: string
          notes: string | null
          phone: string
          source: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          campaign_slug?: string | null
          contacted_at?: string | null
          converted_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          marketing_consent?: boolean | null
          message?: string | null
          name: string
          notes?: string | null
          phone: string
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          campaign_slug?: string | null
          contacted_at?: string | null
          converted_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          marketing_consent?: boolean | null
          message?: string | null
          name?: string
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
          associate_id: string | null
          clearance_email_sent: boolean | null
          clearance_email_sent_at: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
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
          makeshift_sent: boolean | null
          makeshift_sent_at: string | null
          mvr_clearance_at: string | null
          mvr_clearance_complete: boolean | null
          new_hire_id: string
          onboarding_sent: boolean | null
          onboarding_sent_at: string | null
          servsafe_complete: boolean | null
          servsafe_completed_at: string | null
          updated_at: string
          welcome_text_sent: boolean | null
          welcome_text_sent_at: string | null
        }
        Insert: {
          adp_employee_id?: string | null
          adp_user_id?: string | null
          associate_id?: string | null
          clearance_email_sent?: boolean | null
          clearance_email_sent_at?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
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
          makeshift_sent?: boolean | null
          makeshift_sent_at?: string | null
          mvr_clearance_at?: string | null
          mvr_clearance_complete?: boolean | null
          new_hire_id: string
          onboarding_sent?: boolean | null
          onboarding_sent_at?: string | null
          servsafe_complete?: boolean | null
          servsafe_completed_at?: string | null
          updated_at?: string
          welcome_text_sent?: boolean | null
          welcome_text_sent_at?: string | null
        }
        Update: {
          adp_employee_id?: string | null
          adp_user_id?: string | null
          associate_id?: string | null
          clearance_email_sent?: boolean | null
          clearance_email_sent_at?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
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
          makeshift_sent?: boolean | null
          makeshift_sent_at?: string | null
          mvr_clearance_at?: string | null
          mvr_clearance_complete?: boolean | null
          new_hire_id?: string
          onboarding_sent?: boolean | null
          onboarding_sent_at?: string | null
          servsafe_complete?: boolean | null
          servsafe_completed_at?: string | null
          updated_at?: string
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
          applicant_email: string
          applicant_phone: string
          auto_insurance_carrier: string | null
          created_at: string
          date_of_birth: string | null
          drivers_license_number: string | null
          drivers_license_state: string | null
          email_address: string
          estimated_start_date: string
          fhc_expiration: string | null
          fhc_number: string | null
          first_name: string
          has_food_handlers_card: boolean | null
          has_servsafe: boolean | null
          hiring_manager: string
          id: string
          id_photo_back_url: string | null
          id_photo_front_url: string | null
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
          servsafe_expiration: string | null
          servsafe_number: string | null
          sign_on_bonus: string | null
          status: string | null
          store_number: string
          submitted_by: string | null
          updated_at: string
          wage: number
          wage_within_scale: string | null
          will_be_driving: boolean | null
        }
        Insert: {
          applicant_email: string
          applicant_phone: string
          auto_insurance_carrier?: string | null
          created_at?: string
          date_of_birth?: string | null
          drivers_license_number?: string | null
          drivers_license_state?: string | null
          email_address: string
          estimated_start_date: string
          fhc_expiration?: string | null
          fhc_number?: string | null
          first_name: string
          has_food_handlers_card?: boolean | null
          has_servsafe?: boolean | null
          hiring_manager: string
          id?: string
          id_photo_back_url?: string | null
          id_photo_front_url?: string | null
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
          servsafe_expiration?: string | null
          servsafe_number?: string | null
          sign_on_bonus?: string | null
          status?: string | null
          store_number: string
          submitted_by?: string | null
          updated_at?: string
          wage: number
          wage_within_scale?: string | null
          will_be_driving?: boolean | null
        }
        Update: {
          applicant_email?: string
          applicant_phone?: string
          auto_insurance_carrier?: string | null
          created_at?: string
          date_of_birth?: string | null
          drivers_license_number?: string | null
          drivers_license_state?: string | null
          email_address?: string
          estimated_start_date?: string
          fhc_expiration?: string | null
          fhc_number?: string | null
          first_name?: string
          has_food_handlers_card?: boolean | null
          has_servsafe?: boolean | null
          hiring_manager?: string
          id?: string
          id_photo_back_url?: string | null
          id_photo_front_url?: string | null
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
          servsafe_expiration?: string | null
          servsafe_number?: string | null
          sign_on_bonus?: string | null
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
          resolution_notes: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          store_number: string
          sub_category: string | null
          submitted_by: string | null
          submitter_type: string
          ticket_number: string
          updated_at: string
          urgency_level: Database["public"]["Enums"]["ticket_urgency"]
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
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          store_number: string
          sub_category?: string | null
          submitted_by?: string | null
          submitter_type: string
          ticket_number?: string
          updated_at?: string
          urgency_level?: Database["public"]["Enums"]["ticket_urgency"]
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
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          store_number?: string
          sub_category?: string | null
          submitted_by?: string | null
          submitter_type?: string
          ticket_number?: string
          updated_at?: string
          urgency_level?: Database["public"]["Enums"]["ticket_urgency"]
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
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          last_seen_date: string | null
          position: string[] | null
          training_name: string
          training_provider: string | null
          training_type: string | null
          updated_at: string | null
        }
        Insert: {
          career_path_day?: number | null
          category?: string | null
          class?: string | null
          created_at?: string | null
          id?: string
          is_live?: boolean | null
          last_seen_date?: string | null
          position?: string[] | null
          training_name: string
          training_provider?: string | null
          training_type?: string | null
          updated_at?: string | null
        }
        Update: {
          career_path_day?: number | null
          category?: string | null
          class?: string | null
          created_at?: string | null
          id?: string
          is_live?: boolean | null
          last_seen_date?: string | null
          position?: string[] | null
          training_name?: string
          training_provider?: string | null
          training_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      training_records: {
        Row: {
          assigned_date: string | null
          completed_date: string | null
          created_at: string | null
          due_date: string | null
          employee_id: string | null
          employee_name: string | null
          id: string
          import_batch_id: string | null
          module_view_time: number | null
          registration_date: string | null
          start_date: string | null
          status: string | null
          store_id: string | null
          store_location: string | null
          store_number: string | null
          training_duration: number | null
          training_hours: number | null
          training_id: string | null
          training_title: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_date?: string | null
          completed_date?: string | null
          created_at?: string | null
          due_date?: string | null
          employee_id?: string | null
          employee_name?: string | null
          id?: string
          import_batch_id?: string | null
          module_view_time?: number | null
          registration_date?: string | null
          start_date?: string | null
          status?: string | null
          store_id?: string | null
          store_location?: string | null
          store_number?: string | null
          training_duration?: number | null
          training_hours?: number | null
          training_id?: string | null
          training_title?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_date?: string | null
          completed_date?: string | null
          created_at?: string | null
          due_date?: string | null
          employee_id?: string | null
          employee_name?: string | null
          id?: string
          import_batch_id?: string | null
          module_view_time?: number | null
          registration_date?: string | null
          start_date?: string | null
          status?: string | null
          store_id?: string | null
          store_location?: string | null
          store_number?: string | null
          training_duration?: number | null
          training_hours?: number | null
          training_id?: string | null
          training_title?: string | null
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
          driver_name: string
          id: number
          metric: string
          shift: string
          store_number: string
          updated_at: string | null
          week_ending: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          driver_name: string
          id?: number
          metric: string
          shift: string
          store_number: string
          updated_at?: string | null
          week_ending: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          driver_name?: string
          id?: number
          metric?: string
          shift?: string
          store_number?: string
          updated_at?: string | null
          week_ending?: string
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
      [_ in never]: never
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
      check_sla_violations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_sniper_badge: {
        Args: { period_uuid: string; user_uuid: string }
        Returns: boolean
      }
      check_speed_demon_badge: {
        Args: { period_uuid: string; user_uuid: string }
        Returns: boolean
      }
      cleanup_old_wsr_data: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_training_snapshot: {
        Args: { p_batch_id: string; p_snapshot_date: string }
        Returns: undefined
      }
      distinct_states: {
        Args: Record<PropertyKey, never>
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
      get_aggregated_customers: {
        Args: Record<PropertyKey, never>
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
      get_class_category_counts: {
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
      get_current_user_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
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
      get_store_class_category_counts_with_employee_average: {
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
        Args: Record<PropertyKey, never>
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
        Args: Record<PropertyKey, never>
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
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_dm: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_executive: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_jsonb_array_of_strings: {
        Args: { j: Json }
        Returns: boolean
      }
      is_portal_master_admin: {
        Args: { _user_id: string }
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
      process_approval: {
        Args: { p_notes?: string; p_notification_id: string; p_status: string }
        Returns: boolean
      }
      query_portal_auth_access_definitions: {
        Args: Record<PropertyKey, never>
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
        Args: Record<PropertyKey, never>
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
        Args: Record<PropertyKey, never>
        Returns: {
          display_name: string
          email: string
          first_name: string
          last_name: string
          portal_roles: Json
          user_id: string
        }[]
      }
      refresh_wsr_analytics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
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
      rollback_work_orders_migration: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
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
        Args: Record<PropertyKey, never>
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
