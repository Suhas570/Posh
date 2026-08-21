import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { Eye, Award, Frown, Calendar } from 'lucide-react';

export const HRResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await apiClient.get('/api/hr/results');
      setResults(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-650 border-t-transparent"></div>
          <p className="text-slate-400 text-sm font-semibold">Loading Candidate Results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm font-sans text-left">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Assessment Results</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Review candidate test performance and statistics</p>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
          <span className="text-3xl mb-4">📊</span>
          <p className="font-semibold text-sm text-slate-700">No exam attempts yet</p>
          <p className="text-slate-500 text-xs mt-1">Results will appear here automatically when candidates submit their exams.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/50">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Candidate</th>
                <th className="py-4 px-6">Date Attempted</th>
                <th className="py-4 px-6">Score</th>
                <th className="py-4 px-6">Percentage</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 text-sm text-slate-650">
              {results.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors duration-150">
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{row.candidateName}</span>
                      <span className="text-xs text-slate-450 mt-1 font-semibold">{row.candidateEmail}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {new Date(row.submittedAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-800">
                    {row.scoredMarks} / {row.totalMarks}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            row.passFail === 'PASS' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, row.percentage)}%` }}
                        />
                      </div>
                      <span className="font-bold text-xs text-slate-700">{row.percentage}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold border w-fit ${
                          row.passFail === 'PASS'
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                            : 'bg-rose-50 border-rose-100 text-rose-700'
                        }`}
                      >
                        {row.passFail === 'PASS' ? (
                          <>
                            <Award className="h-3.5 w-3.5 text-emerald-600" /> Pass
                          </>
                        ) : (
                          <>
                            <Frown className="h-3.5 w-3.5 text-rose-600" /> Fail
                          </>
                        )}
                      </span>
                      {row.autoSubmitted && (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border border-rose-200 bg-rose-50 text-rose-700 w-fit">
                          Auto-Submitted
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => navigate(`/assignments/hr/results/${row.attemptId}`)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-800 px-3 py-2 text-xs font-bold text-slate-650 transition-all cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-indigo-650" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HRResults;
