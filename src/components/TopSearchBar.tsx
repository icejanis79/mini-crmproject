'use client';

import { useState, useEffect } from 'react';

export default function TopSearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ type: string; title: string; subtitle: string; price?: string }[]>([]);
  
  // Data sources
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    // Load products from API (Google Sheets)
    fetch('/api/pricelist')
      .then(res => res.json())
      .then(data => {
        if(data && data.length > 0) setProducts(data);
      })
      .catch(err => console.error(err));

    // Fetch customers from API (Google Sheets)
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        setCustomers(data);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    const q = query.toLowerCase();
    const found: any[] = [];
    
    // Search Customers
    customers.forEach(c => {
      if (c.company.toLowerCase().includes(q) || c.contact.toLowerCase().includes(q) || c.phone.replace(/\D/g,'').includes(q)) {
        found.push({
          type: 'ลูกค้าเก่า',
          title: c.company,
          subtitle: `ติดต่อ: ${c.contact} | โทร: ${c.phone} | บิลล่าสุด: ${c.latestQuote}`
        });
      }
    });

    // Search Products
    products.forEach(p => {
      if (p.n.toLowerCase().includes(q) || (p.c && p.c.toLowerCase().includes(q))) {
        found.push({
          type: 'สินค้า',
          title: p.n,
          subtitle: `บรรจุ: ${p.p || '-'} | หมวด: ${p.cat || '-'}`,
          price: p.price ? p.price.toLocaleString() : '0'
        });
      }
    });

    // Limit to 10 results
    setResults(found.slice(0, 10));
  }, [query, customers, products]);

  return (
    <div className="relative w-full max-w-md mx-4">
      <input
        type="text"
        placeholder="🔍 ค้นหาด่วน: ชื่อลูกค้า, เบอร์โทร, ชื่อสินค้า..."
        className="w-full px-4 py-2 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => setTimeout(() => setResults([]), 200)}
        onFocus={() => setQuery(query)}
      />
      
      {results.length > 0 && query.trim() !== '' && (
        <div className="absolute top-12 left-0 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[80vh] overflow-y-auto">
          {results.map((r, i) => (
            <div key={i} className="p-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${r.type === 'ลูกค้าเก่า' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>
                    {r.type}
                  </span>
                  <div className="font-bold text-gray-900 mt-1">{r.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{r.subtitle}</div>
                </div>
                {r.price && (
                  <div className="text-right">
                    <div className="text-sm font-bold text-red-600">{r.price} ฿</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
