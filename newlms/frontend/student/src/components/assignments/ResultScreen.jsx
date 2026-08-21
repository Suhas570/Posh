import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { ArrowLeft, CheckCircle2, XCircle, Award, Frown, ClipboardCheck } from 'lucide-react';

export const ResultScreen = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResultDetails();
  }, []);

  const fetchResultDetails = async () => {
    try {
      const response = await apiClient.get('/api/candidate/result');
      const data = response.data;
      if (data && Array.isArray(data.breakdown)) {
        data.breakdown = data.breakdown.map((item) => {
          let parsedOptions = item.options;
          if (typeof item.options === 'string') {
            try {
              parsedOptions = JSON.parse(item.options);
            } catch (e) {
              console.error(e);
            }
          }
          return { ...item, options: parsedOptions };
        });
      }
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'No completed exam attempt or result found.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-slate-400 text-sm font-semibold">Generating test results...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm max-w-md mx-auto mt-10">
        <p className="text-rose-600 font-bold mb-4">{error || 'Result details not found.'}</p>
        <button
          onClick={() => navigate('/student/assignments')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Go to Dashboard
        </button>
      </div>
    );
  }

  const passed = result.passFail === 'PASS';

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6 font-sans">
      {/* Header Back Button */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/student/assignments')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-55 hover:bg-slate-50 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>
      </div>

      {/* Auto-Submit Alert */}
      {result.autoSubmitted && (
        <div className="rounded-2xl border border-rose-250 bg-rose-50 p-6 text-center max-w-3xl mx-auto shadow-sm">
          <p className="text-rose-600 font-extrabold text-base mb-2 flex items-center justify-center gap-2">
            ⚠️ Auto-Submitted by Security System
          </p>
          <p className="text-sm text-slate-600">
            This exam was automatically submitted due to a proctoring violation.
            <br />
            <span className="font-bold text-rose-700">Reason: {result.autoSubmitReason || 'System Auto-Submit'}</span>
          </p>
        </div>
      )}

      {/* Main Score board card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center flex flex-col items-center">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl border shadow-inner mb-6 ${
            passed
              ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
              : 'bg-rose-50 border-rose-100 text-rose-600'
          }`}
        >
          {passed ? <Award className="h-8 w-8" /> : <Frown className="h-8 w-8" />}
        </div>

        <h2 className="text-2xl font-black text-slate-800">Assessment Score</h2>
        
        <div className="mt-4 flex flex-col items-center">
          <div className="text-6xl font-black text-slate-800">
            {result.scoredMarks}
            <span className="text-slate-400 text-3xl">/{result.totalMarks}</span>
          </div>
          <span className="text-xs text-indigo-600 font-extrabold mt-2 uppercase tracking-widest">
            Overall percentage: {result.percentage}%
          </span>
        </div>

        <div className="mt-6">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-black uppercase tracking-wider border ${
              passed
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                : 'bg-rose-50 border-rose-100 text-rose-700'
            }`}
          >
            {passed ? 'Passed Examination' : 'Failed Examination'}
          </span>
        </div>

        <p className="text-xs text-slate-400 font-semibold mt-4">
          Submitted on: {new Date(result.submittedAt).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
      </div>

      {/* Breakdown per question */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 text-left">
          <ClipboardCheck className="h-5 w-5 text-indigo-650" />
          Review Questions Breakdown
        </h3>

        <div className="space-y-4">
          {result.breakdown.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-xl border p-5 bg-white shadow-sm ${
                item.isCorrect ? 'border-emerald-200' : 'border-rose-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded text-slate-500">
                      Question {idx + 1}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded text-slate-500">
                      {item.marks} Point{item.marks > 1 ? 's' : ''}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 leading-relaxed">{item.questionText}</h4>
                </div>

                <div className="flex items-center gap-1 text-xs font-black uppercase tracking-wider">
                  {item.isCorrect ? (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-emerald-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Correct
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-rose-50 border border-rose-200 px-2.5 py-1 text-rose-700">
                      <XCircle className="h-4 w-4 text-rose-600" /> Incorrect
                    </span>
                  )}
                </div>
              </div>

              {/* Show code or options based on type */}
              {item.type === 'CODING' ? (
                <div className="mt-4 text-left">
                  <p className="text-xs font-bold text-slate-500 mb-2">Your Submitted Code:</p>
                  <pre className="text-xs font-mono p-4 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto text-slate-300">
                    {item.codeSubmitted || '/* No code submitted */'}
                  </pre>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-left">
                  {item.options?.map((opt, oIdx) => {
                    const isSelected = item.selectedOptionIndex === oIdx;
                    const isCorrectAnswer = item.correctOptionIndex === oIdx;

                    let optionStyle = 'bg-slate-50 border-slate-250 text-slate-600';
                    if (isCorrectAnswer) {
                      optionStyle = 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold';
                    } else if (isSelected && !isCorrectAnswer) {
                      optionStyle = 'bg-rose-50 border-rose-200 text-rose-800 font-bold';
                    }

                    return (
                      <div
                        key={oIdx}
                        className={`flex items-center justify-between rounded-xl px-4 py-3 border ${optionStyle}`}
                      >
                        <span>
                          <span className="font-semibold mr-1.5">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                        </span>
                        <div className="flex flex-col items-end gap-1">
                          {isCorrectAnswer && (
                            <span className="text-[9px] font-black uppercase bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded text-emerald-700">
                              Correct
                            </span>
                          )}
                          {isSelected && !isCorrectAnswer && (
                            <span className="text-[9px] font-black uppercase bg-rose-100 border border-rose-200 px-2 py-0.5 rounded text-rose-700">
                              Your Pick
                            </span>
                          )}
                          {isSelected && isCorrectAnswer && (
                            <span className="text-[9px] font-black uppercase bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded text-emerald-850">
                              ✓ Your Pick
                            </span>
                          )}
                        </div>
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

export default ResultScreen;
