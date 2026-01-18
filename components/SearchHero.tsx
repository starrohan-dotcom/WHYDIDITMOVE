
import React, { useState } from 'react';
import { YesterdayPulse } from '../types';

interface SearchHeroProps {
  onSearch: (query: string) => void;
  disabled: boolean;
  remainingSearches: number;
  pulse: YesterdayPulse | null;
  onUpgradeClick?: () => void;
}

const SearchHero: React.FC<SearchHeroProps> = ({ onSearch, disabled, remainingSearches, pulse, onUpgradeClick }) => {
  const [query, setQuery] = useState('');
  const [pulseCopyFeedback, setPulseCopyFeedback] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !disabled) {
      onSearch(query.trim());
    }
  };

  const handlePulseShare = async () => {
    if (!pulse) return;
    const text = `Yesterday's Market Pulse:\nNifty 50: ${pulse.nifty.change} ${pulse.nifty.direction === 'up' ? '↑' : '↓'}\nSensex: ${pulse.sensex.change} ${pulse.sensex.direction === 'up' ? '↑' : '↓'}\nTop Sector: ${pulse.topSector}\nStory: ${pulse.topStory}\n\nExplaining the moves on WhyDidItMove.`;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Indian Market Pulse', text, url });
      } catch (err) { console.debug(err); }
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setPulseCopyFeedback(true);
      setTimeout(() => setPulseCopyFeedback(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center animate-in fade-in duration-700 py-12">
      <div className="mb-8">
        <h1 className="text-4xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter uppercase leading-none">
          Why did it move?
        </h1>
        <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-lg mx-auto leading-relaxed font-medium">
          Premium Indian market explanation engine. Objective, factual, and jargon-free.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xl mb-12">
        <div className="relative group mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Symbol (e.g. RELIANCE, ZOMATO)"
            disabled={disabled}
            className={`w-full px-8 py-6 text-xl border-2 rounded-3xl focus:outline-none transition-all shadow-xl font-bold uppercase tracking-tight
              ${disabled 
                ? 'bg-slate-50 border-slate-100 cursor-not-allowed text-slate-300 shadow-none' 
                : 'border-slate-100 bg-white focus:border-slate-900 group-hover:border-slate-300'
              }`}
          />
          <button
            type="submit"
            disabled={disabled || !query.trim()}
            className="absolute right-3 top-3 bottom-3 px-6 md:px-10 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 text-sm md:text-base"
          >
            {disabled ? 'LOCKED' : 'AUDIT'}
          </button>
        </div>

        {disabled ? (
          <div className="inline-flex flex-col items-center gap-4 p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] text-slate-700 shadow-sm animate-in zoom-in duration-500 w-full">
            <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-center mb-4">
              <p className="font-black text-xl uppercase tracking-tighter text-slate-900">Access Limit Reached</p>
              <p className="text-sm font-medium text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
                To maintain a high-quality audit engine, free access is limited. 
                <span className="block mt-1 font-bold text-slate-900 italic">Premium unlocks unlimited credits and institutional logic.</span>
              </p>
            </div>
            <button 
              type="button"
              onClick={onUpgradeClick}
              className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all uppercase tracking-widest text-xs shadow-lg shadow-slate-900/20"
            >
              Get Premium Access (from ₹99)
            </button>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              30-Day Access • No Auto-Renewal • Factual Audits
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${remainingSearches <= 2 ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`}>
               {remainingSearches > 1000 ? 'Unlimited' : remainingSearches} Audit Credits Remaining
            </div>
            {remainingSearches <= 2 && remainingSearches > 0 && onUpgradeClick && (
               <button 
                type="button"
                onClick={onUpgradeClick}
                className="text-[10px] text-blue-600 font-black uppercase tracking-widest hover:underline"
               >
                 Unlock unlimited audits & institutional logic
               </button>
            )}
          </div>
        )}
      </form>

      {pulse && (
        <div className="w-full max-w-4xl mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 group">
          <div className="flex justify-between items-center mb-6">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Yesterday's Market Pulse</div>
            <button 
              onClick={handlePulseShare}
              className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {pulseCopyFeedback ? 'Link Copied' : 'Share Pulse'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">NIFTY 50</span>
              <div className={`text-2xl font-black ${pulse.nifty.direction === 'up' ? 'text-blue-600' : 'text-slate-600'}`}>
                {pulse.nifty.change} {pulse.nifty.direction === 'up' ? '↑' : '↓'}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SENSEX</span>
              <div className={`text-2xl font-black ${pulse.sensex.direction === 'up' ? 'text-blue-600' : 'text-slate-600'}`}>
                {pulse.sensex.change} {pulse.sensex.direction === 'up' ? '↑' : '↓'}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Top Sector</span>
              <div className="text-sm font-black text-slate-900 uppercase tracking-tight text-center">
                {pulse.topSector}
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-slate-50 rounded-xl text-xs font-medium text-slate-600 italic border border-slate-100">
            " {pulse.topStory} "
          </div>
        </div>
      )}
      
      <div className="flex flex-wrap justify-center gap-4">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 w-full mb-2">Popular Explanations</span>
        {['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ZOMATO'].map(s => (
          <button 
            key={s} 
            onClick={() => !disabled && setQuery(s)}
            className="text-[11px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest px-4 py-2 border border-slate-100 rounded-xl hover:border-slate-900 transition-all hover:bg-white hover:shadow-md"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchHero;
