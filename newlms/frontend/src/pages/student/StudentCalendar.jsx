import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Video, FileText, Gift } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';
import { studentService } from '../../services/studentService';

const StudentCalendar = () => {
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const list = await studentService.getCalendarEvents();
        setEvents(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  const getEventIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'live':
      case 'session':
        return <Video size={12} className="text-orange-500" />;
      case 'assignment':
      case 'deadline':
        return <FileText size={12} className="text-red-500" />;
      default:
        return <Gift size={12} className="text-indigo-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 text-left"
    >
      <PageHeader 
        title="Student Class Calendar" 
        subtitle="Manage upcoming live webinars, project checkpoints, coding assignments, and holiday terms."
      />

      {/* View switcher & Header controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200/50 p-4 rounded-[20px] shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="icon" size="sm" className="border-slate-200 cursor-pointer"><ChevronLeft size={14} /></Button>
          <span className="text-xs font-black text-slate-800">July 2026</span>
          <Button variant="icon" size="sm" className="border-slate-200 cursor-pointer"><ChevronRight size={14} /></Button>
        </div>

        {/* View toggles */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/50 p-1 rounded-xl">
          {['month', 'week', 'day'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all focus:outline-none cursor-pointer
                ${viewMode === mode 
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic event listings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar visual grid placeholder */}
        <div className="lg:col-span-2">
          <Card className="p-5 bg-white border-slate-200/50 shadow-sm">
            <div className="grid grid-cols-7 gap-1 text-center mb-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <span key={d} className="text-[10px] font-black text-slate-400 uppercase">{d}</span>
              ))}
            </div>
            
            {/* Visual date cells block */}
            <div className="grid grid-cols-7 gap-1.5 h-64">
              {Array.from({ length: 31 }).map((_, i) => {
                const day = i + 1;
                const hasEvent = day === 17 || day === 21 || day === 25;
                return (
                  <div 
                    key={i} 
                    className={`p-2 rounded-xl border flex flex-col justify-between items-start text-xs font-semibold transition-all
                      ${hasEvent 
                        ? 'border-orange-100 bg-orange-50/20' 
                        : 'border-slate-100 hover:bg-slate-50'
                      }`}
                  >
                    <span className={hasEvent ? 'text-orange-600 font-extrabold' : 'text-slate-500'}>{day}</span>
                    {hasEvent && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Pane: Upcoming Agenda List */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest px-1">Upcoming Agenda</h3>
          
          {loading ? (
            <Card className="p-4 bg-white border-slate-200 animate-pulse h-40" />
          ) : events.length > 0 ? (
            <div className="flex flex-col gap-3">
              {events.map((e) => (
                <Card key={e.id} className="p-4 bg-white border-slate-200/50 shadow-sm flex items-start gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex-shrink-0">
                    {getEventIcon(e.type)}
                  </div>
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{e.date} • {e.time}</span>
                    <h4 className="text-xs font-extrabold text-slate-700">{e.title}</h4>
                    <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">{e.type} EVENT</span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center bg-white border-slate-200/50">
              <CalendarIcon size={24} className="text-slate-300 mb-2" />
              <span className="text-xs text-slate-400 font-medium">No agenda items schedule.</span>
            </Card>
          )}
        </div>

      </div>

    </motion.div>
  );
};

export default StudentCalendar;
