import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Presentation, 
  FileCode, 
  Image as ImageIcon, 
  Search, 
  Download, 
  Trash2, 
  UploadCloud, 
  Plus, 
  SlidersHorizontal,
  X,
  Check
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

const ContentLibrary = () => {
  const [libraryFiles, setLibraryFiles] = useState([]);
  const [filterType, setFilterType] = useState('All'); // All, PDF, PPT, Document, Image
  const [searchQuery, setSearchQuery] = useState('');
  
  // Upload Modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  
  const [fileMetadata, setFileMetadata] = useState({
    title: '',
    type: 'PDF',
    description: ''
  });

  const fileInputRef = useRef(null);

  const loadData = () => {
    // Collect all files from courses curriculum
    const courses = courseService.getCourses();
    const files = [];

    // Add mock files
    courses.forEach(c => {
      if (c.curriculum) {
        c.curriculum.forEach(m => {
          m.lessons.forEach(l => {
            if (l.pdfFile) {
              files.push({
                id: `lib-pdf-${l.id}`,
                title: l.pdfFile.name,
                type: 'PDF',
                size: l.pdfFile.size,
                url: l.pdfFile.url || '#',
                courseName: c.title,
                date: 'June 2026'
              });
            }
            if (l.pptFile) {
              files.push({
                id: `lib-ppt-${l.id}`,
                title: l.pptFile.name,
                type: 'PPT',
                size: l.pptFile.size,
                url: l.pptFile.url || '#',
                courseName: c.title,
                date: 'June 2026'
              });
            }
          });
        });
      }
    });

    // Load any custom uploads
    const custom = JSON.parse(localStorage.getItem('tutor_lms_custom_library')) || [];
    setLibraryFiles([...files, ...custom]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFileSelect(e.dataTransfer.files[0]);
    }
  };

  const processFileSelect = (file) => {
    setUploadedFile({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
    });
    setFileMetadata(prev => ({
      ...prev,
      title: file.name.split('.')[0]
    }));

    // Sim uploader
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadedFile || !fileMetadata.title) return;

    const custom = JSON.parse(localStorage.getItem('tutor_lms_custom_library')) || [];
    const newFile = {
      id: `custom-lib-${Math.random().toString(36).substr(2, 9)}`,
      title: fileMetadata.title,
      type: fileMetadata.type,
      size: uploadedFile.size,
      url: '#',
      courseName: 'Central Repository',
      date: 'Just now'
    };

    const updated = [...custom, newFile];
    localStorage.setItem('tutor_lms_custom_library', JSON.stringify(updated));
    setLibraryFiles(prev => [...prev, newFile]);

    // Reset uploader
    setIsUploadOpen(false);
    setUploadedFile(null);
    setUploadProgress(0);
    setFileMetadata({ title: '', type: 'PDF', description: '' });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    
    if (id.startsWith('custom-lib-')) {
      const custom = JSON.parse(localStorage.getItem('tutor_lms_custom_library')) || [];
      const filtered = custom.filter(f => f.id !== id);
      localStorage.setItem('tutor_lms_custom_library', JSON.stringify(filtered));
    }
    setLibraryFiles(prev => prev.filter(f => f.id !== id));
  };

  const filtered = libraryFiles.filter(f => {
    const matchSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === 'All' ? true : f.type === filterType;
    return matchSearch && matchType;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'PDF': return FileText;
      case 'PPT': return Presentation;
      case 'Image': return ImageIcon;
      default: return FileCode;
    }
  };

  const getColorClass = (type) => {
    switch (type) {
      case 'PDF': return 'bg-rose-50 text-rose-600 border-rose-100/50';
      case 'PPT': return 'bg-blue-50 text-blue-600 border-blue-100/50';
      case 'Image': return 'bg-emerald-50 text-emerald-600 border-emerald-100/50';
      default: return 'bg-purple-50 text-purple-600 border-purple-100/50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col text-left mb-8"
    >
      <PageHeader
        title="Content Library Repository"
        subtitle="Access all linked curriculum resources, PDFs, slide decks, and documents globally."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            icon={Plus}
            className="text-xs bg-brand-600 hover:bg-brand-700"
          >
            Upload File
          </Button>
        }
      />

      {/* Filters & Search Panel */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm mb-6">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search resources by file name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold py-2.5 pl-10 pr-4 bg-[#f8fafc] border border-slate-200/50 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/10 transition-all placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto select-none max-w-full">
          {['All', 'PDF', 'PPT', 'Document', 'Image'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap
                ${filterType === type 
                  ? 'bg-brand-50 text-brand-600' 
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              {type}s
            </button>
          ))}
        </div>
      </div>

      {/* Library Grid View */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50/20">
          <FileText size={28} className="text-slate-400 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-600">No resources found</h4>
          <p className="text-[11px] text-slate-400">Add course materials or custom uploads to seed this list.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((file) => {
            const Icon = getIcon(file.type);
            const color = getColorClass(file.type);
            return (
              <Card key={file.id} className="p-4 border border-slate-100 flex items-start justify-between gap-4 group text-left">
                <div className="flex gap-4">
                  <div className={`p-3 rounded-2xl border flex-shrink-0 flex items-center justify-center ${color}`}>
                    <Icon size={22} />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-brand-600 transition-colors">
                        {file.title}
                      </h4>
                      <span className="text-[8px] font-extrabold uppercase px-1 rounded bg-slate-100 text-slate-400 border border-slate-200">
                        {file.type}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      {file.size} • {file.date}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold truncate max-w-[200px] mt-1">
                      Origin: {file.courseName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 border border-transparent hover:border-slate-100 transition-all"
                    title="Download File"
                  >
                    <Download size={14} />
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600"
                    onClick={() => handleDelete(file.id)}
                    title="Delete File"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload File Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Central File Resource"
        size="md"
      >
        <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4 text-left">
          <Input
            label="File Name Title"
            value={fileMetadata.title}
            onChange={(e) => setFileMetadata(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. syllabus_curriculum"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Resource Type"
              options={['PDF', 'PPT', 'Document', 'Image']}
              value={fileMetadata.type}
              onChange={(e) => setFileMetadata(prev => ({ ...prev, type: e.target.value }))}
            />
            <Input
              label="Resource Description"
              value={fileMetadata.description}
              onChange={(e) => setFileMetadata(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g. Summer schedule files"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-700">Drop your file</span>
            
            {!uploadedFile ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <UploadCloud size={28} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-700">Drag & drop or <span className="text-brand-600 underline">Browse</span></span>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && processFileSelect(e.target.files[0])}
                />
              </div>
            ) : (
              <div className="p-3 border border-slate-100 rounded-xl flex flex-col gap-2 bg-white">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 truncate">{uploadedFile.name}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{uploadedFile.size}</span>
                </div>
                
                {isUploading ? (
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-brand-500 h-full" style={{ width: `${uploadProgress}%` }} />
                  </div>
                ) : (
                  <span className="text-[9px] text-emerald-600 font-extrabold uppercase flex items-center gap-1">
                    <Check size={10} /> Completed
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
            <Button variant="secondary" onClick={() => setIsUploadOpen(false)} className="text-xs border-slate-200">
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isUploading || !uploadedFile} className="text-xs bg-brand-600 hover:bg-brand-700">
              Save to Library
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default ContentLibrary;
