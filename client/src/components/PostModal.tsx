import { useEffect, useState } from 'react'
import type { Section, Post } from '@/types'
import { useTheme } from '@/contexts/ThemeContext'
import { useBudget } from '@/contexts/BudgetContext'
import { generateId, getSortedSections } from '@/utils'
import { ICONS, MONTH_FULL } from '@/data/constants'
import { Button, ConfirmDialog, Input, Modal, Select } from '@/components/ui'

interface PostModalProps {
  open: boolean
  postId: string | null
  defaultSectionId: string
  onClose: () => void
}

const labelClass = 'block text-xs uppercase tracking-wider font-semibold text-text2 mb-1'

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
  const [deleteOpen, setDeleteOpen] = useState(false)

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
    updateState({ posts: isEdit ? state.posts.map(p => p.id === postId ? post : p) : [...state.posts, post] })
    onClose()
  }

  const handleDelete = () => {
    if (!isEdit) return
    updateState({ posts: state.posts.filter(p => p.id !== postId) })
    onClose()
  }

  const toggleCustomMonth = (m: number) => {
    setCustomMonths(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  }

  const filteredIcons = (() => {
    const f = iconSearch.toLowerCase()
    const list = f ? ICONS.filter(ic => ic.name.includes(f)) : ICONS
    const seen = new Set<string>()
    return list.filter(ic => {
      if (seen.has(ic.ch)) return false
      seen.add(ic.ch)
      return true
    })
  })()

  const sortedSections: Section[] = getSortedSections(state.sections)

  return (
    <Modal open={open} title={isEdit ? 'Edit budget post' : 'Add budget post'} onClose={onClose} maxWidth="520px">
      <div>
        <div className="mb-4">
          <label className={labelClass}>Name</label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Rent, Netflix, salary" autoFocus={!isEdit} />
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Amount</label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" min="0" step="0.01" />
          </div>
          <div>
            <label className={labelClass}>Frequency</label>
            <Select value={frequency} onChange={e => setFrequency(e.target.value as Post['frequency'])}>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="biannual">Every 6 months</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom months</option>
            </Select>
          </div>
        </div>

        {frequency !== 'monthly' && frequency !== 'custom' && (
          <div className="mb-4">
            <label className={labelClass}>Start month</label>
            <Select value={startMonth} onChange={e => setStartMonth(parseInt(e.target.value))}>
              {MONTH_FULL.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </Select>
          </div>
        )}

        {frequency === 'custom' && (
          <div className="mb-4">
            <label className={labelClass}>Months</label>
            <div className="flex flex-wrap gap-1.5">
              {MONTH_FULL.map((m, i) => (
                <button
                  key={m}
                  type="button"
                  className="rounded-lg px-2.5 py-1.5 text-xs font-semibold hover:opacity-80"
                  style={{
                    background: customMonths.includes(i) ? `${theme.accent}18` : theme.surface2,
                    border: `1px solid ${customMonths.includes(i) ? theme.accent : theme.border}`,
                    color: customMonths.includes(i) ? theme.accent : theme.text,
                  }}
                  onClick={() => toggleCustomMonth(i)}
                >
                  {m.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className={labelClass}>Section</label>
          <Select value={sectionId} onChange={e => setSectionId(e.target.value)}>
            {sortedSections.map(sec => (
              <option key={sec.id} value={sec.id}>{sec.name} ({sec.type})</option>
            ))}
          </Select>
        </div>

        <div className="mb-4">
          <label className={labelClass}>Icon</label>
          <div className="mb-2 flex items-center gap-2">
            <span className="w-8 text-center text-xl">{icon}</span>
            <Button type="button" size="sm" onClick={() => setIcon('')}>Clear</Button>
          </div>
          <Input value={iconSearch} onChange={e => setIconSearch(e.target.value)} placeholder="Search icons" className="mb-2" />
          <div className="flex max-h-40 flex-wrap gap-1 overflow-y-auto">
            {filteredIcons.map((ic, idx) => (
              <button
                key={`${ic.ch}-${idx}`}
                type="button"
                title={ic.name}
                className="flex h-8 w-8 items-center justify-center rounded-md text-lg hover:opacity-80"
                style={{
                  background: icon === ic.ch ? `${theme.accent}22` : theme.surface2,
                  border: `1px solid ${icon === ic.ch ? theme.accent : theme.border}`,
                }}
                onClick={() => setIcon(ic.ch)}
              >
                {ic.ch}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          {isEdit && <Button variant="danger" onClick={() => setDeleteOpen(true)}>Delete</Button>}
          <Button variant="primary" onClick={handleSave}>Save</Button>
        </div>
      </div>
      <ConfirmDialog
        open={deleteOpen}
        title="Delete budget post"
        message="This budget post will be removed from the year."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </Modal>
  )
}
