
import React, { useState, useEffect } from 'react';
import { AppState, StockExplanation, UserProfile, DiscoveryResult, User, PortfolioHolding, YesterdayPulse, ComparisonResult } from './types';
import { fetchStockExplanation, checkMarketStatus, fetchDiscoverySuggestions, fetchRebalancingSuggestions, fetchYesterdayPulse, fetchComparison } from './services/geminiService';
import SearchHero from './components/SearchHero';
import ExplanationDisplay from './components/ExplanationDisplay';
import DiscoveryHero from './components/DiscoveryHero';
import DiscoveryResultDisplay from './components/DiscoveryResultDisplay';
import RebalancerHero from './components/RebalancerHero';
import RebalancerResultDisplay from './components/RebalancerResultDisplay';
import CompareHero from './components/CompareHero';
import CompareResultDisplay from './components/CompareResultDisplay';
import SignupModal from './components/SignupModal';
import LoginModal from './components/LoginModal';
import PricingModal from './components/PricingModal';
import Footer from './components/Footer';

const STORAGE_KEY_COUNT = 'wdim_search_count';
const STORAGE_KEY_DATE = 'wdim_last_search_date';
const STORAGE_KEY_USER = 'wdim_user_session';

const GUEST_LIMIT = 2;
const BASIC_PRO_LIMIT = 10;
const ULTRA_PRO_LIMIT = 9999; // Essentially unlimited

const LOADING_STEPS = [
  "Connecting to NSE/BSE secure data feeds...",
  "Retrieving session-specific price action...",
  "Scanning exchange filings & corporate actions...",
  "Isolating sentiment drivers & sector trends...",
  "Cross-referencing high-volume nodes...",
  "Applying premium logic for factual audit...",
  "Finalizing your movement explanation..."
];

const DISCOVERY_LOADING_STEPS = [
  "Analyzing risk-to-savings ratios...",
  "Filtering symbols for capital protection...",
  "Reviewing fundamentals & debt logic...",
  "Quantifying horizon-based mismatch risks...",
  "Curating educational study cases...",
  "Formatting your personalized discovery report...",
  "Audit complete. Finalizing..."
];

const REBALANCER_LOADING_STEPS = [
  "Mapping current asset allocation weights...",
  "Auditing sector-specific concentration...",
  "Evaluating diversification health scores...",
  "Applying conservative rebalancing logic...",
  "Identifying potential risk imbalances...",
  "Drafting educational suggestions...",
  "Finalizing your balance audit..."
];

