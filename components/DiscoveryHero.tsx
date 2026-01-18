
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface DiscoveryHeroProps {
  onSearch: (profile: UserProfile) => void;
  disabled: boolean;
}

const DiscoveryHero: React.FC<DiscoveryHeroProps> = ({ onSearch, disabled }) => {
  const [profile, setProfile] = useState<UserProfile>({
    monthlyIncome: '',
    monthlySavings: '',
    riskTolerance: 'Medium',
    horizon: 'Medium'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.monthlyIncome && profile.monthlySavings && !disabled) {
      onSearch(profile);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12 text-center animate-in fade-in duration-500">
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
        Discovery Lab
      </h1>
      <p className="text-lg text-slate-500 mb-10 max-w-lg leading-relaxed">
        Personalized educational stock analysis based on your financial goals and risk appetite.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white p-8 rounded-3xl border border-slate-100 shadow-xl text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Monthly Income (₹)</label>
            <input
              type="number"
              required
              value={profile.monthlyIncome}
              onChange={(e) => setProfile(p => ({ ...p, monthlyIncome: e.target.value }))}
              placeholder="e.g. 50000"
              className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Monthly Savings (₹)</label>
            <input
              type="number"
              required
              value={profile.monthlySavings}
              onChange={(e) => setProfile(p => ({ ...p, monthlySavings: e.target.value }))}
              placeholder="e.g. 15000"
              className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Risk Tolerance</label>
          <div className="grid grid-cols-3 gap-3">
            {(['Low', 'Medium', 'High'] as const).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setProfile(p => ({ ...p, riskTolerance: r }))}
                className={`py-3 rounded-xl font-semibold border-2 transition-all ${profile.riskTolerance === r ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Investment Horizon</label>
          <div className="grid grid-cols-3 gap-3">
            {(['Short', 'Medium', 'Long'] as const).map(h => (
              <button
                key={h}
                type="button"
                onClick={() => setProfile(p => ({ ...p, horizon: h }))}
                className={`py-3 rounded-xl font-semibold border-2 transition-all ${profile.horizon === h ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
              >
                {h === 'Short' ? '< 1 Yr' : h === 'Medium' ? '1-3 Yrs' : '3+ Yrs'}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled || !profile.monthlyIncome || !profile.monthlySavings}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        >
          {disabled ? 'Limit Reached' : 'Analyze Profile & Suggest'}
        </button>
        
        <p className="mt-4 text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">
          Educational Purpose Only • No Advice
        </p>
      </form>
    </div>
  );
};

export default DiscoveryHero;
