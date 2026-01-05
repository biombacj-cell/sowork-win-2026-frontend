
import React, { useState, useEffect } from 'react';
import { 
  Sword, 
  ShieldAlert, 
  Sparkles, 
  MessageSquare, 
  Copy, 
  Search, 
  ShieldCheck, 
  Target, 
  Loader2, 
  RefreshCw, 
  AlertCircle, 
  ExternalLink,
  Zap,
  Radio,
  UserX,
  ArrowRight,
  Clock,
  Send
} from 'lucide-react';
import { generateCounterStrategy, getCompetitorIntelligence } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { BrandDNA } from '../types';

interface WarRoomProps {
  dna: BrandDNA;
}

const WarRoom: React.FC<WarRoomProps> = ({ dna }) => {
  const [attack, setAttack] = useState('');
  const [strategy, setStrategy] = useState<string | null>(null);
  const [loadingStrategy, setLoadingStrategy] = useState(false);
  
  const [intelData, setIntelData] = useState<any>(dbService.getIntel());
  const [loadingIntel, setLoadingIntel] = useState(false);

  useEffect(() => {
    if (!intelData) {
      fetchIntel();
    }
  }, [dna]);

  const fetchIntel = async () => {
    setLoadingIntel(true);
    try {
      const res = await getCompetitorIntelligence(dna);
      if (res) {
        const saved = dbService.saveIntel(res);
        setIntelData(saved);
      }
    } catch (e) {
      console.error("敵情偵查失敗", e);
    } finally {
      setLoadingIntel(false);
    }
  };

  const handleConsult = async (content?: string) => {
    const textToAnalyze = content || attack;
    if (!textToAnalyze) return;
    
    setLoadingStrategy(true);
    if (content) setAttack(content);
    
    try {
      const res = await generateCounterStrategy(textToAnalyze, dna);
      setStrategy(res);
    } catch (e) {
      setStrategy("戰術引擎異常，請稍後再試。");
    } finally {
      setLoadingStrategy(false);
    }
  };

  const intelList = intelData?.list || [];

  return (
    <div className="space-y-8 animate-in zoom-in duration-500 pb-20 text-[#1A1A1A]">
      <div className="flex justify-end px-2 mb-4">
        <div className="flex items-center space-x-3 bg-white p-2 rounded-full border border-gray-100 shadow-sm overflow-x-auto">
          <div className="flex items-center px-4 space-x-2 text-gray-400">
             <Clock size={14} />
             <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
               情報更新：{intelData?.lastUpdated || '尚未掃描'}
             </span>
          </div>
          <button 
            onClick={fetchIntel}
            disabled={loadingIntel}
            className="flex items-center space-x-2 text-xs font-black bg-[#FF6B35] px-6 py-3 rounded-full text-white shadow-lg hover:scale-105 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loadingIntel ? 'animate-spin' : ''} />
            <span>{loadingIntel ? '偵查中...' : '同步敵情'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[600px]">
        <div className="lg:col-span-5 flex flex-col space-y-6 h-full">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center">
                 <Radio size={20} className="mr-2 text-red-500 animate-pulse" />
                 敵情情報牆
              </h3>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Real-time Scan</span>
           </div>

           <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {loadingIntel ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40">
                   <Loader2 size={48} className="animate-spin text-red-500" />
                   <p className="font-bold">檢索對手動態中...</p>
                </div>
              ) : intelList.length > 0 ? (
                intelList.map((intel: any, idx: number) => (
                  <div key={idx} className={`glass p-6 rounded-[40px] border-none shadow-lg transition-all hover:scale-[1.02] ${intel.mentionsCandidate ? 'bg-red-50/30 border border-red-100' : 'bg-white'}`}>
                    <div className="flex justify-between items-start mb-4">
                       <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                             <span className="text-sm font-black text-gray-800">{intel.competitor}</span>
                             {intel.mentionsCandidate && (
                               <span className="px-2 py-0.5 bg-red-600 text-white rounded-md text-[9px] font-black uppercase tracking-tighter">點名我方</span>
                             )}
                          </div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{intel.date || 'RECENT'}</p>
                       </div>
                       <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${intel.threatLevel === 'High' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                          {intel.threatLevel}
                       </div>
                    </div>
                    
                    <p className="text-sm font-bold text-gray-700 leading-relaxed mb-6 italic">
                      「{intel.summary}」
                    </p>

                    <button 
                      onClick={() => handleConsult(intel.summary)}
                      className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-black text-[11px] flex items-center justify-center space-x-2 hover:bg-red-600 transition-all shadow-md uppercase tracking-widest"
                    >
                      <Sword size={14} />
                      <span>反擊演算</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 italic opacity-20">
                   <ShieldCheck size={80} />
                   <p className="mt-4 font-black">點擊上方按鈕開始同步</p>
                </div>
              )}
           </div>
        </div>

        <div className="lg:col-span-7 flex flex-col h-full space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center">
               <Zap size={20} className="mr-2 text-orange-500" />
               反制引擎
            </h3>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Strategic Counter</span>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <div className={`glass-dark p-8 rounded-[56px] flex flex-col bg-[#1A1A1A] text-white shadow-2xl border-none transition-all duration-500 ${strategy ? 'h-[280px]' : 'h-1/3 min-h-[320px]'}`}>
              <div className="flex items-center space-x-3 mb-4">
                <Target size={24} className="text-red-500" />
                <h2 className="text-xl font-black italic tracking-tighter uppercase">偵測對象言論</h2>
              </div>
              <textarea 
                placeholder="在此輸入對手攻擊內容..."
                value={attack}
                onChange={(e) => setAttack(e.target.value)}
                className="flex-1 w-full bg-white/5 rounded-[32px] p-6 outline-none font-bold text-lg border border-white/10 focus:border-red-500 transition-all resize-none placeholder:text-gray-600"
              />
              <button 
                onClick={() => handleConsult()}
                disabled={loadingStrategy || !attack}
                className="mt-6 bg-red-600 text-white py-5 rounded-[32px] font-black text-xl flex items-center justify-center space-x-4 hover:bg-red-700 transition-all shadow-xl disabled:opacity-50 uppercase italic"
              >
                {loadingStrategy ? <Loader2 className="animate-spin" size={24} /> : <><Sword size={24} /><span>啟動戰略演算</span></>}
              </button>
            </div>

            <div className={`glass flex-1 p-10 rounded-[56px] overflow-y-auto bg-white border-none shadow-2xl flex flex-col ${!strategy && 'items-center justify-center'}`}>
              {loadingStrategy ? (
                <div className="flex flex-col items-center space-y-4 opacity-30">
                   <Sparkles size={64} className="animate-pulse text-orange-500" />
                   <p className="font-black text-2xl italic text-gradient">正在分析邏輯漏洞...</p>
                </div>
              ) : strategy ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500 flex-1 flex flex-col">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                    <h2 className="text-2xl font-black flex items-center italic text-gradient uppercase">反擊口徑與戰術破口</h2>
                    <button onClick={() => { navigator.clipboard.writeText(strategy); alert('已複製！'); }} className="p-4 bg-gray-50 rounded-full hover:bg-gray-100 transition-all">
                       <Copy size={20} />
                    </button>
                  </div>
                  
                  <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                     <div className="bg-red-50 p-8 rounded-[40px] border-l-8 border-red-500 shadow-inner">
                        <p className="text-[10px] font-black text-red-600 uppercase mb-3 tracking-widest text-center">AI 戰術核心分析</p>
                        <p className="text-xl font-bold leading-relaxed text-red-900 text-center italic">
                          「建議我方應轉向強調『具體建設清單』，而非與對手糾結於預算定義之口水戰。」
                        </p>
                     </div>
                     <div className="whitespace-pre-wrap font-bold text-2xl leading-[2] text-[#1A1A1A] italic px-6 border-l-4 border-gray-100">
                        {strategy}
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-100 mt-auto">
                     <button className="py-6 bg-[#1A1A1A] text-white rounded-[32px] font-black text-lg hover:bg-blue-600 transition-all flex items-center justify-center space-x-2 uppercase tracking-widest shadow-lg">
                        <MessageSquare size={20} />
                        <span>同步幕僚</span>
                     </button>
                     <button className="py-6 bg-[#FF6B35] text-white rounded-[32px] font-black text-lg hover:bg-orange-600 transition-all flex items-center justify-center space-x-2 uppercase tracking-widest shadow-lg">
                        <Send size={20} />
                        <span>立即部署</span>
                     </button>
                  </div>
                </div>
              ) : (
                <div className="text-center opacity-10">
                  <UserX size={120} className="mx-auto mb-6" />
                  <p className="font-black text-3xl italic tracking-tighter">等待敵情輸入啟動決策...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarRoom;
