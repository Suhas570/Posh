import React, { useEffect, useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { StatusBadge, Skeleton } from '../../components/common/UI';
import { User, Shield, Briefcase, Award, Laptop, BookOpen } from 'lucide-react';

const EmployeeProfile: React.FC = () => {
  const { showToast } = useNotification();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'assets' | 'training' | 'performance'>('info');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/employee/profile');
        if (res.data.success) {
          setProfile(res.data.data);
        }
      } catch (error) {
        showToast('Failed to load profile details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <Skeleton className="h-64" />;
  }

  if (!profile) {
    return <div className="text-center py-10 text-gray-500">Profile data unavailable</div>;
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-3xl border border-indigo-200/20 shadow-inner">
          {profile.firstName?.charAt(0).toUpperCase()}
        </div>
        <div className="text-center md:text-left flex-1 space-y-1.5">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {profile.firstName} {profile.lastName}
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200/10">
              {profile.jobTitle}
            </span>
          </div>
          <p className="text-xs text-gray-400 font-semibold">{profile.department?.name || 'Department'}</p>
          <div className="flex items-center justify-center md:justify-start gap-4 pt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              ID: <strong className="text-gray-700 dark:text-gray-200">{profile.employeeId}</strong>
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Joined: <strong className="text-gray-700 dark:text-gray-200">{new Date(profile.dateOfJoining).toLocaleDateString()}</strong>
            </span>
          </div>
        </div>
        <div>
          <StatusBadge status={profile.status} />
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200 dark:border-gray-700/50">
        {(['info', 'assets', 'training', 'performance'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-xs font-bold capitalize transition-all cursor-pointer ${
              activeTab === tab
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab === 'info' ? 'Personal Details' : tab}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
        
        {/* PERSONAL DETAILS PANEL */}
        {activeTab === 'info' && (
          <div className="space-y-6 animate-fade-in text-xs">
            <div>
              <h3 className="font-bold text-sm text-gray-800 dark:text-white flex items-center gap-1.5 border-b border-gray-50 dark:border-gray-700/30 pb-2 mb-4">
                <Briefcase size={16} className="text-indigo-600" />
                Employment & Bank Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <span className="text-gray-400 font-semibold block mb-1">Direct Manager:</span>
                  <span className="font-bold text-gray-800 dark:text-white">
                    {profile.manager ? `${profile.manager.firstName} ${profile.manager.lastName}` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block mb-1">Base Salary:</span>
                  <span className="font-bold text-gray-800 dark:text-white">${profile.baseSalary} / month</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block mb-1">Contact Phone:</span>
                  <span className="font-bold text-gray-800 dark:text-white">{profile.phone}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="font-bold text-sm text-gray-800 dark:text-white flex items-center gap-1.5 border-b border-gray-50 dark:border-gray-700/30 pb-2 mb-4">
                <Shield size={16} className="text-indigo-600" />
                Salary Disbursement bank
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <span className="text-gray-400 font-semibold block mb-1">Bank Name:</span>
                  <span className="font-bold text-gray-800 dark:text-white">{profile.bankDetails?.bankName}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block mb-1">Account Number:</span>
                  <span className="font-bold text-gray-800 dark:text-white">{profile.bankDetails?.accountNumber}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block mb-1">Bank IFSC / Routing Code:</span>
                  <span className="font-bold text-gray-800 dark:text-white">{profile.bankDetails?.ifscCode}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ASSIGNED ASSETS */}
        {activeTab === 'assets' && (
          <div className="space-y-4 animate-fade-in text-xs">
            <div className="flex items-center gap-1.5 border-b border-gray-50 dark:border-gray-700/30 pb-2 mb-4">
              <Laptop size={16} className="text-indigo-600" />
              <h3 className="font-bold text-sm text-gray-800 dark:text-white">Hardware Assets</h3>
            </div>
            
            {profile.assets && profile.assets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.assets.map((asset: any) => (
                  <div key={asset._id} className="p-4 bg-gray-50 dark:bg-gray-700/20 border border-gray-100 dark:border-gray-700/30 rounded-xl flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-white">{asset.name}</h4>
                      <span className="text-[10px] text-gray-400 mt-1 block font-semibold">S/N: {asset.serialNumber}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block font-semibold">Assigned: {new Date(asset.assignedDate).toLocaleDateString()}</span>
                      <span className="mt-1.5 inline-block"><StatusBadge status={asset.status} /></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">No hardware assets registered to this profile</div>
            )}
          </div>
        )}

        {/* TRAININGS */}
        {activeTab === 'training' && (
          <div className="space-y-4 animate-fade-in text-xs">
            <div className="flex items-center gap-1.5 border-b border-gray-50 dark:border-gray-700/30 pb-2 mb-4">
              <BookOpen size={16} className="text-indigo-600" />
              <h3 className="font-bold text-sm text-gray-800 dark:text-white">Training & Development Courses</h3>
            </div>
            
            {profile.trainings && profile.trainings.length > 0 ? (
              <div className="space-y-4">
                {profile.trainings.map((course: any) => (
                  <div key={course._id} className="p-4 bg-gray-50 dark:bg-gray-700/20 border border-gray-100 dark:border-gray-700/30 rounded-xl">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-white">{course.courseName}</h4>
                        <span className="text-[10px] text-gray-400 mt-1 block">Provider: {course.provider || 'Internal Compliance'}</span>
                      </div>
                      <StatusBadge status={course.status} />
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                        <span>Course Completion:</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${course.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">No training modules assigned</div>
            )}
          </div>
        )}

        {/* PERFORMANCE REVIEWS */}
        {activeTab === 'performance' && (
          <div className="space-y-4 animate-fade-in text-xs">
            <div className="flex items-center gap-1.5 border-b border-gray-50 dark:border-gray-700/30 pb-2 mb-4">
              <Award size={16} className="text-indigo-600" />
              <h3 className="font-bold text-sm text-gray-800 dark:text-white">Appraisal Ratings History</h3>
            </div>

            {profile.performanceReviews && profile.performanceReviews.length > 0 ? (
              <div className="space-y-4">
                {profile.performanceReviews.map((review: any) => (
                  <div key={review._id} className="p-4 bg-gray-50 dark:bg-gray-700/20 border border-gray-100 dark:border-gray-700/30 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-white">{review.reviewCycle}</h4>
                        <span className="text-[10px] text-gray-400 mt-0.5 block">Reviewer: {review.reviewer}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950 px-3 py-1.5 rounded-lg border border-indigo-100/20">
                        <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">{review.rating}</span>
                        <span className="text-[10px] text-gray-400 font-bold">/ 5.0 Rating</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 bg-white dark:bg-gray-800/40 p-3 rounded-lg border border-gray-100 dark:border-gray-700/20 italic">
                      "{review.feedback}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">No appraisal history logs found</div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default EmployeeProfile;
