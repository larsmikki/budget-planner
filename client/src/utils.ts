import type { Post, BudgetSettings, BudgetState, Section } from '@/types'
import { DEFAULT_SECTIONS } from '@/data/constants'

export function generateId(): string {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)
}

export function getMonthlyAmounts(post: Post): number[] {
  const amounts = new Array<number>(12).fill(0)
  const freq = post.frequency
  const start = post.startMonth || 0
  const amt = parseFloat(String(post.amount)) || 0

  if (freq === 'monthly') {
    amounts.fill(amt)
  } else if (freq === 'quarterly') {
    for (let m = start; m < 12; m += 3) amounts[m] = amt
  } else if (freq === 'biannual') {
    for (let m = start; m < 12; m += 6) amounts[m] = amt
  } else if (freq === 'yearly') {
    amounts[start] = amt
  } else if (freq === 'custom') {
    const months = post.customMonths || []
    months.forEach(m => { if (m >= 0 && m < 12) amounts[m] = amt })
  }
  return amounts
}

export function fictiveAmt(n: number): number {
  if (n === 0) return 0
  const sign = n < 0 ? -1 : 1
  const abs = Math.abs(n)
  const h = ((Math.round(abs) * 2654435761) >>> 0) % 100 / 100
  return Math.round(abs * (0.4 + h * 1.2)) * sign
}

export function fmt(n: number, settings: BudgetSettings): string {
  if (n === 0) return '\u2013'
  const display = settings.fictiveAmounts ? fictiveAmt(n) : n
  const localeSetting = settings.locale || ''
  const dec = settings.hideDecimals ? 0 : 2
  if (localeSetting) {
    const [loc, cur] = localeSetting.split(':')
    try {
      return display.toLocaleString(loc, { style: 'currency', currency: cur, minimumFractionDigits: dec, maximumFractionDigits: dec })
    } catch {
      // fall through
    }
  }
  return display.toLocaleString('de-DE', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

export function getSortedSections(sections: Section[]): Section[] {
  const income = sections.filter(s => s.type === 'income')
  const expense = sections.filter(s => s.type !== 'income')
  return [...income, ...expense]
}

export function migrateState(raw: Partial<BudgetState>): BudgetState {
  const base: BudgetState = {
    year: new Date().getFullYear(),
    sections: [],
    posts: [],
    collapsed: {},
    settings: {},
    ...raw,
  }

  if (base.sections && base.sections.length > 0) return base

  // Check for old-format posts with 'category' field
  type OldPost = Post & { category?: string }
  const oldPosts = base.posts as OldPost[]
  const hasOldPosts = oldPosts.some(p => p.category && !p.sectionId)

  if (hasOldPosts) {
    const cats = [...new Set(oldPosts.map(p => p.category).filter(Boolean))] as string[]
    base.sections = []
    const catToSectionId: Record<string, string> = {}
    cats.forEach(cat => {
      const id = 'sec_' + cat
      const type = cat === 'income' ? 'income' : 'expense'
      const name = cat.charAt(0).toUpperCase() + cat.slice(1)
      base.sections.push({ id, name, type })
      catToSectionId[cat] = id
    })
    if (!catToSectionId['income']) {
      base.sections.unshift({ id: 'sec_income', name: 'Income', type: 'income' })
      catToSectionId['income'] = 'sec_income'
    }
    oldPosts.forEach(p => {
      if (p.category) {
        p.sectionId = catToSectionId[p.category] || catToSectionId['income'] || 'sec_income'
      }
    })
  } else {
    base.sections = JSON.parse(JSON.stringify(DEFAULT_SECTIONS)) as Section[]
  }

  return base
}
