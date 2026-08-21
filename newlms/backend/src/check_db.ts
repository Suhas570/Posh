import prisma from './db';

async function main() {
  const courses = await prisma.course.findMany();
  console.log('--- DATABASE COURSES ---');
  courses.forEach(c => {
    console.log(`ID: ${c.id}`);
    console.log(`Title: ${c.title}`);
    console.log(`Status: ${c.status}`);
    console.log(`Curriculum Module Count: ${c.curriculum ? c.curriculum.length : 'undefined'}`);
    if (c.curriculum) {
      c.curriculum.forEach(m => {
        console.log(`  Module Title: ${m.title}`);
        console.log(`  Lessons Count: ${m.lessons ? m.lessons.length : 'undefined'}`);
        if (m.lessons) {
          m.lessons.forEach(l => {
            console.log(`    Lesson Title: ${l.title}`);
          });
        }
      });
    }
    console.log('------------------------');
  });
}

main().catch(console.error);
