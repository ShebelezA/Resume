import React from 'react';
import { ResumeHistoryItem } from '../types';

interface ResumeHistoryPanelProps {
  history: ResumeHistoryItem[];
  onLoad: (item: ResumeHistoryItem) => void;
  onDelete: (itemId: string) => void;
  onClearAll: () => void;
}

export const ResumeHistoryPanel: React.FC<ResumeHistoryPanelProps> = ({ history, onLoad, onDelete, onClearAll }) => {
  return (
    <div className="mt-4 p-4 bg-slate-700 rounded-lg shadow-inner max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-lg font-semibold text-purple-300">Saved Resumes</h4>
        {history.length > 0 && (
          <button
            onClick={onClearAll}
            className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-150"
            aria-label="Clear all resume history"
          >
            Clear All
          </button>
        )}
      </div>
      {history.length === 0 ? (
        <p className="text-slate-400 text-sm">No resumes saved in history yet.</p>
      ) : (
        <ul className="space-y-2">
          {history.map((item) => (
            <li key={item.id} className="p-3 bg-slate-600 rounded-md shadow flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
              <div className="flex-grow">
                <p className="font-medium text-purple-300 truncate" title={item.name}>{item.name}</p>
                <p className="text-xs text-slate-400">
                  {new Date(item.timestamp).toLocaleDateString()} - {new Date(item.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex space-x-2 flex-shrink-0">
                <button
                  onClick={() => onLoad(item)}
                  className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={`Load resume for ${item.name}`}
                >
                  Load
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="px-3 py-1 text-xs bg-red-700 hover:bg-red-800 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label={`Delete resume for ${item.name}`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
