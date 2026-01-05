
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Search, 
  BarChart3, 
  Info, 
  Loader2, 
  Radar, 
  Sparkles, 
  BookOpen, 
  FileText, 
  Compass, 
  ChevronRight,
  Zap,
  ArrowRight,
  Send,
  MessageSquare,
  Repeat,
  BookmarkPlus,
  ShieldCheck,
  History,
  Lightbulb,
  Database,
  SearchCode
} from 'lucide-react';
import { analyzePolicyFusion, scoutCandidateAchievements } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { BrandDNA } from '../types';

interface PollingRadarProps {
  dna: BrandDNA;
  onDeploy: (topic: string) => void;
  setActiveTab: (tab: string) => void;
}

const PollingRadar: React.FC<PollingRadarProps> = ({ dna, onDeploy, setActiveTab }) => {
  const [loading, setLoading] = useState(false);
  const [scouting, setScouting] = useState(false);
  const [userPolicy, setUserPolicy] = useState('');
  const [fusionResult, setFusionResult] = useState<any>(null);
  const [suggestedAchievements, setSuggestedAchievements] = useState<any[]>([]);

  const assets = dbService.getAssets();

  const handleFusion = async (content?: string) => {
    const textToAnalyze = content || userPolicy;
    if (!textToAnalyze) return;
    setLoading(true);
    try {
      const res = await analyzePolicyFusion(textToAnalyze, dna);
      setFusionResult(res);
      if (content) setUserPolicy(content);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAIScout = async () => {
    setScouting(true);
    try {
      const res = await scoutCandidateAchievements(dna);
      setSuggestedAchievements(res);
    } catch (e) {
      console.error(e);
    } finally {
      setScouting(false);
    }
  };

  const handleSaveToVault = () => {
    if (!fusionResult) return;
    dbService.addAsset(
      `戰略升級：${userPolicy.substring(0, 10)}...`, 
      fusionResult.strategicRefinement, 
      'strategy'
    );
    alert('已成功歸檔至戰略金庫！');
  };

  useEffect(() => {
    // 預填一個預設範例，或執行初步分析
    if (!userPolicy) {
      setUserPolicy('過去三年，我成功爭取了 5000 萬預算改善烏日區 10 處危險路口。');
    }
  }, []);

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom duration-700 pb-20 text-[#1A1A1A]">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-2">
         <div className="space-y-1">
            <h3 className="text-2xl font-black italic tracking-tight uppercase flex items-center space-x-3">
              <div className="w-2 h-8 bg-[#FF6B35] rounded-full shadow-[0_0_15px_#FF6B35]"></div>
              <span>戰略融合中心 (Strategic Fusion)</span>
            </h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-5">將您的原始政績，透過 AI 與選民情緒對位增幅</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* 左側：輸入與快速選擇 */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
           {/* 快速載入區 */}
           <div className="glass p-8 rounded-[40px] bg-white shadow-lg border-none space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-2 text-gray-400">
                    <Database size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">快速載入政績 Fact</span>
                 </div>
                 <button 
                  onClick={handleAIScout}
                  disabled={scouting}
                  className="text-[10px] font-black text-[#FF6B35] flex items-center space-x-1 hover:underline"
                 >
                    {scouting ? <Loader2 size={12} className="animate-spin" /> : <SearchCode size={12} />}
                    <span>AI 自動偵察</span>
                 </button>
              </div>
              
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                 {suggestedAchievements.length > 0 ? suggestedAchievements.map((item, i) => (
                    <button 
                      key={i}
                      onClick={() => handleFusion(item.fact)}
                      className="w-full text-left p-4 rounded-2xl bg-orange-50 hover:bg-orange-100 border border-orange-100 transition-all group"
                    >
                       <p className="text-[10px] font-black text-orange-600 mb-1">偵察結果：{item.title}</p>
                       <p className="text-xs font-bold text-orange-900 line-clamp-1">{item.fact}</p>
                    </button>
                 )) : assets.filter(a => a.category === 'strategy').slice(0, 3).map((asset, i) => (
                    <button 
                      key={i}
                      onClick={() => handleFusion(asset.content)}
                      className="w-full text-left p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-all group"
                    >
                       <p className="text-[10px] font-black text-gray-400 mb-1">金庫資產：{asset.title}</p>
                       <p className="text-xs font-bold text-gray-700 line-clamp-1">{asset.content}</p>
                    </button>
                 ))}
                 {suggestedAchievements.length === 0 && assets.filter(a => a.category === 'strategy').length === 0 && (
                   <p className="text-center py-4 text-[10px] font-bold text-gray-300 italic uppercase">尚無預存政績，請在下方輸入或點擊偵察</p>
                 )}
              </div>
           </div>

           <div className="glass p-10 rounded-[56px] bg-white shadow-xl border-none flex-1 flex flex-col space-y-8 relative overflow-hidden group">
              <div className="flex items-center space-x-3 text-gray-400">
                 <History size={20} />
                 <h4 className="text-sm font-black uppercase tracking-widest">政績 Facts / 原始想法</h4>
              </div>
              <textarea 
                value={userPolicy}
                onChange={(e) => setUserPolicy(e.target.value)}
                className="flex-1 w-full bg-gray-50 border border-gray-100 p-8 rounded-[40px] outline-none focus:border-[#FF6B35] font-bold text-xl shadow-inner transition-all resize-none leading-relaxed placeholder:text-gray-300"
                placeholder="例如：我過去爭取了什麼？我打算怎麼做..."
              />
              <button 
                onClick={() => handleFusion()}
                disabled={loading || !userPolicy}
                className="w-full py-6 bg-[#1A1A1A] text-white rounded-[32px] font-black text-xl flex items-center justify-center space-x-3 hover:bg-[#FF6B35] transition-all shadow-xl"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Repeat size={24} /><span>演算戰略對位</span></>}
              </button>
           </div>
        </div>

        {/* 右側：戰略邏輯鏈 (保持不變) */}
        <div className="lg:col-span-8 flex flex-col space-y-8">
           <div className="glass p-10 rounded-[64px] bg-white shadow-2xl border-none flex flex-col relative overflow-hidden group">
              {loading && (
                <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
                  <Loader2 className="animate-spin text-[#FF6B35] mb-4" size={48} />
                  <p className="font-black text-xl italic tracking-tight text-[#FF6B35]">正在為您的 Facts 對焦選民情緒...</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                 <div className="space-y-6">
                    <div className="flex items-center space-x-3 text-blue-600">
                       <Search size={24} />
                       <h4 className="text-sm font-black italic uppercase tracking-widest">當前選民情緒</h4>
                    </div>
                    <div className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100 min-h-[140px] flex items-center shadow-inner">
                       <p className="font-bold text-lg italic text-blue-900 leading-relaxed">
                         {fusionResult?.currentVibe || "AI 正在掃描該選區最新新聞與討論..."}
                       </p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center space-x-3 text-orange-600">
                       <ShieldCheck size={24} />
                       <h4 className="text-sm font-black italic uppercase tracking-widest">戰略信任錨點</h4>
                    </div>
                    <div className="bg-orange-50/50 p-6 rounded-[32px] border border-orange-100 min-h-[140px] flex items-center shadow-inner">
                       <p className="font-bold text-lg italic text-orange-900 leading-relaxed">
                         {fusionResult?.trustAnchor || "找出 Facts 與痛點的強連結..."}
                       </p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center space-x-3 text-purple-600">
                       <Target size={24} />
                       <h4 className="text-sm font-black italic uppercase tracking-widest">建議文宣切入點</h4>
                    </div>
                    <div className="bg-purple-50/50 p-6 rounded-[32px] border border-purple-100 min-h-[140px] flex items-center shadow-inner">
                       <p className="font-bold text-lg italic text-purple-900 leading-relaxed">
                         {fusionResult?.campaignAngle || "定位最精準的傳播路徑..."}
                       </p>
                    </div>
                 </div>
              </div>

              <div className="mt-12 bg-[#1A1A1A] rounded-[48px] p-12 text-white relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-2 h-full bg-[#FF6B35] shadow-[0_0_20px_#FF6B35]"></div>
                 <div className="flex items-center space-x-3 mb-8">
                    <Sparkles size={24} className="text-[#FF6B35]" />
                    <span className="text-[10px] font-black text-[#FF6B35] uppercase tracking-[0.4em]">戰略升級最終論述 (STRATEGIC NARRATIVE)</span>
                 </div>
                 <p className="text-4xl md:text-5xl font-black italic leading-[1.1] drop-shadow-2xl">
                    「{fusionResult?.strategicRefinement || "請於左側輸入 Facts 後啟動演算"}」
                 </p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <button 
                onClick={() => onDeploy(fusionResult?.strategicRefinement || userPolicy)}
                disabled={loading || !fusionResult}
                className="group glass p-10 rounded-[48px] bg-white border-none shadow-xl flex items-center justify-between hover:bg-[#FF6B35] hover:text-white transition-all text-left disabled:opacity-50"
              >
                 <div className="space-y-2">
                    <h4 className="text-2xl font-black italic uppercase tracking-tight">啟動全通路部署</h4>
                    <p className="text-xs font-bold text-gray-400 group-hover:text-white/60 italic">製作 AI 圖文、社群短片與文宣</p>
                 </div>
                 <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-white/10 transition-colors">
                    <Send size={28} />
                 </div>
              </button>

              <button 
                onClick={handleSaveToVault}
                disabled={loading || !fusionResult}
                className="group glass p-10 rounded-[48px] bg-white border-none shadow-xl flex items-center justify-between hover:bg-blue-600 hover:text-white transition-all text-left disabled:opacity-50"
              >
                 <div className="space-y-2">
                    <h4 className="text-2xl font-black italic uppercase tracking-tight">歸檔戰略金庫</h4>
                    <p className="text-xs font-bold text-gray-400 group-hover:text-white/60 italic">作為未來演講與辯論的核心素材</p>
                 </div>
                 <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-white/10 transition-colors">
                    <BookmarkPlus size={28} />
                 </div>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PollingRadar;
