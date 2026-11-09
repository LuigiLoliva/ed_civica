"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PlusIcon, Trash2Icon } from "lucide-react";

import {
  saveSiteSettingsAction,
  uploadSiteAssetAction,
} from "@/app/actions/site-settings";
import { TiptapEditor } from "@/components/admin/TiptapEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  siteSettingsSchema,
  type SiteSettingsFormValues,
} from "@/lib/site-settings/schema";
import type { SiteSettings } from "@/lib/site-settings/types";

interface SiteSettingsFormProps {
  initial: SiteSettings;
}

function toFormValues(settings: SiteSettings): SiteSettingsFormValues {
  return {
    ...settings,
    contactEmail: settings.contactEmail ?? "",
    socialLinks: {
      instagram: settings.socialLinks.instagram ?? "",
      schoolWebsite: settings.socialLinks.schoolWebsite ?? "",
      facebook: settings.socialLinks.facebook ?? "",
      youtube: settings.socialLinks.youtube ?? "",
    },
  };
}

export function SiteSettingsForm({ initial }: SiteSettingsFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"logo" | "favicon" | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: toFormValues(initial),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "teachers",
  });

  const footerHtml = watch("footerHtml");
  const siteName = watch("siteName");
  const tagline = watch("tagline");
  const schoolName = watch("schoolName");
  const className = watch("className");
  const schoolYear = watch("schoolYear");
  const logoUrl = watch("logoUrl");
  const faviconUrl = watch("faviconUrl");
  const studentRegistrationEnabled = watch("studentRegistrationEnabled");
  const commentsModerationEnabled = watch("commentsModerationEnabled");

  const onSubmit = handleSubmit(
    async (values) => {
      setSaving(true);
      try {
        const result = await saveSiteSettingsAction(values);
        if (!result.ok) {
          toast.error(result.message);
          return;
        }
        reset(toFormValues(result.settings));
        router.refresh();
        toast.success(result.message);
      } catch (err) {
        console.error(err);
        toast.error("Errore imprevisto durante il salvataggio.");
      } finally {
        setSaving(false);
      }
    },
    () => {
      toast.error(
        "Controlla i campi evidenziati in rosso prima di salvare.",
      );
    },
  );

  const uploadAsset = async (kind: "logo" | "favicon", file: File | null) => {
    if (!file) return;
    setUploading(kind);
    try {
      const fd = new FormData();
      fd.set("kind", kind);
      fd.set("file", file);
      const result = await uploadSiteAssetAction(fd);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setValue(kind === "logo" ? "logoUrl" : "faviconUrl", result.url, {
        shouldDirty: true,
      });
      toast.success(result.message);
    } catch (err) {
      console.error(err);
      toast.error("Upload non riuscito.");
    } finally {
      setUploading(null);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold">Identità del sito</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="siteName">Nome del sito</Label>
            <Input id="siteName" {...register("siteName")} />
            {errors.siteName ? (
              <p className="text-sm text-destructive">{errors.siteName.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">Slogan / sottotitolo</Label>
            <Input id="tagline" {...register("tagline")} />
            {errors.tagline ? (
              <p className="text-sm text-destructive">{errors.tagline.message}</p>
            ) : null}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descrizione (SEO e homepage)</Label>
          <Textarea id="description" rows={3} {...register("description")} />
          {errors.description ? (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold">Scuola</h2>
        <div className="space-y-2">
          <Label htmlFor="schoolName">Nome della scuola</Label>
          <Input id="schoolName" {...register("schoolName")} />
          {errors.schoolName ? (
            <p className="text-sm text-destructive">
              {errors.schoolName.message}
            </p>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="schoolAddress">Indirizzo</Label>
            <Input id="schoolAddress" {...register("schoolAddress")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schoolProvince">Provincia</Label>
            <Input id="schoolProvince" {...register("schoolProvince")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schoolCity">Città</Label>
            <Input id="schoolCity" {...register("schoolCity")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="className">Classe / sezione</Label>
            <Input id="className" {...register("className")} />
            {errors.className ? (
              <p className="text-sm text-destructive">
                {errors.className.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="schoolYear">Anno scolastico</Label>
            <Input id="schoolYear" {...register("schoolYear")} />
            {errors.schoolYear ? (
              <p className="text-sm text-destructive">
                {errors.schoolYear.message}
              </p>
            ) : null}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Email di contatto (opzionale)</Label>
          <Input
            id="contactEmail"
            type="email"
            autoComplete="email"
            {...register("contactEmail")}
          />
          {errors.contactEmail ? (
            <p className="text-sm text-destructive">
              {errors.contactEmail.message}
            </p>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-heading text-xl font-semibold">Docenti referenti</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: "", role: "" })}
          >
            <PlusIcon className="size-4" />
            Aggiungi
          </Button>
        </div>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <div className="space-y-1">
                <Label htmlFor={`teachers.${index}.name`}>Nome</Label>
                <Input
                  id={`teachers.${index}.name`}
                  {...register(`teachers.${index}.name`)}
                />
                {errors.teachers?.[index]?.name ? (
                  <p className="text-sm text-destructive">
                    {errors.teachers[index]?.name?.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1">
                <Label htmlFor={`teachers.${index}.role`}>Ruolo</Label>
                <Input
                  id={`teachers.${index}.role`}
                  {...register(`teachers.${index}.role`)}
                />
                {errors.teachers?.[index]?.role ? (
                  <p className="text-sm text-destructive">
                    {errors.teachers[index]?.role?.message}
                  </p>
                ) : null}
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Rimuovi docente"
                  disabled={fields.length <= 1}
                  onClick={() => remove(index)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        {errors.teachers?.root || typeof errors.teachers?.message === "string" ? (
          <p className="text-sm text-destructive">
            {errors.teachers?.root?.message ?? errors.teachers?.message}
          </p>
        ) : null}
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold">Social (opzionali)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              placeholder="https://…"
              {...register("socialLinks.instagram")}
            />
            {errors.socialLinks?.instagram ? (
              <p className="text-sm text-destructive">
                {errors.socialLinks.instagram.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="schoolWebsite">Sito della scuola</Label>
            <Input
              id="schoolWebsite"
              placeholder="https://…"
              {...register("socialLinks.schoolWebsite")}
            />
            {errors.socialLinks?.schoolWebsite ? (
              <p className="text-sm text-destructive">
                {errors.socialLinks.schoolWebsite.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              placeholder="https://…"
              {...register("socialLinks.facebook")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtube">YouTube</Label>
            <Input
              id="youtube"
              placeholder="https://…"
              {...register("socialLinks.youtube")}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold">Logo e favicon</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <Label htmlFor="logoFile">Logo (PNG / SVG / WebP, max 1 MB)</Label>
            <Input
              id="logoFile"
              type="file"
              accept="image/png,image/svg+xml,image/webp"
              disabled={uploading === "logo"}
              onChange={(e) =>
                void uploadAsset("logo", e.target.files?.[0] ?? null)
              }
            />
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Anteprima logo"
                className="h-16 w-auto rounded border border-border bg-card p-2"
              />
            ) : (
              <p className="text-sm text-muted-foreground">Nessun logo caricato.</p>
            )}
            {logoUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setValue("logoUrl", null, { shouldDirty: true })
                }
              >
                Rimuovi logo
              </Button>
            ) : null}
          </div>
          <div className="space-y-3">
            <Label htmlFor="faviconFile">
              Favicon (opzionale, PNG / SVG / WebP)
            </Label>
            <Input
              id="faviconFile"
              type="file"
              accept="image/png,image/svg+xml,image/webp"
              disabled={uploading === "favicon"}
              onChange={(e) =>
                void uploadAsset("favicon", e.target.files?.[0] ?? null)
              }
            />
            {faviconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={faviconUrl}
                alt="Anteprima favicon"
                className="size-10 rounded border border-border bg-card p-1"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Nessuna favicon caricata.
              </p>
            )}
            {faviconUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setValue("faviconUrl", null, { shouldDirty: true })
                }
              >
                Rimuovi favicon
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold">Testi</h2>
        <div className="space-y-2">
          <Label>Testo del footer</Label>
          <Controller
            control={control}
            name="footerHtml"
            render={({ field }) => (
              <TiptapEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="Testo breve per il piè di pagina…"
                hint="Anteprima live sotto. Usa formattazione semplice."
                minHeightClass="min-h-[120px]"
                error={errors.footerHtml?.message}
              />
            )}
          />
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Anteprima footer
          </p>
          <p className="font-heading text-lg font-semibold">{siteName}</p>
          <p className="text-sm text-muted-foreground">{tagline}</p>
          <p className="text-sm text-muted-foreground">
            {schoolName} · {className} · {schoolYear}
          </p>
          <div
            className="prose prose-sm mt-3 max-w-none text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: footerHtml || "" }}
          />
        </div>
        <div className="space-y-2">
          <Label>Testo pagina «Il progetto»</Label>
          <Controller
            control={control}
            name="projectHtml"
            render={({ field }) => (
              <TiptapEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="Descrivi il progetto scolastico…"
                hint="Visibile nella pagina pubblica Il progetto."
                error={errors.projectHtml?.message}
              />
            )}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold">Funzionalità</h2>
        <div className="space-y-4 rounded-lg border border-border p-4">
          <Controller
            control={control}
            name="commentsModerationEnabled"
            render={({ field }) => (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Moderazione commenti</p>
                  <p className="text-sm text-muted-foreground">
                    Se attiva, i commenti restano in attesa fino all&apos;approvazione.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Stato attuale:{" "}
                    <strong>
                      {commentsModerationEnabled ? "attiva" : "disattiva"}
                    </strong>
                    {isDirty ? " (non ancora salvato)" : ""}
                  </p>
                </div>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="Moderazione commenti"
                />
              </div>
            )}
          />
          <Controller
            control={control}
            name="studentRegistrationEnabled"
            render={({ field }) => (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Registrazione studenti</p>
                  <p className="text-sm text-muted-foreground">
                    Se attiva, gli studenti possono richiedere un account su{" "}
                    <code className="rounded bg-muted px-1">/registrati</code>;
                    restano in attesa finché un docente non li approva in Utenti.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Stato attuale:{" "}
                    <strong>
                      {studentRegistrationEnabled ? "attiva" : "disattiva"}
                    </strong>
                    {isDirty ? " (non ancora salvato)" : ""}
                    . Dopo il salvataggio la pagina pubblica{" "}
                    <code className="rounded bg-muted px-1">/registrati</code>{" "}
                    si aggiorna subito.
                  </p>
                </div>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="Registrazione studenti"
                />
              </div>
            )}
          />
        </div>
      </section>

      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-lg border border-border bg-card/95 p-4 shadow-sm backdrop-blur">
        <p className="text-sm text-muted-foreground">
          {isDirty
            ? "Ci sono modifiche non salvate — premi «Salva modifiche»."
            : "Nessuna modifica da salvare."}
        </p>
        <Button type="submit" disabled={saving}>
          {saving ? "Salvataggio…" : "Salva modifiche"}
        </Button>
      </div>
    </form>
  );
}
