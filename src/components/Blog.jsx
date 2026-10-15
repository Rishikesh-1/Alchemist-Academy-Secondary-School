import React, { useState } from 'react';
import { Calendar, User, Clock, ArrowRight, Tag, BookOpen, ChevronRight, X, Sun, Moon } from 'lucide-react';
import { useSiteData } from '../context/SiteContext';

const Blog = () => {
  const { siteData, navigateTo, isDark, toggleTheme } = useSiteData();
  const blogs = siteData.blogs || [];
  const displayBlogs = blogs.slice(0, 3);
  const [selectedBlog, setSelectedBlog] = useState(null);

  return (
    <section id="blog" className={`py-24 relative transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-500 font-bold uppercase tracking-wider text-xs sm:text-sm">
            Campus Life & Updates
          </span>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-serif-brand font-bold mt-2 mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            News & School Articles
          </h2>
          <p className={`text-base sm:text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Stay informed with the latest milestones, academic innovations, extracurricular competitions, and cultural celebrations at Alchemist Academy.
          </p>
        </div>

        {/* 3-Column Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayBlogs.map((post) => (
            <article
              key={post.id}
              className={`rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border border-slate-800 hover:border-amber-400/50'
                  : 'bg-white border border-slate-200/90 hover:border-amber-400/50'
              }`}
              onClick={() => setSelectedBlog(post)}
            >
              {/* Blog Image */}
              <div className="relative h-52 overflow-hidden bg-slate-100">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                
                {/* Category Tag */}
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-slate-900 backdrop-blur-md shadow-sm">
                  {post.category}
                </span>

                {/* Read Time */}
                <span className="absolute bottom-3 right-4 text-xs font-medium text-white/90 flex items-center gap-1 backdrop-blur-xs">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readTime}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  {/* Meta: Date & Author */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-500" />
                      {post.author}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className={`text-xl font-bold font-serif-brand group-hover:text-amber-500 transition-colors leading-snug mb-3 line-clamp-2 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {post.title}
                  </h3>

                  {/* Summary */}
                  <p className={`text-sm leading-relaxed line-clamp-3 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {post.summary}
                  </p>
                </div>

                {/* Card Action Link */}
                <div className={`mt-6 pt-4 border-t flex items-center justify-between text-xs font-semibold transition-colors ${
                  isDark ? 'border-slate-800 text-slate-400 group-hover:text-amber-400' : 'border-slate-100 text-slate-500 group-hover:text-amber-600'
                }`}>
                  <span>Read Full Story</span>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isDark ? 'bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950' : 'bg-slate-100 group-hover:bg-amber-100 group-hover:text-amber-700'
                  }`}>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All Articles Action Button */}
        <div className="mt-16 text-center">
          <button
            type="button"
            onClick={() => navigateTo('blog')}
            className={`group inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-sm shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer ${
              isDark
                ? 'bg-slate-900 text-white border border-slate-800 hover:border-amber-400 hover:text-amber-400'
                : 'bg-white text-slate-900 border border-slate-200/90 hover:border-amber-400 hover:text-amber-700'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            <span>Browse All News & Articles</span>
            <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-500/10 text-amber-800 border-amber-500/20'
            }`}>
              {blogs.length} Stories
            </span>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ml-1 ${
              isDark ? 'bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-400' : 'bg-slate-100 group-hover:bg-amber-500 group-hover:text-white text-slate-500'
            }`}>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        </div>

      </div>

      {/* Blog Article Reader Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className={`rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border relative transition-colors duration-200 ${
            isDark 
              ? 'bg-slate-900 border-slate-800 text-slate-100' 
              : 'bg-white border-slate-100 text-slate-900'
          }`}>
            
            {/* Top Modal Controls */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full bg-slate-900/70 hover:bg-slate-900 text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedBlog(null)}
                className="w-10 h-10 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image */}
            <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900">
              <img
                src={selectedBlog.image}
                alt={selectedBlog.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              <span className="absolute bottom-4 left-6 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-slate-950">
                {selectedBlog.category}
              </span>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className={`flex items-center gap-4 text-xs ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  {selectedBlog.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-500" />
                  {selectedBlog.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  {selectedBlog.readTime}
                </span>
              </div>

              <h2 className={`text-2xl sm:text-3xl font-serif-brand font-bold leading-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {selectedBlog.title}
              </h2>

              <p className={`text-base leading-relaxed pt-2 whitespace-pre-line ${
                isDark ? 'text-slate-200' : 'text-slate-700'
              }`}>
                {selectedBlog.content || selectedBlog.summary}
              </p>

              <div className={`pt-6 border-t flex justify-end ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <button
                  type="button"
                  onClick={() => setSelectedBlog(null)}
                  className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-slate-900 hover:bg-amber-600 text-white'
                  }`}
                >
                  Close Article
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};

export default Blog;

