// ============================================================
// TYPES — shared across all modules
// ============================================================

export interface LeaderboardRow {
  rank: number
  player: string
  nickname: string
  points: number
  previousRank: number | null
  movement: number | null
  dailyPoints: number
  correctPicks: number
  wrongPicks: number
}

export interface BotDailyView {
  fields: Record<string, string>
  get(key: string): string | undefined
}

export interface MatchResult {
  matchId: string
  date: string
  time: string
  stage: string
  group: string
  slotA: string
  slotB: string
  actualTeamA: string
  actualTeamB: string
  actualWinnerSlot: 'A' | 'B'
  actualWinnerTeam: string
  status: 'pending' | 'finished'
  points: number
}

export interface Prediction {
  playerId: string
  player: string
  matchId: string
  predictedWinnerSlot: 'A' | 'B'
  predictedWinnerTeam: string
  pointsWon: number
}

export interface DailyUpdateInput {
  leaderboard: LeaderboardRow[]
  botDailyView: BotDailyView
  matchesToday?: MatchResult[]
  matchesTomorrow?: MatchResult[]
}

export type BotTone =
  | 'friendly'
  | 'spicy_latin'
  | 'football_pundit'
  | 'telenovela'
  | 'roast_mode'