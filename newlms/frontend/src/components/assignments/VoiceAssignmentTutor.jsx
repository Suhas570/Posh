import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Edit3, Mic, CheckCircle2, Clock, Award, 
  FileText, X, AlertCircle, Eye, RefreshCw, Volume2, Sparkles 
} from 'lucide-react';
import axios from 'axios';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';

const API_BASE = 'http://localhost:5001/api/assignments';

const getLocalStoredAssignments = () => {
  try {
    const stored = localStorage.getItem('lms_voice_assignments');
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return [];
};

const saveLocalStoredAssignments = (items) => {
  try {
    localStorage.setItem('lms_voice_assignments', JSON.stringify(items));
  } catch (e) {}
};

const VoiceAssignmentTutor = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);
  const [selectedAssignmentTitle, setSelectedAssignmentTitle] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 15,
    questions: [
      {
        text: '',
        options: ['', ''],
        correctAnswer: '',
        marks: 5
      }
    ]
  });

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      const dbItems = res.data || [];
      const localItems = getLocalStoredAssignments();
      const map = new Map();
      [...dbItems, ...localItems].forEach(a => {
        if (a && a.id && !map.has(a.id)) map.set(a.id, a);
      });
      const combined = Array.from(map.values());
      setAssignments(combined);
      saveLocalStoredAssignments(combined);
    } catch (err) {
      console.warn('Failed to fetch from backend, loading local storage cache');
      setAssignments(getLocalStoredAssignments());
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/submissions/all`);
      setSubmissions(res.data || []);
    } catch (err) {
      console.warn('Failed to fetch submissions');
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      duration: 15,
      questions: [
        {
          text: '',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option A',
          marks: 5
        }
      ]
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (assignment) => {
    setEditingId(assignment.id);
    setFormData({
      title: assignment.title || '',
      description: assignment.description || '',
      duration: assignment.duration || 15,
      questions: assignment.questions && assignment.questions.length > 0
        ? assignment.questions.map(q => ({
            text: q.text || '',
            options: q.options ? [...q.options] : ['Option A', 'Option B'],
            correctAnswer: q.correctAnswer || (q.options ? q.options[0] : ''),
            marks: q.marks || 5
          }))
        : [{ text: '', options: ['Option A', 'Option B'], correctAnswer: 'Option A', marks: 5 }]
    });
    setShowModal(true);
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Voice Assistance Assignment?')) return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
      fetchAssignments();
    } catch (err) {
      alert('Failed to delete assignment');
    }
  };

  const handleAddQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          text: '',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option A',
          marks: 5
        }
      ]
    }));
  };

  const handleRemoveQuestion = (index) => {
    if (formData.questions.length <= 1) {
      alert('Assignment must have at least 1 question');
      return;
    }
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleQuestionChange = (qIndex, field, value) => {
    setFormData(prev => {
      const updatedQ = [...prev.questions];
      updatedQ[qIndex] = { ...updatedQ[qIndex], [field]: value };
      return { ...prev, questions: updatedQ };
    });
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    setFormData(prev => {
      const updatedQ = [...prev.questions];
      const newOpts = [...updatedQ[qIndex].options];
      const oldVal = newOpts[optIndex];
      newOpts[optIndex] = value;
      
      // Update correctAnswer if it matched the changed option
      let newCorrect = updatedQ[qIndex].correctAnswer;
      if (newCorrect === oldVal || !newOpts.includes(newCorrect)) {
        newCorrect = value;
      }
      
      updatedQ[qIndex] = { ...updatedQ[qIndex], options: newOpts, correctAnswer: newCorrect };
      return { ...prev, questions: updatedQ };
    });
  };

  const handleAddOption = (qIndex) => {
    setFormData(prev => {
      const updatedQ = [...prev.questions];
      const newOptLabel = `Option ${String.fromCharCode(65 + updatedQ[qIndex].options.length)}`;
      updatedQ[qIndex].options.push(newOptLabel);
      return { ...prev, questions: updatedQ };
    });
  };

  const handleRemoveOption = (qIndex, optIndex) => {
    setFormData(prev => {
      const updatedQ = [...prev.questions];
      if (updatedQ[qIndex].options.length <= 2) {
        alert('Each question must have at least 2 options');
        return prev;
      }
      const removedVal = updatedQ[qIndex].options[optIndex];
      updatedQ[qIndex].options.splice(optIndex, 1);
      
      if (updatedQ[qIndex].correctAnswer === removedVal) {
        updatedQ[qIndex].correctAnswer = updatedQ[qIndex].options[0] || '';
      }
      return { ...prev, questions: updatedQ };
    });
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter assignment title');
      return;
    }
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.text.trim()) {
        alert(`Question #${i + 1} text cannot be empty`);
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        alert(`Question #${i + 1} contains empty options`);
        return;
      }
    }

    try {
      const payload = { ...formData, status: 'Published' };
      let savedItem;
      if (editingId) {
        const res = await axios.put(`${API_BASE}/${editingId}`, payload);
        savedItem = res.data;
      } else {
        const res = await axios.post(API_BASE, payload);
        savedItem = res.data;
      }
      const currentLocals = getLocalStoredAssignments();
      const updatedLocals = editingId 
        ? currentLocals.map(a => a.id === editingId ? savedItem : a)
        : [savedItem, ...currentLocals];
      saveLocalStoredAssignments(updatedLocals);
      
      try {
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('lms_voice_assignments_channel');
          bc.postMessage({ type: 'ASSIGNMENT_PUBLISHED' });
          bc.close();
        }
      } catch (e) {}

      setShowModal(false);
      fetchAssignments();
    } catch (err) {
      console.warn('Backend save notice, publishing locally:', err);
      const fallbackItem = {
        id: editingId || `voice-assign-${Date.now()}`,
        ...formData,
        status: 'Published',
        tutorId: 'tutor-1',
        tutorName: 'Tutor Manoj',
        totalMarks: formData.questions.reduce((acc, q) => acc + (Number(q.marks) || 1), 0),
        createdAt: new Date().toISOString()
      };
      const currentLocals = getLocalStoredAssignments();
      const updatedLocals = editingId 
        ? currentLocals.map(a => a.id === editingId ? fallbackItem : a)
        : [fallbackItem, ...currentLocals];
      saveLocalStoredAssignments(updatedLocals);

      try {
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('lms_voice_assignments_channel');
          bc.postMessage({ type: 'ASSIGNMENT_PUBLISHED' });
          bc.close();
        }
      } catch (e) {}

      setAssignments(updatedLocals);
      setShowModal(false);
    }
  };

  const handleViewSubmissions = (assignment) => {
    setSelectedAssignmentTitle(assignment.title);
    const filtered = submissions.filter(s => s.assignmentId === assignment.id);
    setSelectedSubmissions(filtered);
    setShowSubmissionsModal(true);
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-brand-50 via-indigo-50/40 to-purple-50/30 p-5 rounded-2xl border border-brand-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-600 text-white rounded-xl shadow-md">
            <Mic size={22} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              Voice Assistance Assignments
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                Voice Enabled
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Create speech-driven quizzes with audio question synthesis and voice recognition response evaluation.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchAssignments}
            className="bg-white text-xs border-slate-200"
            icon={RefreshCw}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            className="bg-brand-600 hover:bg-brand-700 text-xs shadow-md shadow-brand-200"
            icon={Plus}
          >
            Create Voice Assignment
          </Button>
        </div>
      </div>

      {/* Assignment List Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 font-medium animate-pulse">
          Loading Voice Assistance Assignments...
        </div>
      ) : assignments.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center border border-dashed border-slate-300 bg-slate-50/50">
          <div className="p-4 bg-white rounded-2xl shadow-sm text-brand-500 border border-slate-200 mb-3">
            <Volume2 size={32} />
          </div>
          <h4 className="text-sm font-bold text-slate-700">No Voice Assignments Created Yet</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Click the "Create Voice Assignment" button above to publish your first audio-enabled student quiz.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            className="mt-4 text-xs bg-brand-600"
            icon={Plus}
          >
            Create Now
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assignments.map(a => {
            const assignmentSubmissions = submissions.filter(s => s.assignmentId === a.id);
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-slate-200/80 hover:border-brand-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={11} /> Voice Quiz
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> {a.duration || 15} mins
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-800 line-clamp-1 mb-1">{a.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                    {a.description || 'Interactive voice assignment quiz.'}
                  </p>

                  {/* Metadata Chips */}
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

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleViewSubmissions(a)}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <Eye size={14} /> Submissions ({assignmentSubmissions.length})
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(a)}
                      className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="Edit Assignment"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(a.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Assignment"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT ASSIGNMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-8 text-left"
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-500 rounded-xl">
                  <Mic size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold tracking-tight">
                    {editingId ? 'Edit Voice Assistance Assignment' : 'Create Voice Assistance Assignment'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Configure questions, options, correct answers, and speech duration.</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveAssignment} className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Speech & Voice Recognition Checkpoint"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData(p => ({ ...p, duration: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Provide instructions for students taking this voice assignment..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <hr className="border-slate-100 my-4" />

              {/* Questions Section */}
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <FileText size={15} className="text-brand-600" />
                  Questions ({formData.questions.length})
                </h4>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddQuestion}
                  className="text-xs border-brand-200 text-brand-600 bg-brand-50 hover:bg-brand-100"
                  icon={Plus}
                >
                  Add Question
                </Button>
              </div>

              <div className="space-y-4">
                {formData.questions.map((q, qIndex) => (
                  <div key={qIndex} className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3 relative">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-slate-800">Question #{qIndex + 1}</span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Marks:</span>
                          <input
                            type="number"
                            min="1"
                            value={q.marks}
                            onChange={(e) => handleQuestionChange(qIndex, 'marks', Number(e.target.value))}
                            className="w-16 px-2 py-1 text-xs border border-slate-200 rounded-lg text-center font-bold bg-white"
                          />
                        </div>
                        {formData.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIndex)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                            title="Remove Question"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>

                    <input
                      type="text"
                      required
                      value={q.text}
                      onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                      placeholder={`Enter question #${qIndex + 1} text...`}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />

                    {/* Options list */}
                    <div className="space-y-2 pt-1">
                      <label className="block text-[11px] font-bold text-slate-600">Options & Answers:</label>
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 w-5">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                            className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-brand-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(qIndex, optIndex)}
                            className="text-slate-400 hover:text-rose-500 p-1"
                            title="Remove Option"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAddOption(qIndex)}
                        className="text-[11px] font-bold text-brand-600 hover:underline flex items-center gap-1 pt-1"
                      >
                        <Plus size={12} /> Add Custom Option
                      </button>
                    </div>

                    {/* Correct Answer Selector */}
                    <div className="pt-2">
                      <label className="block text-[11px] font-bold text-emerald-700 mb-1">
                        Select Correct Answer *
                      </label>
                      <select
                        value={q.correctAnswer}
                        onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-emerald-300 rounded-xl bg-emerald-50/50 font-bold text-emerald-900 focus:outline-none"
                      >
                        {q.options.map((opt, i) => (
                          <option key={i} value={opt}>
                            {String.fromCharCode(65 + i)}. {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="text-xs bg-brand-600 hover:bg-brand-700 shadow-md"
                >
                  {editingId ? 'Save Changes' : 'Publish Voice Assignment'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* SUBMISSIONS INSPECTOR MODAL */}
      {showSubmissionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-8 text-left"
          >
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold">Student Submissions & Grading Reports</h3>
                <p className="text-[11px] text-slate-400">{selectedAssignmentTitle}</p>
              </div>
              <button
                onClick={() => setShowSubmissionsModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
              {selectedSubmissions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No submissions recorded yet for this assignment.
                </div>
              ) : (
                selectedSubmissions.map(sub => (
                  <div key={sub.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-slate-800 block">{sub.studentName} ({sub.studentId})</span>
                        <span className="text-[10px] text-slate-400">
                          Submitted on: {new Date(sub.submittedAt).toLocaleString()}
                        </span>
                      </div>
                      <span className="font-black px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs">
                        Score: {sub.finalScore} / {sub.totalMarks} ({sub.percentage}%)
                      </span>
                    </div>

                    {/* Detailed Question & Answer Breakdown */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Question Breakdown:</span>
                      {sub.studentAnswers?.map((ans, aIdx) => (
                        <div key={aIdx} className={`p-2.5 rounded-xl border text-[11px] flex items-center justify-between ${
                          ans.isCorrect ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-rose-50/60 border-rose-200 text-rose-900'
                        }`}>
                          <div>
                            <span className="font-bold block">{aIdx + 1}. {ans.questionText}</span>
                            <span className="text-[10px] text-slate-600">
                              Student Answer: <span className="font-semibold">{ans.selectedAnswer}</span>
                              {!ans.isCorrect && <span className="text-rose-600 font-semibold ml-2">(Correct: {ans.correctAnswer})</span>}
                            </span>
                          </div>
                          <span className="font-extrabold text-xs ml-2">
                            {ans.marksObtained} / {ans.totalMarks} Pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssignmentTutor;
