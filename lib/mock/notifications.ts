import { MOCK_SEED_POSTS } from "@/lib/mock/posts";
import { MOCK_USERS } from "@/lib/mock/users";
import { createEveryoneNotifications } from "@/lib/notifications/store";
import { containsEveryoneMention } from "@/lib/timeline/mentions";

/**
 * 初期データの @everyone 投稿に対応する通知を作る。
 * 初回表示から未読バッジを確認できるようにするための、モック期間中だけの処理。
 * import した時点で1度だけ実行される（重複はストア側で除外される）。
 *
 * TODO(#12): 認証基盤の導入後、このファイルごと削除する。
 */
for (const seed of MOCK_SEED_POSTS) {
  if (containsEveryoneMention(seed.body)) {
    createEveryoneNotifications({
      postId: seed.id,
      authorId: seed.authorId,
      recipientIds: MOCK_USERS.map((user) => user.id),
      createdAt: seed.createdAt,
    });
  }
}
