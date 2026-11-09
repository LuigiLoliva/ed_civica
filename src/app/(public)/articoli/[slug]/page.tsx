import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Articolo: ${slug}`,
  };
}

export default async function ArticoloPage({ params }: Props) {
  const { slug } = await params;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-sm text-muted-foreground">Slug: {slug}</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
        Pagina articolo (placeholder)
      </h1>
      <p className="mt-4 text-muted-foreground">
        Contenuto, immagini (max 4), fonti, correlati e commenti verranno
        implementati nella Fase 2–4.
      </p>
    </article>
  );
}
