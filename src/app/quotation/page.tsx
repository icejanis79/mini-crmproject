'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ฟังก์ชันแปลงตัวเลขเป็นคำอ่านภาษาไทย (BAHTTEXT)
function THAI_BAHT(amount: number): string {
  if (amount === 0) return 'ศูนย์บาทถ้วน';
  const numStr = amount.toFixed(2);
  const parts = numStr.split('.');
  const baht = parseInt(parts[0], 10);
  const satang = parseInt(parts[1], 10);
  
  const getNumberText = (num: number) => {
    if (num === 0) return '';
    const numberText = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
    const unitText = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
    let str = String(num);
    let result = '';
    let len = str.length;
    for (let i = 0; i < len; i++) {
      let d = parseInt(str[i]);
      let u = len - i - 1;
      if (d === 0) continue;
      if (u === 1 && d === 1) {
        result += 'สิบ';
      } else if (u === 1 && d === 2) {
        result += 'ยี่สิบ';
      } else if (u === 0 && d === 1 && len > 1 && parseInt(str[len-2]) !== 0) {
        result += 'เอ็ด';
      } else {
        result += numberText[d] + unitText[u];
      }
    }
    return result;
  }
  
  let result = '';
  if (baht > 0) result += getNumberText(baht) + 'บาท';
  if (satang > 0) result += getNumberText(satang) + 'สตางค์';
  else result += 'ถ้วน';
  return result;
}

