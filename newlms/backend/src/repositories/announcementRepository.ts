import fs from 'fs';
import path from 'path';
import prisma from '../db';

const filePath = path.join(__dirname, '../../../data/announcements.json');

const readCache = (): any[] => {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (e) {}
  return [
    { id: 'ann-1', title: 'System Maintenance Scheduled', text: 'Server upgrade on Saturday 2:00 AM UTC.', date: '2026-07-18', target: 'ALL', status: 'ACTIVE' }
  ];
};

const writeCache = (data: any[]) => {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (e) {}
};

export const announcementRepository = {
  getAnnouncements: async (targetRole?: string) => {
    let list = readCache();
    try {
      const dbAnnouncements = await prisma.announcement.findMany();
      if (dbAnnouncements && dbAnnouncements.length > 0) {
        list = dbAnnouncements;
      }
    } catch (e) {}

    if (!targetRole || targetRole === 'ALL') return list;
    return list.filter((a: any) => a.target === 'ALL' || a.target === targetRole || a.target === `${targetRole}S`);
  },

  createAnnouncement: async (data: any) => {
    const list = readCache();
    const newAnn = {
      id: data.id || `ann-${Math.random().toString(36).substr(2, 7)}`,
      title: data.title || 'System Announcement',
      text: data.text || '',
      target: data.target || 'ALL',
      status: data.status || 'ACTIVE',
      date: new Date().toISOString().split('T')[0]
    };
    list.unshift(newAnn);
    writeCache(list);

    try {
      await prisma.announcement.create({ data: { title: newAnn.title, content: newAnn.text, target: newAnn.target, date: newAnn.date } });
    } catch (e) {}

    return newAnn;
  },

  updateAnnouncement: async (id: string, updates: any) => {
    let list = readCache();
    list = list.map((a: any) => a.id === id ? { ...a, ...updates } : a);
    writeCache(list);
    return list.find((a: any) => a.id === id);
  },

  deleteAnnouncement: async (id: string) => {
    let list = readCache().filter((a: any) => a.id !== id);
    writeCache(list);
    return { success: true, id };
  }
};
