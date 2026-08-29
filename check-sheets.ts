import { google } from 'googleapis';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkSheets() {
  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() as any });
  const SPREADSHEET_ID = '1e3aIEZ_ZIUg23KXjhXqVRLZ5B9N4hKGXCttn9s2ub_A';

  const res = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheetNames = res.data.sheets?.map(s => s.properties?.title);
  console.log('Current sheets:', sheetNames);
}

checkSheets().catch(console.error);
