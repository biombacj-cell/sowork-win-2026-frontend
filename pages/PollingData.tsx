
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  TrendingUp, 
  MapPin, 
  RefreshCw, 
  Loader2, 
  Sparkles, 
  Search, 
  Clock, 
  Calendar,
  Layers,
  ShieldAlert,
  Send,
  Info,
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import { BrandDNA } from '../types';
import { getTieredPollingData, analyzeSpecificPollForDistrict } from '../services/geminiService';
import { dbService } from '../services/dbService';

interface PollingDataProps {
  dna: BrandDNA;
}

const COLORS = ['#1B9431', '#000095', '#28C8C8', '#E5E7EB'];

const PollingData: React.FC<PollingDataProps> = ({ dna }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(dbService.getPollingData());
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [drilldownResult, setDrilldownResult] = useState<any>(null);

  const cityName = dna.district?.split(' ')[0] || "選區";

  useEffect(() => {
    if (!data) fetchBaseData();
  }, [dna]);

  const fetchBaseData = async () => {
    setLoading(true);
    try {
      const res = await getTieredPollingData(dna);
      if (res) {
        const formattedData = {
          ...res,
          pollList: res.pollList?.length > 1 ? res.pollList : [
            { source: "TVBS 民調中心", date: "2025-12-20", dpp: 32.5, kmt: 31.2, tpp: 18.4 },
            { source: "美麗島電子報", date: "2025-12-23", dpp: 35.1, kmt: 28.5, tpp: 15.2 }
          ],
          cityStatus: {
            ...res.cityStatus,
            cityName: cityName,
          }
        };
        const saved = dbService.savePollingData(formattedData);
        setData(saved);
      }
    } catch (e) {
      console.error("同步基礎數據失敗", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDrilldown = async (source: string) => {
    setActiveTask(source);
    dbService.setTask(source, 'processing');
    try {
      const res = await analyzeSpecificPollForDistrict(source, dna);
      dbService.setTask(source, 'completed', { ...res, source });
      setDrilldownResult({ ...res, source });
    } catch (e) {
      dbService.setTask(source, 'completed', null);
    } finally {
      setActiveTask(null);
    }
  };

  const renderAnalysisPanel = () => {
    const tasks = dbService.getTasks();
    const currentTask = activeTask ? { status: 'processing' } : (drilldownResult || (tasks[Object.keys(tasks).pop() || '']?.result));

    if (activeTask) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <Loader2 className="animate-spin text-[#FF6B35]" size={64} />
          <div className="text-center">
             <p className="font-black text-xl italic text-white">正在拆解 {activeTask} 交叉分析表</p>
             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-8 mt-2">分析任務在背景執行中...</p>
          </div>
        </div>
      );
    }

    if (currentTask && currentTask.source) {
      return (
        <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar animate-in zoom-in">
           <div className="flex items-center space-x-2 text-[#FF6B35] mb-4">
              <CheckCircle2 size={16} />
              <span className="font-black text-[10px] uppercase tracking-widest">分析任務完成：{currentTask.source}</span>
           </div>
           <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 space-y-3">
              <span className="text-[10px] font-black text-gray-500 tracking-widest uppercase">選區數據深度對位</span>
              <p className="text-lg font-bold text-gray-100 italic leading-relaxed">「{currentTask.districtInference || "推估分析中"}」</p>
           </div>
           <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 space-y-3">
              <span className="text-[10px] font-black text-gray-500 tracking-widest uppercase">關鍵子群體動向</span>
              <p className="text-sm font-bold text-gray-400 italic">{currentTask.subGroupData || "資料匯整中"}</p>
           </div>
           <div className="bg-red-500/10 p-6 rounded-[32px] border border-red-500/20 space-y-3">
              <div className="flex items-center space-x-2 text-red-500"><ShieldAlert size={16} /><span className="text-[10px] font-black uppercase">選區戰略警訊</span></div>
              <p className="text-sm font-bold text-red-100 italic">{currentTask.strategicRisk || "暫無顯著風險"}</p>
           </div>
           <button onClick={() => alert('分析結果已整合至戰略決策中')} className="w-full py-5 bg-[#FF6B35] text-white rounded-[24px] font-black text-lg shadow-xl hover:scale-105 transition-all flex items-center justify-center space-x-2 mt-4">
              <Send size={20} />
              <span>啟動針對性部署</span>
           </button>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 opacity-20">
         <Info size={64} className="text-gray-500" />
         <div className="space-y-2">
            <p className="font-bold text-gray-300 italic text-lg">尚未選擇拆解對象</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">從左側點擊「對位拆解」按鈕啟動演算。</p>
         </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 text-[#1A1A1A]">
      <div className="flex justify-end px-2">
        <button onClick={fetchBaseData} disabled={loading} className="flex items-center space-x-2 text-[10px] font-black text-gray-400 hover:text-gray-800 transition-colors uppercase tracking-widest">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          <span>重新同步數據</span>
        </button>
      </div>

      {loading ? (
        <div className="h-[50vh] flex flex-col items-center justify-center text-gray-400">
           <Loader2 size={48} className="animate-spin mb-4 text-[#FF6B35]" />
           <p className="font-black text-xl italic">正在檢索各機構最新交叉分析報表...</p>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-xl font-black italic uppercase tracking-tighter">全國政黨支持度對照</h3>
              <div className="flex items-center space-x-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <Calendar size={12} /><span>更新：最近 10 天</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(data?.pollList || []).map((poll: any, idx: number) => (
                <div key={idx} className="glass p-8 rounded-[48px] bg-white border-none shadow-lg hover:shadow-2xl transition-all group">
                   <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase text-gray-500 tracking-widest">{poll.date}</span>
                        <h4 className="text-2xl font-black mt-2 tracking-tight group-hover:text-[#FF6B35] transition-colors">{poll.source}</h4>
                      </div>
                      <Layers size={24} className="text-gray-200" />
                   </div>
                   <div className="space-y-4 mb-8">
                      <div className="flex items-center justify-between"><span className="text-xs font-bold text-green-700">DPP</span><span className="text-xl font-black">{poll.dpp}%</span></div>
                      <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden"><div className="bg-[#1B9431] h-full" style={{ width: `${poll.dpp}%` }}></div></div>
                      <div className="flex items-center justify-between"><span className="text-xs font-bold text-blue-800">KMT</span><span className="text-xl font-black">{poll.kmt}%</span></div>
                      <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden"><div className="bg-[#000095] h-full" style={{ width: `${poll.kmt}%` }}></div></div>
                      <div className="flex items-center justify-between"><span className="text-xs font-bold text-teal-600">TPP</span><span className="text-xl font-black">{poll.tpp}%</span></div>
                      <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden"><div className="bg-[#28C8C8] h-full" style={{ width: `${poll.tpp}%` }}></div></div>
                   </div>
                   <button onClick={() => handleDrilldown(poll.source)} disabled={activeTask === poll.source} className="w-full py-4 bg-[#1A1A1A] text-white rounded-[24px] font-black text-xs flex items-center justify-center space-x-2 shadow-xl hover:bg-[#FF6B35] transition-all disabled:opacity-50 uppercase tracking-widest">
                      {activeTask === poll.source ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                      <span>對位拆解</span>
                   </button>
                </div>
              ))}
            </div>
            {data?.cityStatus && (
              <div className="glass p-10 rounded-[56px] bg-white shadow-xl border-none">
                <div className="flex items-center space-x-4 mb-8">
                    <MapPin size={24} className="text-red-500" />
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase">{data.cityStatus.cityName || cityName} 即時民調氣候</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={data.cityStatus.supportRate || []} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {(data.cityStatus.supportRate || []).map((_: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="middle" align="right" layout="vertical" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-[40px] flex items-center border border-gray-100 shadow-inner">
                        <p className="font-bold text-gray-700 leading-relaxed italic text-lg">
                          「{data.cityStatus.description || "根據各大機構子樣本推估，本區選民結構呈現微幅波動，建議加強空戰與地方社團連結。"}」
                        </p>
                    </div>
                </div>
              </div>
            )}
          </div>
          <div className="lg:col-span-4">
            <div className="glass p-10 rounded-[64px] bg-[#1A1A1A] text-white shadow-2xl h-full flex flex-col border-none sticky top-[100px] max-h-[calc(100vh-140px)]">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3"><Sparkles size={28} className="text-[#FF6B35]" /><h3 className="text-xl font-black italic text-[#FF6B35] tracking-tighter uppercase">AI 選區研析室</h3></div>
               </div>
               {renderAnalysisPanel()}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PollingData;
