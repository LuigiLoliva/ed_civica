import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { MockArticle, MockTopic } from "@/lib/mock-data";
import { authorFullName, formatDateIt } from "@/lib/format";

type ArticleCardProps = {
  article: MockArticle;
  topic?: MockTopic;
};

export function ArticleCard({ article, topic }: ArticleCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_1px_0_rgb(12_26_40_/_4%)] transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_12px_32px_rgb(12_26_40_/_8%)]">
      <div
        className={`h-32 bg-gradient-to-br ${article.coverGradient} transition duration-500 group-hover:scale-[1.02]`}
        aria-hidden
      />
      <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
        {topic ? (
          <Badge variant="secondary" className="w-fit">
            {topic.name}
          </Badge>
        ) : null}
        <h3 className="font-heading mt-3 text-xl leading-snug font-semibold">
          <Link
            href={`/articoli/${article.slug}`}
            className="transition-colors hover:text-primary"
          >
            {article.title}
          </Link>
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {article.summary}
        </p>
        <div className="mt-auto pt-4 text-xs text-muted-foreground">
          <p>{article.authors.map(authorFullName).join(", ")}</p>
          <p className="mt-1">
            <time dateTime={article.publishedAt}>
              {formatDateIt(article.publishedAt)}
            </time>
            <span aria-hidden> · </span>
            <span>{article.readingMinutes} min</span>
          </p>
        </div>
      </div>
    </article>
  );
}
