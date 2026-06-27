export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          tipo_usuario: 'voluntario' | 'ong';
          nome: string;
          ong_name: string | null;
          cnpj: string | null;
          seal_active: boolean | null;
          last_audit_date: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          tipo_usuario: 'voluntario' | 'ong';
          nome: string;
          ong_name?: string | null;
          cnpj?: string | null;
          seal_active?: boolean | null;
          last_audit_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tipo_usuario?: 'voluntario' | 'ong';
          nome?: string;
          ong_name?: string | null;
          cnpj?: string | null;
          seal_active?: boolean | null;
          last_audit_date?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      emotion_checkins: {
        Row: {
          id: string;
          user_id: string;
          ong_id: string | null;
          score: number;
          checked_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ong_id?: string | null;
          score: number;
          checked_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ong_id?: string | null;
          score?: number;
          checked_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "emotion_checkins_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      volunteer_actions: {
        Row: {
          id: string;
          user_id: string;
          ong_id: string | null;
          title: string;
          descricao: string;
          horas: number;
          impacto: string | null;
          ods_number: number;
          proof_image_url: string | null;
          server_timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ong_id?: string | null;
          title?: string;
          descricao: string;
          horas: number;
          impacto?: string | null;
          ods_number?: number;
          proof_image_url?: string | null;
          server_timestamp?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ong_id?: string | null;
          title?: string;
          descricao?: string;
          horas?: number;
          impacto?: string | null;
          ods_number?: number;
          proof_image_url?: string | null;
          server_timestamp?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "volunteer_actions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      donations: {
        Row: {
          id: string;
          ong_id: string;
          company_id: string | null;
          tracking_code: string | null;
          doador_nome: string;
          valor: number;
          mensagem: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ong_id: string;
          company_id?: string | null;
          tracking_code?: string | null;
          doador_nome: string;
          valor: number;
          mensagem?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          ong_id?: string;
          company_id?: string | null;
          tracking_code?: string | null;
          doador_nome?: string;
          valor?: number;
          mensagem?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "donations_ong_id_fkey";
            columns: ["ong_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "donations_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      ledger: {
        Row: {
          id: string;
          donation_id: string;
          action_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          donation_id: string;
          action_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          donation_id?: string;
          action_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ledger_donation_id_fkey";
            columns: ["donation_id"];
            isOneToOne: false;
            referencedRelation: "donations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ledger_action_id_fkey";
            columns: ["action_id"];
            isOneToOne: false;
            referencedRelation: "volunteer_actions";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
