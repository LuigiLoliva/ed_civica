import { describe, expect, it } from "vitest";

import {
  articleEditorSchema,
  articleFormSchema,
  MAX_IMAGES,
} from "@/lib/validations/article";

const validAuthor = { firstName: "Anna", lastName: "Rossi" };
const validSource = {
  title: "Nazioni Unite",
  url: "https://www.un.org/",
  consultedAt: "2026-11-01",
};

describe("articleFormSchema", () => {
  it("accetta un articolo minimo valido", () => {
    const result = articleFormSchema.safeParse({
      title: "Pace e istituzioni",
      slug: "pace-e-istituzioni",
      topicId: "550e8400-e29b-41d4-a716-446655440000",
      excerpt: "Un riassunto breve sull'Obiettivo 16.",
      body: "<p>Corpo dell'articolo di prova.</p>",
      authors: [validAuthor],
      sources: [validSource],
      images: [],
    });
    expect(result.success).toBe(true);
  });

  it("rifiuta slug non valido", () => {
    const result = articleFormSchema.safeParse({
      title: "Titolo ok",
      slug: "Slug Non Valido",
      topicId: "550e8400-e29b-41d4-a716-446655440000",
      excerpt: "Riassunto",
      body: "Corpo",
      authors: [validAuthor],
      sources: [validSource],
      images: [],
    });
    expect(result.success).toBe(false);
  });

  it("rifiuta più di MAX_IMAGES immagini", () => {
    const images = Array.from({ length: MAX_IMAGES + 1 }, (_, i) => ({
      altText: `Alt ${i}`,
      isCover: i === 0,
    }));
    const result = articleFormSchema.safeParse({
      title: "Troppe immagini",
      slug: "troppe-immagini",
      topicId: "550e8400-e29b-41d4-a716-446655440000",
      excerpt: "Riassunto",
      body: "Corpo",
      authors: [validAuthor],
      sources: [validSource],
      images,
    });
    expect(result.success).toBe(false);
  });

  it("richiede almeno una fonte", () => {
    const result = articleFormSchema.safeParse({
      title: "Senza fonti",
      slug: "senza-fonti",
      topicId: "550e8400-e29b-41d4-a716-446655440000",
      excerpt: "Riassunto",
      body: "Corpo",
      authors: [validAuthor],
      sources: [],
      images: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("articleEditorSchema", () => {
  const base = {
    title: "Articolo editor",
    slug: "articolo-editor",
    topicId: "topic-1",
    excerpt: "Riassunto abbastanza lungo per passare.",
    body: "<p>Questo corpo ha abbastanza testo per la validazione.</p>",
    authors: [validAuthor],
    sources: [{ id: "s1", ...validSource }],
    images: [] as Array<{
      id: string;
      url: string;
      altText: string;
      caption: string;
      credit: string;
      isCover: boolean;
    }>,
    featured: false,
  };

  it("richiede copertina se ci sono immagini", () => {
    const result = articleEditorSchema.safeParse({
      ...base,
      images: [
        {
          id: "i1",
          url: "https://example.com/a.jpg",
          altText: "Foto",
          caption: "",
          credit: "UN Photo",
          isCover: false,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("accetta una sola copertina", () => {
    const result = articleEditorSchema.safeParse({
      ...base,
      images: [
        {
          id: "i1",
          url: "https://example.com/a.jpg",
          altText: "Foto",
          caption: "",
          credit: "UN Photo",
          isCover: true,
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});
