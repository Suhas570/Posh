import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Eye, Trash2, Edit3, Film } from 'lucide-react';
import { courseService } from '../../services/courseService';
import { videoService } from '../../services/videoService';
import { getYouTubeId } from '../../utils/helpers';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import VideoCard from '../../components/courses/VideoCard';
import VideoForm from '../../components/courses/VideoForm';

const Videos = () => {
  const [courses, setCourses] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  
  // Modals state
  const [previewVideo, setPreviewVideo] = useState(null);
  const [editVideo, setEditVideo] = useState(null);
  const [editCourseId, setEditCourseId] = useState('');

  const loadData = () => {
    const list = courseService.getCourses();
    setCourses(list);
    
    const vids = [];
    list.forEach(c => {
      if (c.learningContent?.videos) {
        c.learningContent.videos.forEach(v => {
          vids.push({ ...v, courseId: c.id, courseTitle: c.title });
        });
      }
    });
    setAllVideos(vids);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditClick = (video) => {
    setEditVideo(video);
    setEditCourseId(video.courseId);
  };

  const handleEditSubmit = (videoData) => {
    if (editVideo) {
      videoService.updateVideo(editVideo.courseId, editVideo.id, videoData);
      setEditVideo(null);
      loadData();
    }
  };

  const handleDelete = (courseId, videoId) => {
    if (window.confirm('Delete this video?')) {
      videoService.deleteVideo(courseId, videoId);
      loadData();
    }
  };

  const filtered = allVideos.filter(v => {
    const matchSearch = v.title.toLowerCase().includes(search.toLowerCase());
    const matchCourse = selectedCourse ? v.courseId === selectedCourse : true;
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
        title="All Uploaded Videos"
        subtitle="Manage all YouTube lectures, animated guidelines, and pre-recorded teachings globally."
      />

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm mb-6">
        <input
          type="text"
          placeholder="Search videos by title..."
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
          <Film size={28} className="text-slate-400 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-600">No videos found</h4>
          <p className="text-[11px] text-slate-400">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(video => (
            <div key={video.id} className="relative group">
              <VideoCard
                video={video}
                onPreview={(v) => setPreviewVideo(v)}
                onEdit={handleEditClick}
                onDelete={() => handleDelete(video.courseId, video.id)}
              />
              <span className="absolute top-2 left-2 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-brand-600 text-white z-10 shadow pointer-events-none max-w-[130px] truncate">
                {video.courseTitle}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={!!previewVideo}
        onClose={() => setPreviewVideo(null)}
        title={previewVideo ? `Preview: ${previewVideo.title}` : ''}
        size="lg"
      >
        {previewVideo && (
          <div className="flex flex-col gap-4 text-left">
            <div className="w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
              {getYouTubeId(previewVideo.url) ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${getYouTubeId(previewVideo.url)}?autoplay=1`}
                  title={previewVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={previewVideo.url} className="w-full h-full" controls autoPlay />
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editVideo}
        onClose={() => setEditVideo(null)}
        title="Edit Video Information"
        size="md"
      >
        {editVideo && (
          <VideoForm
            initialData={editVideo}
            onSubmit={handleEditSubmit}
            onClose={() => setEditVideo(null)}
          />
        )}
      </Modal>
    </motion.div>
  );
};

export default Videos;
