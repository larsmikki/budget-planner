import { useEffect, useState, type ReactNode } from 'react'
import { ThemeContext, THEMES, type ThemeDefinition } from '@/contexts/ThemeContext'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeDefinition>(() => {
    const stored = localStorage.getItem('budgety-theme')
    if (!stored) return THEMES[0]
    if (stored === 'light') return THEMES.find(t => t.name === 'Default') || THEMES[0]
    if (stored === 'dark') return THEMES.find(t => t.name === 'Dark') || THEMES[0]
    if (stored === 'Monochrome') return THEMES.find(t => t.name === 'Mono') || THEMES[0]
    if (stored === 'Earth') return THEMES.find(t => t.name === 'Default') || THEMES[0]
    const found = THEMES.find(t => t.name === stored)
    return found || THEMES[0]
  })

  useEffect(() => {
    localStorage.setItem('budgety-theme', theme.name)

    const root = document.documentElement
    root.classList.toggle('dark', theme.mode === 'dark')
    root.style.setProperty('--theme-bg', theme.bg)
    root.style.setProperty('--theme-surface', theme.surface)
    root.style.setProperty('--theme-surface2', theme.surface2)
    root.style.setProperty('--theme-border', theme.border)
    root.style.setProperty('--theme-text', theme.text)
    root.style.setProperty('--theme-text2', theme.text2)
    root.style.setProperty('--theme-accent', theme.accent)
    root.style.setProperty('--theme-gradient', theme.gradient)
    root.style.setProperty('--brand-gradient', theme.gradient)
    root.style.setProperty('--green', theme.green)
    root.style.setProperty('--red', theme.red)
    root.style.setProperty('--yellow', theme.yellow)
  }, [theme])

  const setThemeByName = (name: string) => {
    const found = THEMES.find(t => t.name === name)
    if (found) setTheme(found)
  }

  return (
    <ThemeContext.Provider value={{ theme, setThemeByName }}>
      {children}
    </ThemeContext.Provider>
  )
}
