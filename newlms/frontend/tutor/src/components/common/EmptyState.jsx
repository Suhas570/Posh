import React from 'react';
import Button from './Button';

const EmptyState = ({
  title = 'No items found',
  description = 'Try adjusting your search filters or add a new item.',
  icon: Icon,
  actionText,
  onActionClick,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30 ${className}`}>
      {Icon && (
        <div className="p-3 bg-brand-50 rounded-2xl text-brand-600 mb-4">
          <Icon size={28} />
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-xs mb-5 leading-relaxed">{description}</p>
      {actionText && onActionClick && (
        <Button size="sm" onClick={onActionClick}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
