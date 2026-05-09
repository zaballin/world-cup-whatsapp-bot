import { Client } from 'whatsapp-web.js'
import pino from 'pino'

// ─────────────────────────────────────────────────────────────
// Send message to configured WhatsApp group
// ─────────────────────────────────────────────────────────────

export async function sendToGroup(client: Client, message: string, logger: pino.Logger): Promise<void> {
  const groupName = process.env.WHATSAPP_GROUP_NAME
  if (!groupName) throw new Error('WHATSAPP_GROUP_NAME is not set')

  logger.info({ groupName }, 'Finding WhatsApp group...')

  const chats = await client.getChats()
  const group = chats.find(c => c.isGroup && c.name === groupName)

  if (!group) {
    const groupNames = chats.filter(c => c.isGroup).map(c => c.name)
    logger.error({ groupName, availableGroups: groupNames }, 'WhatsApp group not found')
    throw new Error(
      `Group "${groupName}" not found. Available groups: ${groupNames.join(', ') || 'none'}`
    )
  }

  logger.info({ groupName, groupId: group.id._serialized }, 'Sending message to group...')
  await client.sendMessage(group.id._serialized, message)
  logger.info('Message sent successfully')
}