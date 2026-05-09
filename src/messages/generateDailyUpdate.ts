import type { BotTone, DailyUpdateInput, LeaderboardRow, BotDailyView } from '../sheets/types'

// ─────────────────────────────────────────────────────────────
// Message Templates — per tone
// ─────────────────────────────────────────────────────────────

interface TemplateSections {
  title: string
  leaderboard: string
  climber: string
  disaster: string
  lastPlace: string
  matchesToday: string
  matchesTomorrow: string
  closing: string
}

const TEMPLATES: Record<BotTone, TemplateSections> = {
  friendly: {
    title: '🏆 WORLD CUP POOL UPDATE 🏆',
    leaderboard: '',
    climber: '',
    disaster: '',
    lastPlace: '',
    matchesToday: '',
    matchesTomorrow: '',
    closing: 'Remember: it\'s just for fun! ⚽',
  },
  spicy_latin: {
    title: '🏆 UPDATE DEL MUNDIAL FAMILIAR 🏆',
    leaderboard: '',
    climber: '',
    disaster: '',
    lastPlace: '',
    matchesToday: '',
    matchesTomorrow: '',
    closing: 'Remember: screenshots are forever.',
  },
  football_pundit: {
    title: '📊 WORLD CUP POOL — MATCHDAY REPORT 📊',
    leaderboard: '',
    climber: '',
    disaster: '',
    lastPlace: '',
    matchesToday: '',
    matchesTomorrow: '',
    closing: 'Full standings available in the sheet.',
  },
  telenovela: {
    title: '🏆 EL DRAMA DEL MUNDIAL CONTINÚA 🏆',
    leaderboard: '',
    climber: '',
    disaster: '',
    lastPlace: '',
    matchesToday: '',
    matchesTomorrow: '',
    closing: 'Todo puede pasar. Esto apenas comienza.',
  },
  roast_mode: {
    title: '🏆 WORLD CUP POOL — ACCOUNTABILITY POST 🏆',
    leaderboard: '',
    climber: '',
    disaster: '',
    lastPlace: '',
    matchesToday: '',
    matchesTomorrow: '',
    closing: 'No excuses. The sheet does not lie.',
  },
}

// ─────────────────────────────────────────────────────────────
// Emoji helpers
// ─────────────────────────────────────────────────────────────

function rankEmoji(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `${rank}.`
}

function movementArrow(movement: number | null): string {
  if (movement === null) return ''
  if (movement > 0) return ' ↑'
  if (movement < 0) return ' ↓'
  return ' →'
}

// ─────────────────────────────────────────────────────────────
// Partial generators (called per section)
// ─────────────────────────────────────────────────────────────

function buildLeaderboard(rows: LeaderboardRow[]): string {
  const top = rows.slice(0, 5)
  const lines = top.map(r =>
    `${rankEmoji(r.rank)} ${r.nickname} — ${r.points} pts${movementArrow(r.movement)}`
  )
  return lines.join('\n')
}

function buildClimber(view: BotDailyView): string {
  const name = view.get('biggest_climber')
  const movement = view.get('biggest_climber_movement')
  if (!name) return ''
  return `🚀 Climber of the day:\n${name} subió ${movement} puestos. No one understands how. Investigation pending.`
}

function buildDisaster(view: BotDailyView): string {
  const disaster = view.get('disaster_of_day')
  const reason = view.get('disaster_reason')
  if (!disaster) return ''
  return `💀 Disasterclass:\n${disaster} predicted 0 of 4 correctly today. Bold strategy, terrible execution.`
}

function buildLastPlace(view: BotDailyView): string {
  const last = view.get('last_place')
  const points = view.get('last_place_points')
  if (!last) return ''
  return `👀 Last place watch:\n${last} remains emotionally attached to the basement with ${points} pts.`
}

function buildMatches(label: string, matches: { slotA: string; slotB: string }[]): string {
  if (matches.length === 0) return ''
  const lines = matches.map(m => `⚽ ${m.slotA} vs ${m.slotB}`)
  return `${label}:\n${lines.join('\n')}`
}

// ─────────────────────────────────────────────────────────────
// Main message generator
// ─────────────────────────────────────────────────────────────

export function generateDailyUpdate(input: DailyUpdateInput, tone?: BotTone): string {
  const selectedTone = (tone ?? (process.env.BOT_TONE as BotTone) ?? 'spicy_latin') as BotTone
  const t = TEMPLATES[selectedTone]

  const parts: string[] = []

  // Title
  parts.push(t.title)
  parts.push('')

  // Leaderboard intro
  if (selectedTone === 'spicy_latin' || selectedTone === 'telenovela') {
    parts.push('La tabla está oficialmente spicy 🌶️')
  } else if (selectedTone === 'roast_mode') {
    parts.push('No mercy. Here are the facts.')
  } else if (selectedTone === 'friendly') {
    parts.push('Here\'s where things stand:')
  } else {
    parts.push('Current standings:')
  }
  parts.push('')
  parts.push(buildLeaderboard(input.leaderboard))
  parts.push('')

  // Climber
  const climber = buildClimber(input.botDailyView)
  if (climber) {
    parts.push(climber)
    parts.push('')
  }

  // Disaster
  const disaster = buildDisaster(input.botDailyView)
  if (disaster) {
    parts.push(disaster)
    parts.push('')
  }

  // Last place
  const lastPlace = buildLastPlace(input.botDailyView)
  if (lastPlace) {
    parts.push(lastPlace)
    parts.push('')
  }

  // Matches
  const todayMatches = input.matchesToday ?? []
  const tomorrowMatches = input.matchesTomorrow ?? []
  if (todayMatches.length > 0) {
    parts.push(buildMatches('⚽ Today', todayMatches))
    parts.push('')
  }
  if (tomorrowMatches.length > 0) {
    parts.push(buildMatches('⚽ Tomorrow', tomorrowMatches))
    parts.push('')
  }

  // Closing
  parts.push(t.closing)

  const message = parts.join('\n')

  // Hard cap at 2000 chars (WhatsApp limit is 65536 but this is for readability)
  if (message.length > 2000) {
    return message.slice(0, 1990) + '...'
  }

  return message
}