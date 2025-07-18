export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  portfolio?: string;
  address?: string;
}

export interface ExperienceEntry {
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string; // 'Present' or a date
  responsibilities: string[]; // List of achievements/duties
}

export interface EducationEntry {
  degree: string;
  institution: string;
  location?: string;
  graduationDate: string;
  details?: string[]; // e.g., GPA, honors, relevant coursework
}

export interface ResumeData {
  contact: ContactInfo;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[]; // Could be array of objects for categorized skills
}

// User-provided data structure, more flexible for input
export interface UserExperienceEntry {
  id: string; // for React key
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  achievements: string; // User inputs as a block of text
}

export interface UserEducationEntry {
  id: string; // for React key
  degree: string;
  institution: string;
  location?: string;
  graduationDate: string;
  notes?: string; // User inputs as a block of text
}

export interface UserData {
  personal: {
    name: string;
    email: string;
    phone: string;
    linkedin?: string;
    portfolio?: string;
    address?: string;
    targetRole?: string;
    targetIndustry?: string;
  };
  summary: string; // Or key points for AI to draft
  experience: UserExperienceEntry[];
  education: UserEducationEntry[];
  skills: string; // Comma-separated or block of text
}

export enum TemplateId {
  CLASSIC = 'classic',
  MODERN = 'modern',
  CREATIVE = 'creative',
}

export interface ResumeHistoryItem {
  id: string; // Unique identifier, e.g., timestamp as string
  name: string; // Name from resume.contact.name or default
  timestamp: number; // For sorting and display
  resumeData: ResumeData; // The actual generated resume data
}
