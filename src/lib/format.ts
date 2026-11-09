/** Helper di formattazione per il sito pubblico (IT). */

export function formatDateIt(isoDate: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function authorFullName(author: {
  firstName: string;
  lastName: string;
}) {
  return `${author.firstName} ${author.lastName}`;
}

/** Genera uno slug URL-safe da un titolo italiano */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
