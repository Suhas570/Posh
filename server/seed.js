import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Employee from './models/Employee.js';
import Department from './models/Department.js';
import SystemSettings from './models/SystemSettings.js';
import POSHComplaint from './models/POSHComplaint.js';
import InvestigationNote from './models/InvestigationNote.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hrms');
    console.log('Connected to MongoDB for seeding...');

    // Clear database and drop all existing collections/indexes completely
    await mongoose.connection.db.dropDatabase();
    console.log('Database dropped and cleared of all collections/indexes.');


    // 1. Create Departments
    const hrDept = await Department.create({
      name: 'Human Resources',
      code: 'HR',
      description: 'Human resource management, payroll, hiring, and employee relations'
    });

    const engDept = await Department.create({
      name: 'Engineering',
      code: 'ENG',
      description: 'Software development, engineering systems, QA, and devops'
    });

    const opsDept = await Department.create({
      name: 'Operations & Compliance',
      code: 'OPS',
      description: 'Operations compliance, legal review, and facilities management'
    });

    console.log('Departments seeded.');

    // 2. Create Employee Profiles
    const johnDoe = await Employee.create({
      employeeId: 'EMP-001',
      firstName: 'John',
      lastName: 'Doe',
      department: engDept._id,
      jobTitle: 'Senior Software Engineer',
      phone: '+1 (555) 019-2834',
      dateOfJoining: new Date('2022-03-15'),
      baseSalary: 8500,
      bankDetails: {
        bankName: 'Silicon Valley Bank',
        accountNumber: '1234567890',
        ifscCode: 'SVB000123'
      },
      assets: [
        { name: 'MacBook Pro 16"', serialNumber: 'MBP-2024-X8910', assignedDate: new Date('2024-01-10') }
      ],
      trainings: [
        { courseName: 'Secure Coding Standards', provider: 'AGY Security', status: 'Completed', progress: 100, completionDate: new Date('2025-05-12') },
        { courseName: 'Annual POSH Sensitization 2026', provider: 'Internal Compliance Team', status: 'Completed', progress: 100, completionDate: new Date('2026-02-01') }
      ],
      performanceReviews: [
        { reviewCycle: 'Annual 2025', reviewer: 'Jane Smith', rating: 4, feedback: 'John is an excellent engineer with a proactive attitude.' }
      ]
    });

    const janeSmith = await Employee.create({
      employeeId: 'EMP-002',
      firstName: 'Jane',
      lastName: 'Smith',
      department: hrDept._id,
      jobTitle: 'HR Director',
      phone: '+1 (555) 018-4729',
      dateOfJoining: new Date('2020-06-01'),
      baseSalary: 9500,
      bankDetails: {
        bankName: 'Chase Bank',
        accountNumber: '0987654321',
        ifscCode: 'CHAS000456'
      },
      assets: [
        { name: 'ThinkPad T14 Gen 4', serialNumber: 'TP-48201-92B', assignedDate: new Date('2023-07-15') }
      ]
    });

    const aliceJohnson = await Employee.create({
      employeeId: 'EMP-003',
      firstName: 'Alice',
      lastName: 'Johnson',
      department: opsDept._id,
      jobTitle: 'Internal Compliance Officer',
      phone: '+1 (555) 017-9102',
      dateOfJoining: new Date('2021-11-10'),
      baseSalary: 9000,
      bankDetails: {
        bankName: 'Wells Fargo',
        accountNumber: '1122334455',
        ifscCode: 'WELL000789'
      }
    });

    console.log('Employee profiles seeded.');

    // 3. Create Users (Authentication Logins)
    const employeeUser = await User.create({
      email: 'employee@hrms.com',
      password: 'password',
      role: 'Employee',
      employeeProfile: johnDoe._id
    });

    const adminUser = await User.create({
      email: 'admin@hrms.com',
      password: 'password',
      role: 'Admin',
      employeeProfile: janeSmith._id
    });

    const icUser = await User.create({
      email: 'ic@hrms.com',
      password: 'password',
      role: 'Internal Committee',
      employeeProfile: aliceJohnson._id
    });

    const superAdminUser = await User.create({
      email: 'superadmin@hrms.com',
      password: 'password',
      role: 'Super Admin'
    });

    console.log('Authentication logins seeded.');

    // 4. Create System Settings
    await SystemSettings.create({});
    console.log('System settings seeded.');

    // 5. Create Seed POSH Complaints
    // Normal POSH Complaint (Visible to Employee, Admin, IC)
    const normalCase = await POSHComplaint.create({
      complaintId: 'POSH-2026-1029',
      complaintType: 'Verbal Harassment',
      incidentDate: new Date('2026-07-10'),
      incidentTime: '14:30',
      incidentLocation: 'Third Floor Conference Room A',
      accusedPerson: 'Robert Vance',
      description: 'During the quarterly project review, the accused made inappropriate comments regarding my appearance, which made me feel highly uncomfortable.',
      isAnonymous: false,
      complainant: johnDoe._id,
      status: 'New',
      timeline: [
        {
          status: 'New',
          remarks: 'Complaint submitted by employee John Doe',
          updatedBy: 'System'
        }
      ]
    });

    // Anonymous POSH Complaint (Visible to Employee, IC ONLY - Admin/Super Admin blocked)
    const anonymousCase = await POSHComplaint.create({
      complaintId: 'POSH-2026-7821',
      complaintType: 'Hostile Work Environment',
      incidentDate: new Date('2026-07-18'),
      incidentTime: '18:15',
      incidentLocation: 'Office Parking Lot',
      accusedPerson: 'Charlie Green',
      description: 'The accused has consistently exhibited hostile behavior including unwelcome communications and stalking, creating an unsafe and hostile work environment.',
      isAnonymous: true,
      complainant: johnDoe._id, // Secured link in database for owner dashboard, but scrubbed in IC/Admin fetches
      status: 'Investigation',
      assignedInvestigator: 'Alice Johnson',
      timeline: [
        {
          status: 'New',
          remarks: 'Anonymous complaint filed.',
          updatedBy: 'System'
        },
        {
          status: 'Under Review',
          remarks: 'Case reviewed by Internal Committee.',
          updatedBy: 'Internal Committee'
        },
        {
          status: 'Investigation',
          remarks: 'Active investigation initiated. Compliance Officer Alice Johnson appointed as investigator.',
          updatedBy: 'Internal Committee'
        }
      ]
    });

    // Seed private investigation notes for the Anonymous Case
    await InvestigationNote.create({
      complaint: anonymousCase._id,
      observations: 'Initial review suggests patterns of repeated late-hour messaging. Preliminary logs requested from system audit trail.',
      witnessStatements: [
        {
          witnessName: 'David Wallace',
          statement: 'I noticed Charlie hovering near the complainant\'s desk late in the evening on several occasions, which seemed unusual for his team.',
          date: new Date('2026-07-22')
        }
      ],
      evidenceSummary: 'Complainant uploaded screenshots showing multiple late night communications which are outside work hours and unrelated to project scopes.',
      progress: 'Witness interview with David Wallace completed. Pending schedule for accused interview.',
      recommendation: '',
      remarks: 'Highest confidentiality must be maintained to secure anonymous complainant identity.',
      updatedBy: icUser._id
    });

    console.log('POSH complaints & investigation logs seeded.');
    console.log('Database Seeding Successful! Press Ctrl+C to exit.');
    
    // Explicit exit
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
