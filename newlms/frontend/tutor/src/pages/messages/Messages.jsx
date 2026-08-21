import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, User, MessageSquare } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import axios from 'axios';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/messages');
      setMessages(res.data);
    } catch (e) {
      setMessages([]);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const res = await axios.post('http://localhost:5000/api/messages', {
        sender: 'Dr. Manoj Kumar',
        role: 'TUTOR',
        receiver: 'Super Admin',
        text: inputText
      });
      setMessages(prev => [...prev, res.data]);
      setInputText('');
    } catch (e) {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col text-left mb-8"
    >
      <PageHeader
        title="Admin ↔ Tutor Direct Inbox"
        subtitle="Direct real-time communication channel with Super Administrator."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Left Side Sidebar */}
        <Card className="lg:col-span-1 p-4 bg-white border border-slate-200/60 flex flex-col gap-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <MessageSquare size={16} className="text-brand-600" /> Active Conversation
          </h2>

          <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-black text-xs flex items-center justify-center">
              SA
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800">Super Admin</span>
              <span className="text-[10px] text-brand-600 font-bold">LMS System Administrator</span>
            </div>
          </div>
        </Card>

        {/* Right Side Chat Thread */}
        <Card className="lg:col-span-2 p-5 bg-white border border-slate-200/60 flex flex-col justify-between min-h-[420px]">
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[320px] pr-2">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`p-3.5 rounded-2xl max-w-[80%] flex flex-col text-xs ${
                  msg.role === 'TUTOR' 
                    ? 'ml-auto bg-brand-600 text-white rounded-br-none' 
                    : 'mr-auto bg-slate-100 text-slate-800 border border-slate-200 rounded-bl-none'
                }`}
              >
                <span className="text-[10px] font-bold opacity-75 mb-0.5">{msg.sender}</span>
                <p className="font-semibold leading-relaxed">{msg.text}</p>
                <span className="text-[9px] opacity-60 text-right mt-1 font-bold">{msg.time}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendReply} className="flex gap-2 pt-4 border-t border-slate-100 mt-4">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Reply to Super Admin..."
              className="flex-1 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs text-slate-800 outline-none focus:border-brand-500 font-semibold"
            />
            <Button 
              type="submit"
              variant="primary"
              size="sm"
              className="bg-brand-600 hover:bg-brand-700 text-white px-5 rounded-xl text-xs font-bold"
            >
              <Send size={14} className="mr-1" /> Send
            </Button>
          </form>
        </Card>
      </div>
    </motion.div>
  );
};

export default Messages;
