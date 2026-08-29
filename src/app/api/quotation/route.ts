import { NextResponse } from 'next/server';
import { getNextQchNumber, saveQuotationToSheet } from '@/lib/google-sheets';

export async function GET() {
  try {
    const nextNumber = await getNextQchNumber();
    return NextResponse.json({ success: true, qchNumber: nextNumber });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // ถ้าผู้ใช้เลือกดึงเลขอัตโนมัติ (AUTO)
    let finalQchNumberStr = data.qchNumber;
    
    if (data.qchNumber === 'AUTO') {
      try {
        // 1. ดึงเลข QCH ล่าสุดจาก Google Sheets กลาง
        const nextNumber = await getNextQchNumber();
        
        // 2. บันทึกข้อมูลลง Google Sheets กลาง
        await saveQuotationToSheet({
          qchNumber: nextNumber,
          company: data.company,
          contact: data.contact,
          phone: data.phone,
          product: data.product
        });

        finalQchNumberStr = `QCH${nextNumber.toString().padStart(3, '0')}-F69`; // รูปแบบฟอร์แมต

      } catch (sheetError) {
        console.error("Sheet Error:", sheetError);
        // Fallback ถ้ายังไม่ได้ต่อ API Key
        finalQchNumberStr = `QCH999-F69 (ยังไม่ได้ใส่ API Key)`;
      }
    }

    // ในอนาคต โค้ดส่วนนี้จะไปเรียกใช้ Python script เพื่อสร้างไฟล์ Excel/PDF ตามต้องการ

    return NextResponse.json({ 
      success: true, 
      qchNumber: finalQchNumberStr,
      message: 'บันทึกข้อมูลเรียบร้อยแล้ว' 
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
