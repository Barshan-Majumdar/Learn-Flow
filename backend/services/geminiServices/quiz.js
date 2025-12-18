import { getModel } from './model.js';

/**
 * Generate quiz for a topic
 * @param {string} topic - Topic for quiz
 * @param {number} numQuestions - Number of questions
 * @returns {Promise<Object>} - Quiz questions
 */
export const generateQuiz = async (topic, numQuestions = 5) => {
  const model = getModel();

  const prompt = `Create a quiz for testing knowledge on: ${topic}

Generate ${numQuestions} multiple choice questions in this JSON format:
{
  "topic": "${topic}",
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": "A",
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Rules:
1. Questions should test understanding, not just memorization
2. Include some application-based questions
3. All 4 options should be plausible
4. Response must be valid JSON only
5. IMPORTANT: Wrap ALL mathematical formulas in dollar signs ($) for LaTeX rendering (e.g., use "$\\frac{1}{2}$", not "\frac{1}{2}" or "1/2").
6. IMPORTANT: You MUST double-escape all backslashes (e.g., use "$\\psi$" instead of "$\psi$").`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let cleanText = text.replace(/```json/g, '').replace(/```/g, '');
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      let jsonString = jsonMatch[0];
      // Attempt to fix common bad escapes if parse fails
      try {
        return JSON.parse(jsonString);
      } catch (e) {
        // Simple heuristic: replace single backslashes that aren't valid escapes
        // Valid escapes: \" \\ \/ \b \f \n \r \t \uXXXX
        // We want to turn \psi into \\psi, but leave \\psi alone (mostly)
        // This is tricky safely, so let's just try a simpler replace for common issues:
        jsonString = jsonString.replace(/\\([^\/"\\bfnrtu])/g, '\\\\$1');
        return JSON.parse(jsonString);
      }
    }

    throw new Error("Invalid AI response format");
  } catch (error) {
    console.error("Gemini quiz error:", error);
    return {
      topic,
      questions: [
        {
          id: 1,
          question: `What is the main concept of ${topic}?`,
          options: ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
          correctAnswer: "A",
          explanation: "This is a placeholder question.",
        },
      ],
    };
  }
};

export default { generateQuiz };
