
import React, { useState, useEffect, useRef } from 'react';
import { UserData, UserExperienceEntry, UserEducationEntry } from '../types';

interface UserInputFormProps {
  onSubmit: (data: UserData) => void;
  initialData?: UserData | null;
  setIsLoading: (loading: boolean) => void;
  onFileUpload: (fileContent: string, fileName: string) => void;
  uploadedFileName: string | null;
  onClearUploadedFile: () => void;
}

const initialFormState: UserData = {
  personal: { name: '', email: '', phone: '', linkedin: '', portfolio: '', address: '', targetRole: '', targetIndustry: '' },
  summary: '',
  experience: [],
  education: [],
  skills: '',
};

export const UserInputForm: React.FC<UserInputFormProps> = ({ 
    onSubmit, 
    initialData, 
    setIsLoading,
    onFileUpload,
    uploadedFileName,
    onClearUploadedFile
}) => {
  const [formData, setFormData] = useState<UserData>(initialData || initialFormState);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handlePersonalChange = (field: keyof UserData['personal'], value: string) => {
    setFormData(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value,
      },
    }));
  };

  const handleTextChange = (section: 'summary' | 'skills', value: string) => {
    setFormData(prev => ({ ...prev, [section]: value }));
  };
  
  const handleListChange = <S extends 'experience' | 'education'>(
    section: S,
    index: number,
    field: S extends 'experience' ? keyof UserExperienceEntry : keyof UserEducationEntry,
    value: string
  ) => {
    setFormData(prev => {
      if (section === 'experience') {
        const newList = [...prev.experience];
        newList[index] = { ...newList[index], [field as keyof UserExperienceEntry]: value };
        return { ...prev, experience: newList };
      } else { 
        const newList = [...prev.education];
        newList[index] = { ...newList[index], [field as keyof UserEducationEntry]: value };
        return { ...prev, education: newList };
      }
    });
  };

  const addListItem = (section: 'experience' | 'education') => {
    const newItem = section === 'experience'
      ? { id: Date.now().toString(), jobTitle: '', company: '', location: '', startDate: '', endDate: '', achievements: '' }
      : { id: Date.now().toString(), degree: '', institution: '', location: '', graduationDate: '', notes: '' };
    
    setFormData(prev => {
      if (section === 'experience') {
        return {
          ...prev,
          experience: [...prev.experience, newItem as UserExperienceEntry],
        };
      } else {
        return {
          ...prev,
          education: [...prev.education, newItem as UserEducationEntry],
        };
      }
    });
  };

  const removeListItem = (section: 'experience' | 'education', index: number) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("File is too large. Please upload a file smaller than 5MB.");
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        return;
      }
      if (!['text/plain', 'text/markdown'].includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
        alert("Invalid file type. Please upload a .txt or .md file.");
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const textContent = e.target?.result as string;
        onFileUpload(textContent, file.name);
      };
      reader.onerror = () => {
        alert("Error reading file. Please try again.");
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
      }
      reader.readAsText(file);
    }
  };
  
  const handleClearFile = () => {
    if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset the actual file input
    }
    onClearUploadedFile();
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); 
    onSubmit(formData);
  };

  const inputClass = "w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-200 placeholder-gray-500";
  const labelClass = "block text-sm font-medium text-purple-300 mb-1";
  const buttonClass = "px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-150 ease-in-out";
  const sectionTitleClass = "text-xl font-semibold text-purple-400 mt-6 mb-3 border-b border-slate-700 pb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <div>
        <h3 className={sectionTitleClass}>Upload Existing Resume (Optional)</h3>
        <p className="text-xs text-slate-400 mb-2">Upload a .txt or .md file. The AI will use its content as a base.</p>
        <input 
          type="file" 
          id="resumeUpload" 
          ref={fileInputRef}
          onChange={handleFileChange} 
          accept=".txt,.md,text/plain,text/markdown" 
          className="hidden" 
          aria-label="Upload existing resume"
        />
        <label 
          htmlFor="resumeUpload" 
          className={`${buttonClass} bg-indigo-600 hover:bg-indigo-700 w-full cursor-pointer flex items-center justify-center space-x-2`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 13.5v-7.5A2.25 2.25 0 015.25 3.75h13.5A2.25 2.25 0 0121 6v7.5m-18 0v3A2.25 2.25 0 005.25 18.75h13.5A2.25 2.25 0 0021 16.5v-3" /></svg>
          <span>{uploadedFileName ? 'Change File' : 'Upload Resume File'}</span>
        </label>
        {uploadedFileName && (
          <div className="mt-2 text-sm text-slate-300 flex items-center justify-between p-2 bg-slate-700 rounded-md">
            <span className="truncate" title={uploadedFileName}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline mr-2 text-green-400"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                {uploadedFileName}
            </span>
            <button 
              type="button" 
              onClick={handleClearFile} 
              className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-slate-600 transition-colors"
              aria-label="Clear uploaded resume"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
      </div>

      <div>
        <h3 className={sectionTitleClass}>Personal Information</h3>
        <p className="text-xs text-slate-400 mb-2">Fill this if your uploaded resume is incomplete or you want to override details.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className={labelClass}>Full Name</label>
            <input type="text" id="name" value={formData.personal.name} onChange={(e) => handlePersonalChange('name', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input type="email" id="email" value={formData.personal.email} onChange={(e) => handlePersonalChange('email', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>Phone</label>
            <input type="tel" id="phone" value={formData.personal.phone} onChange={(e) => handlePersonalChange('phone', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="address" className={labelClass}>Address (City, State)</label>
            <input type="text" id="address" value={formData.personal.address || ''} onChange={(e) => handlePersonalChange('address', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="linkedin" className={labelClass}>LinkedIn Profile URL</label>
            <input type="url" id="linkedin" value={formData.personal.linkedin || ''} onChange={(e) => handlePersonalChange('linkedin', e.target.value)} className={inputClass} placeholder="https://linkedin.com/in/yourprofile"/>
          </div>
          <div>
            <label htmlFor="portfolio" className={labelClass}>Portfolio/Website URL</label>
            <input type="url" id="portfolio" value={formData.personal.portfolio || ''} onChange={(e) => handlePersonalChange('portfolio', e.target.value)} className={inputClass} placeholder="https://yourportfolio.com"/>
          </div>
           <div>
            <label htmlFor="targetRole" className={labelClass}>Target Role (Optional)</label>
            <input type="text" id="targetRole" value={formData.personal.targetRole || ''} onChange={(e) => handlePersonalChange('targetRole', e.target.value)} className={inputClass} placeholder="e.g., Senior Software Engineer"/>
          </div>
          <div>
            <label htmlFor="targetIndustry" className={labelClass}>Target Industry (Optional)</label>
            <input type="text" id="targetIndustry" value={formData.personal.targetIndustry || ''} onChange={(e) => handlePersonalChange('targetIndustry', e.target.value)} className={inputClass} placeholder="e.g., Tech, Healthcare"/>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="summary" className={`${labelClass} ${sectionTitleClass}`}>Professional Summary/Objective</label>
        <textarea id="summary" value={formData.summary} onChange={(e) => handleTextChange('summary', e.target.value)} rows={4} className={inputClass} placeholder="Describe your key skills, experience, and career goals. AI will refine this or use uploaded content." />
      </div>

      <div>
        <h3 className={sectionTitleClass}>Work Experience</h3>
        {formData.experience.map((exp, index) => (
          <div key={exp.id} className="p-4 border border-slate-700 rounded-md mb-4 space-y-3 bg-slate-750 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>Job Title</label><input type="text" value={exp.jobTitle} onChange={(e) => handleListChange('experience', index, 'jobTitle', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Company</label><input type="text" value={exp.company} onChange={(e) => handleListChange('experience', index, 'company', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Location</label><input type="text" value={exp.location} onChange={(e) => handleListChange('experience', index, 'location', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Start Date (MM/YYYY)</label><input type="text" value={exp.startDate} onChange={(e) => handleListChange('experience', index, 'startDate', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>End Date (MM/YYYY or Present)</label><input type="text" value={exp.endDate} onChange={(e) => handleListChange('experience', index, 'endDate', e.target.value)} className={inputClass} /></div>
            </div>
            <div>
              <label className={labelClass}>Achievements/Responsibilities</label>
              <textarea value={exp.achievements} onChange={(e) => handleListChange('experience', index, 'achievements', e.target.value)} rows={5} className={inputClass} placeholder="Describe your key responsibilities and accomplishments. AI will format this or use uploaded content." />
            </div>
            <button type="button" onClick={() => removeListItem('experience', index)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-slate-600 transition-colors" aria-label={`Remove experience entry ${index + 1}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.342.052.682.107 1.022.166m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>
        ))}
        <button type="button" onClick={() => addListItem('experience')} className={`${buttonClass} bg-green-600 hover:bg-green-700 flex items-center space-x-2`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            <span>Add Experience</span>
        </button>
      </div>

      <div>
        <h3 className={sectionTitleClass}>Education</h3>
        {formData.education.map((edu, index) => (
          <div key={edu.id} className="p-4 border border-slate-700 rounded-md mb-4 space-y-3 bg-slate-750 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>Degree/Certificate</label><input type="text" value={edu.degree} onChange={(e) => handleListChange('education', index, 'degree', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Institution</label><input type="text" value={edu.institution} onChange={(e) => handleListChange('education', index, 'institution', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Location (Optional)</label><input type="text" value={edu.location || ''} onChange={(e) => handleListChange('education', index, 'location', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Graduation Date (MM/YYYY or Expected)</label><input type="text" value={edu.graduationDate} onChange={(e) => handleListChange('education', index, 'graduationDate', e.target.value)} className={inputClass} /></div>
            </div>
            <div>
              <label className={labelClass}>Notes (GPA, Honors, Relevant Coursework)</label>
              <textarea value={edu.notes || ''} onChange={(e) => handleListChange('education', index, 'notes', e.target.value)} rows={3} className={inputClass} placeholder="e.g., GPA: 3.8/4.0, Dean's List. AI will format this or use uploaded content." />
            </div>
             <button type="button" onClick={() => removeListItem('education', index)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-slate-600 transition-colors" aria-label={`Remove education entry ${index + 1}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.342.052.682.107 1.022.166m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
            </button>
          </div>
        ))}
        <button type="button" onClick={() => addListItem('education')} className={`${buttonClass} bg-green-600 hover:bg-green-700 flex items-center space-x-2`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            <span>Add Education</span>
        </button>
      </div>

      <div>
        <label htmlFor="skills" className={`${labelClass} ${sectionTitleClass}`}>Skills</label>
        <textarea id="skills" value={formData.skills} onChange={(e) => handleTextChange('skills', e.target.value)} rows={4} className={inputClass} placeholder="Enter skills, comma-separated or as a list. AI will format/enhance or use uploaded content." />
      </div>

      <button type="submit" className={`${buttonClass} w-full py-3 text-lg font-bold flex items-center justify-center space-x-2`}>
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
        <span>Generate Resume</span>
      </button>
    </form>
  );
};
