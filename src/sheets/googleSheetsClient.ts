import { GoogleAuth } from 'google-auth-library'
import { google, sheets_v4 } from 'googleapis'

// ─────────────────────────────────────────────────────────────
// Google Sheets Client
// ─────────────────────────────────────────────────────────────

let _client: sheets_v4.Sheets | null = null

/**
 * Returns a cached Google Sheets client authenticated via service account.
 * Credentials come from env vars:
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL
 *   GOOGLE_PRIVATE_KEY
 *   GOOGLE_SHEET_ID (also used directly in other functions)
 *
 * Alternatively, if GOOGLE_APPLICATION_CREDENTIALS points to a file,
 * use that. Set one or the other, not both mixed.
 */
export function getSheetsClient(): sheets_v4.Sheets {
  if (_client) return _client

  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL

  if (!privateKey || !serviceAccountEmail) {
    throw new Error(
      'Missing Google credentials. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in .env'
    )
  }

  const auth = new google.auth.JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })

  _client = google.sheets({ version: 'v4', auth })
  return _client
}

/**
 * Read a range of cells from a Google Sheet.
 * Range format: "SheetName!A1:Z100"
 */
export async function readSheetRange(range: string): Promise<(string | null)[][]> {
  const sheetId = process.env.GOOGLE_SHEET_ID
  if (!sheetId) throw new Error('Missing GOOGLE_SHEET_ID')

  const sheets = getSheetsClient()
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  })

  return response.data.values ?? []
}

/**
 * Read an entire tab and return as raw rows.
 * First row is treated as headers.
 */
export async function readTab(tabName: string): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  const data = await readSheetRange(`${tabName}!A1:Z1000`)
  if (data.length < 1) return { headers: [], rows: [] }

  const headers = data[0].map(h => String(h ?? '').trim())
  const rows = data.slice(1).map(row => {
    const obj: Record<string, string> = {}
    headers.forEach((header, i) => {
      obj[header] = row[i] ?? ''
    })
    return obj
  })

  return { headers, rows }
}