# Scoring Rules

## The Strict Knockout Rule

**For knockout (elimination) matches: points are awarded ONLY if BOTH the predicted winning slot AND predicted winning team match the actual results.**

### Why This Rule Exists

In group stage matches, you pick a winner (or draw) — the bracket path is predetermined.
In knockout rounds, you're picking both the winner AND the bracket path they take to get there.

This means:
- Group stage: pick the winning team → points if correct
- Knockout stage: pick the winning team FROM THE SAME BRACKET SLOT → points only if both match

### Examples (3 points per knockout match)

**Actual result:** Argentina wins the match → Winner Slot = A, Winner Team = Argentina

| Prediction | Slot | Team | Points | Reason |
|---|---|---|---|---|
| Argentina wins | A | Argentina | **3 pts** ✅ | Same slot + same team |
| Argentina wins | A | Brazil | **0 pts** ❌ | Slot correct, team wrong |
| Argentina wins | B | Argentina | **0 pts** ❌ | Team correct, slot wrong |
| Argentina wins | B | Germany | **0 pts** ❌ | Both wrong |
| No prediction made | — | — | **0 pts** | No prediction |

### How Slot Works in Knockout Rounds

Knockout match slots represent bracket positions, not team names. Examples:

- Round of 16: `1A` vs `2B` (winner of group A's 1st vs runner-up of group B)
- Quarter final: `W49` vs `W50` (winner of match 49 vs winner of match 50)
- Final: `W61` vs `W62`

When you predict slot A in the final, you're saying: "the team from the W61 side of the bracket will win."
If the team from W62 side wins instead, you get 0 points even if you picked the right team.

### Family-Friendly Explanation

> "For knockout matches, it is not enough to guess the winning team.
> The team must win from the same bracket slot/path that you predicted.
> Same team + same slot = points. Otherwise, zero."

### Implementation

```typescript
import { calculateKnockoutPoints } from '../src/scoring/knockoutScoring'

const result = calculateKnockoutPoints({
  predictedWinnerSlot: 'A',       // 'A' or 'B'
  predictedWinnerTeam: 'Argentina',
  actualWinnerSlot: 'A',
  actualWinnerTeam: 'Argentina',
  matchPoints: 3,
})
// result === 3
```

### Testing

Run: `npm test`

Tests cover:
- Same slot + same team → full points
- Same slot + wrong team → 0 points
- Wrong slot + same team → 0 points
- Both wrong → 0 points
- No prediction → 0 points
- Case-insensitive team comparison