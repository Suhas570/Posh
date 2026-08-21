import React from 'react';
import { PlayCircle, Film, User, Edit3, Trash2, Eye } from 'lucide-react';
import { getYouTubeThumbnail } from '../../utils/helpers';
import Card from '../common/Card';
import Button from '../common/Button';

const VideoCard = ({ video, onEdit, onDelete, onPreview }) => {
  const isYouTube = video.type === 'YouTube';
  const isAnimated = video.type === 'Animated Video';
  const isPrerecorded = video.type === 'Pre-recorded (Human-led)';

  // Determine thumbnail
  let thumbnail = getYouTubeThumbnail(video.url);
  if (!thumbnail) {
    if (isAnimated) {
      thumbnail = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=300&auto=format&fit=crop'; // Technical clean vector graphic placeholder
    } else {
      thumbnail = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=300&auto=format&fit=crop'; // Manoj human learning recording placeholder
    }
  }

  const badgeColor = isYouTube 
    ? 'bg-red-50 text-red-600 border border-red-100' 
    : isAnimated 
      ? 'bg-blue-50 text-blue-600 border border-blue-100'
      : 'bg-emerald-50 text-emerald-600 border border-emerald-100';

  const typeIcon = isYouTube ? PlayCircle : isAnimated ? Film : User;
  const TypeIcon = typeIcon;

  return (
    <Card className="overflow-hidden flex flex-col h-full group text-left">
      {/* Thumbnail */}
      <div className="h-40 bg-slate-900 relative flex items-center justify-center overflow-hidden">
        <img
          src={thumbnail}
          alt={video.title}
          className="w-full h-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={() => onPreview(video)}
            className="p-3 bg-white/95 text-slate-800 rounded-full hover:bg-white transition-all transform scale-90 group-hover:scale-100 duration-300 shadow-lg"
          >
            <PlayCircle size={24} className="text-brand-600 fill-brand-600/10" />
          </button>
        </div>

        {/* Video Type Badge */}
        <span className={`absolute bottom-3 left-3 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 bg-white shadow-sm text-slate-700`}>
          <TypeIcon size={10} />
          {video.type}
        </span>

        {/* Duration */}
        <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg text-[9px] font-bold bg-slate-950/70 text-white backdrop-blur-md">
          {video.duration || '00:00'}
        </span>
      </div>

      {/* Info details */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {video.title}
          </h4>
          <p className="text-[10px] text-slate-400 font-semibold uppercase truncate">
            {video.url}
          </p>
          {video.description && (
            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mt-1">
              {video.description}
            </p>
          )}
        </div>

        {/* Actions panel */}
        <div className="flex items-center justify-between border-t border-slate-100/60 pt-3">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border
            ${video.status === 'Active'
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
              : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            {video.status || 'Active'}
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50"
              onClick={() => onPreview(video)}
              title="Preview Video"
            >
              <Eye size={13} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50"
              onClick={() => onEdit(video)}
              title="Edit URL"
            >
              <Edit3 size={13} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
              onClick={() => onDelete(video.id)}
              title="Delete Video"
            >
              <Trash2 size={13} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VideoCard;
