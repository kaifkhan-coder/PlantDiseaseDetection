
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'scan' | 'history';
  onTabChange: (tab: 'scan' | 'history') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-emerald-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => onTabChange('scan')}
          >
            <div className="bg-white p-1.5 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 4.63-6C7 19 9 21 12 21"/></svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Plant Disease Detection System</h1>
          </div>
          <nav className="flex space-x-2 sm:space-x-6 text-sm font-medium">
            <button 
              onClick={() => onTabChange('scan')}
              className={`px-3 py-2 rounded-lg transition ${activeTab === 'scan' ? 'bg-emerald-800 text-white' : 'hover:text-emerald-200'}`}
            >
              Scanner
            </button>
            <button 
              onClick={() => onTabChange('history')}
              className={`px-3 py-2 rounded-lg transition ${activeTab === 'history' ? 'bg-emerald-800 text-white' : 'hover:text-emerald-200'}`}
            >
              History
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t py-6">
      </footer>
    </div>
  );
};
