
import React, { useState } from 'react';
import { ComparisonResult } from '../types';
import ExplanationCard from './ExplanationCard';

interface CompareResultDisplayProps {
  data: ComparisonResult;
  onReset: () => void;
}

const CompareResultDisplay: React.FC<CompareResultDisplayProps> = ({ data, onReset }) => {
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  const handleShare = async () => {
    const shareText = `Comparison Audit: ${data.stockA.stockName} vs ${data.stockB.stockName}\n\nSummary: ${data.comparisonSummary}\n\nExplained by WhyDidItMove.`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Audit: ${data.stockA.stockName} vs ${data.stockB.stockName}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.debug('Share failed', err);
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

  const renderStockHeader = (stock: any) => (
    <div className="mb-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{stock.stockName}</h2>
          <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-xl text-lg font-black border ${
            stock.direction === 'up' ? 'text-blue-700 bg-blue-50 border-blue-100' : 'text-slate-700 bg-slate-50 border-slate-100'
          }`}>
            {stock.priceChange} {stock.direction === 'up' ? '↑' : '↓'}
          </div>
        </div>
      </div>
      <p className="text-sm font-bold text-slate-500 italic">"{stock.oneLineSummary}"</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center mb-10">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-black text-xs uppercase tracking-widest"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          New Comparison
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all font-bold text-xs uppercase tracking-widest relative"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {showCopyFeedback ? 'Copied' : 'Share Audit'}
        </button>
      </div>

      <header className="mb-12">
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Audit Executive Summary</h3>
            <p className="text-xl md:text-2xl font-bold leading-snug">
              {data.comparisonSummary}
            </p>
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Stock A column */}
        <div className="space-y-8">
          {renderStockHeader(data.stockA)}
          <div className="space-y-6">
            <ExplanationCard
              index={1}
              title="Market Context"
              content={data.stockA.cards.marketContext}
            />
            <ExplanationCard
              index={2}
              title="News Impact"
              content={data.stockA.cards.newsImpact.text}
              badge={data.stockA.cards.newsImpact.impact}
              sentiment={data.stockA.cards.newsImpact.sentiment}
            />
            <ExplanationCard
              index={3}
              title="Trading Activity"
              content={data.stockA.cards.tradingActivity}
              chartData={data.stockA.historicalPrices}
            />
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Takeaway A</h4>
              <p className="text-sm font-bold text-slate-800">{data.stockA.finalTakeaway}</p>
            </div>
          </div>
        </div>

        {/* Stock B column */}
        <div className="space-y-8">
          {renderStockHeader(data.stockB)}
          <div className="space-y-6">
            <ExplanationCard
              index={1}
              title="Market Context"
              content={data.stockB.cards.marketContext}
            />
            <ExplanationCard
              index={2}
              title="News Impact"
              content={data.stockB.cards.newsImpact.text}
              badge={data.stockB.cards.newsImpact.impact}
              sentiment={data.stockB.cards.newsImpact.sentiment}
            />
            <ExplanationCard
              index={3}
              title="Trading Activity"
              content={data.stockB.cards.tradingActivity}
              chartData={data.stockB.historicalPrices}
            />
             <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Takeaway B</h4>
              <p className="text-sm font-bold text-slate-800">{data.stockB.finalTakeaway}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareResultDisplay;
