
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UserData, ResumeData } from '../types';
import { GEMINI_MODEL_NAME } from '../constants';

// Ensure API_KEY is available in the environment
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY environment variable not set. Please ensure it is configured.");
} 
const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_API_KEY" }); 

export const generateResumeContent = async (
  userData: UserData, 
  jobDescription?: string, 
  aiCustomizationInstructions?: string,
  uploadedResumeText?: string | null
): Promise<ResumeData> => {
  if (!apiKey) {
    throw new Error("API_KEY environment variable not set. Cannot call Gemini API.");
  }

  const prompt = `
    You are an expert resume writer and career coach. Your task is to generate a highly professional, ATS-friendly, and COMPLETE resume.

    ${uploadedResumeText ? `
    Uploaded Resume Text (Primary Source):
    ---
    ${uploadedResumeText}
    ---
    The user has uploaded their existing resume as text. Use this text as the PRIMARY source of information. Parse it to extract contact details, summary, work experience, education, and skills.
    ` : ''}

    User Data (Form Input - Use to Augment/Override Uploaded Text if provided, or as primary if no resume uploaded):
    \`\`\`json
    ${JSON.stringify(userData, null, 2)}
    \`\`\`
    The 'User Data' contains 'personal.targetRole' and 'personal.targetIndustry'. Use these fields extensively to guide content generation, especially if other fields are sparse.
    ${uploadedResumeText ? "If specific fields in the 'User Data' (form input) are filled, they should refine, augment, or override corresponding information extracted from the 'Uploaded Resume Text', especially if form data seems more specific, recent, or is explicitly meant to correct the uploaded content." : "Use the 'User Data' as the basis for the resume if no resume text was uploaded."}

    ${jobDescription ? `
    Job Description for Tailoring:
    ---
    ${jobDescription}
    ---
    When tailoring, focus on incorporating keywords from the job description naturally into the summary and experience sections. Emphasize quantifiable achievements and skills that match the requirements.
    ` : ''}

    ${aiCustomizationInstructions ? `
    User's AI Customization Instructions:
    ---
    ${aiCustomizationInstructions}
    ---
    Use these instructions to guide the tone, style, content emphasis, and overall presentation of the resume. These instructions are CRITICAL for how to fill in missing information and how to interpret/merge the provided data sources.
    ` : ''}

    **Very Important Content Generation Guidelines:**
    1.  **Data Merging (If Uploaded Resume Exists):**
        *   Extract all relevant information (contact, summary, experience, education, skills) from the 'Uploaded Resume Text'.
        *   Cross-reference with 'User Data' (form input). If a field is present in 'User Data', it takes precedence or augments the uploaded text.
    2.  **Completeness and Proactive Enhancement (If no Upload or Sparse Data):** If 'Uploaded Resume Text' is not provided OR if both sources combined still result in sparse or key sections (summary, experience, education, skills) being missing, empty, or underdeveloped, you MUST generate plausible, professional, and relevant content.
        *   **Smart Suggestions based on Role/Industry:** Crucially, use 'userData.personal.targetRole' and 'userData.personal.targetIndustry' (if provided) to proactively suggest and incorporate:
            *   Common and impactful skills (technical and soft).
            *   Industry-standard keywords and terminology.
            *   Strong action verbs for experience bullet points.
            *   Relevant points for the summary.
        *   This applies even if the user provided some basic info; enhance it. For example, if targetRole is 'Software Engineer' and skills are few, add typical software engineering skills.
        *   Base this generation primarily on: 'AI Customization Instructions', 'targetRole', 'targetIndustry', and the 'jobDescription'.
        *   If 'AI Customization Instructions' request resume generation for a role (e.g., "generate a resume for a junior web developer") and data for experience/education is sparse, create 1-2 relevant fictional entries.
    3.  **Prioritize User Input:** Always prioritize and incorporate any information the user *has* provided. Use AI generation to fill gaps, expand, enhance, parse, and structure—not to wholesale replace user input unless it's placeholder or instructions explicitly ask for generation.
    4.  **Format Adherence:** The final output must be a SINGLE VALID JSON object. No extra explanations, apologies, or markdown formatting around the JSON block.

    Return the resume as a SINGLE VALID JSON object with the following exact structure. Do not add any extra explanations or markdown before or after the JSON object itself:
    \`\`\`json
    {
      "contact": {
        "name": "string (From merged sources, or generate a placeholder if absolutely necessary and all data is empty)",
        "email": "string (From merged sources, or generate placeholder)",
        "phone": "string (From merged sources, or generate placeholder)",
        "linkedin": "string (optional, from merged sources or generated if implied by role/instructions)",
        "portfolio": "string (optional, from merged sources or generated if implied by role/instructions)",
        "address": "string (optional, e.g., City, State, from merged sources or generated)"
      },
      "summary": "string (A compelling professional summary, 3-5 sentences. Based on merged data, tailored by job description, AI customization, targetRole/Industry. Generate/Enhance a strong, relevant summary if missing or brief.)",
      "experience": [
        {
          "jobTitle": "string",
          "company": "string",
          "location": "string (e.g., City, State)",
          "startDate": "string (e.g., MM/YYYY)",
          "endDate": "string (e.g., MM/YYYY or 'Present')",
          "responsibilities": ["string (bullet point starting with an action verb, quantify achievements. Parse from 'achievements' in UserData or uploaded text. Generate/Enhance 2-3 plausible entries with 3-5 responsibilities each if section is empty/sparse, guided by targetRole/Industry.)"]
        }
      ],
      "education": [
        {
          "degree": "string",
          "institution": "string",
          "location": "string (e.g., City, State, optional)",
          "graduationDate": "string (e.g., MM/YYYY or 'Expected MM/YYYY')",
          "details": ["string (e.g., GPA if high, honors, relevant coursework. Parse from 'notes' in UserData or uploaded text. Generate/Enhance based on role/instructions.)"]
        }
      ],
      "skills": ["string (list of 5-15 relevant skills. Combine user's 'skills' string, uploaded text skills. Proactively add skills based on targetRole/Industry and job description if provided. Aim for a mix of technical and soft skills.)"]
    }
    \`\`\`

    Key Instructions (Reiteration and Elaboration):
    1.  **ATS-Friendly:** Standard sections, clear language.
    2.  **Action Verbs & Quantifiable Achievements:** Critical for experience.
    3.  **Skills Section:** Parse, extract, and *proactively augment* based on role/industry.
    4.  **Summary:** Powerful and tailored, use role/industry for guidance if summary is weak/missing.
    5.  **Data Transformation:** Convert user's 'UserData.skills' string into an array. Integrate with skills from uploaded resume. If all skill sources are empty, generate a relevant list based on role/industry.
    6.  **Strict JSON Output:** Only the JSON object.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json", 
        temperature: 0.6, // Slightly increased for more creative suggestions when enhancing
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }
    
    const parsedData = JSON.parse(jsonStr) as ResumeData;

    // Basic validation
    if (!parsedData.contact || typeof parsedData.contact.name !== 'string' || typeof parsedData.contact.email !== 'string') {
        throw new Error("AI response is missing critical contact information or has incorrect type.");
    }
    if (typeof parsedData.summary !== 'string') {
        throw new Error("AI response has an invalid summary.");
    }
    if (!Array.isArray(parsedData.experience) || !Array.isArray(parsedData.education) || !Array.isArray(parsedData.skills)) {
        throw new Error("AI response has invalid types for experience, education, or skills arrays.");
    }
    
    parsedData.experience.forEach((exp, index) => {
        if (typeof exp.jobTitle !== 'string' || typeof exp.company !== 'string' || 
            typeof exp.startDate !== 'string' || typeof exp.endDate !== 'string' || 
            !Array.isArray(exp.responsibilities)) {
            throw new Error(`Experience entry at index ${index} has missing fields or responsibilities is not an array.`);
        }
        exp.responsibilities = exp.responsibilities.map(r => typeof r === 'string' ? r.trim() : '').filter(r => r.length > 0);
    });

    parsedData.education.forEach((edu, index) => {
        if (typeof edu.degree !== 'string' || typeof edu.institution !== 'string' || typeof edu.graduationDate !== 'string') {
            throw new Error(`Education entry at index ${index} has missing critical fields.`);
        }
        if (edu.details && !Array.isArray(edu.details)) {
             if (typeof edu.details === 'string') { 
                edu.details = (edu.details as string).split(/\\n|\n|,/g).map(d => d.trim()).filter(d => d.length > 0);
             } else {
                edu.details = [];
             }
        } else if (edu.details) {
            edu.details = edu.details.map(d => typeof d === 'string' ? d.trim() : '').filter(d => d.length > 0);
        }
    });
    
    parsedData.skills = parsedData.skills.map(s => typeof s === 'string' ? s.trim() : '').filter(s => s.length > 0);


    return parsedData;

  } catch (error) {
    console.error("Error calling Gemini API or parsing/validating response in generateResumeContent:", error);
    let errorMessage = `Failed to generate resume content.`;
    if (error instanceof Error) {
        if (error.message.includes("SAFETY")) {
            errorMessage = "The generated content was blocked due to safety settings. Please revise your input or try a different approach.";
        } else if (error.message.includes("API_KEY_INVALID") || (error.message.includes("fetch") && error.message.includes("API key"))) {
             errorMessage = "The API key is invalid or missing. Please ensure it is correctly configured.";
        } else if (error.message.startsWith("AI response")) { 
            errorMessage = error.message;
        } else if (error.message.toLowerCase().includes("json")) {
            errorMessage = "The AI returned an invalid format. Please try generating again.";
             console.error("Invalid JSON from AI:", (error as any)?.response?.text || error.message);
        } else {
            errorMessage += ` ${error.message}`;
        }
    } else {
        errorMessage += ` Unknown AI error: ${String(error)}`;
    }
    throw new Error(errorMessage);
  }
};


export const getResumeFeedback = async (
  currentResumeData: ResumeData,
  jobDescription?: string,
  aiCustomizationInstructions?: string,
  targetRole?: string,
  targetIndustry?: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API_KEY environment variable not set. Cannot call Gemini API for feedback.");
  }

  const feedbackPrompt = `
    You are an expert resume reviewer and career coach.
    The user has generated the following resume and would like your feedback.

    Current Resume Data:
    \`\`\`json
    ${JSON.stringify(currentResumeData, null, 2)}
    \`\`\`

    User's Original Context (if provided):
    Target Role: ${targetRole || 'Not specified'}
    Target Industry: ${targetIndustry || 'Not specified'}
    Job Description: ${jobDescription ? `\n---\n${jobDescription}\n---` : 'Not provided'}
    AI Customization Instructions: ${aiCustomizationInstructions ? `\n---\n${aiCustomizationInstructions}\n---` : 'Not provided'}

    Please provide concise, actionable feedback on this resume. Structure your feedback clearly. Focus on:
    1.  **Overall Impression:** Briefly state the strengths and key areas for improvement.
    2.  **Summary Section:** How effective is it? Suggest specific ways to make it more impactful for the target role/industry. If possible, offer a rephrased sentence or two as an example.
    3.  **Experience Section:** Are the bullet points results-oriented and using strong action verbs? Do they quantify achievements where possible? Pick 1-2 bullet points and suggest specific improvements or rewrites.
    4.  **Skills Section:** Is it comprehensive and relevant to the target role/industry? Are there any crucial skills missing or any that could be highlighted better?
    5.  **Education Section:** Is it clear and concise? Any suggestions?
    6.  **ATS Friendliness & Professionalism:** Comment on its suitability for Applicant Tracking Systems and overall professional presentation.
    7.  **Tailoring (if Job Description/Target Role provided):** How well is it tailored? What could be improved?

    Provide your feedback as well-structured text. Users will read this to manually update their resume inputs.
    Be constructive and specific. Do NOT output JSON.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: feedbackPrompt,
      config: {
        temperature: 0.7, // Allow for more descriptive feedback
      },
    });

    return response.text.trim();

  } catch (error) {
    console.error("Error calling Gemini API for feedback:", error);
    let errorMessage = `Failed to get AI feedback.`;
     if (error instanceof Error) {
        if (error.message.includes("SAFETY")) {
            errorMessage = "The feedback request was blocked due to safety settings. Please revise your input or try a different approach.";
        } else if (error.message.includes("API_KEY_INVALID") || (error.message.includes("fetch") && error.message.includes("API key"))) {
             errorMessage = "The API key is invalid or missing. Please ensure it is correctly configured for feedback.";
        } else {
            errorMessage += ` ${error.message}`;
        }
    } else {
        errorMessage += ` Unknown AI error: ${String(error)}`;
    }
    throw new Error(errorMessage);
  }
};
