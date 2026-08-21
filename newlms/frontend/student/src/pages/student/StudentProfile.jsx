import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, FileText, Bookmark, Check } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PageHeader from '../../components/common/PageHeader';
import { studentService } from '../../services/studentService';

const StudentProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    interests: [],
    avatar: ''
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const data = await studentService.getProfile();
      setProfile(data);
    };
    loadProfile();
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 text-left"
    >
      <PageHeader 
        title="Student Profile" 
        subtitle="Manage your personal details, avatar photo, phone numbers, and learning interests."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column Profile Avatar (1 Column) */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card className="p-5 flex flex-col items-center justify-center text-center gap-3 border-slate-200/50">
            <img 
              src={profile.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80"} 
              alt="Profile Avatar"
              className="w-24 h-24 rounded-full border border-slate-200 object-cover shadow-sm"
            />
            <div className="flex flex-col gap-0.5 mt-2">
              <h3 className="text-sm font-extrabold text-slate-800">{profile.name}</h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{profile.email}</span>
            </div>
            
            <div className="flex flex-wrap gap-1.5 justify-center mt-3 border-t border-slate-50 pt-4 w-full">
              {profile.interests?.map((interest, i) => (
                <span 
                  key={i} 
                  className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/40 px-2 py-0.5 rounded-md"
                >
                  {interest}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column Profile Inputs (2 Columns) */}
        <div className="lg:col-span-2">
          <Card className="p-6 bg-white border-slate-200/50 shadow-sm text-left">
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Name" 
                  id="profile-name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  icon={User}
                  required
                />
                
                <Input 
                  label="Email" 
                  id="profile-email"
                  value={profile.email}
                  disabled
                  icon={Mail}
                  helperText="Primary email cannot be changed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Phone Number" 
                  id="profile-phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  icon={Phone}
                />
                
                <Input 
                  label="Learning Interests (Comma separated)" 
                  id="profile-interests"
                  value={profile.interests?.join(', ')}
                  onChange={(e) => setProfile({ ...profile, interests: e.target.value.split(',').map(s => s.trim()) })}
                  icon={Bookmark}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="profile-bio" className="text-xs font-semibold text-slate-700 select-none">Bio</label>
                <textarea
                  id="profile-bio"
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full text-xs font-semibold py-2.5 px-3.5 rounded-[14px] border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 border-t border-slate-100 pt-4">
                {saved && (
                  <span className="text-xs text-emerald-600 font-extrabold flex items-center gap-1 animate-pulse">
                    <Check size={14} /> Profile details saved!
                  </span>
                )}
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="md"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>

      </div>

    </motion.div>
  );
};

export default StudentProfile;
