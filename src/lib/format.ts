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
