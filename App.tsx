import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Layout } from './components/Layout';
import { ReportDisplay } from './components/ReportDisplay';
import { HistoryView } from './components/HistoryView';
import { ImageEditor } from './components/ImageEditor';
import { analyzePlantImage, generatePlantIcon, searchTreatmentProducts, findNearbyExperts, generateSpeechReport } from './services/geminiService';
import { PlantHealthReport, ScanHistoryItem, GroundingResult } from './types';
import { decode, decodeAudioData } from './utils/audioUtils';
import AuthPages from './components/AuthPage';

const STORAGE_KEY = 'leafscan_history';

interface AppError {
  type: 'camera' | 'analysis' | 'general';
  message: string;
  tips?: string[];
}

const App: React.FC = () => {
    const userEmail = localStorage.getItem("user_email") || "guest";
const STORAGE_KEY = `plantscan_history_${userEmail}`;
  const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingIcon, setIsGeneratingIcon] = useState(false);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [isSearchingLocal, setIsSearchingLocal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [report, setReport] = useState<PlantHealthReport | null>(null);
  const [currentIconUrl, setCurrentIconUrl] = useState<string | undefined>(undefined);
  const [isCurrentFavorite, setIsCurrentFavorite] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<GroundingResult | null>(null);
  const [localHelpResult, setLocalHelpResult] = useState<GroundingResult | null>(null);
  const [error, setError] = useState<AppError | null>(null);
const [history, setHistory] = useState<ScanHistoryItem[]>(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
});
  useEffect(()=>{
    localStorage.setItem( STORAGE_KEY, JSON.stringify(history));
  }, [history]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [viewingDetailFromHistory, setViewingDetailFromHistory] = useState<boolean>(false);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
  return localStorage.getItem("auth_token") !== null;
});
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [email, setEmail] = useState("");

  // Load history on mount
  useEffect(() => {
  localStorage.setItem("plantscan_history", JSON.stringify(history));
}, [history]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRawImage(reader.result as string);
        setIsEditing(true);
        resetCurrentScanData();
        setViewingDetailFromHistory(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetCurrentScanData = () => {
    setReport(null);
    setCurrentIconUrl(undefined);
    setIsCurrentFavorite(false);
    setSearchResult(null);
    setLocalHelpResult(null);
    setError(null);
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  const startCamera = async () => {
    setError(null);
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      let message = "We couldn't access your camera.";
      let tips = [
        "Check your browser site settings to ensure camera access is allowed.",
        "Ensure no other apps are using the camera simultaneously.",
        "If problems persist, try 'Upload File' instead."
      ];
      
      if (err.name === 'NotAllowedError') {
        message = "Camera access was denied.";
      } else if (err.name === 'NotFoundError') {
        message = "No camera was found on this device.";
      }

      setError({ type: 'camera', message, tips });
      setIsCameraActive(false);
    }
  };
  

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setRawImage(dataUrl);
      setIsEditing(true);
      resetCurrentScanData();
      setViewingDetailFromHistory(false);
      stopCamera();
    }
  };

  const handleEditorComplete = (editedImage: string) => {
    setSelectedImage(editedImage);
    setIsEditing(false);
    handleAnalyze(editedImage);
  };

const handleAnalyze = async (imageToAnalyze?: string) => {
  const targetImage = imageToAnalyze || selectedImage;
  if (!targetImage) return;

  setIsAnalyzing(true);
  setError(null);

  const id = Date.now().toString();

  try {
    const results = await analyzePlantImage(targetImage);

    setReport(results);
    setCurrentScanId(id);

    setHistory(prev => [{
      id,
      timestamp: Date.now(),
      image: targetImage,
      report: results,
      isFavorite: false
    }, ...prev]);

  } catch (err) {
    // ✅ SAVE FAILED SCAN ALSO
    const failedReport: PlantHealthReport = {
      plantName: "Unknown Plant",
      condition: "Analysis Failed",
      symptoms: [],
      treatment: {
        immediateActions: ["Please retry analysis"]
      }
    };

    setReport(failedReport);
    setCurrentScanId(id);

    setHistory(prev => [{
      id,
      timestamp: Date.now(),
      image: targetImage,
      report: failedReport,
      isFavorite: false
    }, ...prev]);

    setError({
      type: 'analysis',
      message: "Analysis interrupted.",
      tips: [
        "Check your internet connection",
        "Ensure the image is clear",
        "Try again later"
      ]
    });

  } finally {
    setIsAnalyzing(false);
  }
};

  const handleGenerateIcon = async () => {
    if (!report || !currentScanId) return;
    setIsGeneratingIcon(true);
    try {
      const iconUrl = await generatePlantIcon(report.plantName);
      setCurrentIconUrl(iconUrl);
      setHistory(prev => prev.map(item => 
        item.id === currentScanId ? { ...item, iconUrl } : item
      ));
    } catch (err) {
      console.error("Icon generation failed", err);
    } finally {
      setIsGeneratingIcon(false);
    }
  };

