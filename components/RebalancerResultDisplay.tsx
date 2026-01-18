
import React, { useState } from 'react';
import { RebalancingResult, PortfolioHolding } from '../types';

interface RebalancerResultDisplayProps {
  data: RebalancingResult;
  holdings: PortfolioHolding[];
  onReset: () => void;
}

const RebalancerResultDisplay: React.FC<RebalancerResultDisplayProps> = ({ data, holdings, onReset }) => {
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  const handleShare = async () => {
    const shareText = `My Portfolio Health Score: ${data.diversificationScore}/100\n\nAudit: "${data.analysis}"\n\nTop Suggestion: ${data.suggestions[0]?.title}\n\nAnalyzed on WhyDidItMove. No advice provided.`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Portfolio Rebalancing Audit',
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-100';
    if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-100';
    return 'text-rose-700 bg-rose-50 border-rose-100';
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'Equity': return 'bg-slate-900';
      case 'Debt': return 'bg-slate-500';
      case 'Gold': return 'bg-amber-400';
      case 'Cash': return 'bg-emerald-400';
      default: return 'bg-slate-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Modify portfolio data
          </button>
          
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest relative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {showCopyFeedback ? 'Copied' : 'Share Audit'}
          </button>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
          Assistant Mode: Active
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Educational Portfolio Audit</h2>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm leading-relaxed text-slate-700 border-l-4 border-l-slate-900">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Audit Analysis</div>
            <p className="font-medium italic">"{data.analysis}"</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Risk Balance Score</span>
          <div className={`text-6xl font-black w-24 h-24 flex items-center justify-center rounded-full border-4 ${getScoreColor(data.diversificationScore)} group-hover:scale-105 transition-transform duration-500`}>
            {data.diversificationScore}
          </div>
          <p className="text-[10px] text-slate-400 mt-6 text-center font-bold max-w-[120px]">Diversification health rating</p>
        </div>
      </div>

      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Asset Allocation Map</h3>
          <span className="text-[10px] text-slate-300 font-mono">NSE/BSE Context</span>
        </div>
        <div className="h-10 w-full flex rounded-2xl overflow-hidden shadow-inner bg-slate-100 border border-slate-200">
          {holdings.map((h, i) => (
            <div 
              key={i} 
              title={`${h.name}: ${h.allocation}%`}
              className={`${getCategoryColor(h.category)} h-full transition-all duration-1000 border-r border-white/10 last:border-0`}
              style={{ width: `${h.allocation}%` }}
            ></div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-6 justify-center">
          {['Equity', 'Debt', 'Gold', 'Cash'].map(cat => (
            <div key={cat} className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              <span className={`w-3 h-3 rounded-full ${getCategoryColor(cat)}`}></span>
              {cat}
            </div>
          ))}
        </div>
      </section>

      <div className="space-y-4 mb-12">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Logic-Based Rebalancing Suggestions</h3>
        <div className="grid gap-4">
          {data.suggestions.map((s, i) => (
            <div key={i} className="flex gap-5 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-xl font-black text-sm shadow-sm transition-transform group-hover:rotate-6
                ${s.type === 'Risk' ? 'bg-rose-50 text-rose-600 border border-rose-100' : s.type === 'Opportunity' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}
              `}>
                {s.type === 'Risk' ? '!' : s.type === 'Opportunity' ? '+' : '='}
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${s.type === 'Risk' ? 'bg-rose-100 text-rose-700' : s.type === 'Opportunity' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                    {s.type}
                  </span>
                  <h4 className="font-extrabold text-slate-800 text-base">{s.title}</h4>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500"></div>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-amber-400 p-1.5 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-900" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-200">Mandatory Assistant Disclaimer</span>
        </div>
        <div className="space-y-6">
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            This portfolio audit is strictly for <span className="text-white underline decoration-blue-500 underline-offset-4">educational logic analysis</span> and comparative benchmarking. WhyDidItMove and its AI assistants do not provide investment, tax, legal, or financial advice.
          </p>
          <div className="grid md:grid-cols-2 gap-6 text-[11px] font-medium text-slate-500">
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-blue-500">●</span>
                <span>No direct buy, sell, or hold instructions are provided. Suggestions focus on mathematical balance.</span>
              </div>
              <div className="flex gap-3">
                <span className="text-blue-500">●</span>
                <span>Audit treats all holdings as generic asset class representations for diversification study.</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-blue-500">●</span>
                <span>Indian markets involve substantial risk. Historical patterns do not guarantee future results.</span>
              </div>
              <div className="flex gap-3">
                <span className="text-blue-500">●</span>
                <span>Consult a SEBI-registered Investment Advisor before executing any portfolio changes.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RebalancerResultDisplay;
