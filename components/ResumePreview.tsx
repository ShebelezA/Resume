
import React from 'react';
import { ResumeData, TemplateId } from '../types';
import { TemplateClassic } from '../templates/TemplateClassic';
import { TemplateModern } from '../templates/TemplateModern';
import { TemplateCreative } from '../templates/TemplateCreative';

interface ResumePreviewProps {
  data: ResumeData | null;
  templateId: TemplateId;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, templateId }) => {
  if (!data) {
    return <div className="p-8 text-center text-gray-500">Resume preview will appear here once generated.</div>;
  }

  switch (templateId) {
    case TemplateId.CLASSIC:
      return <TemplateClassic data={data} />;
    case TemplateId.MODERN:
      return <TemplateModern data={data} />;
    case TemplateId.CREATIVE:
      return <TemplateCreative data={data} />;
    default:
      return <TemplateModern data={data} />; // Default to modern
  }
};
