/**
 * Strict Knockout Scoring Rule
 * ────────────────────────────
 *
 * For knockout (elimination) matches: points are awarded ONLY if BOTH the
 * predicted winning slot AND predicted winning team match the actual results.
 *
 * This is NOT like group stages where any correct winner prediction scores.
 * In knockout rounds, the bracket path matters.
 *
 * Examples (match = 3 points):
 *
 *  Actual: Winner Slot = A, Winner Team = Argentina
 *
 *  Predicted: Slot = A, Team = Argentina  → 3 pts  ✅ (same slot + same team)
 *  Predicted: Slot = A, Team = Brazil     → 0 pts  ❌ (slot correct, team wrong)
 *  Predicted: Slot = B, Team = Argentina  → 0 pts  ❌ (slot wrong, team correct)
 *  Predicted: Slot = B, Team = Germany   → 0 pts  ❌ (both wrong)
 *
 * Rationale:
 *  In knockout rounds, you're picking not just the winner but also the PATH.
 *  If you predicted Argentina beats Germany in the final and Brazil makes it instead,
 *  you predicted the wrong bracket — no points, even though you picked the right team.
 *
 * Family-friendly explanation to include in bot messages:
 *
 *  "For knockout matches, it is not enough to guess the winning team.
 *   The team must win from the same bracket slot/path that you predicted.
 *   Same team + same slot = points. Otherwise, zero."
 *
 * Implementation:
 *  Use calculateKnockoutPoints() — do not try to score knockout predictions
 *  with a simple "did you pick the winner" check.
 */

export interface KnockoutScoringInput {
  predictedWinnerSlot: 'A' | 'B' | null
  predictedWinnerTeam: string
  actualWinnerSlot: 'A' | 'B'
  actualWinnerTeam: string
  matchPoints: number
}

/**
 * Calculate points for a knockout match prediction.
 * Returns full points if both slot AND team match, otherwise 0.
 */
export function calculateKnockoutPoints(input: KnockoutScoringInput): number {
  const { predictedWinnerSlot, predictedWinnerTeam, actualWinnerSlot, actualWinnerTeam, matchPoints } = input

  if (!predictedWinnerSlot) return 0

  const slotMatch = predictedWinnerSlot === actualWinnerSlot
  const teamMatch = predictedWinnerTeam.toLowerCase() === actualWinnerTeam.toLowerCase()

  if (slotMatch && teamMatch) {
    return matchPoints
  }

  return 0
}

/**
 * Explain why points were or weren't awarded.
 * Useful for debugging and for building verbose scorecards.
 */
export function explainKnockoutResult(
  predictedSlot: 'A' | 'B' | null,
  predictedTeam: string,
  actualSlot: 'A' | 'B',
  actualTeam: string,
  matchPoints: number
): { points: number; reason: string } {
  const result = calculateKnockoutPoints({ predictedWinnerSlot: predictedSlot, predictedWinnerTeam: predictedTeam, actualWinnerSlot: actualSlot, actualWinnerTeam: actualTeam, matchPoints })

  const slotMatch = predictedSlot === actualSlot
  const teamMatch = predictedTeam.toLowerCase() === actualTeam.toLowerCase()

  if (result > 0) {
    return { points: result, reason: `Correct: ${predictedTeam} won from slot ${predictedSlot}. Full ${matchPoints} points.` }
  }

  let reason = 'No points — '
  if (!predictedSlot) {
    reason += 'no prediction made for this match.'
  } else if (!slotMatch && !teamMatch) {
    reason += `you predicted ${predictedTeam} from slot ${predictedSlot}, but ${actualTeam} won from slot ${actualSlot}.`
  } else if (!slotMatch) {
    reason += `you predicted slot ${predictedSlot} but the winner came from slot ${actualSlot}. Team was correct.`
  } else if (!teamMatch) {
    reason += `you predicted ${predictedTeam} but the winner was ${actualTeam}. Slot was correct.`
  }

  return { points: result, reason }
}