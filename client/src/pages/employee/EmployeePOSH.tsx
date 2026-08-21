import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { StatusBadge, Skeleton } from '../../components/common/UI';
import { ShieldAlert, Send, Eye, ShieldCheck, History } from 'lucide-react';

const EmployeePOSH: React.FC = () => {
  const { showToast } = useNotification();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      complaintType: 'Hostile Work Environment',
      incidentDate: '',
      incidentTime: '',
      incidentLocation: '',
      accusedPerson: '',
      description: '',
      isAnonymous: false
    }
  });

  const isAnonymousVal = watch('isAnonymous');

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/posh/my-complaints');
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (error) {
      showToast('Failed to load complaint logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const onSubmit = async (data: any) => {
    setSubmitLoading(true);
    try {
      // Use FormData to support evidence file uploads
      const formData = new FormData();
      formData.append('complaintType', data.complaintType);
      formData.append('incidentDate', data.incidentDate);
      formData.append('incidentTime', data.incidentTime);
      formData.append('incidentLocation', data.incidentLocation);
      formData.append('accusedPerson', data.accusedPerson);
      formData.append('description', data.description);
      formData.append('isAnonymous', String(data.isAnonymous));

      const fileInput = document.getElementById('evidence') as HTMLInputElement;
      if (fileInput && fileInput.files && fileInput.files[0]) {
        formData.append('evidence', fileInput.files[0]);
      }

      const res = await api.post('/posh/submit', formData, {
        headers: { 'Content-Type': undefined }
      });

      if (res.data.success) {
        const isAnon = data.isAnonymous === 'true' || data.isAnonymous === true;
        if (isAnon) {
          showToast("Warning / Caution: Don't worry, your identity will be accessed by only the Internal Committee.", 'warning');
        } else {
          showToast('Complaint submitted successfully. Rest assured, your matter is handled with extreme confidentiality.', 'success');
        }
        reset();
        if (fileInput) {
          fileInput.value = '';
        }
        setShowForm(false);
        fetchComplaints();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to submit complaint', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-64" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldAlert size={22} className="text-indigo-600 dark:text-indigo-400" />
            POSH Portal
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Prevention of Sexual Harassment - Confidential Support & Filing</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <ShieldAlert size={16} />
          {showForm ? 'View My Logs' : 'File a Complaint'}
        </button>
      </div>

      {showForm ? (
        /* CONFIDENTIAL FORM */
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm max-w-xl animate-fade-in text-xs">
          <div className="mb-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/20 p-4 rounded-xl text-amber-800 dark:text-amber-300">
            <h4 className="font-bold flex items-center gap-1">
              <ShieldCheck size={16} />
              Strict Confidentiality Statement
            </h4>
            <p className="mt-1 text-[11px] leading-relaxed">
              All filings are strictly routed to the Internal Committee. Anonymous filings completely scrub your name, contact, department, and profile photo from our databases and committee panels.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Filing Mode</label>
                <div className="flex items-center gap-4 py-2">
                  <label className="flex items-center text-gray-700 dark:text-gray-300 font-semibold cursor-pointer">
                    <input type="radio" value="false" {...register('isAnonymous')} defaultChecked className="mr-2" />
                    Normal Filing
                  </label>
                  <label className="flex items-center text-gray-700 dark:text-gray-300 font-semibold cursor-pointer">
                    <input type="radio" value="true" {...register('isAnonymous')} className="mr-2" />
                    Anonymous Filing
                  </label>
                </div>
                {String(isAnonymousVal) === 'true' && (
                  <div className="mt-3 p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 rounded-xl border border-rose-200/30 text-[10px] font-black flex items-center gap-2 animate-fade-in shadow-sm">
                    <span className="text-sm">⚠️</span>
                    <span>Warning / Caution: Don't worry, your identity will be accessed by only the Internal Committee.</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Complaint Type</label>
                <select
                  {...register('complaintType', { required: 'Select complaint category' })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="Verbal Harassment">Verbal Harassment</option>
                  <option value="Hostile Work Environment">Hostile Work Environment</option>
                  <option value="Physical Harassment">Physical Harassment</option>
                  <option value="Inappropriate Stalking">Inappropriate Stalking / Communications</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Incident Date</label>
                <input
                  type="date"
                  {...register('incidentDate', { required: 'Incident date is required' })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                {errors.incidentDate && <span className="text-rose-500 text-[10px] mt-1 block">{errors.incidentDate.message as string}</span>}
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Incident Time</label>
                <input
                  type="text"
                  placeholder="e.g. 2:30 PM, Evening"
                  {...register('incidentTime', { required: 'Approximate time is required' })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                {errors.incidentTime && <span className="text-rose-500 text-[10px] mt-1 block">{errors.incidentTime.message as string}</span>}
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Incident Location</label>
                <input
                  type="text"
                  placeholder="e.g. Conference Room B, Parking Lot"
                  {...register('incidentLocation', { required: 'Location details required' })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                {errors.incidentLocation && <span className="text-rose-500 text-[10px] mt-1 block">{errors.incidentLocation.message as string}</span>}
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Accused Person</label>
                <input
                  type="text"
                  placeholder="Full Name of the accused"
                  {...register('accusedPerson', { required: 'Accused name is required' })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                {errors.accusedPerson && <span className="text-rose-500 text-[10px] mt-1 block">{errors.accusedPerson.message as string}</span>}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Detailed Description</label>
              <textarea
                rows={4}
                placeholder="Describe the incident(s) chronologically in detail..."
                {...register('description', { required: 'Description details are required' })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              ></textarea>
              {errors.description && <span className="text-rose-500 text-[10px] mt-1 block">{errors.description.message as string}</span>}
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Supportive Evidence (Screenshots, Email PDFs)</label>
              <input
                type="file"
                id="evidence"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none"
              />
              <span className="text-[10px] text-gray-400 block mt-1.5 font-semibold">Supported formats: JPEG, PNG, PDF, DOC, DOCX up to 10MB</span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                <Send size={14} />
                {submitLoading ? 'Submitting...' : 'File Securely'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* MY SUBMITTED COMPLAINTS */
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700/50 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                  <th className="px-6 py-4">Complaint ID</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Filing Type</th>
                  <th className="px-6 py-4">Accused Person</th>
                  <th className="px-6 py-4">Incident Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/30 text-xs">
                {complaints.length > 0 ? (
                  complaints.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10">
                      <td className="px-6 py-4 font-extrabold text-indigo-600 dark:text-indigo-400">
                        {c.complaintId}
                      </td>
                      <td className="px-6 py-4 text-gray-800 dark:text-white font-semibold">
                        {c.complaintType}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.isAnonymous ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {c.isAnonymous ? 'Anonymous' : 'Normal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-semibold">
                        {c.accusedPerson}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {new Date(c.incidentDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedCase(c)}
                          className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-[10px] font-bold rounded-lg text-indigo-600 dark:text-indigo-400 flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Eye size={12} />
                          Timeline
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400 font-medium">
                      No complaints filed. We hope your workplace experiences are completely comfortable and safe.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Case timeline details modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden text-xs">
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-700/20 border-b border-gray-100 dark:border-gray-700/50">
              <div>
                <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400 block">{selectedCase.complaintId}</span>
                <span className="text-[10px] text-gray-400 font-bold block mt-0.5">{selectedCase.complaintType} Tracking</span>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Accused & description summary */}
              <div className="bg-gray-50 dark:bg-gray-700/20 p-4 rounded-xl border border-gray-100 dark:border-gray-700/30 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-semibold">Victim / Complainant:</span>
                  <span className="font-bold text-gray-800 dark:text-white">
                    {selectedCase.isAnonymous 
                      ? 'Anonymous (Shown to IC Only)' 
                      : (user?.employeeProfile ? `${user.employeeProfile.firstName} ${user.employeeProfile.lastName}` : 'You')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-semibold">Accused Person:</span>
                  <span className="font-bold text-gray-800 dark:text-white">{selectedCase.accusedPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-semibold">Incident details:</span>
                  <span className="font-bold text-gray-800 dark:text-white">{selectedCase.incidentLocation} on {new Date(selectedCase.incidentDate).toLocaleDateString()}</span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700/20 pt-2">
                  <span className="text-gray-400 font-semibold block mb-1">Details:</span>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic">"{selectedCase.description}"</p>
                </div>
              </div>

              {/* Status Timeline tracker */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                  <History size={16} className="text-indigo-600" />
                  Investigation Timeline Tracker
                </h4>
                
                <div className="border-l border-gray-200 dark:border-gray-700 ml-3 pl-5 space-y-4">
                  {selectedCase.timeline && selectedCase.timeline.map((entry: any, index: number) => (
                    <div key={index} className="relative">
                      {/* Node indicator */}
                      <span className="absolute -left-[26px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-indigo-600 bg-white dark:bg-gray-800"></span>
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-800 dark:text-white"><StatusBadge status={entry.status} /></span>
                          <span className="text-[10px] text-gray-400 font-bold">{new Date(entry.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{entry.remarks}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePOSH;
