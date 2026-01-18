
export interface User {
  name: string;
  email: string;
  isLoggedIn: boolean;
  isPremium: boolean;
}

export interface YesterdayPulse {
  nifty: { change: string; direction: 'up' | 'down' | 'neutral' };
  sensex: { change: string; direction: 'up' | 'down' | 'neutral' };
  topStory: string;
  topSector: string;
}

export interface StockExplanation {
  stockName: string;
  priceChange: string;
  direction: 'up' | 'down' | 'neutral';
  oneLineSummary: string;
  historicalPrices?: number[]; 
  cards: {
    marketContext: string;
    sectorPerformance: string;
    newsImpact: {
      text: string;
      impact: 'High' | 'Medium' | 'Low' | 'None';
      sentiment: 'Positive' | 'Negative' | 'Neutral';
      url?: string; // Link to the specific news source
    };
    tradingActivity: string;
    historicalPattern: string;
  };
  premiumInsight?: string; // New premium-only field
  finalTakeaway: string;
  sources: { title: string; uri: string }[];
}

export interface ComparisonResult {
  stockA: StockExplanation;
  stockB: StockExplanation;
  comparisonSummary: string;
}

export interface MarketStatus {
  status: 'OPEN' | 'CLOSED' | 'UNKNOWN';
  reason: string;
}

export interface UserProfile {
  monthlyIncome: string;
  monthlySavings: string;
  riskTolerance: 'Low' | 'Medium' | 'High';
  horizon: 'Short' | 'Medium' | 'Long';
}

export interface DiscoveryStock {
  name: string;
  ticker: string;
  reasoning: string;
  fundamentals: string;
  newsImpact: string;
  risks: string;
  learningFocus: string;
}

export interface DiscoveryResult {
  profileAnalysis: string;
  suggestedStocks: DiscoveryStock[];
}

export interface PortfolioHolding {
  name: string;
  category: 'Equity' | 'Debt' | 'Gold' | 'Cash';
  allocation: number;
}

export interface RebalancingResult {
  analysis: string;
  diversificationScore: number;
  suggestions: {
    title: string;
    description: string;
    type: 'Risk' | 'Opportunity' | 'Balance';
  }[];
}

export interface AppState {
  mode: 'explainer' | 'discovery' | 'rebalancer' | 'compare';
  searchQuery: string;
  loading: boolean;
  explanation: StockExplanation | null;
  comparisonResult: ComparisonResult | null;
  discoveryResult: DiscoveryResult | null;
  rebalancingResult: RebalancingResult | null;
  yesterdayPulse: YesterdayPulse | null;
  error: string | null;
  searchCount: number;
  marketStatus: MarketStatus | null;
  user: User | null;
  isSignupModalOpen: boolean;
  isLoginModalOpen: boolean;
  isPricingModalOpen: boolean;
}
