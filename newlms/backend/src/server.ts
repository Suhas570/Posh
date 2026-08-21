import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import courseRoutes from './routes/tutor/courseRoutes';
import activityRoutes from './routes/tutor/activityRoutes';
import reviewRoutes from './routes/tutor/reviewRoutes';
import messageRoutes from './routes/tutor/messageRoutes';
import announcementRoutes from './routes/tutor/announcementRoutes';
import calendarRoutes from './routes/tutor/calendarRoutes';
import assignmentRoutes from './routes/tutor/assignmentRoutes';
import studentRoutes from './routes/student/studentRoutes';
import adminRoutes from './routes/admin/adminRoutes';
import hrRoutes from './routes/tutor/hrRoutes';
import candidateRoutes from './routes/student/candidateRoutes';
import authRoutes from './routes/authRoutes';
import certificateRoutes from './routes/student/certificateRoutes';
import certificateAdminRoutes from './routes/admin/certificateAdminRoutes';
import verifyRoutes from './routes/public/verifyRoutes';
import { seedAssessmentDatabase } from './seed_assessment';

import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes, static assets, and preflight requests
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-file-name', 'x-file-type', 'Authorization']
}));

// POST /api/upload - Handle binary file uploads directly from request body streams
app.post('/api/upload', (req: Request, res: Response) => {
  const rawFileName = req.headers['x-file-name'] as string;
  const fileType = req.headers['x-file-type'] as string; // pdf, ppt, doc, zip
  
  if (!rawFileName || !fileType) {
    return res.status(400).json({ error: 'Missing x-file-name or x-file-type headers' });
  }

  const fileName = decodeURIComponent(rawFileName);
  const targetDir = path.join(__dirname, '../uploads', fileType.toLowerCase());
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, fileName);
  const writeStream = fs.createWriteStream(filePath);
  
  req.pipe(writeStream);
  
  writeStream.on('finish', () => {
    console.log(`[Upload] Real file saved successfully: ${filePath}`);
    res.status(201).json({
      url: `http://localhost:5000/uploads/${fileType.toLowerCase()}/${encodeURIComponent(fileName)}`
    });
  });

  writeStream.on('error', (err) => {
    console.error('[Upload] Failed to save file:', err.message);
    res.status(500).json({ error: 'Failed to write file to disk' });
  });
});

// Express middleware to auto-create missing mock uploads on demand if file does not exist
app.use('/uploads', (req, res, next) => {
  const decodedPath = decodeURIComponent(req.path);
  const filePath = path.join(__dirname, '../uploads', decodedPath);
  
  if (!fs.existsSync(filePath)) {
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      const ext = path.extname(filePath).toLowerCase();
      if (ext === '.pdf') {
        const dummyPdf = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 50 >>\nstream\nBT /F1 12 Tf 70 700 Td (Mock PDF Document: ${path.basename(filePath)}) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000212 00000 n\ntrailer << /Size 5 /Root 1 0 R >>\nstartxref\n311\n%%EOF`;
        fs.writeFileSync(filePath, dummyPdf);
      } else if (ext === '.pptx' || ext === '.ppt') {
        fs.writeFileSync(filePath, `PowerPoint Slide Deck Template: ${path.basename(filePath)}`);
      } else if (ext === '.docx' || ext === '.doc') {
        fs.writeFileSync(filePath, `Word Document Handout: ${path.basename(filePath)}`);
      } else {
        fs.writeFileSync(filePath, `Mock Zip Archive / Resource File: ${path.basename(filePath)}`);
      }
      console.log(`[Auto-Mock] Generated missing upload file: ${filePath}`);
    } catch (err: any) {
      console.error('[Auto-Mock] Failed to create mock file:', err.message);
    }
  }
  next();
});

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Body parser middleware
app.use(express.json());

// Request logger middleware
app.use((req: Request, res: Response, next: express.NextFunction) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  next();
});

// Bind routes
app.use('/api/courses', courseRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);

// Assessment routes
app.use('/api/auth', authRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/candidate', candidateRoutes);

// Certificate module: candidate self-service, HR/admin management, and public verification
app.use('/api/certificates', certificateRoutes);
app.use('/api/admin/certificates', certificateAdminRoutes);
app.use('/api/verify', verifyRoutes);

// Base sanity check route
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'Tutor LMS Rest API backend is running successfully.',
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.'
  });
});

app.listen(PORT, () => {
  seedAssessmentDatabase();
  console.log(`===============================================`);
  console.log(`🚀 Server active and listening on port: ${PORT}`);
  console.log(`👉 Sanity check endpoint: http://localhost:${PORT}/`);
  console.log(`===============================================`);
});
