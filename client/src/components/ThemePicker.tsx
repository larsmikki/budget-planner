import { useTheme, THEMES } from '@/contexts/ThemeContext'

export default function ThemePicker({ onSelect }: { onSelect?: (name: string) => void } = {}) {
  const { theme, setThemeByName } = useTheme()
  return (
    <div className="grid grid-cols-5 gap-2">
      {THEMES.map(t => {
        const isActive = t.name === theme.name
        return (
          <button
            key={t.name}
            onClick={() => { setThemeByName(t.name); onSelect?.(t.name) }}
            className="flex flex-col items-center rounded-xl p-1.5 transition-opacity hover:opacity-80"
            style={{
              border: isActive ? `2px solid ${theme.accent}` : `2px solid transparent`,
              background: isActive ? `${theme.accent}12` : 'transparent',
            }}
          >
            <div className="flex aspect-square w-full overflow-hidden rounded-lg" style={{ border: `1px solid ${t.border}` }}>
              {t.previewColors.map((c, i) => (
                <div key={i} className="flex-1" style={{ background: c }} />
              ))}
            </div>
            <span className="mt-1 text-[10px] font-medium text-text2">{t.name}</span>
          </button>
        )
      })}
    </div>
  )
}
