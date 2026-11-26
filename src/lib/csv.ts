// One CSV cell. Free text typed in the app (names, notes, answers) can start with = + - @, which Excel
// and Google Sheets run as a formula when the file is opened (CSV injection). Such text gets a leading
// apostrophe so it shows as text; plain numbers like -5 or +2.5 are left alone.
const NUMBER = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i

export function csvCell(v: unknown) {
  let s = v === null || v === undefined ? '' : String(v)
  if (typeof v !== 'number' && /^[=+\-@\t\r]/.test(s) && !NUMBER.test(s)) s = "'" + s
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
