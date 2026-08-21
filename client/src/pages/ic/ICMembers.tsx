import React from 'react';
import { ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';

const ICMembers: React.FC = () => {
  const members = [
    {
      name: 'Alice Johnson',
      role: 'Presiding Officer',
      designation: 'Internal Compliance Director',
      email: 'alice.johnson@company.com',
      phone: '+1 (555) 017-9102',
      joinedDate: '2022-04-12'
    },
    {
      name: 'Jane Smith',
      role: 'Committee Member',
      designation: 'Human Resources Director',
      email: 'jane.smith@company.com',
      phone: '+1 (555) 018-4729',
      joinedDate: '2022-04-12'
    },
    {
      name: 'Marcus Brody',
      role: 'External Member',
      designation: 'Senior Legal Advocate, NGO Support',
      email: 'marcus.brody@complianceadvocates.org',
      phone: '+1 (555) 019-3388',
      joinedDate: '2023-01-15'
    }
  ];

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Internal Committee Members</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">Official members presiding over Prevention of Sexual Harassment (POSH) cases</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {members.map((member, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold tracking-wide uppercase">
                    {member.role}
                  </span>
                  <h3 className="font-bold text-sm text-gray-800 dark:text-white mt-2">{member.name}</h3>
                  <span className="text-[10px] text-gray-400 block font-semibold mt-0.5">{member.designation}</span>
                </div>
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <ShieldCheck size={20} />
                </div>
              </div>

              <div className="mt-5 space-y-2 border-t border-gray-50 dark:border-gray-700/30 pt-4 text-gray-605 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-gray-400" />
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-gray-400" />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={12} className="text-gray-400" />
                  <span>Member since: {new Date(member.joinedDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ICMembers;
