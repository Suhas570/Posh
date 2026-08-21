import prisma from './db';
import bcrypt from 'bcryptjs';

const Role = {
  HR: 'HR',
  CANDIDATE: 'CANDIDATE',
  ADMIN: 'ADMIN'
};

export async function seedAssessmentDatabase() {
  console.log('[Seed] Seeding assessment database...');

  try {
    // 1. Clean existing records (just to be safe)
    await prisma.proctoringViolation.deleteMany({});
    await prisma.answer.deleteMany({});
    await prisma.examResult.deleteMany({});
    await prisma.examAttempt.deleteMany({});
    await prisma.testAssignment.deleteMany({});
    await prisma.testQuestion.deleteMany({});
    await prisma.question.deleteMany({});
    await prisma.test.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['hr@test.com', 'candidate@test.com', 'hr@example.com', 'candidate@example.com', 'admin@test.com']
        }
      }
    });

    console.log('[Seed] Cleared existing assessment tables safely.');

    // 2. Create Users
    const defaultPasswordHash = await bcrypt.hash('password', 10);

    // Platform administrator - lands on the Admin dashboard app after login
    // via the common home page.
    await prisma.user.create({
      data: {
        name: 'Platform Admin',
        email: 'admin@test.com',
        passwordHash: defaultPasswordHash,
        role: Role.ADMIN,
        isActive: true,
      },
    });

    const hrUser = await prisma.user.create({
      data: {
        name: 'Tutor Manoj (HR)',
        email: 'hr@test.com',
        passwordHash: defaultPasswordHash,
        role: Role.HR,
        isActive: true,
      },
    });

    const candidateUser = await prisma.user.create({
      data: {
        name: 'Manoj (Candidate)',
        email: 'candidate@test.com',
        passwordHash: defaultPasswordHash,
        role: Role.CANDIDATE,
        isActive: true,
      },
    });

    // Seed example credentials too
    const hrExamplePasswordHash = await bcrypt.hash('hrpassword123', 10);
    await prisma.user.create({
      data: {
        name: 'Assessment Coordinator',
        email: 'hr@example.com',
        passwordHash: hrExamplePasswordHash,
        role: Role.HR,
        isActive: true,
      },
    });

    const candidateExamplePasswordHash = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'candidate@example.com',
        passwordHash: candidateExamplePasswordHash,
        role: Role.CANDIDATE,
        isActive: true,
      },
    });

    console.log(`[Seed] Created default users.`);

    // 3. Create Questions
    const q1 = await prisma.question.create({
      data: {
        text: 'Which of the following array methods in JavaScript mutates the original array?',
        type: 'MCQ',
        options: JSON.stringify(['map()', 'filter()', 'push()', 'slice()']),
        correctOptionIndex: 2,
        marks: 5,
        createdByHrId: hrUser.id,
      },
    });

    const q2 = await prisma.question.create({
      data: {
        text: 'Which SQL keyword is used to sort the result-set?',
        type: 'MCQ',
        options: JSON.stringify(['SORT BY', 'ORDER BY', 'ALIGN BY', 'GROUP BY']),
        correctOptionIndex: 1,
        marks: 5,
        createdByHrId: hrUser.id,
      },
    });

    const q3 = await prisma.question.create({
      data: {
        text: 'Write a JavaScript function named `sum(a, b)` that returns the sum of two numbers `a` and `b`.',
        type: 'CODING',
        language: 'javascript',
        starterCode: `function sum(a, b) {\n  // Write your code here\n  \n}`,
        testCases: JSON.stringify([
          { input: 'sum(1, 2)', expectedOutput: '3', isHidden: false },
          { input: 'sum(-5, 10)', expectedOutput: '5', isHidden: false }
        ]),
        marks: 10,
        createdByHrId: hrUser.id,
      },
    });

    const q4 = await prisma.question.create({
      data: {
        text: 'Write a Python function named `is_palindrome(s)` that takes a string `s` and returns `True` if the string is a palindrome (reads the same forwards and backwards) and `False` otherwise.',
        type: 'CODING',
        language: 'python',
        starterCode: `def is_palindrome(s):\n    # Write your code here\n    pass`,
        testCases: JSON.stringify([
          { input: 'is_palindrome("racecar")', expectedOutput: 'True', isHidden: false },
          { input: 'is_palindrome("hello")', expectedOutput: 'False', isHidden: false }
        ]),
        marks: 10,
        createdByHrId: hrUser.id,
      },
    });

    console.log('[Seed] Created MCQ and Coding questions.');

    // 4. Create Test
    const test = await prisma.test.create({
      data: {
        title: 'Full Stack Developer Skill Assessment',
        description: 'Evaluate JavaScript array operations, basic SQL operations, and algorithmic programming in JS and Python. Ensure your webcam is working and do not switch browser tabs.',
        createdByHrId: hrUser.id,
      },
    });

    // Link questions to Test
    await prisma.testQuestion.create({
      data: { testId: test.id, questionId: q1.id }
    });
    await prisma.testQuestion.create({
      data: { testId: test.id, questionId: q2.id }
    });
    await prisma.testQuestion.create({
      data: { testId: test.id, questionId: q3.id }
    });
    await prisma.testQuestion.create({
      data: { testId: test.id, questionId: q4.id }
    });

    console.log(`[Seed] Created Test "${test.title}" and linked 4 questions.`);

    // 5. Assign Test to Candidate
    await prisma.testAssignment.create({
      data: {
        testId: test.id,
        candidateId: candidateUser.id,
      },
    });

    console.log(`[Seed] Assigned Test "${test.title}" to Candidate "${candidateUser.name}".`);
    console.log('[Seed] Database seeding complete!');
  } catch (err: any) {
    console.error('[Seed] Error seeding assessment database:', err.message);
  }
}
