import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { courseService } from '../../services/courseService';
import { notesService } from '../../services/notesService';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import NotesCard from '../../components/courses/NotesCard';
import NotesForm from '../../components/courses/NotesForm';

const Notes = () => {
  const [courses, setCourses] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  
  const [editNote, setEditNote] = useState(null);

  const loadData = () => {
    const list = courseService.getCourses();
    setCourses(list);
    
    const notes = [];
    list.forEach(c => {
      if (c.learningContent?.notes) {
        c.learningContent.notes.forEach(n => {
          notes.push({ ...n, courseId: c.id, courseTitle: c.title });
        });
      }
    });
    setAllNotes(notes);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditClick = (note) => {
    setEditNote(note);
  };

  const handleEditSubmit = (noteData) => {
    if (editNote) {
      notesService.updateNote(editNote.courseId, editNote.id, noteData);
      setEditNote(null);
      loadData();
    }
  };

  const handleDelete = (courseId, noteId) => {
    if (window.confirm('Delete this notes file?')) {
      notesService.deleteNote(courseId, noteId);
      loadData();
    }
  };

  const filtered = allNotes.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase());
    const matchCourse = selectedCourse ? n.courseId === selectedCourse : true;
    return matchSearch && matchCourse;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col text-left mb-8"
    >
      <PageHeader
        title="All Lecture Notes (PDF)"
        subtitle="Manage all linked PDF lecture sheets, summaries, and references globally."
      />

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm mb-6">
        <input
          type="text"
          placeholder="Search notes by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs font-semibold py-2.5 px-3.5 bg-[#f8fafc] border border-slate-200/50 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/10 transition-all placeholder-slate-400 flex-1 w-full"
        />

        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="text-xs font-semibold py-2.5 px-3.5 bg-[#f8fafc] border border-slate-200/50 rounded-xl focus:outline-none focus:border-brand-500 cursor-pointer w-full md:w-56"
        >
          <option value="">All Courses</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {/* Grid List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50/20">
          <FileText size={28} className="text-slate-400 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-600">No notes found</h4>
          <p className="text-[11px] text-slate-400">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(note => (
            <div key={note.id} className="relative group">
              <NotesCard
                note={note}
                onEdit={handleEditClick}
                onDelete={() => handleDelete(note.courseId, note.id)}
              />
              <span className="absolute top-2.5 right-24 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-brand-50 text-brand-600 border border-brand-100 shadow-sm pointer-events-none hidden md:block">
                Course: {note.courseTitle}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={!!editNote}
        onClose={() => setEditNote(null)}
        title="Edit Notes Reference"
        size="md"
      >
        {editNote && (
          <NotesForm
            initialData={editNote}
            onSubmit={handleEditSubmit}
            onClose={() => setEditNote(null)}
          />
        )}
      </Modal>
    </motion.div>
  );
};

export default Notes;
