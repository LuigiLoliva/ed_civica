"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { getArticleById } from "@/lib/mock/store";
import type { MockArticle } from "@/lib/mock/article-types";

export default function ModificaArticoloPage() {
  const params = useParams<{ id: string }>();
  const [article, setArticle] = useState<MockArticle | null | undefined>(
    undefined,
  );

  useEffect(() => {
    setArticle(getArticleById(params.id) ?? null);
  }, [params.id]);

  if (article === undefined) {
    return <p className="text-muted-foreground">Caricamento…</p>;
  }

  if (article === null) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
        Articolo non trovato.
        <div className="mt-2">
          <Link href="/admin" className="underline">
            Torna alla dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <ArticleForm article={article} />;
}
