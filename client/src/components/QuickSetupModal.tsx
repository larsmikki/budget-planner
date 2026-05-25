import { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useBudget } from '@/contexts/BudgetContext'
import { generateId } from '@/utils'
import { QUICK_TEMPLATES } from '@/data/constants'
import type { Post } from '@/types'
import { Button, Modal } from '@/components/ui'

interface QuickSetupModalProps {
  open: boolean
  onClose: () => void
}

export default function QuickSetupModal({ open, onClose }: QuickSetupModalProps) {
  const { theme } = useTheme()
  const { state, updateState } = useBudget()
  const [checked, setChecked] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!open) return
    const initial = new Set<string>()
    QUICK_TEMPLATES.income.forEach((_, i) => initial.add(`income:${i}`))
    QUICK_TEMPLATES.expense.forEach((_, i) => initial.add(`expense:${i}`))
    setChecked(initial)
  }, [open])

  const toggle = (key: string) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleApply = () => {
    const newPosts: Post[] = []
    const incomeSec = state.sections.find(s => s.type === 'income')
    const expenseSections = state.sections.filter(s => s.type === 'expense')

    QUICK_TEMPLATES.income.forEach((tpl, i) => {
      if (!checked.has(`income:${i}`) || !incomeSec) return
      newPosts.push({ id: generateId(), name: tpl.name, amount: tpl.amount, frequency: tpl.frequency, startMonth: tpl.startMonth || 0, sectionId: incomeSec.id, customMonths: [] })
    })

    const groups = [...new Set(QUICK_TEMPLATES.expense.map(t => t.group).filter(Boolean))] as string[]
    groups.forEach(group => {
      const targetSec = expenseSections.find(s => s.name.toLowerCase() === group.toLowerCase()) || expenseSections[0]
      if (!targetSec) return
      QUICK_TEMPLATES.expense.forEach((tpl, i) => {
        if (tpl.group !== group || !checked.has(`expense:${i}`)) return
        newPosts.push({ id: generateId(), name: tpl.name, amount: tpl.amount, frequency: tpl.frequency, startMonth: tpl.startMonth || 0, sectionId: targetSec.id, customMonths: [] })
      })
    })

    updateState({ posts: [...state.posts, ...newPosts] })
    onClose()
  }

  const incomeSec = state.sections.find(s => s.type === 'income')
  const expenseSections = state.sections.filter(s => s.type === 'expense')
  const groups = [...new Set(QUICK_TEMPLATES.expense.map(t => t.group).filter(Boolean))] as string[]

  const chipStyle = (key: string): React.CSSProperties => ({
    background: checked.has(key) ? `${theme.accent}18` : theme.surface2,
    border: `1px solid ${checked.has(key) ? theme.accent : theme.border}`,
    color: checked.has(key) ? theme.accent : theme.text,
  })

  return (
    <Modal open={open} title="Quick setup" onClose={onClose} maxWidth="560px">
      <div>
        <p className="mb-5 text-sm text-text2">Select common budget posts. You can edit amounts afterwards.</p>

        {incomeSec && (
          <div className="mb-5">
            <label className="mb-2 block text-xs uppercase tracking-wider font-semibold text-text2">Income</label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TEMPLATES.income.map((tpl, i) => {
                const key = `income:${i}`
                return (
                  <button key={key} type="button" className="rounded-lg px-3 py-1.5 text-sm font-medium hover:opacity-80" style={chipStyle(key)} onClick={() => toggle(key)}>
                    {tpl.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {expenseSections.length > 0 && groups.map(group => (
          <div key={group} className="mb-5">
            <label className="mb-2 block text-xs uppercase tracking-wider font-semibold text-text2">{group}</label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TEMPLATES.expense
                .map((tpl, i) => ({ tpl, i }))
                .filter(({ tpl }) => tpl.group === group)
                .map(({ tpl, i }) => {
                  const key = `expense:${i}`
                  return (
                    <button key={key} type="button" className="rounded-lg px-3 py-1.5 text-sm font-medium hover:opacity-80" style={chipStyle(key)} onClick={() => toggle(key)}>
                      {tpl.name}
                    </button>
                  )
                })}
            </div>
          </div>
        ))}

        <div className="mt-6 flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleApply}>Add selected</Button>
        </div>
      </div>
    </Modal>
  )
}
