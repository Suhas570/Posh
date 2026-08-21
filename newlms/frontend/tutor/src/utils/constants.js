export const CATEGORIES = [
  'Development',
  'Design',
  'Business',
  'Marketing',
  'Academics',
  'Photography',
  'Music'
];

export const LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced'
];

export const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Hindi',
  'Mandarin',
  'Japanese'
];

export const STATUSES = [
  'Draft',
  'Published'
];

export const VIDEO_TYPES = {
  YOUTUBE: 'YouTube',
  ANIMATED: 'Animated Video',
  PRERECORDED: 'Pre-recorded Video'
};

export const RESOURCE_TYPES = [
  'Documentation',
  'GitHub',
  'Website',
  'Article'
];

export const SAMPLE_COURSES = [
  {
    id: 'course-1',
    title: 'React Development Masterclass',
    description: 'Learn modern React including Hooks, Context API, Redux Toolkit, and performance optimizations. Build real-world projects.',
    category: 'Development',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop',
    instructor: 'Manoj',
    duration: '24 Hours',
    level: 'Intermediate',
    language: 'English',
    status: 'Published',
    createdAt: '2026-06-15T09:00:00Z',
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
            pdfFile: { name: 'jsx_syntax_handout.pdf', size: '1.2 MB', url: 'https://tutorlms.local/uploads/jsx_syntax_handout.pdf' },
            pptFile: { name: 'jsx_basics_deck.pptx', size: '3.4 MB', url: 'https://tutorlms.local/uploads/jsx_basics_deck.pptx' },
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
            pdfFile: { name: 'context_api_cheat_sheet.pdf', size: '840 KB', url: 'https://tutorlms.local/uploads/context_api_cheat_sheet.pdf' },
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
    id: 'course-2',
    title: 'Python Masterclass: Zero to Hero',
    description: 'Master Python programming from basics to decorators, generators, and FastAPI backend frameworks.',
    category: 'Development',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop',
    instructor: 'Manoj',
    duration: '18 Hours',
    level: 'Beginner',
    language: 'English',
    status: 'Published',
    createdAt: '2026-07-02T14:30:00Z',
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
    id: 'course-3',
    title: 'AWS Cloud Basics for Beginners',
    description: 'An introduction to Amazon Web Services. Learn key services like EC2, S3, RDS, Lambda, and IAM.',
    category: 'Development',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    instructor: 'Manoj',
    duration: '16 Hours',
    level: 'Beginner',
    language: 'English',
    status: 'Draft',
    createdAt: '2026-07-10T11:15:00Z',
    curriculum: []
  }
];

export const MOCK_ACTIVITIES = [
  {
    id: 'act-1',
    type: 'video',
    text: 'You added lesson video "Introduction to JSX Markup" to "React Development Masterclass"',
    time: '2 hours ago',
    courseId: 'course-1'
  },
  {
    id: 'act-2',
    type: 'note',
    text: 'You uploaded a notes PDF file "context_api_cheat_sheet.pdf"',
    time: '5 hours ago',
    courseId: 'course-1'
  },
  {
    id: 'act-3',
    type: 'course',
    text: 'You updated course "Python Masterclass: Zero to Hero"',
    time: '1 day ago',
    courseId: 'course-2'
  }
];

export const SAMPLE_REVIEWS = [
  {
    id: 'rev-1',
    courseId: 'course-1',
    courseTitle: 'React Development Masterclass',
    studentName: 'Amit Patel',
    rating: 5,
    comment: 'The absolute best explanation of React Hooks I have ever watched. The context provider explanation is incredibly clear!',
    date: '2026-07-15',
    reply: 'Thank you Amit! Glad to hear the hooks explanations were useful for you.'
  },
  {
    id: 'rev-2',
    courseId: 'course-1',
    courseTitle: 'React Development Masterclass',
    studentName: 'Sarah Jenkins',
    rating: 4,
    comment: 'Great pacing and detailed examples. I wish there were more practice exercises for custom hooks, but the PPT decks are excellent.',
    date: '2026-07-14',
    reply: ''
  },
  {
    id: 'rev-3',
    courseId: 'course-2',
    courseTitle: 'Python Masterclass: Zero to Hero',
    studentName: 'Raj Kumar',
    rating: 5,
    comment: 'Excellent introduction for beginners. Manoj is a fantastic instructor, pacing is just right.',
    date: '2026-07-12',
    reply: ''
  }
];

export const SAMPLE_MESSAGES = [
  {
    id: 'msg-1',
    sender: 'Sonia Mehta',
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
    id: 'msg-2',
    sender: 'Dev B (Developer)',
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
    id: 'msg-3',
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

export const SAMPLE_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    title: 'Live Q&A Session on Advanced Hooks',
    content: 'We will conduct a live session on Zoom this Friday at 4 PM to discuss custom hooks and context API queries. Bring your questions!',
    target: 'All Students',
    courseId: 'course-1',
    courseTitle: 'React Development Masterclass',
    date: '2026-07-16',
    files: ['meeting_agenda.pdf']
  },
  {
    id: 'ann-2',
    title: 'Python Homework Module 1 Published',
    content: 'The exercises for variables syntax have been uploaded. Please submit before Monday.',
    target: 'Specific Course',
    courseId: 'course-2',
    courseTitle: 'Python Masterclass: Zero to Hero',
    date: '2026-07-10',
    files: []
  }
];

export const SAMPLE_CALENDAR_EVENTS = [
  { id: 'ev-1', title: 'React Hooks Live Class', date: '2026-07-18', type: 'Live Session', time: '10:00 AM' },
  { id: 'ev-2', title: 'Python Assignment Deadline', date: '2026-07-20', type: 'Deadline', time: '11:59 PM' },
  { id: 'ev-3', title: 'AWS Exam Review Session', date: '2026-07-22', type: 'Live Session', time: '2:00 PM' },
  { id: 'ev-4', title: 'Summer Holiday', date: '2026-07-25', type: 'Holiday', time: 'All Day' }
];