const handleSearchProducts = async () => {
  if (!report) return;

  setIsSearchingProducts(true);
  try {
    const result = await searchTreatmentProducts(
      report.plantName,
      report.diseaseName || report.condition
    );
    setSearchResult(result);
  } catch (err) {
    console.error("Product search failed", err);
  } finally {
    setIsSearchingProducts(false);
  }
};


const handleFindLocalHelp = () => {
  if (!report) return;

  setIsSearchingLocal(true);

  const query = `${report.plantName} ${report.diseaseName || "plant disease"} expert near me`;

  const sources = [
    {
      title: "Nearby Plant Nurseries",
      uri: `https://www.google.com/maps/search/${encodeURIComponent(
        "plant nursery near me"
      )}`,
    },
    {
      title: "Agriculture Office",
      uri: `https://www.google.com/maps/search/${encodeURIComponent(
        "agriculture office near me"
      )}`,
    },
    {
      title: "Plant Disease Clinics",
      uri: `https://www.google.com/maps/search/${encodeURIComponent(query)}`,
    },
  ];

  setTimeout(() => {
    setLocalHelpResult({ sources });
    setIsSearchingLocal(false);
  }, 600);
};

  const handleSpeakReport = async () => {
    if (!report) return;
    setIsSpeaking(true);
    try {
      const text = `${report.plantName} diagnosis: ${report.condition}. ${report.diseaseName ? 'The plant appears to have ' + report.diseaseName : ''}. Symptoms include ${report.symptoms.join(', ')}. Immediate action recommended: ${report.treatment.immediateActions[0]}.`;
      const base64Audio = await generateSpeechReport(text);
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        audioContextRef.current,
        24000,
        1
      );
      useEffect(() => {
  return () => {
    audioContextRef.current?.close();
  };
}, []);

      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsSpeaking(false);
      source.start();
    } catch (err) {
      console.error("Speech failed", err);
      setIsSpeaking(false);
    }
  };

  const handleToggleFavorite = () => {
    if (!currentScanId) return;
    const newFavoriteStatus = !isCurrentFavorite;
    setIsCurrentFavorite(newFavoriteStatus);
    setHistory(prev => prev.map(item => 
      item.id === currentScanId ? { ...item, isFavorite: newFavoriteStatus } : item
    ));
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setRawImage(null);
    resetCurrentScanData();
    setViewingDetailFromHistory(false);
    setCurrentScanId(null);
    setActiveTab('scan');
  };

  const handleSelectHistoryItem = (item: ScanHistoryItem) => {
    setSelectedImage(item.image);
    setRawImage(null);
    setReport(item.report);
    setCurrentIconUrl(item.iconUrl);
    setCurrentScanId(item.id);
    setIsCurrentFavorite(!!item.isFavorite);
    setSearchResult(null);
    setLocalHelpResult(null);
    setViewingDetailFromHistory(true);
    setActiveTab('scan');
  };
  

  const handleTabChange = (tab: 'scan' | 'history') => {
    setActiveTab(tab);
    if (tab === 'scan' && !report && !selectedImage) {
      resetScanner();
    }
  };
 if (!isAuthenticated) {
  return (
    <AuthPages
      onAuthSuccess={(email) => {
        localStorage.setItem("auth_token", "logged_in");
        localStorage.setItem("user_email", email);
        setIsAuthenticated(true);
      }}
    />
  );
}
const handleLogout = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user_email");
  localStorage.removeItem(STORAGE_KEY)
  setHistory([]);
  setIsAuthenticated(false);
};



  const renderError = () => {
    <AuthPages />
    if (!error) return null;
    return (
      <div className="max-w-lg mx-auto mt-8 animate-in slide-in-from-top-4 duration-300">
        <div className="bg-white border-2 border-rose-100 rounded-[2rem] overflow-hidden shadow-xl">
          <div className="bg-rose-50 px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-rose-500 p-1.5 rounded-full">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h4 className="font-extrabold text-rose-900 text-sm uppercase tracking-wider">{error.type === 'camera' ? 'Camera Issue' : 'Analysis Issue'}</h4>
            </div>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="p-8">
            <p className="text-lg font-bold text-gray-900 mb-4">{error.message}</p>
            {error.tips && (
              <div className="space-y-3">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Troubleshooting Tips</p>
                <ul className="space-y-2">
                  {error.tips.map((tip, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-600">
                      <span className="w-5 h-5 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center text-[10px] font-bold mr-3 flex-shrink-0 mt-0.5">{i+1}</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-8 flex gap-3">
              <button 
                onClick={error.type === 'camera' ? startCamera : () => handleAnalyze()}
                className="flex-1 px-6 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-200 hover:bg-rose-700 transition transform active:scale-95"
              >
                Try Again
              </button>
              {error.type === 'camera' && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 px-6 py-3 bg-white text-rose-600 border-2 border-rose-100 rounded-xl font-bold text-sm hover:bg-rose-50 transition transform active:scale-95"
                >
                  Upload File
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderScanView = () => {
    if (isEditing && rawImage) {
      return (
        <ImageEditor 
          image={rawImage} 
          onComplete={handleEditorComplete} 
          onCancel={() => { setIsEditing(false); setRawImage(null); }} 
        />
      );
    }

    if (report && selectedImage) {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <button 
              onClick={viewingDetailFromHistory ? () => setActiveTab('history') : resetScanner}
              className="flex items-center text-emerald-700 font-bold hover:text-emerald-900 transition"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              {viewingDetailFromHistory ? 'Back to History' : 'Start New Scan'}
            </button>
          </div>
          <ReportDisplay 
            report={report} 
            imageUrl={selectedImage} 
            iconUrl={currentIconUrl}
            isGeneratingIcon={isGeneratingIcon}
            onGenerateIcon={handleGenerateIcon}
            isFavorite={isCurrentFavorite}
            onToggleFavorite={handleToggleFavorite}
            onSearchProducts={handleSearchProducts}
            onFindLocalHelp={handleFindLocalHelp}
            onSpeakReport={handleSpeakReport}
            searchResult={searchResult}
            localHelpResult={localHelpResult}
            isSearchingProducts={isSearchingProducts}
            isSearchingLocal={isSearchingLocal}
            isSpeaking={isSpeaking}
      
/>

        </div>
      );
    }

    if (isAnalyzing) {
      return (
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-100 rounded-full animate-spin border-t-emerald-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <svg className="w-8 h-8 text-emerald-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Identifying Pathogens...</h3>
            <p className="text-gray-500 max-w-xs">Our AI is examining leaf morphology and coloration to ensure accurate diagnosis.</p>
          </div>
        </div>
      );
    }

    if (selectedImage && !report) {
      return (
        <div className="space-y-6 animate-in zoom-in-95 duration-300">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white max-w-2xl mx-auto">
            <img src={selectedImage} alt="Selected Plant" className="w-full h-auto max-h-[60vh] object-contain bg-gray-50" />
            <button 
              onClick={resetScanner}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex justify-center">
            <button 
              onClick={() => handleAnalyze()}
              className="px-12 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl hover:bg-emerald-700 transition transform hover:-translate-y-1 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              Analyze Plant Health
            </button>
          </div>
          {renderError()}
        </div>
      );
    }

    if (isCameraActive) {
      return (
        <div className="relative rounded-3xl overflow-hidden bg-black shadow-2xl aspect-square md:aspect-video max-h-[70vh]">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center space-x-8">
            <button onClick={stopCamera} className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full border-8 border-emerald-500/30 flex items-center justify-center transition hover:scale-105 active:scale-95">
              <div className="w-12 h-12 bg-emerald-600 rounded-full" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center space-y-6 py-12 animate-in fade-in duration-700">
        <div className="inline-block p-4 bg-emerald-100 rounded-full mb-4">
          <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        </div>
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Protect Your Harvest</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Get instant diagnosis for plant diseases and pests. Simply snap a photo of any leaf and our AI pathologist will provide expert care instructions.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button onClick={startCamera} className="flex items-center justify-center px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg hover:bg-emerald-700 transition transform hover:-translate-y-1">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Take Photo
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center px-8 py-4 bg-white text-emerald-700 border-2 border-emerald-100 rounded-2xl font-bold shadow-sm hover:border-emerald-300 transition transform hover:-translate-y-1">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Upload File
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        </div>

        {renderError()}
      </div>
    );
  };

  return (
    <Layout activeTab={activeTab} onTabChange={handleTabChange}>
      <div className="max-w-4xl mx-auto">
        {activeTab === 'scan' ? renderScanView() : (
          <HistoryView 
            history={history} 
            onSelectItem={handleSelectHistoryItem}
            onClearHistory={() => {
              if (window.confirm('Are you sure you want to clear your entire scan history?')) {
                setHistory([]);
                localStorage.removeItem(STORAGE_KEY);
              }
            }}
            onGoToScan={() => setActiveTab('scan')}
          />
        )}
        <button onClick={handleLogout}>Logout</button>
      </div>
    </Layout>
    
  );
};

export default App;
