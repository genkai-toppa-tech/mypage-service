import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./supabase/migrations",
  // TS 側は camelCase、DB 側は snake_case で揃える
  casing: "snake_case",
  // Supabase が管理する auth / storage などのスキーマには手を出さない
  schemaFilter: ["public"],
  // anon / authenticated / service_role は Supabase 側で既に存在するため、
  // Drizzle が CREATE ROLE を生成しないようにする
  entities: { roles: { provider: "supabase" } },
  dbCredentials: {
    // マイグレーション生成（generate）には不要。適用（migrate）時にのみ参照される
    url: process.env.DATABASE_URL ?? "",
  },
});
