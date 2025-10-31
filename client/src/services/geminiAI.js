import { GoogleGenAI } from "@google/genai";

// Initialize the client with your API key
const ai = new GoogleGenAI({
  apiKey: "AIzaSyA5PR-GLjMnXyOHdyVL03nCigvsmoRcMjg"
});

// Utility function to list available models (for debugging)
export const listAvailableModels = async () => {
  try {
    const models = await ai.models.list();
    console.log('Available models:', models);
    return models;
  } catch (error) {
    console.error('Error listing models:', error);
    return [];
  }
};

export class GeminiCareerAdvisor {
  // Test API connectivity
  static async testConnection() {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Say hello and confirm API is working"
      });
      console.log('API test successful:', response.text);
      return true;
    } catch (error) {
      console.error('API test failed:', error);
      return false;
    }
  }

  // Generate content using the new API format
  static async generateContent(prompt) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      return response.text;
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }

  // Generate personalized career recommendations
  static async generateCareerRecommendations(studentData) {
    try {
      const prompt = `
As an expert career counselor for Indian engineering students, analyze this student profile and provide detailed career recommendations:

Student Profile:
- Name: ${studentData.name}
- Branch: ${studentData.branch}
- Current Year: ${studentData.currentYear}
- CGPA: ${studentData.cgpa}
- Placement Status: ${studentData.placementStatus}
- Skills: ${studentData.skills.join(', ')}
- Interests: ${studentData.interests.join(', ')}
- Exams Prepared: ${studentData.examsPrepared.join(', ')}
- Preferred Location: ${studentData.preferredLocation}
- Salary Expectation: ${studentData.salaryExpectation}
- Career Goals: ${studentData.careerGoals}

Please provide a JSON response with this exact structure:
{
  "analysis": "Brief analysis of the student's profile and situation",
  "recommendations": [
    {
      "priority": "High/Medium/Low",
      "path": "Career path name",
      "reason": "Why this path is recommended",
      "immediateActions": ["action1", "action2", "action3"],
      "timeline": "Expected timeline",
      "successProbability": "High/Medium/Low",
      "additionalTips": ["tip1", "tip2"]
    }
  ],
  "emergencyAdvice": "Specific advice for immediate action if student is struggling",
  "motivationalMessage": "Encouraging message for the student"
}

Focus especially on practical advice for students who are not placed yet or facing career uncertainty. Include specific company names, exam strategies, and actionable steps.
`;

      const text = await this.generateContent(prompt);
      
      // Try to parse JSON from the response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
      }
      
      // Fallback if JSON parsing fails
      return {
        analysis: text,
        recommendations: [],
        emergencyAdvice: "Please consult with a career counselor for personalized guidance.",
        motivationalMessage: "Every challenge is an opportunity to grow. Stay focused and keep pushing forward!"
      };
    } catch (error) {
      console.error('Error generating career recommendations:', error);
      throw new Error('Failed to generate AI recommendations. Please try again.');
    }
  }

  // Generate interview preparation tips
  static async generateInterviewTips(studentData, careerPath) {
    try {
      const prompt = `
Generate interview preparation tips for a ${studentData.branch} engineering student applying for ${careerPath} positions.

Student details:
- Branch: ${studentData.branch}
- CGPA: ${studentData.cgpa}
- Skills: ${studentData.skills.join(', ')}
- Experience: ${studentData.careerGoals}

Provide specific technical questions, behavioral questions, and preparation strategies in a structured format.
`;

      return await this.generateContent(prompt);
    } catch (error) {
      console.error('Error generating interview tips:', error);
      throw new Error('Failed to generate interview tips.');
    }
  }

  // Generate skill gap analysis
  static async analyzeSkillGaps(studentData, targetRole) {
    try {
      const prompt = `
Analyze skill gaps for a ${studentData.branch} student targeting ${targetRole} roles.

Current skills: ${studentData.skills.join(', ')}
Target role: ${targetRole}
Current CGPA: ${studentData.cgpa}

Provide:
1. Missing skills that are crucial
2. Skills to improve
3. Learning resources and timeline
4. Priority order for skill development

Format as a detailed analysis with actionable recommendations.
`;

      return await this.generateContent(prompt);
    } catch (error) {
      console.error('Error analyzing skill gaps:', error);
      throw new Error('Failed to analyze skill gaps.');
    }
  }

  // Generate personalized study plan
  static async generateStudyPlan(studentData, examType) {
    try {
      const prompt = `
Create a personalized study plan for a ${studentData.branch} student preparing for ${examType}.

Student Profile:
- Branch: ${studentData.branch}
- Current CGPA: ${studentData.cgpa}
- Available time: Based on current year status - ${studentData.currentYear}
- Strengths: ${studentData.skills.join(', ')}

Provide:
1. Week-by-week study schedule
2. Important topics by priority
3. Practice material recommendations
4. Mock test schedule
5. Revision strategy

Make it specific to ${examType} exam pattern and ${studentData.branch} syllabus.
`;

      return await this.generateContent(prompt);
    } catch (error) {
      console.error('Error generating study plan:', error);
      throw new Error('Failed to generate study plan.');
    }
  }

  // Generate resume improvement suggestions
  static async improveResume(studentData) {
    try {
      const prompt = `
Provide resume improvement suggestions for a ${studentData.branch} engineering student.

Current profile:
- Branch: ${studentData.branch}
- CGPA: ${studentData.cgpa}
- Skills: ${studentData.skills.join(', ')}
- Experience: ${studentData.careerGoals}
- Target: ${studentData.placementStatus}

Provide specific suggestions for:
1. Professional summary
2. Skills section optimization
3. Project descriptions
4. Achievement statements
5. Keywords to include for ATS
6. Common mistakes to avoid

Make it tailored to ${studentData.branch} engineering roles.
`;

      return await this.generateContent(prompt);
    } catch (error) {
      console.error('Error generating resume suggestions:', error);
      throw new Error('Failed to generate resume suggestions.');
    }
  }

  // Generate motivation and mental health support
  static async generateMotivationalSupport(studentData) {
    try {
      const prompt = `
Provide motivational support and mental health guidance for an engineering student facing career challenges.

Student situation: ${studentData.placementStatus}
Additional context: ${studentData.careerGoals}
Current stress factors: Academic pressure, placement anxiety, family expectations

Provide:
1. Motivational message personalized for their situation
2. Stress management techniques
3. Goal-setting strategies
4. Success stories of similar students
5. Daily affirmations
6. Practical tips for maintaining positive mindset

Keep it empathetic, practical, and encouraging.
`;

      return await this.generateContent(prompt);
    } catch (error) {
      console.error('Error generating motivational support:', error);
      return "Remember, every successful person has faced challenges. Your current situation is temporary, but your determination is permanent. Stay focused, keep learning, and success will follow.";
    }
  }

  // Generate company-specific preparation
  static async generateCompanyPrep(studentData, companyName) {
    try {
      const prompt = `
Generate specific preparation guide for ${companyName} recruitment process for a ${studentData.branch} student.

Student profile:
- Branch: ${studentData.branch}
- CGPA: ${studentData.cgpa}
- Skills: ${studentData.skills.join(', ')}

Provide:
1. Company overview and culture
2. Typical interview process
3. Technical topics to focus on
4. Coding problems pattern (if applicable)
5. Behavioral questions they ask
6. Salary range and benefits
7. Recent hiring trends
8. Success tips from previous candidates

Make it specific to ${companyName} and ${studentData.branch} roles.
`;

      return await this.generateContent(prompt);
    } catch (error) {
      console.error('Error generating company prep:', error);
      throw new Error('Failed to generate company-specific preparation.');
    }
  }
}

export default GeminiCareerAdvisor;