import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, Trash2, Eye, PlayCircle, FileText, Link as LinkIcon, Folder } from 'lucide-react';
import Table from '../common/Table';
import Button from '../common/Button';

const CourseTable = ({ courses = [], onDelete }) => {
  const navigate = useNavigate();

  const headers = [
    'Course Info',
    'Category',
    'Instructor',
    'Duration / Level',
    'Content Size',
    'Status',
    'Actions',
  ];

  return (
    <Table headers={headers} isEmpty={courses.length === 0} emptyMessage="No courses matching the filters.">
      {courses.map((course) => {
        let videoCount = 0;
        let noteCount = 0;
        let pptCount = 0;
        let resCount = 0;

        if (course.curriculum) {
          course.curriculum.forEach(m => {
            m.lessons.forEach(l => {
              if (l.videoUrl) videoCount++;
              if (l.pdfFile) noteCount++;
              if (l.pptFile) pptCount++;
              resCount += l.resources?.length || 0;
            });
          });
        }

        return (
          <tr key={course.id} className="hover:bg-slate-50/40 transition-colors">
            {/* Title / Description */}
            <td className="px-6 py-4">
              <div className="flex flex-col text-left max-w-xs">
                <span className="text-sm font-bold text-slate-800 line-clamp-1">{course.title}</span>
                <span className="text-xs text-slate-400 line-clamp-1 mt-0.5">{course.description}</span>
              </div>
            </td>

            {/* Category */}
            <td className="px-6 py-4">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wider">
                {course.category}
              </span>
            </td>

            {/* Instructor */}
            <td className="px-6 py-4 text-sm font-medium text-slate-600">
              {course.instructor}
            </td>

            {/* Duration / Level */}
            <td className="px-6 py-4">
              <div className="flex flex-col text-left text-xs font-semibold text-slate-500">
                <span>{course.duration}</span>
                <span className="text-[10px] text-slate-400 font-medium">{course.level}</span>
              </div>
            </td>

            {/* Content Size */}
            <td className="px-6 py-4">
              <div className="flex items-center gap-2.5 text-slate-400">
                <div className="flex items-center gap-0.5" title={`${videoCount} Videos`}>
                  <PlayCircle size={13} className="text-brand-500" />
                  <span className="text-xs font-bold text-slate-600">{videoCount}</span>
                </div>
                <div className="flex items-center gap-0.5" title={`${noteCount} Notes`}>
                  <FileText size={13} className="text-emerald-500" />
                  <span className="text-xs font-bold text-slate-600">{noteCount}</span>
                </div>
                <div className="flex items-center gap-0.5" title={`${pptCount} PPTs`}>
                  <Folder size={13} className="text-blue-500" />
                  <span className="text-xs font-bold text-slate-600">{pptCount}</span>
                </div>
                <div className="flex items-center gap-0.5" title={`${resCount} Resources`}>
                  <LinkIcon size={13} className="text-indigo-500" />
                  <span className="text-xs font-bold text-slate-600">{resCount}</span>
                </div>
              </div>
            </td>

            {/* Status */}
            <td className="px-6 py-4">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                ${course.status === 'Published'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : 'bg-amber-50 text-amber-600 border border-amber-100'
                }`}
              >
                {course.status}
              </span>
            </td>

            {/* Actions */}
            <td className="px-6 py-4">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50/50"
                  onClick={() => navigate(`/courses/${course.id}`)}
                  title="Manage Content"
                >
                  <Eye size={15} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50/50"
                  onClick={() => navigate(`/courses/edit/${course.id}`)}
                  title="Edit Info"
                >
                  <Edit3 size={15} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50/50"
                  onClick={() => onDelete(course.id)}
                  title="Delete Course"
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            </td>
          </tr>
        );
      })}
    </Table>
  );
};

export default CourseTable;
