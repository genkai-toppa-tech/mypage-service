import { sql } from "drizzle-orm";
import { pgEnum, pgPolicy, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { authUid, authUsers, authenticatedRole } from "drizzle-orm/supabase";

/**
 * DBスキーマの一次情報源。
 * ここを編集して `pnpm drizzle-kit generate` でマイグレーションを生成する。
 *
 * ランタイムのクエリは supabase-js（ユーザーのJWTでRLSが効く）で行うため、
 * Drizzle はスキーマ定義とマイグレーション生成の用途に限って使う。
 */

/** メンバー種別。requirements 機能8「零／壱（礎メンバー）」に対応する。 */
export const memberType = pgEnum("member_type", ["zero", "ichi"]);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid()
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    displayName: text().notNull(),
    /** Discord のアバター画像URL。未設定の場合は null。 */
    avatarUrl: text(),
    /** 既定は零。壱（礎メンバー）への変更は運営のみが行う。 */
    memberType: memberType().notNull().default("zero"),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // 塾生限定のサービスなので、認証済みであれば全員のプロフィールを閲覧できる
    pgPolicy("profiles are viewable by authenticated users", {
      for: "select",
      to: authenticatedRole,
      using: sql`true`,
    }),
    // 更新できるのは本人の行のみ。
    // authUid は `(select auth.uid())` に展開され、行ごとの再評価を避けられる
    pgPolicy("users can update own profile", {
      for: "update",
      to: authenticatedRole,
      using: sql`${authUid} = ${table.id}`,
      withCheck: sql`${authUid} = ${table.id}`,
    }),
    // INSERT / DELETE のポリシーは意図的に作らない。
    // 作成は handle_new_user()（security definer）、削除は auth.users からの
    // on delete cascade が担い、クライアントからは実行できない状態にしておく。
  ],
).enableRLS();
