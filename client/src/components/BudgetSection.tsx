import { useRef, useState } from 'react'
import type { Section, Post } from '@/types'
import { useTheme } from '@/contexts/ThemeContext'
import { useBudget } from '@/contexts/BudgetContext'
import { getMonthlyAmounts, fmt } from '@/utils'
import { MONTHS } from '@/data/constants'
import { Button, ConfirmDialog, Pill } from '@/components/ui'

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
  const [customScheduleTarget, setCustomScheduleTarget] = useState<{ post: Post; monthIdx: number } | null>(null)
  const [deletePostId, setDeletePostId] = useState<string | null>(null)

  const sectionTotal = posts.reduce((sum, post) => sum + getMonthlyAmounts(post).reduce((a, b) => a + b, 0), 0)

  const toggleCollapse = () => {
    updateState({ collapsed: { ...state.collapsed, [section.id]: !isCollapsed } })
  }

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

    const orderedPosts: Post[] = []
    state.sections.forEach(sec => {
      orderedPosts.push(...(sec.id === section.id ? reordered : state.posts.filter(p => p.sectionId === sec.id)))
    })
    updateState({ posts: orderedPosts })
  }

  const handleDblClick = (post: Post, monthIdx: number) => {
    if (post.frequency !== 'custom') {
      setCustomScheduleTarget({ post, monthIdx })
      return
    }
    const currentAmounts = getMonthlyAmounts(post)
    setEditValue(currentAmounts[monthIdx] > 0 ? String(currentAmounts[monthIdx]) : '')
    setEditingCell({ postId: post.id, monthIdx })
  }

  const convertToCustomSchedule = () => {
    if (!customScheduleTarget) return
    const { post, monthIdx } = customScheduleTarget
    const oldAmounts = getMonthlyAmounts(post)
    const customMonths = oldAmounts.flatMap((amount, i) => amount > 0 ? [i] : [])
    updateState({
      posts: state.posts.map(p => p.id === post.id ? { ...p, frequency: 'custom' as const, customMonths } : p),
    })
    setEditValue(oldAmounts[monthIdx] > 0 ? String(oldAmounts[monthIdx]) : '')
    setEditingCell({ postId: post.id, monthIdx })
  }

  const handleEditFinish = (post: Post, monthIdx: number) => {
    const newVal = parseFloat(editValue) || 0
    const customMonths = newVal > 0
      ? [...new Set([...post.customMonths, monthIdx])].sort((a, b) => a - b)
      : post.customMonths.filter(m => m !== monthIdx)
    const updatedPost = { ...post, amount: newVal > 0 ? newVal : post.amount, frequency: 'custom' as const, customMonths }
    updateState({ posts: state.posts.map(p => p.id === post.id ? updatedPost : p) })
    setEditingCell(null)
    setEditValue('')
  }

  const handleDeletePost = (postId: string) => {
    setDeletePostId(postId)
  }

  const confirmDeletePost = () => {
    if (!deletePostId) return
    updateState({ posts: state.posts.filter(p => p.id !== deletePostId) })
  }

  return (
    <div className="mb-6">
      <div
        className="flex cursor-pointer select-none items-center justify-between px-4 py-2.5"
        style={{
          background: section.color || theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: isCollapsed ? 12 : '12px 12px 0 0',
        }}
        onClick={toggleCollapse}
      >
        <h2 className="flex items-center gap-2 text-base font-semibold" style={{ color: theme.text }}>
          <span
            className="inline-block transition-transform"
            style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'none', color: theme.text2 }}
          >
            ▼
          </span>
          {section.name}
          <Pill
            active={false}
            style={
              section.type === 'income'
                ? { background: `${theme.green}22`, color: theme.green, borderColor: `${theme.green}40` }
                : { background: `${theme.red}18`, color: theme.red, borderColor: `${theme.red}35` }
            }
          >
            {section.type}
          </Pill>
        </h2>
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <span className="text-sm text-text2">{sectionTotal !== 0 ? fmt(sectionTotal, state.settings) : ''}</span>
          <Button size="sm" variant="primary" onClick={() => onAddPost(section.id)}>Add</Button>
          <Button size="sm" variant="ghost" onClick={() => onEditSection(section.id)} title="Edit section">Edit</Button>
        </div>
      </div>

      {!isCollapsed && (
        <div style={{ border: `1px solid ${theme.border}`, borderTop: 'none', borderRadius: '0 0 8px 8px', overflowX: 'auto' }}>
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
                <th>Year total</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={14} style={{ textAlign: 'center', padding: 24, color: theme.text2 }}>
                    No posts yet. Add one to create a budget row.
                  </td>
                </tr>
              ) : (
                <>
                  {posts.map(post => {
                    const amounts = getMonthlyAmounts(post)
                    const yearTotal = amounts.reduce((a, b) => a + b, 0)
                    return (
                      <tr
                        key={post.id}
                        draggable
                        onDragStart={e => handleDragStart(e, post.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={e => handleDragOver(e, post.id)}
                        onDragLeave={() => setDragOverId(null)}
                        onDrop={e => handleDrop(e, post.id)}
                        className={dragOverId === post.id ? 'drag-over' : ''}
                      >
                        <td>
                          <div className="flex items-center gap-1.5">
                            {post.icon && <i style={{ fontStyle: 'normal', marginRight: 2 }}>{post.icon}</i>}
                            <span style={{ color: theme.text }}>{post.name}</span>
                            <Pill active={false}>{FREQ_LABEL[post.frequency]}</Pill>
                            <span className="post-actions">
                              <Button className="h-6 px-2" type="button" size="sm" variant="ghost" onClick={() => onEditPost(post.id)}>
                                Edit
                              </Button>
                              <button
                                type="button"
                                className="h-6 rounded-lg px-2 text-xs font-semibold hover:opacity-80"
                                style={{ color: theme.red }}
                                onClick={() => handleDeletePost(post.id)}
                              >
                                Delete
                              </button>
                            </span>
                          </div>
                        </td>
                        {amounts.map((amt, i) => {
                          const isEditing = editingCell?.postId === post.id && editingCell.monthIdx === i
                          return (
                            <td key={i} className={`editable-cell ${amt === 0 ? 'cell-zero' : ''}`} onDoubleClick={() => handleDblClick(post, i)}>
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
                    {Array.from({ length: 12 }, (_, i) => (
                      <td key={i}>{fmt(posts.reduce((sum, p) => sum + getMonthlyAmounts(p)[i], 0), state.settings)}</td>
                    ))}
                    <td>{fmt(sectionTotal, state.settings)}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog
        open={customScheduleTarget !== null}
        title="Use custom schedule"
        message={`This will change "${customScheduleTarget?.post.name || 'this post'}" to a custom schedule so you can set individual month amounts.`}
        confirmLabel="Continue"
        onConfirm={convertToCustomSchedule}
        onClose={() => setCustomScheduleTarget(null)}
      />
      <ConfirmDialog
        open={deletePostId !== null}
        title="Delete budget post"
        message="This budget post will be removed from the year."
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDeletePost}
        onClose={() => setDeletePostId(null)}
      />
    </div>
  )
}
