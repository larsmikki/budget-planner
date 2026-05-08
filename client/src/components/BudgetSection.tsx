import { useRef, useState } from 'react'
import type { Section, Post } from '@/types'
import { useTheme } from '@/contexts/ThemeContext'
import { useBudget } from '@/contexts/BudgetContext'
import { getMonthlyAmounts, fmt } from '@/utils'
import { MONTHS } from '@/data/constants'

interface BudgetSectionProps {
  section: Section
  posts: Post[]
  onAddPost: (sectionId: string) => void
  onEditPost: (postId: string) => void
  onEditSection: (sectionId: string) => void
}

const FREQ_LABEL: Record<Post['frequency'], string> = {
  monthly: 'M',
  quarterly: 'Q',
  biannual: 'H',
  yearly: 'Y',
  custom: 'C',
}

export default function BudgetSection({
  section,
  posts,
  onAddPost,
  onEditPost,
  onEditSection,
}: BudgetSectionProps) {
  const { theme } = useTheme()
  const { state, updateState } = useBudget()
  const isCollapsed = !!state.collapsed[section.id]
  const dragPostIdRef = useRef<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [editingCell, setEditingCell] = useState<{ postId: string; monthIdx: number } | null>(null)
  const [editValue, setEditValue] = useState('')

  const toggleCollapse = () => {
    updateState({ collapsed: { ...state.collapsed, [section.id]: !isCollapsed } })
  }

  // Compute section total
  const sectionTotal = posts.reduce((sum, post) => {
    return sum + getMonthlyAmounts(post).reduce((a, b) => a + b, 0)
  }, 0)

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, postId: string) => {
    dragPostIdRef.current = postId
    e.currentTarget.classList.add('dragging')
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.currentTarget.classList.remove('dragging')
    dragPostIdRef.current = null
    setDragOverId(null)
  }

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, targetId: string) => {
    e.preventDefault()
    if (targetId === dragPostIdRef.current) return
    e.dataTransfer.dropEffect = 'move'
    setDragOverId(targetId)
  }

  const handleDragLeave = () => {
    setDragOverId(null)
  }

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, targetId: string) => {
    e.preventDefault()
    setDragOverId(null)
    const fromId = dragPostIdRef.current
    if (!fromId || fromId === targetId) return

    const sectionPosts = state.posts.filter(p => p.sectionId === section.id)
    const fromIdx = sectionPosts.findIndex(p => p.id === fromId)
    const toIdx = sectionPosts.findIndex(p => p.id === targetId)
    if (fromIdx === -1 || toIdx === -1) return

    const reordered = [...sectionPosts]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, moved)

    // Rebuild posts preserving order across all sections
    const orderedPosts: Post[] = []
    state.sections.forEach(sec => {
      if (sec.id === section.id) {
        orderedPosts.push(...reordered)
      } else {
        orderedPosts.push(...state.posts.filter(p => p.sectionId === sec.id))
      }
    })
    updateState({ posts: orderedPosts })
  }

  // Inline editing
  const handleDblClick = (post: Post, monthIdx: number) => {
    if (post.frequency !== 'custom') {
      if (!confirm(`This will change "${post.name}" to a custom schedule so you can set individual month amounts. Continue?`)) return
      const oldAmounts = getMonthlyAmounts(post)
      const customMonths: number[] = []
      for (let i = 0; i < 12; i++) { if (oldAmounts[i] > 0) customMonths.push(i) }
      const updatedPosts = state.posts.map(p =>
        p.id === post.id ? { ...p, frequency: 'custom' as const, customMonths } : p
      )
      updateState({ posts: updatedPosts })
    }
    const currentAmounts = getMonthlyAmounts(post)
    setEditValue(currentAmounts[monthIdx] > 0 ? String(currentAmounts[monthIdx]) : '')
    setEditingCell({ postId: post.id, monthIdx })
  }

  const handleEditFinish = (post: Post, monthIdx: number) => {
    const newVal = parseFloat(editValue) || 0
    let updatedPost: Post
    if (newVal > 0) {
      const customMonths = post.customMonths.includes(monthIdx)
        ? post.customMonths
        : [...post.customMonths, monthIdx].sort((a, b) => a - b)
      updatedPost = { ...post, amount: newVal, frequency: 'custom', customMonths }
    } else {
      const customMonths = post.customMonths.filter(m => m !== monthIdx)
      updatedPost = { ...post, frequency: 'custom', customMonths }
    }
    const updatedPosts = state.posts.map(p => p.id === post.id ? updatedPost : p)
    updateState({ posts: updatedPosts })
    setEditingCell(null)
    setEditValue('')
  }

  const handleDeletePost = (postId: string) => {
    if (confirm('Delete this budget post?')) {
      updateState({ posts: state.posts.filter(p => p.id !== postId) })
    }
  }

  const headerBg = section.color || theme.surface
  const headerStyle = {
    background: headerBg,
    border: `1px solid ${theme.border}`,
    borderRadius: isCollapsed ? 12 : '12px 12px 0 0',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    userSelect: 'none' as const,
  }

  const btnIconStyle = {
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: `1px solid ${theme.border}`,
    color: theme.text2,
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
  }

  return (
    <div className="mb-6">
      <div style={headerStyle} onClick={toggleCollapse}>
        <h2 className="flex items-center gap-2 text-base font-semibold" style={{ color: theme.text }}>
          <span
            style={{
              display: 'inline-block',
              transition: 'transform 0.2s',
              transform: isCollapsed ? 'rotate(-90deg)' : 'none',
              color: theme.text2,
              fontSize: '0.8rem',
            }}
          >
            ▼
          </span>
          {section.name}
          <span
            className="text-xs px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide"
            style={
              section.type === 'income'
                ? { background: `${theme.green}22`, color: theme.green }
                : { background: `${theme.red}18`, color: theme.red }
            }
          >
            {section.type}
          </span>
        </h2>
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <span className="text-sm" style={{ color: theme.text2 }}>
            {sectionTotal !== 0 ? fmt(sectionTotal, state.settings) : ''}
          </span>
          <button
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md text-white"
            style={{ background: theme.gradient, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            onClick={() => onAddPost(section.id)}
          >
            + Add
          </button>
          <button style={btnIconStyle} onClick={() => onEditSection(section.id)} title="Edit section">
            ✎
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div
          style={{
            border: `1px solid ${theme.border}`,
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            overflowX: 'auto',
          }}
        >
          <table className="budget-table">
            <colgroup>
              <col className="col-post" />
              {MONTHS.map(m => <col key={m} className="col-month" />)}
              <col className="col-total" />
            </colgroup>
            <thead>
              <tr>
                <th>Post</th>
                {MONTHS.map(m => <th key={m}>{m}</th>)}
                <th>Year Total</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={14} style={{ textAlign: 'center', padding: 24, color: theme.text2 }}>
                    No posts yet. Click &quot;+ Add&quot; to create one.
                  </td>
                </tr>
              ) : (
                <>
                  {posts.map(post => {
                    const amounts = getMonthlyAmounts(post)
                    const yearTotal = amounts.reduce((a, b) => a + b, 0)
                    const isDragOver = dragOverId === post.id
                    return (
                      <tr
                        key={post.id}
                        draggable
                        onDragStart={e => handleDragStart(e, post.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={e => handleDragOver(e, post.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={e => handleDrop(e, post.id)}
                        className={isDragOver ? 'drag-over' : ''}
                      >
                        <td>
                          <div className="flex items-center gap-1.5">
                            {post.icon && <i style={{ fontStyle: 'normal', marginRight: 2 }}>{post.icon}</i>}
                            <span style={{ color: theme.text }}>{post.name}</span>
                            <span
                              className="text-xs px-1.5 py-0.5 rounded"
                              style={{
                                background: theme.surface,
                                color: theme.text2,
                                border: `1px solid ${theme.border}`,
                                fontSize: '0.7rem',
                              }}
                            >
                              {FREQ_LABEL[post.frequency]}
                            </span>
                            <span className="post-actions">
                              <button
                                style={{ ...btnIconStyle, width: 24, height: 24 }}
                                onClick={() => onEditPost(post.id)}
                                title="Edit"
                              >
                                ✎
                              </button>
                              <button
                                style={{ ...btnIconStyle, width: 24, height: 24 }}
                                onClick={() => handleDeletePost(post.id)}
                                title="Delete"
                              >
                                ×
                              </button>
                            </span>
                          </div>
                        </td>
                        {amounts.map((amt, i) => {
                          const isEditing = editingCell?.postId === post.id && editingCell.monthIdx === i
                          return (
                            <td
                              key={i}
                              className={`editable-cell ${amt === 0 ? 'cell-zero' : ''}`}
                              onDoubleClick={() => handleDblClick(post, i)}
                            >
                              {isEditing ? (
                                <input
                                  type="number"
                                  className="inline-edit"
                                  value={editValue}
                                  step="0.01"
                                  autoFocus
                                  onChange={e => setEditValue(e.target.value)}
                                  onBlur={() => handleEditFinish(post, i)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') e.currentTarget.blur()
                                    if (e.key === 'Escape') {
                                      setEditingCell(null)
                                      setEditValue('')
                                    }
                                  }}
                                />
                              ) : (
                                fmt(amt, state.settings)
                              )}
                            </td>
                          )
                        })}
                        <td>{fmt(yearTotal, state.settings)}</td>
                      </tr>
                    )
                  })}
                  <tr className="total-row">
                    <td>Subtotal</td>
                    {Array.from({ length: 12 }, (_, i) => {
                      const total = posts.reduce((sum, p) => sum + getMonthlyAmounts(p)[i], 0)
                      return <td key={i}>{fmt(total, state.settings)}</td>
                    })}
                    <td>{fmt(sectionTotal, state.settings)}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
