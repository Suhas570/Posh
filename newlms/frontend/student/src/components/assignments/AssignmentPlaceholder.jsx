import React from 'react';
import { FileCheck, Users, Code, Hammer, Clock } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const AssignmentPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 max-w-xl mx-auto text-center">
      {/* Visual illustration box */}
      <div className="relative mb-6">
        <div className="p-5 bg-brand-50 text-brand-600 rounded-3xl border border-brand-100 shadow-md">
          <FileCheck size={40} className="stroke-[1.5]" />
        </div>
        <div className="absolute -bottom-2 -right-2 p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
          <Clock size={16} className="animate-pulse" />
        </div>
      </div>

      <h2 className="text-lg font-bold text-slate-800 mb-2">Assignments Module</h2>
      <p className="text-xs text-slate-500 leading-relaxed mb-6">
        This module is currently under development by another engineer. It covers student assignments, grades tracker, submission forms, and evaluative reports.
      </p>

      {/* Engineer assignment metadata card */}
      <Card className="w-full p-4 mb-6 bg-slate-50/50 border border-slate-100/60 flex items-center justify-between text-left">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-xl border border-slate-200/50 text-slate-600">
            <Users size={16} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Assigned Developer</span>
            <span className="text-xs font-bold text-slate-700">Team Partner B</span>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider">
          In Progress
        </span>
      </Card>

      <div className="flex items-center gap-3">
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => alert('Sending notification to Developer B...')}
          className="text-xs bg-brand-600 hover:bg-brand-700"
        >
          Request Status Update
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => alert('Documentation path: /docs/assignments-api.md')}
          className="text-xs border-slate-200"
          icon={Code}
        >
          View API Docs
        </Button>
      </div>
    </div>
  );
};

export default AssignmentPlaceholder;
