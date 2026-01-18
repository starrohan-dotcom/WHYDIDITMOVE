
import React, { useState } from 'react';

interface CompareHeroProps {
  onSearch: (stockA: string, stockB: string) => void;
  disabled: boolean;
}

const CompareHero: React.FC<CompareHeroProps> = ({ onSearch, disabled }) => {
  const [stockA, setStockA] = useState('');
  const [stockB, setStockB] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stockA.trim() && stockB.trim() && !disabled) {
      onSearch(stockA.trim(), stockB.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12 text-center animate-in fade-in duration-500">
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight uppercase">
        Compare Audit
      </h1>
      <p className="text-lg text-slate-500 mb-10 max-w-lg leading-relaxed font-medium">
        Side-by-side movement analysis of two Indian stocks. Discover divergences in logic.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white p-8 rounded-3xl border border-slate-100 shadow-xl text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock A</label>
            <input
              type="text"
              required
              value={stockA}
              onChange={(e) => setStockA(e.target.value)}
              placeholder="e.g. RELIANCE"
              className="w-full px-6 py-4 border-2 border-slate-100 rounded-2xl focus:border-slate-900 focus:outline-none transition-all font-bold uppercase"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock B</label>
            <input
              type="text"
              required
              value={stockB}
              onChange={(e) => setStockB(e.target.value)}
              placeholder="e.g. TCS"
              className="w-full px-6 py-4 border-2 border-slate-100 rounded-2xl focus:border-slate-900 focus:outline-none transition-all font-bold uppercase"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled || !stockA.trim() || !stockB.trim()}
          className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none uppercase tracking-widest"
        >
          {disabled ? 'LOCKED' : 'Generate Comparison Audit'}
        </button>
        
        <p className="mt-6 text-[9px] text-slate-400 text-center uppercase tracking-[0.2em] font-black">
          Consumes 1 Audit Credit • NSE/BSE Symbols Only
        </p>
      </form>

      <div className="mt-12 flex flex-wrap justify-center gap-3">
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest w-full mb-2">Common Pairings</span>
        {[
          ['RELIANCE', 'TCS'],
          ['HDFCBANK', 'ICICIBANK'],
          ['ZOMATO', 'SWIGGY'],
          ['INFY', 'WIPRO']
        ].map(([a, b]) => (
          <button 
            key={`${a}-${b}`}
            onClick={() => { setStockA(a); setStockB(b); }}
            className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-500 hover:bg-white hover:border-slate-900 hover:text-slate-900 transition-all"
          >
            {a} vs {b}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CompareHero;
