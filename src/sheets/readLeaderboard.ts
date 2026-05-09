import { readTab } from './googleSheetsClient'
import type { LeaderboardRow } from './types'

// ─────────────────────────────────────────────────────────────
// Leaderboard Reader
// ─────────────────────────────────────────────────────────────

const REQUIRED_COLUMNS = ['Rank', 'Player', 'Nickname', 'Points', 'Previous Rank', 'Movement', 'Daily Points', 'Correct Picks', 'Wrong Picks']

export async function readLeaderboard(): Promise<LeaderboardRow[]> {
  const { headers, rows } = await readTab('Leaderboard')

  for (const col of REQUIRED_COLUMNS) {
    if (!headers.includes(col)) {
      throw new Error(`Leaderboard tab is missing required column: "${col}"`)
    }
  }

  return rows.map(row => ({
    rank: parseInt(String(row['Rank'] ?? '0'), 10),
    player: String(row['Player'] ?? '').trim(),
    nickname: String(row['Nickname'] ?? '').trim(),
    points: parseInt(String(row['Points'] ?? '0'), 10),
    previousRank: row['Previous Rank'] ? parseInt(String(row['Previous Rank']), 10) : null,
    movement: row['Movement'] ? parseInt(String(row['Movement']), 10) : null,
    dailyPoints: parseInt(String(row['Daily Points'] ?? '0'), 10),
    correctPicks: parseInt(String(row['Correct Picks'] ?? '0'), 10),
    wrongPicks: parseInt(String(row['Wrong Picks'] ?? '0'), 10),
  }))
}