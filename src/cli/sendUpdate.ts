/**
 * CLI: Manual update sender
 * Run with: npm run send:update
 * Dry run:  npm run dry-run
 */

import 'dotenv/config'
import pino from 'pino'
import { generateDailyUpdate } from '../messages/generateDailyUpdate'
import { readLeaderboard } from '../sheets/readLeaderboard'
import { readBotDailyView } from '../sheets/readBotDailyView'
import { sendToGroup } from '../whatsapp/sendToGroup'
import { waitForWhatsAppReady } from '../whatsapp/whatsappClient'

const logger = pino({ level: 'info' })

async function main() {
  const isDryRun = process.argv.includes('--dry-run')

  logger.info({ isDryRun }, 'Starting manual update')

  // Read data
  const leaderboard = await readLeaderboard()
  const botDailyView = await readBotDailyView()

  // Generate message
  const message = generateDailyUpdate({ leaderboard, botDailyView })

  if (isDryRun) {
    logger.info('DRY RUN — would have sent the following message:')
    console.log('')
    console.log(message)
    console.log('')
    logger.info('Dry run complete. No message sent.')
    return
  }

  // Send to WhatsApp
  const client = await waitForWhatsAppReady(logger)
  await sendToGroup(client, message, logger)
  logger.info('Update sent successfully')
}

main().catch(err => {
  console.error('Failed:', err)
  process.exit(1)
})