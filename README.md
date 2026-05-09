# World Cup WhatsApp Pool Bot

A family WhatsApp bot that reads pool standings from Google Sheets and posts daily World Cup updates to a WhatsApp group.

---

## What It Does

- Reads the `Leaderboard` and `Bot_Daily_View` tabs from a Google Sheet
- Generates a fun, personality-driven daily update message
- Sends it to a configured WhatsApp group after match days
- Runs on a schedule (default: 9pm Zurich time)

## What It Does NOT Do

- No prediction input UI
- No individual DMs
- No interactive bot commands
- No database
- No web app

The Google Sheet is the source of truth. The bot only reads and sends.

---

## Scoring Rules

For **group stage** matches: correct winner = points (as defined per match).

For **knockout (elimination) matches**: points awarded **ONLY** if BOTH the predicted winning slot AND the predicted winning team match the actual result.

Example — actual result: Argentina wins from slot A:

| Prediction | Slot | Team | Points |
|---|---|---|---|
| Argentina wins | A | Argentina | **3 pts** ✅ |
| Argentina wins | A | Brazil | **0 pts** ❌ (slot correct, team wrong) |
| Argentina wins | B | Argentina | **0 pts** ❌ (team correct, slot wrong) |
| Argentina wins | B | Germany | **0 pts** ❌ (both wrong) |

> "For knockout matches, it is not enough to guess the winning team. The team must win from the same bracket slot/path that you predicted. Same team + same slot = points. Otherwise, zero."

See `docs/scoring-rules.md` for full explanation.

---

## Setup

### 1. Google Sheet

The sheet needs these tabs (see `docs/google-sheet-structure.md` for column details):

- `Leaderboard` — current standings (Rank, Player, Nickname, Points, etc.)
- `Bot_Daily_View` — bot-ready facts (leader name, biggest climber, disaster of the day, etc.)
- `Matches` — match list with results and points per match
- `Players` — player list

Share the sheet with your Google Cloud service account email as viewer.

### 2. Environment

```bash
cp .env.example .env
# Fill in your values

GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
WHATSAPP_GROUP_NAME=Family World Cup Pool
BOT_TONE=spicy_latin
DRY_RUN=true   # set to false when ready to send
```

### 3. WhatsApp

On first run with `DRY_RUN=false`, the bot prints a QR code in the terminal. Scan it with your **secondary WhatsApp number** (not your personal one).

Session is persisted locally — no QR needed after first run.

### 4. Run

```bash
npm install
npm run build

# Test without sending
npm run dry-run

# Send a manual update
npm run send:update

# Start the scheduler
npm run dev
```

---

## Production (PM2)

```bash
pm2 start dist/index.js --name world-cup-bot
pm2 logs world-cup-bot
pm2 restart world-cup-bot
```

---

## Operational Safety

⚠️ **Read before running:**

- Uses `whatsapp-web.js` — unofficial WhatsApp automation. **Always use a secondary phone number.**
- Do not send high-volume or business messages
- Group updates only — no individual DMs
- Do not add interactive commands in v1
- This is for a private family pool

---

## Project Structure

```
world-cup-whatsapp-bot/
├── src/
│   ├── index.ts              ← main entry, scheduler
│   ├── config.ts             ← env vars
│   ├── sheets/               ← Google Sheets reading
│   │   ├── types.ts
│   │   ├── googleSheetsClient.ts
│   │   ├── readLeaderboard.ts
│   │   └── readBotDailyView.ts
│   ├── scoring/              ← knockout scoring logic
│   │   ├── knockoutScoring.ts
│   │   └── knockoutScoring.test.ts
│   ├── messages/             ← message generation
│   │   ├── generateDailyUpdate.ts
│   │   └── types.ts
│   ├── whatsapp/            ← WhatsApp delivery
│   │   ├── whatsappClient.ts
│   │   └── sendToGroup.ts
│   ├── scheduler/
│   │   └── scheduleDailyUpdate.ts
│   └── cli/
│       └── sendUpdate.ts     ← manual send / dry-run
├── docs/
│   ├── google-sheet-structure.md
│   ├── scoring-rules.md
│   └── deployment.md
├── package.json
└── tsconfig.json
```

---

## Tones

Configure `BOT_TONE` in `.env`:

| Tone | Style |
|---|---|
| `friendly` | Clean and simple |
| `spicy_latin` | Spanish mixes, "La tabla está spicy 🌶️" |
| `football_pundit` | Formal match report style |
| `telenovela` | Dramatic "El drama continúa" |
| `roast_mode` | Brutally honest accountability post |

---

## Commands

```bash
npm run dev         # start scheduler (run forever)
npm run send:update # manual send now
npm run dry-run     # print message without sending
npm run test         # run tests (including knockout scoring)
npm run build        # compile TypeScript
```