
import React, { useEffect, useRef, useState } from 'react';

interface ExplanationCardProps {
  index: number;
  title: string;
  content: string;
  badge?: string;
  badgeColor?: string;
  sentiment?: 'Positive' | 'Negative' | 'Neutral';
  chartData?: number[];
  footerLink?: {
    label: string;
    url: string;
  };
}

const Sparkline: React.FC<{ data: number[] }> = ({ data }) => {
  if (!data || data.length < 2) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const padding = (max - min) * 0.1 || 1;
  const range = (max - min) + (padding * 2);
  
  const width = 120;
  const height = 30;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (((val - (min - padding)) / range) * height);
    return `${x},${y}`;
  }).join(' ');

  const isUp = data[data.length - 1] >= data[0];

  return (
    <div className="flex flex-col items-end shrink-0">
      <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1.5">7D Trend</div>
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={isUp ? '#2563eb' : '#64748b'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <circle 
          cx={width} 
          cy={height - (((data[data.length-1] - (min - padding)) / range) * height)} 
          r="2.5" 
          fill={isUp ? '#2563eb' : '#64748b'} 
        />
      </svg>
    </div>
  );
};

const ExplanationCard: React.FC<ExplanationCardProps> = ({ index, title, content, badge, badgeColor, sentiment, chartData, footerLink }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getSentimentStyles = (sent?: string) => {
    switch (sent) {
      case 'Positive': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Negative': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Neutral': return 'bg-slate-50 text-slate-500 border-slate-100';
      default: return 'hidden';
    }
  };

  const getSentimentIcon = (sent?: string) => {
    switch (sent) {
      case 'Positive': return (
        <svg className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.4503-.385l-7 3.5a1 1 0 00-.547.894v7.006a1 1 0 00.547.894l7 3.5a1 1 0 001.4503-.385l2-4a1 1 0 00-.131-1.12l-1.32-1.32a4.001 4.001 0 110-5.656l1.32-1.32a1 1 0 00.131-1.12l-2-4z" clipRule="evenodd" />
        </svg>
      );
      case 'Negative': return (
        <svg className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
      case 'Neutral': return (
        <svg className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      );
      default: return null;
    }
  };

  return (
    <div 
      ref={cardRef}
      className={`bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden opacity-initial ${isVisible ? 'reveal-animation' : ''}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 md:mb-5">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-900 text-white text-xs md:text-sm font-bold shadow-sm">
            {index}
          </span>
          <h3 className="font-bold text-slate-900 uppercase tracking-tight text-xs md:text-sm">{title}</h3>
        </div>
        <div className="flex items-start justify-between sm:justify-end gap-4 w-full sm:w-auto">
          {chartData && <Sparkline data={chartData} />}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {badge && (
              <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-wider border shadow-sm ${badgeColor || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-current opacity-40"></span>
                {badge} Impact
              </span>
            )}
            {sentiment && (
              <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-wider border shadow-sm ${getSentimentStyles(sentiment)}`}>
                {getSentimentIcon(sentiment)}
                {sentiment}
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="text-slate-600 leading-relaxed text-sm md:text-base mb-4 font-medium">
        {content}
      </p>
      {footerLink && (
        <div className="pt-4 border-t border-slate-50">
          <a 
            href={footerLink.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors"
          >
            {footerLink.label}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
};

export default ExplanationCard;
