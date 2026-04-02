/**
 * `orders.order_datetime` is stored as TEXT.
 * - New rows: ISO UTC from `toISOString()` (e.g. 2026-04-02T20:33:04.017Z).
 * - Imported SQLite rows: often "YYYY-MM-DD HH:mm:ss" without timezone.
 */
export function formatOrderDatetime(raw: string | null | undefined): string {
  if (raw == null || raw === "") return "—";

  let s = raw.trim();
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s)) {
    s = s.replace(" ", "T");
  }

  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return raw;

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  }).format(d);
}
