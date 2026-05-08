export interface Section {
  id: string
  name: string
  type: 'income' | 'expense'
  color?: string
}

export interface Post {
  id: string
  name: string
  amount: number
  frequency: 'monthly' | 'quarterly' | 'biannual' | 'yearly' | 'custom'
  startMonth: number
  sectionId: string
  customMonths: number[]
  icon?: string
}

export interface BudgetSettings {
  themeName?: string
  locale?: string
  hideDecimals?: boolean
  fictiveAmounts?: boolean
}

export interface BudgetState {
  year: number
  sections: Section[]
  posts: Post[]
  collapsed: Record<string, boolean>
  settings: BudgetSettings
}
