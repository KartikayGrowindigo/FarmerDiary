import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { AssessmentStatus, Option, SectionStatus } from '../../lib/assessment/types'
import { STATUS_LABEL } from '../../lib/assessment/lifecycle'

// Small building blocks shared by the assessment screens.

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

export function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span aria-hidden className={`material-symbols-outlined ${className}`}>{name}</span>
}

const STATUS_TONE: Record<AssessmentStatus, string> = {
  in_progress: 'bg-amber-100 text-amber-800',
  submitted: 'bg-emerald-100 text-emerald-800',
  edit_in_progress: 'bg-sky-100 text-sky-800'
}

export function StatusPill({ status, deleted }: { status: AssessmentStatus; deleted?: boolean }) {
  if (deleted) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-700 text-label-caps font-label-caps whitespace-nowrap">Deleted</span>
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-caps font-label-caps whitespace-nowrap ${STATUS_TONE[status]}`}>{STATUS_LABEL[status]}</span>
}

export const SECTION_STATUS_META: Record<SectionStatus, { icon: string; tone: string; label: string }> = {
  complete: { icon: 'check_circle', tone: 'text-emerald-600', label: 'Complete' },
  in_progress: { icon: 'pending', tone: 'text-amber-600', label: 'Missing information' },
  invalid: { icon: 'error', tone: 'text-rose-600', label: 'Invalid' },
  not_started: { icon: 'radio_button_unchecked', tone: 'text-stone-400', label: 'Not started' },
  not_applicable: { icon: 'block', tone: 'text-stone-300', label: 'Not applicable' }
}

export function SectionStatusIcon({ status, className = '' }: { status: SectionStatus; className?: string }) {
  const m = SECTION_STATUS_META[status]
  return (
    <span className={cx('material-symbols-outlined text-[20px] shrink-0', m.tone, className)} role="img" aria-label={m.label} title={m.label}>
      {m.icon}
    </span>
  )
}

export function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return (
    <span className={cx('block h-1.5 rounded-full bg-stone-200 overflow-hidden', className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label="Completion">
      <span className="block h-full rounded-full bg-gradient-to-r from-emerald-600 to-lime-500 transition-[width] duration-500" style={{ width: `${value}%` }} />
    </span>
  )
}

/** Info button that opens a small popover on click/tap or keyboard; closes on Escape or outside click. */
export function InfoTip({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [open])
  return (
    <span ref={ref} className="relative inline-flex align-middle">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={id}
        aria-label={`About: ${label}`}
        className="w-7 h-7 -my-1 rounded-full text-emerald-700 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 flex items-center justify-center"
      >
        <Icon name="info" className="text-[18px]" />
      </button>
      {open && (
        <span id={id} role="note" className="absolute z-40 left-1/2 -translate-x-1/2 top-8 w-[min(20rem,80vw)] rounded-2xl bg-stone-900 text-white text-[13px] leading-5 font-medium p-3 shadow-xl">
          {children}
        </span>
      )}
    </span>
  )
}

export function Modal({ title, onClose, children, footer, wide }: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    const first = ref.current?.querySelector<HTMLElement>('input, select, textarea, button:not([data-close])')
    first?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; prev?.focus?.() }
  }, [])
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-stone-900/40 backdrop-blur-sm p-0 sm:p-4" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className={cx('bg-white w-full rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92dvh]', wide ? 'sm:max-w-3xl' : 'sm:max-w-lg')}>
        <div className="flex items-center gap-3 px-5 pt-5 pb-3 border-b border-stone-100">
          <h2 className="flex-1 text-headline-sm font-extrabold text-on-surface">{title}</h2>
          <button data-close type="button" onClick={onClose} aria-label="Close" className="w-10 h-10 rounded-full hover:bg-stone-100 flex items-center justify-center">
            <Icon name="close" />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-stone-100 flex flex-wrap justify-end gap-2 pb-[calc(1rem_+_env(safe-area-inset-bottom))]">{footer}</div>}
      </div>
    </div>
  )
}

export function Button({ kind = 'secondary', icon, children, className = '', ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { kind?: 'primary' | 'secondary' | 'danger' | 'ghost'; icon?: string }) {
  const tone = {
    primary: 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm',
    secondary: 'bg-white border-2 border-stone-200 text-on-surface hover:border-emerald-600',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    ghost: 'text-on-surface-variant hover:bg-stone-100'
  }[kind]
  return (
    <button type="button" {...rest} className={cx('min-h-[44px] px-4 rounded-2xl font-bold text-body-md inline-flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600', tone, className)}>
      {icon && <Icon name={icon} className="text-[20px]" />}
      {children}
    </button>
  )
}

export const inputClass = 'w-full min-h-[48px] bg-white border-2 rounded-2xl px-3.5 text-body-md text-on-surface outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-colors disabled:bg-stone-50 disabled:text-on-surface-variant'

/** Dropdown with a search box for long lists. Keyboard: type to filter, arrows to move, Enter to pick, Escape to close. */
export function SearchSelect({ id, value, options, onChange, placeholder = 'Select…', invalid, describedBy }: {
  id: string
  value: string | undefined
  options: Option[]
  onChange: (v: string | undefined) => void
  placeholder?: string
  invalid?: boolean
  describedBy?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const wrap = useRef<HTMLDivElement>(null)
  const listId = `${id}-list`
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? options.filter(o => o.label.toLowerCase().includes(q) || (o.group || '').toLowerCase().includes(q)) : options
  }, [options, query])
  const current = options.find(o => o.value === value)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])
  useEffect(() => { setActive(Math.max(0, filtered.findIndex(o => o.value === value))) }, [open, query])
  useEffect(() => {
    if (open) wrap.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  const pick = (o: Option) => { onChange(o.value); setOpen(false); setQuery('') }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) setOpen(true); else setActive(a => Math.min(filtered.length - 1, a + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(0, a - 1)) }
    else if (e.key === 'Enter' && open && filtered[active]) { e.preventDefault(); pick(filtered[active]) }
    else if (e.key === 'Escape' && open) { e.preventDefault(); e.stopPropagation(); setOpen(false) }
  }

  let lastGroup: string | undefined
  return (
    <div ref={wrap} className="relative">
      <div className={cx(inputClass, 'flex items-center gap-2 pr-2 cursor-text', invalid ? 'border-rose-400' : 'border-stone-200', open && 'border-emerald-600 ring-2 ring-emerald-600/20')} onClick={() => setOpen(true)}>
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && filtered[active] ? `${id}-opt-${active}` : undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className="flex-1 min-w-0 bg-transparent outline-none py-2"
          placeholder={current ? current.label : placeholder}
          value={open ? query : current?.label ?? ''}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
        />
        {value && (
          <button type="button" aria-label="Clear selection" onClick={e => { e.stopPropagation(); onChange(undefined); setQuery('') }} className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-on-surface-variant">
            <Icon name="close" className="text-[18px]" />
          </button>
        )}
        <Icon name={open ? 'expand_less' : 'expand_more'} className="text-on-surface-variant" />
      </div>
      {open && (
        <ul id={listId} role="listbox" className="absolute z-30 mt-1 w-full max-h-72 overflow-y-auto rounded-2xl bg-white border border-stone-200 shadow-xl py-1">
          {filtered.length === 0 && <li className="px-4 py-3 text-on-surface-variant text-body-md">No matches</li>}
          {filtered.map((o, i) => {
            const header = o.group && o.group !== lastGroup ? o.group : null
            lastGroup = o.group
            return (
              <React.Fragment key={o.value}>
                {header && <li role="presentation" className="px-4 pt-2 pb-1 text-label-caps font-label-caps text-emerald-700 uppercase">{header}</li>}
                <li
                  id={`${id}-opt-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={o.value === value}
                  onMouseDown={e => { e.preventDefault(); pick(o) }}
                  onMouseEnter={() => setActive(i)}
                  className={cx('px-4 py-2.5 cursor-pointer text-body-md flex items-center gap-2', i === active && 'bg-emerald-50', o.value === value && 'font-extrabold text-emerald-800')}
                >
                  <span className="flex-1">{o.label}</span>
                  {o.value === value && <Icon name="check" className="text-[18px]" />}
                </li>
              </React.Fragment>
            )
          })}
        </ul>
      )}
    </div>
  )
}
