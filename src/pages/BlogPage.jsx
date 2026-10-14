import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Search,
  Tag,
  Share2,
  X,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { useSiteData } from '../context/SiteContext';

const BlogPage = () => {
  const { siteData, navigateTo, isDark, toggleTheme } = useSiteData();
  const blogs = siteData.blogs || [];
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect distinct categories
  const categories = ['All', ...new Set(blogs.map((b) => b.category))];

  // Filter articles
  const filteredBlogs = blogs.filter((b) => {
    const matchCat = activeCategory === 'All' || b.category === activeCategory;
    const matchSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.content && b.content.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Banner */}
      <section className="bg-slate-950 text-white py-8 sm:py-10 relative overflow-hidden border-b border-slate-900">
        <div className="absolute inset-0 bg-radial from-amber-600/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-2 uppercase tracking-wider">
              <button onClick={() => navigateTo('home')} className="hover:underline cursor-pointer">
                Home
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-300">School Blog & Updates</span>
            </nav>
            
            <h1 className="font-serif-brand font-bold text-2xl sm:text-3xl md:text-4xl tracking-tight text-white max-w-2xl">
              Voices, Events & Campus Stories
            </h1>
            <p className="mt-1.5 text-slate-400 max-w-2xl text-xs sm:text-sm leading-relaxed">
              Read the latest dispatches from Alchemist Academy: student achievements, academic workshops, cultural festivals, and admissions updates.
            </p>
          </div>

          {/* Quick theme mode toggle in banner */}
          <div className="shrink-0 self-start md:self-center">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300 hover:border-slate-700 shadow-sm transition-all cursor-pointer"
              title={isDark ? "Switch to Light View" : "Switch to Dark View"}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                  <span className="text-slate-200">Switch to Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-200">Switch to Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Toolbar: Search & Category Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className={`p-4 sm:p-5 rounded-2xl border transition-colors duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isDark 
            ? 'bg-slate-900/90 border-slate-800 shadow-lg' 
            : 'bg-white border-slate-200/80 shadow-sm'
        }`}>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search articles & topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition-colors ${
                isDark
                  ? 'bg-slate-950 border-slate-700 text-white placeholder:text-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>

          {/* Categories and Theme Pill */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : isDark
                    ? 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-amber-400 hover:text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-700'
                }`}
              >
                {cat}
              </button>
            ))}

            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-full border transition-colors cursor-pointer shrink-0 ml-1 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </section>

      {/* Article Grid */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredBlogs.length === 0 ? (
          <div className={`text-center py-20 rounded-3xl border p-8 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>No articles match your criteria</h3>
            <p className="text-xs text-slate-400 mt-1">Try switching category tabs or clearing your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((post) => (
              <article
                key={post.id}
                className={`group rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between ${
                  isDark
                    ? 'bg-slate-900/95 border-slate-800 hover:border-amber-500/40 shadow-sm hover:shadow-2xl hover:shadow-amber-500/5 hover:-translate-y-1'
                    : 'bg-white border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1'
                }`}
              >
                {/* Article Header Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-800">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-amber-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-amber-500/30">
                    {post.category}
                  </div>
                </div>

                {/* Article Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {post.readTime}
                      </span>
                    </div>

                    <h2 className={`font-serif-brand font-bold text-lg sm:text-xl transition-colors leading-snug ${
                      isDark 
                        ? 'text-white group-hover:text-amber-400' 
                        : 'text-slate-900 group-hover:text-amber-600'
                    }`}>
                      {post.title}
                    </h2>

                    <p className={`text-xs sm:text-sm line-clamp-3 leading-relaxed ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {post.summary}
                    </p>
                  </div>

                  <div className={`pt-4 border-t flex items-center justify-between ${
                    isDark ? 'border-slate-800' : 'border-slate-100'
                  }`}>
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {post.author}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedArticle(post)}
                      className="group/btn inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-slate-950 text-xs font-bold transition-all duration-200 cursor-pointer"
                    >
                      <span>Read Story</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Reader Modal */}
      {selectedArticle && (
        <div
          onClick={() => setSelectedArticle(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 cursor-pointer animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border cursor-default transition-colors duration-200 ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-slate-100' 
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Image Header */}
            <div className="relative aspect-[21/9] w-full bg-slate-900 overflow-hidden">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {/* Modal Theme Switcher */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-9 h-9 rounded-full bg-slate-950/80 hover:bg-slate-950 text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
                  title={isDark ? "Switch reading to Light Mode" : "Switch reading to Dark Mode"}
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="w-9 h-9 rounded-full bg-slate-950/80 text-white flex items-center justify-center hover:bg-slate-950 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="absolute bottom-4 left-6 bg-slate-950/80 backdrop-blur-md text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/20">
                {selectedArticle.category}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-10 space-y-6">
              <div className={`flex flex-wrap items-center gap-4 text-xs pb-2 border-b ${
                isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
              }`}>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  {selectedArticle.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-amber-500" />
                  {selectedArticle.readTime}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4 text-amber-500" />
                  Published by {selectedArticle.author}
                </span>
              </div>

              <h2 className={`font-serif-brand font-bold text-2xl sm:text-3xl leading-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {selectedArticle.title}
              </h2>

              <p className={`text-sm sm:text-base leading-relaxed font-serif-brand italic border-l-4 border-amber-500 pl-4 py-1.5 rounded-r-xl ${
                isDark ? 'bg-amber-950/30 text-amber-200' : 'bg-amber-50/50 text-slate-700'
              }`}>
                {selectedArticle.summary}
              </p>

              <div className={`text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line ${
                isDark ? 'text-slate-200' : 'text-slate-700'
              }`}>
                <p>
                  {selectedArticle.content || selectedArticle.summary}
                </p>
                <p>
                  At Alchemist Academy, such events exemplify our commitment to providing students with dynamic opportunities for self-discovery, teamwork, and academic growth.
                </p>
              </div>

              <div className={`pt-6 border-t flex items-center justify-between ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isDark 
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  Close Article
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('contact')}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow"
                >
                  Inquire Admissions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPage;

