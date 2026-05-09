/**
 * World Cup WhatsApp Bot — Main Entry Point
 *
 * Orchestrates:
 * 1. Google Sheets data read (leaderboard + Bot_Daily_View)
 * 2. Message generation (template-based, tone-configurable)
 * 3. WhatsApp delivery to configured group
 * 4. Scheduled runs via node-cron
 *
 * Operational safety:
 *  - DRY_RUN=true skips WhatsApp entirely
 *  - WhatsApp session persisted locally — no QR on restarts
 *  - Uses secondary WhatsApp number (required)
 *  - Low-volume group updates only — do not spam
 */

import 'dotenv/config'
import pino from 'pino'
import { CONFIG } from './config'
import { readLeaderboard } from './sheets/readLeaderboard'
import { readBotDailyView } from './sheets/readBotDailyView'
import { generateDailyUpdate } from './messages/generateDailyUpdate'
import { waitForWhatsAppReady } from './whatsapp/whatsappClient'
import { sendToGroup } from './whatsapp/sendToGroup'
import { scheduleDailyUpdate } from './scheduler/scheduleDailyUpdate'

const logger = pino({ level: 'info' })

// ─────────────────────────────────────────────────────────────
// Core task: fetch → generate → send
// ─────────────────────────────────────────────────────────────

async function runUpdate(): Promise<void> {
  logger.info('Fetching data from Google Sheets...')

  const leaderboard = await readLeaderboard()
  const botDailyView = await readBotDailyView()

  logger.info({ leaderboardSize: leaderboard.length }, 'Data fetched')

  const message = generateDailyUpdate({ leaderboard, botDailyView })

  // Dry run: log only, skip WhatsApp
  if (CONFIG.dryRun) {
    logger.info('DRY RUN — skipping WhatsApp send')
    logger.info({ message }, 'Generated message:')
    return
  }

  // Real send
  logger.info('Connecting to WhatsApp...')
  const client = await waitForWhatsAppReady(logger)
  await sendToGroup(client, message, logger)
  logger.info('Update complete')
}

// ─────────────────────────────────────────────────────────────
// Entrypoint
// ─────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  logger.info(CONFIG, 'World Cup WhatsApp Bot starting...')

  // One-shot if called with --once flag
  if (process.argv.includes('--once')) {
    await runUpdate()
    return
  }

  // Otherwise: schedule and run scheduler
  scheduleDailyUpdate(runUpdate, logger)

  // Keep process alive
  logger.info('Bot running. Press Ctrl+C to stop.')
}

// Start WhatsApp client in background when not in dry run
if (!CONFIG.dryRun) {
  waitForWhatsAppReady(logger).catch(err => {
    logger.error({ err }, 'WhatsApp client init failed — will retry on next run')
  })
}

main().catch(err => {
  logger.error({ err }, 'Fatal error')
  process.exit(1)
})