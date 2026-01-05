
import React, { useState, useEffect } from 'react';
import { NAV_ITEMS, FOOTER_ITEMS } from '../constants';
import { BellRing, X, User, MapPin, Award, Wifi, Menu, RefreshCw } from 'lucide-react';
import { BrandDNA } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  dna: BrandDNA;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, dna }) => {
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const handleSync = (e: any) => {
      setNotification(e.detail.type);
      setTimeout(() => setNotification(null), 5000);
    };
    window.addEventListener('dataSynced', handleSync);
    return () => window.removeEventListener('dataSynced', handleSync);
  }, []);

  const partyColor = dna.party.includes('國民黨') ? 'bg-blue-600' : (dna.party.includes('民進黨') ? 'bg-green-600' : 'bg-[#FF6B35]');
  
  // 取得當前頁面的標籤
  const currentTabItem = [...NAV_ITEMS, ...FOOTER_ITEMS].find(item => item.id === activeTab);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F4F2EE] overflow-hidden relative">
      {/* 全域同步通知 */}
      {notification && (
        <div className="fixed top-20 right-4 md:right-8 z-[200] animate-in slide-in-from-right fade-in">
           <div className="bg-[#1A1A1A] text-white p-4 rounded-[24px] shadow-2xl flex items-center space-x-4 border border-white/10">
              <div className="bg-[#FF6B35] p-2 rounded-xl text-white">
                <BellRing size={16} className="animate-bounce" />
              </div>
              <p className="font-bold text-xs truncate">「{notification}」已同步</p>
              <button onClick={() => setNotification(null)} className="p-1 text-gray-500 hover:text-white">
                <X size={14} />
              </button>
           </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex w-64 h-full flex-col items-center py-8 px-4 border-r border-white/40 glass z-50">
        <div className="mb-12 flex items-center justify-center space-x-2">
          <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">W</div>
          <span className="font-bold text-xl tracking-tighter">SoWork <span className="text-[#FF6B35]">Win</span></span>
        </div>

        <div className="flex-1 w-full space-y-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center p-4 rounded-[20px] transition-all duration-300 relative ${
                activeTab === item.id 
                  ? 'bg-[#1A1A1A] text-white shadow-xl scale-105' 
                  : 'text-gray-400 hover:bg-white/50 hover:text-[#1A1A1A]'
              }`}
            >
              <div className="flex items-center justify-center">
                {item.icon}
              </div>
              <span className="ml-3 font-black text-xs uppercase tracking-widest">{item.label}</span>
              {activeTab === item.id && <div className="absolute right-4 w-1.5 h-1.5 bg-[#FF6B35] rounded-full"></div>}
            </button>
          ))}
        </div>

        <div className="w-full pt-6 mt-6 border-t border-gray-200 space-y-2">
          {FOOTER_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center p-4 rounded-[20px] transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-[#FF6B35] text-white shadow-lg' 
                  : 'text-gray-400 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center justify-center">
                {item.icon}
              </div>
              <span className="ml-3 font-black text-xs uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col custom-scrollbar pb-24 md:pb-0">
        {/* 持久性候選人與頁面標頭 (整合版) */}
        <div className="sticky top-0 z-40 bg-[#F4F2EE]/90 backdrop-blur-xl border-b border-gray-200 px-4 md:px-8 py-3 md:py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* 左側：候選人身份 */}
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl ${partyColor} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                <User size={20} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-black tracking-tighter truncate">{dna.candidateName}</h3>
                  <span className="hidden sm:inline px-1.5 py-0.5 bg-gray-200 rounded-md text-[9px] font-black text-gray-500 uppercase tracking-widest">
                    {dna.party.split(' ')[0]}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400">
                  <MapPin size={10} className="text-red-500" />
                  <span className="truncate">{dna.district}</span>
                </div>
              </div>
            </div>
            
            {/* 中間：當前頁面標識 (極簡) */}
            <div className="hidden lg:flex items-center justify-center px-8">
               <div className="flex items-center space-x-3 bg-white px-6 py-2 rounded-full border border-gray-100 shadow-sm">
                  <div className="text-[#FF6B35]">{currentTabItem?.icon}</div>
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-800">{currentTabItem?.label}</span>
               </div>
            </div>

            {/* 右側：全域狀態與動作 */}
            <div className="flex items-center space-x-3 md:space-x-6">
              <div className="text-right hidden sm:block">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em]">系統狀態</p>
                <div className="flex items-center justify-end space-x-2 mt-0.5">
                  <span className="text-[10px] font-black italic text-green-600 uppercase">Live</span>
                  <Wifi size={12} className="text-green-500 animate-pulse" />
                </div>
              </div>
              {/* 手機版選單按鈕 */}
              <div className="md:hidden w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                <Menu size={18} className="text-[#FF6B35]" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 flex-1">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 glass-dark border-t border-white/10 z-[100] px-2 flex items-center justify-around">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center space-y-1 transition-all ${
              activeTab === item.id ? 'text-[#FF6B35] scale-110' : 'text-gray-400'
            }`}
          >
            <div className={`p-2 rounded-xl ${activeTab === item.id ? 'bg-[#FF6B35]/10' : ''}`}>
              {React.cloneElement(item.icon as React.ReactElement, { size: 20 })}
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
        <button
          onClick={() => setActiveTab('dna')}
          className={`flex flex-col items-center justify-center space-y-1 transition-all ${
            activeTab === 'dna' ? 'text-white scale-110' : 'text-gray-400'
          }`}
        >
          <div className={`p-2 rounded-xl ${activeTab === 'dna' ? 'bg-white/10' : ''}`}>
            {React.cloneElement(FOOTER_ITEMS[0].icon as React.ReactElement, { size: 20 })}
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest">DNA</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
