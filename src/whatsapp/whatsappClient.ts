import { Client, LocalAuth } from 'whatsapp-web.js'
import pino from 'pino'

// ─────────────────────────────────────────────────────────────
// WhatsApp Client — persistent session via LocalAuth
// ─────────────────────────────────────────────────────────────

let _client: Client | null = null
let _ready = false

export function getWhatsAppClient(logger: pino.Logger): Client {
  if (_client && _ready) return _client

  const sessionPath = process.env.WHATSAPP_SESSION_PATH ?? './whatsapp-session'

  _client = new Client({
    authStrategy: new LocalAuth({
      dataPath: sessionPath,
    }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  })

  _client.on('qr', (qr: string) => {
    logger.info('📱 WhatsApp QR code received — scan with your secondary number:')
    // Print QR as terminal-friendly ASCII
    logger.info(qr)
  })

  _client.on('authenticated', () => {
    logger.info('✅ WhatsApp authenticated — session saved')
  })

  _client.on('auth_failure', (msg: string) => {
    logger.error({ msg }, '❌ WhatsApp auth failure')
    throw new Error(`WhatsApp auth failed: ${msg}`)
  })

  _client.on('ready', () => {
    logger.info('✅ WhatsApp client ready')
    _ready = true
  })

  _client.on('disconnected', (reason: string) => {
    logger.warn({ reason }, 'WhatsApp disconnected')
    _ready = false
  })

  return _client
}

export async function waitForWhatsAppReady(logger: pino.Logger): Promise<Client> {
  const client = getWhatsAppClient(logger)

  return new Promise((resolve, reject) => {
    if (_ready) {
      resolve(client)
      return
    }

    const timeout = setTimeout(() => {
      reject(new Error('WhatsApp client ready timeout (60s)'))
    }, 60_000)

    client.on('ready', () => {
      clearTimeout(timeout)
      resolve(client)
    })

    client.on('auth_failure', (msg: string) => {
      clearTimeout(timeout)
      reject(new Error(`WhatsApp auth failed: ${msg}`))
    })

    // Start if not already started
    if (!_client) {
      logger.info('Starting WhatsApp client...')
    }
  })
}