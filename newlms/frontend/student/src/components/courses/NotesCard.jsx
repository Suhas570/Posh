import React from 'react';
import { FileText, Download, Edit3, Trash2, ExternalLink } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const NotesCard = ({ note, onEdit, onDelete }) => {
  return (
    <Card className="p-4 border border-slate-100 flex items-start justify-between gap-4 group text-left">
      <div className="flex gap-4">
        {/* PDF Icon container */}
        <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100/50 flex-shrink-0">
          <FileText size={24} />
        </div>
        
        <div className="flex flex-col gap-1">
          <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {note.title}
          </h4>
          
          <a
            href={note.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-brand-600 transition-colors uppercase tracking-wider"
          >
            PDF URL <ExternalLink size={10} />
          </a>

          {note.description && (
            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mt-1 max-w-[450px]">
              {note.description}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <a
          href={note.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 border border-transparent hover:border-slate-100 transition-all"
          title="Open PDF"
        >
          <Download size={14} />
        </a>
        <Button
          variant="ghost"
          size="sm"
          className="p-2 rounded-xl text-slate-400 hover:text-brand-600"
          onClick={() => onEdit(note)}
          title="Edit Notes"
        >
          <Edit3 size={14} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="p-2 rounded-xl text-slate-400 hover:text-red-600"
          onClick={() => onDelete(note.id)}
          title="Delete Notes"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </Card>
  );
};

export default NotesCard;
