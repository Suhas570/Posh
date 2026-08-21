import React, { useEffect, useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { Skeleton } from '../../components/common/UI';
import { Save, ShieldAlert } from 'lucide-react';

const RolePermissions: React.FC = () => {
  const { showToast } = useNotification();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [matrix, setMatrix] = useState<Record<string, string[]>>({});

  // List of all system permissions for mapping
  const availablePermissions = [
    { key: 'view_dashboard', label: 'View Dashboard' },
    { key: 'view_profile', label: 'View Own Profile' },
    { key: 'punch_attendance', label: 'Clock Attendance' },
    { key: 'apply_leave', label: 'Apply Leave' },
    { key: 'submit_posh', label: 'File POSH Complaints' },
    { key: 'view_payslips', label: 'View Own Payslips' },
    { key: 'manage_employees', label: 'Manage Employee Profile CRUD' },
    { key: 'manage_departments', label: 'Configure Department Units' },
    { key: 'approve_leaves', label: 'Review Leave requests' },
    { key: 'manage_payroll', label: 'Process Employee Salaries' },
    { key: 'view_normal_posh', label: 'Read Normal POSH cases (Admin)' },
    { key: 'assign_posh_ic', label: 'Assign POSH cases to IC' },
    { key: 'manage_users', label: 'Manage Credentials and Access' },
    { key: 'system_config', label: 'Configure Mail & Server Backup' },
    { key: 'role_management', label: 'Configure Security Roles' },
    { key: 'permission_management', label: 'Configure Permissions' },
    { key: 'view_audit_logs', label: 'Read Security Audit logs' },
    { key: 'view_posh_cases', label: 'Read All POSH Cases (Normal & Anonymous)' },
    { key: 'investigate_posh', label: 'IC Case Investigations & Witnesses' },
    { key: 'close_posh_cases', label: 'IC Case Closures / Rejections' }
  ];

  const roles = ['Employee', 'Admin', 'Super Admin', 'Internal Committee'];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/superadmin/settings');
        if (res.data.success) {
          setSettings(res.data.data);
          // Convert Map or object to state record
          setMatrix(res.data.data.permissionsMatrix || {});
        }
      } catch (error) {
        showToast('Failed to load system settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleTogglePermission = (role: string, permKey: string) => {
    const rolePerms = matrix[role] || [];
    let updated: string[];

    if (rolePerms.includes(permKey)) {
      updated = rolePerms.filter(k => k !== permKey);
    } else {
      updated = [...rolePerms, permKey];
    }

    setMatrix({
      ...matrix,
      [role]: updated
    });
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const res = await api.put('/superadmin/settings', {
        permissionsMatrix: matrix
      });
      if (res.data.success) {
        showToast('Role permissions matrix updated successfully!', 'success');
      }
    } catch (error) {
      showToast('Failed to save permissions matrix', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Role & Permission Matrix</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Map security privileges and dashboard modules globally. Super Admin cannot assign POSH access to non-compliance roles.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveLoading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
        >
          <Save size={16} />
          {saveLoading ? 'Saving...' : 'Save Matrix'}
        </button>
      </div>

      {/* POSH Safety Caution */}
      <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200/20 text-amber-800 dark:text-amber-300">
        <h4 className="font-bold flex items-center gap-1.5">
          <ShieldAlert size={16} />
          Role segregation constraints
        </h4>
        <p className="mt-1 text-[11px] leading-relaxed">
          Enabling `view_posh_cases` or `investigate_posh` for Employee or Admin is prevented at the router/controller middleware check. The matrix values here act as feature-flags.
        </p>
      </div>

      {/* Matrix Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700/50 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                <th className="px-6 py-4">System Module Privilege</th>
                {roles.map((r, idx) => (
                  <th key={idx} className="px-6 py-4 text-center">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/30 text-xs">
              {availablePermissions.map((perm) => (
                <tr key={perm.key} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10">
                  <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">
                    {perm.label}
                    <span className="block text-[10px] font-semibold text-gray-400 mt-0.5">{perm.key}</span>
                  </td>
                  {roles.map((role) => {
                    const isChecked = (matrix[role] || []).includes(perm.key);
                    return (
                      <td key={role} className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermission(role, perm.key)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-600 cursor-pointer"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RolePermissions;
