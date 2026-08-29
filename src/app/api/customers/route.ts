import { NextResponse } from 'next/server';
import { getGoogleSheetsClient } from '@/lib/google-sheets';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1e3aIEZ_ZIUg23KXjhXqVRLZ5B9N4hKGXCttn9s2ub_A';
const TAB_NAME = 'Customer_Base';

export async function GET() {
  try {
    const sheets = await getGoogleSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TAB_NAME}!A:H`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return NextResponse.json([]);
    }

    const customers = rows.slice(1).map((row, index) => ({
      id: index,
      company: row[1] || '',
      contact: row[2] || '',
      email: row[3] || '',
      phone: row[4] || '',
      latestQuote: row[6] || '',
      latestDate: row[7] || '',
      totalQuotes: parseInt(row[8] || '0', 10),
      status: row[9] || ''
    })).filter(c => c.company);

    return NextResponse.json(customers);
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
