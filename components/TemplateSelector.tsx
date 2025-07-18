
import React from 'react';
import { TemplateId } from '../types';
import { TEMPLATE_OPTIONS } from '../constants';


interface TemplateSelectorProps {
  selectedTemplate: TemplateId;
  onSelectTemplate: (templateId: TemplateId) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selectedTemplate, onSelectTemplate }) => {
  return (
    <div className="space-y-3">
      <label className="block text-xl font-semibold text-purple-400 mb-3 border-b border-slate-700 pb-2">Select Template</label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TEMPLATE_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelectTemplate(option.id as TemplateId)}
            className={`p-3 rounded-lg text-center font-medium transition-all duration-200 ease-in-out
                        ${selectedTemplate === option.id 
                            ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-800 scale-105' 
                            : 'bg-slate-700 text-purple-300 hover:bg-slate-600 hover:text-purple-200 transform hover:scale-105'}`}
          >
            {option.name}
          </button>
        ))}
      </div>
    </div>
  );
};
