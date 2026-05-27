import { createContext, useContext } from 'react'
import type { BudgetState } from '@/types'
import { fetchState } from '@/api'
import { migrateState } from '@/utils'

export interface BudgetContextType {
  state: BudgetState
  setState: (state: BudgetState) => void
  updateState: (partial: Partial<BudgetState>) => void
  saveToServer: () => void
  isLoading: boolean
}

export const defaultState: BudgetState = {
  year: new Date().getFullYear(),
  sections: [],
  posts: [],
  collapsed: {},
  settings: {},
}

export const BudgetContext = createContext<BudgetContextType>({
  state: defaultState,
  setState: () => {},
  updateState: () => {},
  saveToServer: () => {},
  isLoading: true,
})

export const budgetQueryKey = ['budget-state'] as const

export async function loadBudgetState(): Promise<BudgetState> {
  try {
    const data = await fetchState()
    if (data && Object.keys(data).length > 0) {
      return migrateState(data as Partial<BudgetState>)
    }
  } catch {
    // fall through to localStorage
  }

  try {
    const saved = localStorage.getItem('budgetAssistant')
    if (saved) {
      return migrateState(JSON.parse(saved) as Partial<BudgetState>)
    }
  } catch {
    // fall through
  }

  return migrateState({})
}

export const useBudget = () => useContext(BudgetContext)
