"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Send, Check, RotateCcw, Pencil } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MockRoleSwitcher } from "@/components/admin/MockRoleSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMockAuth } from "@/lib/mock/auth-context";
import {
  canEditArticle,
  canPublish,
  getTopics,
  setArticleStatus,
  visibleArticlesFor,
} from "@/lib/mock/store";
import type { ArticleStatus, MockArticle } from "@/lib/mock/article-types";
import { formatDateIt } from "@/lib/format";

const STATUSES: Array<ArticleStatus | "tutti"> = [
  "tutti",
  "bozza",
  "in_revisione",
  "pubblicato",
];

export function ArticleDashboard() {
  const { user, ready, usingDemo, isAdmin } = useMockAuth();
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | "tutti">(
    "tutti",
  );
  const [topicFilter, setTopicFilter] = useState("tutti");
  const [authorFilter, setAuthorFilter] = useState("");
  const [tick, setTick] = useState(0);

  const topics = useMemo(() => {
    void tick;
    return getTopics();
  }, [tick]);

  const filtered = useMemo(() => {
    void tick;
    if (!user) return [];
    return visibleArticlesFor(user).filter((a) => {
      if (statusFilter !== "tutti" && a.status !== statusFilter) return false;
      if (topicFilter !== "tutti" && a.topicId !== topicFilter) return false;
      if (authorFilter.trim()) {
        const q = authorFilter.toLowerCase();
        const hit = a.authors.some(
          (au) =>
            au.firstName.toLowerCase().includes(q) ||
            au.lastName.toLowerCase().includes(q),
        );
        if (!hit) return false;
      }
      return true;
    });
  }, [user, tick, statusFilter, topicFilter, authorFilter]);

  if (!ready || !user) {
    return (
      <p className="text-muted-foreground">
        {usingDemo ? "Caricamento sessione demo…" : "Caricamento sessione…"}
      </p>
    );
  }

  const topicName = (id: string) =>
    topics.find((t) => t.id === id)?.name ?? "—";
  const refresh = () => setTick((n) => n + 1);

  const transition = (article: MockArticle, next: ArticleStatus) => {
    if (next === "pubblicato" && !canPublish(user)) {
      alert("Solo un admin può pubblicare gli articoli.");
      return;
    }
    setArticleStatus(article.id, next);
    refresh();
  };

  return (
    <div className="space-y-6">
      <MockRoleSwitcher />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Articoli
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Flusso: bozza → in revisione → pubblicato
            {isAdmin
              ? " · vista completa admin"
              : " · vedi solo i tuoi articoli"}
          </p>
        </div>
        <Button render={<Link href="/admin/articoli/nuovo" />}>
          <Plus className="size-4" />
          Nuovo articolo
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 rounded-lg border border-border bg-card p-3">
        <label className="text-xs font-medium text-muted-foreground">
          Stato
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as ArticleStatus | "tutti")
            }
            className="mt-1 block h-8 rounded-lg border border-border bg-background px-2 text-sm text-foreground"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "tutti"
                  ? "Tutti"
                  : s === "in_revisione"
                    ? "In revisione"
                    : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-muted-foreground">
          Argomento
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="mt-1 block h-8 rounded-lg border border-border bg-background px-2 text-sm text-foreground"
          >
            <option value="tutti">Tutti</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-muted-foreground">
          Autore
          <Input
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
            placeholder="Nome o cognome"
            className="mt-1"
          />
        </label>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Titolo</th>
              <th className="px-3 py-2">Argomento</th>
              <th className="px-3 py-2">Autori</th>
              <th className="px-3 py-2">Stato</th>
              <th className="px-3 py-2">Aggiornato</th>
              <th className="px-3 py-2">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  Nessun articolo con questi filtri.
                </td>
              </tr>
            ) : (
              filtered.map((article) => {
                const editable = canEditArticle(user, article);
                return (
                  <tr
                    key={article.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="px-3 py-3 font-medium">{article.title}</td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {topicName(article.topicId)}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {article.authors
                        .map((a) => `${a.firstName} ${a.lastName}`)
                        .join(", ")}
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={article.status} />
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {formatDateIt(article.updatedAt)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {editable ? (
                          <Button
                            size="sm"
                            variant="outline"
                            render={
                              <Link href={`/admin/articoli/${article.id}`} />
                            }
                          >
                            <Pencil className="size-3.5" />
                            Modifica
                          </Button>
                        ) : null}
                        {editable && article.status === "bozza" ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              transition(article, "in_revisione")
                            }
                          >
                            <Send className="size-3.5" />
                            In revisione
                          </Button>
                        ) : null}
                        {canPublish(user) &&
                        article.status === "in_revisione" ? (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => transition(article, "pubblicato")}
                          >
                            <Check className="size-3.5" />
                            Pubblica
                          </Button>
                        ) : null}
                        {canPublish(user) &&
                        (article.status === "pubblicato" ||
                          article.status === "in_revisione") ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => transition(article, "bozza")}
                          >
                            <RotateCcw className="size-3.5" />
                            {article.status === "pubblicato"
                              ? "Depubblica"
                              : "Rifiuta"}
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
