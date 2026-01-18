
import React, { useState, useEffect, useRef } from 'react';
import { StockExplanation, MarketStatus, User } from '../types';
import ExplanationCard from './ExplanationCard';

interface ExplanationDisplayProps {
  data: StockExplanation;
  onReset: () => void;
  marketStatus: MarketStatus | null;
  user: User | null;
  onOpenPricing: () => void;
}

const AnimatedSection: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref} 
      className={`opacity-initial ${isVisible ? 'reveal-animation' : ''} ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
};

const ExplanationDisplay: React.FC<ExplanationDisplayProps> = ({ data, onReset, marketStatus, user, onOpenPricing }) => {
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Medium': return 'bg-slate-200 text-slate-700 border-slate-300';
      case 'Low': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const getDirectionStyles = (dir: string) => {
    switch (dir) {
      case 'up': return 'text-blue-700 bg-blue-50 border-blue-100';
      case 'down': return 'text-slate-700 bg-slate-50 border-slate-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const isClosed = marketStatus?.status === 'CLOSED';
  const timeLabel = isClosed ? "yesterday (last session)" : "today";
  const shareBaseText = `Why did ${data.stockName} move ${timeLabel}? It moved ${data.priceChange} ${data.direction === 'up' ? '↑' : data.direction === 'down' ? '↓' : ''}. Summary: "${data.oneLineSummary}"`;

  const handleNativeShare = async () => {
    const shareText = `${shareBaseText}\n\nExplained by WhyDidItMove. No advice provided.`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data.stockName} Movement Explanation`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.debug('Share failed or dismissed', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setShowCopyFeedback(true);
        setTimeout(() => setShowCopyFeedback(false), 2000);
      } catch (err) {
        console.error('Clipboard failed', err);
      }
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${shareBaseText}\n\nRead more: ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(shareBaseText);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Stock Movement Explanation: ${data.stockName}`);
    const body = encodeURIComponent(`${shareBaseText}\n\nLink: ${window.location.href}\n\nDisclaimer: Educational purpose only.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const isPremiumUser = user?.isPremium || false;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 pb-24">
      <AnimatedSection className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-10">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-black text-[10px] md:text-xs uppercase tracking-widest"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          New Analysis
        </button>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mr-2 hidden sm:block">Share Audit</span>
           
           <button
            onClick={handleWhatsAppShare}
            className="flex items-center justify-center w-10 h-10 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl transition-all shadow-sm hover:shadow-md"
            title="Share on WhatsApp"
          >
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.628 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </button>

          <button
            onClick={handleTwitterShare}
            className="flex items-center justify-center w-10 h-10 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all shadow-sm hover:shadow-md"
            title="Share on X (Twitter)"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </button>

          <button
            onClick={handleEmailShare}
            className="flex items-center justify-center w-10 h-10 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-xl transition-all shadow-sm hover:shadow-md"
            title="Share via Email"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>

          <button
            onClick={handleNativeShare}
            className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {showCopyFeedback ? 'Copied' : 'More Options'}
          </button>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1} className="mb-10 md:mb-12 text-center md:text-left">
        {isClosed && (
          <div className="mb-6 md:mb-8 inline-flex items-center gap-3 px-4 py-2 bg-slate-100 border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Market Closed: {marketStatus?.reason || "Non-trading session"}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6 md:mb-8">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-tight">{data.stockName}</h2>
          <div className={`inline-flex items-center self-center md:self-auto px-4 py-1.5 rounded-xl text-lg md:text-xl font-black border shadow-sm ${getDirectionStyles(data.direction)}`}>
            {data.priceChange} {data.direction === 'up' ? '↑' : data.direction === 'down' ? '↓' : '—'}
          </div>
        </div>
        
        <div className="bg-white border-l-4 border-slate-900 p-5 md:p-6 rounded-r-2xl shadow-sm mb-10 md:mb-12">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">One-Line Technical Logic</div>
          <p className="text-lg md:text-xl text-slate-800 font-bold leading-tight italic">
            "{data.oneLineSummary}"
          </p>
        </div>
      </AnimatedSection>

      <div className="grid gap-6 mb-10 md:mb-12">
        <ExplanationCard
          index={1}
          title="Market Context"
          content={data.cards.marketContext}
          footerLink={{
            label: "View Live NSE Index Data",
            url: "https://www.nseindia.com/market-data/live-equity-market?symbol=NIFTY%2050"
          }}
        />
        <ExplanationCard
          index={2}
          title="Sector Performance"
          content={data.cards.sectorPerformance}
        />
        <ExplanationCard
          index={3}
          title="News Impact"
          content={data.cards.newsImpact.text}
          badge={data.cards.newsImpact.impact}
          badgeColor={getImpactColor(data.cards.newsImpact.impact)}
          sentiment={data.cards.newsImpact.sentiment}
          footerLink={data.cards.newsImpact.url ? {
            label: "Read Original News Source",
            url: data.cards.newsImpact.url
          } : undefined}
        />
        <ExplanationCard
          index={4}
          title="Trading Activity"
          content={data.cards.tradingActivity}
          chartData={data.historicalPrices}
        />
        
        {/* ENHANCED Premium Insight Card */}
        <div className="relative overflow-hidden p-6 md:p-8 bg-slate-50 rounded-3xl border border-slate-200 group transition-all hover:bg-white hover:shadow-xl">
          <div className="absolute top-0 right-0 px-4 md:px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] rounded-bl-2xl shadow-lg animate-pulse">
             Pro Logic Analysis
          </div>
          <h3 className="text-base md:text-lg font-black text-slate-800 mb-6 uppercase tracking-tight flex items-center gap-3">
             <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
             </div>
             Deep-Dive Flow & Data Audit
          </h3>
          
          {isPremiumUser ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-1000">
               <p className="text-sm md:text-base text-slate-600 leading-relaxed font-medium">
                {data.premiumInsight || "Analyzing specific order book fluctuations, FII/DII block deal trends, and session-specific liquidity nodes..."}
              </p>
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                 <div className="flex flex-col">
                   <span className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest">Logic Tier</span>
                   <span className="text-[10px] md:text-xs font-bold text-blue-600">Institutional Grade</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest">Confidence</span>
                   <span className="text-[10px] md:text-xs font-bold text-emerald-600">High (Factual)</span>
                 </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-6 md:py-8">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 flex items-center justify-center text-slate-300 mb-6 shadow-xl relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-[7px] md:text-[8px] font-black">PRO</div>
              </div>
              <p className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-2">Unlock FII/DII Data & Order Book Logic</p>
              <p className="text-xs font-medium text-slate-400 mb-8 max-w-[280px]">Basic accounts see general news. Pro members see the <span className="text-blue-600 font-bold">institutional drivers</span> behind the move.</p>
              
              <div className="grid grid-cols-2 gap-4 w-full max-w-xs md:max-w-sm mb-8">
                 <div className="p-3 bg-white border border-slate-100 rounded-2xl">
                    <span className="text-[8px] md:text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1 block">Basic Pro</span>
                    <span className="text-base md:text-lg font-black text-slate-900">₹99</span>
                 </div>
                 <div className="p-3 bg-slate-900 rounded-2xl text-white">
                    <span className="text-[8px] md:text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 block">Ultra Pro</span>
                    <span className="text-base md:text-lg font-black text-white">₹199</span>
                 </div>
              </div>

              <button 
                onClick={onOpenPricing}
                className="w-full py-4 bg-blue-600 text-white text-[10px] md:text-[11px] font-black rounded-2xl hover:bg-blue-700 transition-all uppercase tracking-widest shadow-xl shadow-blue-500/20"
              >
                Upgrade & Reveal Premium Logic
              </button>
            </div>
          )}
        </div>

        <ExplanationCard
          index={5}
          title="Historical Pattern"
          content={data.cards.historicalPattern}
        />
      </div>

      <AnimatedSection delay={0.6} className="p-6 md:p-8 bg-slate-900 rounded-3xl text-white shadow-xl mb-10 md:mb-12">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Final Technical Takeaway</h4>
        <p className="text-lg md:text-xl font-bold leading-snug">
          {data.finalTakeaway}
        </p>
      </AnimatedSection>

      {data.sources.length > 0 && (
        <AnimatedSection delay={0.8} className="p-6 md:p-8 border-t border-slate-200">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Verified Data Sources</h4>
          <ul className="space-y-4">
            {data.sources.slice(0, 3).map((source, idx) => (
              <li key={idx} className="flex items-center gap-4 group">
                <span className="shrink-0 w-2 h-2 rounded-full bg-slate-200 group-hover:bg-blue-600 transition-colors"></span>
                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors underline decoration-slate-100 underline-offset-8">
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </AnimatedSection>
      )}
    </div>
  );
};

export default ExplanationDisplay;
