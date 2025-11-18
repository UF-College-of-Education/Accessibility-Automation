// app/components/SiteSelector.tsx

'use client';

import { useState, useEffect } from 'react';
import { fetchSites, Site } from './DataService';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  onSelectSites: (sites: Site[], pageCount: number) => void;
}

export default function SiteSelector({ onSelectSites }: Props) {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSites, setSelectedSites] = useState<Set<string>>(new Set());
  const [expandedSite, setExpandedSite] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadSites();
  }, []);

  async function loadSites() {
    setLoading(true);
    const data = await fetchSites();
    setSites(data);
    setLoading(false);
  }

  function toggleSite(siteId: string) {
    const newSelected = new Set(selectedSites);
    if (newSelected.has(siteId)) {
      newSelected.delete(siteId);
    } else {
      newSelected.add(siteId);
    }
    setSelectedSites(newSelected);
    updatePageCount(newSelected);
  }

  function updatePageCount(selected: Set<string>) {
    let count = 0;
    sites.forEach(site => {
      if (selected.has(site.id)) {
        count += site.pages.length;
      }
    });
    setTotalPages(count);
  }

  function handleRunAudit() {
    const selectedSitesList = sites.filter(s => selectedSites.has(s.id));
    onSelectSites(selectedSitesList, totalPages);
  }

  if (loading) {
    return <div className="p-4 text-center text-gray-600">Loading sites...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Select Sites to Audit</h2>
      
      <div className="mb-4 p-4 bg-blue-50 rounded border border-blue-200">
        <p className="text-sm font-semibold text-gray-800">
          Selected: {selectedSites.size} site{selectedSites.size !== 1 ? 's' : ''}, {totalPages} page{totalPages !== 1 ? 's' : ''}
        </p>
        {totalPages > 50 && (
          <p className="text-sm text-orange-600 mt-2">
            ⚠️ Warning: Max 50 pages recommended. You selected {totalPages}.
          </p>
        )}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto border rounded p-3 bg-gray-50">
        {sites.map(site => (
          <div key={site.id} className="border rounded bg-white">
            <div
              className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer transition"
              onClick={() => {
                toggleSite(site.id);
                setExpandedSite(expandedSite === site.id ? null : site.id);
              }}
            >
              <input
                type="checkbox"
                checked={selectedSites.has(site.id)}
                onChange={() => {}}
                className="w-4 h-4 cursor-pointer"
              />
              <div className="flex-1">
                <div className="font-semibold text-sm text-gray-900">{site.title}</div>
                <div className="text-xs text-gray-600">{site.baseUrl}</div>
                <div className="text-xs text-gray-500">Pages: {site.pages.length}</div>
              </div>
              {expandedSite === site.id ? (
                <ChevronUp size={20} className="text-gray-600" />
              ) : (
                <ChevronDown size={20} className="text-gray-600" />
              )}
            </div>

            {expandedSite === site.id && (
              <div className="p-3 bg-gray-50 border-t">
                <div className="space-y-1 max-h-40 overflow-y-auto text-sm">
                  {site.pages.slice(0, 10).map((page, idx) => (
                    <div key={idx} className="text-gray-700">
                      • {page.title || page.path}
                    </div>
                  ))}
                  {site.pages.length > 10 && (
                    <div className="text-gray-500 italic text-xs mt-2">
                      ... and {site.pages.length - 10} more pages
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleRunAudit}
        disabled={selectedSites.size === 0}
        className={`mt-4 w-full py-3 px-4 rounded font-semibold text-white transition ${
          selectedSites.size === 0
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        }`}
      >
        Run Audit on {selectedSites.size} Site{selectedSites.size !== 1 ? 's' : ''}
      </button>
    </div>
  );
}