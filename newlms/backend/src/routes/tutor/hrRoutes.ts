import { Router } from 'express';
import prisma from '../../db';
import { authenticateToken, AuthenticatedRequest, roleGuard } from '../../auth_middleware';

const router = Router();

function parseQuestionJson(q: any) {
  if (!q) return q;
  try {
    return {
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      testCases: typeof q.testCases === 'string' ? JSON.parse(q.testCases) : q.testCases,
    };
  } catch (e) {
    return q;
  }
}

router.use(authenticateToken);
router.use(roleGuard('HR'));

// Create question
router.post('/questions', async (req: AuthenticatedRequest, res) => {
  const { text, type, options, correctOptionIndex, marks, language, starterCode, testCases } = req.body;
  const hrId = req.user?.id;

  if (!hrId) {
    return res.status(401).json({ message: 'User context not found.' });
  }

  if (!text || !type || marks === undefined) {
    return res.status(400).json({ message: 'Fields text, type, marks are required.' });
  }

  if (type === 'MCQ') {
    if (!options || correctOptionIndex === undefined) {
      return res.status(400).json({ message: 'options, correctOptionIndex required for MCQ' });
    }
  } else if (type === 'CODING') {
    if (!language) {
      return res.status(400).json({ message: 'language required for CODING' });
    }
  }

  try {
    const question = await prisma.question.create({
      data: {
        text,
        type,
        options: type === 'MCQ' ? JSON.stringify(options) : null,
        correctOptionIndex: type === 'MCQ' ? Number(correctOptionIndex) : null,
        language: type === 'CODING' ? language : null,
        starterCode: type === 'CODING' ? starterCode : null,
        testCases: type === 'CODING' ? JSON.stringify(testCases) : null,
        marks: Number(marks),
        createdByHrId: hrId,
      },
    });
    return res.status(201).json(parseQuestionJson(question));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create question.' });
  }
});

// List questions
router.get('/questions', async (_req: AuthenticatedRequest, res) => {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(questions.map(parseQuestionJson));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to retrieve questions.' });
  }
});

// Delete question
router.delete('/questions/:id', async (req: AuthenticatedRequest, res) => {
  const id = req.params.id as string;
  const hrId = req.user?.id;

  try {
    const question = await prisma.question.findUnique({ where: { id } });
    if (!question) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    if (question.createdByHrId !== hrId) {
      return res.status(403).json({ message: 'You can only delete questions you created.' });
    }

    await prisma.question.delete({ where: { id } });
    return res.status(200).json({ message: 'Question deleted successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete question.' });
  }
});

router.post('/tests', async (req: AuthenticatedRequest, res) => {
  const hrId = req.user?.id;
  const { title, description, questionIds, duration, passingMark } = req.body;
  if (!hrId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    // Validate that all question IDs exist in the database to prevent foreign key errors
    if (questionIds && questionIds.length > 0) {
      const dbQuestionsCount = await prisma.question.count({
        where: { id: { in: questionIds } }
      });
      if (dbQuestionsCount !== questionIds.length) {
        return res.status(400).json({ message: 'One or more selected questions do not exist. Please refresh the page.' });
      }
    }

    const test = await prisma.test.create({
      data: {
        title,
        description,
        duration: duration ? Number(duration) : 60,
        passingMark: passingMark ? Number(passingMark) : 50,
        createdByHrId: hrId,
        questions: {
          create: (questionIds || []).map((id: string) => ({ questionId: id }))
        }
      }
    });
    return res.status(201).json(test);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create test' });
  }
});

router.get('/tests', async (_req: AuthenticatedRequest, res) => {
  try {
    const tests = await prisma.test.findMany({
      include: {
        questions: { include: { question: true } },
        assignments: true
      },
      orderBy: { createdAt: 'desc' }
    });
    const parsedTests = tests.map((t: any) => ({
      ...t,
      questions: t.questions.map((q: any) => ({
        ...q,
        question: parseQuestionJson(q.question)
      }))
    }));
    return res.status(200).json(parsedTests);
  } catch(err) {
    return res.status(500).json({ message: 'Failed to fetch tests' });
  }
});

router.post('/tests/:id/assign', async (req: AuthenticatedRequest, res) => {
  const testId = req.params.id as string;
  const { candidateIds } = req.body as { candidateIds: string[] };

  try {
    const assignments = await Promise.all(candidateIds.map((cId: string) => 
      prisma.testAssignment.upsert({
        where: { testId_candidateId: { testId, candidateId: cId } },
        create: { testId, candidateId: cId },
        update: {}
      })
    ));
    return res.status(200).json(assignments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to assign tests' });
  }
});

// Candidates
router.get('/candidates', async (_req: AuthenticatedRequest, res) => {
  try {
    const candidates = await prisma.user.findMany({
      where: { role: 'CANDIDATE' },
      select: { id: true, name: true, email: true }
    });
    return res.status(200).json(candidates);
  } catch(err) {
    return res.status(500).json({ message: 'Failed to fetch candidates' });
  }
});


// List all candidate results
router.get('/results', async (_req: AuthenticatedRequest, res) => {
  try {
    const results = await prisma.examResult.findMany({
      include: {
        candidate: {
          select: {
            name: true,
            email: true,
          },
        },
        attempt: {
          select: {
            submittedAt: true,
            autoSubmitted: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return res.status(200).json(
      results.map((r: any) => ({
        id: r.id,
        attemptId: r.attemptId,
        candidateName: r.candidate.name,
        candidateEmail: r.candidate.email,
        scoredMarks: r.scoredMarks,
        totalMarks: r.totalMarks,
        percentage: r.percentage,
        passFail: r.passFail,
        submittedAt: r.attempt?.submittedAt || r.submittedAt,
        autoSubmitted: r.attempt?.autoSubmitted,
      }))
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to retrieve results.' });
  }
});

// Detailed breakdown for one attempt
router.get('/results/:attemptId', async (req: AuthenticatedRequest, res) => {
  const attemptId = req.params.attemptId as string;

  try {
    const attempt: any = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        candidate: {
          select: {
            name: true,
            email: true,
          },
        },
        result: true,
        violations: true,
        test: true,
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!attempt) {
      return res.status(404).json({ message: 'Exam attempt not found.' });
    }

    if (!attempt.result) {
      return res.status(400).json({ message: 'This attempt has not been submitted or evaluated yet.' });
    }

    const breakdown = attempt.answers.map((ans: any) => ({
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
      candidateName: attempt.candidate.name,
      candidateEmail: attempt.candidate.email,
      scoredMarks: attempt.result.scoredMarks,
      totalMarks: attempt.result.totalMarks,
      percentage: attempt.result.percentage,
      passFail: attempt.result.passFail,
      submittedAt: attempt.submittedAt || attempt.result.submittedAt,
      autoSubmitted: attempt.autoSubmitted,
      autoSubmitReason: attempt.autoSubmitReason,
      violations: attempt.violations,
      breakdown,
      testTitle: attempt.test?.title || 'Assessment',
      testDuration: attempt.test?.duration || 60,
      testPassingMark: attempt.test?.passingMark || 50,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to retrieve detailed results.' });
  }
});

export default router;
