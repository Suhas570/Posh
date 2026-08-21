import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FolderOpen, Send, Paperclip, ChevronRight, User, CornerDownRight } from 'lucide-react';
import { courseService } from '../../services/courseService';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [activeFolder, setActiveFolder] = useState('Inbox'); // Inbox, Sent, Unread
  const [selectedMsgId, setSelectedMsgId] = useState(null);
  const [search, setSearch] = useState('');
  
  // Send state
  const [inputText, setInputText] = useState('');

  const loadData = () => {
    const list = courseService.getMessages();
    setMessages(list);
    if (list.length > 0 && !selectedMsgId) {
      // Find first matching item
      const inboxList = list.filter(m => m.folder === 'Inbox');
      if (inboxList.length > 0) setSelectedMsgId(inboxList[0].id);
      else setSelectedMsgId(list[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedMsgId) return;

    // Append reply to selected conversation thread
    const list = [...messages];
    const idx = list.findIndex(m => m.id === selectedMsgId);
    
    if (idx !== -1) {
      list[idx].thread.push({
        sender: 'You',
        text: inputText,
        time: 'Just now'
      });
      list[idx].preview = inputText.slice(0, 80) + '...';
      list[idx].unread = false;
      
      // Save
      localStorage.setItem('tutor_lms_messages', JSON.stringify(list));
      setMessages(list);
    }
    
    setInputText('');
  };

  // Filter messages list
  const filteredList = messages.filter(m => {
    const matchSearch = m.sender.toLowerCase().includes(search.toLowerCase()) || 
                        m.subject.toLowerCase().includes(search.toLowerCase());
    
    if (activeFolder === 'Unread') {
      return matchSearch && m.unread;
    }
    return matchSearch && m.folder === activeFolder;
  });

  const activeMsg = messages.find(m => m.id === selectedMsgId) || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col text-left mb-8"
    >
      <PageHeader
        title="Messages Inbox"
        subtitle="Communicate with students, developers, and administrator workspaces."
      />

      <div className="flex flex-col lg:flex-row gap-6 items-stretch mt-2 h-[550px]">
        {/* Left Side Folder List & Message Thread selection */}
        <Card className="w-full lg:w-80 bg-white border border-slate-100 flex flex-col overflow-hidden flex-shrink-0 shadow-premium">
          {/* Folders navigation */}
          <div className="flex border-b border-slate-100 p-2 select-none">
            {['Inbox', 'Sent', 'Unread'].map(fold => {
              const count = fold === 'Unread' 
                ? messages.filter(m => m.unread).length 
                : messages.filter(m => m.folder === fold).length;
              return (
                <button
                  key={fold}
                  onClick={() => {
                    setActiveFolder(fold);
                    // Find first item in new folder
                    const items = messages.filter(m => {
                      if (fold === 'Unread') return m.unread;
                      return m.folder === fold;
                    });
                    if (items.length > 0) setSelectedMsgId(items[0].id);
                  }}
                  className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all text-center
                    ${activeFolder === fold 
                      ? 'bg-brand-50 text-brand-600' 
                      : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {fold} ({count})
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="p-3 border-b border-slate-50">
            <div className="relative">
              <span className="absolute inset-y-0 left-2.5 flex items-center text-slate-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-[11px] font-semibold py-2 pl-8 pr-3 bg-[#f8fafc] border border-slate-200/50 rounded-xl focus:outline-none focus:border-brand-500 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Message List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {filteredList.length === 0 ? (
              <span className="text-xs text-slate-400 font-medium p-4 block text-center">No messages in folder.</span>
            ) : (
              filteredList.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMsgId(msg.id);
                    // Mark read
                    if (msg.unread) {
                      const list = [...messages];
                      const idx = list.findIndex(item => item.id === msg.id);
                      if (idx !== -1) {
                        list[idx].unread = false;
                        localStorage.setItem('tutor_lms_messages', JSON.stringify(list));
                        setMessages(list);
                      }
                    }
                  }}
                  className={`p-4 text-left cursor-pointer transition-all flex flex-col gap-1 relative border-l-2
                    ${selectedMsgId === msg.id 
                      ? 'bg-brand-50/20 border-brand-600' 
                      : 'border-transparent hover:bg-slate-50/50'}`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className={`text-xs font-bold truncate ${msg.unread ? 'text-brand-600' : 'text-slate-800'}`}>
                      {msg.sender}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">{msg.date}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 truncate">{msg.subject}</span>
                  <p className="text-[10px] text-slate-400 truncate leading-snug">{msg.preview}</p>
                  
                  {msg.unread && (
                    <span className="absolute top-4 right-4 w-1.5 h-1.5 bg-brand-600 rounded-full" />
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right Side Conversation view */}
        <Card className="flex-1 bg-white border border-slate-100 flex flex-col overflow-hidden shadow-premium">
          {activeMsg ? (
            <div className="flex-1 flex flex-col overflow-hidden h-full">
              {/* Header metadata */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold">
                    <User size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 leading-tight">{activeMsg.sender}</span>
                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{activeMsg.subject}</span>
                  </div>
                </div>
              </div>

              {/* Chat Thread history */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50/20">
                {activeMsg.thread.map((thr, i) => {
                  const isMe = thr.sender === 'You';
                  return (
                    <div 
                      key={i} 
                      className={`flex flex-col gap-1.5 max-w-[70%] 
                        ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                    >
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{thr.sender} • {thr.time}</span>
                      <div className={`p-3 rounded-2xl border text-xs leading-relaxed font-semibold text-left
                        ${isMe 
                          ? 'bg-brand-600 text-white border-transparent rounded-tr-none' 
                          : 'bg-white text-slate-700 border-slate-200/60 rounded-tl-none'}`}
                      >
                        {thr.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Input Bar */}
              <form onSubmit={handleSendReply} className="p-3 border-t border-slate-100 flex items-center gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => alert('File Attachment mock')}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                  title="Attach Files"
                >
                  <Paperclip size={16} />
                </button>
                <input
                  type="text"
                  placeholder="Type your message reply..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 text-xs font-semibold py-2.5 px-4 bg-[#f8fafc] border border-slate-200/50 rounded-xl focus:outline-none focus:border-brand-500 placeholder-slate-400"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-brand-600 hover:bg-brand-700 p-2.5 py-2.5 rounded-xl text-white"
                >
                  <Send size={14} />
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-20 text-center select-none">
              <FolderOpen size={32} className="text-slate-300 mb-2" />
              <span className="text-xs font-medium">Select a conversation thread to start messaging.</span>
            </div>
          )}
        </Card>
      </div>
    </motion.div>
  );
};

export default Messages;
