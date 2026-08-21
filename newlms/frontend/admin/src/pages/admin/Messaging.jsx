import React, { useEffect, useState } from 'react';
import { MessageSquare, Send, User, Search } from 'lucide-react';
import apiClient from '../../api/client';

const Messaging = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const res = await apiClient.get('/api/admin/messages');
      setMessages(res.data);
    } catch (e) {
      setMessages([]);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const res = await apiClient.post('/api/admin/messages', {
        sender: 'Super Admin',
        role: 'ADMIN',
        text
      });
      setMessages(prev => [...prev, res.data]);
      setText('');
    } catch (e) {}
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-black tracking-tight text-white">Admin ↔ Tutor Direct Messaging</h1>
        <p className="text-xs text-slate-400 font-medium mt-1">Direct conversation inbox between Super Admin and Platform Tutors.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tutor Conversation List */}
        <div className="lg:col-span-1 bg-[#0d1322] border border-slate-800 p-4 rounded-2xl flex flex-col gap-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
            <MessageSquare size={16} className="text-purple-400" /> Active Threads
          </h2>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-purple-500/30 flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-purple-600/20 text-purple-300 font-bold flex items-center justify-center border border-purple-500/30">
              MK
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-extrabold text-white">Dr. Manoj Kumar</span>
              <span className="text-[10px] text-purple-400 font-bold">Tutor (Python / React)</span>
            </div>
          </div>
        </div>

        {/* Message Thread Box */}
        <div className="lg:col-span-2 bg-[#0d1322] border border-slate-800 p-5 rounded-2xl flex flex-col justify-between min-h-[400px]">
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`p-3 rounded-2xl max-w-[80%] flex flex-col text-xs ${
                  msg.role === 'ADMIN' 
                    ? 'ml-auto bg-purple-600 text-white rounded-br-none' 
                    : 'mr-auto bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
                }`}
              >
                <span className="text-[10px] font-bold opacity-70 mb-0.5">{msg.sender}</span>
                <p className="font-normal leading-relaxed">{msg.text}</p>
                <span className="text-[9px] opacity-60 text-right mt-1 font-bold">{msg.time}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex gap-2 pt-4 border-t border-slate-800">
            <input 
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type message to tutor..."
              className="flex-1 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-xs text-slate-200 outline-none focus:border-purple-500"
            />
            <button 
              type="submit"
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-purple-500/20"
            >
              <Send size={14} /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Messaging;
