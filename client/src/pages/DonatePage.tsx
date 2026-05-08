import { useTheme } from '@/contexts/ThemeContext'

export default function DonatePage() {
  const { theme } = useTheme()

  const sectionStyle: React.CSSProperties = {
    background: theme.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    boxShadow: 'var(--shadow)',
    border: `1px solid ${theme.border}`,
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em', color: theme.text }}>
            Support Budgety
          </h1>
          <p style={{ fontSize: 14, color: theme.text2, marginTop: 4 }}>
            I build privacy-first, self-hosted tools — no subscriptions, no ads, no tracking. Your data stays yours.
          </p>
        </div>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 4 }}>What you get</h2>
          <p style={{ fontSize: 12, color: theme.text2, marginBottom: 20 }}>Everything Budgety is and always will be.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, background: 'rgba(34,197,94,0.1)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' }}>
              🛡️ 100% Free Forever
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, background: 'rgba(245,158,11,0.1)', color: '#d97706', border: '1px solid rgba(245,158,11,0.2)' }}>
              🔒 No Ads or Tracking
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, background: 'rgba(139,92,246,0.1)', color: '#7c3aed', border: '1px solid rgba(139,92,246,0.2)' }}>
              💾 Your data, your device
            </span>
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Donate</h2>
          <p style={{ fontSize: 12, color: theme.text2, marginBottom: 20 }}>Every contribution keeps Budgety free for everyone.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>☕</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Buy Me a Coffee</div>
              <div style={{ fontSize: 13, color: theme.text2, marginBottom: 16 }}>One-time donation</div>
              <button
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  background: theme.gradient,
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                  fontWeight: 500,
                }}
                onClick={() => window.open('https://buymeacoffee.com/larsmikki', '_blank')}
              >
                ☕ Buy Me a Coffee
              </button>
            </div>
            <div style={{ background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>💙</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 4 }}>PayPal</div>
              <div style={{ fontSize: 13, color: theme.text2, marginBottom: 16 }}>Secure donation</div>
              <button
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  background: theme.gradient,
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                  fontWeight: 500,
                }}
                onClick={() => window.open('https://paypal.me/larsmikki', '_blank')}
              >
                ❤️ Donate via PayPal
              </button>
            </div>
          </div>
        </section>

        <section style={{ ...sectionStyle, marginBottom: 0, textAlign: 'center' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Thank You!</h2>
          <p style={{ fontSize: 12, color: theme.text2, marginBottom: 0 }}>
            Every bit of support keeps Budgety free for everyone. Happy budgeting! 💚
          </p>
        </section>
      </div>
    </div>
  )
}
