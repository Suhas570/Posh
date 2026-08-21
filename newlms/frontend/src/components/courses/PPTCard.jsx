import React from 'react';
import { Presentation, Download, Edit3, Trash2, ExternalLink } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const PPTCard = ({ ppt, onEdit, onDelete }) => {
  return (
    <Card className="p-4 border border-slate-100 flex items-start justify-between gap-4 group text-left">
      <div className="flex gap-4">
        {/* PPT Icon container */}
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100/50 flex-shrink-0">
          <Presentation size={24} />
        </div>
        
        <div className="flex flex-col gap-1">
          <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {ppt.title}
          </h4>
          
          <a
            href={ppt.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-brand-600 transition-colors uppercase tracking-wider"
          >
            PPT URL <ExternalLink size={10} />
          </a>

          {ppt.description && (
            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mt-1 max-w-[450px]">
              {ppt.description}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <a
          href={ppt.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 border border-transparent hover:border-slate-100 transition-all"
          title="Open Slides"
        >
          <Download size={14} />
        </a>
        <Button
          variant="ghost"
          size="sm"
          className="p-2 rounded-xl text-slate-400 hover:text-brand-600"
          onClick={() => onEdit(ppt)}
          title="Edit PPT"
        >
          <Edit3 size={14} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="p-2 rounded-xl text-slate-400 hover:text-red-600"
          onClick={() => onDelete(ppt.id)}
          title="Delete PPT"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </Card>
  );
};

export default PPTCard;
