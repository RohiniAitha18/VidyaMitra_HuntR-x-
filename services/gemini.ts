
import { GoogleGenAI, Type } from "@google/genai";

// Always use the process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeResume = async (resumeText: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this resume and provide a structured JSON response: ${resumeText}`,
    config: {
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
        required: ["atsScore", "identifiedSkills", "strengths", "recommendations"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateLearningPlan = async (role: string, currentSkills: string[]) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a 4-week learning plan for a ${role} role, knowing I have these skills: ${currentSkills.join(', ')}`,
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
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const getInterviewQuestions = async (role: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Acting as a professional recruiter, start a mock interview for the role: ${role}. Greet the candidate and ask the first question.`,
    config: {
      systemInstruction: "You are a senior hiring manager. Be professional, challenging but encouraging. Ask one question at a time. Evaluates the candidate's response and then asks a follow-up or a new question."
    }
  });
  return response.text;
};

export const getQuiz = async (domain: string, difficulty: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a 5-question multiple choice quiz on ${domain} at ${difficulty} level.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.NUMBER, description: "Index of the correct option (0-3)" },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};
