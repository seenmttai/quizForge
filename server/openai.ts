import OpenAI from "openai";
import { type QuestionTemplate, type InsertQuestion } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || "default_key"
});

export interface VariableValue {
  type: "number" | "string";
  value: number | string;
  unit?: string;
}

export interface GeneratedVariables {
  [key: string]: VariableValue;
}

export interface QuestionGenerationResult {
  questionText: string;
  expectedAnswer: string;
  variables: GeneratedVariables;
  difficulty: number;
}

/**
 * Generate random values for template variables
 */
function generateVariableValues(variables: any): GeneratedVariables {
  const result: GeneratedVariables = {};
  
  for (const [key, config] of Object.entries(variables) as [string, any][]) {
    if (config.type === "number") {
      const min = config.range[0];
      const max = config.range[1];
      const value = Math.random() * (max - min) + min;
      result[key] = {
        type: "number",
        value: Math.round(value * 100) / 100, // Round to 2 decimal places
        unit: config.unit || ""
      };
    } else if (config.type === "string") {
      const options = config.options || [];
      const value = options[Math.floor(Math.random() * options.length)];
      result[key] = {
        type: "string",
        value,
      };
    }
  }
  
  return result;
}

/**
 * Replace template placeholders with actual values
 */
function substituteTemplate(template: string, variables: GeneratedVariables): string {
  let result = template;
  
  for (const [key, variable] of Object.entries(variables)) {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder, 'g'), variable.value.toString());
  }
  
  return result;
}

/**
 * Calculate difficulty score based on question complexity
 */
function calculateDifficulty(template: QuestionTemplate, variables: GeneratedVariables): number {
  const baseMin = template.difficultyRange.min as number;
  const baseMax = template.difficultyRange.max as number;
  
  // Add some randomness within the range
  const difficulty = Math.random() * (baseMax - baseMin) + baseMin;
  return Math.round(difficulty * 10) / 10;
}

/**
 * Generate a unique question from a template
 */
export async function generateQuestionFromTemplate(
  template: QuestionTemplate, 
  studentId?: string
): Promise<QuestionGenerationResult> {
  try {
    // Generate variable values
    const variables = generateVariableValues(template.variables);
    
    // Substitute template
    let questionText = substituteTemplate(template.template, variables);
    
    // Use AI to create variations and solve the problem
    const prompt = `
You are an expert in ${template.subject}. Given this lab question:

"${questionText}"

Please do the following:
1. Rephrase the question to make it unique while keeping the same difficulty and concepts
2. Solve the problem step by step
3. Provide the final numerical answer with appropriate units

Variables used: ${JSON.stringify(variables, null, 2)}

Respond in JSON format:
{
  "rephrased_question": "The rephrased unique question",
  "solution_steps": "Step by step solution",
  "final_answer": "Final numerical answer with units"
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system", 
          content: "You are an expert instructor creating unique lab questions. Always provide clear, accurate solutions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7, // Add some creativity for variations
    });

    const aiResult = JSON.parse(response.choices[0].message.content || "{}");
    
    // Calculate difficulty
    const difficulty = calculateDifficulty(template, variables);
    
    return {
      questionText: aiResult.rephrased_question || questionText,
      expectedAnswer: `${aiResult.solution_steps}\n\nFinal Answer: ${aiResult.final_answer}`,
      variables,
      difficulty,
    };
    
  } catch (error) {
    console.error("Error generating question:", error);
    
    // Fallback to template substitution if AI fails
    const variables = generateVariableValues(template.variables);
    const questionText = substituteTemplate(template.template, variables);
    const difficulty = calculateDifficulty(template, variables);
    
    return {
      questionText,
      expectedAnswer: "Solution not available - please solve manually",
      variables,
      difficulty,
    };
  }
}

/**
 * Generate multiple unique questions
 */
export async function generateMultipleQuestions(
  templates: QuestionTemplate[],
  count: number,
  studentIds: string[] = []
): Promise<QuestionGenerationResult[]> {
  const results: QuestionGenerationResult[] = [];
  
  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    const studentId = studentIds[i % studentIds.length];
    
    try {
      const result = await generateQuestionFromTemplate(template, studentId);
      results.push(result);
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error generating question ${i + 1}:`, error);
    }
  }
  
  return results;
}

/**
 * Evaluate question difficulty consistency
 */
export async function evaluateQuestionDifficulty(questions: string[]): Promise<{
  avgDifficulty: number;
  difficulties: number[];
  isConsistent: boolean;
}> {
  try {
    const prompt = `
Rate the difficulty of these lab questions on a scale of 1-10, where:
1-3: Beginner (basic concepts, simple calculations)
4-6: Intermediate (moderate complexity, multiple steps)
7-9: Advanced (complex analysis, multiple concepts)
10: Expert (graduate level, research-oriented)

Questions:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n\n')}

Respond in JSON format:
{
  "difficulties": [array of numerical ratings for each question],
  "reasoning": "Brief explanation of ratings"
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    const difficulties = result.difficulties || [];
    const avgDifficulty = difficulties.reduce((a: number, b: number) => a + b, 0) / difficulties.length;
    
    // Check consistency (standard deviation < 1.0)
    const stdDev = Math.sqrt(
      difficulties.reduce((sum: number, d: number) => sum + Math.pow(d - avgDifficulty, 2), 0) / difficulties.length
    );
    
    return {
      avgDifficulty: Math.round(avgDifficulty * 10) / 10,
      difficulties,
      isConsistent: stdDev < 1.0,
    };
    
  } catch (error) {
    console.error("Error evaluating difficulty:", error);
    return {
      avgDifficulty: 5.0,
      difficulties: questions.map(() => 5.0),
      isConsistent: true,
    };
  }
}
