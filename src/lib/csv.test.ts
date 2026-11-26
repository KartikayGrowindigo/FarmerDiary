import { describe, expect, it } from 'vitest'
import { csvCell } from './csv'

describe('csvCell', () => {
  it('stops typed text from running as a spreadsheet formula', () => {
    expect(csvCell('=HYPERLINK("http://x","click")')).toBe(`"'=HYPERLINK(""http://x"",""click"")"`)
    expect(csvCell('+cmd|')).toBe("'+cmd|")
    expect(csvCell('-2+3')).toBe("'-2+3")
    expect(csvCell('@SUM(A1)')).toBe("'@SUM(A1)")
    expect(csvCell('\t=1')).toBe("'\t=1")
  })

  it('leaves numbers, dates and ordinary text unchanged', () => {
    expect(csvCell(-5)).toBe('-5')
    expect(csvCell('-5')).toBe('-5')
    expect(csvCell('+2.5')).toBe('+2.5')
    expect(csvCell('-1.5e3')).toBe('-1.5e3')
    expect(csvCell('2025-04-01')).toBe('2025-04-01')
    expect(csvCell('Sherpur Kalan')).toBe('Sherpur Kalan')
    expect(csvCell(null)).toBe('')
    expect(csvCell(undefined)).toBe('')
  })

  it('quotes commas, quotes and line breaks', () => {
    expect(csvCell('a,b')).toBe('"a,b"')
    expect(csvCell('say "hi"')).toBe('"say ""hi"""')
    expect(csvCell('line\r\nbreak')).toBe('"line\r\nbreak"')
  })
})
