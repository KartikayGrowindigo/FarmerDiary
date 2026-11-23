import React, { useEffect, useState } from 'react'
import { Field, Issue, Option, PrefillRecord, RuleCtx } from '../../lib/assessment/types'
import { Path, childCtx, getAt, isAnswered, isShown, optionsOf, splitKey, unitsOf } from '../../lib/assessment/engine'
import { Icon, InfoTip, SearchSelect, cx, inputClass } from './AssessmentUi'

// Renders schema fields as inputs. Values are written back through onSet(path, value) with the
// path inside the assessment document, so the editor owns all state and autosave.

export const fieldDomId = (path: Path) => `fld-${path.join('.')}`

export type FieldsProps = {
  fields: Field[]
  ctx: RuleCtx
  /** Path of the object the field keys are relative to. */
  base: Path
  /** That object. */
  scope: Record<string, any>
  onSet: (path: Path, value: any) => void
  issues: Map<string, Issue[]>
  /** Show "Required" problems (after Validate / Submit). Invalid values and warnings always show. */
  reveal: boolean
  prefill: Record<string, PrefillRecord>
}

export function FieldList(props: FieldsProps) {
  return (
    <div className="flex flex-col gap-5">
      {props.fields.filter(f => isShown(f, props.ctx)).map(f => <FieldRow key={f.key} field={f} {...props} />)}
    </div>
  )
}

const isRequired = (f: Field, ctx: RuleCtx) => (f.requiredIf ? f.requiredIf(ctx) : !f.optional && f.type !== 'checkbox' && f.type !== 'group')

function visibleIssues(list: Issue[] | undefined, reveal: boolean) {
  return (list || []).filter(i => i.kind !== 'missing' || reveal)
}

function FieldRow({ field, ctx, base, scope, onSet, issues, reveal, prefill }: FieldsProps & { field: Field }) {
  const rel = splitKey(field.key)
  const path = [...base, ...rel]
  const key = path.join('.')
  const value = getAt(scope, rel)
  const id = fieldDomId(path)
  const shownIssues = visibleIssues(issues.get(key), reveal)
  const hasError = shownIssues.some(i => i.kind !== 'warning')
  const set = (v: any) => onSet(path, v)
  const required = isRequired(field, ctx)
  const pre = prefill[key]
  const fromFarmer = pre && JSON.stringify(pre.value) === JSON.stringify(value)
  const errorId = shownIssues.length ? `${id}-msg` : undefined

  if (field.type === 'group') return <GroupField field={field} ctx={ctx} path={path} value={value} onSet={onSet} issues={issues} reveal={reveal} prefill={prefill} fromFarmer={!!fromFarmer} pre={pre} />

  const label = (
    <FieldLabel field={field} htmlFor={field.type === 'radio' || field.type === 'pair' ? undefined : id} required={required} fromFarmer={fromFarmer ? pre : undefined} />
  )

  return (
    <div className={field.type === 'radio' || field.type === 'pair' ? '' : ''}>
      {field.type === 'radio' || field.type === 'pair' ? (
        <fieldset aria-describedby={errorId}>
          <legend className="mb-2 w-full">{label}</legend>
          <Control field={field} ctx={ctx} id={id} value={value} set={set} invalid={hasError} describedBy={errorId} />
        </fieldset>
      ) : (
        <>
          <div className="mb-2">{label}</div>
          <Control field={field} ctx={ctx} id={id} value={value} set={set} invalid={hasError} describedBy={errorId} />
        </>
      )}
      {/* Problems on one side of a pair are listed under the pair. */}
      <IssueText id={errorId} issues={[...shownIssues, ...(field.type === 'pair' ? ['previous', 'new'].flatMap(s => visibleIssues(issues.get(`${key}.${s}`), reveal)) : [])]} />
    </div>
  )
}

function FieldLabel({ field, htmlFor, required, fromFarmer }: { field: Field; htmlFor?: string; required: boolean; fromFarmer?: PrefillRecord }) {
  const Tag = htmlFor ? 'label' : 'span'
  return (
    <span className="flex items-start gap-1.5 flex-wrap">
      <Tag htmlFor={htmlFor} className="text-body-md font-bold text-on-surface">
        {field.label}
        {required && <span aria-hidden className="text-rose-600"> *</span>}
        {required && <span className="sr-only"> (required)</span>}
        {!required && field.type !== 'checkbox' && <span className="ml-1.5 text-punjabi-subtext font-medium text-on-surface-variant">(optional)</span>}
      </Tag>
      <Help field={field} />
      {fromFarmer && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 text-label-caps font-label-caps" title={`${fromFarmer.source}${fromFarmer.detail ? ' · ' + fromFarmer.detail : ''}`}>
          <Icon name="person_book" className="text-[14px]" /> From farmer data
        </span>
      )}
      {field.provenance.includes('PROVISIONAL') && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-label-caps font-label-caps" title="Not confirmed by official CFP sources yet">Provisional</span>
      )}
    </span>
  )
}

