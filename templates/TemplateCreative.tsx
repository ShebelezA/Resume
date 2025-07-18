
import React from 'react';
import { TemplateProps, SectionTitle, ContactItem, ExperienceItem, EducationItem, SkillsList, MailIcon, PhoneIcon, LinkedInIcon, PortfolioIcon, LocationIcon } from './TemplateBase';

export const TemplateCreative: React.FC<TemplateProps> = ({ data }) => {
  const { contact, summary, experience, education, skills } = data;
  const primaryColor = "text-teal-600";
  const secondaryColor = "text-gray-700";
  const backgroundColor = "bg-teal-50"; 
  const accentBorder = "border-teal-500";

  return (
    <div className={`font-sans ${secondaryColor} p-2 sm:p-4 md:p-6 bg-white shadow-xl print-friendly-text`}>
      {/* Header with Background */}
      <header className={`p-6 ${backgroundColor} rounded-t-lg mb-6 text-center`}>
        <h1 className={`text-4xl font-extrabold ${primaryColor}`}>{contact.name}</h1>
        <div className="flex justify-center items-center space-x-4 text-xs ${secondaryColor} mt-2 flex-wrap">
          <ContactItem value={contact.phone} icon={<PhoneIcon className={primaryColor}/>} />
          <ContactItem value={contact.email} href={`mailto:${contact.email}`} icon={<MailIcon className={primaryColor}/>} />
          {contact.address && <ContactItem value={contact.address} icon={<LocationIcon className={primaryColor}/>} />}
          {contact.linkedin && <ContactItem value={contact.linkedin.replace(/^(https?:\/\/)?(www\.)?/, '')} href={contact.linkedin} icon={<LinkedInIcon className={primaryColor}/>}/>}
          {contact.portfolio && <ContactItem value={contact.portfolio.replace(/^(https?:\/\/)?(www\.)?/, '')} href={contact.portfolio} icon={<PortfolioIcon className={primaryColor}/>}/>}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="space-y-6">
        {summary && (
          <section>
            <SectionTitle className={`${accentBorder} ${primaryColor} text-2xl`}>About Me</SectionTitle>
            <p className={`text-sm italic ${secondaryColor}`}>{summary}</p>
          </section>
        )}

        {experience && experience.length > 0 && (
          <section>
            <SectionTitle className={`${accentBorder} ${primaryColor} text-2xl`}>Career Journey</SectionTitle>
            {experience.map((exp, index) => (
              <ExperienceItem 
                key={index} 
                item={exp}
                itemClassName="py-2"
                titleClassName={`text-lg ${primaryColor}`}
                companyClassName={`${secondaryColor} font-medium`}
                dateClassName="text-teal-500"
                responsibilitiesClassName={`${secondaryColor}`}
                listItemClassName="before:content-['\27A4'] before:mr-2 before:text-teal-500" // Custom bullet
              />
            ))}
          </section>
        )}

        {education && education.length > 0 && (
          <section>
            <SectionTitle className={`${accentBorder} ${primaryColor} text-2xl`}>Education</SectionTitle>
            {education.map((edu, index) => (
               <EducationItem 
                key={index} 
                item={edu}
                itemClassName="py-2"
                degreeClassName={`text-lg ${primaryColor}`}
                institutionClassName={`${secondaryColor} font-medium`}
                dateClassName="text-teal-500"
                detailsClassName={`${secondaryColor}`}
                listItemClassName="before:content-['\27A4'] before:mr-2 before:text-teal-500" // Custom bullet
              />
            ))}
          </section>
        )}

        {skills && skills.length > 0 && (
          <section>
            <SectionTitle className={`${accentBorder} ${primaryColor} text-2xl`}>My Skillset</SectionTitle>
            <SkillsList skills={skills} className="mt-2" itemClassName={`bg-teal-500 text-white shadow-sm`} />
          </section>
        )}
      </div>
    </div>
  );
};
