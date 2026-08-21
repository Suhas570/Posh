import React, { useEffect, useState } from 'react';
import { Settings, Save, ShieldCheck } from 'lucide-react';
import { adminService } from '../../services/adminService';

const PlatformSettings = () => {
  const [settings, setSettings] = useState({
    platformName: 'Enterprise LMS Portal',
    theme: 'Dark',
    maintenanceMode: false,
    allowStudentRegistration: true,
    requireTutorApproval: true,
    jwtExpirationDays: 7,
    maxUploadSizeMb: 100
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await adminService.getSettings();
    setSettings(prev => ({ ...prev, ...data }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await adminService.updateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-black tracking-tight text-white">Global Platform Settings</h1>
        <p className="text-xs text-slate-400 font-medium mt-1">Super Admin LMS system parameters, security policies, and theme modes.</p>
      </div>

      <form onSubmit={handleSave} className="bg-[#0d1322] border border-slate-800 p-6 rounded-2xl flex flex-col gap-6 max-w-2xl shadow-xl">
        <div className="flex flex-col gap-1 text-xs font-bold text-slate-300">
          <label>Platform Name</label>
          <input 
            type="text"
            value={settings.platformName}
            onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
            className="bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-slate-200 focus:border-purple-500 font-medium"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 text-xs font-bold text-slate-300">
            <label>JWT Expiration (Days)</label>
            <input 
              type="number"
              value={settings.jwtExpirationDays}
              onChange={(e) => setSettings({ ...settings, jwtExpirationDays: Number(e.target.value) })}
              className="bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-slate-200 focus:border-purple-500 font-medium"
            />
          </div>

          <div className="flex flex-col gap-1 text-xs font-bold text-slate-300">
            <label>Max Upload Size (MB)</label>
            <input 
              type="number"
              value={settings.maxUploadSizeMb}
              onChange={(e) => setSettings({ ...settings, maxUploadSizeMb: Number(e.target.value) })}
              className="bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-slate-200 focus:border-purple-500 font-medium"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2 border-t border-slate-800/80">
          <label className="flex items-center gap-3 text-xs font-bold text-slate-300 cursor-pointer">
            <input 
              type="checkbox"
              checked={settings.requireTutorApproval}
              onChange={(e) => setSettings({ ...settings, requireTutorApproval: e.target.checked })}
              className="w-4 h-4 accent-purple-600 rounded"
            />
            Require Super Admin Approval for New Tutor Accounts
          </label>

          <label className="flex items-center gap-3 text-xs font-bold text-slate-300 cursor-pointer">
            <input 
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="w-4 h-4 accent-purple-600 rounded"
            />
            Enable Maintenance Mode (Restricts Student & Tutor log-in)
          </label>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {saved && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <ShieldCheck size={14} /> Platform settings updated successfully!
            </span>
          )}

          <button
            type="submit"
            className="ml-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-purple-500/20"
          >
            <Save size={14} /> Save Platform Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlatformSettings;
