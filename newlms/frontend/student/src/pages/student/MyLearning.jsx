import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Play, Calendar, Star, Sparkles } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';
import { studentService } from '../../services/studentService';

const MyLearning = () => {
  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadEnrolled = async () => {
      try {
        const list = await studentService.getEnrolledCourses();
        setEnrolled(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadEnrolled();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 text-left"
    >
      <PageHeader 
        title="My Learning Path" 
        subtitle="Manage your enrolled courses, check your lesson counts and continue where you left off."
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map(n => (
            <div key={n} className="h-44 bg-white border border-slate-200/50 rounded-[20px] animate-pulse" />
          ))}
        </div>
      ) : enrolled.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolled.map((course) => {
            let totalLessons = 0;
            course.curriculum?.forEach(m => {
              totalLessons += m.lessons?.length || 0;
            });

            return (
              <Card 
                key={course.id} 
                hoverEffect 
                className="flex flex-col justify-between p-5 gap-4 border-slate-200/50"
              >
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-md self-start uppercase tracking-wider">
                    {course.category}
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-800 line-clamp-1 mt-2">
                    {course.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Instructor: {course.instructor}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="flex flex-col gap-1.5 mt-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                    <span>Course Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${course.progress}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-400 font-semibold self-end">
                    {totalLessons} lessons total
                  </span>
                </div>

                {/* Action button */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/student/player/${course.id}`)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-extrabold mt-1 cursor-pointer"
                >
                  <Play size={11} className="mr-1.5 fill-white" /> Continue Learning
                </Button>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center flex flex-col items-center justify-center border border-dashed border-slate-300 bg-white">
          <BookOpen size={48} className="text-slate-400 mb-3" />
          <h4 className="text-sm font-extrabold text-slate-800">You are not enrolled in any courses</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mb-4">
            Visit the catalog to find and enroll in a course.
          </p>
          <Button 
            variant="primary" 
            size="md"
            onClick={() => navigate('/student/browse')}
            className="cursor-pointer"
          >
            Browse Courses
          </Button>
        </Card>
      )}
    </motion.div>
  );
};

export default MyLearning;
