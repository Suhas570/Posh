import React, { useEffect, useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { StatusBadge, Skeleton } from '../../components/common/UI';
import { Search, Eye, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const ICCases: React.FC = () => {
  const { showToast } = useNotification();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tabFilter, setTabFilter] = useState<'all' | 'normal' | 'anonymous'>('all');

  const fetchCases = async () => {
    try {
      const res = await api.get('/ic/cases');
      if (res.data.success) {
        setCases(res.data.data);
      }
    } catch (error) {
      showToast('Failed to load IC cases', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const filteredCases = cases.filter((c) => {
    const matchesSearch = c.complaintId.toLowerCase().includes(search.toLowerCase()) ||
      c.accusedPerson.toLowerCase().includes(search.toLowerCase()) ||
      c.complaintType.toLowerCase().includes(search.toLowerCase());

    const matchesTab = tabFilter === 'all' ||
      (tabFilter === 'anonymous' && c.isAnonymous) ||
      (tabFilter === 'normal' && !c.isAnonymous);

    return matchesSearch && matchesTab;
  });

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">POSH Complaint Ledger</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Complete listing of Normal and Anonymous complaints routed to the Internal Committee</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200 dark:border-gray-700/50">
        <button
          onClick={() => setTabFilter('all')}
          className={`px-6 py-3 text-xs font-bold transition-all cursor-pointer ${
            tabFilter === 'all'
              ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          All Cases ({cases.length})
        </button>
        <button
          onClick={() => setTabFilter('normal')}
          className={`px-6 py-3 text-xs font-bold transition-all cursor-pointer ${
            tabFilter === 'normal'
              ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Normal Complaints ({cases.filter(c => !c.isAnonymous).length})
        </button>
        <button
          onClick={() => setTabFilter('anonymous')}
          className={`px-6 py-3 text-xs font-bold transition-all cursor-pointer ${
            tabFilter === 'anonymous'
              ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Anonymous Cases ({cases.filter(c => c.isAnonymous).length})
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search by case ID, accused, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Grid Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700/50 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                <th className="px-6 py-4">Complaint ID</th>
                <th className="px-6 py-4">Filing Type</th>
                <th className="px-6 py-4">Complainant</th>
                <th className="px-6 py-4">Accused Person</th>
                <th className="px-6 py-4">Incident Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/30 text-xs">
              {filteredCases.length > 0 ? (
                filteredCases.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10">
                    <td className="px-6 py-4 font-extrabold text-indigo-600 dark:text-indigo-400">
                      {c.complaintId}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.isAnonymous ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {c.isAnonymous ? 'Anonymous' : 'Normal'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-800 dark:text-white font-bold">
                      {c.complainant ? `${c.complainant.firstName} ${c.complainant.lastName}` : 'N/A'}
                      {c.isAnonymous && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
                          Anon
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-200 font-semibold">
                      {c.accusedPerson}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {new Date(c.incidentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/ic/cases/${c._id}`}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-[10px] font-bold rounded-lg text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={12} />
                        Investigate Case
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400 font-medium">
                    No cases match filter criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ICCases;
