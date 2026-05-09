import cron from 'node-cron'
import type pino from 'pino'

// ─────────────────────────────────────────────────────────────
// Scheduler — runs the daily update via node-cron
// ─────────────────────────────────────────────────────────────

export function scheduleDailyUpdate(
  task: () => Promise<void>,
  logger: pino.Logger
): void {
  const cronExpr = process.env.SCHEDULE_CRON ?? '0 21 * * *'
  const timezone = process.env.TIMEZONE ?? 'Europe/Zurich'

  logger.info({ cronExpr, timezone }, 'Scheduling daily update')

  cron.schedule(cronExpr, async () => {
    logger.info('⏰ Cron trigger fired — running daily update')
    try {
      await task()
      logger.info('Daily update completed successfully')
    } catch (err) {
      logger.error({ err }, 'Daily update failed')
    }
  }, {
    timezone,
  })
}