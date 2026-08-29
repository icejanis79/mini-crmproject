import { NextResponse } from 'next/server';
import { getGoogleSheetsClient } from '@/lib/google-sheets';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1whBPqoOnzAOvZI8Pbj1sToI-1Zxv8TBFgAiABN9Z9ks';
const TAB_NAME = 'PriceList';

export async function GET() {
  try {
    const sheets = await getGoogleSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TAB_NAME}!A:F`,
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) {
      return NextResponse.json([]); // Return empty if no data or just headers
    }

    const products = rows.slice(1).map(row => {
      try {
        const extra = row[5] ? JSON.parse(row[5]) : {};
        return {
          id: row[0],
          cat: row[1] || '',
          n: row[2] || '',
          p: row[3] || '',
          price: parseInt(row[4] || '0', 10),
          ...extra
        };
      } catch (e) {
        return null;
      }
    }).filter(p => p !== null);

    return NextResponse.json(products);
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { products } = await request.json();
    const sheets = await getGoogleSheetsClient();

    // Prepare rows
    const headers = ['ID', 'Category', 'Name', 'Packaging', 'Price', 'ExtraJSON'];
    const rows = [headers];

    products.forEach((p: any) => {
      const { id, cat, n, p: packaging, price, ...extra } = p;
      rows.push([
        id || '',
        cat || '',
        n || '',
        packaging || '',
        price || 0,
        JSON.stringify(extra || {})
      ]);
    });

    // Clear existing data
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TAB_NAME}!A:F`,
    });

    // Write new data
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TAB_NAME}!A1:F${rows.length}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: rows }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
