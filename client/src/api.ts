export async function fetchState(): Promise<Record<string, unknown>> {
  const res = await fetch('/api/state')
  if (!res.ok) throw new Error('Failed to fetch state')
  return res.json() as Promise<Record<string, unknown>>
}

export async function saveState(state: unknown): Promise<void> {
  await fetch('/api/state', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  })
}
