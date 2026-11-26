import { SECTION_BY_ID, pathwayLabel, sectionsFor } from '../../config/cfp/schema'
import { Farmer } from '../../types'
import { flattenAnswers } from './engine'
import { STATUS_LABEL } from './lifecycle'
import { Assessment } from './types'
import { csvCell } from '../csv'

// Admin exports of assessment inputs. Never includes calculated values (there are none yet).

export function assessmentJson(a: Assessment, farmer?: Farmer) {
  const { farm = {}, ...inputData } = a.inputs
  return {
    exportedAt: new Date().toISOString(),
    assessment: {
      id: a.id,
      displayId: a.displayId,
      name: a.name,
      pathway: a.pathway,
      schemaVersion: a.schemaVersion,
      status: STATUS_LABEL[a.status],
      calculationStatus: a.calculationStatus,
      revision: a.revision,
      progress: a.progress,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      submittedAt: a.submittedAt ?? null,
      duplicatedFrom: a.duplicatedFrom ?? null,
      deletedAt: a.deletedAt ?? null
    },
    farmer: { id: a.farmerId, name: farmer?.name ?? null, giplId: farmer?.gipl_id ?? null, village: farmer?.village ?? null, plotIds: a.plotIds },
    farm,
    inputData,
    // Application-specific, not part of the CFP inputData.
    sectionNotes: a.notes,
    sectionStatus: a.sectionStatus,
    prefilledFrom: a.prefill
  }
}

export const toCsv = (rows: unknown[][]) => rows.map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n'

/** One row per answer (repeated records numbered), then one row per section note. */
export function assessmentCsvRows(list: { a: Assessment; farmer?: Farmer }[]): unknown[][] {
  const header = ['assessment_id', 'display_id', 'assessment_name', 'farmer_id', 'farmer_name', 'pathway', 'status', 'schema_version', 'assessment_year', 'section', 'entry', 'question', 'field_path', 'value', 'unit']
  const rows: unknown[][] = [header]
  for (const { a, farmer } of list) {
    const meta = [a.id, a.displayId, a.name, a.farmerId, farmer?.name ?? '', pathwayLabel(a.pathway), STATUS_LABEL[a.status], a.schemaVersion, a.inputs.cropDetails?.assessmentYear ?? '']
    for (const r of flattenAnswers(a.inputs, a.pathway)) rows.push([...meta, r.section, r.entry, r.label, r.path, r.value, r.unit])
    for (const s of sectionsFor(a.pathway)) {
      const note = a.notes[s.id]
      if (note && note.trim()) rows.push([...meta, SECTION_BY_ID[s.id].title, '', 'User Notes', `notes.${s.id}`, note, ''])
    }
  }
  return rows
}

export function download(filename: string, content: string, type: string) {
  const blob = new Blob([type.startsWith('text/csv') ? '﻿' + content : content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const fileSlug = (a: Assessment) => `${a.displayId}_${a.name.replace(/[^\w-]+/g, '_').slice(0, 40)}`
