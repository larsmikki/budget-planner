import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useBudget } from '@/contexts/BudgetContext'
import { generateId } from '@/utils'
import { Button, ColorSwatches, ConfirmDialog, Input, Modal } from '@/components/ui'

interface SectionModalProps {
  open: boolean
  sectionId: string | null
  onClose: () => void
}

const labelClass = 'block text-xs uppercase tracking-wider font-semibold text-text2 mb-1'

export default function SectionModal({ open, sectionId, onClose }: SectionModalProps) {
  const isEdit = sectionId !== null

  return (
    <Modal open={open} title={isEdit ? 'Edit section' : 'Add section'} onClose={onClose} maxWidth="420px">
      <SectionModalFields key={sectionId ?? 'new'} sectionId={sectionId} onClose={onClose} />
    </Modal>
  )
}

function SectionModalFields({ sectionId, onClose }: Omit<SectionModalProps, 'open'>) {
  const { theme } = useTheme()
  const { state, updateState } = useBudget()
  const editSection = sectionId ? state.sections.find(s => s.id === sectionId) : undefined
  const [name, setName] = useState(editSection?.name ?? '')
  const [type, setType] = useState<'income' | 'expense'>(editSection?.type ?? 'expense')
  const [color, setColor] = useState(editSection?.color ?? '')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const isEdit = sectionId !== null

  const handleSave = () => {
    if (!name.trim()) return
    if (isEdit) {
      updateState({
        sections: state.sections.map(s => s.id === sectionId ? { ...s, name: name.trim(), type, color: color || undefined } : s),
      })
    } else {
      updateState({ sections: [...state.sections, { id: generateId(), name: name.trim(), type, ...(color ? { color } : {}) }] })
    }
    onClose()
  }

  const handleDelete = () => {
    if (!isEdit) return
    const newCollapsed = { ...state.collapsed }
    delete newCollapsed[sectionId!]
    updateState({
      sections: state.sections.filter(s => s.id !== sectionId),
      posts: state.posts.filter(p => p.sectionId !== sectionId),
      collapsed: newCollapsed,
    })
    onClose()
  }

  const typeButtonStyle = (value: 'income' | 'expense'): React.CSSProperties => {
    const active = type === value
    const color = value === 'income' ? theme.green : theme.red
    return {
      background: active ? `${color}15` : theme.surface2,
      border: `1px solid ${active ? color : theme.border}`,
      color: active ? color : theme.text2,
      boxShadow: active ? `0 0 0 3px ${color}15` : 'none',
    }
  }

  return (
    <>
      <div>
        <div className="mb-4">
          <label className={labelClass}>Section name</label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Household, subscriptions" autoFocus />
        </div>

        <div className="mb-4">
          <label className={labelClass}>Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="rounded-lg px-3 py-2.5 text-sm font-semibold" style={typeButtonStyle('income')} onClick={() => setType('income')}>
              Income
            </button>
            <button type="button" className="rounded-lg px-3 py-2.5 text-sm font-semibold" style={typeButtonStyle('expense')} onClick={() => setType('expense')}>
              Expense
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className={labelClass}>Background color</label>
          <ColorSwatches value={color} onChange={setColor} size={28} />
          <div className="mt-3 flex items-center gap-2">
            <input
              type="color"
              value={color || '#22c55e'}
              className="h-8 w-10 cursor-pointer rounded-lg p-0.5"
              style={{ border: `1px solid ${theme.border}` }}
              onChange={e => setColor(e.target.value)}
              title="Custom color"
            />
            <span className="font-mono text-sm text-text2">{color || 'Theme surface'}</span>
            <Button type="button" size="sm" onClick={() => setColor('')}>Clear</Button>
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
        title="Delete section"
        message={
          state.posts.filter(p => p.sectionId === sectionId).length > 0
            ? `This section and its ${state.posts.filter(p => p.sectionId === sectionId).length} post(s) will be removed.`
            : 'This section will be removed.'
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </>
  )
}
