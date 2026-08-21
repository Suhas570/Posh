import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Plus, Trash2, HelpCircle } from 'lucide-react';

export const HRDashboard = () => {
  const [activeTab, setActiveTab] = useState('QUESTIONS');

  // --- Questions State ---
  const [questions, setQuestions] = useState([]);
  const [text, setText] = useState('');
  const [type, setType] = useState('MCQ');
  const [options, setOptions] = useState(['', '']); 
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
  const [language, setLanguage] = useState('javascript');
  const [starterCode, setStarterCode] = useState('');
  const [testCases, setTestCases] = useState([{ input: '', expectedOutput: '' }]);
  const [marks, setMarks] = useState(5);
  const [submitLoading, setSubmitLoading] = useState(false);

  // --- Tests State ---
  const [tests, setTests] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [testTitle, setTestTitle] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [testDuration, setTestDuration] = useState(60);
  const [testPassingMark, setTestPassingMark] = useState(50);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [testSubmitLoading, setTestSubmitLoading] = useState(false);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchQuestions();
    fetchTests();
    fetchCandidates();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await apiClient.get('/api/hr/questions');
      setQuestions(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTests = async () => {
    try {
      const response = await apiClient.get('/api/hr/tests');
      setTests(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await apiClient.get('/api/hr/candidates');
      setCandidates(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Question Handlers ---
  const handleAddOption = () => {
    if (options.length < 6) setOptions([...options, '']);
  };
  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const updated = options.filter((_, i) => i !== index);
      setOptions(updated);
      if (correctOptionIndex >= updated.length) setCorrectOptionIndex(updated.length - 1);
    }
  };
  const handleOptionChange = (index, val) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleAddTestCase = () => setTestCases([...testCases, { input: '', expectedOutput: '' }]);
  const handleRemoveTestCase = (index) => setTestCases(testCases.filter((_, i) => i !== index));
  const handleTestCaseChange = (index, field, val) => {
    const updated = [...testCases];
    updated[index][field] = val;
    setTestCases(updated);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (!text.trim()) return setError('Question text is required.');

    setSubmitLoading(true);
    try {
      const payload = { text: text.trim(), type, marks };
      if (type === 'MCQ') {
        const filteredOptions = options.map((opt) => opt.trim());
        if (filteredOptions.some((opt) => opt === '')) throw new Error('All option fields must be filled.');
        payload.options = filteredOptions;
        payload.correctOptionIndex = correctOptionIndex;
      } else {
        payload.language = language;
        payload.starterCode = starterCode;
        payload.testCases = testCases;
      }
      
      await apiClient.post('/api/hr/questions', payload);
      setSuccess('Question saved successfully.');
      setText(''); setOptions(['', '']); setCorrectOptionIndex(0);
      setLanguage('javascript'); setStarterCode(''); setTestCases([{ input: '', expectedOutput: '' }]);
      setMarks(5);
      fetchQuestions();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save question.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    setError(null); setSuccess(null);
    try {
      await apiClient.delete(`/api/hr/questions/${id}`);
      setSuccess('Question deleted successfully.');
      fetchQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete question.');
    }
  };

  // --- Test Handlers ---
  const handleSaveTest = async (e) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (!testTitle.trim() || selectedQuestionIds.length === 0) return setError('Title and at least 1 question required.');
    setTestSubmitLoading(true);
    try {
      await apiClient.post('/api/hr/tests', {
        title: testTitle.trim(),
        description: testDescription.trim(),
        duration: testDuration,
        passingMark: testPassingMark,
        questionIds: selectedQuestionIds
      });
      setSuccess('Test created successfully.');
      setTestTitle(''); setTestDescription(''); setTestDuration(60); setTestPassingMark(50); setSelectedQuestionIds([]);
      fetchTests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create test.');
    } finally {
      setTestSubmitLoading(false);
    }
  };

  const handleAssignTest = async (testId, candidateId) => {
    try {
      await apiClient.post(`/api/hr/tests/${testId}/assign`, { candidateIds: [candidateId] });
      fetchTests();
      alert('Assigned successfully!');
    } catch (err) {
      alert('Failed to assign test');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          className={`px-6 py-3 font-bold text-sm transition-all ${activeTab === 'QUESTIONS' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
          onClick={() => setActiveTab('QUESTIONS')}
        >
          Questions Bank
        </button>
        <button 
          className={`px-6 py-3 font-bold text-sm transition-all ${activeTab === 'TESTS' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
          onClick={() => setActiveTab('TESTS')}
        >
          Tests & Assignments
        </button>
      </div>

      {activeTab === 'QUESTIONS' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 text-left">
          {/* Question Form */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-100 bg-[#fafafa] p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-md font-bold text-slate-800 mb-6">
                <Plus className="h-5 w-5 text-indigo-600" /> Create Question
              </h2>
              {success && <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-700">{success}</div>}
              {error && <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-700">{error}</div>}
              
              <form onSubmit={handleSaveQuestion} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Question Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input type="radio" checked={type === 'MCQ'} onChange={() => setType('MCQ')} className="text-indigo-600 focus:ring-indigo-500" /> MCQ
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input type="radio" checked={type === 'CODING'} onChange={() => setType('CODING')} className="text-indigo-600 focus:ring-indigo-500" /> Coding
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Question Text</label>
                  <textarea
                    value={text} onChange={(e) => setText(e.target.value)} rows={3} required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                    placeholder="Problem description..."
                  />
                </div>

                {type === 'MCQ' ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Options</label>
                      {options.length < 6 && (
                        <button type="button" onClick={handleAddOption} className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer">+ Add Option</button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {options.map((option, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <input type="radio" name="correctAnswer" checked={correctOptionIndex === idx} onChange={() => setCorrectOptionIndex(idx)} className="cursor-pointer text-indigo-600" />
                          <input type="text" value={option} onChange={(e) => handleOptionChange(idx, e.target.value)} required className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-800" />
                          {options.length > 2 && <button type="button" onClick={() => handleRemoveOption(idx)} className="text-rose-600 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button>}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Language</label>
                      <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-800">
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Starter Code</label>
                      <textarea value={starterCode} onChange={e => setStarterCode(e.target.value)} rows={4} className="w-full font-mono rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold uppercase text-slate-500">Test Cases</label>
                        <button type="button" onClick={handleAddTestCase} className="text-xs font-bold text-indigo-600 hover:underline">+ Add Case</button>
                      </div>
                      {testCases.map((tc, idx) => (
                        <div key={idx} className="flex gap-2 mb-2 items-start">
                          <textarea placeholder="Input" value={tc.input} onChange={e => handleTestCaseChange(idx, 'input', e.target.value)} className="flex-1 font-mono text-xs rounded border border-slate-200 bg-white p-2" rows={2}/>
                          <textarea placeholder="Expected" value={tc.expectedOutput} onChange={e => handleTestCaseChange(idx, 'expectedOutput', e.target.value)} className="flex-1 font-mono text-xs rounded border border-slate-200 bg-white p-2" rows={2}/>
                          {testCases.length > 1 && <button type="button" onClick={() => handleRemoveTestCase(idx)} className="text-rose-600 mt-2"><Trash2 className="h-4 w-4" /></button>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Marks</label>
                  <input type="number" value={marks} onChange={(e) => setMarks(Math.max(1, parseInt(e.target.value) || 1))} min={1} required className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-800" />
                </div>
                <button type="submit" disabled={submitLoading} className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer">
                  {submitLoading ? 'Saving...' : 'Save Question'}
                </button>
              </form>
            </div>
          </div>

          {/* Question List */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm h-full flex flex-col">
              <h2 className="flex items-center gap-2 text-md font-bold text-slate-800 mb-6">
                <HelpCircle className="h-5 w-5 text-indigo-600" /> Questions Bank ({questions.length})
              </h2>
              <div className="flex-1 overflow-y-auto space-y-4 max-h-[700px] pr-1">
                {questions.map((q) => (
                  <div key={q.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 hover:border-slate-200 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex gap-2 mb-2">
                          <span className="text-[10px] font-black uppercase bg-slate-200 text-slate-600 px-2 rounded">{q.type}</span>
                          <span className="text-[10px] font-black uppercase bg-indigo-55/60 bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 rounded">{q.marks} Marks</span>
                          {q.type === 'CODING' && <span className="text-[10px] font-black uppercase bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 rounded">{q.language}</span>}
                        </div>
                        <p className="text-xs font-extrabold text-slate-800 mb-2">{q.text}</p>
                        {q.type === 'MCQ' && (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {q.options && (typeof q.options === 'string' ? JSON.parse(q.options) : q.options).map((opt, oIdx) => (
                              <div key={oIdx} className={`rounded px-2.5 py-1.5 ${q.correctOptionIndex === oIdx ? 'bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold' : 'bg-slate-100/70 text-slate-500'}`}>
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}
                        {q.type === 'CODING' && (
                          <div className="text-xs text-slate-500 font-bold">
                            {q.testCases ? (typeof q.testCases === 'string' ? JSON.parse(q.testCases) : q.testCases).length : 0} Test Cases Defined
                          </div>
                        )}
                      </div>
                      <button onClick={() => handleDeleteQuestion(q.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'TESTS' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 text-left">
          {/* Test Form */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-100 bg-[#fafafa] p-6 shadow-sm">
              <h2 className="text-md font-bold text-slate-800 mb-6">Create Assessment Test</h2>
              <form onSubmit={handleSaveTest} className="space-y-4">
                <input type="text" placeholder="Test Title" value={testTitle} onChange={e => setTestTitle(e.target.value)} required className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-800" />
                <textarea placeholder="Description" value={testDescription} onChange={e => setTestDescription(e.target.value)} rows={2} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-800" />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase">Duration (minutes)</label>
                    <input
                      type="number"
                      value={testDuration}
                      onChange={(e) => setTestDuration(Math.max(1, parseInt(e.target.value) || 1))}
                      required
                      min={1}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase">Passing Score (%)</label>
                    <input
                      type="number"
                      value={testPassingMark}
                      onChange={(e) => setTestPassingMark(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                      required
                      min={1}
                      max={100}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase">Select Questions</label>
                  <div className="max-h-64 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-3 bg-white">
                    {questions.map(q => (
                      <label key={q.id} className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer p-1">
                        <input type="checkbox" checked={selectedQuestionIds.includes(q.id)} onChange={(e) => {
                          if (e.target.checked) setSelectedQuestionIds([...selectedQuestionIds, q.id]);
                          else setSelectedQuestionIds(selectedQuestionIds.filter(id => id !== q.id));
                        }} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                        <span className="truncate flex-1">{q.text}</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase font-bold">{q.type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={testSubmitLoading} className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer">
                  Create Test
                </button>
              </form>
            </div>
          </div>

          {/* Test List */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm h-full flex flex-col">
              <h2 className="text-md font-bold text-slate-800 mb-6">Configured Tests</h2>
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {tests.map(t => (
                  <div key={t.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-extrabold text-slate-800 text-sm">{t.title}</h3>
                      <div className="flex gap-2">
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">{t.duration || 60} Mins</span>
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">Pass: {t.passingMark || 50}%</span>
                        <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded font-bold uppercase">{t.questions.length} Qs</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">{t.description}</p>
                    
                    <div className="border-t border-slate-200 pt-3">
                      <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase">Assign to Student:</label>
                      <div className="flex gap-2">
                        <select id={`select-${t.id}`} className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700">
                          <option value="">Select Student...</option>
                          {candidates.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                        </select>
                        <button onClick={() => {
                          const sel = document.getElementById(`select-${t.id}`);
                          if (sel && sel.value) handleAssignTest(t.id, sel.value);
                        }} className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all cursor-pointer">
                          Assign
                        </button>
                      </div>
                      <div className="mt-3 text-[10px] text-slate-400 font-bold uppercase">
                        Assigned Count: {t.assignments?.length || 0} students
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard;
