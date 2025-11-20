import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Generate a one-liner summary and an AI assistant prompt for a GitHub issue
 * @param {Object} issue - The GitHub issue object
 * @returns {Promise<Object>} - Object containing summary and aiPrompt
 */
export async function generateIssueAnalysis(issue) {
  try {
    // Use Gemini Flash 2.0 model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Analyze this GitHub issue and provide:
1. A one-liner summary (max 100 characters) of what needs to be done
2. A crisp, detailed prompt that can be given to an AI coding assistant to help solve this issue

GitHub Issue:
Title: ${issue.title}
Body: ${issue.body || 'No description provided'}
Labels: ${issue.labels?.map(l => l.name).join(', ') || 'None'}
State: ${issue.state}

Format your response as JSON with two fields:
{
  "summary": "one-liner summary here",
  "aiPrompt": "detailed prompt for AI assistant here"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON from the response
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanText);
      return {
        summary: parsed.summary || 'Unable to generate summary',
        aiPrompt: parsed.aiPrompt || 'Unable to generate prompt'
      };
    } catch (parseError) {
      // If JSON parsing fails, return a fallback
      console.error('Failed to parse Gemini response:', parseError);
      return {
        summary: issue.title.substring(0, 100),
        aiPrompt: `Help me solve this GitHub issue: ${issue.title}\n\nDescription: ${issue.body || 'No description provided'}`
      };
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Return fallback values
    return {
      summary: issue.title.substring(0, 100),
      aiPrompt: `Help me solve this GitHub issue: ${issue.title}\n\nDescription: ${issue.body || 'No description provided'}`
    };
  }
}

/**
 * Generate AI prompts for multiple issues in batch
 * @param {Array} issues - Array of GitHub issue objects
 * @returns {Promise<Array>} - Array of objects with issue data and generated content
 */
export async function generateBatchIssueAnalysis(issues) {
  const promises = issues.map(async (issue) => {
    const analysis = await generateIssueAnalysis(issue);
    return {
      ...issue,
      ...analysis
    };
  });
  
  return Promise.all(promises);
}
