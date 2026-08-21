import prisma from './db';

async function main() {
  console.log('=== SIMULATING CANDIDATE EXAM STATUS QUERY ===');
  
  // 1. Get the candidate user first
  const user = await prisma.user.findUnique({
    where: { email: 'candidate@test.com' }
  });
  
  if (!user) {
    console.log('Candidate user not found!');
    return;
  }
  
  console.log(`Found candidate Manoj: ID = "${user.id}" (type: ${typeof user.id})`);
  
  // 2. Query TestAssignment directly using user.id
  const assignments = await prisma.testAssignment.findMany({
    where: { candidateId: user.id },
    include: { test: true }
  });
  
  console.log(`Querying TestAssignment for candidateId = "${user.id}":`);
  console.log(`Assignments count found: ${assignments.length}`);
  assignments.forEach((a, i) => {
    console.log(`  [${i}] Assignment ID: ${a.id} | Test Title: ${a.test.title}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
