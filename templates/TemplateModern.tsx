
import React from 'react';
import { TemplateProps, SectionTitle, ContactItem, ExperienceItem, EducationItem, SkillsList, MailIcon, PhoneIcon, LinkedInIcon, PortfolioIcon, LocationIcon } from './TemplateBase';

export const TemplateModern: React.FC<TemplateProps> = ({ data }) => {
  const { contact, summary, experience, education, skills } = data;
  const accentColor = "text-purple-600"; 
  const borderAccentColor = "border-purple-500";

  return (
    <div className="font-sans text-gray-700 p-2 sm:p-4 md:p-6 bg-white shadow-lg print-friendly-text">
      <div className="grid grid-cols-12 gap-x-6">
        {/* Left Column (Contact, Skills, optionally Education if short) */}
        <aside className="col-span-12 md:col-span-4 space-y-5 pr-0 md:pr-4 md:border-r border-gray-200 mb-6 md:mb-0">
          <div className="text-center md:text-left">
            <h1 className={`text-3xl font-bold ${accentColor}`}>{contact.name}</h1>
          </div>
          
          <section>
            <h2 className={`text-lg font-semibold ${accentColor} mb-2`}>Contact</h2>
            <div className="space-y-1">
              <ContactItem value={contact.phone} icon={<PhoneIcon className={accentColor}/>} />
              <ContactItem value={contact.email} href={`mailto:${contact.email}`} icon={<MailIcon className={accentColor}/>} />
              {contact.address && <ContactItem value={contact.address} icon={<LocationIcon className={accentColor}/>} />}
              {contact.linkedin && <ContactItem value={contact.linkedin.replace(/^(https?:\/\/)?(www\.)?/, '')} href={contact.linkedin} icon={<LinkedInIcon className={accentColor}/>}/>}
              {contact.portfolio && <ContactItem value={contact.portfolio.replace(/^(https?:\/\/)?(www\.)?/, '')} href={contact.portfolio} icon={<PortfolioIcon className={accentColor}/>}/>}
            </div>
          </section>

          {skills && skills.length > 0 && (
            <section>
              <h2 className={`text-lg font-semibold ${accentColor} mb-2`}>Skills</h2>
              <SkillsList skills={skills} itemClassName={`bg-purple-100 ${accentColor} font-medium`} />
            </section>
          )}

          {education && education.length > 0 && (
            <section className="block md:hidden"> {/* Show education in sidebar on mobile, main on desktop */}
              <SectionTitle className={`${borderAccentColor} ${accentColor}`}>Education</SectionTitle>
              {education.map((edu, index) => (
                 <EducationItem 
                  key={index} 
                  item={edu}
                  degreeClassName={`${accentColor}`}
                  institutionClassName="text-gray-600"
                  dateClassName="text-gray-500"
                />
              ))}
            </section>
          )}
        </aside>

        {/* Right Column (Summary, Experience, Education) */}
        <main className="col-span-12 md:col-span-8 space-y-5">
          {summary && (
            <section>
              <SectionTitle className={`${borderAccentColor} ${accentColor}`}>Summary</SectionTitle>
              <p className="text-sm text-justify">{summary}</p>
            </section>
          )}

          {experience && experience.length > 0 && (
            <section>
              <SectionTitle className={`${borderAccentColor} ${accentColor}`}>Experience</SectionTitle>
              {experience.map((exp, index) => (
                <ExperienceItem 
                  key={index} 
                  item={exp} 
                  titleClassName={`${accentColor}`}
                  companyClassName="text-gray-600"
                  dateClassName="text-gray-500"
                />
              ))}
            </section>
          )}
          
          {education && education.length > 0 && (
             <section className="hidden md:block"> {/* Show education in main on desktop */}
              <SectionTitle className={`${borderAccentColor} ${accentColor}`}>Education</SectionTitle>
              {education.map((edu, index) => (
                 <EducationItem 
                  key={index} 
                  item={edu}
                  degreeClassName={`${accentColor}`}
                  institutionClassName="text-gray-600"
                  dateClassName="text-gray-500"
                />
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
  );
};
