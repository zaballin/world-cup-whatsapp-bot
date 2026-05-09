import { readTab } from './googleSheetsClient'
import type { BotDailyView } from './types'

// ─────────────────────────────────────────────────────────────
// Bot Daily View Reader
// ─────────────────────────────────────────────────────────────

export async function readBotDailyView(): Promise<BotDailyView> {
  const { rows } = await readTab('Bot_Daily_View')

  const fields: Record<string, string> = {}
  for (const row of rows) {
    const field = String(row['Field'] ?? '').trim()
    const value = String(row['Value'] ?? '').trim()
    if (field) {
      fields[field] = value
    }
  }

  return {
    fields,
    get(key: string): string | undefined {
      return fields[key]
    },
  }
}