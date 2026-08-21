import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { Skeleton } from '../../components/common/UI';
import { Save, Database, ShieldAlert, Mail, Settings } from 'lucide-react';

const SystemSettings: React.FC = () => {
  const { showToast } = useNotification();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupDetails, setBackupDetails] = useState<any>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const loadSettings = async () => {
    try {
      const res = await api.get('/superadmin/settings');
      if (res.data.success) {
        setSettings(res.data.data);
        setValue('companyName', res.data.data.companyName);
        setValue('companyAddress', res.data.data.companyAddress);
        setValue('contactEmail', res.data.data.contactEmail);
        setValue('backupFrequency', res.data.data.backupFrequency);
        setValue('smtpHost', res.data.data.smtpHost);
        setValue('smtpPort', res.data.data.smtpPort);
        setValue('smtpUser', res.data.data.smtpUser);
        setValue('smtpPass', res.data.data.smtpPass);
        setValue('maintenanceMode', res.data.data.maintenanceMode);
      }
    } catch (error) {
      showToast('Failed to load system settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const onSubmit = async (data: any) => {
    setSaveLoading(true);
    try {
      const payload = {
        ...data,
        smtpPort: parseInt(data.smtpPort),
        maintenanceMode: data.maintenanceMode === 'true' || data.maintenanceMode === true
      };

      const res = await api.put('/superadmin/settings', payload);
      if (res.data.success) {
        showToast('System configuration saved successfully!', 'success');
        loadSettings();
      }
    } catch (error) {
      showToast('Failed to update system settings', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const res = await api.post('/superadmin/backup');
      if (res.data.success) {
        showToast('Database backup archive generated successfully!', 'success');
        setBackupDetails(res.data.data);
      }
    } catch (error) {
      showToast('Failed to trigger database backup', 'error');
    } finally {
      setBackupLoading(false);
    }
  };

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">System Settings</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Configure global parameters, SMTP nodes, maintenance states, and trigger backups</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CONFIGURATION FORM */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* General parameters */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-gray-800 dark:text-white flex items-center gap-1.5 border-b border-gray-50 dark:border-gray-700/30 pb-2">
                <Settings size={16} className="text-indigo-600" />
                General Corporate Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Company Name</label>
                  <input
                    type="text"
                    {...register('companyName', { required: 'Required' })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Support Contact Email</label>
                  <input
                    type="email"
                    {...register('contactEmail', { required: 'Required' })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Company Address</label>
                  <input
                    type="text"
                    {...register('companyAddress', { required: 'Required' })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SMTP Mail settings */}
            <div className="space-y-4 pt-2">
              <h3 className="font-bold text-sm text-gray-800 dark:text-white flex items-center gap-1.5 border-b border-gray-50 dark:border-gray-700/30 pb-2">
                <Mail size={16} className="text-indigo-600" />
                SMTP Transmission Node (Nodemailer config)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">SMTP Hostname</label>
                  <input
                    type="text"
                    {...register('smtpHost')}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">SMTP Port</label>
                  <input
                    type="number"
                    {...register('smtpPort')}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">SMTP Username</label>
                  <input
                    type="text"
                    {...register('smtpUser')}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">SMTP Password</label>
                  <input
                    type="password"
                    {...register('smtpPass')}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Maintenance Mode */}
            <div className="space-y-4 pt-2">
              <h3 className="font-bold text-sm text-gray-800 dark:text-white flex items-center gap-1.5 border-b border-gray-50 dark:border-gray-700/30 pb-2">
                <ShieldAlert size={16} className="text-indigo-600" />
                Security & Mode Parameters
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">System State Mode</label>
                  <div className="flex items-center gap-4 py-2">
                    <label className="flex items-center font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input type="radio" value="false" {...register('maintenanceMode')} defaultChecked className="mr-2" />
                      Live / Online
                    </label>
                    <label className="flex items-center font-semibold text-rose-600 dark:text-rose-400 cursor-pointer">
                      <input type="radio" value="true" {...register('maintenanceMode')} className="mr-2" />
                      Maintenance Mode
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Automated Backups Schedule</label>
                  <select
                    {...register('backupFrequency')}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none text-gray-950 dark:text-white"
                  >
                    <option value="Daily">Daily Scheduled Archive</option>
                    <option value="Weekly">Weekly Scheduled Archive</option>
                    <option value="Monthly">Monthly Scheduled Archive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700/50">
              <button
                type="submit"
                disabled={saveLoading}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                {saveLoading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* DATABASE BACKUP PANEL */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm flex flex-col">
            <h3 className="font-bold text-sm text-gray-800 dark:text-white flex items-center gap-1.5 border-b border-gray-50 dark:border-gray-700/30 pb-2 mb-4">
              <Database size={16} className="text-indigo-600" />
              Backup & Database Utility
            </h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-[11px] mb-4">
              Directly compile and export MongoDB schemas into downloadable JSON collections backup.
            </p>
            <button
              onClick={handleBackup}
              disabled={backupLoading}
              className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-655 border border-gray-200 dark:border-gray-700 font-bold rounded-xl text-gray-850 dark:text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Database size={14} />
              {backupLoading ? 'Archiving...' : 'Trigger Manual Backup'}
            </button>

            {backupDetails && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/20 border border-gray-100 dark:border-gray-700/30 rounded-xl space-y-2 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-semibold">Backup Target:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{backupDetails.backupFile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-semibold">Archive Size:</span>
                  <span className="font-bold text-gray-800 dark:text-white">{backupDetails.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-semibold">Created Timestamp:</span>
                  <span className="font-bold text-gray-800 dark:text-white">{new Date(backupDetails.date).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SystemSettings;
