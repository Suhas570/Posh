const BASE_URL = 'http://localhost:5001';

async function runTestFlow() {
  console.log('=== STARTING INTEGRATION FLOW TEST ===');

  try {
    // 1. Authenticate as HR (Tutor)
    console.log('\n[Step 1] Logging in as Tutor...');
    const hrAuthRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'hr@test.com',
        password: 'password',
      })
    });
    if (!hrAuthRes.ok) throw new Error(`HR login failed with status ${hrAuthRes.status}`);
    const hrAuthData: any = await hrAuthRes.json();
    const hrToken = hrAuthData.token;
    console.log(`Successfully logged in. HR Name: ${hrAuthData.user.name}`);

    const hrHeaders = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${hrToken}`
    };

    // 2. Create a MCQ Question
    console.log('\n[Step 2] Tutor creating a MCQ question...');
    const q1Res = await fetch(`${BASE_URL}/api/hr/questions`, {
      method: 'POST',
      headers: hrHeaders,
      body: JSON.stringify({
        text: 'What is the runtime of binary search on a sorted array?',
        type: 'MCQ',
        options: ['O(N)', 'O(log N)', 'O(N log N)', 'O(1)'],
        correctOptionIndex: 1,
        marks: 10,
      })
    });
    if (!q1Res.ok) throw new Error(`Question creation failed: ${q1Res.status}`);
    const q1Data: any = await q1Res.json();
    const q1Id = q1Data.id;
    console.log(`Question created successfully with ID: ${q1Id}`);

    // 3. Create a Coding Question
    console.log('\n[Step 3] Tutor creating a Coding question...');
    const q2Res = await fetch(`${BASE_URL}/api/hr/questions`, {
      method: 'POST',
      headers: hrHeaders,
      body: JSON.stringify({
        text: 'Write a JavaScript function named `multiply(a, b)` that returns the product of two numbers.',
        type: 'CODING',
        language: 'javascript',
        starterCode: 'function multiply(a, b) {\n  return a * b;\n}',
        testCases: [
          { input: 'multiply(2, 3)', expectedOutput: '6', isHidden: false },
          { input: 'multiply(-2, 4)', expectedOutput: '-8', isHidden: false },
        ],
        marks: 20,
      })
    });
    if (!q2Res.ok) throw new Error(`Coding question creation failed: ${q2Res.status}`);
    const q2Data: any = await q2Res.json();
    const q2Id = q2Data.id;
    console.log(`Question created successfully with ID: ${q2Id}`);

    // 4. Create a Test with the two questions
    console.log('\n[Step 4] Tutor creating a new Test...');
    const testRes = await fetch(`${BASE_URL}/api/hr/tests`, {
      method: 'POST',
      headers: hrHeaders,
      body: JSON.stringify({
        title: 'Algorithm & JS Syntax Assessment',
        description: 'Test binary search concepts and coding product logic in JavaScript.',
        duration: 30,
        passingMark: 50,
        questionIds: [q1Id, q2Id],
      })
    });
    if (!testRes.ok) throw new Error(`Test creation failed: ${testRes.status}`);
    const testData: any = await testRes.json();
    const testId = testData.id;
    console.log(`Test created successfully with ID: ${testId}`);

    // 5. Fetch Candidate List & Assign Test to Student
    console.log('\n[Step 5] Tutor assigning Test to Student...');
    const candidatesRes = await fetch(`${BASE_URL}/api/hr/candidates`, { headers: hrHeaders });
    if (!candidatesRes.ok) throw new Error('Failed to fetch candidates');
    const candidates: any = await candidatesRes.json();
    const student = candidates.find((c: any) => c.email === 'candidate@test.com');
    if (!student) {
      throw new Error('Candidate candidate@test.com not found in seeded database.');
    }
    console.log(`Found candidate: ${student.name} (${student.id})`);

    const assignRes = await fetch(`${BASE_URL}/api/hr/tests/${testId}/assign`, {
      method: 'POST',
      headers: hrHeaders,
      body: JSON.stringify({
        candidateIds: [student.id],
      })
    });
    if (!assignRes.ok) throw new Error('Assigning test failed');
    console.log(`Test assigned successfully to Student ID: ${student.id}`);

    // 6. Authenticate as Candidate (Student)
    console.log('\n[Step 6] Logging in as Student...');
    const studentAuthRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'candidate@test.com',
        password: 'password',
      })
    });
    if (!studentAuthRes.ok) throw new Error('Student login failed');
    const studentAuthData: any = await studentAuthRes.json();
    const studentToken = studentAuthData.token;
    console.log(`Successfully logged in. Student Name: ${studentAuthData.user.name}`);

    const studentHeaders = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    };

    // 7. Check Assigned Tests for the Student
    console.log('\n[Step 7] Checking student assigned tests...');
    const examStatusRes = await fetch(`${BASE_URL}/api/candidate/exam-status`, { headers: studentHeaders });
    if (!examStatusRes.ok) throw new Error('Failed to fetch student exam status');
    const examStatusData: any = await examStatusRes.json();
    const assignedTest = examStatusData.assignedTests.find((t: any) => t.id === testId);
    if (!assignedTest) {
      throw new Error('Created test not listed in Student assigned tests.');
    }
    console.log(`Verified! Test "${assignedTest.title}" is assigned to the student.`);

    // 8. Start the Exam
    console.log('\n[Step 8] Student starting the exam...');
    const startRes = await fetch(`${BASE_URL}/api/candidate/exam/start`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({
        testId: testId,
      })
    });
    if (!startRes.ok) throw new Error(`Starting exam failed with status ${startRes.status}`);
    const startData: any = await startRes.json();
    const attemptId = startData.attemptId;
    console.log(`Exam started successfully. Attempt ID: ${attemptId}`);

    // 9. Fetch Exam Questions
    console.log('\n[Step 9] Fetching exam questions...');
    const questionsRes = await fetch(`${BASE_URL}/api/candidate/questions`, { headers: studentHeaders });
    if (!questionsRes.ok) throw new Error('Failed to fetch exam questions');
    const questionsData: any = await questionsRes.json();
    console.log(`Received ${questionsData.length} questions for the attempt.`);

    // 10. Run Coding Question Code check
    console.log('\n[Step 10] Student executing coding solution to test compiler run...');
    const runRes = await fetch(`${BASE_URL}/api/candidate/exam/run-code`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({
        questionId: q2Id,
        language: 'javascript',
        code: 'function multiply(a, b) {\n  return a * b;\n}\nconsole.log(multiply(2, 3));',
      })
    });
    if (!runRes.ok) throw new Error('Running code failed');
    const runData: any = await runRes.json();
    console.log(`Console output returned:\n${runData.output}`);

    // 11. Submit Exam Answers
    console.log('\n[Step 11] Student submitting the completed exam...');
    const answers = [
      { questionId: q1Id, selectedOptionIndex: 1 }, // Correct MCQ choice (O(log N))
      { questionId: q2Id, codeSubmitted: 'function multiply(a, b) {\n  return a * b;\n}' }, // Correct coding solution
    ];

    const submitRes = await fetch(`${BASE_URL}/api/candidate/exam/submit`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({
        attemptId,
        answers,
      })
    });
    if (!submitRes.ok) throw new Error('Exam submission failed');
    const submitData = await submitRes.json();
    console.log('Exam submitted successfully. Grading feedback:');
    console.log(JSON.stringify(submitData, null, 2));

    // 12. Tutor checking result list & breakdown
    console.log('\n[Step 12] Tutor retrieving exam results list...');
    const resultsRes = await fetch(`${BASE_URL}/api/hr/results`, { headers: hrHeaders });
    if (!resultsRes.ok) throw new Error('Failed to fetch HR results list');
    const resultsData: any = await resultsRes.json();
    const studentResult = resultsData.find((r: any) => r.attemptId === attemptId);
    if (!studentResult) {
      throw new Error('Submitted exam attempt result not found in HR results list.');
    }
    console.log(`Verified! Score recorded: ${studentResult.scoredMarks} / ${studentResult.totalMarks} (${studentResult.percentage}%) - Outcome: ${studentResult.passFail}`);

    console.log('\n=== ALL INTEGRATION STEPS PASSED SUCCESSFULLY ===');
  } catch (error: any) {
    console.error('\n❌ INTEGRATION FLOW TEST FAILED:');
    console.error(error.message);
  }
}

runTestFlow();
