import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useBudget } from '@/contexts/BudgetContext'
import { generateId } from '@/utils'
import { QUICK_TEMPLATES } from '@/data/constants'
import type { Post } from '@/types'

interface QuickSetupModalProps {
  open: boolean
  onClose: () => void
}

export default function QuickSetupModal({ open, onClose }: QuickSetupModalProps) {
  const { theme } = useTheme()
  const { state, updateState } = useBudget()

  // Track checked state: key = `type:idx`
  const [checked, setChecked] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (open) {
      // Default all checked
      const initial = new Set<string>()
      QUICK_TEMPLATES.income.forEach((_, i) => initial.add(`income:${i}`))
      QUICK_TEMPLATES.expense.forEach((_, i) => initial.add(`expense:${i}`))
      setChecked(initial)
    }
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
      newPosts.push({
        id: generateId(),
        name: tpl.name,
        amount: tpl.amount,
        frequency: tpl.frequency,
        startMonth: tpl.startMonth || 0,
        sectionId: incomeSec.id,
        customMonths: [],
      })
    })

    const groups = [...new Set(QUICK_TEMPLATES.expense.map(t => t.group).filter(Boolean))] as string[]
    groups.forEach(group => {
      let targetSec = expenseSections.find(s => s.name.toLowerCase() === group.toLowerCase())
      if (!targetSec) targetSec = expenseSections[0]
      if (!targetSec) return

      QUICK_TEMPLATES.expense.forEach((tpl, i) => {
        if (tpl.group !== group || !checked.has(`expense:${i}`)) return
        newPosts.push({
          id: generateId(),
          name: tpl.name,
          amount: tpl.amount,
          frequency: tpl.frequency,
          startMonth: tpl.startMonth || 0,
          sectionId: targetSec!.id,
          customMonths: [],
        })
      })
    })

    updateState({ posts: [...state.posts, ...newPosts] })
    onClose()
  }

  const incomeSec = state.sections.find(s => s.type === 'income')
  const expenseSections = state.sections.filter(s => s.type === 'expense')
  const groups = [...new Set(QUICK_TEMPLATES.expense.map(t => t.group).filter(Boolean))] as string[]

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'var(--overlay)',
    zIndex: 200,
    display: open ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const modalStyle: React.CSSProperties = {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: 12,
    padding: 28,
    width: 520,
    maxWidth: '95vw',
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: 'var(--shadow)',
  }

  const chipStyle = (key: string): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    background: checked.has(key) ? `${theme.accent}18` : theme.surface2,
    border: `1px solid ${checked.has(key) ? theme.accent : theme.border}`,
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: '0.85rem',
    color: theme.text,
    fontFamily: 'inherit',
  })

  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={modalStyle}>
        <h3 style={{ marginBottom: 8, fontSize: '1.1rem', color: theme.text }}>Quick Setup</h3>
        <p style={{ color: theme.text2, marginBottom: 16, fontSize: '0.9rem' }}>
          Select common budget posts to get started quickly. You can edit amounts afterwards.
        </p>

        {incomeSec && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.8rem', color: theme.text2, display: 'block', marginBottom: 8 }}>Income</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {QUICK_TEMPLATES.income.map((tpl, i) => {
                const key = `income:${i}`
                return (
                  <button key={i} type="button" style={chipStyle(key)} onClick={() => toggle(key)}>
                    <input type="checkbox" readOnly checked={checked.has(key)} style={{ pointerEvents: 'none' }} />
                    {tpl.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {expenseSections.length > 0 && groups.map(group => (
          <div key={group} style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.8rem', color: theme.text2, display: 'block', marginBottom: 8 }}>{group}</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {QUICK_TEMPLATES.expense
                .map((tpl, i) => ({ tpl, i }))
                .filter(({ tpl }) => tpl.group === group)
                .map(({ tpl, i }) => {
                  const key = `expense:${i}`
                  return (
                    <button key={i} type="button" style={chipStyle(key)} onClick={() => toggle(key)}>
                      <input type="checkbox" readOnly checked={checked.has(key)} style={{ pointerEvents: 'none' }} />
                      {tpl.name}
                    </button>
                  )
                })}
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
          <button
            style={{
              padding: '8px 16px',
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              color: theme.text,
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontFamily: 'inherit',
            }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            style={{
              padding: '8px 16px',
              background: theme.gradient,
              border: 'none',
              borderRadius: 8,
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontFamily: 'inherit',
              fontWeight: 500,
            }}
            onClick={handleApply}
          >
            Add Selected
          </button>
        </div>
      </div>
    </div>
  )
}
