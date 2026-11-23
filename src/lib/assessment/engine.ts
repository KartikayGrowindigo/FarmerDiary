import { SECTIONS, isSectionRequired, sectionsFor } from '../../config/cfp/schema'
import { Doc, Field, Issue, Option, OptionList, Pathway, RuleCtx, SectionDef, SectionStatus } from './types'

// Pure questionnaire logic: reading/writing answers, show/hide rules, validation, section status.
// No React and no storage here, so it can be tested and reused by a future calculation step.

export type Path = (string | number)[]

export const splitKey = (key: string): Path => key.split('.')

export function getAt(obj: any, path: Path): any {
  let cur = obj
  for (const p of path) {
    if (cur === null || cur === undefined) return undefined
    cur = cur[p as any]
  }
  return cur
}

/** Immutable set. Removing a value (undefined) deletes the key so empty answers don't linger. */
export function setAt<T extends Record<string, any>>(obj: T, path: Path, value: any): T {
  if (!path.length) return value
  const [head, ...rest] = path
  const base: any = Array.isArray(obj) ? [...obj] : { ...(obj || {}) }
  const next = rest.length ? setAt(base[head as any] ?? (typeof rest[0] === 'number' ? [] : {}), rest, value) : value
  if (next === undefined) {
    if (Array.isArray(base)) base[head as number] = undefined
    else delete base[head as any]
  } else base[head as any] = next
  return base
}

export function normalizeOptions(list: OptionList): Option[] {
  return list.map(o => (typeof o === 'string' ? { value: o, label: o } : o))
}

export const optionsOf = (field: Field, ctx: RuleCtx): Option[] =>
  field.options ? normalizeOptions(typeof field.options === 'function' ? field.options(ctx) : field.options) : []

export const unitsOf = (field: Field, ctx: RuleCtx): readonly string[] =>
  field.units ? (typeof field.units === 'function' ? field.units(ctx) : field.units) : []

export const isShown = (field: Field, ctx: RuleCtx) => (field.showIf ? field.showIf(ctx) : true)

export function isAnswered(field: Field, v: any): boolean {
  if (v === undefined || v === null || v === '') return false
  if (field.type === 'checkbox') return v === true
  if (field.type === 'group') return Array.isArray(v) && v.length > 0
  if (field.type === 'quantity') return (v.value !== undefined && v.value !== null && v.value !== '') || (!!v.unit && !!field.noValueUnits?.includes(v.unit))
  if (field.type === 'pair') return !!(v.previous || v.new)
  return true
}

export const rootCtx = (pathway: Pathway, doc: Doc): RuleCtx => ({ pathway, doc, item: {}, parents: [] })
export const childCtx = (ctx: RuleCtx, item: Record<string, any>): RuleCtx => ({ ...ctx, item, parents: [...ctx.parents, ctx.item] })

/** True when the section has any answer (notes don't count). */
export function sectionStarted(section: SectionDef, doc: Doc, pathway: Pathway): boolean {
  const ctx = rootCtx(pathway, doc)
  return section.fields.some(f => isShown(f, ctx) && isAnswered(f, getAt(doc, splitKey(f.key))))
}

function isRequired(field: Field, ctx: RuleCtx, scopeActive: boolean) {
  if (field.requiredIf) return field.requiredIf(ctx)
  if (field.optional || field.type === 'checkbox') return false
  return scopeActive
}

function numberIssue(field: Field, raw: any): string | null {
  const n = Number(raw)
  if (raw === '' || raw === null || raw === undefined) return null
  if (!Number.isFinite(n)) return 'Enter a number'
  if ((field.type === 'integer' || field.type === 'year') && !Number.isInteger(n)) return 'Enter a whole number'
  if (field.type === 'percent' && (n < 0 || n > 100)) return 'Must be between 0 and 100'
  if (field.type === 'year' && (n < 1900 || n > 2100)) return 'Enter a four-digit year'
  if (!field.allowNegative && n < 0) return 'Must be 0 or more'
  if (field.min !== undefined && n < field.min) return `Must be at least ${field.min}`
  if (field.max !== undefined && n > field.max) return `Must be at most ${field.max}`
  return null
}

