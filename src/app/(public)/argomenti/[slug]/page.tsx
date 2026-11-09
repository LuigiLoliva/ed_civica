import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Argomento: ${slug}`,
  };
}

export default async function ArgomentoPage({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Argomento
      </h1>
      <p className="mt-2 text-muted-foreground">
        Pagina dedicata all&apos;argomento <code>{slug}</code>. Descrizione e
        elenco articoli in Fase 2.
      </p>
    </div>
  );
}
