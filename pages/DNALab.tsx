
import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Zap, 
  Loader2, 
  Search, 
  RefreshCw, 
  ChevronRight, 
  ChevronLeft, 
  Flag, 
  Save, 
  ShieldCheck, 
  Rocket,
  Edit3,
  ExternalLink,
  Target,
  UserCheck,
  CircleDashed,
  ArrowDownRight,
  ArrowUpRight,
  ShieldAlert,
  MapPin,
  Fingerprint,
  Map,
  Camera,
  Upload,
  User,
  X
} from 'lucide-react';
import { BrandDNA } from '../types';
import { TAIWAN_REGIONS, ELECTION_LEVELS, CITY_DISTRICTS, POLITICAL_PARTIES } from '../constants';
import { computeStrategicPositioning, autoDiscoverStrategicTriangle } from '../services/geminiService';
import { dbService } from '../services/dbService';

interface DNALabProps {
  dna: BrandDNA & { visualDNA?: string };
  setDna: (dna: BrandDNA & { visualDNA?: string }) => void;
  setActiveTab: (tab: string) => void;
}

const DNALab: React.FC<DNALabProps> = ({ dna, setDna, setActiveTab }) => {
  const [isEditing, setIsEditing] = useState(!dna.slogan);
  const [localDna, setLocalDna] = useState<BrandDNA & { visualDNA?: string }>(dna);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 選區連動狀態保持不變...
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState(dna.district.split(' ')[0] || '');
  const [selectedSubDistrict, setSelectedSubDistrict] = useState(dna.district.includes('選區') ? dna.district.split(' ').slice(1).join(' ') : '');
  
  const [directionIdx, setDirectionIdx] = useState(0);
  const [wizard, setWizard] = useState({
    voterPainPoints: dna.strategicTriangle?.voterPainPoints || '',
    competitorWeakness: dna.strategicTriangle?.competitorWeakness || '',
    candidateStrengths: dna.strategicTriangle?.candidateStrengths || ''
  });

  const [scouting, setScouting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [strategicDirections, setStrategicDirections] = useState<any[]>([]);

  const isCityLevelElection = localDna.electionLevel === '直轄市長' || localDna.electionLevel === '縣市長';

  const getPartyTheme = (party: string) => {
    if (party.includes('國民黨')) return { bg: 'from-blue-900 to-blue-700', accent: '#000095', light: 'bg-blue-50', text: 'text-blue-800' };
    if (party.includes('民進黨')) return { bg: 'from-green-900 to-green-700', accent: '#1B9431', light: 'bg-green-50', text: 'text-green-800' };
    if (party.includes('民眾黨')) return { bg: 'from-teal-700 to-teal-500', accent: '#28C8C8', light: 'bg-teal-50', text: 'text-teal-800' };
    return { bg: 'from-orange-700 to-orange-500', accent: '#FF6B35', light: 'bg-orange-50', text: 'text-orange-800' };
  };

  const theme = getPartyTheme(localDna.party);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLocalDna(prev => ({ ...prev, visualDNA: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInitiateScouting = async () => {
    const fullDistrict = isCityLevelElection ? selectedCity : `${selectedCity} ${selectedSubDistrict}`.trim();
    if (!selectedCity) {
      alert("請選擇完整選區資訊");
      return;
    }
    
    setLocalDna(prev => ({ ...prev, district: fullDistrict }));
    setScouting(true);
    try {
      const research = await autoDiscoverStrategicTriangle({
        candidateName: localDna.candidateName,
        party: localDna.party,
        district: fullDistrict,
        electionLevel: localDna.electionLevel
      });
      if (research) {
        setWizard(research);
        setActiveStep(2);
      }
    } catch (e) {
      alert('AI 偵查連線中斷');
    } finally {
      setScouting(false);
    }
  };

  const handleComputePositioning = async () => {
    setAnalyzing(true);
    try {
      const result = await computeStrategicPositioning({
        ...wizard,
        district: localDna.district,
        party: localDna.party,
        candidateName: localDna.candidateName
      });
      if (result && result.directions) {
        setStrategicDirections(result.directions);
        setDirectionIdx(0);
        updateDnaWithDirection(result.directions[0]);
        setActiveStep(3);
      }
    } catch (e) {
      alert('戰略演算失敗');
    } finally {
      setAnalyzing(false);
    }
  };

  const updateDnaWithDirection = (dir: any) => {
    const finalDna = {
      ...localDna,
      slogan: dir.slogan,
      competitiveEdge: dir.story,
      coreMessage: dir.tone,
      personality: dir.motivation,
      strategicTriangle: wizard
    };
    setLocalDna(finalDna);
    if (activeStep === 3) setDna(finalDna);
  };

  if (!isEditing && dna.slogan) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700 pb-20 text-[#1A1A1A]">
        <div className="flex justify-between items-center px-2">
           <h3 className="text-xl font-black italic tracking-tight uppercase flex items-center space-x-3">
             <div className="w-1.5 h-6 bg-[#FF6B35] rounded-full"></div>
             <span>戰略 DNA 概覽</span>
           </h3>
           <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 text-[10px] font-black text-gray-400 hover:text-[#FF6B35] transition-all uppercase tracking-widest"
          >
            <Edit3 size={14} />
            <span>重新演算戰略 DNA</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className={`w-full bg-gradient-to-br ${theme.bg} p-12 md:p-24 rounded-[64px] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[400px] md:min-h-[550px] border-4 border-white/10 group`}>
              {dna.visualDNA ? (
                <div className="absolute inset-0 opacity-20 transition-transform duration-700 group-hover:scale-110">
                   <img src={dna.visualDNA} className="w-full h-full object-cover grayscale mix-blend-overlay" alt="Visual DNA Background" />
                </div>
              ) : (
                <div className="absolute top-12 left-12 opacity-5 scale-150"><Award size={150} /></div>
              )}
              
              <div className="relative z-10 text-center space-y-10 w-full px-6">
                <div className="inline-flex items-center space-x-4 bg-white/10 backdrop-blur-xl px-8 py-3 rounded-full border border-white/20">
                  <CircleDashed size={20} className="text-white animate-spin-slow" />
                  <span className="text-white font-black text-[10px] uppercase tracking-[0.4em]">Strategic Focal Point</span>
                </div>
                
                <h2 className="text-white text-5xl sm:text-7xl md:text-[8rem] font-black italic tracking-tighter leading-[0.9] drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]">
                  {dna.slogan}
                </h2>

                <div className="w-full md:w-auto px-10 py-6 bg-black/20 backdrop-blur-md rounded-[40px] border border-white/10 text-white shadow-2xl inline-block">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">戰鬥主軸</p>
                  <p className="font-black text-2xl md:text-3xl italic tracking-tight uppercase leading-tight">{dna.coreMessage}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="glass p-10 rounded-[48px] bg-white shadow-xl space-y-6 border-b-8 border-blue-600">
                  <div className="flex items-center space-x-3 text-blue-600">
                    <UserCheck size={24} />
                    <span className="font-black text-sm uppercase tracking-widest">選民痛點鎖定</span>
                  </div>
                  <p className="font-bold text-lg text-gray-700 italic leading-relaxed">{dna.strategicTriangle?.voterPainPoints}</p>
               </div>

               <div className="glass p-10 rounded-[48px] bg-white shadow-xl space-y-6 border-b-8 border-red-600">
                  <div className="flex items-center space-x-3 text-red-600">
                    <Target size={24} />
                    <span className="font-black text-sm uppercase tracking-widest">對手戰略盲區</span>
                  </div>
                  <p className="font-bold text-lg text-gray-700 italic leading-relaxed">{dna.strategicTriangle?.competitorWeakness}</p>
               </div>

               <div className="glass p-10 rounded-[48px] bg-white shadow-xl space-y-6 border-b-8 border-orange-600">
                  <div className="flex items-center space-x-3 text-orange-600">
                    <Zap size={24} />
                    <span className="font-black text-sm uppercase tracking-widest">我方戰鬥優勢</span>
                  </div>
                  <p className="font-bold text-lg text-gray-700 italic leading-relaxed">{dna.strategicTriangle?.candidateStrengths}</p>
               </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="glass p-10 rounded-[64px] bg-[#1A1A1A] text-white shadow-2xl flex flex-col border-none h-fit lg:sticky lg:top-24 max-h-[calc(100vh-140px)]">
               <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center space-x-3 text-[#FF6B35]">
                    <Rocket size={32} />
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase">英雄論述</h3>
                 </div>
               </div>

               <div className="space-y-8 overflow-y-auto pr-0 custom-scrollbar">
                  {dna.visualDNA && (
                    <div className="w-full aspect-[4/3] rounded-[40px] overflow-hidden border-2 border-white/10 shadow-lg">
                       <img src={dna.visualDNA} className="w-full h-full object-cover" alt="Visual Reference" />
                    </div>
                  )}

                  <div>
                    <p className="text-[#FF6B35] font-black text-[10px] mb-4 uppercase tracking-[0.3em]">Positioning Archetype</p>
                    <p className="text-3xl font-black italic tracking-tight mb-8 leading-tight">【{dna.personality}】</p>
                    <p className="font-bold text-xl leading-relaxed text-gray-200 italic">
                      {dna.competitiveEdge}
                    </p>
                  </div>

                  <div className="p-10 bg-white/5 rounded-[40px] border border-white/10">
                     <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest block mb-4">今日話術推薦</label>
                     <p className="text-2xl font-black italic leading-tight text-white">
                       「{dna.coreMessage}，這不僅是我的諾言，更是這塊土地的未來。」
                     </p>
                  </div>
               </div>

               <button 
                 onClick={() => setActiveTab('content')}
                 className="mt-12 w-full py-7 bg-white text-black rounded-[32px] font-black text-xl flex items-center justify-center space-x-3 hover:bg-[#FF6B35] hover:text-white transition-all shadow-xl uppercase italic"
               >
                 <ExternalLink size={24} />
                 <span>進入文宣產線</span>
               </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-[#1A1A1A]">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-2">
         <h3 className="text-xl font-black italic tracking-tight uppercase flex items-center space-x-3 w-full">
           <div className="w-1.5 h-6 bg-[#FF6B35] rounded-full"></div>
           <span>戰略演算導航</span>
         </h3>
         <div className="flex bg-white/50 p-1.5 rounded-full border border-gray-200 shadow-sm overflow-x-auto max-w-full">
          {[1, 2, 3].map(s => (
            <button 
              key={s}
              onClick={() => { if(s < activeStep) setActiveStep(s); }}
              className={`px-8 py-3 rounded-full text-xs font-black transition-all whitespace-nowrap uppercase tracking-widest ${activeStep === s ? 'text-white shadow-lg' : 'text-gray-400'}`}
              style={{ backgroundColor: activeStep === s ? theme.accent : 'transparent' }}
            >
              Step {s}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
         {activeStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-left">
               <div className="glass p-10 rounded-[56px] space-y-8 bg-white shadow-xl border-none">
                  <div className="flex items-center space-x-4 border-b border-gray-100 pb-6">
                     <div className={`${theme.light} p-4 rounded-2xl shadow-sm`}><Flag style={{ color: theme.accent }} /></div>
                     <div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter">1. 戰鬥基本盤與視覺 DNA</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">定位您的身份與精準面貌</p>
                     </div>
                  </div>

                  <div className="space-y-8">
                     {/* 視覺 DNA 上傳 */}
                     <div className="bg-gray-50 p-6 rounded-[40px] border border-gray-100">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">視覺 DNA (精準影像生成基準)</label>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full aspect-video rounded-[32px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF6B35] hover:bg-orange-50 transition-all overflow-hidden relative"
                        >
                           {localDna.visualDNA ? (
                             <>
                               <img src={localDna.visualDNA} className="w-full h-full object-cover" alt="Candidate DNA" />
                               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                  <RefreshCw className="text-white" size={32} />
                               </div>
                             </>
                           ) : (
                             <div className="text-center space-y-2">
                                <Upload className="mx-auto text-gray-300" size={32} />
                                <p className="text-xs font-bold text-gray-400">上傳候選人真實清晰照</p>
                             </div>
                           )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">候選人姓名</label>
                           <input type="text" value={localDna.candidateName} onChange={(e) => setLocalDna({...localDna, candidateName: e.target.value})} className="w-full bg-gray-50 p-6 rounded-[32px] border border-gray-100 outline-none font-black text-xl shadow-inner focus:border-[#FF6B35] transition-all" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">選舉層級</label>
                           <select value={localDna.electionLevel} onChange={(e) => setLocalDna({...localDna, electionLevel: e.target.value})} className="w-full bg-gray-50 p-6 rounded-[32px] border border-gray-100 font-bold text-lg shadow-inner appearance-none">
                              {ELECTION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                           </select>
                        </div>
                     </div>

                     <div className="space-y-6 bg-gray-50/50 p-8 rounded-[40px] border border-gray-100">
                        <div className="flex items-center space-x-2 text-gray-400 mb-2">
                           <Map size={16} />
                           <span className="text-[10px] font-black uppercase tracking-widest">選區對位 (完整連動資料庫)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                           <div>
                              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">區域</label>
                              <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} className="w-full bg-white p-4 rounded-2xl border border-gray-200 font-bold text-sm shadow-sm"><option value="">請選擇區域</option>{Object.keys(TAIWAN_REGIONS).map(r => <option key={r} value={r}>{r}</option>)}</select>
                           </div>
                           <div>
                              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">縣市</label>
                              <select value={selectedCity} disabled={!selectedRegion} onChange={(e) => setSelectedCity(e.target.value)} className="w-full bg-white p-4 rounded-2xl border border-gray-200 font-bold text-sm shadow-sm disabled:opacity-30"><option value="">請選擇縣市</option>{selectedRegion && (TAIWAN_REGIONS as any)[selectedRegion].map((c: string) => <option key={c} value={c}>{c}</option>)}</select>
                           </div>
                           {!isCityLevelElection && (
                              <div>
                                 <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">細分選區</label>
                                 <select value={selectedSubDistrict} disabled={!selectedCity} onChange={(e) => setSelectedSubDistrict(e.target.value)} className="w-full bg-white p-4 rounded-2xl border border-gray-200 font-bold text-sm shadow-sm disabled:opacity-30"><option value="">請選擇選區</option>{selectedCity && CITY_DISTRICTS[selectedCity]?.map(d => <option key={d} value={d}>{d}</option>)}</select>
                              </div>
                           )}
                        </div>
                     </div>

                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">政黨背景</label>
                        <select value={localDna.party} onChange={(e) => setLocalDna({...localDna, party: e.target.value})} className="w-full bg-gray-50 p-6 rounded-[32px] border border-gray-100 font-bold text-lg shadow-inner">
                          {POLITICAL_PARTIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                     </div>
                  </div>
               </div>

               <div className="glass p-12 rounded-[56px] flex flex-col items-center justify-center text-center bg-white relative border-none shadow-2xl overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Target size={120} /></div>
                  
                  {scouting ? (
                    <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in">
                      <div className="relative mb-8">
                         <div className="w-24 h-24 border-4 border-gray-100 rounded-full"></div>
                         <div className="absolute inset-0 border-t-4 border-[#FF6B35] rounded-full animate-spin"></div>
                         <RefreshCw className="absolute inset-0 m-auto text-[#FF6B35] animate-pulse" size={32} />
                      </div>
                      <p className="font-black text-2xl italic text-gradient uppercase tracking-widest">挖掘民意座標中...</p>
                    </div>
                  ) : (
                    <div className="space-y-10">
                       <div className="space-y-4">
                          <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">啟動戰略<br/><span className="text-[#FF6B35]">民意偵查</span></h2>
                          <p className="text-gray-500 font-bold px-12 leading-relaxed text-sm italic">
                            AI 將自動比對對手盲區與選民渴望，並結合視覺 DNA 鎖定候選人最佳形象與戰略三角。
                          </p>
                       </div>
                       
                       <button 
                        onClick={handleInitiateScouting} 
                        className="w-full py-8 rounded-[40px] font-black text-2xl flex items-center justify-center space-x-4 text-white shadow-2xl hover:scale-105 transition-all uppercase italic bg-[#1A1A1A] hover:bg-[#FF6B35]"
                       >
                         <Sparkles size={28} />
                         <span>啟動演算</span>
                       </button>

                       <div className="flex items-center justify-center space-x-3 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                          <ShieldCheck size={14} className="text-green-500" />
                          <span>已掛載視覺參考 DNA 引擎</span>
                       </div>
                    </div>
                  )}
               </div>
            </div>
         )}

         {/* Step 2 & 3 保持邏輯不變 */}
         {activeStep === 2 && (
            <div className="glass p-12 rounded-[64px] bg-white shadow-2xl border-none animate-in zoom-in duration-500">
               <div className="flex items-center space-x-4 mb-12">
                  <Target size={32} className="text-[#FF6B35]" />
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase">2. 戰略三角對位確認</h2>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  {[
                    { label: '選民痛點', value: wizard.voterPainPoints, key: 'voterPainPoints', color: 'blue' },
                    { label: '對手弱點', value: wizard.competitorWeakness, key: 'competitorWeakness', color: 'red' },
                    { label: '我方優勢', value: wizard.candidateStrengths, key: 'candidateStrengths', color: 'orange' }
                  ].map((item) => (
                    <div key={item.key} className={`bg-${item.color}-50/50 p-8 rounded-[40px] border border-${item.color}-100 space-y-4`}>
                       <label className={`text-[10px] font-black text-${item.color}-600 uppercase tracking-widest`}>{item.label}</label>
                       <textarea 
                        value={item.value} 
                        onChange={(e) => setWizard({...wizard, [item.key]: e.target.value})}
                        className="w-full bg-transparent border-none outline-none font-bold text-lg text-gray-800 italic leading-relaxed h-32 resize-none"
                       />
                    </div>
                  ))}
               </div>

               <div className="flex items-center justify-center space-x-6">
                  <button onClick={() => setActiveStep(1)} className="px-12 py-6 rounded-[32px] font-black text-gray-400 hover:text-gray-800 transition-all uppercase italic">返回重調</button>
                  <button onClick={handleComputePositioning} className="px-20 py-6 bg-[#1A1A1A] text-white rounded-[32px] font-black text-xl flex items-center space-x-4 shadow-xl hover:bg-[#FF6B35] transition-all uppercase italic">
                    {analyzing ? <Loader2 className="animate-spin" /> : <><Rocket size={24} /><span>演算英雄標語</span></>}
                  </button>
               </div>
            </div>
         )}

         {activeStep === 3 && strategicDirections.length > 0 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
               <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gradient">3. 戰略對焦方案</h2>
                  <div className="flex items-center space-x-2">
                     <button onClick={() => setDirectionIdx(Math.max(0, directionIdx - 1))} className="p-4 bg-white rounded-full shadow-md disabled:opacity-30" disabled={directionIdx === 0}><ChevronLeft /></button>
                     <span className="font-black text-sm italic">{directionIdx + 1} / {strategicDirections.length}</span>
                     <button onClick={() => setDirectionIdx(Math.min(strategicDirections.length - 1, directionIdx + 1))} className="p-4 bg-white rounded-full shadow-md disabled:opacity-30" disabled={directionIdx === strategicDirections.length - 1}><ChevronRight /></button>
                  </div>
               </div>

               <div className="glass p-12 rounded-[64px] bg-white shadow-2xl border-none">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                     <div className="space-y-10">
                        <div className={`p-10 rounded-[48px] bg-gradient-to-br ${theme.bg} text-white shadow-2xl`}>
                           <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-4">主攻標語 (Hero Slogan)</p>
                           <h3 className="text-5xl font-black italic leading-tight">{strategicDirections[directionIdx].slogan}</h3>
                        </div>
                        <div className="bg-gray-50 p-10 rounded-[48px] border border-gray-100 shadow-inner">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">品牌人格對位 (Archetype)</p>
                           <p className="text-3xl font-black text-gray-800 italic">【{strategicDirections[directionIdx].motivation}】</p>
                        </div>
                     </div>
                     <div className="space-y-8 flex flex-col justify-center">
                        <div className="space-y-2">
                           <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">核心英雄故事</p>
                           <p className="text-xl font-bold text-gray-700 leading-relaxed italic border-l-4 border-gray-100 pl-6 py-2">
                              {strategicDirections[directionIdx].story}
                           </p>
                        </div>
                        <div className="space-y-2">
                           <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">今日話術鉤子</p>
                           <p className="text-2xl font-black text-gray-800 italic leading-tight">
                              「{strategicDirections[directionIdx].hook}」
                           </p>
                        </div>
                        <button 
                          onClick={() => {
                            updateDnaWithDirection(strategicDirections[directionIdx]);
                            setIsEditing(false);
                            setActiveTab('dashboard');
                          }}
                          className="w-full py-8 bg-[#1A1A1A] text-white rounded-[40px] font-black text-2xl flex items-center justify-center space-x-4 shadow-2xl hover:bg-green-600 transition-all uppercase italic"
                        >
                           <CheckCircle2 size={28} />
                           <span>選定戰略 DNA 並開戰</span>
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
    </div>
  );
};

export default DNALab;
