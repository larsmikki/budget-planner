import { useTheme } from '@/contexts/ThemeContext'
import { useBudget } from '@/contexts/BudgetContext'
import { getMonthlyAmounts, fmt } from '@/utils'

export default function SummaryBar() {
  const { theme } = useTheme()
  const { state } = useBudget()

  const incomeSectionIds = new Set(state.sections.filter(s => s.type === 'income').map(s => s.id))

  let totalIncome = 0
  let totalExpenses = 0

  for (const post of state.posts) {
    const amounts = getMonthlyAmounts(post)
    const yearTotal = amounts.reduce((a, b) => a + b, 0)
    if (incomeSectionIds.has(post.sectionId)) {
      totalIncome += yearTotal
    } else {
      totalExpenses += yearTotal
    }
  }

  const yearBalance = totalIncome - totalExpenses

  const cardStyle = {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: 12,
    padding: '16px 24px',
    minWidth: 180,
    flex: 1,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  }

  return (
    <div className="flex gap-4 mb-6 flex-wrap">
      <div className="card-hover" style={cardStyle}>
        <div className="text-sm mb-1" style={{ color: theme.text2 }}>Total Income</div>
        <div className="text-2xl font-bold" style={{ color: theme.green }}>
          {fmt(totalIncome, state.settings)}
        </div>
      </div>
      <div className="card-hover" style={cardStyle}>
        <div className="text-sm mb-1" style={{ color: theme.text2 }}>Total Expenses</div>
        <div className="text-2xl font-bold" style={{ color: theme.text }}>
          {fmt(totalExpenses, state.settings)}
        </div>
      </div>
      <div className="card-hover" style={cardStyle}>
        <div className="text-sm mb-1" style={{ color: theme.text2 }}>Year Balance</div>
        <div
          className="text-2xl font-bold"
          style={{ color: yearBalance >= 0 ? theme.green : theme.red }}
        >
          {yearBalance !== 0 ? (yearBalance >= 0 ? '+' : '') + fmt(yearBalance, state.settings) : fmt(0, state.settings)}
        </div>
      </div>
    </div>
  )
}
