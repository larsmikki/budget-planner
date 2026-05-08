import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import type { BudgetState } from '@/types'
import { fetchState, saveState as apiSaveState } from '@/api'
import { migrateState } from '@/utils'

interface BudgetContextType {
  state: BudgetState
  setState: (state: BudgetState) => void
  updateState: (partial: Partial<BudgetState>) => void
  saveToServer: () => void
  isLoading: boolean
}

const defaultState: BudgetState = {
  year: new Date().getFullYear(),
  sections: [],
  posts: [],
  collapsed: {},
  settings: {},
}

const BudgetContext = createContext<BudgetContextType>({
  state: defaultState,
  setState: () => {},
  updateState: () => {},
  saveToServer: () => {},
  isLoading: true,
})

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [state, setStateInternal] = useState<BudgetState>(defaultState)
  const [isLoading, setIsLoading] = useState(true)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchState()
        if (data && Object.keys(data).length > 0) {
          setStateInternal(migrateState(data as Partial<BudgetState>))
          setIsLoading(false)
          return
        }
      } catch {
        // fall through to localStorage
      }

      try {
        const saved = localStorage.getItem('budgetAssistant')
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<BudgetState>
          setStateInternal(migrateState(parsed))
          setIsLoading(false)
          return
        }
      } catch {
        // fall through
      }

      setStateInternal(migrateState({}))
      setIsLoading(false)
    }

    void load()
  }, [])

  const saveToServer = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      void apiSaveState(state)
    }, 300)
  }, [state])

  const setState = useCallback((newState: BudgetState) => {
    setStateInternal(newState)
    localStorage.setItem('budgetAssistant', JSON.stringify(newState))
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      void apiSaveState(newState)
    }, 300)
  }, [])

  const updateState = useCallback((partial: Partial<BudgetState>) => {
    setStateInternal(prev => {
      const next = { ...prev, ...partial }
      localStorage.setItem('budgetAssistant', JSON.stringify(next))
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        void apiSaveState(next)
      }, 300)
      return next
    })
  }, [])

  return (
    <BudgetContext.Provider value={{ state, setState, updateState, saveToServer, isLoading }}>
      {children}
    </BudgetContext.Provider>
  )
}

export const useBudget = () => useContext(BudgetContext)
