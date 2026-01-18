
import React from 'react';

interface PricingModalProps {
  onClose: () => void;
  onUpgrade: (plan: 'Pro' | 'Ultra') => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ onClose, onUpgrade }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 max-h-[90vh] flex flex-col">
        <div className="p-8 md:p-12 overflow-y-auto">
          <div className="flex justify-between items-start mb-10">
            <div className="max-w-md">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">Choose Your Edge<span className="text-blue-600">.</span></h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                Empower your Indian stock market journey with AI-driven factual audits. 
                <span className="block mt-2 font-bold text-slate-900">30-day access • No auto-renewal • Easy UPI Payment</span>
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Pro Plan */}
            <div className="relative group p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-slate-300 transition-all flex flex-col h-full">
              <div className="mb-6">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-4 inline-block">Perfect for Individual Traders</span>
                <h3 className="text-2xl font-black text-slate-900">Basic Pro</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-black text-slate-900">₹99</span>
                  <span className="text-slate-400 text-sm font-bold ml-1">/ 30 days</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                {[
                  '10 Audit Credits daily (NSE/BSE)',
                  'FII / DII Flow Insights',
                  'Basic Discovery Lab access',
                  'Ad-free clean experience',
                  'Historical 7D Trend Data'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                    <svg className="h-5 w-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => onUpgrade('Pro')}
                className="w-full py-4 bg-white border-2 border-slate-200 text-slate-900 font-black rounded-2xl hover:border-slate-900 transition-all uppercase tracking-widest text-xs"
              >
                Buy 30-Day Access (₹99)
              </button>
            </div>

            {/* Ultra Plan */}
            <div className="relative group p-8 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl shadow-blue-500/10 flex flex-col h-full">
              <div className="absolute top-0 right-0 p-4">
                 <div className="animate-bounce-subtle">
                   <svg className="h-10 w-10 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                   </svg>
                 </div>
              </div>
              <div className="mb-6">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full mb-4 inline-block">Advanced Analytical Power</span>
                <h3 className="text-2xl font-black text-white">Ultra Pro</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-black text-white">₹199</span>
                  <span className="text-slate-400 text-sm font-bold ml-1">/ 30 days</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                {[
                  'Unlimited Audit Credits',
                  'Deep Order Book Analysis',
                  'Full Rebalancer Assistant',
                  'Priority Data Refreshes',
                  'Direct Expert Takeaways',
                  'Premium "WhyItMoved" Narratives'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-300">
                    <svg className="h-5 w-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => onUpgrade('Ultra')}
                className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20"
              >
                Buy 30-Day Access (₹199)
              </button>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mt-12">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 text-center">Feature Breakdown</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Features</th>
                    <th className="py-4 font-black text-slate-900 text-center">Free</th>
                    <th className="py-4 font-black text-blue-600 text-center">Basic Pro</th>
                    <th className="py-4 font-black text-slate-900 text-center">Ultra Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr>
                    <td className="py-4 font-bold text-slate-600">Daily Audit Limit</td>
                    <td className="py-4 text-center text-slate-400">2</td>
                    <td className="py-4 text-center text-slate-900">10</td>
                    <td className="py-4 text-center font-black text-slate-900">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-slate-600">Access Duration</td>
                    <td className="py-4 text-center text-slate-400">Forever</td>
                    <td className="py-4 text-center text-slate-900">30 Days</td>
                    <td className="py-4 text-center text-slate-900">30 Days</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-slate-600">Auto-Renewal</td>
                    <td className="py-4 text-center text-slate-400">-</td>
                    <td className="py-4 text-center text-rose-500 font-bold">None</td>
                    <td className="py-4 text-center text-rose-500 font-bold">None</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-slate-600">Premium Insights</td>
                    <td className="py-4 text-center text-rose-500">
                      <svg className="h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </td>
                    <td className="py-4 text-center text-emerald-500 font-bold">Flow Only</td>
                    <td className="py-4 text-center text-emerald-500 font-bold">Full Deep-Dive</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-slate-600">Portfolio Rebalancer</td>
                    <td className="py-4 text-center text-rose-500">
                      <svg className="h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </td>
                    <td className="py-4 text-center text-slate-400">No</td>
                    <td className="py-4 text-center text-emerald-500">
                      <svg className="h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 p-6 border-t border-slate-100 text-center flex-shrink-0">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             Transactions processed via encrypted UPI gateway • Safe & Secure
           </p>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