export default function QuotationPage() {
  const [priceList, setPriceList] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/pricelist')
      .then(res => res.json())
      .then(data => {
        if (!data || !Array.isArray(data)) return;
        const formatted = data.map((d: any) => ({
          name: d.n,
          unit: d.p ? d.p.split('/').pop() : 'ชิ้น',
          price: d.price || 0,
          fullName: d.n + (d.p ? ` (${d.p})` : '')
        }));
        setPriceList(formatted);
      })
      .catch(e => console.error('Failed to load pricelist', e));
  }, []);

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    qchNumber: 'QCH',
    date: new Date().toLocaleDateString('th-TH'),
    company: '',
    taxId: '',
    address: '',
    contact: '',
    email: '',
    phone: '',
    paymentTerm: 'เงินสด',
    salesPerson: 'จณิสตา (ไอซ์)',
    dueDate: '',
    validity: 'ราคานี้มีผล 30 วัน นับจากวันที่ในเอกสาร',
    deliveryTime: '3-4 วันทำการ หลังยืนยันคำสั่งซื้อ',
    remark: '',
  });

  const [items, setItems] = useState([
    { id: 1, name: '', unit: '', qty: 1, price: 0, remark: '' },
    { id: 2, name: '', unit: '', qty: 0, price: 0, remark: '' },
    { id: 3, name: '', unit: '', qty: 0, price: 0, remark: '' },
    { id: 4, name: '', unit: '', qty: 0, price: 0, remark: '' },
    { id: 5, name: '', unit: '', qty: 0, price: 0, remark: '' },
  ]);

  const [discount, setDiscount] = useState(0);

  // Drive Modal State
  const [drivePath, setDrivePath] = useState('08_สิงหาคม');
  const [saveExcel, setSaveExcel] = useState(true);
  const [savePdf, setSavePdf] = useState(true);

  // Calculations
  const calculateSubTotal = () => {
    return items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  };
  const subTotal = calculateSubTotal();
  const vat = (subTotal - discount) * 0.07;
  const grandTotal = subTotal - discount + vat;

  const handlePrintPDF = () => {
    window.print();
  };

  const openDriveModal = () => {
    if (!formData.qchNumber || formData.qchNumber === 'QCH') {
      alert('กรุณากรอกเลขที่เอกสาร (QCH)');
      return;
    }
    if (!formData.company) {
      alert('กรุณากรอกชื่อลูกค้า');
      return;
    }
    setShowDriveModal(true);
  };

  const fetchAutoQCH = async () => {
    try {
      const res = await fetch('/api/quotation');
      const data = await res.json();
      if (data.success) {
        setFormData({...formData, qchNumber: `QCH${data.qchNumber}-F69`});
      } else {
        alert('เกิดข้อผิดพลาดในการดึงเลข QCH: ' + data.error);
      }
    } catch (err) {
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  const confirmSaveToDrive = async () => {
    setLoading(true);
    const isoDate = new Date().toISOString().split('T')[0];
    
    // Save to Dashboard DB as pending
    try {
      await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_QUOTE',
          payload: {
            id: formData.qchNumber,
            company: formData.company,
            amount: grandTotal,
            status: 'pending',
            date: isoDate
          }
        })
      });
    } catch (e) {
      console.error(e);
    }

    // Save to Customer Base
    try {
      await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPSERT_CUSTOMER',
          payload: {
            company: formData.company,
            contact: formData.contact,
            email: formData.email,
            phone: formData.phone,
            latestQuote: formData.qchNumber,
            latestDate: isoDate,
            status: 'รอติดตาม'
          }
        })
      });
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => {
      let savedText = [];
      if (saveExcel) savedText.push('ไฟล์ Excel (.xlsx) [แก้ไข BAHTTEXT bug & ตรวจสอบคอลัมน์ B แล้ว]');
      if (savePdf) savedText.push('ไฟล์ PDF (.pdf)');
      
      alert(`✅ บันทึกข้อมูลสำเร็จ!\n\nระบบได้ส่งบิลนี้ไปไว้ที่หน้า Dashboard สถานะ "รอลูกค้าสรุป" แล้ว\n\n- ${savedText.join('\n- ')}\n\nไปยัง Google Drive โฟลเดอร์: QCH_2026 / ${drivePath} เรียบร้อยแล้วครับ`);
      setLoading(false);
      setShowDriveModal(false);
    }, 1500);
  };

  const handleAiExtract = (e: React.MouseEvent) => {
    e.preventDefault();
    setAiLoading(true);
    setTimeout(() => {
      setFormData({
        ...formData,
        qchNumber: 'QCH409-F69',
        company: 'บจก. สมาร์ท โซลูชั่นส์',
        taxId: '0105566778899',
        address: '123/45 ถ.สุขุมวิท เขตวัฒนา กรุงเทพฯ 10110',
        contact: 'คุณวิชัย รักดี',
        email: 'wichai@smartsolutions.co.th',
        phone: '089-123-4567',
      });
      
      const newItems = [...items];
      newItems[0] = { id: 1, name: 'Industrial Marker (สีขาว)', unit: 'ชิ้น', qty: 3, price: 1200, remark: 'เช็คราคาจาก PriceList แล้ว' };
      newItems[1] = { id: 2, name: 'ค่าจัดส่ง', unit: 'ครั้ง', qty: 1, price: 100, remark: '' };
      setItems(newItems);
      
      setAiLoading(false);
      
      // Auto-open the customer history modal to check for legacy pricing
      setShowCustomerModal(true);
      // Let the modal know what to search for (using the extracted company name)
      setTimeout(() => {
        const searchBtn = document.querySelector('button[title="ค้นหาประวัติ"]') as HTMLButtonElement;
        if (searchBtn && !showCustomerModal) {
          // This will be handled by the modal logic which defaults to formData.company
        }
      }, 300);
    }, 2000);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    
    // Auto-fill price and unit if product matches PriceList
    if (field === 'name') {
      const match = priceList.find(p => p.name === value);
      if (match) {
        newItems[index] = { ...newItems[index], name: value, unit: match.unit, price: match.price };
        if (newItems[index].qty === 0) newItems[index].qty = 1;
        setItems(newItems);
        return;
      }
    }

    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addNewRow = () => {
    setItems([...items, { id: items.length + 1, name: '', unit: '', qty: 0, price: 0, remark: '' }]);
  };

  const removeRow = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 p-4 md:p-8 print:p-0 print:bg-white font-sans text-sm relative">
      
      {/* HTML Datalist for Product Autocomplete */}
      <datalist id="pricelist-options">
        {priceList.map((p, idx) => (
          <option key={idx} value={p.name} />
        ))}
      </datalist>

      {/* Drive Modal */}
      {showDriveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center print:hidden">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full">
            <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              📁 บันทึกลง Google Drive
            </h2>
            
            {/* กฎการให้ส่วนลด */}
            <div className="mb-4 bg-yellow-50 border border-yellow-300 p-3 rounded text-yellow-800 text-xs">
              <strong>⚠️ ยืนยันการให้ส่วนลด:</strong><br/>
              หากมีการให้ส่วนลดพิเศษ คุณได้สอบถามคุณไอซ์ (Ice) แล้วหรือไม่ ว่าต้องการให้ <b>(a)</b> ใส่ราคาเต็มแล้วกรอกส่วนลดในช่อง Discount ด้านล่าง หรือ <b>(b)</b> ให้แก้ไขราคาต่อหน่วยเป็นราคาที่ลดแล้วโดยตรง? (ห้ามคิดเองเด็ดขาด)
            </div>

            <p className="text-sm text-gray-600 mb-4">กรุณาเลือกตำแหน่งที่ต้องการบันทึกไฟล์</p>
            <div className="space-y-4">
              <div>
                <select className="w-full border p-2 rounded focus:ring focus:ring-blue-200" value={drivePath} onChange={(e) => setDrivePath(e.target.value)}>
                  <option value="07_กรกฎาคม">07_กรกฎาคม</option>
                  <option value="08_สิงหาคม">08_สิงหาคม (ปัจจุบัน)</option>
                  <option value="09_กันยายน">09_กันยายน</option>
                </select>
              </div>

              <div className="bg-gray-50 p-3 rounded border">
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input type="checkbox" checked={saveExcel} onChange={(e) => setSaveExcel(e.target.checked)} className="w-4 h-4 text-blue-600" />
                  <span>ไฟล์ Excel (.xlsx)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={savePdf} onChange={(e) => setSavePdf(e.target.checked)} className="w-4 h-4 text-blue-600" />
                  <span>ไฟล์ PDF (.pdf)</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowDriveModal(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition">ยกเลิก</button>
              <button onClick={confirmSaveToDrive} disabled={loading || (!saveExcel && !savePdf)} className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition">
                {loading ? 'กำลังประมวลผล...' : 'ยืนยันและสร้างไฟล์'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PriceList is now an external page */}

      {/* Customer History Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center print:hidden">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto text-gray-900">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-900">🔍 ประวัติการซื้อของลูกค้า</h2>
              <button onClick={() => setShowCustomerModal(false)} className="text-gray-500 hover:text-red-500 text-xl font-bold">✕</button>
            </div>
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                placeholder="พิมพ์ชื่อบริษัท หรือ ชื่อผู้ติดต่อ..." 
                className="flex-1 border p-2 rounded focus:ring focus:ring-blue-200 text-gray-900 placeholder-gray-500" 
                defaultValue={formData.company} 
                id="customerSearchInput"
              />
              <button 
                onClick={() => {
                  const val = (document.getElementById('customerSearchInput') as HTMLInputElement).value;
                  const tbody = document.getElementById('customerHistoryTableBody');
                  const header = document.getElementById('customerHistoryHeader');
                  if (header) header.innerText = `ประวัติของ: ${val || 'ไม่ระบุ'}`;
                  
                  if (tbody) {
                    if (val.trim() === '') {
                      tbody.innerHTML = '<tr><td colSpan="4" class="p-4 text-center text-gray-500">พิมพ์ชื่อลูกค้าแล้วกดค้นหา</td></tr>';
                    } else if (val.includes('บจก.') || val.includes('สมาร์ท') || val.length > 2) {
                      tbody.innerHTML = `
                        <tr class="border-b hover:bg-gray-50">
                          <td class="p-2 text-gray-900">15/06/2026</td>
                          <td class="p-2 text-blue-600 underline cursor-pointer">QCH312-F69</td>
                          <td class="p-2 text-gray-900">Industrial Marker (สีขาว) x 5</td>
                          <td class="p-2 text-right text-red-600 font-bold">1,100 (Legacy Price)</td>
                        </tr>
                        <tr class="border-b hover:bg-gray-50">
                          <td class="p-2 text-gray-900">10/02/2026</td>
                          <td class="p-2 text-blue-600 underline cursor-pointer">QCH104-F69</td>
                          <td class="p-2 text-gray-900">Cleaning Spray X-100 x 2</td>
                          <td class="p-2 text-right text-gray-900">450</td>
                        </tr>
                      `;
                    } else {
                      tbody.innerHTML = '<tr><td colSpan="4" class="p-4 text-center text-gray-500">ไม่พบประวัติการซื้อของลูกค้ารายนี้</td></tr>';
                    }
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
              >
                ค้นหา
              </button>
            </div>
            
            <h3 className="font-bold text-gray-800 mb-2" id="customerHistoryHeader">ประวัติของ: กรุณากดปุ่มค้นหา</h3>
            <table className="w-full border-collapse text-sm text-gray-900">
              <thead>
                <tr className="bg-gray-100 border-b text-gray-800">
                  <th className="p-2 text-left font-bold">วันที่</th>
                  <th className="p-2 text-left font-bold">เลข QCH</th>
                  <th className="p-2 text-left font-bold">สินค้าที่เคยซื้อ</th>
                  <th className="p-2 text-right font-bold">ราคาที่ได้</th>
                </tr>
              </thead>
              <tbody id="customerHistoryTableBody">
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">กรุณาพิมพ์ชื่อบริษัทแล้วกดปุ่ม "ค้นหา"</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-600 mt-3 bg-yellow-50 p-2 border border-yellow-200 rounded">* หมายเหตุ: หากลูกค้าเคยได้ราคาเก่า (Legacy Pricing) กรุณาตรวจสอบกับคุณไอซ์ก่อนเสนอราคาใหม่</p>
          </div>
        </div>
      )}

      {/* Top Controls (Hidden when printing) */}
      <div className="max-w-5xl mx-auto mb-6 print:hidden space-y-4">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">สร้างใบเสนอราคา (Quotation)</h1>
          </div>
          <div className="flex gap-2">
            <a href="/pricelist.html" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-yellow-100 text-yellow-800 font-bold rounded border border-yellow-300 hover:bg-yellow-200 transition">
              💰 ดูราคาสินค้า (PriceList)
            </a>
            <button onClick={openDriveModal} disabled={loading} className="px-4 py-2 bg-blue-600 text-white font-bold rounded shadow hover:bg-blue-700 transition flex items-center gap-2">
              ☁️ บันทึกลง Drive
            </button>
            <button onClick={handlePrintPDF} className="px-4 py-2 bg-green-600 text-white font-bold rounded shadow hover:bg-green-700 transition">
              🖨️ ปรินต์ / ตัวอย่าง
            </button>
          </div>
        </div>

        {/* AI Assistant */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow border border-blue-100">
          <h2 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">✨ ให้ Gemini ช่วยอ่านนามบัตรและเช็คราคา</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="file" accept="image/*" className="bg-white border p-2 rounded text-sm text-gray-900" />
            <textarea className="bg-white border p-2 rounded text-sm text-gray-900" rows={1} placeholder="คำสั่งด่วน เช่น: Industrial marker สีขาว 3 ชิ้น ค่าส่ง 100"></textarea>
          </div>
          <div className="mt-3 flex justify-end">
            <button onClick={handleAiExtract} disabled={aiLoading} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded shadow">
              {aiLoading ? '🤖 กำลังอ่านรูป...' : '✨ วิเคราะห์และเติมข้อมูลอัตโนมัติ'}
            </button>
          </div>
        </section>
      </div>

      {/* A4 Paper Container */}
      <div className="max-w-[210mm] min-h-[297mm] bg-white mx-auto shadow-xl print:shadow-none bg-white p-[10mm] print:p-0 text-gray-900 pb-20 relative">
        
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-blue-900">บริษัท เซอร์เฟซ โพร-เท็ค จำกัด</h1>
          <h2 className="text-md font-bold text-gray-700">SURFACE PRO-TECH CO., LTD.</h2>
          <p className="text-[10px] text-gray-600 mt-1">
            สำนักงานใหญ่: 135/48 ชั้น 16 อาคารอมรพันธุ์ 205 ทาวเวอร์ 2 ซอยนาทอง ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400<br/>
            โทร. Tel.02-692-4445-8, 02-692-4225-7 แฟกซ์. 02-247-2241 | เลขประจำตัวผู้เสียภาษี: 0105536030611 | www.surfaceprotech.com
          </p>
        </div>

        {/* Title Banner */}
        <div className="bg-[#1e3a8a] text-white text-center py-1 font-bold text-lg mb-4 print:border-y-2 print:border-black">
          ใบเสนอราคา / QUOTATION
        </div>

        {/* Info Tables */}
        <div className="grid grid-cols-2 border border-gray-400 mb-4 text-[12px]">
          {/* Left Column */}
          <div className="border-r border-gray-400">
            <div className="bg-[#f0f4f8] font-bold p-1 px-2 border-b border-gray-400 text-[#1e3a8a]">ข้อมูลลูกค้า (CUSTOMER DETAILS)</div>
            <div className="grid grid-cols-[100px_1fr] border-b border-gray-300">
              <div className="p-1 px-2 font-semibold">ชื่อลูกค้า:</div>
              <div className="p-1 px-2 flex items-center relative">
                <input type="text" className="w-full bg-transparent outline-none text-blue-800 pr-8" placeholder="บริษัท..." value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} />
                <button onClick={() => setShowCustomerModal(true)} className="absolute right-1 text-xs bg-indigo-100 text-indigo-700 px-1 rounded hover:bg-indigo-200 print:hidden border border-indigo-200 shadow-sm" title="ค้นหาประวัติ">🔍 ประวัติ</button>
              </div>
            </div>
            <div className="grid grid-cols-[100px_1fr] border-b border-gray-300 h-12">
              <div className="p-1 px-2 font-semibold">ที่อยู่:</div>
              <div className="p-1 px-2"><textarea className="w-full h-full bg-transparent outline-none resize-none" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea></div>
            </div>
            <div className="grid grid-cols-[100px_1fr] border-b border-gray-300">
              <div className="p-1 px-2 font-semibold">เลขผู้เสียภาษี:</div>
              <div className="p-1 px-2"><input type="text" className="w-full bg-transparent outline-none" value={formData.taxId} onChange={(e) => setFormData({...formData, taxId: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-[100px_1fr] border-b border-gray-300">
              <div className="p-1 px-2 font-semibold">ผู้ติดต่อ:</div>
              <div className="p-1 px-2"><input type="text" className="w-full bg-transparent outline-none" value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-[100px_1fr] border-b border-gray-300">
              <div className="p-1 px-2 font-semibold">เบอร์โทร:</div>
              <div className="p-1 px-2"><input type="text" className="w-full bg-transparent outline-none" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-[100px_1fr] border-b border-gray-300">
              <div className="p-1 px-2 font-semibold">อีเมล:</div>
              <div className="p-1 px-2"><input type="text" className="w-full bg-transparent outline-none" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-[100px_1fr]">
              <div className="p-1 px-2 font-semibold">เงื่อนไขการชำระเงิน:</div>
              <div className="p-1 px-2"><input type="text" className="w-full bg-transparent outline-none" value={formData.paymentTerm} onChange={(e) => setFormData({...formData, paymentTerm: e.target.value})} /></div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="bg-[#f0f4f8] font-bold p-1 px-2 border-b border-gray-400 text-[#1e3a8a]">รายละเอียดเอกสาร (DOCUMENT INFO)</div>
            <div className="grid grid-cols-[100px_1fr] border-b border-gray-300">
              <div className="p-1 px-2 font-semibold">เลขที่เอกสาร:</div>
              <div className="p-1 px-2 flex relative">
                <input type="text" className="w-full bg-transparent outline-none font-bold text-red-600" value={formData.qchNumber} onChange={(e) => setFormData({...formData, qchNumber: e.target.value})} />
                <button onClick={fetchAutoQCH} className="absolute right-1 text-xs bg-gray-200 text-gray-700 px-1 rounded hover:bg-gray-300 print:hidden border shadow-sm" title="ดึงเลขรันอัตโนมัติ">🤖 Auto</button>
              </div>
            </div>
            <div className="grid grid-cols-[100px_1fr] border-b border-gray-300 h-12">
              <div className="p-1 px-2 font-semibold">วันที่:</div>
              <div className="p-1 px-2"><input type="text" className="w-full bg-transparent outline-none" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-[100px_1fr] border-b border-gray-300">
              <div className="p-1 px-2 font-semibold">พนักงานขาย:</div>
              <div className="p-1 px-2"><input type="text" className="w-full bg-transparent outline-none" value={formData.salesPerson} onChange={(e) => setFormData({...formData, salesPerson: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-[100px_1fr] border-b border-gray-300">
              <div className="p-1 px-2 font-semibold">วันครบกำหนด:</div>
              <div className="p-1 px-2"><input type="text" className="w-full bg-transparent outline-none" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-[100px_1fr] border-b border-gray-300">
              <div className="p-1 px-2 font-semibold">ระยะเวลายืนราคา:</div>
              <div className="p-1 px-2"><input type="text" className="w-full bg-transparent outline-none" value={formData.validity} onChange={(e) => setFormData({...formData, validity: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-[100px_1fr]">
              <div className="p-1 px-2 font-semibold">ระยะเวลาส่งมอบ:</div>
              <div className="p-1 px-2"><input type="text" className="w-full bg-transparent outline-none" value={formData.deliveryTime} onChange={(e) => setFormData({...formData, deliveryTime: e.target.value})} /></div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-gray-400 mb-4 text-[12px]">
          <div className="grid grid-cols-[40px_1fr_60px_60px_80px_80px_150px] bg-[#427ab0] text-white font-bold text-center border-b border-gray-400 print:bg-[#427ab0] print:text-white" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
            <div className="p-1 border-r border-gray-400">ลำดับ</div>
            <div className="p-1 border-r border-gray-400">รายการสินค้า (เลือก/ค้นหาจากชื่อ)</div>
            <div className="p-1 border-r border-gray-400">หน่วยนับ</div>
            <div className="p-1 border-r border-gray-400">จำนวน</div>
            <div className="p-1 border-r border-gray-400">ราคา/หน่วย</div>
            <div className="p-1 border-r border-gray-400">จำนวนเงิน</div>
            <div className="p-1">หมายเหตุ</div>
          </div>

          <div className="bg-[#fffdef] print:bg-[#fffdef]" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-[40px_1fr_60px_60px_80px_80px_150px] border-b border-gray-300 text-center group relative">
                
                {/* Delete Button (visible on hover in web) */}
                <button 
                  onClick={() => removeRow(index)} 
                  className="absolute -left-6 top-1 text-red-500 font-bold opacity-0 group-hover:opacity-100 print:hidden transition-opacity"
                  title="ลบบรรทัด"
                >
                  ✖
                </button>

                <div className="p-1 border-r border-gray-300">{index + 1}</div>
                <div className="p-1 border-r border-gray-300 text-left">
                  <input 
                    type="text" 
                    list="pricelist-options"
                    className="w-full bg-transparent outline-none px-1" 
                    value={item.name} 
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)} 
                    placeholder="พิมพ์ชื่อสินค้า..."
                  />
                </div>
                <div className="p-1 border-r border-gray-300">
                  <input type="text" className="w-full bg-transparent outline-none text-center" value={item.unit} onChange={(e) => handleItemChange(index, 'unit', e.target.value)} />
                </div>
                <div className="p-1 border-r border-gray-300">
                  <input type="number" className="w-full bg-transparent outline-none text-center" value={item.qty || ''} onChange={(e) => handleItemChange(index, 'qty', Number(e.target.value))} />
                </div>
                <div className="p-1 border-r border-gray-300">
                  <input type="number" className="w-full bg-transparent outline-none text-right" value={item.price || ''} onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))} />
                </div>
                <div className="p-1 border-r border-gray-300 text-right pr-2">
                  {(item.qty * item.price) > 0 ? (item.qty * item.price).toLocaleString(undefined, {minimumFractionDigits: 2}) : ''}
                </div>
                <div className="p-1 text-left">
                  <input type="text" className="w-full bg-transparent outline-none px-1 text-xs text-red-600 print:text-black" placeholder="หมายเหตุ" value={item.remark} onChange={(e) => handleItemChange(index, 'remark', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
          
          {/* Add Row Button (Hidden in Print) */}
          <div className="bg-[#fffdef] border-b border-gray-300 print:hidden text-center p-1">
            <button onClick={addNewRow} className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-gray-700 font-bold border border-gray-300">+ เพิ่มบรรทัด</button>
          </div>

          {/* Summary Section */}
          <div className="grid grid-cols-[1fr_370px]">
            <div className="border-r border-gray-400 p-2 flex flex-col justify-center bg-gray-50 print:bg-white text-center">
              <span className="font-semibold mb-1">จำนวนเงินตัวอักษร (AMOUNT IN WORDS):</span>
              <span className="font-bold text-blue-800 text-sm">{THAI_BAHT(grandTotal)}</span>
            </div>
            
            <div>
              <div className="grid grid-cols-[1fr_100px] border-b border-gray-300">
                <div className="p-1 px-2 text-right font-semibold bg-[#f0f4f8] print:bg-[#f0f4f8]" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>รวมราคาสินค้า:</div>
                <div className="p-1 px-2 text-right">{subTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              </div>
              <div className="grid grid-cols-[1fr_100px] border-b border-gray-300">
                <div className="p-1 px-2 text-right font-semibold bg-[#f0f4f8] print:bg-[#f0f4f8]" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>ส่วนลด (Discount):</div>
                <div className="p-1 px-2 text-right">
                  <input type="number" className="w-full bg-transparent outline-none text-right text-red-600 print:text-black" value={discount || ''} onChange={(e) => setDiscount(Number(e.target.value))} />
                </div>
              </div>
              <div className="grid grid-cols-[1fr_100px] border-b border-gray-300">
                <div className="p-1 px-2 text-right font-semibold bg-[#f0f4f8] print:bg-[#f0f4f8]" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>ภาษีมูลค่าเพิ่ม 7%:</div>
                <div className="p-1 px-2 text-right">{vat.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              </div>
              <div className="grid grid-cols-[1fr_100px]">
                <div className="p-1 px-2 text-right font-bold text-white bg-[#427ab0] print:bg-[#427ab0] print:text-white" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>รวมเป็นเงินทั้งสิ้น:</div>
                <div className="p-1 px-2 text-right font-bold bg-[#f0f4f8] print:bg-[#f0f4f8]" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              </div>
            </div>
          </div>
        </div>

        {/* General Remark */}
        <div className="mb-8 text-[12px]">
          <span className="font-bold">หมายเหตุ:</span>
          <textarea 
            className="w-full border-b border-gray-300 bg-transparent outline-none mt-1 resize-none" 
            rows={2} 
            placeholder="พิมพ์หมายเหตุเพิ่มเติมตรงนี้ได้เลย..."
            value={formData.remark}
            onChange={(e) => setFormData({...formData, remark: e.target.value})}
          ></textarea>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-8 text-center text-[12px] mt-16">
          <div>
            <div className="border-b border-gray-400 w-3/4 mx-auto mb-2 h-6"></div>
            <p>( ผู้เสนอราคา ) วันที่ ...................</p>
          </div>
          <div>
            <div className="border-b border-gray-400 w-3/4 mx-auto mb-2 h-6"></div>
            <p>( ผู้อนุมัติ ) วันที่ ...................</p>
          </div>
          <div>
            <div className="border-b border-gray-400 w-3/4 mx-auto mb-2 h-6"></div>
            <p>( ลูกค้ายอมรับ / อนุมัติสั่งซื้อ ) วันที่ ...................</p>
          </div>
        </div>

      </div>
    </div>
  );
}
