import { useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import ThemePicker from '@/components/ThemePicker'
import { useBudget } from '@/contexts/BudgetContext'
import { migrateState } from '@/utils'
import type { BudgetState } from '@/types'

export default function SettingsPage() {
  const { theme } = useTheme()
  const { state, updateState, setState } = useBudget()
  const importRef = useRef<HTMLInputElement>(null)

  const updateSettings = (patch: Partial<typeof state.settings>) => {
    updateState({ settings: { ...state.settings, ...patch } })
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `budget-${state.year}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as Partial<BudgetState>
        if (data.posts) {
          setState(migrateState(data))
        }
      } catch {
        alert('Invalid file format.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const sectionStyle = {
    background: theme.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    boxShadow: 'var(--shadow)',
    border: `1px solid ${theme.border}`,
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${theme.border}`,
    borderRadius: 10,
    fontSize: 14,
    fontFamily: 'inherit',
    background: theme.surface,
    color: theme.text,
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: theme.text }}>
            Settings
          </h1>
          <p className="text-sm mt-0.5" style={{ color: theme.text2 }}>
            Customize Budgety to your preferences.
          </p>
        </div>

        {/* Themes */}
        <div style={sectionStyle}>
          <h2 className="text-base font-bold mb-1" style={{ color: theme.text }}>Themes</h2>
          <p className="text-xs mb-5" style={{ color: theme.text2 }}>
            Choose how Budgety looks to you.
          </p>
          <ThemePicker onSelect={name => updateSettings({ themeName: name })} />
        </div>

        {/* Currency & Format */}
        <div style={sectionStyle}>
          <h2 className="text-base font-bold mb-1" style={{ color: theme.text }}>Currency &amp; Format</h2>
          <p className="text-xs mb-5" style={{ color: theme.text2 }}>
            Set your preferred currency and number style.
          </p>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: theme.text2, marginBottom: 8 }}>
              Currency
            </label>
            <select
              style={inputStyle}
              value={state.settings.locale || ''}
              onChange={e => updateSettings({ locale: e.target.value || undefined })}
            >
              <option value="">Default (6.250,00)</option>
              <option value="en-US:USD">$ USD (1,000.00)</option>
              <option value="en-GB:GBP">£ GBP (1,000.00)</option>
              <option value="de-DE:EUR">€ EUR German (1.000,00)</option>
              <option value="fr-FR:EUR">€ EUR French (1 000,00)</option>
              <option value="nb-NO:NOK">kr NOK (1 000,00)</option>
              <option value="sv-SE:SEK">kr SEK (1 000,00)</option>
              <option value="da-DK:DKK">kr DKK (1.000,00)</option>
              <option value="ja-JP:JPY">¥ JPY (1,000)</option>
              <option value="de-CH:CHF">CHF (1&apos;000.00)</option>
              <option value="pl-PL:PLN">zł PLN (1 000,00)</option>
            </select>
          </div>
        </div>

        {/* Display */}
        <div style={sectionStyle}>
          <h2 className="text-base font-bold mb-1" style={{ color: theme.text }}>Display</h2>
          <p className="text-xs mb-5" style={{ color: theme.text2 }}>
            Show or hide interface elements.
          </p>
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                color: theme.text,
              }}
            >
              <span>Hide decimals</span>
              <input
                type="checkbox"
                className="toggle-input"
                style={{ display: 'none' }}
                checked={!!state.settings.hideDecimals}
                onChange={e => updateSettings({ hideDecimals: e.target.checked })}
              />
              <span className="toggle-slider" />
            </label>
          </div>
          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                color: theme.text,
              }}
            >
              <span>
                Fictive amounts{' '}
                <small style={{ color: theme.text2, fontWeight: 400 }}>(demo / screenshot mode)</small>
              </span>
              <input
                type="checkbox"
                className="toggle-input"
                style={{ display: 'none' }}
                checked={!!state.settings.fictiveAmounts}
                onChange={e => updateSettings({ fictiveAmounts: e.target.checked })}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        {/* Data */}
        <div style={sectionStyle}>
          <h2 className="text-base font-bold mb-1" style={{ color: theme.text }}>Data</h2>
          <p className="text-xs mb-5" style={{ color: theme.text2 }}>
            Export or import your data as a JSON backup.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all hover:opacity-80"
              style={{ background: theme.surface2, color: theme.text, border: `1px solid ${theme.border}` }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Export Settings
            </button>
            <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
            <button
              onClick={() => importRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all hover:opacity-80"
              style={{ background: theme.surface2, color: theme.text, border: `1px solid ${theme.border}` }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Import Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
