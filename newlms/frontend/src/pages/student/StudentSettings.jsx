import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Sliders, Shield, Eye, Bell, Globe, Check } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';

const StudentSettings = () => {
  const [activeTab, setActiveTab] = useState('general'); // general, appearance, language, notifications, privacy, security
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'appearance', name: 'Appearance', icon: Sliders },
    { id: 'language', name: 'Language', icon: Globe },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Eye },
    { id: 'security', name: 'Security', icon: Shield },
  ];

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
        title="Settings Workspace" 
        subtitle="Configure your interface configurations, push alert options, password credentials, and local language preferences."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Tabs Switcher Sidebar (1 Column) */}
        <div className="lg:col-span-1 flex flex-col gap-1 bg-white border border-slate-200/50 rounded-[20px] p-3 shadow-sm h-fit">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-100/30' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
              >
                <tab.icon size={15} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Tab Panel (3 Columns) */}
        <div className="lg:col-span-3">
          <Card className="p-6 bg-white border-slate-200/50 shadow-sm text-left">
            <form onSubmit={handleSave} className="flex flex-col gap-5">
              
              {activeTab === 'general' && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-extrabold text-slate-800 border-b pb-2 border-slate-100">General Workspace Options</h3>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-slate-700">Autoplay next lesson</span>
                      <span className="text-[10px] text-slate-400 font-medium">Automatically load next video on completion</span>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-slate-700">Email digests</span>
                      <span className="text-[10px] text-slate-400 font-medium">Receive weekly summarized milestones report</span>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-extrabold text-slate-800 border-b pb-2 border-slate-100">Theme Appearance</h3>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-700">Theme mode selection</span>
                    <div className="grid grid-cols-3 gap-3">
                      <button type="button" className="p-4 border-2 border-indigo-600 bg-white rounded-xl text-xs font-extrabold text-indigo-700 text-center shadow-sm">
                        Light Mode
                      </button>
                      <button type="button" disabled className="p-4 border border-slate-200 bg-slate-50 rounded-xl text-xs font-bold text-slate-400 text-center opacity-60">
                        Dark Mode (Soon)
                      </button>
                      <button type="button" disabled className="p-4 border border-slate-200 bg-slate-50 rounded-xl text-xs font-bold text-slate-400 text-center opacity-60">
                        System Default
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'language' && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-extrabold text-slate-800 border-b pb-2 border-slate-100">Language & Region</h3>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">Preferred Language</label>
                    <select className="text-xs font-semibold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-[14px] focus:outline-none focus:border-indigo-500 cursor-pointer">
                      <option>English (United States)</option>
                      <option>Spanish (Español)</option>
                      <option>French (Français)</option>
                      <option>German (Deutsch)</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-extrabold text-slate-800 border-b pb-2 border-slate-100">Alert Notification Triggers</h3>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                      Notify when a new course is published
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                      Notify when lessons are marked complete
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                      Notify for upcoming live webinars and exam deadlines
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-extrabold text-slate-800 border-b pb-2 border-slate-100">Privacy & Profile Visibility</h3>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-slate-700">Public Profile visibility</span>
                      <span className="text-[10px] text-slate-400 font-medium">Let other students search and view your completed stats</span>
                    </div>
                    <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-extrabold text-slate-800 border-b pb-2 border-slate-100">Security Credentials</h3>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-700">Change password</span>
                    <span className="text-[10px] text-slate-400 font-medium">Update your password protection codes below</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                    <input 
                      type="password" 
                      placeholder="New password" 
                      className="text-xs font-semibold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-[14px] focus:outline-none"
                    />
                    <input 
                      type="password" 
                      placeholder="Confirm password" 
                      className="text-xs font-semibold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-[14px] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-4 border-t border-slate-100 pt-4">
                {saved && (
                  <span className="text-xs text-emerald-600 font-extrabold flex items-center gap-1 animate-pulse">
                    <Check size={14} /> System preferences saved!
                  </span>
                )}
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="md"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  Save Settings
                </Button>
              </div>

            </form>
          </Card>
        </div>

      </div>

    </motion.div>
  );
};

export default StudentSettings;
