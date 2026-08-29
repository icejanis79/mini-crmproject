import { NextResponse } from 'next/server';
import { getGoogleSheetsClient } from '@/lib/google-sheets';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1whBPqoOnzAOvZI8Pbj1sToI-1Zxv8TBFgAiABN9Z9ks';

export async function GET() {
  try {
    const sheets = await getGoogleSheetsClient();
    const res = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheetTitles = res.data.sheets?.map((s: any) => s.properties?.title) || [];
    
    const requiredSheets = ['Customer_Base', 'Dashboard_Quotes', 'PriceList'];
    const requests: any[] = [];

    for (const title of requiredSheets) {
      if (!sheetTitles.includes(title)) {
        requests.push({
          addSheet: {
            properties: { title }
          }
        });
      }
    }

    if (requests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: { requests }
      });
      
      // Initialize headers
      if (!sheetTitles.includes('Customer_Base')) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Customer_Base!A1:H1',
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [['Company_Name', 'Contact_Person', 'Email', 'Phone', 'Latest_Quotation_No', 'Latest_Quotation_Date', 'Total_Quotes', 'Status']] }
        });
      }
      
      if (!sheetTitles.includes('Dashboard_Quotes')) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Dashboard_Quotes!A1:G1',
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [['QCH_ID', 'Company', 'Amount', 'Status', 'Payment_Method', 'Credit_Days', 'Date']] }
        });
      }
    }

    return NextResponse.json({ success: true, sheetTitles, created: requests.length > 0 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 200 });
  }
}
