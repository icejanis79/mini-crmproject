const data = [
  { amount: 1979.50, id: 'QCH355-F69', company: 'ห้างหุ้นส่วนจำกัด ทรัพย์สวัสดิ์ เซอร์วิส' },
  { amount: 5403.50, id: 'QCH341-F69rev.2', company: 'รวมเพื่อนวิศวกรรม' },
  { amount: 0, id: 'QCH354-F69', company: 'คุณศรชัย' },
  { amount: 7490.00, id: 'QCH358-F69', company: 'บริษัท ศิวะเทสติ้ง อินสเพ็คชั่น แอนด์ คอนซัลติ้ง' },
  { amount: 5553.30, id: 'QCH374-F69', company: 'บริษัท เอพีพีดี ซัพพลายแอนด์เซอร์วิส จำกัด' },
  { amount: 51360.00, id: 'QCH377-F69', company: 'บริษัท ดวงจิตต์ จำกัด' },
  { amount: 9886.80, id: 'QCH379-F69', company: 'บริษัท ปรีดาพงศ์ กรุ๊ป จำกัด' },
  { amount: 8399.50, id: 'QCH403-F69', company: 'รวมเพื่อนวิศวกรรม' },
  { amount: 5885.00, id: 'QCH385-F69', company: 'บริษัท คราฟท์มอเตอร์ จำกัด' },
  { amount: 3017.40, id: 'QCH375-F69', company: 'บริษัท ดี.เอ็นเตอร์ไพรส์ จำกัด' },
  { amount: 73669.50, id: 'QCH382-F69', company: 'บริษัท เด็กซ์ซอน เทคโนโลยี จำกัด (มหาชน)' },
  { amount: 1005.80, id: 'QCH360-F69', company: 'ฮิโดรเม็ก คอนสตรัคชั่น อิควิปเม้นท์' },
  { amount: 13032.60, id: 'QCH397-F69', company: 'ห้างหุ้นส่วนจำกัด ซี เค เค แอพพลาย' },
  { amount: 3638.00, id: 'QCH388-F69', company: 'บริษัท วี.อาร์.โซลูชั่น แอนด์ เซอร์วิส จำกัด' },
  { amount: 2391.45, id: 'QCH395-F69', company: 'บริษัท เค ยู แอล ฮาร์ดแวร์ จำกัด' },
  { amount: 3252.80, id: 'QCH389-F69', company: 'บริษัท วรการจักรกล อินเตอร์เทรด จำกัด' },
  { amount: 3252.80, id: 'QCH389-F69', company: 'บริษัท วรการจักรกล อินเตอร์เทรด จำกัด' },
  { amount: 11556.00, id: 'QCH381-F69rev.1', company: 'บริษัท เด็กซ์ซอน เทคโนโลยี จำกัด (มหาชน)' },
  { amount: 7126.20, id: 'QCH380-F69', company: 'บริษัท เอ็นทีดับเบิ้ลยู เอ็นจิเนียริ่ง ซัพพลาย จำกัด' },
  { amount: 3424.00, id: 'QCH376-F69', company: 'บริษัท เลอเอลโค่ (ไทยแลนด์) จำกัด' },
  { amount: 214.00, id: 'QCH364-F69', company: 'บริษัท พิชา ยูนิเวอร์แซล จำกัด' },
  { amount: 7126.20, id: 'QCH382-F69rev.1', company: 'บริษัท เด็กซ์ซอน เทคโนโลยี จำกัด (มหาชน)' },
  { amount: 7062.00, id: 'QCH404-F69 Rev.1', company: 'บริษัท อุตสาหกรรมทวีวงษ์ หาดใหญ่ จำกัด' },
  { amount: 6420.00, id: 'QCH383-F69', company: 'บริษัท แพลนท์ อิควิปเม้นท์ จำกัด' },
  { amount: 10807.00, id: 'QCH371-F69', company: 'บริษัท วรการจักรกล อินเตอร์เทรด จำกัด' },
  { amount: 1963.45, id: 'QCH394-F69', company: 'บริษัท เออีซี อิควิปเม้นท์ จำกัด' },
  { amount: 120054.00, id: 'QCH381-F69', company: 'บริษัท เด็กซ์ซอน เทคโนโลยี จำกัด (มหาชน)' },
  { amount: 658.05, id: 'QCH404-F69', company: 'บริษัท อุตสาหกรรมทวีวงษ์ หาดใหญ่ จำกัด' },
  { amount: 6702.48, id: 'QCH387-F69', company: 'บริษัท ไทฟู ดีเวลลอปเม้นท์ เทรดดิ้ง จำกัด' },
  { amount: 8720.50, id: 'QCH369-F69rev.1', company: 'บริษัท เวิลด์ แพคเกจจิ้ง อินดัสตรี้ จำกัด' },
  { amount: 5885.00, id: 'QCH385-F69', company: 'บริษัท คราฟท์มอเตอร์ จำกัด' },
  { amount: 936.25, id: 'QCH378-F69', company: 'บริษัท โบอิน อุตสาหกรรม' },
  { amount: 7074.84, id: 'QCH406-F69', company: 'บริษัท ฮั่วเซ่งฮง เกรทฟู้ดส์พลัส จำกัด' },
  { amount: 3638.00, id: 'QCH388-F69 Rev1', company: 'วีอาร์โซลูชั่น' },
  { amount: 3745.00, id: 'QCH373-F69', company: 'บริษัท วรการจักรกล อินเตอร์เทรด จำกัด' },
  { amount: 3199.30, id: 'QCH396-F69', company: 'บริษัท มัลติเทค ฟู้ด แมนูแฟคเจอริ่ง จำกัด' },
  { amount: 7511.40, id: 'QCH405-F69', company: 'บริษัท ยูซีไอ มีเดีย จำกัด' },
  { amount: 3210.00, id: 'QCH384-F69 Rev.1', company: 'บริษัท มายา เชียงใหม่ จำกัด' },
  { amount: 6420.00, id: 'QCH384-F69', company: 'บริษัท มายา เชียงใหม่ จำกัด' },
  { amount: 0, id: 'QCH369-F69', company: 'บริษัท เวิลด์ แพคเกจจิ้ง อินดัสตรี้ จำกัด' }
];

async function importData() {
  console.log(`Starting import of ${data.length} records...`);
  let successCount = 0;
  for (const item of data) {
    if (!item.id || item.amount === 0) continue;
    
    try {
      const res = await fetch('http://localhost:3000/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_QUOTE',
          payload: {
            id: item.id,
            company: item.company,
            amount: item.amount,
            status: 'pending',
            date: '2026-08-25' // Just fallback to today's month context
          }
        })
      });
      if (res.ok) successCount++;
      else console.error('Failed for', item.id);
    } catch (e) {
      console.error(e);
    }
  }
  console.log(`Done! Imported ${successCount} records.`);
}

importData();
