import { ArrowRight, BookOpen, Sparkles, Award, ShieldCheck, CheckCircle2, Star, GraduationCap, Users, Heart } from 'lucide-react';
import { useSiteData } from '../context/SiteContext';

const renderIcon = (name, className = "w-4 h-4") => {
  switch (name) {
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'Award':
      return <Award className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'CheckCircle2':
      return <CheckCircle2 className={className} />;
    case 'Star':
      return <Star className={className} />;
    case 'GraduationCap':
      return <GraduationCap className={className} />;
    case 'Users':
      return <Users className={className} />;
    case 'Heart':
      return <Heart className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};

const Hero = () => {
  const { siteData, navigateTo } = useSiteData();
  const { hero } = siteData;

  const overlayOpacity = typeof hero.bgOverlayOpacity === 'number' ? hero.bgOverlayOpacity / 100 : 0.85;

  return (
    <section id="home" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Background Image with Dynamic Dark-Tinted Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-105"
        style={{
          backgroundImage: `url('${hero.bgImage}')`,
        }}
      >
        {/* Layered gradients for legibility and rich atmosphere with live opacity */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 transition-opacity duration-300"
          style={{ opacity: overlayOpacity }}
        ></div>
        <div className="absolute inset-0 bg-radial from-transparent via-slate-950/40 to-slate-950/90"></div>
      </div>

      {/* Decorative ambient lighting elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Badge */}
        {hero.badge && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-6 backdrop-blur-sm shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{hero.badge}</span>
          </div>
        )}

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif-brand font-bold text-white tracking-tight leading-[1.15] mb-6 drop-shadow-md">
          {hero.titlePart1}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-300">
            {hero.titleHighlight}
          </span>
        </h1>

        {/* Subheading */}
        {hero.subheading && (
          <p className="text-xl sm:text-2xl md:text-3xl font-quote italic text-slate-200 max-w-3xl mx-auto mb-10 font-normal tracking-wide">
            {hero.subheading}
          </p>
        )}

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => navigateTo('academics')}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-sm sm:text-base font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 rounded-full shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-slate-900 group-hover:scale-110 transition-transform" />
              <span>{hero.primaryBtnText || "Our Academics"}</span>
              <ArrowRight className="w-4 h-4 text-slate-900 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          {hero.secondaryBtnText && (
            <button
              type="button"
              onClick={() => navigateTo('about')}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-sm sm:text-base font-semibold text-white border border-white/20 hover:border-amber-400 hover:text-amber-300 hover:bg-white/5 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer"
            >
              <span>{hero.secondaryBtnText}</span>
              <ArrowRight className="w-4 h-4 text-white/60 group-hover:text-amber-300 group-hover:translate-x-1 transition-all" />
            </button>
          )}
        </div>

        {/* Key Feature Highlights */}
        {hero.features && hero.features.length > 0 && (
          <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-4 pt-10 border-t border-slate-800/80 max-w-4xl mx-auto">
            {hero.features.map((feat, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-center gap-3 text-slate-300 ${
                  index === 2 ? 'col-span-2 md:col-span-1' : ''
                }`}
              >
                {renderIcon(feat.icon, "w-5 h-5 text-amber-400 shrink-0")}
                <span className="text-xs sm:text-sm text-left">{feat.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
