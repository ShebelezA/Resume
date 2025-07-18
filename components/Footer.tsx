
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-800 text-slate-400 text-center p-4 shadow-top mt-auto">
      <p>&copy; {new Date().getFullYear()} IntelliResume AI. Powered by Generative AI.</p>
      <p className="text-xs mt-1">Note: Always review and customize your AI-generated resume.</p>
    </footer>
  );
};
