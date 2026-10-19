const dateTime = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-arab", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "numeric",
  minute: "2-digit",
});
const shortDateTime = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-arab", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});
const numberFmt = new Intl.NumberFormat("ar-SA-u-nu-arab");

export const fmtDateTime = (iso: string) => dateTime.format(new Date(iso));
export const fmtShort = (iso: string) => shortDateTime.format(new Date(iso));
export const fmtNumber = (n: number) => numberFmt.format(n);

/** Converts Arabic-Indic / Persian digits to Latin so validation works on any keyboard. */
export function toLatinDigits(s: string): string {
  return s
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/** Returns a normalised Saudi mobile number (05XXXXXXXX) or null if invalid. */
export function normalizePhone(input: string): string | null {
  let p = toLatinDigits(input).replace(/[\s\-()]/g, "");
  if (p.startsWith("+966")) p = "0" + p.slice(4);
  else if (p.startsWith("00966")) p = "0" + p.slice(5);
  else if (p.startsWith("966")) p = "0" + p.slice(3);
  else if (/^5\d{8}$/.test(p)) p = "0" + p;
  return /^05\d{8}$/.test(p) ? p : null;
}

/** Value for <input type="datetime-local"> in local time. */
export function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
