import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useCourses } from '../../hooks/useCourses';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import CourseCard from '../../components/courses/CourseCard';
import CourseTable from '../../components/courses/CourseTable';
import CourseFilters from '../../components/courses/CourseFilters';
import Modal from '../../components/common/Modal';

const Courses = () => {
  const navigate = useNavigate();
  const { courses, loading, error, deleteCourse } = useCourses();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('card');

  // Deletion Modal state
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      deleteCourse(deleteTargetId);
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
    }
  };

  // Filter logic
  const filteredCourses = courses
    .filter(c => {
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          c.instructor.toLowerCase().includes(search.toLowerCase());
      const matchCat = category ? c.category === category : true;
      const matchStatus = status ? c.status === status : true;
      return matchSearch && matchCat && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'duration') {
        const durA = parseInt(a.duration) || 0;
        const durB = parseInt(b.duration) || 0;
        return durB - durA;
      }
      // default: newest
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const actions = (
    <Button
      variant="primary"
      size="sm"
      onClick={() => navigate('/courses/add')}
      icon={Plus}
      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-blue-500/10 text-xs"
    >
      Add Course
    </Button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col text-left"
    >
      {/* Top Page Header */}
      <PageHeader
        title="Courses Management"
        subtitle="Manage basic information, level tags, YouTube videos, slide links, and PDFs."
        actions={actions}
      />

      {/* Filters, search, and switchers */}
      <CourseFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        status={status}
        setStatus={setStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Loader & Empty states */}
      {loading ? (
        <div className="flex justify-center py-20">
          <svg className="animate-spin h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-100 text-center py-16">
          <span className="text-slate-400 mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <SlidersHorizontal size={24} />
          </span>
          <h3 className="text-sm font-bold text-slate-800 mb-1">No courses found</h3>
          <p className="text-xs text-slate-500 max-w-xs mb-5">
            Try adjusting your search queries, sorting dropdowns, or categories.
          </p>
          <Button variant="primary" size="sm" onClick={() => navigate('/courses/add')}>
            Create a Course
          </Button>
        </div>
      ) : (
        /* Render Layout depending on View Mode */
        <div className="mb-8">
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          ) : (
            <CourseTable
              courses={filteredCourses}
              onDelete={handleDeleteClick}
            />
          )}
        </div>
      )}

      {/* Floating Add Course Button at bottom right */}
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/courses/add')}
        className="fixed bottom-6 right-6 p-4 bg-brand-600 text-white rounded-full shadow-xl hover:bg-brand-700 z-30 flex items-center justify-center focus:outline-none"
        title="Add Course"
      >
        <Plus size={20} />
      </motion.button>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Course Confirmation"
        size="sm"
      >
        <div className="flex flex-col gap-4 text-center">
          <div className="p-3 bg-red-50 text-red-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
            <Trash2 size={22} />
          </div>
          <h4 className="text-sm font-bold text-slate-800">Are you absolutely sure?</h4>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            This action will permanently delete this course and all associated videos, lecture notes, PPT files, and resource lists.
          </p>
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              className="text-xs border-slate-200"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              className="text-xs"
            >
              Delete Course
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Courses;
