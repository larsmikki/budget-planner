import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useBudget } from '@/contexts/BudgetContext'
import { generateId } from '@/utils'
import { PRESET_COLORS } from '@/data/constants'

interface SectionModalProps {
  open: boolean
  sectionId: string | null
  onClose: () => void
}

export default function SectionModal({ open, sectionId, onClose }: SectionModalProps) {
  const { theme } = useTheme()
  const { state, updateState } = useBudget()

  const [name, setName] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [color, setColor] = useState('')

  const isEdit = sectionId !== null

  useEffect(() => {
    if (!open) return
    if (isEdit) {
      const sec = state.sections.find(s => s.id === sectionId)
      if (!sec) return
      setName(sec.name)
      setType(sec.type)
      setColor(sec.color || '')
    } else {
      setName('')
      setType('expense')
      setColor('')
    }
  }, [open, sectionId, isEdit, state.sections])

  const handleSave = () => {
    if (!name.trim()) return
    if (isEdit) {
      updateState({
        sections: state.sections.map(s =>
          s.id === sectionId
            ? { ...s, name: name.trim(), type, color: color || undefined }
            : s
        ),
      })
    } else {
      const newSec = {
        id: generateId(),
        name: name.trim(),
        type,
        ...(color ? { color } : {}),
      }
      updateState({ sections: [...state.sections, newSec] })
    }
    onClose()
  }

  const handleDelete = () => {
    if (!isEdit) return
    const postsInSection = state.posts.filter(p => p.sectionId === sectionId)
    const msg = postsInSection.length > 0
      ? `Delete this section and its ${postsInSection.length} post(s)?`
      : 'Delete this section?'
    if (confirm(msg)) {
      const newCollapsed = { ...state.collapsed }
      delete newCollapsed[sectionId!]
      updateState({
        sections: state.sections.filter(s => s.id !== sectionId),
        posts: state.posts.filter(p => p.sectionId !== sectionId),
        collapsed: newCollapsed,
      })
      onClose()
    }
  }

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
    width: 400,
    maxWidth: '95vw',
    boxShadow: 'var(--shadow)',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: theme.surface2,
    border: `1px solid ${theme.border}`,
    borderRadius: 8,
    color: theme.text,
    fontSize: '0.9rem',
    fontFamily: 'inherit',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8rem',
    color: theme.text2,
    marginBottom: 6,
  }

  const typeOptionStyle = (t: 'income' | 'expense'): React.CSSProperties => ({
    flex: 1,
    padding: '10px 16px',
    background: type === t
      ? t === 'income' ? `${theme.green}14` : `${theme.red}0f`
      : theme.surface2,
    border: `2px solid ${type === t ? (t === 'income' ? theme.green : theme.red) : theme.border}`,
    borderRadius: 8,
    color: theme.text,
    cursor: 'pointer',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    fontFamily: 'inherit',
  })

  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={modalStyle}>
        <h3 style={{ marginBottom: 20, fontSize: '1.1rem', color: theme.text }}>
          {isEdit ? 'Edit Section' : 'Add Section'}
        </h3>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Section Name</label>
          <input
            style={inputStyle}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Household, Subscriptions..."
            autoFocus
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Type</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" style={typeOptionStyle('income')} onClick={() => setType('income')}>
              Income
            </button>
            <button type="button" style={typeOptionStyle('expense')} onClick={() => setType('expense')}>
              Expense
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Background Color (optional)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {PRESET_COLORS.map(p => (
              <div
                key={p.color}
                title={p.name}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: p.color,
                  border: `2px solid ${color === p.color ? theme.text : theme.border}`,
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  boxShadow: color === p.color ? `0 0 0 2px ${theme.accent}` : 'none',
                }}
                onClick={() => setColor(p.color)}
              />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="color"
              value={color || '#ffffff'}
              style={{ width: 40, height: 32, padding: 2, border: `1px solid ${theme.border}`, borderRadius: 8, cursor: 'pointer' }}
              onChange={e => setColor(e.target.value)}
              title="Custom color"
            />
            <span style={{ fontSize: '0.85rem', color: theme.text2, fontFamily: 'monospace' }}>{color}</span>
            <button
              type="button"
              style={{
                padding: '4px 10px',
                background: theme.surface2,
                border: `1px solid ${theme.border}`,
                borderRadius: 8,
                color: theme.text,
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontFamily: 'inherit',
              }}
              onClick={() => setColor('')}
            >
              Clear
            </button>
          </div>
        </div>

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
          {isEdit && (
            <button
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: `1px solid ${theme.red}`,
                borderRadius: 8,
                color: theme.red,
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
              }}
              onClick={handleDelete}
            >
              Delete
            </button>
          )}
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
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
