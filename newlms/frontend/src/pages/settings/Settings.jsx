import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Mail, 
  ShieldAlert, 
  Bell, 
  EyeOff, 
  Cpu, 
  Camera, 
  LogOut, 
  Check, 
  Globe, 
  Palette 
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('General'); // General, Profile, Contact, Security, Notifications, Privacy, System
  
  // Toggles and Form States
  const [profile, setProfile] = useState({
    name: 'Manoj',
    bio: 'Senior Software Architect and Course Author specializing in full-stack React developer workflows and cloud deployment paradigms.',
    expertise: 'React, Node.js, Python, AWS Cloud',
    github: 'https://github.com/manoj',
    linkedin: 'https://linkedin.com/in/manoj'
  });

  const [contact, setContact] = useState({
    email: 'manoj@tutorlms.com',
    phone: '+91 98765 43210'
  });

  const [general, setGeneral] = useState({
    language: 'English',
    theme: 'Light'
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    twoFactor: true
  });

  const [notifs, setNotifs] = useState({
    emailNotif: true,
    pushNotif: false,
    courseUpdate: true,
    studentActivity: true
  });

  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    allowDirectMsg: true
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const tabs = [
    { name: 'General', icon: SettingsIcon },
    { name: 'Profile', icon: User },
    { name: 'Contact', icon: Mail },
    { name: 'Security', icon: ShieldAlert },
    { name: 'Notifications', icon: Bell },
    { name: 'Privacy', icon: EyeOff },
    { name: 'System', icon: Cpu }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col text-left mb-8 max-w-5xl mx-auto"
    >
      <PageHeader
        title="Account & System Settings"
        subtitle="Manage theme presets, custom profiles, security configurations, and active notifications."
      />

      <div className="flex flex-col md:flex-row gap-6 items-start mt-2">
        {/* Left Side Tab Navigation List */}
        <Card className="w-full md:w-56 bg-white border border-slate-100 p-2 flex flex-col gap-1 shadow-sm select-none">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-2.5
                ${activeTab === tab.name 
                  ? 'text-brand-600 bg-brand-50' 
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              <tab.icon size={14} />
              <span>{tab.name}</span>
            </button>
          ))}
        </Card>

        {/* Right Side Settings Forms Area */}
        <Card className="flex-1 w-full bg-white border border-slate-100 p-6 md:p-8 shadow-premium min-h-[400px]">
          <form onSubmit={handleSave} className="flex flex-col justify-between h-full gap-8">
            <AnimatePresence mode="wait">
              {/* GENERAL TAB */}
              {activeTab === 'General' && (
                <motion.div
                  key="general"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex flex-col gap-5 text-left"
                >
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-50">General System Setup</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="System Language"
                      options={['English', 'Spanish', 'French', 'Hindi', 'Mandarin']}
                      value={general.language}
                      onChange={(e) => setGeneral(prev => ({ ...prev, language: e.target.value }))}
                    />
                    <Select
                      label="Visual Theme (Light theme forced)"
                      options={['Light Theme', 'Dark Mode Preset']}
                      value={general.theme + ' Theme'}
                      onChange={() => alert('Light theme is the primary forced styling layout.')}
                    />
                  </div>
                </motion.div>
              )}

              {/* PROFILE TAB */}
              {activeTab === 'Profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex flex-col gap-5 text-left"
                >
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-50">Instructor Profile</h3>
                  
                  {/* Photo picker mock */}
                  <div className="flex items-center gap-4 py-2">
                    <div className="w-16 h-16 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 font-bold relative group overflow-hidden">
                      <User size={24} />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera size={14} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-slate-700">Profile Photo</span>
                      <span className="text-[10px] text-slate-400 font-medium">JPEG, PNG, max 2MB.</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                    <Input
                      label="Expertise Sub-domains"
                      value={profile.expertise}
                      onChange={(e) => setProfile(prev => ({ ...prev, expertise: e.target.value }))}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">Biography</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                      className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 bg-white leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="GitHub profile link"
                      value={profile.github}
                      onChange={(e) => setProfile(prev => ({ ...prev, github: e.target.value }))}
                    />
                    <Input
                      label="LinkedIn link"
                      value={profile.linkedin}
                      onChange={(e) => setProfile(prev => ({ ...prev, linkedin: e.target.value }))}
                    />
                  </div>
                </motion.div>
              )}

              {/* CONTACT TAB */}
              {activeTab === 'Contact' && (
                <motion.div
                  key="contact"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex flex-col gap-5 text-left"
                >
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-50">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Email Address"
                      type="email"
                      value={contact.email}
                      onChange={(e) => setContact(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                    <Input
                      label="Phone Number"
                      value={contact.phone}
                      onChange={(e) => setContact(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </motion.div>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'Security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex flex-col gap-5 text-left"
                >
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-50">Security & Authentication</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Current Password"
                      type="password"
                      value={security.currentPassword}
                      onChange={(e) => setSecurity(prev => ({ ...prev, currentPassword: e.target.value }))}
                    />
                    <Input
                      label="New Password"
                      type="password"
                      value={security.newPassword}
                      onChange={(e) => setSecurity(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                  </div>

                  {/* 2FA Toggle */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-slate-700">Two-Factor Authentication (2FA)</span>
                      <span className="text-[10px] text-slate-400 font-medium">Protect your instructor credentials with secure token codes.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={security.twoFactor}
                      onChange={(e) => setSecurity(prev => ({ ...prev, twoFactor: e.target.checked }))}
                      className="w-4 h-4 text-brand-600 border-slate-300 rounded cursor-pointer"
                    />
                  </div>
                </motion.div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'Notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex flex-col gap-4 text-left"
                >
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-50">Notification Preferences</h3>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center py-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-slate-700">Email Notifications</span>
                        <span className="text-[10px] text-slate-400">Receive summaries, reviews, and messaging alerts by email.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifs.emailNotif}
                        onChange={(e) => setNotifs(prev => ({ ...prev, emailNotif: e.target.checked }))}
                        className="w-4 h-4 rounded text-brand-600 border-slate-300 cursor-pointer"
                      />
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-slate-700">Push Notifications</span>
                        <span className="text-[10px] text-slate-400">Enable real-time push pings in the dashboard UI.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifs.pushNotif}
                        onChange={(e) => setNotifs(prev => ({ ...prev, pushNotif: e.target.checked }))}
                        className="w-4 h-4 rounded text-brand-600 border-slate-300 cursor-pointer"
                      />
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-slate-700">Course Update Alerts</span>
                        <span className="text-[10px] text-slate-400">Alert me when curriculum slides or video items finish compiling.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifs.courseUpdate}
                        onChange={(e) => setNotifs(prev => ({ ...prev, courseUpdate: e.target.checked }))}
                        className="w-4 h-4 rounded text-brand-600 border-slate-300 cursor-pointer"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* PRIVACY TAB */}
              {activeTab === 'Privacy' && (
                <motion.div
                  key="privacy"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex flex-col gap-4 text-left"
                >
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-50">Privacy Configurations</h3>
                  
                  <div className="flex justify-between items-center py-1">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-slate-700">Public Instructor Profile Visibility</span>
                      <span className="text-[10px] text-slate-400">Allow search engine crawlers and guest visitors to discover bios.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.publicProfile}
                      onChange={(e) => setPrivacy(prev => ({ ...prev, publicProfile: e.target.checked }))}
                      className="w-4 h-4 rounded text-brand-600 border-slate-300 cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-slate-700">Allow Direct Messaging Conversations</span>
                      <span className="text-[10px] text-slate-400">Permit students to initiate inbox messaging threads with you.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.allowDirectMsg}
                      onChange={(e) => setPrivacy(prev => ({ ...prev, allowDirectMsg: e.target.checked }))}
                      className="w-4 h-4 rounded text-brand-600 border-slate-300 cursor-pointer"
                    />
                  </div>
                </motion.div>
              )}

              {/* SYSTEM TAB */}
              {activeTab === 'System' && (
                <motion.div
                  key="system"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex flex-col gap-5 text-left"
                >
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-50">System Parameters</h3>
                  
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-left">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-slate-800">Connected Accounts</span>
                      <span className="text-[10px] text-slate-400">Sync Zoom/Google Calendar endpoints for scheduling live lectures.</span>
                    </div>
                    <Button variant="secondary" size="sm" type="button" className="text-[10px] border-slate-200">
                      Link Zoom
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => {
                      if (window.confirm('Confirm logout?')) {
                        alert('Logout event mock triggered.');
                      }
                    }}
                    className="self-start border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5"
                    icon={LogOut}
                  >
                    Logout Workspace
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save Buttons Panel */}
            {activeTab !== 'System' && (
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                {saveSuccess && (
                  <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1">
                    <Check size={11} /> Saved configurations successfully
                  </span>
                )}
                
                <Button
                  variant="primary"
                  type="submit"
                  className="text-xs bg-brand-600 hover:bg-brand-700"
                >
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </Card>
      </div>
    </motion.div>
  );
};

const Select = ({ label, options, value, onChange }) => (
  <div className="flex flex-col w-full gap-1.5 text-left">
    <label className="text-xs font-semibold text-slate-700">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="text-xs font-semibold py-2.5 px-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/10 transition-all cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export default Settings;
