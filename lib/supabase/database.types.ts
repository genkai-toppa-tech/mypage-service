/**
 * `pnpm gen:types`（supabase gen types typescript）の生成物。
 *
 * NOTE(#12): Supabase プロジェクトの作成とマイグレーション適用が終わるまでは
 * 生成コマンドを実行できないため、drizzle スキーマ（lib/db/schema.ts）と
 * 同じ内容を生成物と同じ形で手で用意している。
 * プロジェクト作成後に一度 `pnpm gen:types` を実行し、差分が出た場合は生成結果を正とする。
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          member_type: Database["public"]["Enums"]["member_type"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          member_type?: Database["public"]["Enums"]["member_type"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          member_type?: Database["public"]["Enums"]["member_type"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_users_id_fk";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      member_type: "zero" | "ichi";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];
