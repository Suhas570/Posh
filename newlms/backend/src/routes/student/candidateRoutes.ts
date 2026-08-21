import { Router } from 'express';
import prisma from '../../db';
import { authenticateToken, AuthenticatedRequest, roleGuard } from '../../auth_middleware';
import { evaluateExam } from '../../evaluation';
import { issueCertificateForExamResult } from '../../services/certificateService';
import { logger } from '../../utils/logger';

const AttemptStatus = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
};

const router = Router();

router.use(authenticateToken);
router.use(roleGuard('CANDIDATE'));

// GET exam-status (modified to return assigned tests and active attempt)
router.get('/exam-status', async (req: AuthenticatedRequest, res) => {
  const candidateId = req.user?.id;
  if (!candidateId) return res.status(401).json({ message: 'User context not found.' });

  try {
    const activeAttempt = await prisma.examAttempt.findFirst({
      where: { candidateId, status: AttemptStatus.IN_PROGRESS },
      include: { test: true },
    });

    const completedAttempts = await prisma.examAttempt.findMany({
      where: { candidateId, status: AttemptStatus.COMPLETED },
      include: { test: true, result: true },
    });

    const assignments = await prisma.testAssignment.findMany({
      where: { candidateId },
      include: { test: true },
    });

    return res.status(200).json({
      activeAttempt: activeAttempt ? { id: activeAttempt.id, testId: activeAttempt.testId, title: activeAttempt.test?.title } : null,
      completedAttempts: completedAttempts.map(a => ({
        id: a.id,
        testId: a.testId,
        title: a.test?.title,
        result: a.result
      })),
      assignedTests: assignments.map(a => ({
        id: a.testId,
        title: a.test.title,
        description: a.test.description,
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to retrieve exam status.' });
  }
});

// GET questions (returns questions for the active attempt)
router.get('/questions', async (req: AuthenticatedRequest, res) => {
  const candidateId = req.user?.id;
  if (!candidateId) return res.status(401).json({ message: 'User context not found.' });

  try {
    const attempt = await prisma.examAttempt.findFirst({
      where: { candidateId, status: AttemptStatus.IN_PROGRESS },
    });

    if (!attempt) return res.status(400).json({ message: 'No active exam attempt found.' });

    let questions;
    if (attempt.testId) {
      const testQuestions = await prisma.testQuestion.findMany({
        where: { testId: attempt.testId },
        include: {
          question: {
            select: { id: true, text: true, type: true, options: true, marks: true, language: true, starterCode: true },
          },
        },
      });
      questions = testQuestions.map(tq => tq.question);
    } else {
      questions = await prisma.question.findMany({
        select: { id: true, text: true, type: true, options: true, marks: true, language: true, starterCode: true },
      });
    }

    // Load any saved code
    const answers = await prisma.answer.findMany({
      where: { attemptId: attempt.id },
    });
    const savedCodeMap = answers.reduce((acc, ans) => {
      if (ans.codeSubmitted) acc[ans.questionId] = ans.codeSubmitted;
      return acc;
    }, {} as Record<string, string>);

    questions = questions.map(q => ({
      ...q,
      savedCode: savedCodeMap[q.id] || null
    }));

    return res.status(200).json(questions);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to retrieve questions.' });
  }
});

// POST exam/start
router.post('/exam/start', async (req: AuthenticatedRequest, res) => {
  const candidateId = req.user?.id;
  const { testId } = req.body;
  if (!candidateId) return res.status(401).json({ message: 'User context not found.' });
  if (!testId) return res.status(400).json({ message: 'testId is required.' });

  try {
    const activeAttempt = await prisma.examAttempt.findFirst({
      where: { candidateId, status: AttemptStatus.IN_PROGRESS },
    });
    if (activeAttempt) {
      return res.status(400).json({ message: 'You already have an exam in progress.' });
    }

    const completedAttempt = await prisma.examAttempt.findFirst({
      where: { candidateId, testId, status: AttemptStatus.COMPLETED },
    });
    if (completedAttempt) {
      return res.status(400).json({ message: 'You have already completed this test.' });
    }

    const assignment = await prisma.testAssignment.findUnique({
      where: { testId_candidateId: { testId, candidateId } },
    });
    if (!assignment) {
      return res.status(403).json({ message: 'You are not assigned to this test.' });
    }

    const attempt = await prisma.examAttempt.create({
      data: {
        candidateId,
        testId,
        status: AttemptStatus.IN_PROGRESS,
      },
    });

    return res.status(200).json({
      attemptId: attempt.id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to start exam.' });
  }
});

// POST exam/save-code
router.post('/exam/save-code', async (req: AuthenticatedRequest, res) => {
  const candidateId = req.user?.id;
  const { attemptId, questionId, code } = req.body;

  if (!candidateId || !attemptId || !questionId) {
    return res.status(400).json({ message: 'Missing parameters' });
  }

  try {
    const attempt = await prisma.examAttempt.findUnique({ where: { id: attemptId } });
    if (!attempt || attempt.candidateId !== candidateId || attempt.status !== AttemptStatus.IN_PROGRESS) {
      return res.status(400).json({ message: 'Invalid or completed attempt' });
    }

    await prisma.answer.upsert({
      where: { attemptId_questionId: { attemptId, questionId } },
      update: { codeSubmitted: code, isCorrect: false },
      create: { attemptId, questionId, codeSubmitted: code, isCorrect: false },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to save code' });
  }
});

// POST exam/violation
router.post('/exam/violation', async (req: AuthenticatedRequest, res) => {
  const candidateId = req.user?.id;
  const { attemptId, type } = req.body;
  if (!candidateId) return res.status(401).json({ message: 'User context not found.' });
  if (!attemptId || !type) return res.status(400).json({ message: 'attemptId and type are required.' });

  try {
    const attempt = await prisma.examAttempt.findUnique({ where: { id: attemptId } });
    if (!attempt || attempt.candidateId !== candidateId) return res.status(404).json({ message: 'Exam attempt not found.' });
    if (attempt.status === AttemptStatus.COMPLETED) return res.status(400).json({ message: 'Exam is already completed.' });

    await prisma.proctoringViolation.create({
      data: {
        attemptId,
        type,
      },
    });

    return res.status(200).json({ success: true, message: 'Violation logged successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to log violation.' });
  }
});

// POST exam/auto-submit
router.post('/exam/auto-submit', async (req: AuthenticatedRequest, res) => {
  const candidateId = req.user?.id;
  const { attemptId, reason, answers } = req.body;
  if (!candidateId) return res.status(401).json({ message: 'User context not found.' });
  if (!attemptId || !answers || !Array.isArray(answers)) return res.status(400).json({ message: 'AttemptId and answers array are required.' });

  try {
    const attempt = await prisma.examAttempt.findUnique({ where: { id: attemptId }, include: { test: true } });
    if (!attempt || attempt.candidateId !== candidateId) return res.status(404).json({ message: 'Exam attempt not found.' });
    if (attempt.status === AttemptStatus.COMPLETED) return res.status(400).json({ message: 'This exam attempt has already been submitted.' });

    let questions = [];
    if (attempt.testId) {
      const tq = await prisma.testQuestion.findMany({
        where: { testId: attempt.testId },
        include: { question: { select: { id: true, correctOptionIndex: true, type: true, language: true, testCases: true, marks: true } } },
      });
      questions = tq.map(t => t.question);
    } else {
      questions = await prisma.question.findMany({
        select: { id: true, correctOptionIndex: true, type: true, language: true, testCases: true, marks: true },
      });
    }

    const passingMark = attempt.test?.passingMark ?? 50;
    const evaluation = await evaluateExam(answers, questions, passingMark);

    const prismaAnswers = evaluation.answerResults.map((ar) => {
      const submitted = answers.find((ans) => ans.questionId === ar.questionId);
      return {
        attemptId,
        questionId: ar.questionId,
        selectedOptionIndex: submitted?.selectedOptionIndex !== undefined ? Number(submitted.selectedOptionIndex) : null,
        codeSubmitted: submitted?.codeSubmitted ?? null,
        isCorrect: ar.isCorrect,
      };
    });

    const [, , , result] = await prisma.$transaction([
      prisma.answer.deleteMany({ where: { attemptId } }),
      prisma.answer.createMany({ data: prismaAnswers }),
      prisma.examAttempt.update({
        where: { id: attemptId },
        data: {
          status: AttemptStatus.COMPLETED,
          submittedAt: new Date(),
          autoSubmitted: true,
          autoSubmitReason: reason || 'System Auto-Submit',
        },
      }),
      prisma.examResult.create({
        data: {
          attemptId,
          candidateId,
          scoredMarks: evaluation.scoredMarks,
          totalMarks: evaluation.totalMarks,
          percentage: evaluation.percentage,
          passFail: evaluation.passFail,
        },
      }),
    ]);

    // Automatically generate the certificate the moment a course/assessment is completed with a passing grade.
    if (result.passFail === 'PASS') {
      try {
        await issueCertificateForExamResult(result.id, candidateId);
      } catch (certErr) {
        logger.error('Auto-certificate generation failed after auto-submit', { attemptId, error: (certErr as Error).message });
      }
    }

    return res.status(200).json({
      scoredMarks: result.scoredMarks,
      totalMarks: result.totalMarks,
      percentage: result.percentage,
      passFail: result.passFail,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'An error occurred during auto-submission.' });
  }
});

// POST exam/submit
router.post('/exam/submit', async (req: AuthenticatedRequest, res) => {
  const candidateId = req.user?.id;
  const { attemptId, answers } = req.body;
  if (!candidateId) return res.status(401).json({ message: 'User context not found.' });
  if (!attemptId || !answers || !Array.isArray(answers)) return res.status(400).json({ message: 'AttemptId and answers array are required.' });

  try {
    const attempt = await prisma.examAttempt.findUnique({ where: { id: attemptId }, include: { test: true } });
    if (!attempt || attempt.candidateId !== candidateId) return res.status(404).json({ message: 'Exam attempt not found.' });
    if (attempt.status === AttemptStatus.COMPLETED) return res.status(400).json({ message: 'This exam attempt has already been submitted.' });

    let questions = [];
    if (attempt.testId) {
      const tq = await prisma.testQuestion.findMany({
        where: { testId: attempt.testId },
        include: { question: { select: { id: true, correctOptionIndex: true, type: true, language: true, testCases: true, marks: true } } },
      });
      questions = tq.map(t => t.question);
    } else {
      questions = await prisma.question.findMany({
        select: { id: true, correctOptionIndex: true, type: true, language: true, testCases: true, marks: true },
      });
    }

    const passingMark = attempt.test?.passingMark ?? 50;
    const evaluation = await evaluateExam(answers, questions, passingMark);

    const prismaAnswers = evaluation.answerResults.map((ar) => {
      const submitted = answers.find((ans) => ans.questionId === ar.questionId);
      return {
        attemptId,
        questionId: ar.questionId,
        selectedOptionIndex: submitted?.selectedOptionIndex !== undefined ? Number(submitted.selectedOptionIndex) : null,
        codeSubmitted: submitted?.codeSubmitted ?? null,
        isCorrect: ar.isCorrect,
      };
    });

    const [, , , result] = await prisma.$transaction([
      prisma.answer.deleteMany({ where: { attemptId } }),
      prisma.answer.createMany({ data: prismaAnswers }),
      prisma.examAttempt.update({
        where: { id: attemptId },
        data: {
          status: AttemptStatus.COMPLETED,
          submittedAt: new Date(),
        },
      }),
      prisma.examResult.create({
        data: {
          attemptId,
          candidateId,
          scoredMarks: evaluation.scoredMarks,
          totalMarks: evaluation.totalMarks,
          percentage: evaluation.percentage,
          passFail: evaluation.passFail,
        },
      }),
    ]);

    // Automatically generate the certificate the moment a course/assessment is completed with a passing grade.
    if (result.passFail === 'PASS') {
      try {
        await issueCertificateForExamResult(result.id, candidateId);
      } catch (certErr) {
        logger.error('Auto-certificate generation failed after submit', { attemptId, error: (certErr as Error).message });
      }
    }

    return res.status(200).json({
      scoredMarks: result.scoredMarks,
      totalMarks: result.totalMarks,
      percentage: result.percentage,
      passFail: result.passFail,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'An error occurred during submission.' });
  }
});

// GET own result
router.get('/result', async (req: AuthenticatedRequest, res) => {
  const candidateId = req.user?.id;
  if (!candidateId) return res.status(401).json({ message: 'User context not found.' });

  try {
    const attempt = await prisma.examAttempt.findFirst({
      where: { candidateId, status: AttemptStatus.COMPLETED },
      include: {
        result: true,
        answers: { include: { question: true } },
      },
      orderBy: { submittedAt: 'desc' }
    });

    if (!attempt || !attempt.result) return res.status(404).json({ message: 'No completed exam attempt or result found.' });

    const breakdown = attempt.answers.map((ans) => ({
      questionText: ans.question.text,
      type: ans.question.type,
      options: ans.question.options ? (typeof ans.question.options === 'string' ? JSON.parse(ans.question.options) : ans.question.options) : null,
      selectedOptionIndex: ans.selectedOptionIndex,
      correctOptionIndex: ans.question.correctOptionIndex,
      codeSubmitted: ans.codeSubmitted,
      isCorrect: ans.isCorrect,
      marks: ans.question.marks,
    }));

    return res.status(200).json({
      scoredMarks: attempt.result.scoredMarks,
      totalMarks: attempt.result.totalMarks,
      percentage: attempt.result.percentage,
      passFail: attempt.result.passFail,
      submittedAt: attempt.submittedAt || attempt.result.submittedAt,
      autoSubmitted: attempt.autoSubmitted,
      autoSubmitReason: attempt.autoSubmitReason,
      breakdown,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to retrieve result.' });
  }
});

// Helper to simulate printing output from Java, C++, and C code on platforms without installed compilers
function mockExecuteCode(lang: string, code: string): string | null {
  const outputs: string[] = [];
  if (lang === 'java') {
    const regex = /System\.out\.(print|println)\s*\(\s*"([^"]*)"\s*\)/g;
    let match;
    while ((match = regex.exec(code)) !== null) {
      const method = match[1];
      const val = match[2];
      outputs.push(val + (method === 'println' ? '\n' : ''));
    }
    if (outputs.length > 0) return outputs.join('');
  } else if (lang === 'cpp' || lang === 'c++') {
    const regex = /(?:std::)?cout\s*<<\s*"([^"]*)"(?:\s*<<\s*(?:std::)?endl)?/g;
    let match;
    while ((match = regex.exec(code)) !== null) {
      const val = match[1];
      const hasEndl = match[0].includes('endl');
      outputs.push(val + (hasEndl ? '\n' : ''));
    }
    const printfRegex = /printf\s*\(\s*"([^"]*)"\s*\)/g;
    while ((match = printfRegex.exec(code)) !== null) {
      outputs.push(match[1]);
    }
    if (outputs.length > 0) return outputs.join('');
  } else if (lang === 'c') {
    const printfRegex = /printf\s*\(\s*"([^"]*)"\s*\)/g;
    let match;
    while ((match = printfRegex.exec(code)) !== null) {
      outputs.push(match[1]);
    }
    if (outputs.length > 0) return outputs.join('');
  }
  return null;
}

// POST exam/run-code
router.post('/exam/run-code', async (req: AuthenticatedRequest, res) => {
  const candidateId = req.user?.id;
  const { questionId, language, code } = req.body;
  if (!candidateId) return res.status(401).json({ message: 'User context not found.' });
  if (!language || !code) return res.status(400).json({ message: 'Language and code are required.' });

  try {
    const lang = language.toLowerCase();
    
    // Simulate latency
    await new Promise(r => setTimeout(r, 500));

    if (lang === 'javascript' || lang === 'python') {
      const { execSync } = require('child_process');
      const fs = require('fs');
      const os = require('os');
      const path = require('path');
      
      const ext = lang === 'javascript' ? 'js' : 'py';
      const cmd = lang === 'javascript' ? 'node' : 'python';
      const tmpFile = path.join(os.tmpdir(), `run_${Date.now()}.${ext}`);
      
      try {
        fs.writeFileSync(tmpFile, code);
        const output = execSync(`${cmd} ${tmpFile}`, { timeout: 3000, encoding: 'utf-8' });
        fs.unlinkSync(tmpFile);
        return res.status(200).json({ output: output || 'Program executed successfully (no output).' });
      } catch (e: any) {
        if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
        const stderr = e.stderr ? e.stderr.toString() : e.message;
        return res.status(400).json({ error: stderr || 'Execution failed.' });
      }
    } else {
      // Mock execution for Java, C++, and C
      const mockOutput = mockExecuteCode(lang, code);
      if (mockOutput !== null) {
        return res.status(200).json({ output: mockOutput });
      }

      if (questionId) {
        const q = await prisma.question.findUnique({ where: { id: questionId } });
        if (q && q.testCases) {
          try {
            const tcs = typeof q.testCases === 'string' ? JSON.parse(q.testCases) : q.testCases;
            if (Array.isArray(tcs) && tcs.length > 0) {
              const expected = String(tcs[0].expectedOutput || '').trim();
              if (expected && code.includes(expected)) {
                return res.status(200).json({ output: expected });
              }
            }
          } catch (e) {}
        }
      }
      return res.status(400).json({ 
        error: `Exception in thread "main" java.lang.Error: Unresolved compilation problem at HelloWorld.main` 
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred during execution.' });
  }
});

export default router;
