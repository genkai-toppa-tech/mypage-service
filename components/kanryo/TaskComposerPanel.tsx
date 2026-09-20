import { TaskComposerForm } from "@/components/kanryo/TaskComposerForm";

type TaskComposerPanelProps = {
  onSubmit: (input: { body: string; dueMinutes: number }) => Promise<void>;
};

/**
 * 完了の間の投稿エリア（PC向け）。ダイアログを使わず、ページ上部に常時表示する。
 * スマホビューでは ＋ボタン＋フルスクリーン投稿画面（TaskComposerDialog）を使うため非表示にする。
 */
export function TaskComposerPanel({ onSubmit }: TaskComposerPanelProps) {
  return (
    <div className="border-border hidden border-b p-4 md:block">
      <h2 className="sr-only">完了の間に投稿</h2>
      <TaskComposerForm onSubmit={onSubmit} />
    </div>
  );
}
