import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-150 dark:border-gray-700/50">
        <div className="mx-auto h-16 w-16 bg-rose-50 dark:bg-rose-950/20 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400">
          <ShieldAlert size={36} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Unauthorized Portal Access</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Your current security credentials do not allow access to this portal. If you believe this is an error, please contact your Super Admin.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/login"
            className="inline-block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
          >
            Back to Safety
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
