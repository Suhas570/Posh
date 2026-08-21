import { Router, Request, Response } from 'express';
import prisma from '../../db';
import fs from 'fs';
import path from 'path';

const router = Router();

const assignmentsCachePath = path.join(__dirname, '../../../data/voice_assignments.json');
const submissionsCachePath = path.join(__dirname, '../../../data/voice_submissions.json');

// Initial sample assignments if DB and local files are empty
const INITIAL_SAMPLE_ASSIGNMENTS = [
  {
    id: 'voice-assign-1',
    title: 'Web Accessibility & Voice UI Quiz',
    description: 'Test your knowledge on WAI-ARIA standards, WCAG 2.1 guidelines, and speech recognition systems.',
    status: 'Published',
    tutorId: 'tutor-1',
    tutorName: 'Tutor Manoj',
    duration: 15,
    totalMarks: 20,
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'q1',
        text: 'What does WAI-ARIA stand for in web accessibility?',
        options: [
          'Web Accessibility Initiative - Accessible Rich Internet Applications',
          'Web Application Interface - Automated Rich Input Actions',
          'Wide Access Integration - Accessible Responsive Interactive Apps',
          'Web Audio Integration - Accessible Realtime Interaction Api'
        ],
        correctAnswer: 'Web Accessibility Initiative - Accessible Rich Internet Applications',
        marks: 5
      },
      {
        id: 'q2',
        text: 'Which HTML attribute provides text alternatives for screen readers when images cannot be displayed?',
        options: [
          'title',
          'alt',
          'aria-label',
          'description'
        ],
        correctAnswer: 'alt',
        marks: 5
      },
      {
        id: 'q3',
        text: 'Which Web API is used in modern browsers for Speech-to-Text Voice Recognition?',
        options: [
          'SpeechSynthesis',
          'SpeechRecognition',
          'AudioContext',
          'MediaStreamTrack'
        ],
        correctAnswer: 'SpeechRecognition',
        marks: 5
      },
      {
        id: 'q4',
        text: 'True or False: Accessible websites benefit visually impaired users as well as keyboard-only navigators.',
        options: [
          'True',
          'False'
        ],
        correctAnswer: 'True',
        marks: 5
      }
    ]
  }
];

