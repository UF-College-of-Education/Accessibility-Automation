'use client';

import { useState } from 'react';
import SiteSelector from './components/SiteSelector';
import { Site } from './components/DataService';

export default function Home() {
  const [message, setMessage] = useState('');

  function handleSelectSites(sites: Site[], pageCount: number) {
    setMessage(`Selected ${sites.length} sites with ${pageCount} pages. Ready to audit!`);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Accessibility Audit Dashboard
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Scan WordPress sites for WCAG compliance
        </p>

        <SiteSelector onSelectSites={handleSelectSites} />

        {message && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800">{message}</p>
          </div>
        )}
      </div>
    </main>
  );
}