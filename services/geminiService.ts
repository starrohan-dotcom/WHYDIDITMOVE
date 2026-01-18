
import { GoogleGenAI, Type } from "@google/genai";
import { StockExplanation, MarketStatus, UserProfile, DiscoveryResult, PortfolioHolding, RebalancingResult, YesterdayPulse, ComparisonResult } from "../types";

const getAiClient = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

const cleanJson = (text: string) => {
  // Try to find a JSON object or array
  const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (match) {
    return match[0];
  }
  // Fallback to basic cleanup if no clear JSON structure found
  return text.trim().replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
};

const CACHE_KEY = 'wdim_market_status_cache';
const CACHE_TIME_KEY = 'wdim_market_status_time';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache

// STRICT PERSONA: PREMIUM EXPLANATION ENGINE
const EXPLAINER_SYSTEM_INSTRUCTION = `You are a premium Indian stock market explanation engine.
Your role is to explain WHY a stock or index moved on a given trading day.
- India only (NSE/BSE).
- NO predictions, NO advice, NO target prices.
- Be factual, neutral, and unemotional. No hype, no fear.
- HOLIDAY & SESSION RULES:
  1. Determine if the market is closed (Weekend or NSE/BSE Holiday).
  2. If closed, clearly state it and STOP analysis.
- ANALYSIS LOGIC:
  - Consider NIFTY 50/Sector context, News, Volume, and Sentiment.
  - If no strong reason exists, state it is sentiment-driven or index-linked. Do NOT speculate.
- IMPACT CLASSIFICATION: No Impact, Low Impact, Medium Impact, High Impact.
- SENTIMENT CLASSIFICATION: Positive, Negative, Neutral.
- PREMIUM INSIGHT: Provide a 'premiumInsight' string that gives a deeper look into FII/DII flow or order book data if available.`;

const REBALANCER_SYSTEM_INSTRUCTION = `You are an educational portfolio rebalancing assistant for Indian stock market investors only.
STRICT RULES:
- NO price predictions or market direction forecasts.
- NO guaranteed returns.
- NO aggressive buy/sell instructions.
- Provide logical, risk-based rebalancing suggestions only.
- Prioritize capital protection and diversification principles.
- Conservative, factual, and unemotional tone.
- Context: Indian market (NSE/BSE).`;

const MODELS = [
  'gemini-flash-lite-latest',
  'gemini-2.5-flash-lite-preview-09-2025',
  'gemini-2.0-flash-lite-preview-02-05',
  'gemini-2.0-flash',
  'gemini-flash-latest',
  'gemini-pro-latest',
  'gemini-exp-1206',
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];

const generateWithFallback = async (generateFn: (model: string) => Promise<any>): Promise<any> => {
  const errors: string[] = [];
  for (const model of MODELS) {
    try {
      console.log(`Trying model: ${model}`);
      return await generateFn(model);
    } catch (err: any) {
      const msg = `Model ${model} failed: ${err.message}`;
      console.warn(msg);
      errors.push(msg);

      // If quota exceeded, we might want to delay? 
      // But for now, just attempting next model is the best bet.
    }
  }
  throw new Error(`All models failed. Details:\n${errors.join('\n')}`);
};

const getSmartConfig = (model: string, schema: any, systemInstruction: string) => {
  const isLite = model.includes('lite');
  const baseConfig: any = {
    // If Lite, we MUST enforce JSON in the instructions since we can't use responseMimeType
    systemInstruction: isLite
      ? systemInstruction + "\n\nCRITICAL: Output strictly valid JSON only. Do not wrap in markdown. Do not include any text before or after."
      : systemInstruction,
    tools: [{ googleSearch: {} }]
  };

  if (!isLite) {
    baseConfig.responseMimeType = "application/json";
    baseConfig.responseSchema = schema;
  }

  return baseConfig;
};

export const checkMarketStatus = async (dateStr: string): Promise<MarketStatus> => {
  const cachedStatus = sessionStorage.getItem(CACHE_KEY);
  const cachedTime = sessionStorage.getItem(CACHE_TIME_KEY);
  const now = Date.now();

  if (cachedStatus && cachedTime && (now - parseInt(cachedTime)) < CACHE_DURATION) {
    try {
      return JSON.parse(cachedStatus);
    } catch (e) {
      console.error("Failed to parse cached market status", e);
    }
  }

  const ai = getAiClient();

  const result = await generateWithFallback(async (model) => {
    const response = await ai.models.generateContent({
      model: model,
      contents: `Analyze Indian stock market status for ${dateStr}. Is it a trading holiday or weekend? Return STATUS: [OPEN/CLOSED/UNKNOWN] and REASON: [Reason].`,
      config: { systemInstruction: EXPLAINER_SYSTEM_INSTRUCTION }
    });
    const text = response.text || '';
    const statusMatch = text.match(/STATUS:\s*(OPEN|CLOSED|UNKNOWN)/i);
    const reasonMatch = text.match(/REASON:\s*(.*)/i);

    return {
      status: (statusMatch ? statusMatch[1].toUpperCase() : 'UNKNOWN') as 'OPEN' | 'CLOSED' | 'UNKNOWN',
      reason: reasonMatch ? reasonMatch[1].trim() : 'Requires verification'
    };
  });

  sessionStorage.setItem(CACHE_KEY, JSON.stringify(result));
  sessionStorage.setItem(CACHE_TIME_KEY, now.toString());

  return result;
};

