import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UserData, ResumeData, TemplateId, ResumeHistoryItem } from './types';
import { UserInputForm } from './components/UserInputForm';
import { ResumePreview } from './components/ResumePreview';
import { TemplateSelector } from './components/TemplateSelector';
import { generateResumeContent, getResumeFeedback } from './services/geminiService';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FeedbackModal } from './components/FeedbackModal';
import { ResumeHistoryPanel } from './components/ResumeHistoryPanel';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ShadingType, TabStopType, TabStopPosition, UnderlineType,convertInchesToTwip } from 'docx';

// Make jspdf and html2canvas globally available for PDF generation
declare var jspdf: { jsPDF: new (options?: any) => any };
declare var html2canvas: any;

const MAX_HISTORY_ITEMS = 15;
const LOCAL_STORAGE_HISTORY_KEY = 'intelliresume_history';

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [aiCustomizationInstructions, setAiCustomizationInstructions] = useState<string>('');
  const [uploadedResumeText, setUploadedResumeText] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [generatedResume, setGeneratedResume] = useState<ResumeData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(TemplateId.MODERN);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isFetchingFeedback, setIsFetchingFeedback] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);

  const [resumeHistory, setResumeHistory] = useState<ResumeHistoryItem[]>([]);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState<boolean>(false);


  const resumePreviewRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (storedHistory) {
        setResumeHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage:", e);
      // Optionally clear corrupted history
      // localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(resumeHistory));
    } catch (e) {
      console.error("Failed to save history to localStorage:", e);
    }
  }, [resumeHistory]);

  const addToHistory = (resume: ResumeData) => {
    const newItem: ResumeHistoryItem = {
      id: Date.now().toString(),
      name: resume.contact.name || "Untitled Resume",
      timestamp: Date.now(),
      resumeData: resume,
    };
    setResumeHistory(prevHistory => {
      const updatedHistory = [newItem, ...prevHistory];
      return updatedHistory.slice(0, MAX_HISTORY_ITEMS); // Keep history size limited
    });
  };

  const loadFromHistory = (itemToLoad: ResumeHistoryItem) => {
    setGeneratedResume(itemToLoad.resumeData);
    // Optionally, if you store UserData in history, you could set it here:
    // setUserData(itemToLoad.sourceInputs.userData); 
    // setJobDescription(itemToLoad.sourceInputs.jobDescription);
    // etc.
    setError(null);
    setAiFeedback(null); // Clear feedback when loading old resume
    setIsHistoryPanelOpen(false); // Close panel after loading
    // Scroll to preview if on small screen
    resumePreviewRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const deleteFromHistory = (itemIdToDelete: string) => {
    setResumeHistory(prevHistory => prevHistory.filter(item => item.id !== itemIdToDelete));
  };

  const clearAllHistory = () => {
    if (window.confirm("Are you sure you want to clear all resume history? This action cannot be undone.")) {
      setResumeHistory([]);
    }
  };

  const handleFileUpload = useCallback((fileContent: string, fileName: string) => {
    setUploadedResumeText(fileContent);
    setUploadedFileName(fileName);
    setError(null); 
  }, []);

  const handleClearUploadedFile = useCallback(() => {
    setUploadedResumeText(null);
    setUploadedFileName(null);
  }, []);

  const handleGenerateResume = useCallback(async (currentData: UserData) => {
    setUserData(currentData); 
    if (!currentData.personal.name && !uploadedResumeText) { 
      setError("Please fill in at least your name or upload an existing resume.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedResume(null);
    setAiFeedback(null); 
    setFeedbackError(null); 
    try {
      const resume = await generateResumeContent(currentData, jobDescription, aiCustomizationInstructions, uploadedResumeText);
      setGeneratedResume(resume);
      addToHistory(resume); // Add to history on successful generation
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during resume generation.");
    } finally {
      setIsLoading(false);
    }
  }, [jobDescription, aiCustomizationInstructions, uploadedResumeText]);

  const handleGetAIFeedback = useCallback(async () => {
    if (!generatedResume) return;

    setIsFetchingFeedback(true);
    setAiFeedback(null);
    setFeedbackError(null);
    setIsFeedbackModalOpen(true);

    try {
      const feedback = await getResumeFeedback(
        generatedResume, 
        jobDescription, 
        aiCustomizationInstructions,
        userData?.personal?.targetRole,
        userData?.personal?.targetIndustry
      );
      setAiFeedback(feedback);
    } catch (err) {
      console.error("Error fetching AI feedback:", err);
      setFeedbackError(err instanceof Error ? err.message : "An unknown error occurred while fetching feedback.");
    } finally {
      setIsFetchingFeedback(false);
    }
  }, [generatedResume, jobDescription, aiCustomizationInstructions, userData]);


  const handleDownloadPdf = useCallback(() => {
    if (resumePreviewRef.current) {
      setIsLoading(true);
      html2canvas(resumePreviewRef.current, { 
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff' 
      }) 
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jspdf.jsPDF({ 
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height] 
          });
          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
          pdf.save(`${generatedResume?.contact.name.replace(/\s+/g, '_') || 'resume'}_Resume.pdf`);
        })
        .catch(err => {
          console.error("Error generating PDF:", err);
          setError("Failed to generate PDF. Please try again.");
        })
        .finally(() => setIsLoading(false));
    }
  }, [generatedResume]);

  const handleDownloadHtml = useCallback(() => {
    if (resumePreviewRef.current) {
      const htmlContent = resumePreviewRef.current.innerHTML;
      const fullHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${generatedResume?.contact.name || 'Resume'}'s Resume</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { margin: 0; font-family: sans-serif; background-color: #f3f4f6; display: flex; justify-content: center; padding-top: 20px; padding-bottom: 20px; }
            .resume-container { background-color: white; width: 8.5in; min-height: 11in; box-shadow: 0 0 10px rgba(0,0,0,0.1); margin: auto; }
            .print-friendly-text {
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                text-rendering: optimizeLegibility;
            }
          </style>
        </head>
        <body>
          <div class="resume-container">
            ${htmlContent}
          </div>
        </body>
        </html>
      `;
      const blob = new Blob([fullHtml], { type: 'text/html' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${generatedResume?.contact.name.replace(/\s+/g, '_') || 'resume'}_Resume.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }
  }, [generatedResume, resumePreviewRef]);

  const handleDownloadDocx = useCallback(async () => {
    if (!generatedResume) return;
    setIsLoading(true);

    const { contact, summary, experience, education, skills } = generatedResume;

    const children = [];

    // Contact Info
    children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: contact.name, bold: true, size: 36, font: "Calibri" })],
    }));
    
    const contactParts = [
        contact.phone,
        contact.email,
        contact.address,
        contact.linkedin ? contact.linkedin.replace(/^(https?:\/\/)?(www\.)?/, '') : null,
        contact.portfolio ? contact.portfolio.replace(/^(https?:\/\/)?(www\.)?/, '') : null,
    ].filter(Boolean);

    children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: contactParts.join(' | '), size: 20, font: "Calibri" })],
        spacing: { after: 200 },
    }));

    // Summary
    if (summary) {
        children.push(new Paragraph({
            children: [new TextRun({ text: "Summary", bold: true, size: 28, font: "Calibri", underline: { type: UnderlineType.SINGLE } })],
            spacing: { after: 100 },
        }));
        children.push(new Paragraph({
            children: [new TextRun({ text: summary, size: 22, font: "Calibri" })],
            spacing: { after: 200 },
        }));
    }

    // Experience
    if (experience && experience.length > 0) {
        children.push(new Paragraph({
            children: [new TextRun({ text: "Experience", bold: true, size: 28, font: "Calibri", underline: { type: UnderlineType.SINGLE } })],
            spacing: { after: 100 },
        }));
        experience.forEach(exp => {
            children.push(new Paragraph({
                children: [
                    new TextRun({ text: exp.jobTitle, bold: true, size: 24, font: "Calibri" }),
                ],
                spacing: { after: 50 }
            }));
            children.push(new Paragraph({
                children: [
                    new TextRun({ text: `${exp.company} | ${exp.location}`, italics: true, size: 22, font: "Calibri" }),
                    new TextRun({ text: `\t${exp.startDate} - ${exp.endDate}`, size: 22, font: "Calibri" }),
                ],
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                spacing: { after: 50 }
            }));
            exp.responsibilities.forEach(resp => {
                children.push(new Paragraph({
                    children: [new TextRun({ text: resp, size: 22, font: "Calibri" })],
                    bullet: { level: 0 },
                    indent: { left: convertInchesToTwip(0.25) },
                }));
            });
            children.push(new Paragraph({ spacing: { after: 150 }})); // Spacing after each entry
        });
    }

    // Education
    if (education && education.length > 0) {
        children.push(new Paragraph({
            children: [new TextRun({ text: "Education", bold: true, size: 28, font: "Calibri", underline: { type: UnderlineType.SINGLE } })],
            spacing: { after: 100 },
        }));
        education.forEach(edu => {
            children.push(new Paragraph({
                children: [new TextRun({ text: edu.degree, bold: true, size: 24, font: "Calibri" })],
                 spacing: { after: 50 }
            }));
            children.push(new Paragraph({
                children: [
                    new TextRun({ text: `${edu.institution}${edu.location ? ` | ${edu.location}` : ''}`, italics: true, size: 22, font: "Calibri" }),
                    new TextRun({ text: `\t${edu.graduationDate}`, size: 22, font: "Calibri" }),
                ],
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                spacing: { after: 50 }
            }));
            if (edu.details && edu.details.length > 0) {
                edu.details.forEach(detail => {
                    children.push(new Paragraph({
                        children: [new TextRun({ text: detail, size: 22, font: "Calibri" })],
                        bullet: { level: 0 },
                        indent: { left: convertInchesToTwip(0.25) },
                    }));
                });
            }
             children.push(new Paragraph({ spacing: { after: 150 }}));
        });
    }

    // Skills
    if (skills && skills.length > 0) {
        children.push(new Paragraph({
            children: [new TextRun({ text: "Skills", bold: true, size: 28, font: "Calibri", underline: { type: UnderlineType.SINGLE } })],
            spacing: { after: 100 },
        }));
        // Display skills as a comma-separated list or bullet points
         const skillChunks = [];
         const chunkSize = 3; // Number of skills per line for better readability if not using bullets
         for (let i = 0; i < skills.length; i += chunkSize) {
             skillChunks.push(skills.slice(i, i + chunkSize).join('  •  '));
         }
         skillChunks.forEach(chunk => {
            children.push(new Paragraph({
                children: [new TextRun({ text: chunk, size: 22, font: "Calibri" })],
                // Or use bullet points for each skill:
                // bullet: { level: 0 },
                // indent: { left: convertInchesToTwip(0.25) },
            }));
         });
    }

    const doc = new Document({
        creator: "IntelliResume AI",
        title: `${contact.name}'s Resume`,
        description: "Resume generated by IntelliResume AI",
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: convertInchesToTwip(0.75),
                        right: convertInchesToTwip(0.75),
                        bottom: convertInchesToTwip(0.75),
                        left: convertInchesToTwip(0.75),
                    },
                },
            },
            children: children,
        }],
        styles: {
            paragraphStyles: [
                {
                    id: "normalPara",
                    name: "Normal Para",
                    basedOn: "Normal",
                    next: "Normal",
                    quickFormat: true,
                    run: {
                        font: "Calibri",
                        size: 22, // 11pt
                    },
                },
                 {
                    id: "heading1",
                    name: "Heading 1",
                    basedOn: "Normal",
                    next: "Normal",
                    quickFormat: true,
                    run: {
                        font: "Calibri",
                        size: 36, // 18pt
                        bold: true,
                    },
                    paragraph: {
                        spacing: { before: 240, after: 120 }, // 12pt before, 6pt after
                    },
                },
            ]
        }
    });

    try {
        const blob = await Packer.toBlob(doc);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${contact.name.replace(/\s+/g, '_') || 'resume'}_Resume.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    } catch (e) {
        console.error("Error generating DOCX:", e);
        setError("Failed to generate DOCX file. Please try again.");
    } finally {
        setIsLoading(false);
    }
  }, [generatedResume]);


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6 bg-slate-800 p-6 rounded-xl shadow-2xl h-full flex flex-col">
            <h2 className="text-3xl font-bold text-purple-400 border-b-2 border-purple-500 pb-2">Craft Your Resume</h2>
            <div className="flex-grow overflow-y-auto pr-2"> {/* Added for scrolling form area */}
              <UserInputForm 
                onSubmit={handleGenerateResume} 
                initialData={userData} 
                setIsLoading={setIsLoading}
                onFileUpload={handleFileUpload}
                uploadedFileName={uploadedFileName}
                onClearUploadedFile={handleClearUploadedFile}
              />
              <div className="space-y-2 mt-6">
                <label htmlFor="jobDescription" className="block text-sm font-medium text-purple-300">
                  Optional: Job Description (for AI tailoring)
                </label>
                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-200 placeholder-gray-500"
                  placeholder="Paste job description here..."
                  aria-label="Job Description for AI tailoring"
                />
              </div>
               <div className="space-y-2 mt-4">
                <label htmlFor="aiCustomization" className="block text-sm font-medium text-purple-300">
                  AI Customization Instructions (Optional)
                </label>
                <textarea
                  id="aiCustomization"
                  value={aiCustomizationInstructions}
                  onChange={(e) => setAiCustomizationInstructions(e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-200 placeholder-gray-500"
                  placeholder="e.g., 'Make it formal for a finance role', 'Emphasize leadership skills', 'Generate a complete resume for a graphic designer if my input is sparse.'"
                  aria-label="AI Customization Instructions"
                />
              </div>
              <div className="mt-6">
                <TemplateSelector selectedTemplate={selectedTemplate} onSelectTemplate={setSelectedTemplate} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-800 p-4 rounded-xl shadow-2xl sticky top-4 z-10"> {/* History toggle and panel */}
                <button
                    onClick={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
                    className="w-full px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-150 ease-in-out flex items-center justify-center space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                    <span>{isHistoryPanelOpen ? 'Hide' : 'Show'} Resume History ({resumeHistory.length})</span>
                </button>
                {isHistoryPanelOpen && (
                    <ResumeHistoryPanel
                        history={resumeHistory}
                        onLoad={loadFromHistory}
                        onDelete={deleteFromHistory}
                        onClearAll={clearAllHistory}
                    />
                )}
            </div>

             {(isLoading || isFetchingFeedback && isFeedbackModalOpen) && ( 
              <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50" aria-live="assertive" role="dialog" aria-labelledby="loading-message">
                <LoadingSpinner />
                <p id="loading-message" className="ml-0 mt-4 text-xl text-white">
                    {isLoading ? (isFetchingFeedback ? "Getting AI feedback..." : "Working on it...") : "Getting AI feedback..."} 
                </p>
              </div>
            )}
            {error && (
              <div className="bg-red-700 border border-red-900 text-white px-4 py-3 rounded-md shadow-lg relative" role="alert">
                <strong className="font-bold">Oops! </strong>
                <span className="block sm:inline">{error}</span>
                <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-200 hover:text-white" aria-label="Close error message">
                  <svg className="fill-current h-6 w-6" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                </button>
              </div>
            )}
            
            {generatedResume ? (
              <div className="bg-slate-800 p-1 rounded-xl shadow-2xl">
                 <div className="bg-slate-700 p-3 sm:p-4 rounded-t-lg flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 flex-wrap">
                    <h3 className="text-xl sm:text-2xl font-semibold text-purple-400">Preview</h3>
                    <div className="flex space-x-1 sm:space-x-2 flex-wrap justify-center gap-y-2">
                        <button
                            onClick={handleGetAIFeedback}
                            disabled={isLoading || isFetchingFeedback}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out disabled:opacity-50 flex items-center space-x-2 text-xs sm:text-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.95a7.5 7.5 0 1 0 0 14.1H10V4.95z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 7.502 6M13.5 10.5l1.65-1.65m0 0l1.65 1.65m-1.65-1.65V4.5m0 7.5v3.15m0 0L16.5 15m-1.65-.35V19.5" /></svg>
                            <span>AI Feedback</span>
                        </button>
                        <button
                            onClick={handleDownloadPdf}
                            disabled={isLoading}
                            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-150 ease-in-out disabled:opacity-50 flex items-center space-x-2 text-xs sm:text-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                            <span>PDF</span>
                        </button>
                        <button
                            onClick={handleDownloadHtml}
                            disabled={isLoading}
                            className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 transition duration-150 ease-in-out disabled:opacity-50 flex items-center space-x-2 text-xs sm:text-sm"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                            <span>HTML</span>
                        </button>
                        <button
                            onClick={handleDownloadDocx}
                            disabled={isLoading}
                            className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-50 transition duration-150 ease-in-out disabled:opacity-50 flex items-center space-x-2 text-xs sm:text-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                            <span>DOCX</span>
                        </button>
                    </div>
                </div>
                <div ref={resumePreviewRef} className="bg-white text-gray-900 p-2 sm:p-4 md:p-6 lg:p-8 min-h-[calc(100vh-320px)] md:min-h-[750px] rounded-b-xl overflow-auto" aria-label="Resume Preview Area">
                    <ResumePreview data={generatedResume} templateId={selectedTemplate} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] lg:h-full min-h-[400px] bg-slate-800 p-6 rounded-xl shadow-2xl text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 text-purple-500 mb-6" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <h3 className="text-2xl font-semibold text-purple-400 mb-2">Your Resume Will Appear Here</h3>
                <p className="text-slate-400">Fill in your details, (optionally) upload an existing resume, select a template, and click "Generate Resume" to see the magic happen! Or load a resume from your history.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      {isFeedbackModalOpen && (
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          feedback={aiFeedback}
          error={feedbackError}
          isLoading={isFetchingFeedback}
        />
      )}
    </div>
  );
};

export default App;