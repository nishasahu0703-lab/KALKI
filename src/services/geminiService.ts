
import { ProblemSolution } from "../types";
import { Type } from "@google/genai";

const problemSchema = {
  type: Type.OBJECT,
  properties: {
    analysis: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        difficulty: { type: Type.STRING },
        type: { type: Type.ARRAY, items: { type: Type.STRING } },
        constraints: { type: Type.ARRAY, items: { type: Type.STRING } },
        patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
        summary: { type: Type.STRING }
      },
      required: ["title", "difficulty", "type", "constraints", "patterns", "summary"]
    },
    logic: {
      type: Type.OBJECT,
      properties: {
        problemBreakdown: { type: Type.STRING },
        bruteForce: {
          type: Type.OBJECT,
          properties: {
            approach: { type: Type.STRING },
            whyItFails: { type: Type.STRING }
          },
          required: ["approach", "whyItFails"]
        },
        optimized: {
          type: Type.OBJECT,
          properties: {
            approach: { type: Type.STRING },
            thinking: { type: Type.STRING }
          },
          required: ["approach", "thinking"]
        },
        steps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING }
            },
            required: ["title", "content"]
          }
        }
      },
      required: ["problemBreakdown", "bruteForce", "optimized", "steps"]
    },
    codes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          language: { type: Type.STRING },
          code: { type: Type.STRING },
          timeComplexity: { type: Type.STRING },
          spaceComplexity: { type: Type.STRING }
        },
        required: ["language", "code", "timeComplexity", "spaceComplexity"]
      }
    },
    testCases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          input: { type: Type.STRING },
          expectedOutput: { type: Type.STRING }
        },
        required: ["input", "expectedOutput"]
      }
    },
    interviewAdvice: {
      type: Type.OBJECT,
      properties: {
        verbalExplanation: { type: Type.STRING },
        keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
        sampleScript: { type: Type.STRING }
      },
      required: ["verbalExplanation", "keyPoints", "sampleScript"]
    },
    dryRun: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          step: { type: Type.NUMBER },
          description: { type: Type.STRING },
          state: { type: Type.OBJECT }
        },
        required: ["step", "description", "state"]
      }
    },
    topPerformanceStrategy: { type: Type.STRING }
  },
  required: ["analysis", "logic", "codes", "testCases", "interviewAdvice", "dryRun", "topPerformanceStrategy"]
};

export const analyzeProblem = async (problemStatement: string): Promise<ProblemSolution> => {
  const prompt = `You are a world-class FAANG interview coach. Analyze this problem: ${problemStatement}`;
  
  try {
    const res = await fetch("/api/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, schema: problemSchema })
    });
    
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();
    return JSON.parse(data.text || '{}');
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export const getHint = async (problemStatement: string, currentCode: string, hintLevel: number): Promise<string> => {
  const prompt = `Problem: ${problemStatement}\nUser's Code: ${currentCode}\nHint Level: ${hintLevel}\nInterviewer hint:`;
  
  try {
    const res = await fetch("/api/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();
    return data.text || "Keep thinking!";
  } catch (error) {
    console.error("Hint error:", error);
    return "I'm having trouble connecting to the logic engine. Keep trying!";
  }
};

