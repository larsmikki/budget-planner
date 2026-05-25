import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export interface ThemeDefinition {
  name: string
  mode: 'light' | 'dark'
  bg: string
  surface: string
  surface2: string
  border: string
  text: string
  text2: string
  accent: string
  gradient: string
  green: string
  red: string
  yellow: string
  previewColors: string[]
}

export const THEMES: ThemeDefinition[] = [
  { name: 'Default', mode: 'light', bg: '#f4f5f7', surface: '#ffffff', surface2: '#e9ebef', border: 'rgba(0,0,0,0.09)', text: '#09090b', text2: '#71717a', accent: '#16a34a', gradient: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)', green: '#16a34a', red: '#dc2626', yellow: '#f59e0b', previewColors: ['#f4f5f7', '#ffffff', '#16a34a'] },
  { name: 'Dark', mode: 'dark', bg: '#0a0f0c', surface: '#111814', surface2: '#1a2821', border: 'rgba(22,163,74,0.18)', text: '#f0fff6', text2: '#8aa895', accent: '#16a34a', gradient: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)', green: '#22c55e', red: '#f87171', yellow: '#fbbf24', previewColors: ['#111814', '#1a2821', '#16a34a'] },
  { name: 'Midnight', mode: 'dark', bg: '#050814', surface: '#0d1117', surface2: '#161b22', border: 'rgba(20,184,166,0.18)', text: '#e2f8ff', text2: '#7d8ea0', accent: '#14b8a6', gradient: 'linear-gradient(135deg, #22c55e 0%, #14b8a6 100%)', green: '#22c55e', red: '#f87171', yellow: '#fbbf24', previewColors: ['#161b22', '#0d2a35', '#14b8a6'] },
  { name: 'Rainbow', mode: 'light', bg: '#f5f0ff', surface: '#ffffff', surface2: '#ede9fe', border: '#ddd6fe', text: '#1a1a2e', text2: '#6b5fa0', accent: '#7c3aed', gradient: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)', green: '#16a34a', red: '#dc2626', yellow: '#f59e0b', previewColors: ['#fce7f3', '#ede9fe', '#dbeafe'] },
  { name: 'Ocean', mode: 'light', bg: '#f0f9ff', surface: '#ffffff', surface2: '#e0f2fe', border: '#bae6fd', text: '#0c1e3a', text2: '#4a6d8c', accent: '#0284c7', gradient: 'linear-gradient(135deg, #0284c7 0%, #0891b2 100%)', green: '#16a34a', red: '#dc2626', yellow: '#f59e0b', previewColors: ['#dbeafe', '#e0f7fa', '#bae6fd'] },
  { name: 'Forest', mode: 'light', bg: '#f0fdf4', surface: '#ffffff', surface2: '#dcfce7', border: '#bbf7d0', text: '#052e16', text2: '#4a7c59', accent: '#16a34a', gradient: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)', green: '#16a34a', red: '#dc2626', yellow: '#f59e0b', previewColors: ['#dcfce7', '#d1fae5', '#a7f3d0'] },
  { name: 'Sunset', mode: 'light', bg: '#fffbf0', surface: '#ffffff', surface2: '#fef3c7', border: '#fde68a', text: '#1c1009', text2: '#92400e', accent: '#d97706', gradient: 'linear-gradient(135deg, #d97706 0%, #dc2626 100%)', green: '#16a34a', red: '#dc2626', yellow: '#f59e0b', previewColors: ['#fef3c7', '#fce7f3', '#fde68a'] },
  { name: 'Lavender', mode: 'light', bg: '#faf5ff', surface: '#ffffff', surface2: '#f3e8ff', border: '#e9d5ff', text: '#1a0a2e', text2: '#7e5aa2', accent: '#9333ea', gradient: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)', green: '#16a34a', red: '#dc2626', yellow: '#f59e0b', previewColors: ['#f3e8ff', '#fce7f3', '#e9d5ff'] },
  { name: 'Nord', mode: 'light', bg: '#eceff4', surface: '#ffffff', surface2: '#e5e9f0', border: '#d8dee9', text: '#2e3440', text2: '#4c566a', accent: '#5e81ac', gradient: 'linear-gradient(135deg, #5e81ac 0%, #81a1c1 100%)', green: '#16a34a', red: '#dc2626', yellow: '#f59e0b', previewColors: ['#e5e9f0', '#d8dee9', '#5e81ac'] },
  { name: 'Mono', mode: 'light', bg: '#f8f9fa', surface: '#ffffff', surface2: '#f1f3f5', border: '#dee2e6', text: '#212529', text2: '#6c757d', accent: '#343a40', gradient: 'linear-gradient(135deg, #343a40 0%, #495057 100%)', green: '#16a34a', red: '#dc2626', yellow: '#f59e0b', previewColors: ['#f1f3f5', '#e9ecef', '#dee2e6'] },
]

interface ThemeContextType {
  theme: ThemeDefinition
  setThemeByName: (name: string) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: THEMES[0],
  setThemeByName: () => {},
})

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

export const useTheme = () => useContext(ThemeContext)
