import { NextResponse } from 'next/server';
import { getGoogleSheetsClient } from '@/lib/google-sheets';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1e3aIEZ_ZIUg23KXjhXqVRLZ5B9N4hKGXCttn9s2ub_A';
const TAB_NAME = 'Customer_Base';

export async function GET() {
  try {
    const sheets = await getGoogleSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TAB_NAME}!A:K`,
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

export async function POST(request: Request) {
  try {
    const { action, payload } = await request.json();
    const sheets = await getGoogleSheetsClient();

    if (action === 'UPSERT_CUSTOMER') {
      // 1. Fetch current rows to check if company exists
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${TAB_NAME}!A:K`,
      });
      
      const rows = response.data.values || [];
      const companyIndex = rows.findIndex(row => row[1] === payload.company);

      if (companyIndex !== -1) {
        // Exists: Update Latest Quote, Date, and increment Total Quotes
        const actualRow = companyIndex + 1; // 1-indexed
        const currentTotal = parseInt(rows[companyIndex][8] || '0', 10);
        
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${TAB_NAME}!G${actualRow}:J${actualRow}`, // G=Latest Quote, H=Date, I=Total Quotes, J=Status
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[
              payload.latestQuote,
              payload.latestDate,
              isNaN(currentTotal) ? 1 : currentTotal + 1,
              payload.status || 'รอติดตาม'
            ]]
          }
        });
      } else {
        // Doesn't exist: Append new customer
        await sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEET_ID,
          range: `${TAB_NAME}!A:K`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[
              '', // CUS Code
              payload.company,
              payload.contact || '-',
              payload.email || '',
              payload.phone || '',
              'จณิสตา วิจิตร (Janista)', // Sales Rep
              payload.latestQuote,
              payload.latestDate,
              1, // Total quotes
              payload.status || 'รอติดตาม',
              '' // Revise Notes
            ]]
          }
        });
      }
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
