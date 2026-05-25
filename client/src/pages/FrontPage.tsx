import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useBudget } from '@/contexts/BudgetContext'
import { getSortedSections, getMonthlyAmounts, fmt } from '@/utils'
import { MONTHS } from '@/data/constants'
import SummaryBar from '@/components/SummaryBar'
import BudgetSection from '@/components/BudgetSection'
import PostModal from '@/components/PostModal'
import SectionModal from '@/components/SectionModal'
import QuickSetupModal from '@/components/QuickSetupModal'
import { Button, Surface } from '@/components/ui'

export default function FrontPage() {
  const { theme } = useTheme()
  const { state } = useBudget()

  const [postModalOpen, setPostModalOpen] = useState(false)
  const [editPostId, setEditPostId] = useState<string | null>(null)
  const [defaultSectionId, setDefaultSectionId] = useState('')

  const [sectionModalOpen, setSectionModalOpen] = useState(false)
  const [editSectionId, setEditSectionId] = useState<string | null>(null)

  const [quickSetupOpen, setQuickSetupOpen] = useState(false)

  const openAddPost = (sectionId: string) => {
    setEditPostId(null)
    setDefaultSectionId(sectionId)
    setPostModalOpen(true)
  }

  const openEditPost = (postId: string) => {
    setEditPostId(postId)
    const post = state.posts.find(p => p.id === postId)
    if (post) setDefaultSectionId(post.sectionId)
    setPostModalOpen(true)
  }

  const openAddSection = () => {
    setEditSectionId(null)
    setSectionModalOpen(true)
  }

  const openEditSection = (sectionId: string) => {
    setEditSectionId(sectionId)
    setSectionModalOpen(true)
  }

  const sorted = getSortedSections(state.sections)
  const showSetupBanner = state.posts.length === 0 && state.sections.length <= 3

  // Compute balance table data
  const incomeSectionIds = new Set(state.sections.filter(s => s.type === 'income').map(s => s.id))
  const incomeMonths = new Array<number>(12).fill(0)
  const expenseMonths = new Array<number>(12).fill(0)

  for (const post of state.posts) {
    const amounts = getMonthlyAmounts(post)
    const isIncome = incomeSectionIds.has(post.sectionId)
    amounts.forEach((a, i) => {
      if (isIncome) incomeMonths[i] += a
      else expenseMonths[i] += a
    })
  }

  const incTotal = incomeMonths.reduce((a, b) => a + b, 0)
  const expTotal = expenseMonths.reduce((a, b) => a + b, 0)

  return (
    <div>
      <SummaryBar />

      {showSetupBanner && (
        <Surface
          className="mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
          style={{ backgroundImage: `linear-gradient(135deg, ${theme.accent}14, ${theme.accent}08)` }}
        >
          <p className="text-sm text-text2">
            Add{' '}
            <span style={{ color: theme.accent, fontWeight: 600 }}>income sources</span> and{' '}
            <span style={{ color: theme.accent, fontWeight: 600 }}>budget posts</span> to start planning.
          </p>
          <Button variant="primary" onClick={() => setQuickSetupOpen(true)}>Quick setup</Button>
        </Surface>
      )}

      {sorted.map(section => (
        <BudgetSection
          key={section.id}
          section={section}
          posts={state.posts.filter(p => p.sectionId === section.id)}
          onAddPost={openAddPost}
          onEditPost={openEditPost}
          onEditSection={openEditSection}
        />
      ))}

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <Button onClick={openAddSection}>Add section</Button>
      </div>

      {/* Monthly Balance Table */}
      <div className="mb-6">
        <div
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px 12px 0 0',
            padding: '10px 16px',
          }}
        >
          <h2 className="text-base font-semibold" style={{ color: theme.text }}>Monthly Balance</h2>
        </div>
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
                <th></th>
                {MONTHS.map(m => <th key={m}>{m}</th>)}
                <th>Year Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="income-row">
                <td>Income</td>
                {incomeMonths.map((v, i) => <td key={i}>{fmt(v, state.settings)}</td>)}
                <td>{fmt(incTotal, state.settings)}</td>
              </tr>
              <tr>
                <td style={{ color: theme.text }}>Expenses</td>
                {expenseMonths.map((v, i) => <td key={i}>{fmt(v, state.settings)}</td>)}
                <td>{fmt(expTotal, state.settings)}</td>
              </tr>
              <tr className="balance-row">
                <td>Balance</td>
                {incomeMonths.map((_, i) => {
                  const bal = incomeMonths[i] - expenseMonths[i]
                  return (
                    <td
                      key={i}
                      style={{ color: bal >= 0 ? theme.green : theme.red }}
                    >
                      {bal !== 0 ? (bal >= 0 ? '+' : '') + fmt(bal, state.settings) : fmt(0, state.settings)}
                    </td>
                  )
                })}
                {(() => {
                  const balTotal = incTotal - expTotal
                  return (
                    <td style={{ color: balTotal >= 0 ? theme.green : theme.red }}>
                      {balTotal !== 0 ? (balTotal >= 0 ? '+' : '') + fmt(balTotal, state.settings) : fmt(0, state.settings)}
                    </td>
                  )
                })()}
              </tr>
              <tr className="total-row">
                <td>Cumulative</td>
                {(() => {
                  let cumul = 0
                  return incomeMonths.map((_, i) => {
                    cumul += incomeMonths[i] - expenseMonths[i]
                    return (
                      <td key={i} style={{ color: cumul >= 0 ? theme.green : theme.red }}>
                        {cumul !== 0 ? (cumul >= 0 ? '+' : '') + fmt(cumul, state.settings) : fmt(0, state.settings)}
                      </td>
                    )
                  })
                })()}
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <PostModal
        open={postModalOpen}
        postId={editPostId}
        defaultSectionId={defaultSectionId}
        onClose={() => setPostModalOpen(false)}
      />
      <SectionModal
        open={sectionModalOpen}
        sectionId={editSectionId}
        onClose={() => setSectionModalOpen(false)}
      />
      <QuickSetupModal
        open={quickSetupOpen}
        onClose={() => setQuickSetupOpen(false)}
      />
    </div>
  )
}
