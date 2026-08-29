import { NextResponse } from 'next/server';
import { getGoogleSheetsClient } from '@/lib/google-sheets';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1e3aIEZ_ZIUg23KXjhXqVRLZ5B9N4hKGXCttn9s2ub_A';
const TAB_NAME = 'Dashboard_Quotes';

export async function GET() {
  try {
    const sheets = await getGoogleSheetsClient();
    
    // Create tab if it doesn't exist (fails silently if it does)
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{ addSheet: { properties: { title: TAB_NAME } } }]
        }
      });
      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${TAB_NAME}!A1:G1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [['QCH_ID', 'Company', 'Amount', 'Status', 'PaymentMethod', 'CreditDays', 'Date']] }
      });
    } catch (e) {
      // Ignore error if sheet already exists or permission denied
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TAB_NAME}!A:G`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return NextResponse.json({ quotes: [], monthlyGoal: 100000 });
    }

    const headers = rows[0];
    const quotes = rows.slice(1).map((row, index) => ({
      rowIndex: index + 2, // 1-indexed + header
      id: row[0] || '',
      company: row[1] || '',
      amount: parseInt(row[2] || '0', 10),
      status: row[3] || 'pending',
      paymentMethod: row[4] || '',
      creditDays: parseInt(row[5] || '0', 10),
      date: row[6] || ''
    })).filter(q => q.id);

    return NextResponse.json({ quotes: quotes.reverse(), monthlyGoal: 100000 });
  } catch (err: any) {
    return NextResponse.json({ quotes: [], monthlyGoal: 100000, error: String(err) });
  }
}

export async function POST(request: Request) {
  try {
    const { action, payload } = await request.json();
    const sheets = await getGoogleSheetsClient();

    if (action === 'ADD_QUOTE') {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${TAB_NAME}!A:G`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [
            [payload.id, payload.company, payload.amount, payload.status, payload.paymentMethod || '', payload.creditDays || '', payload.date]
          ]
        }
      });
    } else if (action === 'UPDATE_STATUS') {
      // Find the row
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${TAB_NAME}!A:G`,
      });
      const rows = response.data.values || [];
      const rowIndex = rows.findIndex(row => row[0] === payload.id);
      
      if (rowIndex !== -1) {
        const actualRow = rowIndex + 1; // 1-indexed
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${TAB_NAME}!D${actualRow}:F${actualRow}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[payload.status, payload.paymentMethod || '', payload.creditDays || '']]
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
