# Deployment Guide

## Local Development

```bash
npm install
cp .env.example .env
# Fill in .env with your values

# Scan QR code (first time only)
npm run dev

# Dry run to test without sending
npm run dry-run

# Manual send
npm run send:update
```

## Production (PM2)

```bash
# Build
npm run build

# Start with PM2
pm2 start dist/index.js --name world-cup-bot

# View logs
pm2 logs world-cup-bot

# Restart after code changes
pm2 restart world-cup-bot
```

Or use an `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'world-cup-bot',
    script: 'dist/index.js',
    watch: false,
    autorestart: true,
    env: {
      NODE_ENV: 'production',
      DRY_RUN: 'false',
    },
  }],
}
```

## WhatsApp Setup (First Time)

1. Use a **secondary WhatsApp number** — not your personal one
2. On first run, the bot prints a QR code in the terminal
3. Open WhatsApp on the secondary phone → Linked Devices → Scan QR
4. Session is saved locally — no need to rescan after restart

## Google Sheets Setup

1. Create a service account in Google Cloud Console
2. Enable Google Sheets API
3. Download the JSON key file
4. Set in `.env`:
   ```
   GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@yyy.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
   ```
5. Share your spreadsheet with the service account email (as at least viewer)

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GOOGLE_SHEET_ID` | Yes | — | Sheet ID from the URL |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Yes | — | Service account email |
| `GOOGLE_PRIVATE_KEY` | Yes | — | Private key from JSON |
| `WHATSAPP_GROUP_NAME` | Yes | Family World Cup Pool | Exact name of the WhatsApp group |
| `SCHEDULE_CRON` | No | `0 21 * * *` | Cron expression (default 9pm) |
| `TIMEZONE` | No | `Europe/Zurich` | IANA timezone |
| `BOT_TONE` | No | `spicy_latin` | Message tone |
| `DRY_RUN` | No | `true` | Set to `false` for real sends |
| `WHATSAPP_SESSION_PATH` | No | `./whatsapp-session` | Where to store WhatsApp session |

## Operational Safety Notes

⚠️ **Read before running in production:**

- This bot uses **whatsapp-web.js** which automates WhatsApp Web — it is **unofficial**
- Meta/WhatsApp may ban numbers using this method. **Always use a secondary number.**
- Keep message volume low — one update per day after matchday results are in
- Do not add interactive commands or respond to user messages in v1
- Do not DM individual players — group updates only
- This is for a **private family pool** — not business or critical messaging

## Troubleshooting

**QR code keeps appearing:**
Delete the `whatsapp-session/` folder and run again.

**Group not found:**
Check the exact group name — WhatsApp group names are case-sensitive.
The bot lists available groups when it can't find the configured one.

**Google Sheets auth errors:**
- Verify the service account email has access to the sheet
- Ensure `GOOGLE_PRIVATE_KEY` has literal `\n` instead of actual newlines in the env var