# mypage-service

限界突破塾マイページサービス。

> 「積み上げる」を「可視化」して、継続モチベーションを上げる

構想・要件は [docs/requirements.md](docs/requirements.md)、開発ルールは [CLAUDE.md](CLAUDE.md) を参照。

## 技術スタック

| 領域           | 採用                                  |
| -------------- | ------------------------------------- |
| 言語           | TypeScript（strict）                  |
| フレームワーク | Next.js 16（App Router / Turbopack）  |
| UI             | Tailwind CSS v4 + shadcn/ui           |
| Lint / Format  | oxlint / oxfmt                        |
| テスト         | Vitest + React Testing Library        |
| DB / Auth      | Supabase（未導入・今後のIssueで対応） |
| ホスティング   | Vercel                                |
| パッケージ管理 | pnpm                                  |

## セットアップ

```bash
pnpm install
pnpm dev
```

<http://localhost:3000> を開く。

## コマンド

| コマンド            | 内容                         |
| ------------------- | ---------------------------- |
| `pnpm dev`          | 開発サーバー起動             |
| `pnpm build`        | 本番ビルド                   |
| `pnpm start`        | 本番サーバー起動             |
| `pnpm lint`         | oxlint によるLint            |
| `pnpm lint:fix`     | Lintの自動修正               |
| `pnpm format`       | oxfmt によるフォーマット     |
| `pnpm format:check` | フォーマット差分のチェック   |
| `pnpm typecheck`    | 型チェック（`tsc --noEmit`） |
| `pnpm test`         | テスト実行                   |
| `pnpm test:watch`   | テストのウォッチ実行         |

## ディレクトリ構成

```text
app/
  layout.tsx        ルートレイアウト（フォント・メタデータ）
  globals.css       Tailwind / shadcn のテーマトークン
  (main)/
    layout.tsx      サイドメニュー付きレイアウト
    page.tsx        ホーム画面（/）
components/
  layout/           サイドメニューなどレイアウト用コンポーネント
  ui/               shadcn/ui のコンポーネント（追加時に生成）
lib/
  navigation.ts     サイドメニュー項目の定義
  utils.ts          shadcn/ui の cn ヘルパー
docs/
  requirements.md   サービス構想書
```

画面を追加したら [lib/navigation.ts](lib/navigation.ts) の `NAV_ITEMS` に1件足すと、サイドメニューに反映される。

## shadcn/ui コンポーネントの追加

```bash
pnpm dlx shadcn@latest add button
```
