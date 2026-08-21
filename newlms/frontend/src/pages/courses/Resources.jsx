import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link as LinkIcon } from 'lucide-react';
import { courseService } from '../../services/courseService';
import { resourceService } from '../../services/resourceService';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import ResourceCard from '../../components/courses/ResourceCard';
import ResourceForm from '../../components/courses/ResourceForm';

const Resources = () => {
  const [courses, setCourses] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  
  const [editResource, setEditResource] = useState(null);

  const loadData = () => {
    const list = courseService.getCourses();
    setCourses(list);
    
    const res = [];
    list.forEach(c => {
      if (c.learningContent?.resources) {
        c.learningContent.resources.forEach(r => {
          res.push({ ...r, courseId: c.id, courseTitle: c.title });
        });
      }
    });
    setAllResources(res);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditClick = (res) => {
    setEditResource(res);
  };

  const handleEditSubmit = (resData) => {
    if (editResource) {
      resourceService.updateResource(editResource.courseId, editResource.id, resData);
      setEditResource(null);
      loadData();
    }
  };

  const handleDelete = (courseId, resId) => {
    if (window.confirm('Delete this resource link?')) {
      resourceService.deleteResource(courseId, resId);
      loadData();
    }
  };

  const filtered = allResources.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchCourse = selectedCourse ? r.courseId === selectedCourse : true;
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
        title="All Reference Resources"
        subtitle="Manage all linked external repositories, documents, and reference links globally."
      />

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm mb-6">
        <input
          type="text"
          placeholder="Search resources by title..."
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
          <LinkIcon size={28} className="text-slate-400 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-600">No resources found</h4>
          <p className="text-[11px] text-slate-400">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(res => (
            <div key={res.id} className="relative group">
              <ResourceCard
                resource={res}
                onEdit={handleEditClick}
                onDelete={() => handleDelete(res.courseId, res.id)}
              />
              <span className="absolute top-2.5 right-24 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-brand-50 text-brand-600 border border-brand-100 shadow-sm pointer-events-none hidden md:block">
                Course: {res.courseTitle}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={!!editResource}
        onClose={() => setEditResource(null)}
        title="Edit Resource Reference Link"
        size="md"
      >
        {editResource && (
          <ResourceForm
            initialData={editResource}
            onSubmit={handleEditSubmit}
            onClose={() => setEditResource(null)}
          />
        )}
      </Modal>
    </motion.div>
  );
};

export default Resources;
