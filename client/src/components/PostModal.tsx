import { useState, useEffect } from 'react'
import type { Section, Post } from '@/types'
import { useTheme } from '@/contexts/ThemeContext'
import { useBudget } from '@/contexts/BudgetContext'
import { generateId, getSortedSections } from '@/utils'
import { ICONS, MONTH_FULL } from '@/data/constants'

interface PostModalProps {
  open: boolean
  postId: string | null
  defaultSectionId: string
  onClose: () => void
}

export default function PostModal({ open, postId, defaultSectionId, onClose }: PostModalProps) {
  const { theme } = useTheme()
  const { state, updateState } = useBudget()

  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState<Post['frequency']>('monthly')
  const [startMonth, setStartMonth] = useState(0)
  const [customMonths, setCustomMonths] = useState<number[]>([])
  const [sectionId, setSectionId] = useState(defaultSectionId)
  const [icon, setIcon] = useState('')
  const [iconSearch, setIconSearch] = useState('')

  const isEdit = postId !== null

  useEffect(() => {
    if (!open) return
    if (isEdit) {
      const post = state.posts.find(p => p.id === postId)
      if (!post) return
      setName(post.name)
      setAmount(String(post.amount))
      setFrequency(post.frequency)
      setStartMonth(post.startMonth || 0)
      setCustomMonths(post.customMonths || [])
      setSectionId(post.sectionId)
      setIcon(post.icon || '')
    } else {
      setName('')
      setAmount('')
      setFrequency('monthly')
      setStartMonth(0)
      setCustomMonths([])
      setSectionId(defaultSectionId)
      setIcon('')
    }
    setIconSearch('')
  }, [open, postId, isEdit, defaultSectionId, state.posts])

  const handleSave = () => {
    if (!name.trim()) return
    const post: Post = {
      id: isEdit ? postId! : generateId(),
      name: name.trim(),
      amount: parseFloat(amount) || 0,
      frequency,
      startMonth,
      sectionId,
      customMonths: frequency === 'custom' ? customMonths : [],
      icon,
    }
    if (isEdit) {
      updateState({ posts: state.posts.map(p => p.id === postId ? post : p) })
    } else {
      updateState({ posts: [...state.posts, post] })
    }
    onClose()
  }

  const handleDelete = () => {
    if (!isEdit) return
    if (confirm('Delete this budget post?')) {
      updateState({ posts: state.posts.filter(p => p.id !== postId) })
      onClose()
    }
  }

  const toggleCustomMonth = (m: number) => {
    setCustomMonths(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    )
  }

  const showStartMonth = frequency !== 'monthly' && frequency !== 'custom'
  const showCustomMonths = frequency === 'custom'

  const filteredIcons = (() => {
    const f = iconSearch.toLowerCase()
    const list = f ? ICONS.filter(ic => ic.name.includes(f)) : ICONS
    const seen = new Set<string>()
    return list.filter(ic => { if (seen.has(ic.ch)) return false; seen.add(ic.ch); return true })
  })()

  const sortedSections: Section[] = getSortedSections(state.sections)

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
    width: 460,
    maxWidth: '95vw',
    boxShadow: 'var(--shadow)',
    maxHeight: '90vh',
    overflowY: 'auto',
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

  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={modalStyle}>
        <h3 style={{ marginBottom: 20, fontSize: '1.1rem', color: theme.text }}>
          {isEdit ? 'Edit Budget Post' : 'Add Budget Post'}
        </h3>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Name</label>
          <input
            style={inputStyle}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Rent, Netflix, Salary..."
            autoFocus={!isEdit}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Amount</label>
            <input
              style={inputStyle}
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Frequency</label>
            <select
              style={inputStyle}
              value={frequency}
              onChange={e => setFrequency(e.target.value as Post['frequency'])}
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="biannual">Every 6 months</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom months</option>
            </select>
          </div>
        </div>

        {showStartMonth && (
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Start / Payment Month</label>
            <select
              style={inputStyle}
              value={startMonth}
              onChange={e => setStartMonth(parseInt(e.target.value))}
            >
              {MONTH_FULL.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
        )}

        {showCustomMonths && (
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Select Months</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {MONTH_FULL.map((m, i) => (
                <label
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 8px',
                    background: theme.surface2,
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    color: theme.text,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={customMonths.includes(i)}
                    onChange={() => toggleCustomMonth(i)}
                  />
                  {m.substring(0, 3)}
                </label>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Section</label>
          <select
            style={inputStyle}
            value={sectionId}
            onChange={e => setSectionId(e.target.value)}
          >
            {sortedSections.map(sec => (
              <option key={sec.id} value={sec.id}>{sec.name} ({sec.type})</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Icon (optional)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: '1.3rem', width: 32, textAlign: 'center' }}>{icon}</span>
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
              onClick={() => setIcon('')}
            >
              Clear
            </button>
          </div>
          <input
            type="text"
            value={iconSearch}
            onChange={e => setIconSearch(e.target.value)}
            placeholder="Search icons..."
            style={{
              ...inputStyle,
              marginBottom: 8,
              fontSize: '0.85rem',
            }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, maxHeight: 160, overflowY: 'auto' }}>
            {filteredIcons.map((ic, idx) => (
              <button
                key={idx}
                type="button"
                title={ic.name}
                style={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: icon === ic.ch ? `${theme.accent}22` : theme.surface2,
                  border: `1px solid ${icon === ic.ch ? theme.accent : theme.border}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  padding: 0,
                  fontFamily: 'inherit',
                }}
                onClick={() => setIcon(ic.ch)}
              >
                {ic.ch}
              </button>
            ))}
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
