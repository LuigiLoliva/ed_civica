import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MockArticle, MockTopic } from "@/lib/mock-data";
import { authorFullName, formatDateIt } from "@/lib/format";

type ArticleCardProps = {
  article: MockArticle;
  topic?: MockTopic;
};

export function ArticleCard({ article, topic }: ArticleCardProps) {
  return (
    <Card className="h-full transition-transform hover:-translate-y-1">
      <div
        className={`h-28 bg-gradient-to-br ${article.coverGradient}`}
        aria-hidden
      />
      <CardHeader>
        {topic ? (
          <Badge variant="secondary" className="w-fit">
            {topic.name}
          </Badge>
        ) : null}
        <CardTitle className="font-heading text-xl leading-snug">
          <Link
            href={`/articoli/${article.slug}`}
            className="hover:text-primary"
          >
            {article.title}
          </Link>
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          {article.summary}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto text-xs text-muted-foreground">
        <p>{article.authors.map(authorFullName).join(", ")}</p>
        <p className="mt-1">
          <time dateTime={article.publishedAt}>
            {formatDateIt(article.publishedAt)}
          </time>
          <span aria-hidden> · </span>
          <span>{article.readingMinutes} min</span>
        </p>
      </CardContent>
    </Card>
  );
}
