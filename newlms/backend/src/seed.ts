import prisma from './db';

const SAMPLE_COURSES = [
  {
    title: 'React Development Masterclass',
    description: 'Learn modern React including Hooks, Context API, Redux Toolkit, and performance optimizations. Build real-world projects.',
    category: 'Development',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop',
    instructor: 'Manoj',
    duration: '24 Hours',
    level: 'Intermediate',
    language: 'English',
    status: 'Published',
    curriculum: [
      {
        id: 'mod-1',
        title: 'Module 1: Getting Started with React',
        lessons: [
          {
            id: 'les-1-1',
            title: 'Lesson 1.1: Introduction to JSX Markup',
            videoUrl: 'https://www.youtube.com/watch?v=Dp1VjR1wWkU',
            videoType: 'YouTube',
            videoDuration: '15 mins',
            description: 'Learn the fundamentals of JSX, compiling HTML syntax elements in JS code.',
            pdfFile: { name: 'jsx_syntax_handout.pdf', size: '1.2 MB', url: 'http://localhost:5000/uploads/pdf/jsx_syntax_handout.pdf' },
            pptFile: { name: 'jsx_basics_deck.pptx', size: '3.4 MB', url: 'http://localhost:5000/uploads/ppt/jsx_basics_deck.pptx' },
            resources: [
              { id: 'res-1-1-1', title: 'React JSX Official Guidelines', url: 'https://react.dev', type: 'Documentation', description: 'React documentation on writing markup' }
            ]
          },
          {
            id: 'les-1-2',
            title: 'Lesson 1.2: Component Lifecycle States',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            videoType: 'Animated Video',
            videoDuration: '25 mins',
            description: 'Animated guide visualizing components mounting and unmounting workflows.',
            pdfFile: null,
            pptFile: null,
            resources: []
          }
        ]
      },
      {
        id: 'mod-2',
        title: 'Module 2: Advanced State Management',
        lessons: [
          {
            id: 'les-2-1',
            title: 'Lesson 2.1: Context API Setup',
            videoUrl: 'https://www.w3schools.com/html/movie.mp4',
            videoType: 'Pre-recorded Video',
            videoDuration: '45 mins',
            description: 'Video session of Manoj coding context providers and consumer states.',
            pdfFile: { name: 'context_api_cheat_sheet.pdf', size: '840 KB', url: 'http://localhost:5000/uploads/pdf/context_api_cheat_sheet.pdf' },
            pptFile: null,
            resources: [
              { id: 'res-2-1-1', title: 'GitHub State Context Demo', url: 'https://github.com/facebook/react', type: 'GitHub', description: 'Source code setup' }
            ]
          }
        ]
      }
    ]
  },
  {
    title: 'Python Masterclass: Zero to Hero',
    description: 'Master Python programming from basics to decorators, generators, and FastAPI backend frameworks.',
    category: 'Development',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop',
    instructor: 'Manoj',
    duration: '18 Hours',
    level: 'Beginner',
    language: 'English',
    status: 'Published',
    curriculum: [
      {
        id: 'mod-2-1',
        title: 'Module 1: Variables and Basic Syntax',
        lessons: [
          {
            id: 'les-2-1-1',
            title: 'Lesson 1.1: Syntax Basics',
            videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
            videoType: 'YouTube',
            videoDuration: '30 mins',
            description: 'A quick overview of variables, arrays, lists, and dicts.',
            pdfFile: null,
            pptFile: null,
            resources: []
          }
        ]
      }
    ]
  },
  {
    title: 'AWS Cloud Basics for Beginners',
    description: 'An introduction to Amazon Web Services. Learn key services like EC2, S3, RDS, Lambda, and IAM.',
    category: 'Development',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    instructor: 'Manoj',
    duration: '16 Hours',
    level: 'Beginner',
    language: 'English',
    status: 'Draft',
    curriculum: []
  }
];

const MOCK_ACTIVITIES = [
  {
    type: 'video',
    text: 'You added lesson video "Introduction to JSX Markup" to "React Development Masterclass"',
    time: '2 hours ago',
    courseId: 'course-1'
  },
  {
    type: 'note',
    text: 'You uploaded a notes PDF file "context_api_cheat_sheet.pdf"',
    time: '5 hours ago',
    courseId: 'course-1'
  },
  {
    type: 'course',
    text: 'You updated course "Python Masterclass: Zero to Hero"',
    time: '1 day ago',
    courseId: 'course-2'
  }
];

const SAMPLE_REVIEWS = [
  {
    courseId: 'course-1',
    courseTitle: 'React Development Masterclass',
    studentName: 'Amit Patel',
    rating: 5,
    comment: 'The absolute best explanation of React Hooks I have ever watched. The context provider explanation is incredibly clear!',
    date: '2026-07-15',
    reply: 'Thank you Amit! Glad to hear the hooks explanations were useful for you.'
  },
  {
    courseId: 'course-1',
    courseTitle: 'React Development Masterclass',
    studentName: 'Sarah Jenkins',
    rating: 4,
    comment: 'Great pacing and detailed examples. I wish there were more practice exercises for custom hooks, but the PPT decks are excellent.',
    date: '2026-07-14',
    reply: ''
  },
  {
    courseId: 'course-2',
    courseTitle: 'Python Masterclass: Zero to Hero',
    studentName: 'Raj Kumar',
    rating: 5,
    comment: 'Excellent introduction for beginners. Manoj is a fantastic instructor, pacing is just right.',
    date: '2026-07-12',
    reply: ''
  }
];

