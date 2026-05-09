import { describe, it, expect } from 'vitest'
import { calculateKnockoutPoints, explainKnockoutResult } from './knockoutScoring'

describe('Knockout Scoring Rule', () => {

  describe('calculateKnockoutPoints', () => {

    it('awards full points when both slot AND team match', () => {
      const result = calculateKnockoutPoints({
        predictedWinnerSlot: 'A',
        predictedWinnerTeam: 'Argentina',
        actualWinnerSlot: 'A',
        actualWinnerTeam: 'Argentina',
        matchPoints: 3,
      })
      expect(result).toBe(3)
    })

    it('awards 0 when slot is correct but team is wrong', () => {
      const result = calculateKnockoutPoints({
        predictedWinnerSlot: 'A',
        predictedWinnerTeam: 'Brazil',
        actualWinnerSlot: 'A',
        actualWinnerTeam: 'Argentina',
        matchPoints: 3,
      })
      expect(result).toBe(0)
    })

    it('awards 0 when team is correct but slot is wrong', () => {
      const result = calculateKnockoutPoints({
        predictedWinnerSlot: 'B',
        predictedWinnerTeam: 'Argentina',
        actualWinnerSlot: 'A',
        actualWinnerTeam: 'Argentina',
        matchPoints: 3,
      })
      expect(result).toBe(0)
    })

    it('awards 0 when both slot and team are wrong', () => {
      const result = calculateKnockoutPoints({
        predictedWinnerSlot: 'B',
        predictedWinnerTeam: 'Germany',
        actualWinnerSlot: 'A',
        actualWinnerTeam: 'Argentina',
        matchPoints: 3,
      })
      expect(result).toBe(0)
    })

    it('awards 0 when no prediction was made', () => {
      const result = calculateKnockoutPoints({
        predictedWinnerSlot: null,
        predictedWinnerTeam: '',
        actualWinnerSlot: 'A',
        actualWinnerTeam: 'Argentina',
        matchPoints: 3,
      })
      expect(result).toBe(0)
    })

    it('is case-insensitive when comparing team names', () => {
      const result = calculateKnockoutPoints({
        predictedWinnerSlot: 'A',
        predictedWinnerTeam: 'argentina',
        actualWinnerSlot: 'A',
        actualWinnerTeam: 'Argentina',
        matchPoints: 3,
      })
      expect(result).toBe(3)
    })

    it('handles different point values correctly', () => {
      expect(calculateKnockoutPoints({
        predictedWinnerSlot: 'A',
        predictedWinnerTeam: 'Argentina',
        actualWinnerSlot: 'A',
        actualWinnerTeam: 'Argentina',
        matchPoints: 5,
      })).toBe(5)

      expect(calculateKnockoutPoints({
        predictedWinnerSlot: 'A',
        predictedWinnerTeam: 'Argentina',
        actualWinnerSlot: 'A',
        actualWinnerTeam: 'Argentina',
        matchPoints: 1,
      })).toBe(1)
    })
  })

  describe('explainKnockoutResult', () => {

    it('explains correct prediction', () => {
      const { points, reason } = explainKnockoutResult('A', 'Argentina', 'A', 'Argentina', 3)
      expect(points).toBe(3)
      expect(reason).toContain('Correct')
      expect(reason).toContain('slot A')
    })

    it('explains slot-wrong team-correct scenario', () => {
      const { points, reason } = explainKnockoutResult('B', 'Argentina', 'A', 'Argentina', 3)
      expect(points).toBe(0)
      expect(reason).toContain('slot')
      expect(reason).toContain('Team was correct')
    })

    it('explains team-wrong slot-correct scenario', () => {
      const { points, reason } = explainKnockoutResult('A', 'Brazil', 'A', 'Argentina', 3)
      expect(points).toBe(0)
      expect(reason).toContain('predicted Brazil')
      expect(reason).toContain('winner was Argentina')
    })

    it('explains both-wrong scenario', () => {
      const { points, reason } = explainKnockoutResult('B', 'Germany', 'A', 'Argentina', 3)
      expect(points).toBe(0)
      expect(reason.toLowerCase()).toContain('no points')
    })

    it('explains when no prediction was made', () => {
      const { points, reason } = explainKnockoutResult(null as any, '', 'A', 'Argentina', 3)
      expect(points).toBe(0)
      expect(reason).toContain('no prediction made')
    })
  })
})