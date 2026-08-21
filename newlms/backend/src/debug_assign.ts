import prisma from './db';

async function main() {
  console.log('=== DB DIAGNOSTIC ===');
  
  // 1. Fetch Users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });
  console.log('\n--- USERS ---');
  users.forEach(u => {
    console.log(`ID: ${u.id} | Name: ${u.name} | Email: ${u.email} | Role: ${u.role}`);
  });

  // 2. Fetch Tests
  const tests = await prisma.test.findMany({
    include: {
      assignments: true
    }
  });
  console.log('\n--- TESTS ---');
  tests.forEach(t => {
    console.log(`ID: ${t.id} | Title: ${t.title} | Duration: ${t.duration} mins`);
    console.log(`  Assignments count: ${t.assignments.length}`);
    t.assignments.forEach(a => {
      console.log(`    Assignment ID: ${a.id} | CandidateID: ${a.candidateId}`);
    });
  });

  // 3. Fetch Test Assignments directly
  const allAssignments = await prisma.testAssignment.findMany();
  console.log('\n--- ALL TEST ASSIGNMENTS ---');
  allAssignments.forEach(a => {
    console.log(`ID: ${a.id} | TestID: ${a.testId} | CandidateID: ${a.candidateId}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
