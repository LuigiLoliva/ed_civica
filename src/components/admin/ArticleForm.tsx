"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthorsFields } from "@/components/admin/AuthorsFields";
import { ImageFields } from "@/components/admin/ImageFields";
import { SourcesFields } from "@/components/admin/SourcesFields";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { TiptapEditor } from "@/components/admin/TiptapEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMockAuth } from "@/lib/mock/auth-context";
import {
  canEditArticle,
  canPublish,
  getTopics,
  saveArticle,
  setArticleStatus,
} from "@/lib/mock/store";
import type { MockArticle } from "@/lib/mock/article-types";
import { slugify } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import {
  articleEditorSchema,
  type ArticleEditorValues,
} from "@/lib/validations/article";

interface ArticleFormProps {
  article?: MockArticle;
}

function emptyDefaults(
  firstName?: string,
  lastName?: string,
): ArticleEditorValues {
  return {
    title: "",
    slug: "",
    topicId: "",
    authors: [{ firstName: firstName ?? "", lastName: lastName ?? "" }],
    excerpt: "",
    body: "<p></p>",
    images: [],
    sources: [
      {
        id: `src-${crypto.randomUUID()}`,
        title: "",
        url: "",
        consultedAt: new Date().toISOString().slice(0, 10),
      },
    ],
    featured: false,
  };
}

