import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Search, Plus, Calendar as CalendarIcon, UserCheck, Paperclip, Trash2 } from 'lucide-react';
import { courseService } from '../../services/courseService';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

const Announcements = () => {
  const [anns, setAnns] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  
  // Create state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAnn, setNewAnn] = useState({
    title: '',
    content: '',
    target: 'All Students',
    courseId: '',
    scheduleDate: '',
    attachmentName: ''
  });

  const loadData = () => {
    setAnns(courseService.getAnnouncements());
    setCourses(courseService.getCourses());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newAnn.title || !newAnn.content) return;

    let targetCourseTitle = '';
    if (newAnn.target === 'Specific Course' && newAnn.courseId) {
      const c = courses.find(item => item.id === newAnn.courseId);
      if (c) targetCourseTitle = c.title;
    }

    courseService.createAnnouncement({
      title: newAnn.title,
      content: newAnn.content,
      target: newAnn.target,
      courseId: newAnn.courseId,
      courseTitle: targetCourseTitle,
      files: newAnn.attachmentName ? [newAnn.attachmentName] : []
    });

    setIsCreateOpen(false);
    setNewAnn({ title: '', content: '', target: 'All Students', courseId: '', scheduleDate: '', attachmentName: '' });
    loadData();
  };

  const filtered = anns.filter(a => {
    return a.title.toLowerCase().includes(search.toLowerCase()) || 
           a.content.toLowerCase().includes(search.toLowerCase());
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
        title="Announcements Broadcast"
        subtitle="Publish notices to batches or course students, attach syllabus sheets, and schedule posts."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            icon={Megaphone}
            className="text-xs bg-brand-600 hover:bg-brand-700"
          >
            New Announcement
          </Button>
        }
      />

      {/* Search Filter bar */}
      <div className="relative mb-6">
        <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
          <Search size={16} />
        </span>
        <input
          type="text"
          placeholder="Search announcements by title or content text..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs font-semibold py-2.5 pl-10 pr-4 bg-white border border-slate-200/50 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/10 transition-all placeholder-slate-400 shadow-sm"
        />
      </div>

      {/* Announcements List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50/20">
          <Megaphone size={28} className="text-slate-400 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-600">No announcements found</h4>
          <p className="text-[11px] text-slate-400">Create one above to send notices to students.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((ann) => (
            <Card key={ann.id} className="p-5 bg-white border border-slate-100 flex flex-col gap-3 text-left">
              <div className="flex items-start justify-between gap-3 border-b border-slate-50 pb-2.5">
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-xs font-bold text-slate-800">{ann.title}</h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Published on {ann.date}</span>
                </div>
                
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-brand-50 text-brand-600 border border-brand-100 rounded-full">
                  Target: {ann.target} {ann.courseTitle ? `(${ann.courseTitle})` : ''}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {ann.content}
              </p>

              {/* Attachments */}
              {ann.files && ann.files.length > 0 && (
                <div className="flex items-center gap-1.5 mt-1 bg-slate-50 border border-slate-100 p-2 rounded-xl self-start">
                  <Paperclip size={11} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500">{ann.files[0]}</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Broadcast New Announcement"
        size="md"
      >
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4 text-left">
          <Input
            label="Announcement Title"
            value={newAnn.title}
            onChange={(e) => setNewAnn(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Scheduled Maintenance / Exam Outlines"
            required
          />

          <Select
            label="Target Audience"
            options={['All Students', 'Specific Course', 'Specific Batch']}
            value={newAnn.target}
            onChange={(e) => setNewAnn(prev => ({ ...prev, target: e.target.value }))}
          />

          {newAnn.target === 'Specific Course' && (
            <Select
              label="Select Course"
              options={courses.map(c => ({ value: c.id, label: c.title }))}
              value={newAnn.courseId}
              onChange={(e) => setNewAnn(prev => ({ ...prev, courseId: e.target.value }))}
              required
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Schedule Date (Optional)"
              type="date"
              value={newAnn.scheduleDate}
              onChange={(e) => setNewAnn(prev => ({ ...prev, scheduleDate: e.target.value }))}
            />
            <Input
              label="Attach File Name (e.g. syllabus.pdf)"
              value={newAnn.attachmentName}
              onChange={(e) => setNewAnn(prev => ({ ...prev, attachmentName: e.target.value }))}
              placeholder="e.g. agenda.pdf"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Announcement Body (Rich Text Mock)</label>
            <textarea
              value={newAnn.content}
              onChange={(e) => setNewAnn(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your broadcast content here..."
              rows={4}
              required
              className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)} className="text-xs border-slate-200">
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="text-xs bg-brand-600 hover:bg-brand-700">
              Publish Broadcast
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Announcements;