const SAMPLE_MESSAGES = [
  {
    sender: 'Sonia Mehta',
    recipient: 'You',
    subject: 'Question on Custom React Hooks (Session 2)',
    preview: 'Hi Manoj, in Lesson 2.1 you created a custom window resize hook. I was wondering if we need to clean up...',
    date: '2 hours ago',
    unread: true,
    folder: 'Inbox',
    thread: [
      { sender: 'Sonia Mehta', text: 'Hi Manoj, in Lesson 2.1 you created a custom window resize hook. I was wondering if we need to clean up the event listener? Let me know. Thanks!', time: '11:20 AM' }
    ]
  },
  {
    sender: 'Dev B (Developer)',
    recipient: 'You',
    subject: 'Assignments API integration update',
    preview: 'Hi Manoj, I have finished writing the endpoints for assignments submission grading. Please review...',
    date: '1 day ago',
    unread: false,
    folder: 'Inbox',
    thread: [
      { sender: 'Dev B (Developer)', text: 'Hi Manoj, I have finished writing the endpoints for assignments submission grading. Please review the layout mapping docs. The API is ready to hook up.', time: 'Yesterday' }
    ]
  },
  {
    sender: 'You',
    recipient: 'Sarah Jenkins',
    subject: 'Feedback response: PPT outlines',
    preview: 'Hi Sarah, thank you for your rating. I will append two custom exercises lists to the next notes...',
    date: '2 days ago',
    unread: false,
    folder: 'Sent',
    thread: [
      { sender: 'You', text: 'Hi Sarah, thank you for your rating. I will append two custom exercises lists to the next notes file for hook definitions.', time: '2 days ago' }
    ]
  }
];

const SAMPLE_ANNOUNCEMENTS = [
  {
    title: 'Live Q&A Session on Advanced Hooks',
    content: 'We will conduct a live session on Zoom this Friday at 4 PM to discuss custom hooks and context API queries. Bring your questions!',
    target: 'All Students',
    courseId: 'course-1',
    courseTitle: 'React Development Masterclass',
    date: '2026-07-16',
    files: ['meeting_agenda.pdf']
  },
  {
    title: 'Python Homework Module 1 Published',
    content: 'The exercises for variables syntax have been uploaded. Please submit before Monday.',
    target: 'Specific Course',
    courseId: 'course-2',
    courseTitle: 'Python Masterclass: Zero to Hero',
    date: '2026-07-10',
    files: []
  }
];

const SAMPLE_CALENDAR_EVENTS = [
  { title: 'React Hooks Live Class', date: '2026-07-18', type: 'Live Session', time: '10:00 AM' },
  { title: 'Python Assignment Deadline', date: '2026-07-20', type: 'Deadline', time: '11:59 PM' },
  { title: 'AWS Exam Review Session', date: '2026-07-22', type: 'Live Session', time: '2:00 PM' },
  { title: 'Summer Holiday', date: '2026-07-25', type: 'Holiday', time: 'All Day' }
];

async function main() {
  console.log('Seeding initial MongoDB database records...');

  // Clear existing data to ensure a clean, updated seed state
  await prisma.course.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.calendarEvent.deleteMany();
  console.log('Cleared all old database collections.');

  // 1. Seed Courses
  for (const c of SAMPLE_COURSES) {
    await prisma.course.create({ data: c });
  }
  console.log(`Seeded ${SAMPLE_COURSES.length} courses.`);

  // 2. Seed Activities
  for (const act of MOCK_ACTIVITIES) {
    await prisma.activity.create({ data: act });
  }
  console.log(`Seeded ${MOCK_ACTIVITIES.length} activities.`);

  // 3. Seed Reviews
  for (const rev of SAMPLE_REVIEWS) {
    const matched = await prisma.course.findFirst({ where: { title: rev.courseTitle } });
    await prisma.review.create({
      data: {
        ...rev,
        courseId: matched ? matched.id : rev.courseId
      }
    });
  }
  console.log(`Seeded ${SAMPLE_REVIEWS.length} reviews.`);

  // 4. Seed Messages
  for (const msg of SAMPLE_MESSAGES) {
    await prisma.message.create({ data: msg });
  }
  console.log(`Seeded ${SAMPLE_MESSAGES.length} messages.`);

  // 5. Seed Announcements
  for (const ann of SAMPLE_ANNOUNCEMENTS) {
    const matched = await prisma.course.findFirst({ where: { title: ann.courseTitle || '' } });
    await prisma.announcement.create({
      data: {
        ...ann,
        courseId: matched ? matched.id : ann.courseId
      }
    });
  }
  console.log(`Seeded ${SAMPLE_ANNOUNCEMENTS.length} announcements.`);

  // 6. Seed Calendar
  for (const ev of SAMPLE_CALENDAR_EVENTS) {
    await prisma.calendarEvent.create({ data: ev });
  }
  console.log(`Seeded ${SAMPLE_CALENDAR_EVENTS.length} calendar events.`);

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