function Help({ field }: { field: Field }) {
  const units = typeof field.units === 'function' ? null : field.units
  return (
    <InfoTip label={field.label}>
      {field.help && <span className="block mb-2">{field.help}</span>}
      {units && units.length > 0 && <span className="block mb-2 text-white/80">Units: {units.join(', ')}</span>}
      <span className="block text-white/70 text-[12px]">
        Source: {field.source}
        <br />
        {field.provenance.map(p => p.replace('_', ' ').toLowerCase()).join(' · ')}
        {field.apiKey === 'provisional' ? ' · storage key not confirmed by the CFP API' : ''}
      </span>
    </InfoTip>
  )
}

function IssueText({ id, issues }: { id?: string; issues: Issue[] }) {
  if (!issues.length) return null
  return (
    <div id={id} className="mt-1.5 space-y-1" aria-live="polite">
      {issues.map((i, n) => (
        <p key={n} className={cx('flex items-start gap-1 text-punjabi-subtext font-bold', i.kind === 'warning' ? 'text-amber-700' : 'text-rose-700')}>
          <Icon name={i.kind === 'warning' ? 'warning' : 'error'} className="text-[18px]" />
          {i.message}
        </p>
      ))}
    </div>
  )
}

/** Text box for numbers that keeps what's typed ("12.") and stores a number when it parses. */
function NumberInput({ id, value, onChange, integer, allowNegative, invalid, describedBy, placeholder, className, ariaLabel }: {
  id: string; value: any; onChange: (v: any) => void; integer?: boolean; allowNegative?: boolean; invalid?: boolean; describedBy?: string; placeholder?: string; className?: string; ariaLabel?: string
}) {
  const [text, setText] = useState(value === undefined || value === null ? '' : String(value))
  useEffect(() => {
    const parsed = text.trim() === '' ? undefined : Number(text)
    if (parsed !== value && !(typeof value === 'string' && value === text)) setText(value === undefined || value === null ? '' : String(value))
  }, [value])
  return (
    <input
      id={id}
      type="text"
      inputMode={integer ? (allowNegative ? 'text' : 'numeric') : 'decimal'}
      autoComplete="off"
      aria-label={ariaLabel}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      placeholder={placeholder}
      className={cx(inputClass, invalid ? 'border-rose-400' : 'border-stone-200', className)}
      value={text}
      onChange={e => {
        const t = e.target.value.replace(',', '.')
        setText(t)
        if (t.trim() === '') return onChange(undefined)
        const n = Number(t)
        onChange(Number.isFinite(n) && !/[.\-]$/.test(t) ? n : t)
      }}
    />
  )
}

function NativeSelect({ id, value, options, onChange, invalid, describedBy, ariaLabel, placeholder = 'Select…' }: {
  id: string; value: any; options: Option[]; onChange: (v: string | undefined) => void; invalid?: boolean; describedBy?: string; ariaLabel?: string; placeholder?: string
}) {
  const groups = [...new Set(options.map(o => o.group).filter(Boolean))] as string[]
  const opt = (o: Option) => <option key={o.value} value={o.value}>{o.label}</option>
  const unknown = value && !options.some(o => o.value === value)
  return (
    <select
      id={id}
      aria-label={ariaLabel}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className={cx(inputClass, 'pr-8', invalid ? 'border-rose-400' : 'border-stone-200', !value && 'text-on-surface-variant')}
      value={value ?? ''}
      onChange={e => onChange(e.target.value || undefined)}
    >
      <option value="">{placeholder}</option>
      {unknown && <option value={value}>{value} (not allowed)</option>}
      {groups.length ? groups.map(g => <optgroup key={g} label={g}>{options.filter(o => o.group === g).map(opt)}</optgroup>) : options.map(opt)}
    </select>
  )
}

