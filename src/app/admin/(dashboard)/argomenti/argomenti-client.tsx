"use client";

import { useEffect, useState } from "react";
import { AdminOnlyNotice } from "@/components/admin/AdminOnlyNotice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMockAuth } from "@/lib/mock/auth-context";
import { getTopics, saveTopic } from "@/lib/mock/store";
import type { MockTopic } from "@/lib/mock/article-types";
import { slugify } from "@/lib/format";

/**
 * @param serverCanManage
 * - `true`/`false`: decisione dal profilo Supabase (server)
 * - `null`: nessuna sessione → fallback demo localStorage
 */
export function ArgomentiClient({
  serverCanManage,
}: {
  serverCanManage: boolean | null;
}) {
  const { isAdmin, ready, usingDemo } = useMockAuth();
  const [topics, setTopics] = useState<MockTopic[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#009EDB");

  const canManage =
    serverCanManage !== null ? serverCanManage : ready && isAdmin;

  useEffect(() => {
    if (serverCanManage === null && !ready) return;
    if (!canManage) return;
    setTopics(getTopics());
  }, [ready, canManage, serverCanManage]);

  if (serverCanManage === null && !ready) {
    return <p className="text-muted-foreground">Caricamento…</p>;
  }

  if (!canManage) {
    return (
      <AdminOnlyNotice
        resource="gli argomenti"
        showDemoHint={serverCanManage === null && usingDemo}
      />
    );
  }

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const topic: MockTopic = {
      id: `t-${crypto.randomUUID().slice(0, 8)}`,
      name: name.trim(),
      slug: slugify(name),
      description: description.trim(),
      color,
    };
    setTopics(saveTopic(topic));
    setName("");
    setDescription("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Argomenti
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Stub admin: nome, slug, descrizione, colore. Sarà collegato a
          Supabase <code className="rounded bg-muted px-1">topics</code>.
        </p>
      </div>

      <form
        onSubmit={onAdd}
        className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-2"
      >
        <div className="space-y-1">
          <Label htmlFor="topic-name">Nome</Label>
          <Input
            id="topic-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="topic-color">Colore</Label>
          <Input
            id="topic-color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10"
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="topic-desc">Descrizione</Label>
          <Textarea
            id="topic-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>
        <Button type="submit" className="sm:col-span-2 sm:w-fit">
          Aggiungi argomento
        </Button>
      </form>

      <ul className="divide-y divide-border rounded-lg border border-border bg-card">
        {topics.map((t) => (
          <li key={t.id} className="flex flex-wrap items-start gap-3 px-4 py-3">
            <span
              className="mt-1 size-4 shrink-0 rounded-full"
              style={{ backgroundColor: t.color }}
              aria-hidden
            />
            <div>
              <p className="font-medium">{t.name}</p>
              <p className="text-xs text-muted-foreground">/{t.slug}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
