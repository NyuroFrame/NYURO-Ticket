/** Formato tabular empresarial: fechas cortas + conteos. */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('es', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/** Referencia legible M04-HU-004: `NYU-1042`. */
export function ticketRef(ref: string): string {
  return ref.toUpperCase();
}
