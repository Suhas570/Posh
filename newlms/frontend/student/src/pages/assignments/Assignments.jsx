import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, FileCheck } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import VoiceAssignmentStudent from '../../components/assignments/VoiceAssignmentStudent';

const Assignments = () => {
  const [assignmentType, setAssignmentType] = useState('Voice Assistance Assignment');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col text-left gap-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Assignments Portal"
          subtitle="Submit your project solutions, view tutor grading logs, and track task checksheets."
        />

        {/* Assignment Type Selector Dropdown */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <label className="text-xs font-bold text-slate-500 pl-2 uppercase tracking-wider">
            Assignment Type:
          </label>
          <div className="relative">
            <select
              value={assignmentType}
              onChange={(e) => setAssignmentType(e.target.value)}
              className="appearance-none bg-slate-50 text-slate-800 text-xs font-bold py-2 pl-3 pr-8 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="Normal Assignment">Normal Assignment</option>
              <option value="Voice Assistance Assignment">Voice Assistance Assignment</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {assignmentType === 'Normal Assignment' ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center border border-dashed border-slate-300 bg-white min-h-[50vh]">
          <div className="p-4 bg-indigo-50 rounded-full text-indigo-600 mb-4 animate-pulse">
            <FileCheck size={36} />
          </div>
          <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Normal Assignments Module Coming Soon</h3>
          <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
            This feature will be available in the next release. Select "Voice Assistance Assignment" from the dropdown above to test the active audio assignment module.
          </p>
        </Card>
      ) : (
        <VoiceAssignmentStudent />
      )}
    </motion.div>
  );
};

export default Assignments;
