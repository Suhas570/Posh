import React from 'react';

const Footer = () => {
  return (
    <footer className="py-6 px-6 md:px-8 border-t border-slate-100 bg-white text-center text-xs font-medium text-slate-400">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
        <span>© {new Date().getFullYear()} Tutor LMS. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
