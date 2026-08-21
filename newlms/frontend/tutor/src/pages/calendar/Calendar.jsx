import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { courseService } from '../../services/courseService';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState('Month'); // Day, Week, Month
  const [currentDate, setCurrentDate] = useState(new Date('2026-07-17')); // Lock to match additional metadata month

  // Add event modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '2026-07-18',
    type: 'Live Session',
    time: '10:00 AM'
  });

  const loadData = () => {
    setEvents(courseService.getCalendarEvents());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    courseService.addCalendarEvent(newEvent);
    setIsAddOpen(false);
    setNewEvent({ title: '', date: '2026-07-18', type: 'Live Session', time: '10:00 AM' });
    loadData();
  };

  // Generate days in month for July 2026
  const getDaysInMonth = () => {
    const days = [];
    // July 2026 starts on Wednesday (offset 3 blank days in calendar grid)
    for (let i = 0; i < 3; i++) {
      days.push({ blank: true });
    }
    for (let d = 1; d <= 31; d++) {
      const dateStr = `2026-07-${d < 10 ? '0' + d : d}`;
      const dayEvents = events.filter(e => e.date === dateStr);
      days.push({ dayNum: d, dateString: dateStr, events: dayEvents });
    }
    return days;
  };

  const getEventBadgeColor = (type) => {
    switch (type) {
      case 'Live Session': return 'bg-purple-100 text-purple-700 border-purple-200/50';
      case 'Deadline': return 'bg-red-100 text-red-700 border-red-200/50';
      case 'Holiday': return 'bg-emerald-100 text-emerald-700 border-emerald-200/50';
      default: return 'bg-blue-100 text-blue-700 border-blue-200/50';
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
        title="Calendar Scheduling"
        subtitle="Manage scheduled zoom classes, student assignment deadlines, and public holidays."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddOpen(true)}
            icon={Plus}
            className="text-xs bg-brand-600 hover:bg-brand-700"
          >
            Add Event
          </Button>
        }
      />

      {/* Controller bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <button className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-bold text-slate-800 tracking-tight select-none">
            July 2026
          </span>
          <button className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl select-none relative">
          {['Day', 'Week', 'Month'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors z-10 cursor-pointer
                ${viewMode === mode 
                  ? 'text-brand-600' 
                  : 'text-slate-400 hover:text-slate-600'}`}
            >
              {viewMode === mode && (
                <motion.div
                  layoutId="activeCalendarMode"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout depending on Month View */}
      {viewMode === 'Month' ? (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-premium overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50 text-center text-[10px] font-bold text-slate-400 uppercase py-3 select-none">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 grid-rows-5 divide-x divide-y divide-slate-100 border-collapse min-h-[480px]">
            {getDaysInMonth().map((day, idx) => (
              <div key={idx} className="p-2 flex flex-col gap-1.5 text-left bg-white min-h-[90px] relative hover:bg-slate-50/30 transition-colors">
                {!day.blank && (
                  <>
                    <span className={`text-xs font-bold select-none
                      ${day.dayNum === 17 ? 'text-white bg-brand-600 px-1.5 py-0.5 rounded-full inline-block w-fit' : 'text-slate-500'}`}
                    >
                      {day.dayNum}
                    </span>

                    {/* Day Events */}
                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[70px] scrollbar-thin">
                      {day.events.map((ev) => (
                        <div 
                          key={ev.id}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded border leading-tight truncate cursor-pointer ${getEventBadgeColor(ev.type)}`}
                          title={`${ev.title} (${ev.time})`}
                          onClick={() => alert(`Event: ${ev.title}\nTime: ${ev.time}\nType: ${ev.type}`)}
                        >
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Day / Week placeholder logs list view */
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scheduled Items List</h4>
          {events.map((ev) => (
            <Card key={ev.id} className="p-4 bg-white border border-slate-100 flex items-center justify-between text-left">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl border ${getEventBadgeColor(ev.type)}`}>
                  <CalendarIcon size={16} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-800">{ev.title}</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">{ev.type} • {ev.date}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-slate-50 border px-3 py-1 rounded-xl">
                <Clock size={12} className="text-slate-400" />
                <span>{ev.time}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Event Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Schedule Calendar Event"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="flex flex-col gap-4 text-left">
          <Input
            label="Event Title"
            value={newEvent.title}
            onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Session 1.3: Live Q&A"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Event Type"
              options={['Live Session', 'Deadline', 'Holiday', 'Class']}
              value={newEvent.type}
              onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value }))}
            />
            <Input
              label="Time (e.g. 10:00 AM)"
              value={newEvent.time}
              onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
              placeholder="e.g. 4:00 PM"
              required
            />
          </div>

          <Input
            label="Scheduled Date"
            type="date"
            value={newEvent.date}
            onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
            required
          />

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
            <Button variant="secondary" onClick={() => setIsAddOpen(false)} className="text-xs border-slate-200">
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="text-xs bg-brand-600 hover:bg-brand-700">
              Save Event
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default CalendarPage;
