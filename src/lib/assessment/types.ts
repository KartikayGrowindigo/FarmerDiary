// Types for the Cool Farm Platform-style crop assessment (admin only).
// The questionnaire itself lives in src/config/cfp/schema.ts; this file only describes its shape.

export type Pathway = 'annual_crops' | 'paddy_rice' | 'potato'

/**
 * Where a question, option list or rule comes from.
 * - VERIFIED_UI: seen in the live CFP interface (not used yet: the interface needs a CFP login).
 * - VERIFIED_SCHEMA: confirmed by the official CFP API User Guide (payload keys, enum values).
 * - VERIFIED_GUIDE: confirmed by an official CFP guide (Annual Crops Data Input Table, Lay Guide, Quick Start, KB articles).
 * - PROVISIONAL: added so the form works, but not confirmed by any official source.
 */
export type Provenance = 'VERIFIED_UI' | 'VERIFIED_SCHEMA' | 'VERIFIED_GUIDE' | 'PROVISIONAL'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number' // decimal
  | 'integer'
  | 'percent' // 0-100
  | 'year'
  | 'date'
  | 'select' // dropdown; searchable automatically when the list is long
  | 'radio'
  | 'checkbox'
  | 'quantity' // { value, unit }
  | 'pair' // { previous, new } — "previous state + new state" questions
  | 'group' // repeatable records

export type Option = { value: string; label: string; group?: string }
export type OptionList = readonly (string | Option)[]

/** What a rule can look at: the whole assessment, plus the record being edited inside a repeatable group. */
export type RuleCtx = {
  pathway: Pathway
  doc: Doc
  /** The innermost repeatable record (empty object at the top level). */
  item: Record<string, any>
  /** Enclosing records, outermost first (for nested groups). */
  parents: Record<string, any>[]
}

export type Issue = {
  sectionId: string
  /** Path inside the assessment document, e.g. ['fertiliser', 'fertilisers', 2, 'type']. */
  path: (string | number)[]
  label: string
  message: string
  /** missing = required but empty; invalid = a value that breaks a rule; warning = shown but never blocks. */
  kind: 'missing' | 'invalid' | 'warning'
}

export type Field = {
  /** Dotted path. Top-level fields: relative to the assessment document. Fields inside a group: relative to the record. */
  key: string
  label: string
  type: FieldType
  help?: string
  placeholder?: string
  options?: OptionList | ((ctx: RuleCtx) => OptionList)
  /** Units for 'quantity' fields. */
  units?: readonly string[] | ((ctx: RuleCtx) => readonly string[])
  /** Units that mean "no number needed" (e.g. "use default (IPCC)"). */
  noValueUnits?: readonly string[]
  /** Options for the two halves of a 'pair' field. */
  pairLabels?: [string, string]
  optional?: boolean
  /** Overrides the default required rule (when shown and not optional). */
  requiredIf?: (ctx: RuleCtx) => boolean
  showIf?: (ctx: RuleCtx) => boolean
  min?: number
  max?: number
  /** Allow values below zero (default: numbers must be 0 or more). */
  allowNegative?: boolean
  /** Extra rule. Return a message, or null when fine. */
  validate?: (value: any, ctx: RuleCtx) => string | null
  /** Non-blocking advice. */
  warn?: (value: any, ctx: RuleCtx) => string | null
  /** For groups: the record's fields, singular item name, and minimum number of records. */
  fields?: Field[]
  item?: string
  minItems?: number
  /** Rule over a whole group record (e.g. percentages that must not add up to more than 100). */
  validateItem?: (item: Record<string, any>, ctx: RuleCtx) => { key: string; message: string } | null
  /** Rule over the whole list (e.g. at least five years of history). */
  validateList?: (items: Record<string, any>[], ctx: RuleCtx) => string | null
  provenance: Provenance[]
  /** Whether the storage key is a confirmed CFP API key ('verified') or our own name ('provisional'). */
  apiKey: 'verified' | 'provisional'
  /** Where the question is documented, e.g. "Data Input Table row 22". */
  source: string
}

export type SectionDef = {
  id: string
  title: string
  /** Lay-guide heading the section belongs to (shown above it in the navigation). */
  group: string
  icon: string
  pathways: Pathway[]
  /** Mandatory for submission. Optional sections may stay empty but must be complete once started. */
  required: boolean | ((pathway: Pathway) => boolean)
  intro?: string
  fields: Field[]
  provenance: Provenance[]
  source: string
}

/** The assessment answers: farm details plus the CFP-shaped inputData (cropDetails, residue, fertiliser, …). */
export type Doc = Record<string, any>

export type SectionStatus = 'not_started' | 'in_progress' | 'complete' | 'invalid' | 'not_applicable'

export type AssessmentStatus = 'in_progress' | 'submitted' | 'edit_in_progress'

export type CalculationStatus = 'not_configured' | 'pending' | 'calculated' | 'failed'

export type PrefillRecord = { source: string; detail?: string; value: any }

export type Assessment = {
  id: string
  /** Short unique ID shown on screen, e.g. CFA-2026-7K3Q9D. */
  displayId: string
  name: string
  farmerId: string
  plotIds: string[]
  pathway: Pathway
  schemaVersion: string
  status: AssessmentStatus
  calculationStatus: CalculationStatus
  /** Answers. Never holds notes. */
  inputs: Doc
  /** One optional note per section id. Kept apart from inputs so calculations never read it. */
  notes: Record<string, string>
  /** Derived on every save, stored for listing and reporting. */
  sectionStatus: Record<string, SectionStatus>
  progress: number
  /** Which answers were prefilled from existing farmer data, keyed by dotted path. */
  prefill: Record<string, PrefillRecord>
  revision: number
  duplicatedFrom?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  submittedAt?: string
  submittedBy?: string
  deletedAt?: string
}

export type AssessmentSubmission = {
  id: string
  assessmentId: string
  revision: number
  schemaVersion: string
  snapshot: { name: string; pathway: Pathway; farmerId: string; plotIds: string[]; inputs: Doc; notes: Record<string, string> }
  submittedAt: string
  submittedBy?: string
}
