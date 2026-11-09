/** Helper di formattazione per il sito pubblico (IT). */

export function formatDateIt(isoDate: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate));
}

/** Data relativa in italiano (es. "2 giorni fa", "poco fa"). */
export function formatRelativeTimeIt(
  isoDate: string,
  now = Date.now(),
): string {
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return isoDate;

  const diffSeconds = Math.round((then - now) / 1000);
  const abs = Math.abs(diffSeconds);
  const rtf = new Intl.RelativeTimeFormat("it", { numeric: "auto" });

  if (abs < 60) return rtf.format(diffSeconds, "second");
  const minutes = Math.round(diffSeconds / 60);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(diffSeconds / 3600);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  const days = Math.round(diffSeconds / 86400);
  if (Math.abs(days) < 30) return rtf.format(days, "day");
  const months = Math.round(diffSeconds / 2_592_000);
  if (Math.abs(months) < 12) return rtf.format(months, "month");
  const years = Math.round(diffSeconds / 31_536_000);
  return rtf.format(years, "year");
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
