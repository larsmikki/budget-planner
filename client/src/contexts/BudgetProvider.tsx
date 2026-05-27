import { useCallback, useRef, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { BudgetState } from '@/types'
import { saveState as apiSaveState } from '@/api'
import {
  BudgetContext,
  budgetQueryKey,
  defaultState,
  loadBudgetState,
} from '@/contexts/BudgetContext'

export function BudgetProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { data: state = defaultState, isLoading } = useQuery({
    queryKey: budgetQueryKey,
    queryFn: loadBudgetState,
  })
  const saveMutation = useMutation({
    mutationFn: apiSaveState,
  })

  const saveToServer = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      void saveMutation.mutateAsync(state)
    }, 300)
  }, [saveMutation, state])

  const setState = useCallback((newState: BudgetState) => {
    queryClient.setQueryData(budgetQueryKey, newState)
    localStorage.setItem('budgetAssistant', JSON.stringify(newState))
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      void saveMutation.mutateAsync(newState)
    }, 300)
  }, [queryClient, saveMutation])

  const updateState = useCallback((partial: Partial<BudgetState>) => {
    queryClient.setQueryData<BudgetState>(budgetQueryKey, prevState => {
      const prev = prevState ?? defaultState
      const next = { ...prev, ...partial }
      localStorage.setItem('budgetAssistant', JSON.stringify(next))
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        void saveMutation.mutateAsync(next)
      }, 300)
      return next
    })
  }, [queryClient, saveMutation])

  return (
    <BudgetContext.Provider value={{ state, setState, updateState, saveToServer, isLoading }}>
      {children}
    </BudgetContext.Provider>
  )
}
