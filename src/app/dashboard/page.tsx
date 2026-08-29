'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [data, setData] = useState({ quotes: [], monthlyGoal: 100000 });
  const [loading, setLoading] = useState(true);

  const fetchDb = async () => {
    const res = await fetch('/api/dashboard');
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => {
    fetchDb();
  }, []);

  const handleMarkClosed = async (id: string) => {
    const isCredit = confirm('ลูกค้าชำระเป็นเครดิตหรือไม่? \n(กด OK = เครดิต, Cancel = เงินสด)');
    let creditDays = 0;
    if (isCredit) {
      const days = prompt('ให้เครดิตกี่วัน? (เช่น 30, 60)', '30');
      creditDays = parseInt(days || '30', 10);
    }

    await fetch('/api/dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE_STATUS',
        payload: {
          id,
          status: 'closed',
          paymentMethod: isCredit ? 'credit' : 'cash',
          creditDays
        }
      })
    });
    fetchDb();
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const closedQuotes = data.quotes.filter((q: any) => q.status === 'closed');
  const pendingQuotes = data.quotes.filter((q: any) => q.status === 'pending');
  const creditQuotes = closedQuotes.filter((q: any) => q.paymentMethod === 'credit');

  const currentMonthAmount = closedQuotes.reduce((sum: number, q: any) => sum + q.amount, 0);
  const goalProgress = Math.min((currentMonthAmount / data.monthlyGoal) * 100, 100);

  return (
    <div className="p-8 text-gray-900 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">📊 แดชบอร์ด (Dashboard)</h1>

      {/* Goal Section */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-100">
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-xl font-bold text-gray-800">เป้าหมายยอดขายเดือนนี้: {data.monthlyGoal.toLocaleString()} บาท</h2>
          <span className="text-2xl font-bold text-blue-600">{currentMonthAmount.toLocaleString()} ฿</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-6 mb-4">
          <div 
            className={`h-6 rounded-full ${goalProgress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
            style={{ width: `${goalProgress}%` }}
          ></div>
        </div>
        
        {currentMonthAmount < data.monthlyGoal ? (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-bold text-yellow-800">⚠️ ยอดยังไม่ถึงเป้าหมาย 1 แสนบาท (ขาดอีก {(data.monthlyGoal - currentMonthAmount).toLocaleString()} บาท)</p>
              <p className="text-sm text-yellow-700 mt-1">แนะนำ: เข้าไปเช็คฐานลูกค้าเก่าที่เคยซื้อในเดือนนี้ เพื่อส่งอีเมล (Zoho) ตามงานอีกทาง</p>
            </div>
            <a href="/customers" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-4 py-2 rounded shadow transition">
              👥 ไปที่ฐานลูกค้า
            </a>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <p className="font-bold text-green-800">🎉 ยินดีด้วย! ยอดขายเดือนนี้ทะลุเป้า 1 แสนบาทแล้ว</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Quotes */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">⏳ รายการรอลูกค้าสรุป (Pending)</h2>
          {pendingQuotes.length === 0 ? <p className="text-gray-500">ไม่มีรายการค้าง</p> : (
            <div className="space-y-4">
              {pendingQuotes.map((q: any) => (
                <div key={q.id} className="flex justify-between items-center bg-gray-50 p-3 rounded border">
                  <div>
                    <div className="font-bold text-blue-900">{q.id}</div>
                    <div className="text-sm font-semibold">{q.company}</div>
                    <div className="text-xs text-gray-500">วันที่: {q.date} | ยอด: {q.amount.toLocaleString()} ฿</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleMarkClosed(q.id)}
                      className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded shadow"
                    >
                      ✅ สรุปแล้ว (ปิดยอด)
                    </button>
                    <a 
                      href={`https://mail.zoho.com/zm/#compose`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-center bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-xs font-bold px-3 py-1.5 rounded border border-indigo-200"
                    >
                      📧 Zoho ตามงาน
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Credit Tracking */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">💳 ติดตามการชำระเงิน (เครดิต)</h2>
          {creditQuotes.length === 0 ? <p className="text-gray-500">ไม่มีลูกหนี้เครดิต</p> : (
            <div className="space-y-4">
              {creditQuotes.map((q: any) => {
                // Calculate days passed since quote date
                const quoteDate = new Date(q.date).getTime();
                const now = new Date().getTime();
                const daysPassed = Math.floor((now - quoteDate) / (1000 * 60 * 60 * 24));
                const daysLeft = q.creditDays - daysPassed;
                
                return (
                  <div key={q.id} className="flex justify-between items-center bg-gray-50 p-3 rounded border">
                    <div>
                      <div className="font-bold text-gray-800">{q.company}</div>
                      <div className="text-xs text-gray-500">{q.id} | ยอด: {q.amount.toLocaleString()} ฿</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${daysLeft < 5 ? 'text-red-600' : 'text-orange-500'}`}>
                        เหลือ {daysLeft} วัน
                      </div>
                      <div className="text-[10px] text-gray-500">ครบกำหนด: {q.creditDays} วัน</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
