# 限界突破塾マイページサービス — CLAUDE.md

このファイルはリポジトリ直下に配置し、Claude Codeがこのプロジェクトで作業する際の恒久的なガイドとして機能します。

---

## 1. プロジェクト概要

仕事・習慣化コミュニティ「限界突破塾」のためのマイページサービス。現在Discordで行っている日報・宣言・時間割・作業会・運営告知をシステム化し、ユーザー体験を向上させる。

詳細な背景・課題・機能一覧は `docs/requirements.md` を参照すること。実装判断に迷ったら、まずこのドキュメントに立ち返ること。

---

## 2. 技術スタック

- **言語**: TypeScript（strict mode）
- **フレームワーク**: Next.js（App Router）
- **DB / Auth / Realtime**: Supabase
- **ホスティング**: Vercel

---

## 3. アーキテクチャ方針

- **リアルタイム性が必要な機能**（コミュニティタイムライン、「完了の間」の投稿・完了状態）は Supabase Realtime の利用を優先的に検討すること
- **認証**: Supabase Auth を使用。ユーザーには「零／壱（礎メンバー）」などのメンバー種別があるため、`profiles` テーブル等でロール・種別を管理する設計にすること
- **RLS（Row Level Security）**: 全テーブルでRLSを有効にし、「自分のデータは自分で編集できるが、他人の投稿は閲覧のみ」のような権限を明示的にポリシーとして書くこと。RLSを無効にしたまま実装を進めない
- **既存9機能の実装順**: `docs/requirements.md` に記載の優先度に従う。最優先はコミュニティタイムライン／「完了の間」／日報チェックリストの3つ

---

## 4. ディレクトリ構成の方針

- `app/` — Next.js App Router のルーティング
- `components/` — 再利用可能なUIコンポーネント
- `lib/supabase/` — Supabaseクライアント初期化（`client` / `server` / `proxy`）、生成した型
- `lib/auth/` — ログイン中ユーザーの取得、リダイレクト先の解決
- `lib/db/schema.ts` — DBスキーマの一次情報源（Drizzle）
- `drizzle/` — 生成されたマイグレーションSQL。手で新規ファイルを作らずコマンドで生成する
- `proxy.ts`（リポジトリ直下） — セッション更新と未ログイン時のリダイレクト。**Next.js 16 で `middleware` からリネームされたため `middleware.ts` は使わない**
- `docs/requirements.md` — サービス構想書（要件定義の一次情報源）
- 機能追加時は既存のディレクトリ構造・命名パターンに合わせること。新しい構造パターンを導入する場合はPRの説明で理由を明記する

---

## 5. コーディング規約

- ESLint / Prettier の設定に従う（リポジトリの設定ファイルを正とする）
- コンポーネント名は PascalCase、関数・変数は camelCase
- `any` 型の使用は避け、Supabaseの型は `pnpm gen:types`（`supabase gen types typescript`）で生成した `lib/supabase/database.types.ts` を使用する。生成物はコミットする
- サーバーコンポーネント／クライアントコンポーネントの使い分けを意識し、不要な `"use client"` を避ける

### DBスキーマとマイグレーション

- スキーマの一次情報源は `lib/db/schema.ts`（Drizzle）。ここを編集してから `pnpm drizzle-kit generate --name <名前>` でマイグレーションを生成する。**`drizzle/` 配下のSQLを手で新規作成・変更しない**
- SQLファイルは、必ずスキーマ定義`lib/db/schema.ts`（Drizzle）から`pnpm drizzle-kit generate --name <名前>` でマイグレーション生成したものを正として扱うこと。
- スキーマを変更する際も、必ずスキーマ定義`lib/db/schema.ts`（Drizzle）を編集して都度`pnpm drizzle-kit generate --name <名前>` でマイグレーション生成すること（変更マイグレーションファイルを都度生成すること）。
- `pnpm supabase db push` は行わず、必ずユーザーに手動で対応してもらうこと。

---

## 6. Issue駆動の開発ワークフロー

このプロジェクトはGitHub Issuesのラベルで工程を管理する。**ラベルの意味を厳密に守ること。**

| ラベル                           | 意味                                 | 誰が付ける          |
| -------------------------------- | ------------------------------------ | ------------------- |
| `needs-design`                   | 要件はあるが設計・実装方針が未確定   | 人間                |
| `design-approved`                | 設計方針を人間が承認済み。実装着手OK | 人間                |
| `in-review`                      | PR作成済み、レビュー待ち             | Claude Code         |
| `blocked`                        | 他Issueの完了待ち                    | 人間 or Claude Code |
| `needs-human-input`              | 判断に迷い、人間の判断が必要         | Claude Code         |
| `priority:high` / `priority:low` | 優先度                               | 人間                |

### 進め方の絶対ルール

1. **`needs-design` のIssueに対して、いきなり実装を始めない。** まず設計案（DB設計・コンポーネント構成・実装方針）をIssueにコメントし、`design-approved` に人間が付け替えるのを待つこと
2. 実装は `design-approved` が付いてから着手する
3. 要件の解釈やビジネス判断（スコープの拡大・縮小、仕様の曖昧な点の解釈）で迷った場合は、**独断で進めず** `needs-human-input` ラベルを付けてIssueにコメントで質問し、人間の回答を待つこと。技術的な判断（命名規則、実装パターンの選択など）は自律的に進めてよい
4. 実装：

- main ブランチにいることを確認し、`git checkut -b feature/`でブランチを切って対応してください。ブランチ名は対応Issue番号(例：feature/#10)の形にしてください

5. 実装完了後：
   - `pnpm run test`,`pnpm run build`を実行して通ることを確認する（これ以外は基本実行しなくてよい、UIの確認はユーザーに委ねる）
   - `gh pr create` でPRを作成し、Issueにリンクする（`Closes #<issue番号>` を本文に含める）
   - Issueのラベルを `in-review` に付け替える
6. マージは人間が行う。Claude Code自身でマージしない

### 依存関係の扱い

子Issue間に依存関係がある場合は、GitHubの「Linked issues」機能またはIssue本文に明記し、先行Issueがマージされるまで着手しないこと。

---

## 7. レビュー観点（自己レビュー・PR作成前のチェックリスト）

- `docs/requirements.md` の該当機能の受け入れ条件を満たしているか
- テストが書かれているか、既存テストを壊していないか
- 不要なコンソールログ・デバッグコードが残っていないか

---

## 8. 参照ドキュメント

- `docs/requirements.md` — サービス構想書全文（背景・目的・9機能一覧・開発ステップ）
- 本ファイル（CLAUDE.md） — 実装ルール・レビュー観点

## 禁止事項

- `main` ブランチへの直接コミットは禁止します
- `package.json`の直接編集は禁止します（パッケージインストールはこちらで手動で行うため、対象パッケージの提示だけにとどめてください。）
