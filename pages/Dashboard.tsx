
import React, { useState, useEffect } from 'react';
import { MOCK_SCHEDULE } from '../constants';
import { 
  MapPin, 
  Mic, 
  Sparkles, 
  Loader2, 
  TrendingUp, 
  Target, 
  RefreshCw, 
  BookmarkPlus,
  Send,
  MessageCircle,
  Facebook,
  X,
  Check,
  ShieldAlert,
  Fingerprint,
  Wifi,
  ShieldCheck,
  Search,
  Copy,
  // Fix: Added missing PenTool import from lucide-react
  PenTool
} from 'lucide-react';
import { generateSpeech, getPartyAlignmentBriefing } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { BrandDNA, PartyBriefing } from '../types';

interface DashboardProps {
  dna: BrandDNA;
  onOpenVault: () => void;
  setActiveTab: (tab: string) => void;
  onDeploy: (topic: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ dna, onOpenVault, setActiveTab, onDeploy }) => {
  const [generating, setGenerating] = useState<string | null>(null);
  const [briefing, setBriefing] = useState<PartyBriefing | null>(dbService.getBriefing());
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [deploying, setDeploying] = useState<{title: string, content: string} | null>(null);
  const [copied, setCopied] = useState(false);
  const [showStrategicAlert, setShowStrategicAlert] = useState(false);

  useEffect(() => {
    if (!briefing) {
      fetchBriefing();
    } else {
      const timer = setTimeout(() => setShowStrategicAlert(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [dna]);

  const fetchBriefing = async () => {
    setLoadingBriefing(true);
    try {
      const res = await getPartyAlignmentBriefing(dna);
      if (res) {
        const saved = dbService.saveBriefing(res as any);
        setBriefing(saved as any);
      }
    } catch (error) {
      console.error("同步戰報失敗", error);
    } finally {
      setLoadingBriefing(false);
    }
  };

  const handleGenerateSpeech = async (event: any) => {
    setGenerating(event.id);
    try {
      const result = await generateSpeech(dna, event.title, event.location, event.description);
      setDeploying({ title: `${event.title} 講稿素材`, content: result.text || '產出失敗' });
    } catch (e) {
      alert('連線異常');
    } finally {
      setGenerating(null);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const partyNameShort = dna.party.split(' ')[0].replace('黨', '');

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 text-[#1A1A1A]">
      {/* 戰略預警 */}
      {showStrategicAlert && (
        <div className="bg-[#1A1A1A] text-white p-8 md:p-10 rounded-[48px] shadow-2xl border-l-[12px] border-[#FF6B35] animate-in slide-in-from-top duration-700 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:rotate-12 transition-transform hidden sm:block">
              <ShieldAlert size={140} />
           </div>
           <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="flex items-center space-x-6">
                 <div className="bg-[#FF6B35] p-6 rounded-[28px] shadow-2xl animate-pulse flex-shrink-0 border-4 border-white/10"><Target size={36} /></div>
                 <div>
                    <h4 className="text-2xl font-black italic tracking-tighter uppercase text-[#FF6B35]">戰略偏移預警</h4>
                    <p className="text-gray-400 font-bold text-base max-w-xl mt-1 italic leading-relaxed">
                      最近 48 小時數據顯示，中性選民對市政議題討論熱度上升，建議同步微調 DNA 實驗室標語。
                    </p>
                 </div>
              </div>
              <button onClick={() => setActiveTab('dna')} className="px-12 py-5 bg-[#FF6B35] text-white rounded-full font-black text-xs flex items-center justify-center space-x-3 hover:scale-105 shadow-2xl tracking-widest uppercase">
                 <Fingerprint size={18} />
                 <span>進入 DNA 實驗室</span>
              </button>
           </div>
        </div>
      )}

      {/* 行程區域 */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-xl font-black italic tracking-tight uppercase flex items-center space-x-3">
             <div className="w-1.5 h-6 bg-[#FF6B35] rounded-full shadow-[0_0_10px_#FF6B35]"></div>
             <span>今日戰鬥行程</span>
           </h3>
           <button onClick={fetchBriefing} className="flex items-center space-x-2 text-[10px] font-black text-gray-400 hover:text-gray-800 transition-colors uppercase tracking-widest">
              <RefreshCw size={12} className={loadingBriefing ? 'animate-spin' : ''} />
              <span>同步戰報數據</span>
           </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_SCHEDULE.map((item) => (
            <div key={item.id} className="glass p-10 rounded-[48px] bg-white flex items-center justify-between shadow-xl hover:shadow-2xl transition-all group">
              <div className="flex items-center space-x-8 min-w-0">
                <div className="text-center border-r-2 border-gray-100 pr-8">
                  <span className="text-4xl font-black text-[#FF6B35] block leading-none">{item.time}</span>
                  <span className="text-[10px] font-black text-gray-300 mt-2 uppercase tracking-widest block">Deployment</span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-2xl font-black truncate tracking-tighter uppercase">{item.title}</h3>
                  <p className="flex items-center mt-2 text-gray-500 font-bold text-sm truncate italic">
                    <MapPin size={16} className="mr-2 text-red-500" />
                    {item.location}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleGenerateSpeech(item)}
                disabled={generating === item.id}
                className="bg-[#1A1A1A] text-white p-6 rounded-[28px] hover:scale-110 transition-all shadow-2xl disabled:opacity-50"
              >
                {generating === item.id ? <Loader2 className="animate-spin h-7 w-7" /> : <Mic size={28} />}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 攻防對位區域 */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 shadow-sm"><TrendingUp size={32} /></div>
              <div>
                <h3 className="text-3xl font-black tracking-tighter italic uppercase">攻防對位 (48H)</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time Strategic Scan</p>
              </div>
           </div>
           <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[11px] font-black uppercase tracking-widest animate-pulse border border-blue-100">
              <Wifi size={14} />
              <span>實時情資</span>
           </div>
        </div>

        {loadingBriefing ? (
          <div className="glass h-96 rounded-[64px] flex flex-col items-center justify-center text-gray-400 bg-white">
             <div className="relative mb-6">
                <div className="w-20 h-20 border-4 border-gray-100 rounded-full"></div>
                <div className="absolute inset-0 border-t-4 border-blue-600 rounded-full animate-spin"></div>
                <Search className="absolute inset-0 m-auto text-blue-600 animate-pulse" size={28} />
             </div>
             <p className="font-black italic text-lg uppercase tracking-widest">正在解析 48H 戰報...</p>
          </div>
        ) : briefing?.issues ? (
          <div className="grid grid-cols-1 gap-12">
            {briefing.issues.map((issue, idx) => (
              <div key={idx} className="glass rounded-[64px] bg-white shadow-2xl border-none overflow-hidden flex flex-col">
                <div className="p-10 md:p-12 bg-gray-50/50 border-b border-gray-100">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <h4 className="text-4xl font-black tracking-tighter italic uppercase text-gray-900 leading-none">
                          {issue.title}
                        </h4>
                        <p className="text-lg font-bold text-gray-400 italic leading-snug">
                          {issue.description}
                        </p>
                      </div>
                      <div className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm self-start ${issue.riskLevel === 'high' ? 'bg-red-600 text-white animate-bounce' : 'bg-white text-gray-400 border border-gray-200'}`}>
                         {issue.riskLevel === 'high' ? '一級空戰預警' : '動態觀察中'}
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2">
                   <div className="p-12 border-b md:border-b-0 md:border-r border-gray-100 group relative">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FF6B35] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <label className="flex items-center space-x-2 text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] mb-8">
                         <ShieldCheck size={14} className="text-[#FF6B35]" />
                         <span>【{partyNameShort}】戰略口徑</span>
                      </label>
                      <p className="text-2xl font-bold text-gray-800 leading-relaxed italic">
                        「{issue.ourStance}」
                      </p>
                   </div>
                   <div className="p-12 bg-gray-50/30">
                      <label className="flex items-center space-x-2 text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] mb-8">
                         <X size={14} className="text-red-500" />
                         <span>反方政黨說法</span>
                      </label>
                      <p className="text-2xl font-bold text-gray-400 leading-relaxed italic">
                        「{issue.opposingStance}」
                      </p>
                   </div>
                </div>

                <div className="bg-[#1A1A1A] text-white p-12 relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-2.5 h-full bg-[#FF6B35] shadow-[0_0_20px_#FF6B35]"></div>
                   <div className="flex items-center space-x-3 mb-8">
                      <Sparkles size={22} className="text-[#FF6B35]" />
                      <span className="text-[12px] font-black text-[#FF6B35] uppercase tracking-[0.4em]">AI 建議戰鬥金句 (RECOMMENDED PITCH)</span>
                   </div>
                   
                   <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
                      <div className="flex items-start">
                         <span className="text-4xl font-black text-gray-700 mr-6 italic flex-shrink-0">////</span>
                         <p className="font-black text-3xl md:text-5xl italic text-white leading-[1.1] drop-shadow-lg">
                           「{issue.pitch}」
                         </p>
                      </div>
                      <div className="flex space-x-4 w-full lg:w-auto flex-shrink-0">
                         <button 
                          onClick={() => { dbService.addAsset(issue.title, issue.pitch); alert('已存入金庫'); }}
                          className="flex-1 lg:flex-none p-5 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all"
                         >
                            <BookmarkPlus size={24} className="text-gray-400 mx-auto" />
                         </button>
                         <button 
                          onClick={() => onDeploy(issue.pitch)}
                          className="flex-1 lg:flex-none px-12 py-5 bg-gradient-to-r from-[#FF6B35] to-[#E85D04] text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:scale-105 transition-all"
                         >
                            戰略部署
                         </button>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* 行程講稿部署 Modal */}
      {deploying && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in">
           <div className="bg-white max-w-xl w-full rounded-[64px] p-12 shadow-2xl relative animate-in zoom-in overflow-y-auto max-h-[90vh]">
              <button onClick={() => setDeploying(null)} className="absolute top-10 right-10 text-gray-300 hover:text-black transition-all p-2"><X size={36} /></button>
              <div className="flex items-center space-x-6 mb-12">
                 <div className="bg-[#FF6B35] p-5 rounded-3xl text-white shadow-2xl"><Send size={32} /></div>
                 <div>
                   <h3 className="text-3xl font-black italic tracking-tighter uppercase">行程講稿部署</h3>
                   <p className="text-sm font-bold text-gray-400 tracking-widest uppercase">Speech Deployment</p>
                 </div>
              </div>
              <div className="bg-gray-50 p-8 rounded-[48px] mb-10 border border-gray-100 relative group max-h-64 overflow-y-auto shadow-inner">
                 <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-[0.4em]">講稿預覽</p>
                 <p className="font-bold text-xl text-gray-800 leading-relaxed italic whitespace-pre-wrap">{deploying.content}</p>
                 <button onClick={() => handleCopy(deploying.content)} className="absolute top-6 right-6 p-3 bg-white rounded-2xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                   {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                 </button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <button onClick={() => onDeploy(deploying.content)} className="flex flex-col items-center justify-center p-8 bg-orange-50 rounded-[40px] border-2 border-orange-100 hover:bg-orange-100 transition-all">
                    <div className="p-4 bg-white rounded-2xl shadow-sm mb-4"><PenTool size={40} className="text-orange-600" /></div>
                    <span className="font-black text-sm text-orange-900 uppercase tracking-widest">轉化為文宣</span>
                 </button>
                 <button onClick={() => { setActiveTab('training'); setDeploying(null); }} className="flex flex-col items-center justify-center p-8 bg-blue-50 rounded-[40px] border-2 border-blue-100 hover:bg-blue-100 transition-all">
                    <div className="p-4 bg-white rounded-2xl shadow-sm mb-4"><Mic size={40} className="text-blue-600" /></div>
                    <span className="font-black text-sm text-blue-900 uppercase tracking-widest">開始訓練</span>
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
