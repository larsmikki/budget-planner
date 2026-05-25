import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { BudgetProvider } from '@/contexts/BudgetContext'
import Layout from '@/components/Layout'
import FrontPage from '@/pages/FrontPage'
import SettingsPage from '@/pages/SettingsPage'
import DonatePage from '@/pages/DonatePage'
import { ToastProvider } from '@/components/ui'

export default function App() {
  return (
    <ThemeProvider>
      <BudgetProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<FrontPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/donate" element={<DonatePage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </BudgetProvider>
    </ThemeProvider>
  )
}
