import { google } from 'googleapis';

// ฟังก์ชันสำหรับสร้าง Client เชื่อมต่อ Google Sheets
export async function getGoogleSheetsClient() {
  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  // ตรวจสอบว่าใส่ API Key หรือยัง
  if (!credentials.client_email || !credentials.private_key) {
    throw new Error("Missing Google API Credentials");
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const authClient = await auth.getClient();
  return google.sheets({ version: 'v4', auth: authClient as any });
}

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1whBPqoOnzAOvZI8Pbj1sToI-1Zxv8TBFgAiABN9Z9ks';
const SHEET_NAME = 'Sheet1'; // สมมติว่าหน้าแรกชื่อ Sheet1

// 1. ฟังก์ชันดึงเลข QCH ล่าสุด
export async function getNextQchNumber() {
  try {
    const sheets = await getGoogleSheetsClient();
    
    // ดึงข้อมูลคอลัมน์ A ทั้งหมด เพื่อหาตัวเลขสุดท้าย
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `A:A`,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return 1; // ถ้ายาวงเปล่า เริ่มที่ 1
    }

    let lastNumber = 0;
    
    // หาเลขบรรทัดสุดท้ายที่มีรูปแบบของ QCH (เช่น QCH408-F69) หรือตัวเลขปกติ
    for (let i = rows.length - 1; i >= 0; i--) {
      if (!rows[i] || !rows[i][0]) continue;
      
      const val = rows[i][0].toString().trim();
      
      // ถ้าเป็นรูปแบบ QCH408-F69
      const match = val.match(/^QCH(\d+)/i);
      if (match) {
        lastNumber = parseInt(match[1], 10);
        break;
      }
      
      // ถ้าเป็นตัวเลขโดดๆ
      const num = parseInt(val, 10);
      if (!isNaN(num) && num > 0) {
        lastNumber = num;
        break;
      }
    }

    if (lastNumber === 0) return 1;
    return lastNumber + 1;
  } catch (error) {
    console.error('Error fetching QCH number:', error);
    throw error;
  }
}

// 2. ฟังก์ชันบันทึกข้อมูลลง Sheet กลาง
export async function saveQuotationToSheet(data: {
  qchNumber: number;
  company: string;
  contact: string;
  phone: string;
  product: string;
}) {
  try {
    const sheets = await getGoogleSheetsClient();
    
    // จัดรูปแบบวันที่ เช่น 29-8-2026
    const today = new Date();
    const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;

    // โครงสร้างข้อมูลตามภาพที่คุณส่งมา
    // คอลัมน์: A (QCH), B (Date), C (Company), D (Contact), E (Phone), F (Product)
    const rowData = [
      data.qchNumber,
      dateStr,
      data.company,
      data.contact || '',
      data.phone || '',
      data.product || ''
    ];

    // บันทึกต่อท้ายบรรทัดล่างสุด (Append)
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `A:F`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    });

    return true;
  } catch (error) {
    console.error('Error saving to sheet:', error);
    throw error;
  }
}
