import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  integer,
  pgEnum,
  pgPolicy,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
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

/** 完了の間のタスク状態。Issue #18。 */
export const kanryoTaskStatus = pgEnum("kanryo_task_status", ["pending", "completed"]);

export const kanryoTasks = pgTable(
  "kanryo_tasks",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    body: text().notNull(),
    /** 制限時刻。クライアントが「投稿時刻 + 選択した分数」を計算して送る。 */
    dueAt: timestamp({ withTimezone: true }).notNull(),
    status: kanryoTaskStatus().notNull().default("pending"),
    /** 完了時に guard_kanryo_task_completion() トリガーが now() を入れる。 */
    completedAt: timestamp({ withTimezone: true }),
    /** 投稿日（JST）。set_kanryo_task_daily_seq() トリガーが採番する。 */
    jstDate: date().notNull(),
    /** 当日そのユーザーの何回目の投稿か。set_kanryo_task_daily_seq() トリガーが採番する。 */
    dailySeq: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // status と completedAt の食い違いをDBで防ぐ
    check(
      "kanryo_tasks_status_completed_at_check",
      sql`(${table.status} = 'completed') = (${table.completedAt} is not null)`,
    ),
    // 連番の重複をDBで防ぐ（採番トリガーの advisory lock が万一すり抜けた場合の最後の砦）
    unique("kanryo_tasks_user_id_jst_date_daily_seq_key").on(
      table.userId,
      table.jstDate,
      table.dailySeq,
    ),
    // タイムラインの keyset ページネーション用
    index("kanryo_tasks_created_at_id_idx").on(table.createdAt.desc(), table.id.desc()),
    // マイページの完了数集計（#22）用
    index("kanryo_tasks_user_id_status_idx").on(table.userId, table.status),

    // 塾生限定のサービスなので、認証済みであれば全員の投稿を閲覧できる（タイムライン表示のため）
    pgPolicy("kanryo_tasks are viewable by authenticated users", {
      for: "select",
      to: authenticatedRole,
      using: sql`true`,
    }),
    // 作成できるのは本人の未完了タスクのみ
    pgPolicy("users can insert own pending kanryo_tasks", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${authUid} = ${table.userId} and ${table.status} = 'pending' and ${table.completedAt} is null`,
    }),
    // 更新できるのは本人の行のみ。実際に更新できる列は status のみに GRANT で絞る（0002のカスタムSQL）
    pgPolicy("users can update own kanryo_tasks", {
      for: "update",
      to: authenticatedRole,
      using: sql`${authUid} = ${table.userId}`,
      withCheck: sql`${authUid} = ${table.userId}`,
    }),
    // DELETE のポリシーは意図的に作らない。積み上げの記録を消さない方針。
  ],
).enableRLS();

/** 完了の間の投稿への「いいね」。Issue #31。 */
export const kanryoTaskLikes = pgTable(
  "kanryo_task_likes",
  {
    taskId: uuid()
      .notNull()
      .references(() => kanryoTasks.id, { onDelete: "cascade" }),
    userId: uuid()
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // 複合主キーにより「1ユーザー1いいね」をDBで保証する
    primaryKey({ columns: [table.taskId, table.userId] }),
    // タスクごとのいいね件数・いいねしたユーザー一覧の取得用
    index("kanryo_task_likes_task_id_idx").on(table.taskId),

    // 誰がいいねしたか分かるようにするため、認証済みであれば全員が閲覧できる
    pgPolicy("kanryo_task_likes are viewable by authenticated users", {
      for: "select",
      to: authenticatedRole,
      using: sql`true`,
    }),
    // 自分の名義でのみいいねできる（自分の投稿へのいいねも許可する）
    pgPolicy("users can like as themselves", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${authUid} = ${table.userId}`,
    }),
    // いいねの取り消し（unlike）は自分の行のみ。トグル操作のため kanryo_tasks と異なり DELETE を許可する
    pgPolicy("users can unlike their own like", {
      for: "delete",
      to: authenticatedRole,
      using: sql`${authUid} = ${table.userId}`,
    }),
  ],
).enableRLS();
