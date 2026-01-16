
import React from 'react';
import { PlantHealthReport, GroundingResult } from '../types';

interface ReportDisplayProps {
  report: PlantHealthReport;
  imageUrl: string;
  iconUrl?: string;
  isGeneratingIcon?: boolean;
  onGenerateIcon?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onSearchProducts: () => void;
  onFindLocalHelp: () => void;
  onSpeakReport: () => void;
  searchResult?: GroundingResult | null;
  localHelpResult?: GroundingResult | null;
  isSearchingProducts?: boolean;
  isSearchingLocal?: boolean;
  isSpeaking?: boolean;
}

export const ReportDisplay: React.FC<ReportDisplayProps> = ({ 
  report, 
  imageUrl, 
  iconUrl, 
  isGeneratingIcon,
  onGenerateIcon,
  isFavorite,
  onToggleFavorite,
  onSearchProducts,
  onFindLocalHelp,
  onSpeakReport,
  searchResult,
  localHelpResult,
  isSearchingProducts,
  isSearchingLocal,
  isSpeaking
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low': return 'bg-blue-100 text-blue-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'Healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'Diseased': return 'bg-red-100 text-red-800 border-red-200';
      case 'Stressed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };


  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 border border-gray-100">
      <div className="grid md:grid-cols-2 gap-0">
        <div className="relative h-64 md:h-full min-h-[400px] bg-gray-100">
          <img src={imageUrl} alt="Analyzed Plant" className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${getConditionBadge(report.condition)}`}>
              {report.condition}
            </span>
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${getSeverityColor(report.severity)}`}>
              {report.severity} Severity
            </span>
          </div>
          
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button 
              onClick={onToggleFavorite}
              className={`p-3 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-90 ${isFavorite ? 'bg-rose-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'}`}
            >
              <svg className={`w-6 h-6 ${isFavorite ? 'fill-current' : 'fill-none'}`} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button 
              onClick={onSpeakReport}
              disabled={isSpeaking}
              className={`p-3 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-90 bg-emerald-600 text-white disabled:opacity-50`}
            >
              {isSpeaking ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
              )}
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8 max-h-[85vh] overflow-y-auto">
          <div className="flex justify-between items-start">
            <div className="flex-grow">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-1">{report.plantName}</h2>
              {report.diseaseName && (
                <p className="text-emerald-600 font-semibold text-lg">{report.diseaseName}</p>
              )}
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-1 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Analysis Confidence: {(report.confidenceScore * 100).toFixed(1)}%
              </div>
            </div>
            
            <div className="ml-4 flex-shrink-0">
              {iconUrl ? (
                <img src={iconUrl} alt="AI Icon" className="w-20 h-20 rounded-2xl shadow-md border-2 border-white object-cover animate-in zoom-in duration-300" />
              ) : (
                <button 
                  onClick={onGenerateIcon}
                  disabled={isGeneratingIcon}
                  className="w-20 h-20 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50 flex flex-col items-center justify-center text-[10px] font-bold text-emerald-600 hover:bg-emerald-100 transition disabled:opacity-50"
                >
                  {isGeneratingIcon ? (
                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      AI ICON
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button 
              onClick={onSearchProducts}
              disabled={isSearchingProducts}
              className="flex-1 min-w-[140px] px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm border border-emerald-100 hover:bg-emerald-100 transition disabled:opacity-50 flex items-center justify-center"
            >
              {isSearchingProducts ? <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-2" /> : <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
              Find Products
            </button>
            <button 
              onClick={onFindLocalHelp}
              disabled={isSearchingLocal}
              className="flex-1 min-w-[140px] px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm border border-blue-100 hover:bg-blue-100 transition disabled:opacity-50 flex items-center justify-center"
            >
              {isSearchingLocal ? <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" /> : <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              Nearby Help
            </button>
          </div>

          {(searchResult || localHelpResult) && (
            <div className="space-y-4 animate-in slide-in-from-top-2">
              {searchResult && (
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Grounding Sources (Web Search)</h4>
                  <div className="flex flex-col gap-2">
                    {searchResult.sources.map((src, i) => (
                      <a key={i} href={src.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 hover:underline flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-100">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        <span className="truncate">{src.title || src.uri}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {localHelpResult && (
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Nearby Experts (Maps)</h4>
                  <div className="flex flex-col gap-2">
                    {localHelpResult.sources.map((src, i) => (
                      <a key={i} href={src.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-100">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                        <span className="truncate">{src.title || "View on Maps"}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Symptoms</h3>
              <ul className="space-y-2">
                {report.symptoms.map((s, i) => (
                  <li key={i} className="flex items-start text-gray-700 text-sm">
                    <span className="text-emerald-500 mr-2">•</span> {s}
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Possible Causes</h3>
              <ul className="space-y-2">
                {report.causes.map((c, i) => (
                  <li key={i} className="flex items-start text-gray-700 text-sm">
                    <span className="text-amber-500 mr-2">•</span> {c}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
            <h3 className="text-emerald-800 font-bold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              Treatment Plan
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-emerald-600 uppercase mb-2">Immediate Actions</h4>
                <ul className="space-y-1.5">
                  {report.treatment.immediateActions.map((a, i) => (
                    <li key={i} className="text-sm text-emerald-900">• {a}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-600 uppercase mb-2">Long-term Care</h4>
                <ul className="space-y-1.5">
                  {report.treatment.longTermCare.map((a, i) => (
                    <li key={i} className="text-sm text-emerald-900">• {a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <section>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Prevention Tips</h3>
            <div className="flex flex-wrap gap-2">
              {report.prevention.map((p, i) => (
                <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs border border-gray-200">
                  {p}
                </span>
              ))}
            </div>
          </section>

          {report.isContagious && (
            <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <p className="text-red-800 text-sm font-medium">Warning: This condition may spread to nearby plants. Isolate the affected plant immediately.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