function Control({ field, ctx, id, value, set, invalid, describedBy }: {
  field: Field; ctx: RuleCtx; id: string; value: any; set: (v: any) => void; invalid: boolean; describedBy?: string
}) {
  const border = invalid ? 'border-rose-400' : 'border-stone-200'
  switch (field.type) {
    case 'text':
      return <input id={id} type="text" aria-invalid={invalid || undefined} aria-describedby={describedBy} placeholder={field.placeholder} className={cx(inputClass, border)} value={value ?? ''} onChange={e => set(e.target.value === '' ? undefined : e.target.value)} />
    case 'textarea':
      return <textarea id={id} aria-invalid={invalid || undefined} aria-describedby={describedBy} className={cx(inputClass, border, 'py-3 min-h-[96px]')} value={value ?? ''} onChange={e => set(e.target.value === '' ? undefined : e.target.value)} />
    case 'number':
    case 'integer':
    case 'year':
    case 'percent':
      return (
        <div className="flex items-center gap-2 max-w-xs">
          <NumberInput id={id} value={value} onChange={set} integer={field.type !== 'number'} allowNegative={field.allowNegative} invalid={invalid} describedBy={describedBy} placeholder={field.placeholder ?? (field.type === 'year' ? 'yyyy' : undefined)} />
          {field.type === 'percent' && <span className="text-body-md font-bold text-on-surface-variant">%</span>}
        </div>
      )
    case 'date':
      return <input id={id} type="date" aria-invalid={invalid || undefined} aria-describedby={describedBy} className={cx(inputClass, border, 'max-w-xs')} value={value ?? ''} onChange={e => set(e.target.value || undefined)} />
    case 'checkbox':
      return (
        <label htmlFor={id} className="inline-flex items-center gap-3 min-h-[44px] cursor-pointer">
          <input id={id} type="checkbox" aria-describedby={describedBy} className="w-5 h-5 accent-emerald-700" checked={value === true} onChange={e => set(e.target.checked ? true : undefined)} />
          <span className="text-body-md">Yes</span>
        </label>
      )
    case 'select': {
      const options = optionsOf(field, ctx)
      if (options.length > 12) return <SearchSelect id={id} value={value} options={options} onChange={set} invalid={invalid} describedBy={describedBy} />
      return <NativeSelect id={id} value={value} options={options} onChange={set} invalid={invalid} describedBy={describedBy} />
    }
    case 'radio': {
      const options = optionsOf(field, ctx)
      return (
        <div role="radiogroup" className="flex flex-wrap gap-2">
          {options.map((o, i) => {
            const on = value === o.value
            return (
              <label key={o.value} className={cx('min-h-[44px] px-4 rounded-2xl border-2 inline-flex items-center gap-2 cursor-pointer text-body-md transition-colors focus-within:ring-2 focus-within:ring-emerald-600/30', on ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-extrabold' : invalid ? 'border-rose-300 bg-white' : 'border-stone-200 bg-white hover:border-emerald-600')}>
                <input id={i === 0 ? id : undefined} type="radio" name={id} value={o.value} checked={on} onChange={() => set(o.value)} onClick={() => { if (on) set(undefined) }} className="accent-emerald-700 w-4 h-4" />
                {o.label}
              </label>
            )
          })}
        </div>
      )
    }
    case 'quantity': {
      const units = unitsOf(field, ctx)
      const v = value || {}
      const noValue = !!v.unit && !!field.noValueUnits?.includes(v.unit)
      const update = (patch: Record<string, any>) => {
        const next = { ...v, ...patch }
        if (next.value === undefined) delete next.value
        if (!next.unit) delete next.unit
        set(Object.keys(next).length ? next : undefined)
      }
      return (
        <div className="flex flex-wrap sm:flex-nowrap items-start gap-2">
          {!noValue && (
            <NumberInput id={id} value={v.value} onChange={n => update({ value: n })} allowNegative={field.allowNegative} invalid={invalid} describedBy={describedBy} className="sm:max-w-[200px]" ariaLabel={`${field.label}: amount`} />
          )}
          {units.length === 0 ? (
            <span className="min-h-[48px] flex items-center text-punjabi-subtext text-on-surface-variant">{field.key === 'energyUsed' ? 'Choose the energy source first' : 'No units'}</span>
          ) : (
            <div className="w-full sm:w-auto sm:min-w-[220px]">
              <NativeSelect id={noValue ? id : `${id}-unit`} value={v.unit} options={units.map(u => ({ value: u, label: u }))} onChange={u => update({ unit: u, ...(u && field.noValueUnits?.includes(u) ? { value: undefined } : {}) })} invalid={invalid && !v.unit} ariaLabel={`${field.label}: unit`} placeholder="Unit…" />
            </div>
          )}
        </div>
      )
    }
    case 'pair': {
      const options = optionsOf(field, ctx)
      const v = value || {}
      const update = (side: 'previous' | 'new', s?: string) => {
        const next = { ...v, [side]: s }
        if (!next[side]) delete next[side]
        set(Object.keys(next).length ? next : undefined)
      }
      const [a, b] = field.pairLabels ?? ['Previous', 'New']
      return (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-end gap-2">
          <label className="block">
            <span className="block text-punjabi-subtext text-on-surface-variant mb-1">{a}</span>
            <NativeSelect id={`${id}.previous`} value={v.previous} options={options} onChange={s => update('previous', s)} invalid={invalid && !v.previous} />
          </label>
          <Icon name="arrow_forward" className="hidden sm:block mb-3 text-on-surface-variant" />
          <label className="block">
            <span className="block text-punjabi-subtext text-on-surface-variant mb-1">{b}</span>
            <NativeSelect id={`${id}.new`} value={v.new} options={options} onChange={s => update('new', s)} invalid={invalid && !v.new} />
          </label>
        </div>
      )
    }
    default:
      return null
  }
}

function itemSummary(field: Field, item: Record<string, any>, ctx: RuleCtx) {
  for (const f of field.fields || []) {
    if (f.type !== 'select' && f.type !== 'radio' && f.type !== 'text') continue
    const v = getAt(item, splitKey(f.key))
    if (!v) continue
    return f.type === 'text' ? v : optionsOf(f, childCtx(ctx, item)).find(o => o.value === v)?.label ?? v
  }
  return null
}

function GroupField({ field, ctx, path, value, onSet, issues, reveal, prefill, fromFarmer, pre }: {
  field: Field; ctx: RuleCtx; path: Path; value: any; onSet: (p: Path, v: any) => void; issues: Map<string, Issue[]>; reveal: boolean; prefill: Record<string, PrefillRecord>; fromFarmer: boolean; pre?: PrefillRecord
}) {
  const items: Record<string, any>[] = Array.isArray(value) ? value : []
  const item = field.item || 'entry'
  const Item = item[0].toUpperCase() + item.slice(1)
  const id = fieldDomId(path)
  const groupIssues = visibleIssues(issues.get(path.join('.')), reveal)
  const add = () => {
    onSet(path, [...items, {}])
    // Focus the first input of the new record once it renders.
    setTimeout(() => document.getElementById(`${id}-${items.length}`)?.querySelector<HTMLElement>('input, select, textarea')?.focus(), 30)
  }
  const remove = (i: number) => {
    const filled = (field.fields || []).some(f => isAnswered(f, getAt(items[i], splitKey(f.key))))
    if (filled && !window.confirm(`Remove ${item} ${i + 1}? Its answers will be deleted.`)) return
    const next = items.filter((_, j) => j !== i)
    onSet(path, next.length ? next : undefined)
  }
  return (
    <section aria-labelledby={`${id}-title`} className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <h3 id={`${id}-title`} className="text-body-lg font-extrabold text-on-surface">{field.label}</h3>
        <span className="text-label-caps font-label-caps text-on-surface-variant">{items.length} {items.length === 1 ? item : `${item}s`}</span>
        <Help field={field} />
        {fromFarmer && pre && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 text-label-caps font-label-caps" title={`${pre.source}${pre.detail ? ' · ' + pre.detail : ''}`}>
            <Icon name="person_book" className="text-[14px]" /> From farmer data
          </span>
        )}
      </div>
      {fromFarmer && pre?.detail && <p className="text-punjabi-subtext text-violet-800">{pre.detail}</p>}
      {items.map((it, i) => {
        const ic = childCtx(ctx, it || {})
        const summary = itemSummary(field, it || {}, ctx)
        return (
          <div key={i} id={`${id}-${i}`} className="rounded-3xl border-2 border-stone-200 bg-stone-50/60 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-full bg-emerald-700 text-white text-body-md font-extrabold flex items-center justify-center shrink-0">{i + 1}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-body-md font-extrabold text-on-surface">{Item} {i + 1}</span>
                {summary && <span className="block text-punjabi-subtext text-on-surface-variant truncate">{summary}</span>}
              </span>
              <button type="button" onClick={() => remove(i)} aria-label={`Remove ${item} ${i + 1}`} className="h-10 px-3 rounded-full text-rose-700 hover:bg-rose-50 inline-flex items-center gap-1 font-bold text-punjabi-subtext">
                <Icon name="delete" className="text-[20px]" /> Remove
              </button>
            </div>
            <FieldList fields={field.fields!} ctx={ic} base={[...path, i]} scope={it || {}} onSet={onSet} issues={issues} reveal={reveal} prefill={prefill} />
          </div>
        )
      })}
      {!items.length && <p className="text-punjabi-subtext text-on-surface-variant">No {item}s added.{field.minItems ? ` Add at least ${field.minItems}.` : ' Leave empty if none.'}</p>}
      <button
        id={id}
        type="button"
        onClick={add}
        className="w-full min-h-[48px] rounded-2xl border-2 border-dashed border-emerald-600/60 text-emerald-800 font-extrabold inline-flex items-center justify-center gap-1 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
      >
        <Icon name="add" /> Add {items.length ? 'another' : /^[aeiou]/i.test(item) ? 'an' : 'a'} {item}
      </button>
      <IssueText issues={groupIssues} />
    </section>
  )
}
