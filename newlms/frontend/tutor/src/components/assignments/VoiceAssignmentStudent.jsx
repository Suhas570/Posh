import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Volume2, VolumeX, Play, Pause, RotateCcw, 
  ChevronRight, ChevronLeft, CheckCircle, AlertCircle, Award, 
  Clock, FileText, Check, X, Sparkles, Send, Eye, ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import Card from '../common/Card';
import Button from '../common/Button';

const API_BASE = 'http://localhost:5001/api/assignments';

const getLocalStoredAssignments = () => {
  try {
    const stored = localStorage.getItem('lms_voice_assignments');
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return [];
};

const VoiceAssignmentStudent = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active assignment state
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: optionText }
  
  // Voice engine states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [autoRead, setAutoRead] = useState(true);

  // Submission & Result state
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // Web Speech API refs
  const recognitionRef = useRef(null);

  const fetchAssignments = async () => {
    setLoading(true);
    let apiItems = [];
    try {
      const res = await axios.get(`${API_BASE}?status=Published`);
      if (Array.isArray(res.data)) apiItems.push(...res.data);
    } catch (e) {}

    try {
      const res = await axios.get(API_BASE);
      if (Array.isArray(res.data)) apiItems.push(...res.data);
    } catch (e) {}

    try {
      const res = await axios.get('http://localhost:5000/api/student/assignments');
      if (Array.isArray(res.data)) apiItems.push(...res.data);
    } catch (e) {}

    const localItems = getLocalStoredAssignments();
    const map = new Map();
    [...apiItems, ...localItems].forEach(a => {
      if (a && a.id && (a.status || 'Published') === 'Published' && !map.has(a.id)) {
        map.set(a.id, a);
      }
    });
    setAssignments(Array.from(map.values()));
    setLoading(false);
  };

  const fetchStudentSubmissions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/submissions/student/student-1`);
      setSubmissions(res.data || []);
    } catch (err) {}
  };

  useEffect(() => {
    fetchAssignments();
    fetchStudentSubmissions();

    // 3s Polling Interval for live updates from Tutor
    const pollInterval = setInterval(() => {
      fetchAssignments();
    }, 3000);

    // BroadcastChannel listener for instant cross-tab sync
    let channel;
    try {
      if ('BroadcastChannel' in window) {
        channel = new BroadcastChannel('lms_voice_assignments_channel');
        channel.onmessage = () => {
          fetchAssignments();
          fetchStudentSubmissions();
        };
      }
    } catch (e) {}

    const handleFocusOrStorage = () => {
      fetchAssignments();
      fetchStudentSubmissions();
    };

    window.addEventListener('focus', handleFocusOrStorage);
    window.addEventListener('storage', handleFocusOrStorage);

    return () => {
      clearInterval(pollInterval);
      if (channel) channel.close();
      window.removeEventListener('focus', handleFocusOrStorage);
      window.removeEventListener('storage', handleFocusOrStorage);
      stopSpeech();
      stopListening();
    };
  }, []);

  // ----------------------------------------------------
  // SPEECH SYNTHESIS (TTS) - Reads text aloud
  // ----------------------------------------------------
  const speakText = (text, onEndCallback) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEndCallback) onEndCallback();
    };
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const readCurrentQuestion = () => {
    if (!activeAssignment || !activeAssignment.questions[currentIndex]) return;
    const q = activeAssignment.questions[currentIndex];
    let speechString = `Question ${currentIndex + 1}. ${q.text}. `;

    if (q.options && q.options.length > 0) {
      speechString += 'Options are: ';
      q.options.forEach((opt, idx) => {
        const optionLabel = String.fromCharCode(65 + idx);
        speechString += `Option ${optionLabel}: ${opt}. `;
      });
    }

    speechString += 'Please speak your option or say next question.';
    speakText(speechString);
  };

  // Auto-read when question changes
  useEffect(() => {
    if (activeAssignment && autoRead) {
      readCurrentQuestion();
    }
  }, [currentIndex, activeAssignment]);

  // ----------------------------------------------------
  // SPEECH RECOGNITION (STT) - Listens for spoken answers
  // ----------------------------------------------------
  // Refs to maintain current active state in async speech callbacks
  const activeAssignmentRef = useRef(activeAssignment);
  const currentIndexRef = useRef(currentIndex);
  const selectedAnswersRef = useRef(selectedAnswers);
  const isListeningRef = useRef(isListening);

  useEffect(() => {
    activeAssignmentRef.current = activeAssignment;
  }, [activeAssignment]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Enhanced Speech Recognition with Auto-Restart
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Google Chrome or MS Edge.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        processVoiceCommand(currentTranscript);
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition notice:', err.error);
      };

      recognition.onend = () => {
        if (isListeningRef.current && activeAssignmentRef.current) {
          try { recognition.start(); } catch (e) { setIsListening(false); }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Failed to initialize SpeechRecognition:', e);
    }
  };

  const stopListening = () => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const processVoiceCommand = (spokenText) => {
    const active = activeAssignmentRef.current;
    const cIdx = currentIndexRef.current;
    if (!active || !active.questions[cIdx]) return;

    const lower = spokenText.toLowerCase().trim();
    const q = active.questions[cIdx];

    // 1. Voice Navigation & Action Commands
    if (lower.includes('next') || lower.includes('go next') || lower.includes('next question')) {
      handleNextQuestion();
      setTranscript('');
      return;
    }
    if (lower.includes('previous') || lower.includes('go back') || lower.includes('previous question')) {
      handlePrevQuestion();
      setTranscript('');
      return;
    }
    if (lower.includes('repeat') || lower.includes('read again') || lower.includes('repeat question')) {
      readCurrentQuestion();
      setTranscript('');
      return;
    }
    if (lower.includes('submit') || lower.includes('finish') || lower.includes('done') || lower.includes('submit assignment')) {
      handleSubmitAssignment();
      setTranscript('');
      return;
    }

    // 2. Multi-format Option Speech Matching (Letters, Words, Ordinals, Numbers & Phrases)
    if (q.options && q.options.length > 0) {
      const numberWords = ['one', 'two', 'three', 'four', 'five'];
      const ordinalWords = ['first', 'second', 'third', 'fourth', 'fifth'];

      q.options.forEach((opt, idx) => {
        const optionLetter = String.fromCharCode(65 + idx).toLowerCase();
        const optionNumberStr = String(idx + 1);
        const numWord = numberWords[idx] || '';
        const ordWord = ordinalWords[idx] || '';
        const optLower = opt.toLowerCase().trim();

        const matchesLabel = lower.includes(`option ${optionLetter}`) || lower.includes(`option ${optionNumberStr}`);
        const matchesNumber = lower.includes(numWord) || lower.includes(ordWord) || lower.split(' ').includes(optionNumberStr);
        const matchesLetter = lower.split(' ').includes(optionLetter) || lower.endsWith(` ${optionLetter}`) || lower.startsWith(`${optionLetter} `);
        const matchesPhrase = optLower.length >= 3 && lower.includes(optLower);

        if (matchesLabel || matchesNumber || matchesLetter || matchesPhrase) {
          handleSelectAnswer(q.id, opt);
          speakText(`Selected option ${optionLetter.toUpperCase()}, ${opt}`);
          setTranscript(`Selected: Option ${optionLetter.toUpperCase()} (${opt})`);
        }
      });
    }
  };

  const handleStartAssignment = (assignment) => {
    setActiveAssignment(assignment);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setSubmissionResult(null);
    setShowResultModal(false);
    startListening();
  };

  const handleSelectAnswer = (qId, optionText) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: optionText
    }));
  };

  const handleNextQuestion = () => {
    if (!activeAssignment) return;
    stopSpeech();
    if (currentIndex < activeAssignment.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (!activeAssignment) return;
    stopSpeech();
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmitAssignment = async () => {
    const active = activeAssignmentRef.current || activeAssignment;
    if (!active) return;
    
    stopSpeech();
    stopListening();
    setSubmitting(true);

    const answersMap = selectedAnswersRef.current || selectedAnswers;
    const payload = {
      studentId: 'student-1',
      studentName: 'Manoj',
      answers: answersMap
    };

    try {
      const res = await axios.post(`${API_BASE}/${active.id}/submit`, payload);
      setSubmissionResult(res.data);
      setShowResultModal(true);
      fetchStudentSubmissions();
    } catch (err) {
      console.warn('Backend submit notice, calculating score locally:', err);
      let finalScore = 0;
      let totalMarks = 0;
      const studentAnswers = active.questions.map(q => {
        const selectedAnswer = answersMap[q.id] || 'No Answer';
        const isCorrect = selectedAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
        const marksObtained = isCorrect ? q.marks : 0;
        finalScore += marksObtained;
        totalMarks += q.marks;
        return {
          questionId: q.id,
          questionText: q.text,
          selectedAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect,
          marksObtained,
          totalMarks: q.marks
        };
      });

      const percentage = totalMarks > 0 ? Number(((finalScore / totalMarks) * 100).toFixed(2)) : 0;
      const localResult = {
        id: `sub-${Date.now()}`,
        assignmentId: active.id,
        assignmentTitle: active.title,
        studentId: 'student-1',
        studentName: 'Manoj',
        tutorId: active.tutorId || 'tutor-1',
        studentAnswers,
        finalScore,
        totalMarks,
        percentage,
        submittedAt: new Date().toISOString(),
        status: 'Completed'
      };

      try {
        const stored = localStorage.getItem('lms_voice_submissions');
        const list = stored ? JSON.parse(stored) : [];
        localStorage.setItem('lms_voice_submissions', JSON.stringify([localResult, ...list]));
      } catch (e) {}

      setSubmissionResult(localResult);
      setShowResultModal(true);
      setSubmissions(prev => [localResult, ...prev]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExitAssignment = () => {
    stopSpeech();
    stopListening();
    setActiveAssignment(null);
    setSubmissionResult(null);
    setShowResultModal(false);
  };

  if (activeAssignment) {
    const currentQ = activeAssignment.questions[currentIndex];
    const isAnswered = selectedAnswers[currentQ?.id] !== undefined;

    return (
      <div className="flex flex-col gap-6 text-left max-w-4xl mx-auto">
        <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400 bg-brand-900/60 px-2.5 py-1 rounded-full border border-brand-700/50">
              Voice Test Mode
            </span>
            <h3 className="text-base font-extrabold mt-1">{activeAssignment.title}</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={readCurrentQuestion}
              className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
                isSpeaking 
                  ? 'bg-brand-500 text-white border-brand-400 animate-pulse' 
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
              title="Read Question Aloud"
            >
              <Volume2 size={16} />
              {isSpeaking ? 'Speaking...' : 'Read Aloud'}
            </button>

            <button
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
                isListening
                  ? 'bg-emerald-500 text-white border-emerald-400 animate-pulse shadow-lg shadow-emerald-500/30'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
              title="Toggle Voice Mic"
            >
              {isListening ? <Mic size={16} /> : <MicOff size={16} />}
              {isListening ? 'Listening' : 'Mic Off'}
            </button>

            <button
              onClick={handleExitAssignment}
              className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
              title="Exit Test"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {isListening && (
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between text-xs text-emerald-900 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="font-bold">Voice Recognition Active:</span>
              <span className="italic text-emerald-700">
                {transcript || 'Say option name (e.g. "Option A") or "Next"...'}
              </span>
            </div>
            <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Speech Enabled
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
          <span>Question {currentIndex + 1} of {activeAssignment.questions.length}</span>
          <span>Marks: {currentQ?.marks} Pts</span>
        </div>

        <Card className="p-8 border border-slate-200/80 shadow-lg bg-white rounded-3xl space-y-6">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              Question #{currentIndex + 1}
            </span>
            <h2 className="text-base font-extrabold text-slate-800 leading-snug">
              {currentQ?.text}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentQ?.options?.map((opt, idx) => {
              const optionLabel = String.fromCharCode(65 + idx);
              const isSelected = selectedAnswers[currentQ.id] === opt;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    handleSelectAnswer(currentQ.id, opt);
                    speakText(`Selected ${opt}`);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-brand-50 border-brand-500 text-brand-900 shadow-md ring-2 ring-brand-500/20 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold ${
                      isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {optionLabel}
                    </span>
                    <span className="text-xs">{opt}</span>
                  </div>
                  {isSelected && <CheckCircle size={18} className="text-brand-600" />}
                </button>
              );
            })}
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrevQuestion}
              disabled={currentIndex === 0}
              className="text-xs"
              icon={ChevronLeft}
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {currentIndex < activeAssignment.questions.length - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNextQuestion}
                  className="text-xs bg-brand-600 hover:bg-brand-700"
                  icon={ChevronRight}
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmitAssignment}
                  disabled={submitting}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200"
                  icon={Send}
                >
                  {submitting ? 'Submitting...' : 'Submit Voice Assignment'}
                </Button>
              )}
            </div>
          </div>
        </Card>

        {showResultModal && submissionResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 text-center space-y-5"
            >
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full w-16 h-16 mx-auto flex items-center justify-center border border-emerald-100">
                <Award size={36} />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-800">Assignment Submitted Successfully!</h3>
                <p className="text-xs text-slate-500 mt-1">{activeAssignment.title}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Final Score</span>
                  <span className="text-base font-extrabold text-brand-600">
                    {submissionResult.finalScore} / {submissionResult.totalMarks}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Percentage</span>
                  <span className="text-base font-extrabold text-emerald-600">
                    {submissionResult.percentage}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Status</span>
                  <span className="text-xs font-bold text-slate-700 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full inline-block mt-1">
                    {submissionResult.status}
                  </span>
                </div>
              </div>

              <div className="text-left space-y-2 max-h-48 overflow-y-auto pr-1">
                <span className="text-xs font-bold text-slate-700 block">Question Performance:</span>
                {submissionResult.studentAnswers?.map((sa, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    sa.isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                  }`}>
                    <div>
                      <p className="font-bold text-slate-800 line-clamp-1">{idx + 1}. {sa.questionText}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Answer: <span className="font-semibold">{sa.selectedAnswer}</span>
                        {!sa.isCorrect && (
                          <span className="text-rose-600 ml-2">(Correct: {sa.correctAnswer})</span>
                        )}
                      </p>
                    </div>
                    <span className={`font-extrabold text-xs ${sa.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {sa.marksObtained} / {sa.totalMarks} Pts
                    </span>
                  </div>
                ))}
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleExitAssignment}
                className="w-full text-xs bg-slate-900 hover:bg-slate-800"
              >
                Back to Assignments Portal
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
            <Mic size={28} className="animate-pulse text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black flex items-center gap-2">
              Voice Assistance Assignments Portal
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-white/20 text-white uppercase tracking-wider">
                Accessibility Ready
              </span>
            </h3>
            <p className="text-xs text-white/80 mt-1 max-w-lg leading-relaxed">
              Listen to questions synthesized aloud and answer using your voice microphone. Fully accessible for visually impaired learners.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
          Available Voice Assignments ({assignments.length})
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-medium animate-pulse">
            Loading Voice Assignments...
          </div>
        ) : assignments.length === 0 ? (
          <Card className="p-10 text-center flex flex-col items-center justify-center border border-dashed border-slate-300 bg-slate-50/50">
            <Volume2 size={32} className="text-slate-400 mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No Voice Assignments Available</h4>
            <p className="text-xs text-slate-400 mt-1">Check back later when your instructor publishes new audio quizzes.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {assignments.map(a => {
              const mySubmission = submissions.find(s => s.assignmentId === a.id);

              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-slate-200 hover:border-emerald-400 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={11} /> Voice Enabled
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                        <Clock size={12} /> {a.duration || 15} mins
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-800 line-clamp-1 mb-1">{a.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                      {a.description || 'Interactive voice assignment audio test.'}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center gap-2">
                        <FileText size={14} className="text-brand-500" />
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Questions</span>
                          <span className="text-xs font-extrabold text-slate-700">{a.questions?.length || 0} Items</span>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center gap-2">
                        <Award size={14} className="text-amber-500" />
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Total Marks</span>
                          <span className="text-xs font-extrabold text-slate-700">{a.totalMarks || 0} Pts</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    {mySubmission ? (
                      <span className="text-[11px] font-extrabold text-emerald-600 flex items-center gap-1">
                        <ShieldCheck size={14} /> Completed ({mySubmission.percentage}%)
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-600">Pending</span>
                    )}

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStartAssignment(a)}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200"
                      icon={Mic}
                    >
                      {mySubmission ? 'Retake Test' : 'Start Voice Test'}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAssignmentStudent;
