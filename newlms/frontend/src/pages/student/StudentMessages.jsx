import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Search, MessageSquare, ShieldAlert, Sparkles } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';
import { studentService } from '../../services/studentService';

const StudentMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const list = await studentService.getMessages();
        setConversations(list);
        if (list.length > 0) {
          setActiveConv(list[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadConversations();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;
    
    // Write message
    const updated = await studentService.sendMessage(activeConv.id, inputText);
    setInputText('');

    // Reload conversations
    setConversations(updated);
    const current = updated.find(c => c.id === activeConv.id);
    if (current) {
      setActiveConv(current);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 text-left"
    >
      <PageHeader 
        title="Messages Inbox" 
        subtitle="Communicate directly with instructor Manoj. Ask questions, get feedback, and discuss modules."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[65vh]">
        
        {/* Left Side: Threads List (1 Column) */}
        <div className="lg:col-span-1 bg-white border border-slate-200/50 rounded-[20px] p-4 flex flex-col gap-3 h-full overflow-y-auto shadow-sm">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full text-[10px] font-semibold py-2 pl-9 pr-3 bg-slate-50 border border-slate-200/50 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 placeholder-slate-400"
            />
          </div>

          <div className="flex flex-col gap-2 mt-2">
            {loading ? (
              <div className="h-20 bg-slate-50 animate-pulse rounded-xl" />
            ) : conversations.length > 0 ? (
              conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer
                    ${activeConv?.id === conv.id 
                      ? 'border-indigo-100 bg-indigo-50/20' 
                      : 'border-slate-100 hover:bg-slate-50/50'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800">{conv.sender}</span>
                    <span className="text-[9px] text-slate-400 font-semibold">{conv.date}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 truncate">{conv.subject}</span>
                  <p className="text-[10px] text-slate-400 font-medium truncate">{conv.preview}</p>
                </button>
              ))
            ) : (
              <span className="text-xs text-slate-400 text-center">No active chat threads.</span>
            )}
          </div>
        </div>

        {/* Right Side: Chat Window (2 Columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/50 rounded-[20px] flex flex-col justify-between h-full overflow-hidden shadow-sm">
          {activeConv ? (
            <>
              {/* Active Header */}
              <div className="px-5 py-4 border-b border-slate-200/40 flex items-center justify-between bg-slate-50/50">
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="text-xs font-extrabold text-slate-800">{activeConv.sender}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{activeConv.subject}</span>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-3 scrollbar-thin bg-slate-50/20">
                {activeConv.thread.map((msg, idx) => {
                  const isMe = msg.sender === 'Student';
                  return (
                    <div 
                      key={idx} 
                      className={`flex flex-col max-w-[70%] gap-1 
                        ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                    >
                      <div 
                        className={`p-3 rounded-2xl text-xs font-semibold text-left
                          ${isMe 
                            ? 'bg-indigo-600 text-white rounded-br-none shadow-sm' 
                            : 'bg-white border border-slate-200/40 text-slate-700 rounded-bl-none shadow-sm'
                          }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{msg.time}</span>
                    </div>
                  );
                })}
              </div>

              {/* Input Form Footer */}
              <form onSubmit={handleSend} className="p-4 border-t border-slate-200/40 flex items-center gap-3 bg-white">
                <input
                  type="text"
                  placeholder="Type a message to tutor Manoj..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-grow text-xs font-semibold py-2.5 px-4 bg-slate-50 border border-slate-200/50 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 placeholder-slate-400"
                />
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl cursor-pointer"
                >
                  <Send size={14} className="fill-white" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-slate-400 p-8">
              <MessageSquare size={36} className="text-slate-300 mb-2" />
              <h4 className="text-xs font-bold text-slate-700">No active thread selected</h4>
              <p className="text-[10px] text-slate-400">Choose an inbox conversation thread to start chatting.</p>
            </div>
          )}
        </div>

      </div>

    </motion.div>
  );
};

export default StudentMessages;
