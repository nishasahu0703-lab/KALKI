
import { GoogleGenAI, Type } from "@google/genai";
import { ProblemSolution, Difficulty } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const analyzeProblem = async (problemStatement: string): Promise<ProblemSolution> => {
  const prompt = `
    You are a world-class FAANG interview coach. 
    Analyze the following LeetCode-style problem and provide a comprehensive solution in JSON format.
    
    Problem Statement:
    ${problemStatement}
    
    The response must follow this JSON structure exactly:
    {
      "analysis": {
        "title": "string",
        "difficulty": "Easy" | "Medium" | "Hard",
        "type": ["string"],
        "constraints": ["string"],
        "patterns": ["string"],
        "summary": "string"
      },
      "logic": {
        "problemBreakdown": "string",
        "bruteForce": {
          "approach": "string",
          "whyItFails": "string"
        },
        "optimized": {
          "approach": "string",
          "thinking": "string"
        },
        "steps": [{ "title": "string", "content": "string" }]
      },
      "codes": [
        { "language": "cpp", "code": "string", "timeComplexity": "string", "spaceComplexity": "string" },
        { "language": "java", "code": "string", "timeComplexity": "string", "spaceComplexity": "string" },
        { "language": "python", "code": "string", "timeComplexity": "string", "spaceComplexity": "string" }
      ],
      "testCases": [{ "input": "string", "expectedOutput": "string" }],
      "interviewAdvice": {
        "verbalExplanation": "string",
        "keyPoints": ["string"],
        "sampleScript": "string"
      },
      "dryRun": [{ "step": number, "description": "string", "state": {} }],
      "topPerformanceStrategy": "string"
    }
    
    Ensure:
    1. Code is optimized and follows best practices.
    2. Logic explanation is clear and easy to understand even for beginners.
    3. Dry run steps visualize the algorithm execution.
    4. Top performance strategy includes tricks and pattern shortcuts.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || '{}');
};

export const getHint = async (problemStatement: string, currentCode: string, hintLevel: number): Promise<string> => {
  const prompt = `
    Problem: ${problemStatement}
    User's Code: ${currentCode}
    Hint Level: ${hintLevel} (1: subtle, 2: directional, 3: specific)
    
    Act as a supportive interviewer. Provide a helpful hint without giving away the full solution.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
  });

  return response.text || "Keep thinking!";
};
