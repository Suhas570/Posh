export type UserRole = 'Employee' | 'Admin' | 'Super Admin' | 'Internal Committee';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  employeeProfile?: Employee;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  manager?: Employee;
}

export interface Asset {
  _id: string;
  name: string;
  serialNumber: string;
  assignedDate: string;
  status: 'Active' | 'Returned' | 'Damaged';
}

export interface Training {
  _id: string;
  courseName: string;
  provider?: string;
  status: 'Enrolled' | 'In Progress' | 'Completed';
  progress: number;
  completionDate?: string;
}

export interface PerformanceReview {
  _id: string;
  reviewCycle: string;
  reviewer: string;
  rating: number;
  feedback?: string;
}

export interface Employee {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  department: Department | string;
  jobTitle: string;
  phone: string;
  photo?: string;
  dateOfJoining: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  manager?: Employee | string;
  baseSalary: number;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
  };
  assets: Asset[];
  trainings: Training[];
  performanceReviews: PerformanceReview[];
}

export interface Attendance {
  _id: string;
  employee: Employee | string;
  date: string;
  clockIn: string;
  clockOut?: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half-Day';
  ipAddress?: string;
  location?: string;
  hoursWorked: number;
}

export interface LeaveRequest {
  _id: string;
  employee: Employee;
  type: 'Sick' | 'Casual' | 'Maternity' | 'Paternity' | 'Unpaid';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: Employee | string;
  remarks?: string;
  createdAt: string;
}

export interface Payroll {
  _id: string;
  employee: Employee;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'Processed' | 'Paid' | 'On Hold';
  paymentDate?: string;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  category: 'General' | 'Holiday' | 'Policy' | 'Event';
  author: string;
  createdAt: string;
}

export interface DocumentFile {
  _id: string;
  name: string;
  type: 'Policy' | 'Employee Record' | 'Certificate' | 'Evidence' | 'Other';
  fileUrl: string;
  uploadedBy: string;
  employee?: string;
  createdAt: string;
}

export interface TimelineEntry {
  _id: string;
  status: string;
  remarks: string;
  date: string;
  updatedBy: string;
}

export interface POSHComplaint {
  _id: string;
  complaintId: string;
  complaintType: string;
  incidentDate: string;
  incidentTime: string;
  incidentLocation: string;
  accusedPerson: string;
  description: string;
  evidence?: string;
  status: 'New' | 'Assigned' | 'Under Review' | 'Investigation' | 'Awaiting Evidence' | 'Resolved' | 'Closed' | 'Rejected' | 'Insufficient Evidence';
  isAnonymous: boolean;
  complainant?: Employee | null;
  assignedInvestigator?: string;
  outcome?: 'Complaint Substantiated' | 'Complaint Not Substantiated' | 'Insufficient Evidence' | 'False Complaint' | 'Other' | '';
  closingRemarks?: string;
  recommendation?: string;
  closureDate?: string;
  timeline: TimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface WitnessStatement {
  _id: string;
  witnessName: string;
  statement: string;
  date: string;
}

export interface InvestigationNote {
  _id: string;
  complaint: string;
  observations: string;
  witnessStatements: WitnessStatement[];
  evidenceSummary: string;
  progress: string;
  recommendation: string;
  remarks: string;
  updatedAt: string;
}

export interface AuditLog {
  _id: string;
  user?: string;
  email: string;
  role: string;
  action: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export interface SystemSettings {
  _id: string;
  companyName: string;
  companyAddress: string;
  contactEmail: string;
  backupFrequency: 'Daily' | 'Weekly' | 'Monthly';
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  maintenanceMode: boolean;
  permissionsMatrix: Record<UserRole, string[]>;
}
