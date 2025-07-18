
import React from 'react';
import { ResumeData, ExperienceEntry, EducationEntry } from '../types';

export interface TemplateProps {
  data: ResumeData;
}

export const SectionTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <h2 className={`text-xl font-bold border-b-2 pb-1 mb-2 ${className}`}>{children}</h2>
);

export const ContactItem: React.FC<{ icon?: React.ReactNode; label?: string; value?: string; href?: string, className?: string }> = ({ icon, label, value, href, className }) => {
  if (!value) return null;
  const linkClass = "hover:underline hover:text-purple-500 transition-colors";
  const content = href ? <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>{value}</a> : <span>{value}</span>;
  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      {icon}
      {label && <span className="font-semibold">{label}:</span>}
      {content}
    </div>
  );
};

export const ExperienceItem: React.FC<{ item: ExperienceEntry; itemClassName?: string; titleClassName?: string; companyClassName?: string; dateClassName?: string; responsibilitiesClassName?: string; listItemClassName?: string; }> = ({ item, itemClassName, titleClassName, companyClassName, dateClassName, responsibilitiesClassName, listItemClassName }) => (
  <div className={`mb-3 ${itemClassName}`}>
    <div className="flex justify-between items-start">
        <div>
            <h3 className={`font-semibold text-md ${titleClassName}`}>{item.jobTitle}</h3>
            <p className={`text-sm ${companyClassName}`}>{item.company} {item.location && `| ${item.location}`}</p>
        </div>
        <p className={`text-xs text-gray-600 whitespace-nowrap ${dateClassName}`}>{item.startDate} - {item.endDate}</p>
    </div>
    {item.responsibilities && item.responsibilities.length > 0 && (
      <ul className={`list-disc list-inside pl-1 text-sm space-y-0.5 mt-1 ${responsibilitiesClassName}`}>
        {item.responsibilities.map((resp, i) => <li key={i} className={listItemClassName}>{resp}</li>)}
      </ul>
    )}
  </div>
);

export const EducationItem: React.FC<{ item: EducationEntry; itemClassName?: string; degreeClassName?: string; institutionClassName?: string; dateClassName?: string; detailsClassName?: string; listItemClassName?: string; }> = ({ item, itemClassName, degreeClassName, institutionClassName, dateClassName, detailsClassName, listItemClassName }) => (
  <div className={`mb-3 ${itemClassName}`}>
    <div className="flex justify-between items-start">
      <div>
        <h3 className={`font-semibold text-md ${degreeClassName}`}>{item.degree}</h3>
        <p className={`text-sm ${institutionClassName}`}>{item.institution} {item.location && `| ${item.location}`}</p>
      </div>
      <p className={`text-xs text-gray-600 whitespace-nowrap ${dateClassName}`}>{item.graduationDate}</p>
    </div>
    {item.details && item.details.length > 0 && (
      <ul className={`list-disc list-inside pl-1 text-sm space-y-0.5 mt-1 ${detailsClassName}`}>
        {item.details.map((detail, i) => <li key={i} className={listItemClassName}>{detail}</li>)}
      </ul>
    )}
  </div>
);

export const SkillsList: React.FC<{ skills: string[]; className?: string; itemClassName?: string }> = ({ skills, className, itemClassName }) => (
  <div className={`flex flex-wrap gap-2 ${className}`}>
    {skills.map((skill, i) => (
      <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${itemClassName}`}>
        {skill}
      </span>
    ))}
  </div>
);

// SVG Icons (Heroicons)
export const MailIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

export const PhoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

export const LinkedInIcon: React.FC<{ className?: string }> = ({ className }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${className}`}>
    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.25 6.5 1.75 1.75 0 016.5 8.25zM19 19h-3v-4.75c0-1.25-.5-2.25-1.75-2.25S12.5 13 12.5 14.25V19h-3v-9h2.9v1.35C13.09 9.8 14.25 9 15.75 9c2.75 0 4.25 1.75 4.25 5.25V19z"/>
 </svg>
);

export const PortfolioIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);

export const LocationIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);
