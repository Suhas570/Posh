import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Presentation } from 'lucide-react';
import { courseService } from '../../services/courseService';
import { pptService } from '../../services/pptService';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import PPTCard from '../../components/courses/PPTCard';
import PPTForm from '../../components/courses/PPTForm';

const PPT = () => {
  const [courses, setCourses] = useState([]);
  const [allPPTs, setAllPPTs] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  
  const [editPPT, setEditPPT] = useState(null);

  const loadData = () => {
    const list = courseService.getCourses();
    setCourses(list);
    
    const ppts = [];
    list.forEach(c => {
      if (c.learningContent?.ppts) {
        c.learningContent.ppts.forEach(p => {
          ppts.push({ ...p, courseId: c.id, courseTitle: c.title });
        });
      }
    });
    setAllPPTs(ppts);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditClick = (ppt) => {
    setEditPPT(ppt);
  };

  const handleEditSubmit = (pptData) => {
    if (editPPT) {
      pptService.updatePPT(editPPT.courseId, editPPT.id, pptData);
      setEditPPT(null);
      loadData();
    }
  };

  const handleDelete = (courseId, pptId) => {
    if (window.confirm('Delete this PPT link?')) {
      pptService.deletePPT(courseId, pptId);
      loadData();
    }
  };

  const filtered = allPPTs.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchCourse = selectedCourse ? p.courseId === selectedCourse : true;
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
        title="All Lecture Slides (PPT)"
        subtitle="Manage all presentation slide decks and lesson summaries globally."
      />

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm mb-6">
        <input
          type="text"
          placeholder="Search PPT files by title..."
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
          <Presentation size={28} className="text-slate-400 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-600">No PPT slides found</h4>
          <p className="text-[11px] text-slate-400">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(ppt => (
            <div key={ppt.id} className="relative group">
              <PPTCard
                ppt={ppt}
                onEdit={handleEditClick}
                onDelete={() => handleDelete(ppt.courseId, ppt.id)}
              />
              <span className="absolute top-2.5 right-24 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-brand-50 text-brand-600 border border-brand-100 shadow-sm pointer-events-none hidden md:block">
                Course: {ppt.courseTitle}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={!!editPPT}
        onClose={() => setEditPPT(null)}
        title="Edit PPT Presentation"
        size="md"
      >
        {editPPT && (
          <PPTForm
            initialData={editPPT}
            onSubmit={handleEditSubmit}
            onClose={() => setEditPPT(null)}
          />
        )}
      </Modal>
    </motion.div>
  );
};

export default PPT;
