
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Helper to get a fresh AI client instance.
 * Always uses process.env.API_KEY.
 */
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes a resume file or text using Gemini 3 Flash.
 * Flash models are resilient for multimodal JSON extraction.
 */
export const analyzeResume = async (fileData?: { data: string, mimeType: string }, text?: string, roastMode?: boolean) => {
  const ai = getAiClient();
  const parts: any[] = [];
  
  if (fileData) {
    parts.push({ inlineData: { data: fileData.data, mimeType: fileData.mimeType } });
  }
  
  if (text) {
    parts.push({ text: `Resume Content: ${text}` });
  }

  const systemInstruction = roastMode 
    ? "You are a critical but constructive career coach. Evaluate the resume with a touch of wit and sharp honesty. Identify overused clichés, formatting errors, and gaps in experience. You must provide your analysis in the specified JSON format."
    : "You are a senior recruitment expert specializing in ATS optimization. Extract data accurately and provide professional, actionable advice for improvement. You must provide your analysis in the specified JSON format.";

  const prompt = "Extract and analyze the resume data. Provide name, email, experience summary, skills, strengths, and recommendations. Calculate a mock ATS score from 0-100. RETURN ONLY VALID JSON.";

  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            atsScore: { type: Type.NUMBER },
            identifiedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            parsedInfo: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                email: { type: Type.STRING },
                experienceSummary: { type: Type.STRING }
              }
            }
          },
          required: ["atsScore", "identifiedSkills", "strengths", "recommendations", "parsedInfo"]
        }
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Gemini analyzeResume Error:", e);
    throw new Error("Failed to analyze resume. The AI might be temporarily unavailable.");
  }
};

/**
 * Gets real-time market trends for a job role using Google Search grounding.
 */
export const getMarketPulse = async (role: string) => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search for and summarize the latest 2025 hiring trends, salary shifts, and in-demand tech stacks for ${role} roles. Highlight major companies hiring or layoffs.`,
      config: { tools: [{ googleSearch: {} }] },
    });
    return {
      text: response.text,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (e) {
    console.error("Gemini getMarketPulse Error:", e);
    throw e;
  }
};

/**
 * Benchmarks salaries for a role and location using Search and Maps grounding.
 */
export const getSalaryInsights = async (role: string, location: string, lat?: number, lng?: number) => {
  const ai = getAiClient();
  const hasCoords = lat !== undefined && lng !== undefined;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide a detailed salary benchmark for a ${role} in ${location}. Include local market data, top employers in that specific area, and cost-of-living context.`,
      config: {
        tools: hasCoords ? [{ googleSearch: {} }, { googleMaps: {} }] : [{ googleSearch: {} }],
        toolConfig: hasCoords ? {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        } : undefined
      },
    });

    return {
      text: response.text,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (e) {
    console.error("Gemini getSalaryInsights Error:", e);
    throw e;
  }
};

/**
 * Drafts networking messages using Gemini 3 Flash.
 */
export const generateNetworkingDraft = async (type: 'linkedin' | 'email' | 'followup', role: string, context: string) => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Draft a professional ${type} message for a ${role} position. Context for the connection: ${context}. Make it concise, high-impact, and authentically human.`,
      config: {
        systemInstruction: "You are a professional networking coach. You write messages that build genuine rapport and avoid sounding robotic or transactional."
      }
    });
    return response.text;
  } catch (e) {
    console.error("Gemini generateNetworkingDraft Error:", e);
    throw e;
  }
};

/**
 * Optimizes specific resume content.
 */
export const optimizeResumeContent = async (input: string, context: string) => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Rewrite the following resume bullet point/summary to be more impactful and professional: "${input}". Focus on ${context}.`,
      config: { systemInstruction: "You are a professional technical resume writer." }
    });
    return response.text;
  } catch (e) {
    console.error("Gemini optimizeResumeContent Error:", e);
    throw e;
  }
};

/**
 * Generates a 4-week learning roadmap.
 */
export const generateLearningPlan = async (role: string, currentSkills: string[]) => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a structured 4-week learning roadmap for an aspiring ${role}. The learner currently knows: ${currentSkills.join(', ')}. Include specific weekly topics and hands-on tasks.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              week: { type: Type.NUMBER },
              topic: { type: Type.STRING },
              tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    completed: { type: Type.BOOLEAN }
                  }
                }
              },
              resourceLink: { type: Type.STRING }
            },
            required: ["week", "topic", "tasks"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Gemini generateLearningPlan Error:", e);
    return [];
  }
};

/**
 * Starts a mock interview session.
 */
export const getInterviewQuestions = async (role: string, resumeContext?: string) => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Initiate a technical mock interview for a ${role} candidate. ${resumeContext ? `Candidate Background: ${resumeContext}` : ''}. Start with a targeted and challenging first question.`,
      config: { systemInstruction: "You are a senior technical lead conducting a job interview. Be professional, observant, and focus on deep technical understanding." }
    });
    return response.text;
  } catch (e) {
    console.error("Gemini getInterviewQuestions Error:", e);
    throw e;
  }
};

/**
 * Generates quiz questions.
 */
export const getQuiz = async (domain: string, difficulty: string) => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a 5-question multiple choice quiz about ${domain} at a ${difficulty} difficulty level. Include detailed explanations for each answer.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.NUMBER },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Gemini getQuiz Error:", e);
    throw e;
  }
};
