
import React, { useState, useMemo } from 'react';
import { ScanHistoryItem } from '../types';

interface HistoryViewProps {
  history: ScanHistoryItem[];
  onSelectItem: (item: ScanHistoryItem) => void;
  onClearHistory: () => void;
  onGoToScan: () => void;
}

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc';
type ConditionFilter = 'All' | 'Healthy' | 'Diseased' | 'Stressed' | 'Unknown' | 'Favorites';

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onSelectItem, onClearHistory, onGoToScan }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState<ConditionFilter>('All');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  const filteredAndSortedHistory = useMemo(() => {
    let result = [...history];

    // Filter by name
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.report.plantName.toLowerCase().includes(lowerSearch) ||
        (item.report.diseaseName && item.report.diseaseName.toLowerCase().includes(lowerSearch))
      );
    }

    // Filter by condition or favorites
    if (conditionFilter === 'Favorites') {
      result = result.filter(item => item.isFavorite);
    } else if (conditionFilter !== 'All') {
      result = result.filter(item => item.report.condition === conditionFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return b.timestamp - a.timestamp;
        case 'date-asc':
          return a.timestamp - b.timestamp;
        case 'name-asc':
          return a.report.plantName.localeCompare(b.report.plantName);
        case 'name-desc':
          return b.report.plantName.localeCompare(a.report.plantName);
        default:
          return 0;
      }
    });

    return result;
  }, [history, searchTerm, conditionFilter, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setConditionFilter('All');
    setSortBy('date-desc');
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-24 space-y-6 animate-in fade-in duration-700">
        <div className="inline-block p-8 bg-emerald-50 rounded-full text-emerald-400 mb-2">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Your garden is quiet</h2>
        <p className="text-gray-500 max-w-sm mx-auto">No scan history found. Use the scanner to analyze your plants and build your pathology archive.</p>
        <button 
          onClick={onGoToScan}
          className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg hover:bg-emerald-700 transition transform hover:-translate-y-1"
        >
          Open Scanner
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Health History</h2>
          <p className="text-gray-500 mt-1">Found {history.length} previous diagnostics in your archive.</p>
        </div>
        <button 
          onClick={onClearHistory}
          className="text-sm font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-5 py-2.5 rounded-xl transition self-start sm:self-center border border-red-100"
        >
          Clear All Records
        </button>
      </div>

      {/* Controls Panel */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap gap-6 items-end">
        <div className="flex-grow min-w-[240px]">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Search Database</label>
          <div className="relative">
            <input 
              type="text"
              placeholder="Search plant species or disease..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition text-sm bg-gray-50/50"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="min-w-[180px]">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">View Filter</label>
          <select 
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value as ConditionFilter)}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition text-sm bg-gray-50/50 appearance-none cursor-pointer font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Favorites">❤ Favorites Only</option>
            <option value="Healthy">Healthy Only</option>
            <option value="Diseased">Issues Only</option>
            <option value="Stressed">Stressed Only</option>
            <option value="Unknown">Unknown Only</option>
          </select>
        </div>

        <div className="min-w-[180px]">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Ordering</label>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition text-sm bg-gray-50/50 appearance-none cursor-pointer"
          >
            <option value="date-desc">Newest Records</option>
            <option value="date-asc">Oldest Records</option>
            <option value="name-asc">Plant Name (A-Z)</option>
            <option value="name-desc">Plant Name (Z-A)</option>
          </select>
        </div>
      </div>

      {filteredAndSortedHistory.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-gray-500 font-medium">No records match your filters.</p>
          <button 
            onClick={clearFilters}
            className="mt-4 px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full text-sm font-bold hover:bg-emerald-100 transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSortedHistory.map((item) => (
            <div 
              key={item.id} 
              className="group relative bg-white rounded-[2rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-gray-100 overflow-hidden cursor-pointer flex flex-col"
              onClick={() => onSelectItem(item)}
            >
              {/* Image Section */}
              <div className="h-60 overflow-hidden relative">
                <img 
                  src={item.image} 
                  alt={item.report.plantName} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                />
                
                {/* Status Overlay Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest shadow-lg backdrop-blur-md 
                    ${item.report.condition === 'Healthy' ? 'bg-emerald-500/90 text-white' : 
                      item.report.condition === 'Diseased' ? 'bg-rose-500/90 text-white' : 
                      item.report.condition === 'Stressed' ? 'bg-amber-500/90 text-white' : 'bg-slate-500/90 text-white'}`}>
                    {item.report.condition}
                  </span>
                  
                  {item.report.severity && (item.report.severity === 'High' || item.report.severity === 'Critical') && (
                    <span className="bg-white/90 text-rose-600 backdrop-blur-md px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                      {item.report.severity} Priority
                    </span>
                  )}
                </div>

                {/* Favorite Badge */}
                {item.isFavorite && (
                  <div className="absolute top-4 right-4 bg-rose-500 text-white p-2 rounded-full shadow-lg backdrop-blur-md animate-in zoom-in duration-300">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001z" />
                    </svg>
                  </div>
                )}

                {/* AI Icon Thumbnail */}
                {item.iconUrl && (
                  <div className={`absolute ${item.isFavorite ? 'bottom-4' : 'bottom-4'} right-4 w-12 h-12 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/50 backdrop-blur-sm animate-in zoom-in duration-500`}>
                    <img src={item.iconUrl} alt="AI Icon" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Hover Details Prompt */}
                <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-white font-bold text-sm flex items-center gap-2">
                      View Diagnostics
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-7 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-extrabold text-gray-900 text-xl leading-tight group-hover:text-emerald-700 transition-colors truncate pr-2">
                    {item.report.plantName}
                  </h4>
                  <div className="flex items-center text-[11px] font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 whitespace-nowrap">
                    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                </div>

                <div className="space-y-2 mb-4 flex-grow">
                  <p className="text-sm font-bold text-emerald-600 line-clamp-1">
                    {item.report.diseaseName || "Optimal Health Detected"}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed italic">
                    {item.report.symptoms.length > 0 ? `"${item.report.symptoms[0]}"` : "No symptomatic concerns identified by AI analysis."}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                   <div className="flex -space-x-2">
                     <div className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center">
                        <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                     </div>
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-emerald-500 transition-colors">
                     Tap to open
                   </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
