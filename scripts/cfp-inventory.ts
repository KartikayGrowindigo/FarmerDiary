// Writes docs/cfp-assessment/FIELD_INVENTORY.md from the questionnaire schema, so the document can't
// drift from the code. Run: npm run cfp:inventory
import { writeFileSync, mkdirSync } from 'node:fs'
import { PATHWAYS, SCHEMA_VERSION, SECTIONS, isSectionRequired } from '../src/config/cfp/schema'
import { normalizeOptions, rootCtx } from '../src/lib/assessment/engine'
import { Field, Pathway, SectionDef } from '../src/lib/assessment/types'

const esc = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ')
const rule = (fn?: Function) => (fn ? esc(fn.toString().replace(/^\(?c\)?\s*=>\s*/, '').replace(/\s+/g, ' ')) : '')

const optionLists = new Map<string, string[]>()
function describeOptions(f: Field): string {
  if (!f.options && !f.units) return ''
  const src = f.options ?? f.units
  if (typeof src === 'function') {
    // Evaluate per pathway with no record context; record-dependent lists are described as such.
    try {
      const per = PATHWAYS.map(p => [p.label, normalizeOptions(src(rootCtx(p.id, {})) as any).map(o => o.label)] as const)
      const same = per.every(([, l]) => l.join() === per[0][1].join())
      if (same && per[0][1].length) return listRef(f, per[0][1])
      if (per.every(([, l]) => !l.length)) return `depends on the record (${rule(src)})`
      return per.map(([p, l]) => `${p}: ${l.length > 6 ? listRef(f, l, p) : l.join(', ')}`).join('; ')
    } catch {
      return `depends on the record (${rule(src)})`
    }
  }
  return listRef(f, normalizeOptions(src as any).map(o => o.label))
}
function listRef(f: Field, labels: string[], suffix = '') {
  if (labels.length <= 6) return esc(labels.join(', '))
  const name = `${f.label}${suffix ? ` (${suffix})` : ''}`
  if (!optionLists.has(name)) optionLists.set(name, labels)
  return `${labels.length} options — see [${esc(name)}](#${anchor(name)})`
}
const anchor = (s: string) => s.toLowerCase().replace(/[^a-z0-9 -]/g, '').trim().replace(/\s+/g, '-')

function required(f: Field, s: SectionDef): string {
  if (f.type === 'group') return f.minItems ? `list, at least ${f.minItems}` : 'list (may be empty)'
  if (f.requiredIf) return `when: ${rule(f.requiredIf)}`
  if (f.optional || f.type === 'checkbox') return 'optional'
  const always = PATHWAYS.every(p => !s.pathways.includes(p.id) || isSectionRequired(s, p.id))
  return always ? 'required' : 'required once the section is started'
}

const rows: string[] = []
function visit(s: SectionDef, f: Field, prefix: string, depth: number) {
  const path = prefix ? `${prefix}[].${f.key}` : f.key
  const units = f.type === 'quantity' ? describeOptions({ ...f, options: undefined }) : ''
  const options = f.type === 'quantity' || f.type === 'group' ? '' : describeOptions({ ...f, units: undefined })
  rows.push(`| ${esc(s.title)} | ${'↳ '.repeat(depth)}${esc(f.label)} | \`${path}\` | ${f.type} | ${units} | ${options} | ${required(f, s)} | ${rule(f.showIf)} | ${f.provenance.join(', ')} | ${f.apiKey} | ${esc(f.source)} |`)
  if (f.type === 'group') for (const c of f.fields!) visit(s, c, path, depth + 1)
}
for (const s of SECTIONS) for (const f of s.fields) visit(s, f, '', 0)

const pathways = (s: SectionDef) => s.pathways.map(p => PATHWAYS.find(x => x.id === p)!.label).join(', ')
const sectionRows = SECTIONS.map((s, i) => {
  const req = (['annual_crops', 'paddy_rice', 'potato'] as Pathway[]).filter(p => s.pathways.includes(p) && isSectionRequired(s, p))
  return `| ${i + 1} | ${esc(s.title)} | ${esc(s.group)} | ${pathways(s)} | ${req.length ? 'required' : 'optional'} | ${s.provenance.join(', ')} | ${esc(s.source)} |`
})

const md = `# CFP assessment — field inventory

Generated from \`src/config/cfp/schema.ts\` by \`npm run cfp:inventory\` (questionnaire version \`${SCHEMA_VERSION}\`). Do not edit by hand.

- **Path**: where the answer is stored in the assessment's \`inputs\` (CFP \`inputData\` shape; \`farm.*\` is the CFP farm object). \`[]\` marks a repeatable record.
- **Required**: "required once the section is started" applies to optional sections: they may stay empty, but every non-optional answer is needed once any answer is given. Notes are never required.
- **Provenance**: VERIFIED_GUIDE = official CFP guide (mostly the *Annual Crops Data Input Table*); VERIFIED_SCHEMA = CFP API User Guide; PROVISIONAL = not confirmed. **API key**: whether the storage key is a confirmed CFP API key.
- Every section also has an optional **User Notes** text box (stored in \`notes.<sectionId>\`, outside \`inputs\`).

## Sections (navigation order)

| # | Section | Group | Pathways | Status | Provenance | Source |
|---|---|---|---|---|---|---|
${sectionRows.join('\n')}

## Questions

| Section | Question | Path | Type | Units | Options | Required | Shown when | Provenance | API key | Source |
|---|---|---|---|---|---|---|---|---|---|---|
${rows.join('\n')}

## Option lists

${[...optionLists].map(([name, list]) => `### ${name}\n\n${list.map(l => `- ${l}`).join('\n')}\n`).join('\n')}`

mkdirSync('docs/cfp-assessment', { recursive: true })
writeFileSync('docs/cfp-assessment/FIELD_INVENTORY.md', md)
console.log(`Wrote docs/cfp-assessment/FIELD_INVENTORY.md: ${SECTIONS.length} sections, ${rows.length} questions, ${optionLists.size} option lists`)
