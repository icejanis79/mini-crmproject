import Link from 'next/link';

export default function LeadsPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Lead Management</h1>
          <p className="text-gray-500">Track and move your leads through the pipeline.</p>
        </div>
        <Link href="/" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
          Back to Dashboard
        </Link>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* New Leads */}
        <div className="bg-gray-100 rounded-xl p-4">
          <h2 className="font-semibold mb-4 text-gray-700">New Leads (2)</h2>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-bold text-blue-600">Company A</h3>
              <p className="text-sm text-gray-600">contact@companya.com</p>
              <div className="mt-3 flex gap-2">
                <button className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">Email</button>
                <button className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">LINE</button>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-bold text-blue-600">Company B</h3>
              <p className="text-sm text-gray-600">hello@companyb.com</p>
            </div>
          </div>
        </div>

        {/* Contacted */}
        <div className="bg-gray-100 rounded-xl p-4">
          <h2 className="font-semibold mb-4 text-gray-700">Contacted (1)</h2>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-bold text-blue-600">Company C</h3>
              <p className="text-sm text-gray-600">info@companyc.com</p>
            </div>
          </div>
        </div>

        {/* Proposal Sent */}
        <div className="bg-gray-100 rounded-xl p-4">
          <h2 className="font-semibold mb-4 text-gray-700">Proposal Sent (0)</h2>
          <div className="space-y-3">
            {/* Empty state */}
            <p className="text-sm text-gray-400 italic">No leads in this stage.</p>
          </div>
        </div>

        {/* Won */}
        <div className="bg-gray-100 rounded-xl p-4">
          <h2 className="font-semibold mb-4 text-gray-700">Won (1)</h2>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 opacity-75">
              <h3 className="font-bold text-green-600">Company D</h3>
              <p className="text-sm text-gray-600">deal@companyd.com</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
