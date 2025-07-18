
import React from 'react';
import { TemplateProps, SectionTitle, ContactItem, ExperienceItem, EducationItem, SkillsList, MailIcon, PhoneIcon, LinkedInIcon, PortfolioIcon, LocationIcon } from './TemplateBase';

export const TemplateClassic: React.FC<TemplateProps> = ({ data }) => {
  const { contact, summary, experience, education, skills } = data;

  return (
    <div className="font-serif text-gray-800 p-2 sm:p-4 md:p-6 bg-white shadow-md print-friendly-text">
      {/* Header */}
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{contact.name}</h1>
        <div className="flex justify-center items-center space-x-3 text-xs text-gray-600 mt-1 flex-wrap">
          <ContactItem value={contact.phone} icon={<PhoneIcon className="text-gray-500"/>} />
          <ContactItem value={contact.email} href={`mailto:${contact.email}`} icon={<MailIcon className="text-gray-500"/>} />
          {contact.address && <ContactItem value={contact.address} icon={<LocationIcon className="text-gray-500"/>}/>}
          {contact.linkedin && <ContactItem value={contact.linkedin.replace(/^(https?:\/\/)?(www\.)?/, '')} href={contact.linkedin} icon={<LinkedInIcon className="text-gray-500"/>}/>}
          {contact.portfolio && <ContactItem value={contact.portfolio.replace(/^(https?:\/\/)?(www\.)?/, '')} href={contact.portfolio} icon={<PortfolioIcon className="text-gray-500"/>}/>}
        </div>
      </header>

      {/* Summary Section */}
      {summary && (
        <section className="mb-4">
          <SectionTitle className="border-gray-700 text-gray-800">Summary</SectionTitle>
          <p className="text-sm text-justify">{summary}</p>
        </section>
      )}

      {/* Experience Section */}
      {experience && experience.length > 0 && (
        <section className="mb-4">
          <SectionTitle className="border-gray-700 text-gray-800">Experience</SectionTitle>
          {experience.map((exp, index) => (
            <ExperienceItem 
              key={index} 
              item={exp} 
              titleClassName="text-gray-800"
              companyClassName="text-gray-700 italic"
              dateClassName="text-gray-500"
              responsibilitiesClassName="text-gray-700"
            />
          ))}
        </section>
      )}

      {/* Education Section */}
      {education && education.length > 0 && (
        <section className="mb-4">
          <SectionTitle className="border-gray-700 text-gray-800">Education</SectionTitle>
          {education.map((edu, index) => (
            <EducationItem 
              key={index} 
              item={edu}
              degreeClassName="text-gray-800"
              institutionClassName="text-gray-700 italic"
              dateClassName="text-gray-500"
              detailsClassName="text-gray-700"
            />
          ))}
        </section>
      )}

      {/* Skills Section */}
      {skills && skills.length > 0 && (
        <section>
          <SectionTitle className="border-gray-700 text-gray-800">Skills</SectionTitle>
          <SkillsList skills={skills} itemClassName="bg-gray-200 text-gray-700" />
        </section>
      )}
    </div>
  );
};