export const fetchYesterdayPulse = async (): Promise<YesterdayPulse> => {
  const ai = getAiClient();
  const prompt = `Provide a very brief summary of the LAST trading session of the Indian Stock Market (Nifty 50 and Sensex). 
  Include: 
  - Nifty 50 percentage change and direction.
  - Sensex percentage change and direction.
  - Top sector that moved.
  - One major market story from that session.
  Return as JSON.`;

  return await generateWithFallback(async (model) => {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: getSmartConfig(model, schema, EXPLAINER_SYSTEM_INSTRUCTION)
    });
    return JSON.parse(cleanJson(response.text));
  });
};

const stockExplanationSchema = {
  type: Type.OBJECT,
  properties: {
    stockName: { type: Type.STRING },
    priceChange: { type: Type.STRING },
    direction: { type: Type.STRING, enum: ['up', 'down', 'neutral'] },
    oneLineSummary: { type: Type.STRING },
    historicalPrices: {
      type: Type.ARRAY,
      items: { type: Type.NUMBER },
      description: "Approximate closing prices for the last 7 trading sessions."
    },
    cards: {
      type: Type.OBJECT,
      properties: {
        marketContext: { type: Type.STRING },
        sectorPerformance: { type: Type.STRING },
        newsImpact: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            impact: { type: Type.STRING, enum: ['High', 'Medium', 'Low', 'None'] },
            sentiment: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'] },
            url: { type: Type.STRING, description: "Direct URL to the most relevant news source used for this analysis." }
          },
          required: ['text', 'impact', 'sentiment']
        },
        tradingActivity: { type: Type.STRING },
        historicalPattern: { type: Type.STRING }
      },
      required: ['marketContext', 'sectorPerformance', 'newsImpact', 'tradingActivity', 'historicalPattern']
    },
    premiumInsight: { type: Type.STRING, description: "A deeper dive into FII flow, order book dynamics, or hidden corporate triggers." },
    finalTakeaway: { type: Type.STRING }
  },
  required: ['stockName', 'priceChange', 'direction', 'oneLineSummary', 'cards', 'finalTakeaway', 'historicalPrices', 'premiumInsight']
};

export const fetchStockExplanation = async (stockName: string): Promise<StockExplanation> => {
  const ai = getAiClient();
  const prompt = `Explain why Indian stock "${stockName}" moved recently. 
  Rules: Factual analysis only. No predictions. Quantify moves with percentages.
  Include an array 'historicalPrices' of 7 approximate closing price points for the last 7 sessions.
  For the 'newsImpact' card, please include the URL of the primary news article used for the analysis in the 'url' field.
  Output in JSON format matching the response schema.`;

  return await generateWithFallback(async (model) => {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: getSmartConfig(model, stockExplanationSchema, EXPLAINER_SYSTEM_INSTRUCTION)
    });

    const jsonStr = cleanJson(response.text);
    const data = JSON.parse(jsonStr);

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title || 'Source',
        uri: chunk.web.uri
      }));

    return { ...data, sources };
  });
};

export const fetchComparison = async (stockA: string, stockB: string): Promise<ComparisonResult> => {
  const ai = getAiClient();
  const prompt = `Perform a side-by-side technical and fundamental audit of two Indian stocks: "${stockA}" and "${stockB}". 
  Explain why each moved recently and how their performance compares.
  Return JSON matching the comparison schema.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      stockA: stockExplanationSchema,
      stockB: stockExplanationSchema,
      comparisonSummary: { type: Type.STRING, description: "A summary of how these two stocks differ in their recent movement drivers." }
    },
    required: ['stockA', 'stockB', 'comparisonSummary']
  };

  return await generateWithFallback(async (model) => {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: getSmartConfig(model, schema, EXPLAINER_SYSTEM_INSTRUCTION)
    });

    const data = JSON.parse(cleanJson(response.text));

    // Basic empty sources for simplicity in comparison view
    data.stockA.sources = [];
    data.stockB.sources = [];

    return data;
  });
};

export const fetchDiscoverySuggestions = async (profile: UserProfile): Promise<DiscoveryResult> => {
  const ai = getAiClient();
  const prompt = `Educational study for: Risk=${profile.riskTolerance}, Horizon=${profile.horizon}.
  Suggest 2-3 NSE/BSE stocks for learning/study. Focus on capital protection and diversification principles. NO ADVICE.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      profileAnalysis: { type: Type.STRING },
      suggestedStocks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            ticker: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            fundamentals: { type: Type.STRING },
            newsImpact: { type: Type.STRING },
            risks: { type: Type.STRING },
            learningFocus: { type: Type.STRING }
          },
          required: ['name', 'ticker', 'reasoning', 'fundamentals', 'newsImpact', 'risks', 'learningFocus']
        }
      }
    },
    required: ['profileAnalysis', 'suggestedStocks']
  };

  return await generateWithFallback(async (model) => {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: getSmartConfig(model, schema, REBALANCER_SYSTEM_INSTRUCTION)
    });
    return JSON.parse(cleanJson(response.text));
  });
};

export const fetchRebalancingSuggestions = async (
  profile: UserProfile,
  holdings: PortfolioHolding[]
): Promise<RebalancingResult> => {
  const ai = getAiClient();
  const prompt = `Audit this asset allocation for an Indian investor: Risk=${profile.riskTolerance}, Horizon=${profile.horizon}.
  Holdings: ${JSON.stringify(holdings)}.
  Provide logical diversification study. NO ADVICE.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      analysis: { type: Type.STRING },
      diversificationScore: { type: Type.NUMBER },
      suggestions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['Risk', 'Opportunity', 'Balance'] }
          },
          required: ['title', 'description', 'type']
        }
      }
    },
    required: ['analysis', 'diversificationScore', 'suggestions']
  };

  return await generateWithFallback(async (model) => {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: getSmartConfig(model, schema, REBALANCER_SYSTEM_INSTRUCTION)
    });

    return JSON.parse(cleanJson(response.text));
  });
};