export function ArticleForm({ article }: ArticleFormProps) {
  const { user, ready, isAdmin } = useMockAuth();
  const router = useRouter();
  const topics = useMemo(() => getTopics(), []);
  const [slugManual, setSlugManual] = useState(Boolean(article));
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const articleIdRef = useRef(article?.id ?? crypto.randomUUID());

  const editable = Boolean(
    user && (article ? canEditArticle(user, article) : true),
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isDirty },
  } = useForm<ArticleEditorValues>({
    resolver: zodResolver(articleEditorSchema),
    defaultValues: article
      ? {
          title: article.title,
          slug: article.slug,
          topicId: article.topicId,
          authors: article.authors,
          excerpt: article.excerpt,
          body: article.body,
          images: article.images,
          sources: article.sources,
          featured: article.featured,
        }
      : emptyDefaults(user?.nome, user?.cognome),
  });

  const title = watch("title");
  const excerpt = watch("excerpt");
  const values = watch();

  useEffect(() => {
    if (!slugManual && title) {
      setValue("slug", slugify(title), { shouldValidate: true });
    }
  }, [title, slugManual, setValue]);

  const persist = (
    data: ArticleEditorValues,
    status = article?.status ?? ("bozza" as const),
  ): MockArticle => {
    if (!user) throw new Error("Non autenticato");
    const now = new Date().toISOString();
    return saveArticle({
      id: articleIdRef.current,
      title: data.title,
      slug: data.slug,
      topicId: data.topicId,
      authors: data.authors,
      excerpt: data.excerpt,
      body: data.body,
      images: data.images,
      sources: data.sources,
      status,
      authorUserId: article?.authorUserId ?? user.id,
      featured:
        isAdmin ? data.featured : (article?.featured ?? false),
      createdAt: article?.createdAt ?? now,
      updatedAt: now,
      publishedAt:
        status === "pubblicato" ? (article?.publishedAt ?? now) : null,
    });
  };

  useEffect(() => {
    if (!editable || !user || !isDirty) return;
    if (article?.status === "pubblicato" && !isAdmin) return;

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      const parsed = articleEditorSchema.safeParse(getValues());
      if (!parsed.success) {
        setSaveMsg("Autosave in attesa: completa i campi obbligatori");
        return;
      }
      try {
        const status =
          article?.status === "pubblicato" ? "pubblicato" : "bozza";
        persist(parsed.data, status);
        setSaveMsg(
          `Bozza salvata · ${new Date().toLocaleTimeString("it-IT")}`,
        );
      } catch {
        setSaveMsg("Errore autosave");
      }
    }, 2500);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, isDirty, editable, user]);

  const onSaveDraft = handleSubmit((data) => {
    const saved = persist(
      data,
      article?.status === "pubblicato" ? "pubblicato" : "bozza",
    );
    setSaveMsg("Salvato");
    if (!article) router.replace(`/admin/articoli/${saved.id}`);
  });

  const onSubmitReview = handleSubmit((data) => {
    const saved = persist(data, "bozza");
    setArticleStatus(saved.id, "in_revisione");
    setSaveMsg("Inviato in revisione");
    router.push("/admin");
  });

  const onPublish = handleSubmit((data) => {
    if (!user || !canPublish(user)) return;
    const saved = persist(data, "in_revisione");
    setArticleStatus(saved.id, "pubblicato");
    setSaveMsg("Pubblicato");
    router.push("/admin");
  });

  if (!ready || !user) {
    return <p className="text-muted-foreground">Caricamento sessione…</p>;
  }

  if (article && !editable) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950">
        Non puoi modificare questo articolo (non è tuo o è già pubblicato).
        <div className="mt-3">
          <Link href="/admin" className="text-primary underline">
            Torna alla dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {article ? "Modifica articolo" : "Nuovo articolo"}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <StatusBadge status={article?.status ?? "bozza"} />
            {saveMsg ? <span>· {saveMsg}</span> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPreview((p) => !p)}
          >
            {preview ? "Chiudi anteprima" : "Anteprima"}
          </Button>
          <Button variant="outline" render={<Link href="/admin" />}>
            Annulla
          </Button>
        </div>
      </div>

      {preview ? (
        <ArticlePreview
          values={values}
          topicName={topics.find((t) => t.id === values.topicId)?.name}
        />
      ) : null}

      <form className="space-y-8" onSubmit={onSaveDraft}>
        <section className="space-y-4 rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Metadati
          </h2>
          <div className="space-y-1">
            <Label htmlFor="title">Titolo *</Label>
            <Input id="title" {...register("title")} />
            {errors.title ? (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            ) : null}
          </div>
          <div className="space-y-1">
            <Label htmlFor="slug">Slug (URL) *</Label>
            <Input
              id="slug"
              className="font-mono text-sm"
              {...register("slug")}
              onChange={(e) => {
                setSlugManual(true);
                setValue("slug", slugify(e.target.value), {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
            />
            {errors.slug ? (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            ) : null}
          </div>
          <div className="space-y-1">
            <Label htmlFor="topicId">Argomento *</Label>
            <select
              id="topicId"
              {...register("topicId")}
              className="flex h-8 w-full rounded-lg border border-border bg-background px-2 text-sm"
            >
              <option value="">Seleziona…</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            {errors.topicId ? (
              <p className="text-sm text-destructive">
                {errors.topicId.message}
              </p>
            ) : null}
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Autori *</p>
            <Controller
              name="authors"
              control={control}
              render={({ field }) => (
                <AuthorsFields
                  authors={field.value}
                  onChange={field.onChange}
                  error={
                    errors.authors?.message ?? errors.authors?.root?.message
                  }
                />
              )}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="excerpt">
              Riassunto (max {siteConfig.limits.excerptMaxLength}) * ·{" "}
              {excerpt?.length ?? 0}/{siteConfig.limits.excerptMaxLength}
            </Label>
            <Textarea
              id="excerpt"
              rows={3}
              maxLength={siteConfig.limits.excerptMaxLength}
              {...register("excerpt")}
            />
            {errors.excerpt ? (
              <p className="text-sm text-destructive">
                {errors.excerpt.message}
              </p>
            ) : null}
          </div>
          {isAdmin ? (
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("featured")} />
              Articolo in evidenza (home)
            </label>
          ) : null}
        </section>

        <section className="space-y-3 rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Corpo
          </h2>
          <Controller
            name="body"
            control={control}
            render={({ field }) => (
              <TiptapEditor
                value={field.value}
                onChange={field.onChange}
                error={errors.body?.message}
              />
            )}
          />
        </section>

        <section className="space-y-3 rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Immagini (max {siteConfig.limits.maxImagesPerArticle})
          </h2>
          <Controller
            name="images"
            control={control}
            render={({ field }) => (
              <ImageFields
                images={field.value}
                onChange={field.onChange}
                error={
                  (errors.images?.message as string | undefined) ??
                  (errors.images?.root?.message as string | undefined)
                }
              />
            )}
          />
        </section>

        <section className="space-y-3 rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Fonti
          </h2>
          <Controller
            name="sources"
            control={control}
            render={({ field }) => (
              <SourcesFields
                sources={field.value}
                onChange={field.onChange}
                error={
                  (errors.sources?.message as string | undefined) ??
                  (errors.sources?.root?.message as string | undefined)
                }
              />
            )}
          />
        </section>

        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          <Button type="submit" variant="secondary">
            Salva bozza
          </Button>
          <Button type="button" onClick={onSubmitReview}>
            Invia in revisione
          </Button>
          {canPublish(user) ? (
            <Button type="button" variant="default" onClick={onPublish}>
              Pubblica (admin)
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}

function ArticlePreview({
  values,
  topicName,
}: {
  values: ArticleEditorValues;
  topicName?: string;
}) {
  const cover = values.images.find((i) => i.isCover) ?? values.images[0];
  return (
    <article className="rounded-lg border border-primary/30 bg-card p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
        Anteprima pubblica · {topicName ?? "Senza argomento"}
      </p>
      <h2 className="font-heading mt-2 text-3xl text-goal-17">
        {values.title || "Senza titolo"}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {values.authors
          .filter((a) => a.firstName || a.lastName)
          .map((a) => `${a.firstName} ${a.lastName}`.trim())
          .join(", ") || "Autori…"}
      </p>
      <p className="mt-3">{values.excerpt}</p>
      {cover ? (
        <figure className="mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover.url}
            alt={cover.altText}
            className="max-h-80 w-full rounded-md object-cover"
          />
          {(cover.caption || cover.credit) && (
            <figcaption className="mt-1 text-xs text-muted-foreground">
              {cover.caption}
              {cover.credit ? ` · ${cover.credit}` : ""}
            </figcaption>
          )}
        </figure>
      ) : null}
      <div
        className="prose prose-slate mt-6 max-w-none"
        dangerouslySetInnerHTML={{ __html: values.body }}
      />
      {values.sources.length > 0 ? (
        <section className="mt-8 border-t border-border pt-4">
          <h3 className="font-semibold">Fonti</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
            {values.sources.map((s) => (
              <li key={s.id}>
                {s.title || "Fonte"}
                {s.url ? (
                  <>
                    {" — "}
                    <a
                      href={s.url}
                      className="text-primary underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {s.url}
                    </a>
                  </>
                ) : null}
                {s.consultedAt ? ` (consultato il ${s.consultedAt})` : ""}
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </article>
  );
}
