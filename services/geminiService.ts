// [FE-FIX] Provided full implementation for this file to resolve module and reference errors.
import { GoogleGenAI, Type } from "@google/genai";
import type { LearningPlan } from '../types';

let ai: GoogleGenAI | null = null;

function getAiInstance(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
      throw new Error("GEMINI_API_KEY environment variable is not set or is still a placeholder. Please configure your Gemini API key to use AI features.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

const model = "gemini-2.5-flash";

const gradeLevelMap: { [key: string]: string } = {
    'junior': 'Junior (4th - 5th Grade)',
    'level1': 'Level 1 (6th - 7th Grade)',
    'level2': 'Level 2 (8th - 9th Grade)',
    'upper': 'Upper/Free (High School & Adults)',
};

const learningPlanSchema = {
    type: Type.OBJECT,
    properties: {
        goal: {
            type: Type.STRING,
            description: "A concise, one-sentence goal for the student based on their needs."
        },
        modules: {
            type: Type.ARRAY,
            description: "A list of 3-5 learning modules to achieve the student's goal.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A short, engaging title for the module." },
                    description: { type: Type.STRING, description: "A one-sentence description of what the student will learn in this module." },
                    lessons: {
                        type: Type.ARRAY,
                        description: "A list of 3-5 lessons within the module.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING, description: "A short, clear title for the lesson." },
                                objective: { type: Type.STRING, description: "A one-sentence learning objective for this lesson." },
                                explanation: { type: Type.STRING, description: "A simple, one-paragraph explanation of the concept, suitable for the student's grade level." },
                                example: { type: Type.STRING, description: "A clear, concise example sentence or short dialogue demonstrating the concept." },
                                practice_prompt: { type: Type.STRING, description: "A simple, one-sentence practice prompt for the student to apply what they've learned." },
                                pronunciation_guide: {
                                    type: Type.ARRAY,
                                    description: "A list of 2-3 key vocabulary words from the lesson with their IPA pronunciation. Provide only the word and its IPA string.",
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            word: { type: Type.STRING, description: "The vocabulary word." },
                                            ipa: { type: Type.STRING, description: "The International Phonetic Alphabet (IPA) transcription of the word." }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

export const generateLearningPlan = async (studentNeeds: string, gradeLevel: string): Promise<LearningPlan> => {
  const gradeLabel = gradeLevelMap[gradeLevel] || 'default level';
  
  // Curriculum knowledge for each level
  const curriculumContext: { [key: string]: string } = {
    junior: `Junior Level (4th-5th Grade) curriculum includes: basic vocabulary (family, school, colors, numbers), present tense verbs, simple sentence structure, question words, basic adjectives, simple prepositions, personal information, present continuous, and basic plurals.`,
    level1: `Level 1 (6th-7th Grade) curriculum includes: extended vocabulary (hobbies, food, clothing, weather), past tense (regular/irregular), future tense, modal verbs, comparative/superlative adjectives, present perfect, conditionals, adverbs of frequency, compound sentences, and basic phrasal verbs.`,
    level2: `Level 2 (8th-9th Grade) curriculum includes: academic vocabulary, past perfect, passive voice, reported speech, second/third conditionals, gerunds/infinitives, advanced phrasal verbs, complex sentence structures, opinion expressions, and cause/effect language.`,
    upper: `Upper Level (High School & Adults) curriculum includes: sophisticated vocabulary, subjunctive mood, complex sentence structures, formal/informal register, debate skills, literary analysis, professional communication, cultural awareness, advanced grammar, and research/presentation skills.`
  };

  const prompt = `
    You are an expert ESL curriculum designer and OBLI competition specialist creating a personalized learning plan for a Brazilian student.

    STUDENT PROFILE:
    - Competition Level: ${gradeLabel}
    - Learning Goal: "${studentNeeds}"

    CURRICULUM CONTEXT for ${gradeLabel}:
    ${curriculumContext[gradeLevel] || curriculumContext.junior}

    OBLI COMPETITION FOCUS:
    The OBLI (Olimpíada Brasileira de Língua Inglesa) emphasizes:
    - Practical communication skills over theoretical knowledge
    - Real-world application of grammar and vocabulary
    - Cultural awareness and global communication
    - Critical thinking and problem-solving in English
    - Creative expression and original thinking

    TASK: Create a comprehensive learning plan that:
    1. Aligns with the ${gradeLabel} curriculum standards
    2. Directly addresses the student's specific goal: "${studentNeeds}"
    3. Prepares them for OBLI competition success
    4. Includes 3-5 modules, each with 3-5 practical lessons
    5. Uses age-appropriate language and concepts
    6. Focuses on practical application and real-world usage
    7. Incorporates Brazilian cultural context when relevant

    Each lesson should include:
    - Clear, practical learning objectives
    - Simple explanations appropriate for the grade level
    - Real-world examples and applications
    - Practice activities that build OBLI competition skills
    - Key vocabulary with IPA pronunciation guides

    Generate a complete learning plan that bridges the student's current level with their competition goals.
  `;

  try {
    const response = await getAiInstance().models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: learningPlanSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedPlan = JSON.parse(jsonText);

    // Initialize lesson statuses
    parsedPlan.modules.forEach((module: any) => {
        module.lessons.forEach((lesson: any) => {
            lesson.status = 'not_started';
        });
    });

    return parsedPlan as LearningPlan;

  } catch (error) {
    console.error("Error generating learning plan:", error);
    throw new Error("Failed to generate the learning plan. The AI model might be busy or the service is not configured correctly. Please try again.");
  }
};


export const suggestGoal = async (gradeLevel: string): Promise<string> => {
    const gradeLabel = gradeLevelMap[gradeLevel] || 'default level';
    
    // Curriculum knowledge for each level
    const curriculumContext: { [key: string]: string } = {
      junior: `Junior Level (4th-5th Grade) focuses on: basic vocabulary (family, school, colors, numbers), present tense verbs, simple sentence structure, question words, basic adjectives, simple prepositions, personal information, present continuous, and basic plurals.`,
      level1: `Level 1 (6th-7th Grade) focuses on: extended vocabulary (hobbies, food, clothing, weather), past tense (regular/irregular), future tense, modal verbs, comparative/superlative adjectives, present perfect, conditionals, adverbs of frequency, compound sentences, and basic phrasal verbs.`,
      level2: `Level 2 (8th-9th Grade) focuses on: academic vocabulary, past perfect, passive voice, reported speech, second/third conditionals, gerunds/infinitives, advanced phrasal verbs, complex sentence structures, opinion expressions, and cause/effect language.`,
      upper: `Upper Level (High School & Adults) focuses on: sophisticated vocabulary, subjunctive mood, complex sentence structures, formal/informal register, debate skills, literary analysis, professional communication, cultural awareness, advanced grammar, and research/presentation skills.`
    };

    const prompt = `
      You are an expert ESL curriculum designer and OBLI competition specialist helping a Brazilian student.
      
      CURRICULUM CONTEXT for ${gradeLabel}:
      ${curriculumContext[gradeLevel] || curriculumContext.junior}
      
      OBLI COMPETITION REQUIREMENTS:
      The OBLI (Olimpíada Brasileira de Língua Inglesa) competition tests practical English skills including:
      - Reading comprehension and interpretation
      - Grammar and vocabulary in context
      - Cultural awareness and real-world communication
      - Critical thinking and problem-solving in English
      - Creative writing and expression
      
      TASK: Create a specific, practical, and inspiring learning goal that:
      1. Aligns with the ${gradeLabel} curriculum focus areas
      2. Prepares the student for OBLI competition success
      3. Is achievable and motivating for a Brazilian student
      4. Can be typed into a text box by the student
      5. Focuses on practical application, not just theory
      
      Provide ONLY the goal sentence. No explanations or additional text.
      
      Examples:
      - Junior: "Master describing my daily routine and family activities using present tense and basic vocabulary for OBLI speaking tasks."
      - Level 1: "Develop confidence in telling stories about past experiences using irregular verbs and time expressions for OBLI narrative tasks."
      - Level 2: "Improve my ability to express opinions and debate current events using conditionals and advanced vocabulary for OBLI discussion rounds."
      - Upper: "Enhance my critical analysis skills to discuss literature and complex topics using sophisticated language structures for OBLI advanced rounds."
    `;

    try {
      const response = await getAiInstance().models.generateContent({
        model,
        contents: prompt,
      });

      // Clean up the response to be a simple string
      return response.text.trim().replace(/"/g, '');

    } catch (error) {
      console.error("Error suggesting goal:", error);
      throw new Error("Failed to suggest a goal. The AI service may be unavailable.");
    }
};

export const generateContent = async (prompt: string): Promise<string> => {
    try {
        const response = await getAiInstance().models.generateContent({
            model,
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating content:", error);
        throw new Error("Failed to generate content. The AI service may be unavailable.");
    }
};

export const generatePracticeFeedback = async (practicePrompt: string, studentAnswer: string, gradeLevel: string): Promise<string> => {
    const gradeLabel = gradeLevelMap[gradeLevel] || 'default level';
    const prompt = `
      You are a friendly and helpful ESL teacher named Alex. You are providing feedback on a practice exercise for a student preparing for the OBLI competition in Brazil.
      The student is at the "${gradeLabel}" level.

      The exercise prompt was: "${practicePrompt}"
      The student's answer is: "${studentAnswer}"

      Your task is to provide feedback that is:
      1.  **Positive and Encouraging**: Start with a positive comment.
      2.  **Constructive**: Gently point out any mistakes in grammar, vocabulary, or spelling.
      3.  **Clear**: Explain *why* it's a mistake and provide the correct version.
      4.  **Concise**: Keep the feedback to 2-4 sentences.
      5.  **Level-Appropriate**: Use language the student at the "${gradeLabel}" level can understand.

      Do not give feedback on the content or opinion, only on the English language usage.
      
      Example Feedback:
      "Great job trying to use the past tense! One small correction: instead of 'I goed to the store,' we say 'I went to the store.' 'Went' is the irregular past tense of 'go.' Keep up the great work! 👍"

      Now, provide feedback for the student's answer.
    `;

    try {
        const response = await getAiInstance().models.generateContent({
            model,
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error generating feedback:", error);
        throw new Error("Failed to generate feedback. The AI service may be unavailable.");
    }
};