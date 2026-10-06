/** RFC 4180 CSV with a UTF-8 BOM (opens correctly in Excel) and formula-injection protection. */
export function toCsv(header: string[], rows: unknown[][]) {
  const cell = (v: unknown) => {
    let s = v == null ? "" : v instanceof Date ? v.toISOString() : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
}
