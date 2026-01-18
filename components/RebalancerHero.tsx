
import React, { useState } from 'react';
import { UserProfile, PortfolioHolding } from '../types';

interface RebalancerHeroProps {
  onSearch: (profile: UserProfile, holdings: PortfolioHolding[]) => void;
  disabled: boolean;
}

const RebalancerHero: React.FC<RebalancerHeroProps> = ({ onSearch, disabled }) => {
  const [profile, setProfile] = useState<UserProfile>({
    monthlyIncome: '0',
    monthlySavings: '0',
    riskTolerance: 'Medium',
    horizon: 'Medium'
  });

  const [holdings, setHoldings] = useState<PortfolioHolding[]>([
    { name: '', category: 'Equity', allocation: 0 }
  ]);

  const addHolding = () => {
    setHoldings([...holdings, { name: '', category: 'Equity', allocation: 0 }]);
  };

  const removeHolding = (idx: number) => {
    setHoldings(holdings.filter((_, i) => i !== idx));
  };

  const updateHolding = (idx: number, field: keyof PortfolioHolding, value: any) => {
    const newHoldings = [...holdings];
    newHoldings[idx] = { ...newHoldings[idx], [field]: value };
    setHoldings(newHoldings);
  };

  const totalAllocation = holdings.reduce((sum, h) => sum + (Number(h.allocation) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disabled && totalAllocation > 0) {
      onSearch(profile, holdings);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12 animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Portfolio Rebalancer
        </h1>
        <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
          Educational risk analysis to help you balance your Indian stock market holdings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-3xl bg-white p-6 md:p-10 rounded-3xl border border-slate-100 shadow-xl space-y-10">
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Step 1: Your Risk Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Risk Tolerance</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Low', 'Medium', 'High'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setProfile({ ...profile, riskTolerance: r })}
                    className={`py-2 text-xs font-bold rounded-xl border-2 transition-all ${profile.riskTolerance === r ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Time Horizon</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Short', 'Medium', 'Long'] as const).map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setProfile({ ...profile, horizon: h })}
                    className={`py-2 text-xs font-bold rounded-xl border-2 transition-all ${profile.horizon === h ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step 2: Current Holdings</h3>
            <div className={`text-xs font-bold px-3 py-1 rounded-full border ${totalAllocation > 100 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
              Total: {totalAllocation}%
            </div>
          </div>
          
          <div className="space-y-4">
            {holdings.map((holding, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-3 items-start animate-in slide-in-from-left-2 duration-200">
                <input
                  type="text"
                  placeholder="Asset (e.g. Reliance, Nifty BEES)"
                  value={holding.name}
                  onChange={(e) => updateHolding(idx, 'name', e.target.value)}
                  className="flex-grow px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all text-sm"
                />
                <select
                  value={holding.category}
                  onChange={(e) => updateHolding(idx, 'category', e.target.value)}
                  className="w-full md:w-32 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all text-sm"
                >
                  <option value="Equity">Equity</option>
                  <option value="Debt">Debt</option>
                  <option value="Gold">Gold</option>
                  <option value="Cash">Cash</option>
                </select>
                <div className="flex items-center gap-2 w-full md:w-32">
                  <input
                    type="number"
                    placeholder="%"
                    max="100"
                    min="0"
                    value={holding.allocation || ''}
                    onChange={(e) => updateHolding(idx, 'allocation', Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all text-sm"
                  />
                  <span className="text-slate-400 font-bold">%</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeHolding(idx)}
                  className="p-3 text-slate-300 hover:text-rose-500 transition-colors"
                  disabled={holdings.length === 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addHolding}
            className="mt-6 flex items-center gap-2 text-blue-600 font-bold text-xs hover:text-blue-700 transition-colors px-4 py-2 bg-blue-50 rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Holding
          </button>
        </section>

        <div className="pt-6 border-t border-slate-50">
          <button
            type="submit"
            disabled={disabled || totalAllocation === 0}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            {disabled ? 'Limit Reached' : 'Analyze Rebalancing Logic'}
          </button>
          
          <p className="mt-4 text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">
            Conservative Analysis • Educational Purpose Only • No Advice
          </p>
        </div>
      </form>
    </div>
  );
};

export default RebalancerHero;
