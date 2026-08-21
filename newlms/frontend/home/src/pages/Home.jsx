import React from 'react';
import { Link } from 'react-router-dom';

const roles = [
  {
    name: 'Admin',
    desc: 'Manage users, courses, tutors, categories and platform settings.',
    icon: '🛡️',
  },
  {
    name: 'Tutor',
    desc: 'Create courses, review assignments, and track student progress.',
    icon: '🎓',
  },
  {
    name: 'Student',
    desc: 'Learn, take assessments, and download your certificates.',
    icon: '📘',
  },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-950 via-brand-900 to-brand-950 text-white">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-brand-600 border-2 border-white/20 flex items-center justify-center font-bold text-sm">
            LMS
          </div>
          <span className="font-bold text-lg tracking-tight">NewLMS Academy</span>
        </div>
        <Link
          to="/login"
          className="bg-white text-brand-900 font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          Login
        </Link>
      </header>

      <main className="max-w-4xl mx-auto text-center px-6 pt-16 pb-20">
        <p className="text-brand-300 text-sm font-semibold tracking-wide uppercase mb-4">
          Accredited Learning &amp; Assessment Platform
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5">
          One home for every role on NewLMS
        </h1>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-10">
          Sign in once and we'll take you straight to the dashboard built for you —
          whether you administer the platform, teach, or learn.
        </p>
        <Link
          to="/login"
          className="inline-block bg-brand-600 hover:bg-brand-500 transition-colors text-white font-semibold px-8 py-3.5 rounded-full text-base"
        >
          Login to your dashboard →
        </Link>

        <div className="grid sm:grid-cols-3 gap-5 mt-20 text-left">
          {roles.map((r) => (
            <div key={r.name} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-3xl mb-3">{r.icon}</div>
              <h3 className="font-semibold text-lg mb-1.5">{r.name}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center text-slate-500 text-xs pb-8">
        © {new Date().getFullYear()} NewLMS Academy. Certificates issued are tamper-evident and verifiable online.
      </footer>
    </div>
  );
};

export default Home;
