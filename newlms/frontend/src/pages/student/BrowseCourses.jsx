import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Search, Clock, Play, GraduationCap, ArrowRight, Sparkles } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';
import { studentService } from '../../services/studentService';

const BrowseCourses = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const list = await studentService.getBrowseCourses();
        setCourses(list);
        
        // Load enrolled courses to check status
        const enrolled = await studentService.getEnrolledCourses();
        setEnrolledIds(enrolled.map(e => e.id));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  const handleEnroll = async (id) => {
    await studentService.enrollInCourse(id);
    setEnrolledIds([...enrolledIds, id]);
  };

  const filtered = courses.filter(c => 
    (c.title && c.title.toLowerCase().includes(search.toLowerCase())) ||
    (c.instructor && c.instructor.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 text-left"
    >
      <PageHeader 
        title="Browse Courses" 
        subtitle="Explore our library of expert-led courses and start learning today."
      />

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white border border-slate-200/50 p-4 rounded-[20px] shadow-premium">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search courses by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-semibold py-2.5 pl-10 pr-4 bg-slate-50 border border-slate-200/50 rounded-[14px] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder-slate-400"
          />
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-80 bg-white border border-slate-200/50 rounded-[20px] animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => {
            const isEnrolled = enrolledIds.includes(course.id);
            let lessonsCount = 0;
            course.curriculum?.forEach(m => {
              lessonsCount += m.lessons?.length || 0;
            });

            return (
              <Card 
                key={course.id} 
                hoverEffect 
                className="flex flex-col justify-between overflow-hidden border-slate-200/50"
              >
                {/* Course Cover Image Placeholder */}
                <div className="h-40 bg-slate-100 relative">
                  {course.coverImage ? (
                    <img 
                      src={course.coverImage} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 to-indigo-500/30 flex items-center justify-center text-indigo-500">
                      <BookOpen size={48} />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[9px] font-black uppercase tracking-wider text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100/50 shadow-sm">
                    {course.level}
                  </span>
                </div>

                <div className="p-4 flex-grow flex flex-col justify-between gap-3 text-left">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {course.category}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-800 line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Instructor: <span className="font-semibold text-slate-700">{course.instructor}</span>
                    </p>
                  </div>

                  {/* Course Details Info Row */}
                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-slate-400" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap size={12} className="text-slate-400" />
                      <span>{course.curriculum?.length || 0} Modules</span>
                    </div>
                    <div>
                      <span>{lessonsCount} Lessons</span>
                    </div>
                  </div>

                  {/* Enrollment / Access buttons */}
                  <div className="flex items-center gap-2 mt-2 pt-1 border-t border-slate-50">
                    {isEnrolled ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/student/player/${course.id}`)}
                        className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50/50 text-[10px] font-extrabold cursor-pointer"
                      >
                        <Play size={10} className="mr-1 fill-indigo-600" /> Open Course
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleEnroll(course.id)}
                          className="flex-grow bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-extrabold cursor-pointer"
                        >
                          Enroll Now
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/student/player/${course.id}`)}
                          className="text-[10px] font-extrabold text-slate-500 cursor-pointer"
                        >
                          Preview <ArrowRight size={10} className="ml-1" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center flex flex-col items-center justify-center border border-dashed border-slate-300 bg-white">
          <BookOpen size={48} className="text-slate-400 mb-3" />
          <h4 className="text-sm font-extrabold text-slate-800">No published courses available</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Check back later! Tutors are currently compiling lessons.
          </p>
        </Card>
      )}
    </motion.div>
  );
};

export default BrowseCourses;
