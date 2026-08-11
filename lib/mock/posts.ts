import type { SeedPost } from "@/lib/timeline/repository";

/**
 * モックのつぶやきデータ。
 * TODO(#12): 認証基盤の導入後、Supabase の実データに差し替えてこのファイルを削除する。
 */

/** 画面上で相対時刻が自然に見えるよう、読み込み時点を基準に日時を組み立てる。 */
const baseTime = Date.now();

function minutesAgo(minutes: number): string {
  return new Date(baseTime - minutes * 60 * 1000).toISOString();
}

export const MOCK_SEED_POSTS: readonly SeedPost[] = [
  {
    id: "post-013",
    authorId: "user-koshian",
    body: "@everyone 今週の作業会は木曜21時からです。参加できる方はリアクションお願いします！",
    createdAt: minutesAgo(12),
  },
  {
    id: "post-012",
    authorId: "user-sakura",
    body: "朝の30分で提案資料のたたき台まで完成。午前中に一度寝かせて、昼から見直します。",
    createdAt: minutesAgo(45),
  },
  {
    id: "post-011",
    authorId: "user-takumi",
    body: "今日の宣言：\n・提案書の構成を固める\n・見積もりの精度を上げる\n・22時までに日報を出す",
    createdAt: minutesAgo(90),
  },
  {
    id: "post-010",
    authorId: "user-yuta",
    body: "先週サボってしまった分、今週は毎日タイムラインに書きます。まず宣言することから。",
    createdAt: minutesAgo(150),
  },
  {
    id: "post-009",
    authorId: "user-minami",
    body: "案件の締め切りが前倒しになったので、今日は集中モード。作業会には顔を出せそうにないです。",
    createdAt: minutesAgo(260),
  },
  {
    id: "post-008",
    authorId: "user-takumi",
    body: "手を動かす前に、やることを紙に書き出すだけで着手が早くなる。地味だけど効いてる。",
    createdAt: minutesAgo(400),
  },
  {
    id: "post-007",
    authorId: "user-koshian",
    body: "日報は「できたこと」より「詰まったこと」を書いたほうが、あとで読み返す価値が高いです。",
    createdAt: minutesAgo(1_200),
  },
  {
    id: "post-006",
    authorId: "user-sakura",
    body: "連続投稿7日目。以前は3日で止まっていたので、自分としては大きな前進。",
    createdAt: minutesAgo(1_500),
  },
  {
    id: "post-005",
    authorId: "user-takumi",
    body: "@everyone 来週の月次研修、事前に目標を書いてくると議論が早く進みそうです。",
    createdAt: minutesAgo(2_600),
  },
  {
    id: "post-004",
    authorId: "user-yuta",
    body: "作業会に出ると強制的に手が動く。ひとりだと30分かかる着手が5分で済む。",
    createdAt: minutesAgo(3_100),
  },
  {
    id: "post-003",
    authorId: "user-minami",
    body: "今月の目標だった週3本の記事投稿、ようやく形になってきました。",
    createdAt: minutesAgo(4_400),
  },
  {
    id: "post-002",
    authorId: "user-koshian",
    body: "振り返りのコツは、うまくいった理由を言語化すること。失敗の分析だけだと再現できません。",
    createdAt: minutesAgo(5_800),
  },
  {
    id: "post-001",
    authorId: "user-sakura",
    body: "はじめてのつぶやき投稿。ここに積み上がっていくのが楽しみです。",
    createdAt: minutesAgo(7_300),
  },
];
