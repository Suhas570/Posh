import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
  companyName: {
    type: String,
    default: 'Enterprise HRMS Ltd'
  },
  companyAddress: {
    type: String,
    default: '101, Silicon Valley Tech Park, Bangalore, India'
  },
  contactEmail: {
    type: String,
    default: 'support@enterprisehrms.com'
  },
  backupFrequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly'],
    default: 'Weekly'
  },
  smtpHost: {
    type: String,
    default: 'smtp.mailtrap.io'
  },
  smtpPort: {
    type: Number,
    default: 2525
  },
  smtpUser: {
    type: String,
    default: ''
  },
  smtpPass: {
    type: String,
    default: ''
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  permissionsMatrix: {
    type: Map,
    of: [String],
    default: {
      'Employee': ['view_dashboard', 'view_profile', 'punch_attendance', 'apply_leave', 'submit_posh', 'view_payslips'],
      'Admin': ['view_dashboard', 'manage_employees', 'manage_departments', 'approve_leaves', 'manage_payroll', 'view_normal_posh', 'assign_posh_ic'],
      'Super Admin': ['view_dashboard', 'manage_users', 'system_config', 'role_management', 'permission_management', 'view_audit_logs', 'db_backup'],
      'Internal Committee': ['view_dashboard', 'view_posh_cases', 'investigate_posh', 'close_posh_cases']
    }
  }
}, {
  timestamps: true
});

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);
export default SystemSettings;
