import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Search, Filter, MessageSquare, CornerDownRight, Check, Send } from 'lucide-react';
import { courseService } from '../../services/courseService';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const CourseReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('All'); // All, 5, 4, 3, 2, 1
  const [sortBy, setSortBy] = useState('newest'); // newest, highest, lowest

  // Reply states
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const loadData = () => {
    setReviews(courseService.getReviews());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReplySubmit = (reviewId) => {
    if (!replyText.trim()) return;
    courseService.updateReviewReply(reviewId, replyText);
    setActiveReplyId(null);
    setReplyText('');
    loadData();
  };

  const filtered = reviews
    .filter(r => {
      const matchSearch = r.comment.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRating = ratingFilter === 'All' ? true : r.rating === parseInt(ratingFilter);
      return matchSearch && matchRating;
    })
    .sort((a, b) => {
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      return new Date(b.date) - new Date(a.date);
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col text-left mb-8"
    >
      <PageHeader
        title="Student Course Reviews"
        subtitle="Read review comments, star ratings, and reply to student feedback."
      />

      {/* Filter and Sort bar */}
      <div className="flex flex-col lg:flex-row items-center gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm mb-6">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search reviews by comment text, student name, or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold py-2.5 pl-10 pr-4 bg-[#f8fafc] border border-slate-200/50 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/10 transition-all placeholder-slate-400"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Rating</span>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="text-xs font-semibold py-2 px-3 bg-[#f8fafc] border border-slate-200/50 rounded-xl focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="All">All Stars</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold py-2 px-3 bg-[#f8fafc] border border-slate-200/50 rounded-xl focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50/20">
          <Star size={28} className="text-slate-400 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-600">No reviews found</h4>
          <p className="text-[11px] text-slate-400">Try adjusting your filters or searches.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((rev) => (
            <Card key={rev.id} className="p-5 bg-white border border-slate-100/80 text-left flex flex-col gap-3">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 pb-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-800">{rev.studentName}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{rev.courseTitle} • {rev.date}</span>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      size={14}
                      className={idx < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
                    />
                  ))}
                </div>
              </div>

              {/* Review Comment */}
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                "{rev.comment}"
              </p>

              {/* Reply Thread logs */}
              {rev.reply ? (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5 mt-1 ml-4 text-left">
                  <CornerDownRight size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1 leading-tight">
                    <span className="text-[10px] font-bold text-slate-700">Manoj (Instructor)</span>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {rev.reply}
                    </p>
                  </div>
                </div>
              ) : (
                /* Add Reply Trigger Button */
                activeReplyId !== rev.id ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="self-start text-[10px] font-bold text-brand-600 hover:text-brand-700 p-0 hover:bg-transparent"
                    onClick={() => {
                      setActiveReplyId(rev.id);
                      setReplyText('');
                    }}
                    icon={MessageSquare}
                  >
                    Reply to feedback
                  </Button>
                ) : (
                  /* Reply Input Box */
                  <div className="flex flex-col gap-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100 ml-4 mt-1">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your response to the student..."
                      rows={2}
                      className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 bg-white"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-[10px] px-2.5 py-1.5 rounded-lg"
                        onClick={() => setActiveReplyId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-[10px] px-2.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700"
                        onClick={() => handleReplySubmit(rev.id)}
                        icon={Send}
                      >
                        Send Reply
                      </Button>
                    </div>
                  </div>
                )
              )}
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default CourseReviews;