/** Validate one field (and, for groups, every record in it). Pushes problems onto `out`. */
function checkField(field: Field, ctx: RuleCtx, base: Path, value: any, sectionId: string, scopeActive: boolean, out: Issue[]) {
  if (!isShown(field, ctx)) return
  const path = [...base, ...splitKey(field.key)]
  const push = (message: string, kind: Issue['kind'], at: Path = path) => out.push({ sectionId, path: at, label: field.label, message, kind })
  const answered = isAnswered(field, value)
  const required = isRequired(field, ctx, scopeActive)

  if (field.type === 'group') {
    const items: Record<string, any>[] = Array.isArray(value) ? value.filter(Boolean) : []
    if (scopeActive && field.minItems && items.length < field.minItems) push(`Add at least ${field.minItems} ${field.item}`, 'missing')
    items.forEach((item, i) => {
      const ic = childCtx(ctx, item)
      for (const child of field.fields!) checkField(child, ic, [...path, i], getAt(item, splitKey(child.key)), sectionId, true, out)
      const bad = field.validateItem?.(item, ic)
      if (bad) out.push({ sectionId, path: [...path, i, ...splitKey(bad.key)], label: field.label, message: bad.message, kind: 'invalid' })
    })
    const listIssue = field.validateList?.(items, ctx)
    if (listIssue) push(listIssue, 'invalid')
    return
  }

  if (!answered) {
    // A unit with no number counts as unanswered; a number with no unit is caught below.
    if (required) push(field.type === 'quantity' && value?.unit ? 'Enter a number' : 'Required', 'missing')
    return
  }

  if (field.type === 'number' || field.type === 'integer' || field.type === 'percent' || field.type === 'year') {
    const issue = numberIssue(field, value)
    if (issue) return push(issue, 'invalid')
  }
  if (field.type === 'quantity') {
    const units = unitsOf(field, ctx)
    const noValue = !!value.unit && !!field.noValueUnits?.includes(value.unit)
    if (!noValue) {
      const issue = numberIssue({ ...field, type: 'number' }, value.value)
      if (issue) return push(issue, 'invalid')
    }
    if (!value.unit) return push('Choose a unit', 'missing')
    if (units.length && !units.includes(value.unit)) return push(`"${value.unit}" is not an allowed unit`, 'invalid')
  }
  if (field.type === 'select' || field.type === 'radio') {
    const allowed = optionsOf(field, ctx).map(o => o.value)
    if (!allowed.includes(value)) return push(`"${value}" is not one of the allowed options`, 'invalid')
  }
  if (field.type === 'pair') {
    const allowed = optionsOf(field, ctx).map(o => o.value)
    for (const side of ['previous', 'new'] as const) {
      if (!value[side]) push(`Choose the ${side === 'previous' ? 'previous' : 'new'} state`, 'missing', [...path, side])
      else if (!allowed.includes(value[side])) push(`"${value[side]}" is not one of the allowed options`, 'invalid', [...path, side])
    }
    return
  }
  if (field.type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return push('Use a valid date', 'invalid')

  const custom = field.validate?.(value, ctx)
  if (custom) return push(custom, 'invalid')
  const warning = field.warn?.(value, ctx)
  if (warning) push(warning, 'warning')
}

export type SectionReport = {
  section: SectionDef
  status: SectionStatus
  required: boolean
  started: boolean
  issues: Issue[]
}

export function checkSection(section: SectionDef, doc: Doc, pathway: Pathway): SectionReport {
  const required = isSectionRequired(section, pathway)
  if (!section.pathways.includes(pathway)) return { section, status: 'not_applicable', required: false, started: false, issues: [] }
  const started = sectionStarted(section, doc, pathway)
  const issues: Issue[] = []
  const ctx = rootCtx(pathway, doc)
  // Optional sections only demand answers once someone starts filling them.
  const active = required || started
  for (const field of section.fields) checkField(field, ctx, [], getAt(doc, splitKey(field.key)), section.id, active, issues)
  const blocking = issues.filter(i => i.kind !== 'warning')
  const status: SectionStatus =
    !started ? (required ? 'not_started' : blocking.length ? 'in_progress' : 'not_started')
    : blocking.some(i => i.kind === 'invalid') ? 'invalid'
    : blocking.length ? 'in_progress'
    : 'complete'
  return { section, status, required, started, issues }
}

export type AssessmentReport = {
  sections: SectionReport[]
  issues: Issue[]
  blocking: Issue[]
  /** 0-100: share of required-or-started sections that are complete. */
  progress: number
  canSubmit: boolean
  statusById: Record<string, SectionStatus>
}

export function checkAssessment(doc: Doc, pathway: Pathway): AssessmentReport {
  const sections = sectionsFor(pathway).map(s => checkSection(s, doc, pathway))
  const counted = sections.filter(s => s.required || s.started)
  const done = counted.filter(s => s.status === 'complete').length
  const issues = sections.flatMap(s => s.issues)
  const blocking = issues.filter(i => i.kind !== 'warning')
  return {
    sections,
    issues,
    blocking,
    progress: counted.length ? Math.round((done / counted.length) * 100) : 0,
    canSubmit: blocking.length === 0 && sections.every(s => !s.required || s.status === 'complete'),
    statusById: Object.fromEntries(SECTIONS.map(s => [s.id, sections.find(r => r.section.id === s.id)?.status ?? 'not_applicable']))
  }
}

// ---------- Calculation input: only what applies ----------

function pruneValue(field: Field, value: any, ctx: RuleCtx): any {
  if (!isShown(field, ctx) || !isAnswered(field, value)) return undefined
  if (field.type === 'group') {
    return (value as Record<string, any>[]).filter(Boolean).map(item => {
      const ic = childCtx(ctx, item)
      let out: Record<string, any> = {}
      for (const child of field.fields!) {
        const v = pruneValue(child, getAt(item, splitKey(child.key)), ic)
        if (v !== undefined) out = setAt(out, splitKey(child.key), v)
      }
      return out
    })
  }
  if (field.type === 'quantity' && value.unit && field.noValueUnits?.includes(value.unit)) return { unit: value.unit }
  if (['number', 'integer', 'percent', 'year'].includes(field.type)) return Number(value)
  if (field.type === 'quantity') return { value: Number(value.value), unit: value.unit }
  return value
}

/**
 * The answers a calculation may use: hidden or not-applicable answers are dropped, notes are never
 * included, and section objects keep CFP's inputData keys. Farm details are returned separately, as in
 * the CFP API (assessment.farm vs inputData).
 */
export function applicableInputs(doc: Doc, pathway: Pathway): { farm: Doc; inputData: Doc } {
  const ctx = rootCtx(pathway, doc)
  let pruned: Doc = {}
  for (const section of sectionsFor(pathway)) {
    for (const field of section.fields) {
      const v = pruneValue(field, getAt(doc, splitKey(field.key)), ctx)
      if (v !== undefined) pruned = setAt(pruned, splitKey(field.key), v)
    }
  }
  const { farm = {}, ...inputData } = pruned
  // CFP's API selects volume-only irrigation with irrigationCalculationType = 2 (CFP knowledge base).
  for (const e of inputData.irrigation?.events || []) if (e.calculationMethod === 'Volume only') e.irrigationCalculationType = 2
  return { farm, inputData }
}

// ---------- Flat listing (CSV export, field inventory) ----------

export type FlatRow = { sectionId: string; section: string; path: string; label: string; entry: string; value: string; unit: string }

/** Every answer as one row, repeated records numbered from 1 (e.g. "Fertiliser applications #2"). */
export function flattenAnswers(doc: Doc, pathway: Pathway): FlatRow[] {
  const rows: FlatRow[] = []
  const visit = (section: SectionDef, field: Field, value: any, base: Path, entry: string, ctx: RuleCtx) => {
    if (!isAnswered(field, value)) return
    const path = [...base, ...splitKey(field.key)]
    if (field.type === 'group') {
      ;(value as Record<string, any>[]).filter(Boolean).forEach((item, i) => {
        const label = `${entry ? entry + ' › ' : ''}${field.label} #${i + 1}`
        for (const child of field.fields!) visit(section, child, getAt(item, splitKey(child.key)), [...path, i], label, childCtx(ctx, item))
      })
      return
    }
    const shown = isShown(field, ctx)
    const option = (v: string) => optionsOf(field, ctx).find(o => o.value === v)?.label ?? v
    const out = (v: any, unit = '') => rows.push({
      sectionId: section.id, section: section.title, path: path.join('.'), label: field.label + (shown ? '' : ' (not applicable)'),
      entry, value: v === true ? 'Yes' : String(v), unit
    })
    if (field.type === 'quantity') out(value.value ?? '', value.unit ?? '')
    else if (field.type === 'pair') out(`${option(value.previous) ?? ''} → ${option(value.new) ?? ''}`)
    else if (field.type === 'select' || field.type === 'radio') out(option(value))
    else out(value)
  }
  for (const section of sectionsFor(pathway)) {
    const ctx = rootCtx(pathway, doc)
    for (const field of section.fields) visit(section, field, getAt(doc, splitKey(field.key)), [], '', ctx)
  }
  return rows
}
