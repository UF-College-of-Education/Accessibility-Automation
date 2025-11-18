'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, X, Download, Code } from 'lucide-react';
import { AuditRun, AuditPageResult } from './AuditService';

interface Props {
  auditRun: AuditRun;
  previousRun?: AuditRun | null;
  onClose: () => void;
}

export default function ResultsModal({ auditRun, previousRun, onClose }: Props) {
  const [filterType, setFilterType] = useState<'all' | 'error' | 'warning'>('all');
  const [showComparison, setShowComparison] = useState(false);
  const [expandedPage, setExpandedPage] = useState<string | null>(null);
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  const errorCount = auditRun.results.reduce(
    (sum, r) => sum + r.issues.filter(i => i.type === 'error').length,
    0
  );

  const warningCount = auditRun.results.reduce(
    (sum, r) => sum + r.issues.filter(i => i.type === 'warning').length,
    0
  );

  const previousErrorCount = previousRun
    ? previousRun.results.reduce(
        (sum, r) => sum + r.issues.filter(i => i.type === 'error').length,
        0
      )
    : 0;

  const previousWarningCount = previousRun
    ? previousRun.results.reduce(
        (sum, r) => sum + r.issues.filter(i => i.type === 'warning').length,
        0
      )
    : 0;

  function getFilteredResults(results: AuditPageResult[]) {
    if (filterType === 'all') return results;
    return results.filter(r => r.issues.some(i => i.type === filterType));
  }

  function downloadHTMLReport() {
    const html = generateHTMLReport();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(html));
    element.setAttribute('download', `audit-report-${auditRun.id}.html`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  function generateHTMLReport(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Audit Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #0066cc; border-bottom: 3px solid #0066cc; padding-bottom: 10px; }
    h2 { color: #333; margin-top: 30px; }
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
    .stat-card { background: #f0f8ff; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #0066cc; }
    .stat-card.error { border-left-color: #dc3545; background: #ffe6e6; }
    .stat-card.warning { border-left-color: #ffc107; background: #fff8e6; }
    .stat-number { font-size: 32px; font-weight: bold; color: #0066cc; }
    .stat-card.error .stat-number { color: #dc3545; }
    .stat-card.warning .stat-number { color: #ffc107; }
    .stat-label { color: #666; font-size: 14px; margin-top: 5px; }
    .page { margin-bottom: 40px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
    .page-header { background: #f9f9f9; padding: 15px; border-bottom: 2px solid #0066cc; }
    .page-title { font-size: 18px; font-weight: bold; color: #333; }
    .page-url { font-size: 12px; color: #666; margin-top: 5px; word-break: break-all; }
    .page-summary { padding: 15px; background: #f0f8ff; display: flex; gap: 20px; }
    .issue-count { font-size: 14px; }
    .issue { margin: 15px; padding: 15px; border-left: 4px solid #ffc107; background: #fffbf0; border-radius: 4px; }
    .issue.error { border-left-color: #dc3545; background: #ffe6e6; }
    .issue-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px; }
    .issue-type { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 12px; font-weight: bold; }
    .issue-type.error { background: #dc3545; color: white; }
    .issue-type.warning { background: #ffc107; color: black; }
    .issue-code { font-family: monospace; font-size: 12px; color: #666; margin: 10px 0; }
    .issue-message { font-weight: bold; color: #333; margin-bottom: 10px; }
    .issue-selector { background: #f5f5f5; padding: 10px; border-radius: 3px; font-family: monospace; font-size: 12px; margin: 10px 0; }
    .issue-snippet { background: #f5f5f5; padding: 10px; border-radius: 3px; font-family: monospace; font-size: 11px; overflow-x: auto; margin: 10px 0; border-left: 2px solid #999; }
    .issue-principle { color: #666; font-size: 12px; margin: 5px 0; }
    .issue-recommendation { background: #e6ffe6; padding: 10px; border-radius: 3px; font-size: 12px; margin-top: 10px; color: #2d5a2d; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
    .comparison { background: #e6ffe6; padding: 15px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>♿ Accessibility Audit Report</h1>
    <p><strong>Generated:</strong> ${auditRun.dateString}</p>
    <p><strong>Standard:</strong> WCAG 2.1 Level AA</p>

    <h2>Summary</h2>
    <div class="summary">
      <div class="stat-card">
        <div class="stat-number">${auditRun.siteCount}</div>
        <div class="stat-label">Sites Audited</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${auditRun.pageCount}</div>
        <div class="stat-label">Pages Scanned</div>
      </div>
      <div class="stat-card error">
        <div class="stat-number">${errorCount}</div>
        <div class="stat-label">Errors Found</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-number">${warningCount}</div>
        <div class="stat-label">Warnings Found</div>
      </div>
    </div>

    ${previousRun ? `
      <div class="comparison">
        <h3>Comparison with Previous Run</h3>
        <p><strong>Previous:</strong> ${previousErrorCount} errors, ${previousWarningCount} warnings</p>
        <p><strong>Change:</strong> ${errorCount < previousErrorCount ? '📉 Improved' : errorCount > previousErrorCount ? '📈 Declined' : '→ No Change'}</p>
      </div>
    ` : ''}

    <h2>Detailed Results</h2>
    ${auditRun.results.map(result => `
      <div class="page">
        <div class="page-header">
          <div class="page-title">${result.title}</div>
          <div class="page-url">${result.url}</div>
        </div>
        <div class="page-summary">
          <div class="issue-count">
            <strong>${result.issues.filter(i => i.type === 'error').length}</strong> Errors,
            <strong>${result.issues.filter(i => i.type === 'warning').length}</strong> Warnings
          </div>
        </div>
        ${result.issues.length === 0 ? '<div style="padding: 15px; color: #28a745;">✓ No issues found</div>' : result.issues.map(issue => `
          <div class="issue ${issue.type}">
            <div class="issue-header">
              <div>
                <span class="issue-type ${issue.type}">${issue.type.toUpperCase()}</span>
              </div>
            </div>
            <div class="issue-code">Code: ${issue.code}</div>
            <div class="issue-message">${issue.message}</div>
            <div class="issue-principle">WCAG Principle: ${issue.wcagPrinciple}</div>
            <div class="issue-selector"><strong>Selector:</strong> ${issue.selector}</div>
            <div class="issue-snippet"><strong>Code:</strong><pre>${escapeHtml(issue.codeSnippet)}</pre></div>
            ${issue.recommendation ? `<div class="issue-recommendation"><strong>Recommendation:</strong> ${issue.recommendation}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `).join('')}

    <div class="footer">
      <p>Report generated on ${new Date().toLocaleString()}</p>
      <p>UF College of Education | Accessibility Audit Dashboard</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  const filteredResults = getFilteredResults(auditRun.results);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full my-8">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">📊 Accessibility Audit Report</h2>
              <p className="text-blue-100">{auditRun.dateString}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-800 p-2 rounded transition"
            >
              <X size={28} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {/* Summary Statistics */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-600">{auditRun.siteCount}</div>
                <div className="text-sm text-gray-600">Sites Audited</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-3xl font-bold text-purple-600">{auditRun.pageCount}</div>
                <div className="text-sm text-gray-600">Pages Scanned</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="text-3xl font-bold text-red-600">{errorCount}</div>
                <div className="text-sm text-gray-600">Errors Found</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="text-3xl font-bold text-yellow-600">{warningCount}</div>
                <div className="text-sm text-gray-600">Warnings Found</div>
              </div>
            </div>
          </div>

          {/* Comparison Section */}
          {previousRun && (
            <div className="mb-8 p-4 bg-green-50 rounded-lg border border-green-200">
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="w-full text-left font-bold text-green-900 flex justify-between items-center"
              >
                <span>📊 Compare with Previous Run ({previousRun.dateString})</span>
                <span>{showComparison ? '▼' : '▶'}</span>
              </button>

              {showComparison && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Errors</div>
                    <div className="text-xl font-bold">
                      <span className="text-red-600">{errorCount}</span>
                      <span className="text-xs text-gray-600 ml-2">
                        {errorCount < previousErrorCount ? '📉' : errorCount > previousErrorCount ? '📈' : '→'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">Previous: {previousErrorCount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Warnings</div>
                    <div className="text-xl font-bold">
                      <span className="text-yellow-600">{warningCount}</span>
                      <span className="text-xs text-gray-600 ml-2">
                        {warningCount < previousWarningCount ? '📉' : warningCount > previousWarningCount ? '📈' : '→'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">Previous: {previousWarningCount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Change</div>
                    <div className="text-xl font-bold">
                      {errorCount + warningCount < previousErrorCount + previousWarningCount ? (
                        <span className="text-green-600">✓ Better</span>
                      ) : errorCount + warningCount > previousErrorCount + previousWarningCount ? (
                        <span className="text-red-600">✗ Worse</span>
                      ) : (
                        <span className="text-gray-600">Same</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filter Buttons */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              All Results ({auditRun.results.length})
            </button>
            <button
              onClick={() => setFilterType('error')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterType === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Errors Only ({errorCount})
            </button>
            <button
              onClick={() => setFilterType('warning')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterType === 'warning'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Warnings Only ({warningCount})
            </button>
            <button
              onClick={downloadHTMLReport}
              className="px-4 py-2 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-2"
            >
              <Download size={18} />
              Download Report
            </button>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Detailed Results by Page</h3>
            {filteredResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No results found for this filter
              </div>
            ) : (
              filteredResults.map((result, idx) => {
                const isExpanded = expandedPage === result.url;
                const resultErrors = result.issues.filter(i => i.type === 'error');
                const resultWarnings = result.issues.filter(i => i.type === 'warning');

                return (
                  <div key={idx} className="border rounded-lg overflow-hidden hover:shadow-md transition">
                    <div
                      className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition flex items-center gap-3"
                      onClick={() => setExpandedPage(isExpanded ? null : result.url)}
                    >
                      {result.issues.length === 0 ? (
                        <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                      ) : (
                        <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900">{result.title}</div>
                        <div className="text-xs text-gray-600 truncate">{result.url}</div>
                      </div>
                      <div className="flex gap-2">
                        {resultErrors.length > 0 && (
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
                            {resultErrors.length} error{resultErrors.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        {resultWarnings.length > 0 && (
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-semibold">
                            {resultWarnings.length} warning{resultWarnings.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t p-4 space-y-3 bg-white">
                        {result.issues.length === 0 ? (
                          <div className="text-center py-4 text-green-600 font-semibold">
                            ✓ No accessibility issues found!
                          </div>
                        ) : (
                          result.issues.map((issue, issueIdx) => {
                            const issueKey = `${result.url}-${issueIdx}`;
                            const issueExpanded = expandedIssue === issueKey;

                            return (
                              <div
                                key={issueIdx}
                                className={`p-3 rounded border-l-4 cursor-pointer ${
                                  issue.type === 'error'
                                    ? 'bg-red-50 border-red-400'
                                    : 'bg-yellow-50 border-yellow-400'
                                }`}
                                onClick={() => setExpandedIssue(issueExpanded ? null : issueKey)}
                              >
                                <div className="flex items-start gap-2">
                                  {issue.type === 'error' ? (
                                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                                  ) : (
                                    <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
                                  )}
                                  <div className="flex-1">
                                    <div className="font-semibold text-sm text-gray-900">
                                      {issue.message}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1 font-mono">
                                      {issue.code}
                                    </div>
                                  </div>
                                </div>

                                {issueExpanded && (
                                  <div className="mt-4 pt-4 border-t-2 border-gray-300 space-y-3">
                                    <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
                                      <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">WCAG Principle</div>
                                      <div className="text-sm font-semibold text-gray-900">{issue.wcagPrinciple}</div>
                                    </div>

                                    <div className="bg-purple-50 p-4 rounded border-l-4 border-purple-500">
                                      <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Issue Code</div>
                                      <div className="text-xs font-mono text-purple-700 bg-purple-100 p-2 rounded break-all">{issue.code}</div>
                                    </div>

                                    <div className="bg-orange-50 p-4 rounded border-l-4 border-orange-500">
                                      <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">CSS Selector</div>
                                      <div className="text-xs font-mono bg-gray-900 text-green-400 p-3 rounded overflow-x-auto whitespace-pre-wrap break-words">
                                        {issue.selector}
                                      </div>
                                    </div>

                                    <div className="bg-indigo-50 p-4 rounded border-l-4 border-indigo-500">
                                      <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Code Snippet</div>
                                      <div className="text-xs font-mono bg-gray-900 text-green-400 p-3 rounded overflow-x-auto whitespace-pre-wrap break-words">
                                        {issue.codeSnippet}
                                      </div>
                                    </div>

                                    {issue.recommendation && (
                                      <div className="bg-green-50 p-4 rounded border-l-4 border-green-500">
                                        <div className="text-xs font-bold text-green-900 mb-2 uppercase tracking-wide">✓ Recommendation</div>
                                        <div className="text-sm text-green-900 leading-relaxed">{issue.recommendation}</div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 rounded-b-lg flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}