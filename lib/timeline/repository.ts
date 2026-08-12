import { containsEveryoneMention } from "@/lib/timeline/mentions";
import type { Post, PostCursor, PostPage, User } from "@/lib/timeline/types";
import { validatePostBody } from "@/lib/timeline/validation";

export type ListPostsParams = {
  limit: number;
  /** 先頭ページを取得する場合は未指定または null。 */
  cursor?: PostCursor | null;
};

/**
 * つぶやきの永続化層。
 * posts テーブルの導入後は、このインターフェースを満たす Supabase 実装に差し替える。
 */
export interface PostRepository {
  listPosts(params: ListPostsParams): Promise<PostPage>;
  createPost(input: { authorId: string; body: string }): Promise<Post>;
  updatePost(input: { id: string; authorId: string; body: string }): Promise<Post>;
  deletePost(input: { id: string; authorId: string }): Promise<void>;
}

/** インメモリ実装の初期データ。 */
export type SeedPost = {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
};

type StoredPost = {
  id: string;
  authorId: string;
  body: string;
  mentionsEveryone: boolean;
  createdAt: string;
  updatedAt: string | null;
  /** 未削除の場合は null。積み上げの記録を残すため物理削除はしない。 */
  deletedAt: string | null;
};

/** 新着順（createdAt desc, id desc）で並べるための比較関数。 */
export function comparePostOrder(
  a: { createdAt: string; id: string },
  b: { createdAt: string; id: string },
): number {
  if (a.createdAt !== b.createdAt) {
    return a.createdAt < b.createdAt ? 1 : -1;
  }

  if (a.id === b.id) {
    return 0;
  }

  return a.id < b.id ? 1 : -1;
}

/**
 * カーソルより後ろ（＝より古い側）に並ぶ投稿かを判定する。
 * OFFSET と違い、読み込み中に新しい投稿が増えても重複・取りこぼしが起きない。
 */
export function isOlderThanCursor(
  post: { createdAt: string; id: string },
  cursor: PostCursor,
): boolean {
  if (post.createdAt !== cursor.createdAt) {
    return post.createdAt < cursor.createdAt;
  }

  return post.id < cursor.id;
}

export function createInMemoryPostRepository(options: {
  users: readonly User[];
  seedPosts?: readonly SeedPost[];
  /**
   * @everyone を含む投稿が作成されたときに呼ばれる。
   * 設計上は posts の AFTER INSERT トリガーに相当する。
   */
  onEveryoneMention?: (post: Post) => void;
  /** 投稿IDの採番。テストから固定値を渡せるようにしている。 */
  generateId?: () => string;
}): PostRepository {
  const generateId = options.generateId ?? (() => crypto.randomUUID());
  const usersById = new Map(options.users.map((user) => [user.id, user]));
  let posts: StoredPost[] = (options.seedPosts ?? []).map((seed) => ({
    id: seed.id,
    authorId: seed.authorId,
    body: seed.body,
    createdAt: seed.createdAt,
    mentionsEveryone: containsEveryoneMention(seed.body),
    updatedAt: null,
    deletedAt: null,
  }));

  function toPost(stored: StoredPost): Post {
    const author = usersById.get(stored.authorId);

    if (author === undefined) {
      throw new Error(`投稿者が見つかりません: ${stored.authorId}`);
    }

    return {
      id: stored.id,
      author,
      body: stored.body,
      mentionsEveryone: stored.mentionsEveryone,
      createdAt: stored.createdAt,
      updatedAt: stored.updatedAt,
    };
  }

  function findEditable(id: string, authorId: string): StoredPost {
    const stored = posts.find((post) => post.id === id && post.deletedAt === null);

    if (stored === undefined) {
      throw new Error("投稿が見つかりません");
    }

    // RLS で「自分の投稿のみ更新・削除できる」と定めた制約を、モックでも同じ形で再現する
    if (stored.authorId !== authorId) {
      throw new Error("他のユーザーの投稿は編集・削除できません");
    }

    return stored;
  }

  return {
    async listPosts({ limit, cursor }) {
      const ordered = posts.filter((post) => post.deletedAt === null).toSorted(comparePostOrder);
      const candidates =
        cursor == null ? ordered : ordered.filter((post) => isOlderThanCursor(post, cursor));
      const page = candidates.slice(0, limit);
      const last = page.at(-1);

      return {
        posts: page.map(toPost),
        nextCursor:
          last !== undefined && candidates.length > limit
            ? { createdAt: last.createdAt, id: last.id }
            : null,
      };
    },

    async createPost({ authorId, body }) {
      const validation = validatePostBody(body);

      if (!validation.ok) {
        throw new Error(validation.message);
      }

      const stored: StoredPost = {
        id: generateId(),
        authorId,
        body,
        mentionsEveryone: containsEveryoneMention(body),
        createdAt: new Date().toISOString(),
        updatedAt: null,
        deletedAt: null,
      };
      posts = [...posts, stored];

      const post = toPost(stored);

      if (stored.mentionsEveryone) {
        options.onEveryoneMention?.(post);
      }

      return post;
    },

    async updatePost({ id, authorId, body }) {
      const validation = validatePostBody(body);

      if (!validation.ok) {
        throw new Error(validation.message);
      }

      const stored = findEditable(id, authorId);
      // 通知は投稿時にのみ作成するため、編集で @everyone を足しても通知は飛ばさない
      const updated: StoredPost = {
        ...stored,
        body,
        mentionsEveryone: containsEveryoneMention(body),
        updatedAt: new Date().toISOString(),
      };
      posts = posts.map((post) => (post.id === id ? updated : post));

      return toPost(updated);
    },

    async deletePost({ id, authorId }) {
      const stored = findEditable(id, authorId);
      const deleted: StoredPost = { ...stored, deletedAt: new Date().toISOString() };
      posts = posts.map((post) => (post.id === id ? deleted : post));
    },
  };
}
