import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  CheckCircle2, 
  FileEdit, 
  Video, 
  FileText, 
  Link as LinkIcon, 
  Sparkles,
  TrendingUp,
  FolderOpen,
  Plus,
  Megaphone,
  UserCheck,
  Clock,
  Presentation
} from 'lucide-react';

import { courseService } from '../../services/courseService';
import StatsCard from '../../components/dashboard/StatsCard';
import QuickActions from '../../components/dashboard/QuickActions';
import RecentCourses from '../../components/dashboard/RecentCourses';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const Dashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    totalVideos: 0,
    totalNotes: 0,
    totalPPTs: 0,
    totalResources: 0
  });

  // Modal control states
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false);
  const [isUploadContentOpen, setIsUploadContentOpen] = useState(false);

  // Announcement State
  const [announcementInput, setAnnouncementInput] = useState({
    title: '',
    target: 'All Students',
    content: ''
  });

  // Upload Content State
  const [contentInput, setContentInput] = useState({
    type: 'Video',
    title: '',
    url: '',
    videoType: 'YouTube',
    description: ''
  });

  const loadData = () => {
    const allCourses = courseService.getCourses();
    const allActivities = courseService.getActivities();
    setCourses(allCourses);
    setActivities(allActivities);

    let vids = 0;
    let notes = 0;
    let ppts = 0;
    let resources = 0;

    allCourses.forEach(c => {
      // Calculate from curriculum structure
      if (c.curriculum) {
        c.curriculum.forEach(m => {
          m.lessons.forEach(l => {
            if (l.videoUrl) vids++;
            if (l.pdfFile) notes++;
            if (l.pptFile) ppts++;
            resources += l.resources?.length || 0;
          });
        });
      }
    });

    setStats({
      totalCourses: allCourses.length,
      publishedCourses: allCourses.filter(c => c.status === 'Published').length,
      draftCourses: allCourses.filter(c => c.status === 'Draft').length,
      totalVideos: vids,
      totalNotes: notes,
      totalPPTs: ppts,
      totalResources: resources
    });

    if (allCourses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(allCourses[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementInput.title || !announcementInput.content) return;
    
    courseService.createAnnouncement({
      title: announcementInput.title,
      content: announcementInput.content,
      target: announcementInput.target,
      courseId: selectedCourseId,
      courseTitle: courses.find(c => c.id === selectedCourseId)?.title || ''
    });

    setIsAnnounceModalOpen(false);
    setAnnouncementInput({ title: '', target: 'All Students', content: '' });
    loadData();
  };

  const handleUploadContent = (e) => {
    e.preventDefault();
    if (!selectedCourseId || !contentInput.title) return;

    const allCourses = courseService.getCourses();
    const idx = allCourses.findIndex(c => c.id === selectedCourseId);
    if (idx !== -1) {
      const targetCourse = allCourses[idx];
      if (!targetCourse.curriculum || targetCourse.curriculum.length === 0) {
        // Create a default module if empty
        targetCourse.curriculum = [{
          id: 'mod-default',
          title: 'Module 1: Getting Started',
          lessons: []
        }];
      }

      const defaultModule = targetCourse.curriculum[0];
      const newLesson = {
        id: `les-quick-${Math.random().toString(36).substr(2, 9)}`,
        title: contentInput.title,
        description: contentInput.description,
        videoUrl: contentInput.type === 'Video' ? contentInput.url : null,
        videoType: contentInput.type === 'Video' ? contentInput.videoType : null,
        pdfFile: contentInput.type === 'Note' ? { name: contentInput.title + '.pdf', size: '1.8 MB' } : null,
        pptFile: contentInput.type === 'PPT' ? { name: contentInput.title + '.pptx', size: '3.4 MB' } : null,
        resources: contentInput.type === 'Resource' ? [{ id: 'quick-res', title: contentInput.title, url: contentInput.url, type: 'Documentation' }] : []
      };

      defaultModule.lessons.push(newLesson);
      localStorage.setItem('tutor_lms_courses', JSON.stringify(allCourses));

      courseService.addActivity({
        type: contentInput.type.toLowerCase(),
        text: `Uploaded quick content "${contentInput.title}" to ${targetCourse.title}`,
        courseId: selectedCourseId
      });
    }

    setIsUploadContentOpen(false);
    setContentInput({ type: 'Video', title: '', url: '', videoType: 'YouTube', description: '' });
    loadData();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 text-left"
    >
      {/* Header Greeting */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black text-indigo-600 tracking-tight flex items-center gap-2">
          Good Morning, Manoj! <span className="animate-bounce">👋</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Here's a breakdown of your learning contents and course developments today.
        </p>
      </div>

      {/* 7 Stats Cards in Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatsCard title="Total Courses" value={stats.totalCourses} icon={BookOpen} colorClass="brand" />
        <StatsCard title="Published" value={stats.publishedCourses} icon={CheckCircle2} colorClass="green" />
        <StatsCard title="Drafts" value={stats.draftCourses} icon={FileEdit} colorClass="amber" />
        <StatsCard title="Total Videos" value={stats.totalVideos} icon={Video} colorClass="blue" />
        <StatsCard title="Total Notes" value={stats.totalNotes} icon={FileText} colorClass="rose" />
        <StatsCard title="Total PPTs" value={stats.totalPPTs} icon={Presentation} colorClass="purple" />
        <StatsCard title="Total Resources" value={stats.totalResources} icon={LinkIcon} colorClass="indigo" />
      </div>

      {/* Grid: Activities, Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Recent Activity (Left) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="p-5 bg-white border border-slate-100 shadow-premium flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={14} className="text-brand-500" /> Recent Activities
            </h3>
            
            <div className="flex flex-col divide-y divide-slate-50">
              {activities.length === 0 ? (
                <span className="text-xs text-slate-400 font-medium py-4">No recent activity logs.</span>
              ) : (
                activities.map((act) => (
                  <div key={act.id} className="py-3 flex items-start gap-3 first:pt-0 last:pb-0">
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 mt-0.5">
                      {act.type === 'video' ? <Video size={13} /> : act.type === 'note' ? <FileText size={13} /> : <BookOpen size={13} />}
                    </div>
                    <div className="flex flex-col gap-0.5 leading-tight text-left">
                      <span className="text-xs font-semibold text-slate-700">{act.text}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{act.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions (Right) */}
        <div className="flex flex-col gap-4">
          <Card className="p-5 bg-[#faf6eb]/90 border border-[#eadabe]/85 shadow-premium flex flex-col gap-4 text-left hover:border-[#dfcead]">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-brand-500" /> Quick Actions Panel
            </h3>
            
            <div className="flex flex-col gap-2.5">
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/courses/add')}
                className="w-full text-left p-3.5 bg-brand-50/50 hover:bg-brand-50 border border-brand-100/50 rounded-2xl flex items-center justify-between text-brand-700 transition-all font-bold text-xs cursor-pointer shadow-sm shadow-brand-500/5"
              >
                <span>Create New Course Onboarding</span>
                <Plus size={14} />
              </motion.button>

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsUploadContentOpen(true)}
                className="w-full text-left p-3.5 bg-blue-50/50 hover:bg-blue-50 border border-blue-100/50 rounded-2xl flex items-center justify-between text-blue-700 transition-all font-bold text-xs cursor-pointer shadow-sm shadow-blue-500/5"
              >
                <span>Upload Lesson Materials</span>
                <Video size={14} />
              </motion.button>

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAnnounceModalOpen(true)}
                className="w-full text-left p-3.5 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100/50 rounded-2xl flex items-center justify-between text-emerald-700 transition-all font-bold text-xs cursor-pointer shadow-sm shadow-emerald-500/5"
              >
                <span>Broadcast Announcement</span>
                <Megaphone size={14} />
              </motion.button>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Courses list */}
      <RecentCourses courses={courses} />

      {/* Broadcast Announcement Modal */}
      <Modal
        isOpen={isAnnounceModalOpen}
        onClose={() => setIsAnnounceModalOpen(false)}
        title="Quick Broadcast Announcement"
        size="md"
      >
        <form onSubmit={handleCreateAnnouncement} className="flex flex-col gap-4 text-left">
          <Select
            label="Upload to Course Target"
            options={courses.map(c => ({ value: c.id, label: c.title }))}
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
          />
          <Input
            label="Announcement Title"
            value={announcementInput.title}
            onChange={(e) => setAnnouncementInput(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Schedule Change Notice"
            required
          />
          <Select
            label="Target Audience"
            options={['All Students', 'Specific Course']}
            value={announcementInput.target}
            onChange={(e) => setAnnouncementInput(prev => ({ ...prev, target: e.target.value }))}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Notice Body</label>
            <textarea
              value={announcementInput.content}
              onChange={(e) => setAnnouncementInput(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write the message text here..."
              rows={4}
              required
              className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 bg-white"
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
            <Button variant="secondary" onClick={() => setIsAnnounceModalOpen(false)} className="text-xs border-slate-200">
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="text-xs bg-brand-600 hover:bg-brand-700">
              Publish Notice
            </Button>
          </div>
        </form>
      </Modal>

      {/* Upload Quick Content Modal */}
      <Modal
        isOpen={isUploadContentOpen}
        onClose={() => setIsUploadContentOpen(false)}
        title="Upload Lesson Materials"
        size="md"
      >
        <form onSubmit={handleUploadContent} className="flex flex-col gap-4 text-left">
          <Select
            label="Target Course"
            options={courses.map(c => ({ value: c.id, label: c.title }))}
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Content Type"
              options={['Video', 'Note', 'PPT', 'Resource']}
              value={contentInput.type}
              onChange={(e) => setContentInput(prev => ({ ...prev, type: e.target.value }))}
            />
            
            {contentInput.type === 'Video' && (
              <Select
                label="Video Stream Format"
                options={['YouTube', 'Animated Video', 'Pre-recorded Video']}
                value={contentInput.videoType}
                onChange={(e) => setContentInput(prev => ({ ...prev, videoType: e.target.value }))}
              />
            )}
          </div>

          <Input
            label="Material Title"
            value={contentInput.title}
            onChange={(e) => setContentInput(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Session 1 Cheat Sheet"
            required
          />

          {(contentInput.type === 'Video' || contentInput.type === 'Resource') && (
            <Input
              label="URL Link Path"
              value={contentInput.url}
              onChange={(e) => setContentInput(prev => ({ ...prev, url: e.target.value }))}
              placeholder="e.g. https://www.example.com"
              required
            />
          )}

          <Input
            label="Material Description (Optional)"
            value={contentInput.description}
            onChange={(e) => setContentInput(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Summary outlines..."
          />

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
            <Button variant="secondary" onClick={() => setIsUploadContentOpen(false)} className="text-xs border-slate-200">
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="text-xs bg-brand-600 hover:bg-brand-700">
              Save Material
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Dashboard;
