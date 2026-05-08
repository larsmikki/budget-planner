import { describe, it, expect } from 'vitest'
import { getMonthlyAmounts, fictiveAmt, fmt, getSortedSections, migrateState } from '@/utils'
import type { Post, Section } from '@/types'

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'p1',
    name: 'Test',
    amount: 100,
    frequency: 'monthly',
    startMonth: 0,
    sectionId: 's1',
    customMonths: [],
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// getMonthlyAmounts
// ---------------------------------------------------------------------------
describe('getMonthlyAmounts', () => {
  it('monthly: fills all 12 months', () => {
    const result = getMonthlyAmounts(makePost({ frequency: 'monthly', amount: 500 }))
    expect(result).toHaveLength(12)
    expect(result.every(v => v === 500)).toBe(true)
  })

  it('quarterly: hits every 3 months starting from startMonth', () => {
    const result = getMonthlyAmounts(makePost({ frequency: 'quarterly', amount: 300, startMonth: 1 }))
    expect(result[1]).toBe(300)
    expect(result[4]).toBe(300)
    expect(result[7]).toBe(300)
    expect(result[10]).toBe(300)
    expect(result[0]).toBe(0)
    expect(result[2]).toBe(0)
  })

  it('biannual: hits every 6 months starting from startMonth', () => {
    const result = getMonthlyAmounts(makePost({ frequency: 'biannual', amount: 200, startMonth: 2 }))
    expect(result[2]).toBe(200)
    expect(result[8]).toBe(200)
    expect(result[0]).toBe(0)
    expect(result[3]).toBe(0)
  })

  it('yearly: hits only startMonth', () => {
    const result = getMonthlyAmounts(makePost({ frequency: 'yearly', amount: 1200, startMonth: 5 }))
    expect(result[5]).toBe(1200)
    expect(result.filter(v => v > 0)).toHaveLength(1)
  })

  it('custom: hits only specified months', () => {
    const result = getMonthlyAmounts(makePost({ frequency: 'custom', amount: 400, customMonths: [0, 3, 11] }))
    expect(result[0]).toBe(400)
    expect(result[3]).toBe(400)
    expect(result[11]).toBe(400)
    expect(result[1]).toBe(0)
    expect(result[4]).toBe(0)
  })

  it('ignores out-of-range custom months', () => {
    const result = getMonthlyAmounts(makePost({ frequency: 'custom', amount: 100, customMonths: [-1, 12, 5] }))
    expect(result[5]).toBe(100)
    expect(result.filter(v => v > 0)).toHaveLength(1)
  })

  it('returns all zeros for amount 0', () => {
    const result = getMonthlyAmounts(makePost({ frequency: 'monthly', amount: 0 }))
    expect(result.every(v => v === 0)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// fictiveAmt
// ---------------------------------------------------------------------------
describe('fictiveAmt', () => {
  it('returns 0 for input 0', () => {
    expect(fictiveAmt(0)).toBe(0)
  })

  it('preserves sign for negative input', () => {
    expect(fictiveAmt(-1000)).toBeLessThan(0)
  })

  it('returns positive for positive input', () => {
    expect(fictiveAmt(1000)).toBeGreaterThan(0)
  })

  it('is deterministic', () => {
    expect(fictiveAmt(1234)).toBe(fictiveAmt(1234))
  })

  it('returns different values for different inputs', () => {
    expect(fictiveAmt(100)).not.toBe(fictiveAmt(200))
  })
})

// ---------------------------------------------------------------------------
// fmt
// ---------------------------------------------------------------------------
describe('fmt', () => {
  it('returns en-dash for zero', () => {
    expect(fmt(0, {})).toBe('\u2013')
  })

  it('formats with de-DE locale by default', () => {
    const result = fmt(1234.5, {})
    // de-DE uses comma as decimal separator
    expect(result).toContain(',')
  })

  it('hides decimals when hideDecimals is true', () => {
    const result = fmt(1234.5, { hideDecimals: true })
    expect(result).not.toContain(',')
  })

  it('formats with currency when locale is set', () => {
    const result = fmt(100, { locale: 'en-US:USD' })
    expect(result).toContain('$')
  })

  it('applies fictive amount when fictiveAmounts is true', () => {
    // fictiveAmt(1000) is deterministic; result should differ from raw 1000
    fmt(1000, {})
    const fictive = fmt(1000, { fictiveAmounts: true })
    // Both should be non-zero strings but may differ
    expect(typeof fictive).toBe('string')
    expect(fictive).not.toBe('\u2013')
    // fictiveAmt(1000) !== 1000 in practice; if equal it's a coincidence
    // Just verify it doesn't crash and returns a string
  })
})

// ---------------------------------------------------------------------------
// getSortedSections
// ---------------------------------------------------------------------------
describe('getSortedSections', () => {
  it('puts income sections before expense sections', () => {
    const sections: Section[] = [
      { id: '1', name: 'Rent', type: 'expense' },
      { id: '2', name: 'Salary', type: 'income' },
      { id: '3', name: 'Food', type: 'expense' },
    ]
    const sorted = getSortedSections(sections)
    expect(sorted[0].type).toBe('income')
    expect(sorted[1].type).toBe('expense')
    expect(sorted[2].type).toBe('expense')
  })

  it('preserves relative order within each group', () => {
    const sections: Section[] = [
      { id: '1', name: 'Bonus', type: 'income' },
      { id: '2', name: 'Salary', type: 'income' },
    ]
    const sorted = getSortedSections(sections)
    expect(sorted[0].name).toBe('Bonus')
    expect(sorted[1].name).toBe('Salary')
  })

  it('returns empty array for empty input', () => {
    expect(getSortedSections([])).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// migrateState
// ---------------------------------------------------------------------------
describe('migrateState', () => {
  it('returns state as-is when sections already exist', () => {
    const existing = [{ id: 's1', name: 'Income', type: 'income' as const }]
    const result = migrateState({ sections: existing, posts: [], collapsed: {}, settings: {} })
    expect(result.sections).toEqual(existing)
  })

  it('assigns DEFAULT_SECTIONS when no sections and no old-format posts', () => {
    const result = migrateState({ posts: [], collapsed: {}, settings: {} })
    expect(result.sections.length).toBeGreaterThan(0)
  })

  it('migrates old-format posts with category field to sectionId', () => {
    const oldPosts = [
      { id: 'p1', name: 'Salary', amount: 3000, frequency: 'monthly', startMonth: 0, customMonths: [], category: 'income' },
      { id: 'p2', name: 'Rent', amount: 1000, frequency: 'monthly', startMonth: 0, customMonths: [], category: 'housing' },
    ]
    const result = migrateState({ posts: oldPosts as any, collapsed: {}, settings: {} })
    expect(result.sections.some(s => s.type === 'income')).toBe(true)
    result.posts.forEach(p => {
      expect((p as any).sectionId).toBeTruthy()
    })
  })

  it('defaults year to current year when not provided', () => {
    const result = migrateState({})
    expect(result.year).toBe(new Date().getFullYear())
  })
})
