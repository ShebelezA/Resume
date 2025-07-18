
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: string | null;
  error: string | null;
  isLoading: boolean;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, feedback, error, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 id="feedback-modal-title" className="text-2xl font-semibold text-purple-400">
            AI Resume Feedback
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-200"
            aria-label="Close feedback modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="overflow-y-auto flex-grow pr-2 text-slate-300 space-y-3">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <LoadingSpinner />
              <p className="mt-3 text-slate-300">Fetching feedback from AI...</p>
            </div>
          )}
          {error && !isLoading && (
            <div className="bg-red-700/50 border border-red-700 text-white px-4 py-3 rounded" role="alert">
              <strong className="font-bold">Error: </strong>
              <span>{error}</span>
            </div>
          )}
          {feedback && !isLoading && !error && (
            <div 
              className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap" 
              dangerouslySetInnerHTML={{ __html: feedback.replace(/\n/g, '<br />') }} // Basic formatting, consider markdown parser for richer text
            />
          )}
          {!isLoading && !error && !feedback && (
             <p className="text-slate-400">No feedback to display at the moment.</p>
          )}
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
