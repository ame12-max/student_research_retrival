import React, { useEffect, useState } from 'react';
import { getIndexStats, rebuildIndex } from '../services/api';
import { 
  DocumentTextIcon, 
  HashtagIcon, 
  ChartBarIcon, 
  ArrowPathIcon,
  ClockIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

export default function IndexStats() {
  const [stats, setStats] = useState(null);
  const [rebuilding, setRebuilding] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = async () => {
    const res = await getIndexStats();
    setStats(res.data.stats);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleRebuild = async () => {
    setRebuilding(true);
    await rebuildIndex();
    await fetchStats();
    setRebuilding(false);
  };

  if (!stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Calculate average terms per document
  const avgTermsPerDoc = stats.totalDocuments > 0 
    ? (stats.totalTermOccurrences / stats.totalDocuments).toFixed(1) 
    : 0;

  // Estimate index size (rough: each term occurrence ~ 50 bytes)
  const estimatedSizeMB = (stats.totalTermOccurrences * 50 / (1024 * 1024)).toFixed(2);

  const statCards = [
    {
      title: 'Total Documents',
      value: stats.totalDocuments,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      description: 'Research papers indexed'
    },
    {
      title: 'Unique Terms',
      value: stats.uniqueTerms.toLocaleString(),
      icon: HashtagIcon,
      color: 'bg-purple-500',
      description: 'Distinct stemmed words'
    },
    {
      title: 'Term Occurrences',
      value: stats.totalTermOccurrences.toLocaleString(),
      icon: ChartBarIcon,
      color: 'bg-green-500',
      description: 'Total term instances'
    },
    {
      title: 'Avg Terms/Doc',
      value: avgTermsPerDoc,
      icon: DocumentDuplicateIcon,
      color: 'bg-yellow-500',
      description: 'Average terms per paper'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with last update time */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">📊 Index Health Dashboard</h2>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <ClockIcon className="h-4 w-4" />
          Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <p className="text-2xl font-semibold text-gray-800">{card.value}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-400">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed metrics in a single card */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">📈 Detailed Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Inverted Index Size (est.)</p>
            <p className="text-xl font-medium text-gray-800">{estimatedSizeMB} MB</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-orange-500 h-2 rounded-full" 
                style={{ width: `${Math.min(100, (estimatedSizeMB / 50) * 100)}%` }}
              ></div>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Index Coverage</p>
            <p className="text-xl font-medium text-gray-800">
              {stats.totalDocuments > 0 ? ((stats.uniqueTerms / stats.totalTermOccurrences) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-gray-400">Unique vs total ratio</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Rebuild</p>
            <p className="text-md font-medium text-gray-800">
              {new Date(stats.lastRebuild).toLocaleString()}
            </p>
            <button
              onClick={handleRebuild}
              disabled={rebuilding}
              className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 disabled:opacity-50 transition"
            >
              <ArrowPathIcon className={`h-4 w-4 ${rebuilding ? 'animate-spin' : ''}`} />
              {rebuilding ? 'Rebuilding...' : 'Rebuild Index'}
            </button>
          </div>
        </div>
      </div>

      {/* System Health Note */}
      <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-orange-700">
              The index is automatically updated when documents are added, edited, or deleted. 
              Manual rebuild is only needed if you suspect inconsistency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}