const COMPARE_LOADING_STEPS = [
  "Fetching comparative liquidity snapshots...",
  "Analyzing divergent news catalysts...",
  "Syncing cross-symbol historical trends...",
  "Mapping sector-wide sentiment shifts...",
  "Benchmarking relative volatility scores...",
  "Applying premium multi-symbol logic...",
  "Finalizing side-by-side comparison..."
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    mode: 'explainer',
    searchQuery: '',
    loading: false,
    explanation: null,
    comparisonResult: null,
    discoveryResult: null,
    rebalancingResult: null,
    yesterdayPulse: null,
    error: null,
    searchCount: 0,
    marketStatus: null,
    user: null,
    isSignupModalOpen: false,
    isLoginModalOpen: false,
    isPricingModalOpen: false
  });

  const [lastHoldings, setLastHoldings] = useState<PortfolioHolding[]>([]);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);

  const getSearchLimit = () => {
    if (!state.user?.isLoggedIn) return GUEST_LIMIT;
    if (state.user?.isPremium) return ULTRA_PRO_LIMIT;
    return BASIC_PRO_LIMIT;
  };

  useEffect(() => {
    // Auth Initialization
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (savedUser) {
      try {
        setState(prev => ({ ...prev, user: JSON.parse(savedUser) }));
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    }

    // Daily Limit Logic
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem(STORAGE_KEY_DATE);
    let count = parseInt(localStorage.getItem(STORAGE_KEY_COUNT) || '0', 10);

    if (lastDate !== today) {
      count = 0;
      localStorage.setItem(STORAGE_KEY_DATE, today);
      localStorage.setItem(STORAGE_KEY_COUNT, '0');
    }

    setState(prev => ({ ...prev, searchCount: count }));

    // Initial Data Fetch
    const todayFull = new Date().toLocaleDateString('en-IN', { dateStyle: 'full' });

    const initData = async () => {
      try {
        const [mStatus, pulse] = await Promise.all([
          checkMarketStatus(todayFull),
          fetchYesterdayPulse()
        ]);
        setState(prev => ({ ...prev, marketStatus: mStatus, yesterdayPulse: pulse }));
      } catch (err) {
        console.error("Initialization failed", err);
      }
    };

    initData();
  }, []);

  useEffect(() => {
    let interval: number;
    const steps = state.mode === 'explainer' ? LOADING_STEPS :
      state.mode === 'discovery' ? DISCOVERY_LOADING_STEPS :
        state.mode === 'compare' ? COMPARE_LOADING_STEPS :
          REBALANCER_LOADING_STEPS;

    if (state.loading) {
      setLoadingStepIdx(0);
      interval = window.setInterval(() => {
        setLoadingStepIdx(prev => (prev + 1) % steps.length);
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [state.loading, state.mode]);

  const handleSignup = (user: User) => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    setState(prev => ({ ...prev, user, isSignupModalOpen: false }));
  };

  const handleLogin = (user: User) => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    setState(prev => ({ ...prev, user, isLoginModalOpen: false }));
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    setState(prev => ({ ...prev, user: null }));
  };

  const handleUpgrade = (plan: 'Pro' | 'Ultra') => {
    if (state.user) {
      const updatedUser = { ...state.user, isPremium: true };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
      setState(prev => ({ ...prev, user: updatedUser, isPricingModalOpen: false }));
    } else {
      setState(prev => ({ ...prev, isPricingModalOpen: false, isSignupModalOpen: true }));
    }
  };

  const incrementCount = () => {
    const newCount = state.searchCount + 1;
    localStorage.setItem(STORAGE_KEY_COUNT, newCount.toString());
    return newCount;
  };

  const handleSearch = async (query: string) => {
    const limit = getSearchLimit();
    if (state.searchCount >= limit) return;

    if (state.marketStatus?.status === 'CLOSED') {
      setState(prev => ({ ...prev, error: `The market is closed for ${state.marketStatus?.reason}. No movements to explain today.` }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null, searchQuery: query }));
    try {
      const result = await fetchStockExplanation(query);
      const newCount = incrementCount();
      setState(prev => ({ ...prev, explanation: result, loading: false, searchCount: newCount }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error("Explanation Error:", err);
      let msg = err.message || "Unknown Error";
      if (msg.includes("429") || msg.includes("Quota")) {
        msg = "Daily API Quota Exceeded. Please wait a minute or try again tomorrow.";
      }
      setState(prev => ({ ...prev, loading: false, error: `Audit Failed: ${msg}` }));
    }
  };

  const handleComparison = async (stockA: string, stockB: string) => {
    const limit = getSearchLimit();
    if (state.searchCount >= limit) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await fetchComparison(stockA, stockB);
      const newCount = incrementCount();
      setState(prev => ({ ...prev, comparisonResult: result, loading: false, searchCount: newCount }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: "Comparison Audit Interrupted. Ensure symbols are NSE/BSE listed." }));
    }
  };

  const handleDiscovery = async (profile: UserProfile) => {
    const limit = getSearchLimit();
    if (state.searchCount >= limit) return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await fetchDiscoverySuggestions(profile);
      const newCount = incrementCount();
      setState(prev => ({ ...prev, discoveryResult: result, loading: false, searchCount: newCount }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: "Discovery Study Failed. Please try again later." }));
    }
  };

  const handleRebalance = async (profile: UserProfile, holdings: PortfolioHolding[]) => {
    const limit = getSearchLimit();
    if (state.searchCount >= limit) return;
    setLastHoldings(holdings);
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await fetchRebalancingSuggestions(profile, holdings);
      const newCount = incrementCount();
      setState(prev => ({ ...prev, rebalancingResult: result, loading: false, searchCount: newCount }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: "Rebalancing Logic Analysis Failed." }));
    }
  };

  const handleReset = () => {
    setState(prev => ({ ...prev, explanation: null, comparisonResult: null, discoveryResult: null, rebalancingResult: null, error: null, searchQuery: '' }));
  };

  const switchMode = (mode: AppState['mode']) => {
    if (state.loading) return;
    setState(prev => ({ ...prev, mode, explanation: null, comparisonResult: null, discoveryResult: null, rebalancingResult: null, error: null, searchQuery: '' }));
  };

  const limit = getSearchLimit();
  const remaining = limit - state.searchCount;

  const currentLoadingSteps = state.mode === 'explainer' ? LOADING_STEPS :
    state.mode === 'discovery' ? DISCOVERY_LOADING_STEPS :
      state.mode === 'compare' ? COMPARE_LOADING_STEPS :
        REBALANCER_LOADING_STEPS;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <nav className="p-5 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-8">
            <h1
              onClick={() => switchMode('explainer')}
              className="text-xl font-black text-slate-900 tracking-tighter cursor-pointer uppercase"
            >
              WhyDidItMove<span className="text-blue-600">.</span>
            </h1>

            <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
              {(['explainer', 'compare', 'discovery', 'rebalancer'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${state.mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {m === 'explainer' ? 'Movement Audit' : m === 'compare' ? 'Compare' : m === 'discovery' ? 'Discovery' : 'Rebalancer'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {state.user?.isLoggedIn ? (
              <div className="flex items-center gap-4">
                {!state.user.isPremium && (
                  <button
                    onClick={() => setState(prev => ({ ...prev, isPricingModalOpen: true }))}
                    className="px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-black rounded-xl hover:bg-blue-100 transition-all uppercase tracking-widest border border-blue-200"
                  >
                    Go Pro
                  </button>
                )}
                <div className="hidden sm:flex flex-col items-end">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${state.user.isPremium ? 'text-blue-600' : 'text-slate-400'}`}>
                    {state.user.isPremium ? 'Ultra Member' : 'Active Member'}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{state.user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setState(prev => ({ ...prev, isLoginModalOpen: true }))}
                  className="px-4 py-2 text-xs font-black text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-widest"
                >
                  Log In
                </button>
                <button
                  onClick={() => setState(prev => ({ ...prev, isSignupModalOpen: true }))}
                  className="px-6 py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800 transition-all uppercase tracking-widest shadow-lg shadow-slate-900/10"
                >
                  Join Pro
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-center gap-1 mt-4 overflow-x-auto pb-2 scrollbar-none">
          {(['explainer', 'compare', 'discovery', 'rebalancer'] as const).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${state.mode === m ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}
            >
              {m === 'explainer' ? 'Audit' : m === 'compare' ? 'Compare' : m === 'discovery' ? 'Discovery' : 'Rebalance'}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-grow">
        {state.loading ? (
          <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
            <div className="relative w-24 h-24 mb-12">
              <div className="absolute inset-0 border-8 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div className="max-w-sm text-center">
              <p className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-4 animate-pulse">
                Auditing System
              </p>
              <div className="h-12 overflow-hidden relative">
                <p key={loadingStepIdx} className="text-sm font-bold text-slate-400 italic animate-in slide-in-from-bottom-2 duration-500">
                  {currentLoadingSteps[loadingStepIdx]}
                </p>
              </div>
            </div>
          </div>
        ) : state.error ? (
          <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
            <div className="w-20 h-20 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-rose-500 mb-8 border border-rose-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Audit Failed</h3>
            <p className="text-slate-500 font-medium mb-8 max-w-md text-center">{state.error}</p>
            <button
              onClick={handleReset}
              className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all uppercase tracking-widest text-xs"
            >
              Back to Start
            </button>
          </div>
        ) : state.explanation ? (
          <ExplanationDisplay
            data={state.explanation}
            onReset={handleReset}
            marketStatus={state.marketStatus}
            user={state.user}
            onOpenPricing={() => setState(prev => ({ ...prev, isPricingModalOpen: true }))}
          />
        ) : state.comparisonResult ? (
          <CompareResultDisplay data={state.comparisonResult} onReset={handleReset} />
        ) : state.discoveryResult ? (
          <DiscoveryResultDisplay data={state.discoveryResult} onReset={handleReset} />
        ) : state.rebalancingResult ? (
          <RebalancerResultDisplay data={state.rebalancingResult} holdings={lastHoldings} onReset={handleReset} />
        ) : (
          <>
            {state.mode === 'explainer' && (
              <SearchHero
                onSearch={handleSearch}
                disabled={remaining <= 0}
                remainingSearches={remaining}
                pulse={state.yesterdayPulse}
                onUpgradeClick={() => setState(prev => ({ ...prev, isPricingModalOpen: true }))}
              />
            )}
            {state.mode === 'compare' && (
              <CompareHero onSearch={handleComparison} disabled={remaining <= 0} />
            )}
            {state.mode === 'discovery' && (
              <DiscoveryHero onSearch={handleDiscovery} disabled={remaining <= 0} />
            )}
            {state.mode === 'rebalancer' && (
              <RebalancerHero onSearch={handleRebalance} disabled={remaining <= 0} />
            )}
          </>
        )}
      </main>

      <Footer />

      {state.isSignupModalOpen && (
        <SignupModal
          onClose={() => setState(prev => ({ ...prev, isSignupModalOpen: false }))}
          onSignup={handleSignup}
          onSwitchToLogin={() => setState(prev => ({ ...prev, isSignupModalOpen: false, isLoginModalOpen: true }))}
        />
      )}

      {state.isLoginModalOpen && (
        <LoginModal
          onClose={() => setState(prev => ({ ...prev, isLoginModalOpen: false }))}
          onLogin={handleLogin}
          onSwitchToSignup={() => setState(prev => ({ ...prev, isLoginModalOpen: false, isSignupModalOpen: true }))}
        />
      )}

      {state.isPricingModalOpen && (
        <PricingModal
          onClose={() => setState(prev => ({ ...prev, isPricingModalOpen: false }))}
          onUpgrade={handleUpgrade}
        />
      )}
    </div>
  );
};

export default App;
