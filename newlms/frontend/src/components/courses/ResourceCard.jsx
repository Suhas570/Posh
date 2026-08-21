import { 
  FileText, 
  GitFork, 
  Globe, 
  BookOpen, 
  Edit3, 
  Trash2, 
  ExternalLink 
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const ResourceCard = ({ resource, onEdit, onDelete }) => {
  const isDoc = resource.type === 'Documentation';
  const isGithub = resource.type === 'GitHub';
  const isArticle = resource.type === 'Article';

  const typeIcon = isDoc 
    ? FileText 
    : isGithub 
      ? GitFork 
      : isArticle 
        ? BookOpen 
        : Globe;

  const colorMap = isDoc 
    ? 'bg-purple-50 text-purple-600 border-purple-100/50' 
    : isGithub 
      ? 'bg-slate-900 text-white border-slate-950/20' 
      : isArticle 
        ? 'bg-orange-50 text-orange-600 border-orange-100/50' 
        : 'bg-blue-50 text-blue-600 border-blue-100/50';

  const TypeIcon = typeIcon;

  return (
    <Card className="p-4 border border-slate-100 flex items-start justify-between gap-4 group text-left">
      <div className="flex gap-4">
        {/* Resource Icon container */}
        <div className={`p-3 rounded-2xl border flex-shrink-0 flex items-center justify-center ${colorMap}`}>
          <TypeIcon size={22} />
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-brand-600 transition-colors">
              {resource.title}
            </h4>
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.25 bg-slate-100 text-slate-500 rounded border border-slate-200/50 tracking-wider">
              {resource.type}
            </span>
          </div>
          
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-brand-600 transition-colors uppercase tracking-wider"
          >
            Visit Resource <ExternalLink size={10} />
          </a>

          {resource.description && (
            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mt-1 max-w-[450px]">
              {resource.description}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 border border-transparent hover:border-slate-100 transition-all"
          title="Open External Resource Link"
        >
          <ExternalLink size={14} />
        </a>
        <Button
          variant="ghost"
          size="sm"
          className="p-2 rounded-xl text-slate-400 hover:text-brand-600"
          onClick={() => onEdit(resource)}
          title="Edit Resource"
        >
          <Edit3 size={14} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="p-2 rounded-xl text-slate-400 hover:text-red-600"
          onClick={() => onDelete(resource.id)}
          title="Delete Resource"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </Card>
  );
};

export default ResourceCard;
