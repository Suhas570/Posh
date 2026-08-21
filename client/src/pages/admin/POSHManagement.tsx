import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { StatusBadge, Skeleton } from '../../components/common/UI';
import { ShieldAlert, UserCheck, Eye, History } from 'lucide-react';

const POSHManagement: React.FC = () => {
  const { showToast } = useNotification();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [assigningCase, setAssigningCase] = useState<any>(null);

  const { register, handleSubmit, reset } = useForm();

  const fetchCases = async () => {
    try {
      const res = await api.get('/admin/posh-cases');
      if (res.data.success) {
        setCases(res.data.data);
      }
    } catch (error) {
      showToast('Failed to load POSH cases', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleAssign = async (data: any) => {
    try {
      const res = await api.put(`/admin/posh-cases/${assigningCase._id}/assign`, {
        investigatorName: data.investigatorName
      });
      if (res.data.success) {
        showToast('Case assigned to investigator successfully!', 'success');
        setAssigningCase(null);
        reset();
        fetchCases();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Assignment failed', 'error');
    }
  };

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldAlert size={22} className="text-indigo-600 dark:text-indigo-400" />
          POSH Case Management (Normal Complaints)
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">Track and assign complaints to the Internal Committee. Anonymous cases are strictly hidden.</p>
      </div>

      {/* Case Grid Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700/50 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                <th className="px-6 py-4">Complaint ID</th>
                <th className="px-6 py-4">Complainant</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Accused Person</th>
                <th className="px-6 py-4">Incident Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/30 text-xs">
              {cases.length > 0 ? (
                cases.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10">
                    <td className="px-6 py-4 font-extrabold text-indigo-600 dark:text-indigo-400">
                      {c.complaintId}
                    </td>
                    <td className="px-6 py-4 text-gray-800 dark:text-white font-bold">
                      {c.complainant ? `${c.complainant.firstName} ${c.complainant.lastName}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-semibold">
                      {c.complainant?.department?.name || 'ENG'}
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
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedCase(c)}
                        className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-750 dark:hover:bg-gray-700 text-[10px] font-bold rounded-lg border border-gray-250/20 text-gray-700 dark:text-gray-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={12} />
                        Track
                      </button>
                      {c.status === 'New' && (
                        <button
                          onClick={() => setAssigningCase(c)}
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-[10px] font-bold rounded-lg text-white flex items-center gap-1 cursor-pointer"
                        >
                          <UserCheck size={12} />
                          Assign
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400 font-medium">
                    No Normal POSH complaints filed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Track Case details modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-700/20 border-b border-gray-100 dark:border-gray-700/50">
              <div>
                <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400 block">{selectedCase.complaintId}</span>
                <span className="text-[10px] text-gray-400 font-bold block mt-0.5">{selectedCase.complaintType} Details</span>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-gray-50 dark:bg-gray-700/25 p-4 rounded-xl border border-gray-100 dark:border-gray-700/30 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-semibold">Complainant:</span>
                  <span className="font-bold text-gray-800 dark:text-white">
                    {selectedCase.complainant?.firstName} {selectedCase.complainant?.lastName} ({selectedCase.complainant?.employeeId})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-semibold">Accused Person:</span>
                  <span className="font-bold text-gray-800 dark:text-white">{selectedCase.accusedPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-semibold">Incident Details:</span>
                  <span className="font-bold text-gray-800 dark:text-white">
                    {selectedCase.incidentLocation} on {new Date(selectedCase.incidentDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-semibold">Assigned Investigator:</span>
                  <span className="font-bold text-gray-800 dark:text-white">{selectedCase.assignedInvestigator || 'Pending assignment'}</span>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                  <History size={16} className="text-indigo-600" />
                  Investigation Timeline Tracker
                </h4>
                
                <div className="border-l border-gray-200 dark:border-gray-700 ml-3 pl-5 space-y-4">
                  {selectedCase.timeline && selectedCase.timeline.map((entry: any, index: number) => (
                    <div key={index} className="relative">
                      <span className="absolute -left-[26px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-indigo-600 bg-white dark:bg-gray-800"></span>
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-800 dark:text-white"><StatusBadge status={entry.status} /></span>
                          <span className="text-[10px] text-gray-400 font-bold">{new Date(entry.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{entry.remarks} (updated by {entry.updatedBy})</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN INVESTIGATOR FORM DIALOG */}
      {assigningCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/20 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center">
              <span className="font-bold text-sm text-gray-800 dark:text-white">Assign Investigator to Case</span>
              <button onClick={() => setAssigningCase(null)} className="p-1 hover:bg-gray-100 rounded">✕</button>
            </div>
            <form onSubmit={handleSubmit(handleAssign)} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Investigator Name</label>
                <input
                  type="text"
                  placeholder="Enter IC Officer's name"
                  {...register('investigatorName', { required: 'Name is required' })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                <button
                  type="button"
                  onClick={() => setAssigningCase(null)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  Confirm & Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSHManagement;
