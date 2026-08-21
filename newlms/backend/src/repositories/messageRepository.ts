import fs from 'fs';
import path from 'path';
import prisma from '../db';

const filePath = path.join(__dirname, '../../../data/messages.json');

const DEFAULT_MESSAGES = [
  { id: 'msg-1', sender: 'Dr. Manoj Kumar', role: 'TUTOR', text: 'Hello Admin, I submitted my Python course for review.', time: '10 mins ago' },
  { id: 'msg-2', sender: 'Super Admin', role: 'ADMIN', text: 'Great! I will inspect the curriculum and publish it.', time: '5 mins ago' }
];

const readCache = (): any[] => {
  try {
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {}
  writeCache(DEFAULT_MESSAGES);
  return DEFAULT_MESSAGES;
};

const writeCache = (data: any[]) => {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (e) {}
};

export const messageRepository = {
  getMessages: async () => {
    let list = readCache();
    try {
      const dbMsgs = await prisma.message.findMany();
      if (dbMsgs && dbMsgs.length > 0) list = dbMsgs;
    } catch (e) {}
    return list;
  },

  sendMessage: async (data: any) => {
    const list = readCache();
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: data.sender || 'Super Admin',
      role: data.role || 'ADMIN',
      receiver: data.receiver || 'Tutor',
      text: data.text || '',
      time: 'Just now'
    };
    list.push(newMsg);
    writeCache(list);

    try {
      await prisma.message.create({ data: { sender: newMsg.sender, subject: 'Direct Message', preview: newMsg.text, date: newMsg.time } });
    } catch (e) {}

    return newMsg;
  }
};
