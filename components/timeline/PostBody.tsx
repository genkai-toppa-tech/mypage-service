import { Fragment } from "react";

import { splitByEveryoneMention } from "@/lib/timeline/mentions";

/** 投稿本文。改行を保ったまま表示し、@everyone だけを強調する。 */
export function PostBody({ body }: { body: string }) {
  return (
    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
      {splitByEveryoneMention(body).map((segment) =>
        segment.type === "mention" ? (
          <span key={segment.start} className="bg-primary/10 text-primary rounded px-1 font-medium">
            {segment.value}
          </span>
        ) : (
          <Fragment key={segment.start}>{segment.value}</Fragment>
        ),
      )}
    </p>
  );
}
