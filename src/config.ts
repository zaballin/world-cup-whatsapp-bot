import 'dotenv/config'

// ─────────────────────────────────────────────────────────────
// Config — validated environment variables
// ─────────────────────────────────────────────────────────────

export function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required env var: ${key}`)
  return value
}

export const CONFIG = {
  googleSheetId: process.env.GOOGLE_SHEET_ID ?? '',
  dryRun: process.env.DRY_RUN === 'true',
  whatsappGroupName: process.env.WHATSAPP_GROUP_NAME ?? 'Family World Cup Pool',
  scheduleCron: process.env.SCHEDULE_CRON ?? '0 21 * * *',
  timezone: process.env.TIMEZONE ?? 'Europe/Zurich',
  botTone: process.env.BOT_TONE ?? 'spicy_latin',
  whatsappSessionPath: process.env.WHATSAPP_SESSION_PATH ?? './whatsapp-session',
}