// Local JSON File Helper Utilities
const saveLocalAssignments = (assignments: any[]) => {
  try {
    const dir = path.dirname(assignmentsCachePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(assignmentsCachePath, JSON.stringify(assignments, null, 2));
  } catch (e) {
    console.error('Failed to write local assignments cache:', e);
  }
};

const getLocalAssignments = (): any[] => {
  try {
    if (fs.existsSync(assignmentsCachePath)) {
      const data = JSON.parse(fs.readFileSync(assignmentsCachePath, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {}
  saveLocalAssignments(INITIAL_SAMPLE_ASSIGNMENTS);
  return INITIAL_SAMPLE_ASSIGNMENTS;
};

const saveLocalSubmissions = (submissions: any[]) => {
  try {
    const dir = path.dirname(submissionsCachePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(submissionsCachePath, JSON.stringify(submissions, null, 2));
  } catch (e) {
    console.error('Failed to write local submissions cache:', e);
  }
};

const getLocalSubmissions = (): any[] => {
  try {
    if (fs.existsSync(submissionsCachePath)) {
      const data = JSON.parse(fs.readFileSync(submissionsCachePath, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch (e) {}
  return [];
};

// GET /api/assignments - Get all voice assignments
router.get('/', async (req: Request, res: Response) => {
  const { status } = req.query;
  try {
    const dbAssignments = await (prisma as any).voiceAssignment.findMany();
    const localAssignments = getLocalAssignments();

    const mergedMap = new Map();
    [...dbAssignments, ...localAssignments].forEach(item => {
      if (item && item.id && !mergedMap.has(item.id)) {
        mergedMap.set(item.id, item);
      }
    });

    let list = Array.from(mergedMap.values());
    if (status) {
      const targetStatus = String(status).toLowerCase();
      if (targetStatus === 'published' || targetStatus === 'active') {
        list = list.filter(a => {
          const s = (a.status || 'Published').toLowerCase();
          return s === 'published' || s === 'active';
        });
      } else {
        list = list.filter(a => (a.status || 'Published').toLowerCase() === targetStatus);
      }
    }

    res.json(list);
  } catch (error) {
    console.warn('[DB Fallback] Fetching voice assignments from local cache');
    let list = getLocalAssignments();
    if (status) {
      const targetStatus = String(status).toLowerCase();
      if (targetStatus === 'published' || targetStatus === 'active') {
        list = list.filter(a => {
          const s = (a.status || 'Published').toLowerCase();
          return s === 'published' || s === 'active';
        });
      } else {
        list = list.filter(a => (a.status || 'Published').toLowerCase() === targetStatus);
      }
    }
    res.json(list);
  }
});

// GET /api/assignments/submissions/all - Get all submissions for tutors
router.get('/submissions/all', async (req: Request, res: Response) => {
  try {
    const dbSubmissions = await (prisma as any).voiceAssignmentSubmission.findMany();
    const localSubmissions = getLocalSubmissions();
    const mergedMap = new Map();
    [...dbSubmissions, ...localSubmissions].forEach(s => {
      if (s && s.id && !mergedMap.has(s.id)) {
        mergedMap.set(s.id, s);
      }
    });
    res.json(Array.from(mergedMap.values()));
  } catch (error) {
    res.json(getLocalSubmissions());
  }
});

// GET /api/assignments/submissions/student/:studentId - Get student submissions
router.get('/submissions/student/:studentId', async (req: Request, res: Response) => {
  const { studentId } = req.params;
  try {
    const dbSubmissions = await (prisma as any).voiceAssignmentSubmission.findMany({
      where: { studentId }
    });
    if (dbSubmissions && dbSubmissions.length > 0) {
      return res.json(dbSubmissions);
    }
  } catch (error) {}

  const localSubmissions = getLocalSubmissions().filter(s => s.studentId === studentId || s.studentId === 'student-1');
  res.json(localSubmissions);
});

// GET /api/assignments/:id - Get single assignment
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const dbAssignment = await (prisma as any).voiceAssignment.findUnique({
      where: { id }
    });
    if (dbAssignment) return res.json(dbAssignment);
  } catch (error) {}

  const local = getLocalAssignments().find(a => a.id === id);
  if (local) return res.json(local);
  res.status(404).json({ error: 'Voice Assignment not found' });
});

// POST /api/assignments - Create new Voice Assistance Assignment
router.post('/', async (req: Request, res: Response) => {
  const { title, description, duration, questions, tutorId, tutorName, status } = req.body;

  if (!title || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Title and at least one question are required' });
  }

  // Calculate total marks
  const totalMarks = questions.reduce((acc: number, q: any) => acc + (Number(q.marks) || 1), 0);

  const newAssignment = {
    id: `voice-assign-${Date.now()}`,
    title,
    description: description || '',
    status: status || 'Published',
    duration: Number(duration) || 15,
    totalMarks,
    tutorId: tutorId || 'tutor-1',
    tutorName: tutorName || 'Tutor Manoj',
    createdAt: new Date().toISOString(),
    questions: questions.map((q: any, idx: number) => ({
      id: q.id || `q-${idx + 1}-${Date.now()}`,
      text: q.text,
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: q.correctAnswer || (q.options ? q.options[0] : ''),
      marks: Number(q.marks) || 1
    }))
  };

  try {
    const dbPayload = {
      ...newAssignment,
      createdAt: new Date()
    };
    const created = await (prisma as any).voiceAssignment.create({
      data: dbPayload
    });
    // Sync local
    const local = getLocalAssignments();
    saveLocalAssignments([created, ...local]);
    return res.status(201).json(created);
  } catch (error: any) {
    console.warn('[DB Fallback] Failed to save assignment in DB, saving locally:', error.message);
    const local = getLocalAssignments();
    const updated = [newAssignment, ...local];
    saveLocalAssignments(updated);
    return res.status(201).json(newAssignment);
  }
});

// PUT /api/assignments/:id - Update Voice Assignment
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, duration, questions, status } = req.body;

  const totalMarks = Array.isArray(questions)
    ? questions.reduce((acc: number, q: any) => acc + (Number(q.marks) || 1), 0)
    : 0;

  const updateData = {
    title,
    description,
    status: status || 'Published',
    duration: Number(duration) || 15,
    totalMarks,
    questions: Array.isArray(questions) ? questions.map((q: any, idx: number) => ({
      id: q.id || `q-${idx + 1}`,
      text: q.text,
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: q.correctAnswer,
      marks: Number(q.marks) || 1
    })) : []
  };

  try {
    const updated = await (prisma as any).voiceAssignment.update({
      where: { id },
      data: updateData
    });
    // Sync local
    const local = getLocalAssignments().map(a => a.id === id ? { ...a, ...updateData } : a);
    saveLocalAssignments(local);
    return res.json(updated);
  } catch (error) {
    const local = getLocalAssignments();
    const index = local.findIndex(a => a.id === id);
    if (index !== -1) {
      local[index] = { ...local[index], ...updateData };
      saveLocalAssignments(local);
      return res.json(local[index]);
    }
    return res.status(404).json({ error: 'Assignment not found' });
  }
});

// DELETE /api/assignments/:id - Delete Voice Assignment
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await (prisma as any).voiceAssignment.delete({ where: { id } });
  } catch (error) {}

  const local = getLocalAssignments().filter(a => a.id !== id);
  saveLocalAssignments(local);
  res.json({ message: 'Assignment deleted successfully', id });
});

// POST /api/assignments/:id/submit - Submit assignment by student
router.post('/:id/submit', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { studentId, studentName, answers } = req.body; // answers: { [questionId]: selectedAnswer }

  // Fetch assignment to grade
  let assignment: any = null;
  try {
    assignment = await (prisma as any).voiceAssignment.findUnique({ where: { id } });
  } catch (e) {}

  if (!assignment) {
    assignment = getLocalAssignments().find(a => a.id === id);
  }

  if (!assignment) {
    return res.status(404).json({ error: 'Assignment not found for grading' });
  }

  let finalScore = 0;
  let totalMarks = 0;
  const studentAnswers: any[] = [];

  assignment.questions.forEach((q: any) => {
    const selectedAnswer = answers ? (answers[q.id] || 'No Answer') : 'No Answer';
    // Case-insensitive / trimmed string check
    const isCorrect = (selectedAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase());
    const marksObtained = isCorrect ? q.marks : 0;

    finalScore += marksObtained;
    totalMarks += q.marks;

    studentAnswers.push({
      questionId: q.id,
      questionText: q.text,
      selectedAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect,
      marksObtained,
      totalMarks: q.marks
    });
  });

  const percentage = totalMarks > 0 ? Number(((finalScore / totalMarks) * 100).toFixed(2)) : 0;

  const submissionRecord = {
    id: `sub-${Date.now()}`,
    assignmentId: assignment.id,
    assignmentTitle: assignment.title,
    studentId: studentId || 'student-1',
    studentName: studentName || 'Manoj',
    tutorId: assignment.tutorId || 'tutor-1',
    studentAnswers,
    finalScore,
    totalMarks,
    percentage,
    submittedAt: new Date().toISOString(),
    status: 'Completed'
  };

  try {
    const dbPayload = {
      ...submissionRecord,
      submittedAt: new Date()
    };
    const created = await (prisma as any).voiceAssignmentSubmission.create({
      data: dbPayload
    });
    const local = getLocalSubmissions();
    saveLocalSubmissions([created, ...local]);
    return res.status(201).json(created);
  } catch (error: any) {
    console.warn('[DB Fallback] Failed to save submission in DB, saving locally:', error.message);
    const local = getLocalSubmissions();
    saveLocalSubmissions([submissionRecord, ...local]);
    return res.status(201).json(submissionRecord);
  }
});

export default router;
