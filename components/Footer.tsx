
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-100 bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-slate-400 text-sm md:text-base mb-2">
          WhyDidItMove
        </div>
        <p className="text-slate-500 text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
          Disclaimer: This platform provides market explanations for educational purposes only based on publicly available news and patterns. 
          It does not provide investment, buy, or sell advice. Please consult a SEBI-registered advisor for financial decisions.
        </p>
        <div className="mt-8 text-slate-300 text-[10px] font-mono tracking-tighter uppercase">
          Market Explainer MVP v1.0
        </div>
      </div>
    </footer>
  );
};

export default Footer;
