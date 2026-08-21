import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, 
  Award, 
  Flame, 
  Clock, 
  BookOpen, 
  ChevronRight, 
  Sparkles, 
  Calendar,
  BellRing,
  Mic,
  FileText,
  ShieldCheck,
  Volume2
} from 'lucide-react';
import axios from 'axios';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatsCard from '../../components/dashboard/StatsCard';
import { studentService } from '../../services/studentService';
import VoiceAssignmentStudent from '../../components/assignments/VoiceAssignmentStudent';

const StudentDashboard = () => {
  const [enrolled, setEnrolled] = useState([]);
  const [voiceAssignments, setVoiceAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVoicePortalModal, setShowVoicePortalModal] = useState(false);
  const navigate = useNavigate();

  const fetchVoiceAssignments = async () => {
    let apiItems = [];
    const API_BASE = 'http://localhost:5000/api/assignments';
    
    try {
      const res = await axios.get(`${API_BASE}?status=Published`);
      if (Array.isArray(res.data)) apiItems.push(...res.data);
    } catch (e) {}

    try {
      const res = await axios.get(API_BASE);
      if (Array.isArray(res.data)) apiItems.push(...res.data);
    } catch (e) {}

    try {
      const res = await axios.get('http://localhost:5000/api/student/assignments');
      if (Array.isArray(res.data)) apiItems.push(...res.data);
    } catch (e) {}

    let localItems = [];
    try {
      const stored = localStorage.getItem('lms_voice_assignments');
      if (stored) localItems = JSON.parse(stored);
    } catch (e) {}

    const map = new Map();
    [...apiItems, ...localItems].forEach(a => {
      if (a && a.id && (a.status || 'Published') === 'Published' && !map.has(a.id)) {
        map.set(a.id, a);
      }
    });
    setVoiceAssignments(Array.from(map.values()));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const list = await studentService.getEnrolledCourses();
        setEnrolled(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    fetchVoiceAssignments();

    // 3s Polling Interval for live updates from Tutor
    const pollInterval = setInterval(() => {
      fetchVoiceAssignments();
    }, 3000);

    // BroadcastChannel listener for instant cross-tab sync
    let channel;
    try {
      if ('BroadcastChannel' in window) {
        channel = new BroadcastChannel('lms_voice_assignments_channel');
        channel.onmessage = () => {
          fetchVoiceAssignments();
        };
      }
    } catch (e) {}

    const handleFocusOrStorage = () => {
      fetchVoiceAssignments();
    };

    window.addEventListener('focus', handleFocusOrStorage);
    window.addEventListener('storage', handleFocusOrStorage);

    return () => {
      clearInterval(pollInterval);
      if (channel) channel.close();
      window.removeEventListener('focus', handleFocusOrStorage);
      window.removeEventListener('storage', handleFocusOrStorage);
    };
  }, []);

  // Compute stats
  const enrolledCount = enrolled.length;
  const completedCount = enrolled.filter(c => c.progress === 100).length;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 text-left"
    >
      {/* Header Banner */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black text-indigo-600 tracking-tight flex items-center gap-2">
          Welcome back, Manoj! <span className="animate-bounce">👋</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Here is a summary of your active modules, learning stats, and weekly highlights.
        </p>
      </div>

      {/* Direct Voice Assignment Attendance Section on User Dashboard */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <Mic size={16} className="text-emerald-600 animate-pulse" />
            Published Voice Assistance Assignments ({voiceAssignments.length})
          </h3>
          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Available on Student Dashboard
          </span>
        </div>

        {voiceAssignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {voiceAssignments.map((assignment) => (
              <Card 
                key={assignment.id} 
                hoverEffect 
                className="p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white shadow-lg border-0 rounded-3xl flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20">
                      <Mic size={22} className="text-white animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-200 bg-white/10 px-2 py-0.5 rounded-full">
                        Voice Assignment • Published by Tutor
                      </span>
                      <h3 className="text-sm font-extrabold text-white line-clamp-1 mt-1">
                        {assignment.title}
                      </h3>
                      <p className="text-xs text-white/80 line-clamp-2 mt-0.5">
                        {assignment.description || 'Speech-enabled interactive audio assignment test.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="flex items-center gap-3 text-[11px] text-emerald-100 font-medium">
                    <span>{assignment.questions?.length || 0} Questions</span>
                    <span>•</span>
                    <span>{assignment.totalMarks || 0} Total Marks</span>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setShowVoicePortalModal(true)}
                    className="bg-white text-emerald-900 font-extrabold hover:bg-emerald-50 text-xs shadow-md cursor-pointer border-0 shrink-0"
                  >
                    <Mic size={14} className="mr-1.5" /> Attend Voice Test
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center border border-dashed border-slate-300 bg-white rounded-3xl">
            <p className="text-xs text-slate-400 font-medium">
              No published voice assignments available right now. When a tutor publishes a voice assignment, it will automatically appear here for you to attend.
            </p>
          </Card>
        )}
      </div>

      {/* Grid of Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Enrolled Courses" 
          value={enrolledCount} 
          icon={BookOpen} 
          trendText="+1 enrolled this week" 
          colorClass="brand"
        />
        <StatsCard 
          title="Completed Courses" 
          value={completedCount} 
          icon={Award} 
          trendText="Keep it up" 
          colorClass="green"
        />
        <StatsCard 
          title="Learning Hours" 
          value="14.8 hrs" 
          icon={Clock} 
          trendText="+2.4 hrs since yesterday" 
          colorClass="blue"
        />
        <StatsCard 
          title="Active Streak" 
          value="5 Days" 
          icon={Flame} 
          trendText="Personal record!" 
          colorClass="amber"
        />
      </div>

      {/* Double Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Courses Progress & Resume) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Continue Learning card */}
          {enrolled.length > 0 ? (
            <Card hoverEffect className="p-5 bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/20 border-indigo-100/60 shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles size={12} /> Resume Learning
                  </span>
                  <h3 className="text-base font-extrabold text-slate-800 line-clamp-1">
                    {enrolled[0].title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Instructor: {enrolled[0].instructor} • Current Progress: {enrolled[0].progress}%
                  </p>
                </div>
                
                <Button 
                  variant="primary" 
                  size="md"
                  onClick={() => navigate(`/student/player/${enrolled[0].id}`)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  <Play size={14} className="mr-1.5 fill-white" /> Continue
                </Button>
              </div>
              
              {/* Progress Slider */}
              <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${enrolled[0].progress}%` }}
                  transition={{ duration: 0.8 }}
                  className="bg-indigo-600 h-full rounded-full"
                />
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center flex flex-col items-center justify-center border border-dashed border-slate-300/80 bg-white">
              <BookOpen size={36} className="text-slate-400 mb-3" />
              <h4 className="text-sm font-extrabold text-slate-800">No active enrollments</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mb-4">
                Explore our catalog of professional courses and begin your learning path.
              </p>
              <Button 
                variant="primary" 
                size="md"
                onClick={() => navigate('/student/browse')}
                className="cursor-pointer"
              >
                Browse Catalog
              </Button>
            </Card>
          )}

          {/* Enrolled Courses Grid */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
              My Learning Path
            </h3>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map(n => (
                  <div key={n} className="h-40 bg-white border border-slate-200/50 rounded-[20px] animate-pulse" />
                ))}
              </div>
            ) : enrolled.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {enrolled.map((course) => (
                  <Card 
                    key={course.id} 
                    hoverEffect 
                    onClick={() => navigate(`/student/player/${course.id}`)}
                    className="p-4 flex flex-col justify-between gap-3 text-left border-slate-200/50"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        {course.category}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-800 line-clamp-1">
                        {course.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        By {course.instructor}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${course.progress}%` }} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : null}
          </div>

        </div>

        {/* Right Column (Upcoming Deadlines & Announcements) */}
        <div className="flex flex-col gap-6">
          
          {/* Quick Actions / Wheat Card */}
          <Card className="p-5 bg-[#faf6eb]/90 border border-[#eadabe]/85 shadow-premium flex flex-col gap-4 text-left">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-600" /> Study Planner
            </h3>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl border border-[#eadabe]/30">
                <Calendar size={16} className="text-amber-600 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Weekly Goal</span>
                  <span className="text-[10px] text-slate-400 font-bold">Complete 4 modules</span>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl border border-[#eadabe]/30">
                <BellRing size={16} className="text-amber-600 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Watch List</span>
                  <span className="text-[10px] text-slate-400 font-bold">2 videos pending</span>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/student/calendar')}
              className="border-amber-200/80 hover:bg-amber-50/50 text-amber-800 font-bold text-xs"
            >
              Open Schedule
            </Button>
          </Card>

          {/* Announcements Card */}
          <Card className="p-4 flex flex-col gap-3 text-left border-slate-200/50">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">
              Latest Bulletin
            </h4>
            
            <div className="flex flex-col gap-3 divide-y divide-slate-100">
              <div className="pt-1 flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-400 font-bold">TUTOR NOTICE • TODAY</span>
                <span className="text-xs font-extrabold text-slate-700">Live lecture moved to 4 PM</span>
                <p className="text-[10px] text-slate-400 font-medium">The Q&A stream is postponed by 1 hr.</p>
              </div>
              
              <div className="pt-3 flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-400 font-bold">SYSTEM UPDATE • 2 DAYS AGO</span>
                <span className="text-xs font-extrabold text-slate-700">Module 3 updates released</span>
                <p className="text-[10px] text-slate-400 font-medium">Added PDF slides for advanced Hooks.</p>
              </div>
            </div>
          </Card>

        </div>

      </div>

      {/* Interactive Voice Test Portal Modal directly on User Dashboard */}
      {showVoicePortalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-50 w-full max-w-5xl rounded-3xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowVoicePortalModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-200/50 transition-all font-black text-sm z-10"
            >
              ✕ Close
            </button>
            <VoiceAssignmentStudent />
          </div>
        </div>
      )}

    </motion.div>
  );
};

export default StudentDashboard;
