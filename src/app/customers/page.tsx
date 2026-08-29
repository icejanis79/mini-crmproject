import { getGoogleSheetsClient } from '@/lib/google-sheets';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1e3aIEZ_ZIUg23KXjhXqVRLZ5B9N4hKGXCttn9s2ub_A';

export default async function CustomersPage() {
  let customers: any[] = [];
  try {
    const sheets = await getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Customer_Base!A:H',
    });
    const rows = response.data.values || [];
    customers = rows.slice(1).map((row, id) => ({
      id,
      company: row[0] || '',
      contact: row[1] || '',
      email: row[2] || '',
      phone: row[3] || '',
      latestQuote: row[4] || '',
      latestDate: row[5] || '',
      status: row[7] || ''
    })).filter(c => c.company);
  } catch (error) {
    console.error("Failed to load customers from Google Sheets", error);
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-900">👥 ฐานลูกค้า (Customer Base)</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
          + เพิ่มลูกค้าใหม่
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-x-auto text-gray-900">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">บริษัท</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ผู้ติดต่อ</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">อีเมล / เบอร์โทร</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ใบเสนอราคาล่าสุด</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">สถานะ</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">จัดการ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-sm">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-bold text-gray-900">{c.company}</td>
                <td className="px-6 py-4 text-gray-900">{c.contact !== '-' ? c.contact : 'ไม่ระบุ'}</td>
                <td className="px-6 py-4">
                  <div className="text-gray-900 font-medium">{c.email}</div>
                  <div className="text-gray-600">{c.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{c.latestQuote}</div>
                  <div className="text-xs text-gray-600">{c.latestDate}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${c.status === 'พร้อมส่ง' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {c.status || 'รอติดตาม'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <a href={`https://mail.zoho.com/zm/#compose?to=${c.email}`} target="_blank" rel="noopener noreferrer" className="text-indigo-700 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded border border-indigo-200 shadow-sm font-bold">📧 Zoho Email</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
