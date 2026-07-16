/**
 * Diese Datei wird normalerweise automatisch generiert mit:
 *   npx supabase gen types typescript --project-id <PROJECT_ID> > src/types/database.ts
 *
 * Unten folgt eine manuell gepflegte, vollständige Typdefinition passend zum
 * Schema in supabase/migrations/0001_init.sql — nutzbar bis die generierte
 * Version eingerichtet ist.
 *
 * WICHTIG: Jede Tabelle braucht ein `Relationships`-Array (auch wenn leer),
 * und das Schema braucht `Views`/`Enums`/`CompositeTypes`, da @supabase/supabase-js
 * sonst bei .select().single() die Zeilentypen nicht auflösen kann und auf
 * `never` zurückfällt — das verursacht den TypeScript-Build-Fehler auf Vercel.
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: "affiliate" | "admin" | "super_admin";
          email_verified: boolean;
          two_factor_enabled: boolean;
          two_factor_secret: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["users"]["Row"]> & { id: string; email: string; first_name: string; last_name: string };
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
        Relationships: [];
      };
      affiliates: {
        Row: {
          id: string;
          user_id: string;
          referral_code: string;
          status: "pending" | "active" | "suspended" | "banned";
          parent_affiliate_id: string | null;
          tier_level: number;
          country: string | null;
          paypal_email: string | null;
          iban: string | null;
          bic: string | null;
          bank_account_holder: string | null;
          crypto_wallet_address: string | null;
          preferred_payout_method: "paypal" | "sepa" | "crypto";
          tax_id: string | null;
          tax_country: string | null;
          default_commission_rate: number;
          default_commission_type: "percentage" | "fixed" | "lifetime" | "one_time";
          commission_plan_id: string | null;
          total_clicks: number;
          total_conversions: number;
          total_revenue_generated: number;
          total_commission_earned: number;
          total_commission_paid: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["affiliates"]["Row"]> & { user_id: string; referral_code: string };
        Update: Partial<Database["public"]["Tables"]["affiliates"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "affiliates_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "affiliates_parent_affiliate_id_fkey";
            columns: ["parent_affiliate_id"];
            isOneToOne: false;
            referencedRelation: "affiliates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "affiliates_commission_plan_id_fkey";
            columns: ["commission_plan_id"];
            isOneToOne: false;
            referencedRelation: "commission_plans";
            referencedColumns: ["id"];
          }
        ];
      };
      clicks: {
        Row: {
          id: string;
          affiliate_id: string;
          campaign_id: string | null;
          ip_hash: string;
          country_code: string | null;
          device_type: "desktop" | "mobile" | "tablet" | "other";
          browser: string | null;
          os: string | null;
          referrer: string | null;
          landing_page: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          utm_content: string | null;
          utm_term: string | null;
          session_id: string;
          converted: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["clicks"]["Row"]> & { affiliate_id: string; ip_hash: string; session_id: string };
        Update: Partial<Database["public"]["Tables"]["clicks"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "clicks_affiliate_id_fkey";
            columns: ["affiliate_id"];
            isOneToOne: false;
            referencedRelation: "affiliates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clicks_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          }
        ];
      };
      sessions: {
        Row: {
          id: string;
          affiliate_id: string;
          click_id: string | null;
          fingerprint: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["sessions"]["Row"]> & { affiliate_id: string; expires_at: string };
        Update: Partial<Database["public"]["Tables"]["sessions"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "sessions_affiliate_id_fkey";
            columns: ["affiliate_id"];
            isOneToOne: false;
            referencedRelation: "affiliates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sessions_click_id_fkey";
            columns: ["click_id"];
            isOneToOne: false;
            referencedRelation: "clicks";
            referencedColumns: ["id"];
          }
        ];
      };
      referrals: {
        Row: {
          id: string;
          affiliate_id: string;
          click_id: string | null;
          campaign_id: string | null;
          customer_email: string;
          customer_external_id: string | null;
          order_value: number;
          is_recurring: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["referrals"]["Row"]> & { affiliate_id: string; customer_email: string; order_value: number };
        Update: Partial<Database["public"]["Tables"]["referrals"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "referrals_affiliate_id_fkey";
            columns: ["affiliate_id"];
            isOneToOne: false;
            referencedRelation: "affiliates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "referrals_click_id_fkey";
            columns: ["click_id"];
            isOneToOne: false;
            referencedRelation: "clicks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "referrals_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          }
        ];
      };
      commissions: {
        Row: {
          id: string;
          affiliate_id: string;
          referral_id: string;
          tier_level: number;
          type: "percentage" | "fixed" | "lifetime" | "one_time";
          rate: number | null;
          base_amount: number;
          commission_amount: number;
          status: "pending" | "approved" | "rejected" | "paid";
          approved_by: string | null;
          approved_at: string | null;
          paid_at: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["commissions"]["Row"]> & {
          affiliate_id: string;
          referral_id: string;
          base_amount: number;
          commission_amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["commissions"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "commissions_affiliate_id_fkey";
            columns: ["affiliate_id"];
            isOneToOne: false;
            referencedRelation: "affiliates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "commissions_referral_id_fkey";
            columns: ["referral_id"];
            isOneToOne: false;
            referencedRelation: "referrals";
            referencedColumns: ["id"];
          }
        ];
      };
      payouts: {
        Row: {
          id: string;
          affiliate_id: string;
          amount: number;
          currency: string;
          method: "paypal" | "sepa" | "crypto";
          destination: string;
          status: "open" | "approved" | "rejected" | "paid";
          requested_at: string;
          reviewed_by: string | null;
          reviewed_at: string | null;
          paid_at: string | null;
          rejection_reason: string | null;
          transaction_reference: string | null;
          commission_ids: string[];
        };
        Insert: Partial<Database["public"]["Tables"]["payouts"]["Row"]> & {
          affiliate_id: string;
          amount: number;
          method: "paypal" | "sepa" | "crypto";
          destination: string;
        };
        Update: Partial<Database["public"]["Tables"]["payouts"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "payouts_affiliate_id_fkey";
            columns: ["affiliate_id"];
            isOneToOne: false;
            referencedRelation: "affiliates";
            referencedColumns: ["id"];
          }
        ];
      };
      campaigns: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["campaigns"]["Row"]> & { name: string; slug: string };
        Update: Partial<Database["public"]["Tables"]["campaigns"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "campaigns_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      commission_plans: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          type: "percentage" | "fixed" | "lifetime" | "one_time";
          tier_1_rate: number;
          tier_2_rate: number;
          tier_3_rate: number;
          fixed_amount: number | null;
          is_lifetime: boolean;
          is_default: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["commission_plans"]["Row"]> & { name: string };
        Update: Partial<Database["public"]["Tables"]["commission_plans"]["Row"]>;
        Relationships: [];
      };
      marketing_assets: {
        Row: {
          id: string;
          title: string;
          type: "banner" | "logo" | "screenshot" | "social" | "video" | "text" | "email_template";
          file_url: string | null;
          content: string | null;
          dimensions: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["marketing_assets"]["Row"]> & { title: string; type: string };
        Update: Partial<Database["public"]["Tables"]["marketing_assets"]["Row"]>;
        Relationships: [];
      };
      settings: {
        Row: { key: string; value: Json; updated_by: string | null; updated_at: string };
        Insert: { key: string; value: Json; updated_by?: string | null };
        Update: Partial<Database["public"]["Tables"]["settings"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "settings_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          metadata: Json | null;
          ip_hash: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["logs"]["Row"]> & { action: string };
        Update: Partial<Database["public"]["Tables"]["logs"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      rate_limits: {
        Row: { key: string; count: number; window_start: string };
        Insert: { key: string; count?: number; window_start?: string };
        Update: Partial<Database["public"]["Tables"]["rate_limits"]["Row"]>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      check_rate_limit: {
        Args: { p_key: string; p_max_attempts: number; p_window_seconds: number };
        Returns: boolean;
      };
      increment_affiliate_clicks: {
        Args: { p_affiliate_id: string } | { p_affiliate_id: string; p_amount: number };
        Returns: void;
      };
      cleanup_rate_limits: { Args: Record<PropertyKey, never>; Returns: void };
    };
    Enums: {
      user_role: "affiliate" | "admin" | "super_admin";
      affiliate_status: "pending" | "active" | "suspended" | "banned";
      commission_type: "percentage" | "fixed" | "lifetime" | "one_time";
      commission_status: "pending" | "approved" | "rejected" | "paid";
      payout_status: "open" | "approved" | "rejected" | "paid";
      payout_method: "paypal" | "sepa" | "crypto";
      device_type: "desktop" | "mobile" | "tablet" | "other";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
