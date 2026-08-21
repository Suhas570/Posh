import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { ArrowLeft, CheckCircle2, XCircle, Award, Calendar, User, ShieldAlert } from 'lucide-react';

export const HRResultDetail = ({ attemptId, onBack }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDetails();
  }, [attemptId]);

  const fetchDetails = async () => {
    try {
      const response = await apiClient.get(`/api/hr/results/${attemptId}`);
      setDetails(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load candidate attempt details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-slate-400 text-sm font-semibold">Loading attempt details...</p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm text-left">
        <p className="text-rose-600 font-bold mb-4">{error || 'Attempt details not found.'}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Results
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Results
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 font-black">
            <User className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-md font-bold text-slate-800 leading-tight">{details.candidateName}</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">{details.candidateEmail}</p>
            <p className="text-[10px] text-slate-600 mt-2 font-bold bg-slate-50 border border-slate-200 px-2 py-1 rounded inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(details.submittedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-start md:border-l md:border-slate-200 md:pl-8 py-2">
          <span className="text-xs font-bold uppercase mb-2 text-slate-400">Aggregate Score</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{details.scoredMarks}</span>
            <span className="text-slate-500 font-bold">/ {details.totalMarks} Marks</span>
          </div>
          <span className="text-xs text-indigo-600 font-extrabold mt-1.5">{details.percentage}% Scored</span>
        </div>

        <div className="flex flex-col items-center md:items-start md:border-l md:border-slate-200 md:pl-8 py-2">
          <span className="text-xs font-bold uppercase mb-2 text-slate-400">Outcome Status</span>
          <span className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-black ${details.passFail === 'PASS' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
            {details.passFail === 'PASS' ? <><Award className="h-4 w-4 text-emerald-500" /> Passed Test</> : <><XCircle className="h-4 w-4 text-rose-500" /> Failed Test</>}
          </span>
        </div>

        <div className="flex flex-col items-center md:items-start md:border-l md:border-slate-200 md:pl-8 py-2">
          <span className="text-xs font-bold uppercase mb-2 text-slate-400">Exam Timings & Rules</span>
          <div className="text-xs font-semibold text-slate-600 flex flex-col gap-1.5 mt-1">
            <div>Duration: <span className="text-indigo-600 font-black">{details.testDuration || 60} Mins</span></div>
            <div>Passing Score: <span className="text-indigo-600 font-black">{details.testPassingMark || 50}%</span></div>
            <div>Assessment: <span className="text-slate-800 font-bold">{details.testTitle || 'General'}</span></div>
          </div>
        </div>
      </div>

      {details.autoSubmitted || (details.violations && details.violations.length > 0) ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-55/60 bg-rose-50 p-6 shadow-sm space-y-4">
          <h2 className="text-md font-bold text-rose-700 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-600" /> Proctoring Report
          </h2>
          {details.autoSubmitted && (
            <div className="text-sm text-rose-700 font-medium">
              <strong>Exam Auto-Submitted:</strong> {details.autoSubmitReason || 'Proctoring violation limit exceeded.'}
            </div>
          )}
          {details.violations && details.violations.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2 uppercase">Logged Violations:</p>
              <ul className="list-disc pl-5 text-xs text-rose-700 space-y-1 font-semibold">
                {details.violations.map(v => (
                  <li key={v.id}>
                    <span className="font-bold">{v.type}</span> at {new Date(v.timestamp).toLocaleTimeString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}

      <div className="space-y-6">
        <h2 className="text-md font-bold text-slate-800">Question Breakdown ({details.breakdown.length})</h2>

        <div className="space-y-4">
          {details.breakdown.map((item, idx) => (
            <div key={idx} className={`rounded-xl border p-5 bg-white shadow-sm ${item.isCorrect ? 'border-emerald-200' : 'border-rose-200'}`}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded text-slate-500">
                      Question {idx + 1}
                    </span>
                    <span className="text-[10px] font-black uppercase bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded text-slate-500">
                      {item.type}
                    </span>
                    <span className="text-[10px] font-black uppercase bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded text-slate-500">
                      {item.marks} Point{item.marks > 1 ? 's' : ''}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 leading-relaxed">{item.questionText}</h4>
                </div>

                <div className="flex items-center gap-1 text-xs font-black uppercase">
                  {item.isCorrect ? (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-emerald-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Correct
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-rose-50 border border-rose-200 px-2.5 py-1 text-rose-700">
                      <XCircle className="h-4 w-4 text-rose-500" /> Incorrect
                    </span>
                  )}
                </div>
              </div>

              {item.type === 'CODING' ? (
                <div className="mt-4 text-left">
                  <p className="text-xs font-bold text-slate-500 mb-2">Candidate's Submitted Code:</p>
                  <pre className="text-xs font-mono p-4 bg-slate-50 border border-slate-200 rounded-xl overflow-x-auto text-slate-700">
                    {item.codeSubmitted || '/* No code submitted */'}
                  </pre>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-left">
                  {item.options?.map((opt, oIdx) => {
                    const isSelected = item.selectedOptionIndex === oIdx;
                    const isCorrectAnswer = item.correctOptionIndex === oIdx;
                    let optionStyle = 'bg-slate-50 border-slate-200 text-slate-600';
                    if (isCorrectAnswer) optionStyle = 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold';
                    else if (isSelected) optionStyle = 'bg-rose-50 border-rose-200 text-rose-700 font-bold';

                    return (
                      <div key={oIdx} className={`flex items-center justify-between rounded-xl px-4 py-3 border ${optionStyle}`}>
                        <span><span className="font-semibold mr-1.5">{String.fromCharCode(65 + oIdx)}.</span> {opt}</span>
                        {isCorrectAnswer && <span className="text-[9px] font-black uppercase bg-emerald-100 border border-emerald-25/40 px-2 py-0.5 rounded text-emerald-700">Correct Answer</span>}
                        {isSelected && !isCorrectAnswer && <span className="text-[9px] font-black uppercase bg-rose-100 border border-rose-25/40 px-2 py-0.5 rounded text-rose-700">Candidate Selection</span>}
                        {isSelected && isCorrectAnswer && <span className="text-[9px] font-black uppercase bg-emerald-200 border border-emerald-30 px-2 py-0.5 rounded text-emerald-800">Your Selection</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HRResultDetail;
