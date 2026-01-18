
import React, { useState } from 'react';
import { DiscoveryResult } from '../types';

interface DiscoveryResultDisplayProps {
  data: DiscoveryResult;
  onReset: () => void;
}

const DiscoveryResultDisplay: React.FC<DiscoveryResultDisplayProps> = ({ data, onReset }) => {
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  const handleShare = async () => {
    const shareText = `My Discovery Lab Strategy Analysis:\n\n${data.profileAnalysis}\n\nSuggested Stocks: ${data.suggestedStocks.map(s => s.name).join(', ')}\n\nPowered by WhyDidItMove. No financial advice.`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Investment Discovery Analysis',
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center mb-10">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Re-analyze profile
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all font-bold text-xs uppercase tracking-widest relative"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {showCopyFeedback ? 'Copied' : 'Share Strategy'}
        </button>
      </div>

      <header className="mb-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Your Strategy Analysis</h2>
        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-2xl shadow-sm">
          <p className="text-blue-900 font-medium leading-relaxed">
            {data.profileAnalysis}
          </p>
        </div>
      </header>

      <div className="space-y-8">
        {data.suggestedStocks.map((stock, idx) => (
          <div key={idx} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden border-t-4 border-t-slate-900">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{stock.name}</h3>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stock.ticker}</span>
                </div>
                <div className="bg-slate-100 px-4 py-1.5 rounded-full text-xs font-bold text-slate-600 uppercase">
                  Learning Case #{idx + 1}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      Reasoning
                    </h4>
                    <p className="text-slate-600 leading-relaxed">{stock.reasoning}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      Fundamentals
                    </h4>
                    <p className="text-slate-600 leading-relaxed">{stock.fundamentals}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      News Impact
                    </h4>
                    <p className="text-slate-600 leading-relaxed">{stock.newsImpact}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-rose-800 mb-1 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                      Key Risks
                    </h4>
                    <p className="text-slate-600 leading-relaxed italic">{stock.risks}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Analysis focus for you</h4>
                  <p className="text-slate-700 text-sm font-medium">{stock.learningFocus}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-amber-50 rounded-2xl border border-amber-100 text-amber-900 text-xs leading-relaxed text-center">
        <strong>Remember:</strong> These suggestions are generated by AI for educational analysis and comparison. This is not financial advice. Indian markets are subject to high volatility. Always do independent research before any financial commitment.
      </div>
    </div>
  );
};

export default DiscoveryResultDisplay;
