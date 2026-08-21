import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { ShieldAlert, AlertTriangle, ChevronRight, ChevronLeft } from 'lucide-react';
import Editor from '@monaco-editor/react';
import * as faceapi from 'face-api.js';

export const ExamScreen = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [runOutput, setRunOutput] = useState(null);
  const [runStatus, setRunStatus] = useState({});

  // Proctoring State
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningModalMessage, setWarningModalMessage] = useState(null);
  const faceMissingStartRef = useRef(null);
  const faceIntervalRef = useRef(null);
  const copyPasteCountRef = useRef(0);
  const [autoSubmitReason, setAutoSubmitReason] = useState(null);
  const [showAutoSubmitModal, setShowAutoSubmitModal] = useState(false);
  
  // Autosave
  const autosaveTimerRef = useRef(null);

  // Stale closure fixes for Proctoring Listeners
  const answersRef = useRef(answers);
  const submittingRef = useRef(submitting);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { submittingRef.current = submitting; }, [submitting]);

  useEffect(() => {
    // Load Face API models
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error('Failed to load face models', err);
        setError('Failed to load proctoring models.');
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (modelsLoaded) startCamera();
    return () => stopCamera();
  }, [modelsLoaded]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      handleViolation('CAMERA_DENIED');
      setError('Camera access is required for this proctored exam. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
    }
    if (faceIntervalRef.current) clearInterval(faceIntervalRef.current);
  };

  const onPlayVideo = () => {
    faceIntervalRef.current = setInterval(async () => {
      if (videoRef.current) {
        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.1 }));
        if (detections.length === 0) {
          // No face detected
          if (!faceMissingStartRef.current) {
            faceMissingStartRef.current = Date.now();
          } else if (Date.now() - faceMissingStartRef.current >= 5000) {
            // Buffer of 5 seconds exceeded - Auto Submit Instantly Without Warning
            setAutoSubmitReason('Face not detected in camera view for 5 seconds.');
            setShowAutoSubmitModal(true);
            faceMissingStartRef.current = null;
          }
        } else {
          faceMissingStartRef.current = null; // Reset
        }
      }
    }, 1000); // Check every 1s
  };

  // Anti-Cheating Listeners
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) handleViolation('TAB_SWITCH');
    };
    const handleBlur = () => handleViolation('WINDOW_BLUR');
    const handleContextMenu = (e) => { e.preventDefault(); handleViolation('RIGHT_CLICK'); };
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) handleViolation('LEFT_FULLSCREEN');
    };
    const handleCopyPaste = (e) => { e.preventDefault(); handleViolation('COPY_PASTE'); };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
    };
  }, []);

  const handleViolation = async (type) => {
    if (submittingRef.current) return; // Prevent loops if already submitting
    
    if (type === 'COPY_PASTE') {
      copyPasteCountRef.current += 1;
      const count = copyPasteCountRef.current;
      if (count >= 4) {
        setAutoSubmitReason('Proctoring violation: Copy-paste limit exceeded (4 attempts).');
        setShowAutoSubmitModal(true);
      } else {
        setWarningModalMessage(`Copy/paste actions are strictly prohibited. Warning ${count} of 3. On your 4th attempt, the exam will be automatically submitted.`);
        setShowWarningModal(true);
      }
      
      try {
        await apiClient.post('/api/candidate/exam/violation', { attemptId, type: `COPY_PASTE_ATTEMPT_${count}` });
      } catch(e) {}
      return;
    }

    setWarningModalMessage(null);
    const time = new Date().toLocaleTimeString();
    setWarnings(prev => {
      const newWarnings = [...prev, { type, time }];
      if (newWarnings.length >= 3) {
        // Trigger Auto-submit
        autoSubmitExam('Proctoring violation limit exceeded (3 strikes).');
      } else {
        setShowWarningModal(true);
      }
      return newWarnings;
    });

    // Log to backend
    try {
      await apiClient.post('/api/candidate/exam/violation', { attemptId, type });
    } catch(e) {}
  };

  const autoSubmitExam = async (reason) => {
    setSubmitting(true);
    stopCamera();
    try {
      await apiClient.post('/api/candidate/exam/auto-submit', { attemptId, reason, answers: answersRef.current });
      navigate('/student/assignments/result');
    } catch (err) {
      alert('Error auto-submitting exam.');
    }
  };

  // Initial Fetch
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await apiClient.get('/api/candidate/questions');
        const qs = response.data.map((q) => {
          let parsedOptions = q.options;
          if (typeof q.options === 'string') {
            try {
              parsedOptions = JSON.parse(q.options);
            } catch (e) {
              console.error(e);
            }
          }
          return { ...q, options: parsedOptions };
        });
        setQuestions(qs);
        
        // Initialize answers array
        const initialAnswers = qs.map((q) => ({
          questionId: q.id,
          codeSubmitted: q.savedCode || q.starterCode || '',
          selectedOptionIndex: q.selectedOptionIndex !== undefined ? q.selectedOptionIndex : undefined,
        }));
        setAnswers(initialAnswers);
        
        // Try to go fullscreen
        try {
          const fsPromise = document.documentElement.requestFullscreen();
          if (fsPromise && typeof fsPromise.catch === 'function') {
            fsPromise.catch((e) => console.warn('Fullscreen request deferred:', e.message));
          }
        } catch(e) {}
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load questions.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    setRunOutput(null);
  }, [currentIdx]);

  const handleOptionSelect = (qId, optIdx) => {
    setAnswers(prev => prev.map(a => a.questionId === qId ? { ...a, selectedOptionIndex: optIdx } : a));
  };

  const handleCodeChange = (qId, val) => {
    const code = val || '';
    setAnswers(prev => prev.map(a => a.questionId === qId ? { ...a, codeSubmitted: code } : a));

    // Autosave
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      apiClient.post('/api/candidate/exam/save-code', { attemptId, questionId: qId, code }).catch(console.error);
    }, 1500);
  };

  const handleRunCode = async (qId, language, code) => {
    if (!language || !code) return;
    setIsRunningCode(true);
    setRunOutput('Executing code...');
    try {
      const response = await apiClient.post('/api/candidate/exam/run-code', { questionId: qId, language, code });
      setRunOutput(response.data.output);
      setRunStatus(prev => ({ ...prev, [qId]: true }));
    } catch (err) {
      setRunOutput(err.response?.data?.error || err.message || 'Execution failed.');
      setRunStatus(prev => ({ ...prev, [qId]: true }));
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleSubmit = async () => {
    const unrunCodingQs = questions.filter(q => q.type === 'CODING' && !runStatus[q.id]);
    if (unrunCodingQs.length > 0) {
      alert('You must run your code and check the output for all coding questions before you are allowed to submit the exam.');
      return;
    }

    if (!window.confirm('Are you sure you want to submit the exam? You cannot change answers after submitting.')) return;
    setSubmitting(true);
    stopCamera();
    try {
      await apiClient.post('/api/candidate/exam/submit', { attemptId, answers });
      navigate('/student/assignments/result');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit exam.');
      setSubmitting(false);
      startCamera();
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error && !questions.length) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 p-6">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center max-w-md">
          <ShieldAlert className="h-12 w-12 text-rose-600 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const currentA = answers.find(a => a.questionId === currentQ?.id);

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-350 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="font-black text-white text-lg tracking-tight">Technical Assessment</div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-rose-50 border border-rose-200 rounded-full text-xs font-bold text-rose-650">
            <ShieldAlert className="h-3.5 w-3.5" /> Proctored Session
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Warnings</span>
            <div className="flex gap-1">
              {[0, 1].map(i => (
                <div key={i} className={`h-2.5 w-6 rounded-full ${i < warnings.length ? 'bg-rose-500' : 'bg-slate-800'}`} />
              ))}
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-xl bg-indigo-650 hover:bg-indigo-700 px-6 py-2 text-sm font-bold text-white shadow transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar / Question Nav */}
        <div className="w-16 sm:w-64 border-r border-slate-800 bg-slate-950 flex flex-col">
          {/* Camera Feed */}
          <div className="p-3 border-b border-slate-800 bg-black aspect-video relative shrink-0 flex items-center justify-center">
            <video ref={videoRef} onPlay={onPlayVideo} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover rounded opacity-80" />
            {!modelsLoaded && <div className="z-10 text-[10px] text-indigo-400 font-bold bg-black/60 px-2 py-1 rounded">Loading Proctoring...</div>}
            <div className="absolute top-2 left-2 z-10 h-2 w-2 rounded-full bg-rose-500 animate-pulse"></div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 hidden sm:block">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 text-left">Questions Map</h3>
            <div className="grid grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const ans = answers.find(a => a.questionId === q.id);
                const isAnswered = q.type === 'MCQ' ? ans?.selectedOptionIndex !== undefined : !!ans?.codeSubmitted?.trim();
                const isCurrent = currentIdx === idx;
                
                let btnClass = 'h-10 w-full rounded-lg border text-xs font-bold transition-all flex items-center justify-center cursor-pointer ';
                if (isCurrent) btnClass += 'bg-indigo-600 border-indigo-500 text-white shadow-md';
                else if (isAnswered) btnClass += 'bg-emerald-900/30 border-emerald-950 text-emerald-400';
                else btnClass += 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800';

                return (
                  <button key={q.id} onClick={() => setCurrentIdx(idx)} className={btnClass}>
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative">
          {currentQ && (
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              <div className="flex items-center gap-3 mb-6">
                <span className="flex h-8 items-center justify-center rounded-lg bg-indigo-950/60 border border-indigo-900/50 px-3 text-sm font-black text-indigo-400">
                  Q{currentIdx + 1}
                </span>
                <span className="text-[10px] font-black uppercase bg-slate-850 text-slate-400 px-2 py-1 rounded">
                  {currentQ.type}
                </span>
                <span className="text-[10px] font-black uppercase bg-indigo-950/40 border border-indigo-900/50 text-indigo-400 px-2 py-1 rounded">
                  {currentQ.marks} Marks
                </span>
              </div>

              <div className="text-lg font-semibold text-white mb-8 whitespace-pre-wrap leading-relaxed text-left">
                {currentQ.text}
              </div>

              {currentQ.type === 'MCQ' && (
                <div className="space-y-3 max-w-2xl text-left">
                  {currentQ.options?.map((opt, oIdx) => {
                    const isSelected = currentA?.selectedOptionIndex === oIdx;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleOptionSelect(currentQ.id, oIdx)}
                        className={`w-full text-left flex items-center gap-4 rounded-xl border p-4 transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-950/30 border-indigo-500 shadow-sm'
                            : 'bg-slate-950 border-slate-850 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                          isSelected ? 'border-indigo-500 bg-indigo-650 text-white' : 'border-slate-700 bg-slate-900 text-slate-400'
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </div>
                        <span className={`text-sm ${isSelected ? 'text-white font-semibold' : 'text-slate-300'}`}>
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQ.type === 'CODING' && (
                <div className="flex-1 flex flex-col min-h-[400px] gap-4">
                  <div className="flex-1 flex flex-col border border-slate-800 rounded-xl overflow-hidden">
                    <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                      <span className="text-xs font-bold uppercase text-slate-400">{currentQ.language} Editor</span>
                      <span className="text-[10px] text-slate-500">Autosaved continuously</span>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                      <Editor
                        height="100%"
                        language={currentQ.language?.toLowerCase()}
                        theme="vs-dark"
                        value={currentA?.codeSubmitted}
                        onChange={(val) => handleCodeChange(currentQ.id, val)}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          scrollBeyondLastLine: false,
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex flex-col gap-2">
                    <button
                      onClick={() => handleRunCode(currentQ.id, currentQ.language, currentA?.codeSubmitted)}
                      disabled={isRunningCode || !currentA?.codeSubmitted?.trim()}
                      className="self-start rounded-lg bg-emerald-600 hover:bg-emerald-500 px-6 py-2 text-sm font-bold text-white transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                      {isRunningCode ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                           Running...
                        </>
                      ) : (
                        '▶ Run Code'
                      )}
                    </button>
                    {runOutput && (
                      <div className="rounded-xl border border-slate-800 bg-black p-4 text-left">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Console Output</div>
                        <pre className="text-xs text-slate-350 font-mono whitespace-pre-wrap">{runOutput}</pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Nav */}
          <div className="border-t border-slate-800 bg-slate-955 bg-slate-950 p-4 shrink-0 flex items-center justify-between">
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-850 bg-slate-900 px-6 py-2.5 text-sm font-bold text-slate-300 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            
            <div className="text-xs font-bold text-slate-500">
              {currentIdx + 1} of {questions.length}
            </div>

            <button
              onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIdx === questions.length - 1}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-30 transition-all cursor-pointer"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {showAutoSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-rose-900 bg-slate-950 p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-955/50 text-rose-500 mx-auto mb-6">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-black text-white text-center mb-2">Exam Auto-Submitted</h2>
            <p className="text-slate-400 text-center text-sm mb-6">
              {autoSubmitReason}
            </p>
            <button
              onClick={() => {
                if (autoSubmitReason) {
                  autoSubmitExam(autoSubmitReason);
                }
                setShowAutoSubmitModal(false);
                setAutoSubmitReason(null);
              }}
              className="w-full rounded-xl bg-rose-600 hover:bg-rose-500 py-3.5 text-sm font-bold text-white shadow-lg transition-all cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-rose-900 bg-slate-950 p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-955/50 text-rose-500 mx-auto mb-6">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-black text-white text-center mb-2">Proctoring Warning</h2>
            <p className="text-slate-400 text-center text-sm mb-6 leading-relaxed">
              {warningModalMessage ? (
                warningModalMessage
              ) : (
                <>
                  We detected a violation: <span className="font-bold text-rose-450">{warnings[warnings.length - 1]?.type.replace(/_/g, ' ')}</span>.
                  <br/><br/>
                  This is warning <span className="font-bold text-white">{warnings.length} of 2</span>. 
                  On your 3rd warning, your exam will be automatically submitted and flagged.
                </>
              )}
            </p>
            <button
              onClick={() => {
                setShowWarningModal(false);
                try { 
                  const p = document.documentElement.requestFullscreen();
                  if (p && typeof p.catch === 'function') p.catch(() => {});
                } catch(e) {}
              }}
              className="w-full rounded-xl bg-rose-600 hover:bg-rose-500 py-3.5 text-sm font-bold text-white shadow-lg transition-all cursor-pointer"
            >
              I Understand, Continue Exam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamScreen;
