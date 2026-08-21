import fs from 'fs';
import path from 'path';

const filePath = path.join(__dirname, '../../../data/users.json');

const DEFAULT_USERS = [
  { id: 'usr-1', name: 'Dr. Manoj Kumar', email: 'manoj@lms.com', role: 'TUTOR', status: 'ACTIVE', approvalStatus: 'APPROVED', joined: '2026-01-15' },
  { id: 'usr-2', name: 'Alex Johnson', email: 'alex@student.com', role: 'STUDENT', status: 'ACTIVE', approvalStatus: 'APPROVED', joined: '2026-02-10' },
  { id: 'usr-3', name: 'Sophia Chen', email: 'sophia@student.com', role: 'STUDENT', status: 'ACTIVE', approvalStatus: 'APPROVED', joined: '2026-03-01' },
  { id: 'usr-4', name: 'Prof. Alan Turing', email: 'turing@tutor.com', role: 'TUTOR', status: 'ACTIVE', approvalStatus: 'PENDING', joined: '2026-01-20' },
  { id: 'usr-5', name: 'Super Admin', email: 'admin@lms.com', role: 'ADMIN', status: 'ACTIVE', approvalStatus: 'APPROVED', joined: '2026-01-01' }
];

const readCache = (): any[] => {
  try {
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {}
  writeCache(DEFAULT_USERS);
  return DEFAULT_USERS;
};

const writeCache = (data: any[]) => {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (e) {}
};

export const tutorRepository = {
  getTutors: async () => {
    const users = readCache();
    return users.filter((u: any) => u.role === 'TUTOR');
  },

  createTutor: async (data: any) => {
    const users = readCache();
    const newTutor = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: 'TUTOR',
      status: 'ACTIVE',
      approvalStatus: 'PENDING',
      joined: new Date().toISOString().split('T')[0]
    };
    users.push(newTutor);
    writeCache(users);
    return newTutor;
  },

  updateTutorApproval: async (id: string, approvalStatus: string) => {
    let users = readCache();
    users = users.map((u: any) => u.id === id ? { ...u, approvalStatus, status: approvalStatus === 'APPROVED' ? 'ACTIVE' : u.status } : u);
    writeCache(users);
    return users.find((u: any) => u.id === id);
  },

  updateTutorStatus: async (id: string, status: string) => {
    let users = readCache();
    users = users.map((u: any) => u.id === id ? { ...u, status } : u);
    writeCache(users);
    return users.find((u: any) => u.id === id);
  },

  deleteTutor: async (id: string) => {
    let users = readCache().filter((u: any) => u.id !== id);
    writeCache(users);
    return { success: true, deletedId: id };
  }
};
