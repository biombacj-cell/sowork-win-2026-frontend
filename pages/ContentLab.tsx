
import React, { useState, useEffect } from 'react';
import { 
  Facebook, 
  MessageCircle, 
  Sparkles, 
  Send, 
  Copy, 
  Loader2, 
  ImageIcon, 
  Download, 
  ShieldCheck, 
  Eye, 
  CheckCircle2, 
  Hash,
  Instagram,
  Heart,
  MessageSquare,
  Bookmark,
  MoreHorizontal,
  RefreshCw,
  User
} from 'lucide-react';
import { generateSocialContent, auditCompliance, translateToCampaignPrompt } from '../services/geminiService';
import { GoogleGenAI } from "@google/genai";
import { BrandDNA } from '../types';

interface ContentLabProps {
  dna: BrandDNA & { visualDNA?: string };
  prefilledTopic?: string;
}

type Platform = 'facebook' | 'line' | 'instagram' | 'threads';

const ContentLab: React.FC<ContentLabProps> = ({ dna, prefilledTopic }) => {
  const [topic, setTopic] = useState(prefilledTopic || '');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activePlatform, setActivePlatform] = useState<Platform>('facebook');
  
  const [auditing, setAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "9:16" | "16:9">("1:1");

  useEffect(() => {
    if (prefilledTopic) setTopic(prefilledTopic);
  }, [prefilledTopic]);

  const handleGenerateContent = async () => {
    if (!topic) return;
    setLoading(true);
    setAuditResult(null);
    try {
      const res = await generateSocialContent(topic, dna);
      setResult(res);
    } catch (e) {
      alert("文稿演算失敗。");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    setGeneratingImage(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const englishPrompt = await translateToCampaignPrompt(topic, dna);

      // 影像對位核心邏輯：是否有視覺 DNA？
      const contentsParts: any[] = [];
      
      // 如果有真實照片，作為 Part[0] 傳給 AI
      if (dna.visualDNA) {
        const base64Data = dna.visualDNA.split(',')[1]; // 移除 data:image/png;base64,
        contentsParts.push({
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg'
          }
        });
      }

      // 文字指令
      contentsParts.push({ text: englishPrompt });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: contentsParts }],
        config: { 
          imageConfig: { aspectRatio: aspectRatio }
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (e) {
      alert("影像生成失敗。可能是因為視覺 DNA 格式不支援或 API 限額。");
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleAudit = async () => {
    if (!result || !result[activePlatform]) return;
    setAuditing(true);
    try {
      const res = await auditCompliance(result[activePlatform]);
      setAuditResult(res);
    } catch (e) { console.error(e); } finally { setAuditing(false); }
  };

  const renderNativePreview = () => {
    const text = result ? result[activePlatform] : "等待演算中...";
    const image = generatedImage;

    switch (activePlatform) {
      case 'facebook':
        return (
          <div className="bg-white flex flex-col h-full animate-in fade-in">
             <div className="p-4 flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black overflow-hidden">
                   {dna.visualDNA ? <img src={dna.visualDNA} className="w-full h-full object-cover" /> : dna.candidateName.charAt(0)}
                </div>
                <div className="leading-tight">
                   <p className="font-bold text-sm text-gray-900">{dna.candidateName}</p>
                   <p className="text-[10px] text-gray-500">剛剛 · 公開</p>
                </div>
             </div>
             <div className="px-4 pb-2 text-sm text-gray-800 whitespace-pre-wrap">{text}</div>
             {image && <img src={image} className="w-full object-cover" />}
             <div className="p-3 border-t flex justify-around text-gray-500 text-xs font-bold">
                <span>讚</span><span>留言</span><span>分享</span>
             </div>
          </div>
        );
      case 'instagram':
        return (
          <div className="bg-white flex flex-col h-full animate-in fade-in">
             <div className="p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                   <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-full p-[2px]"><div className="w-full h-full bg-white rounded-full p-[1px]"><div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-black overflow-hidden">{dna.visualDNA ? <img src={dna.visualDNA} className="w-full h-full object-cover" /> : dna.candidateName.charAt(0)}</div></div></div>
                   <span className="text-xs font-bold">{dna.candidateName}</span>
                </div>
                <MoreHorizontal size={16} />
             </div>
             <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                {image ? <img src={image} className="w-full h-full object-cover" /> : <ImageIcon className="opacity-10" size={48} />}
             </div>
             <div className="p-3 space-y-2">
                <div className="flex space-x-3"><Heart size={20} /><MessageSquare size={20} /><Send size={20} /></div>
                <div className="text-xs">
                   <span className="font-bold mr-2">{dna.candidateName}</span>
                   <span className="text-gray-800 whitespace-pre-wrap">{text}</span>
                </div>
             </div>
          </div>
        );
      case 'line':
        return (
          <div className="bg-[#7494C0] h-full p-4 space-y-4 overflow-y-auto animate-in fade-in">
             <div className="flex items-start space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black overflow-hidden">{dna.visualDNA ? <img src={dna.visualDNA} className="w-full h-full object-cover" /> : dna.candidateName.charAt(0)}</div>
                <div className="space-y-1 max-w-[80%]">
                   <span className="text-[10px] text-white ml-1">{dna.candidateName}</span>
                   <div className="bg-white rounded-[18px] rounded-tl-none p-3 shadow-sm">
                      {image && <img src={image} className="rounded-lg mb-2 w-full" />}
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{text}</p>
                   </div>
                </div>
             </div>
          </div>
        );
      case 'threads':
        return (
          <div className="bg-white h-full p-6 animate-in fade-in">
             <div className="flex space-x-3">
                <div className="flex flex-col items-center">
                   <div className="w-10 h-10 bg-black rounded-full text-white flex items-center justify-center font-black overflow-hidden">{dna.visualDNA ? <img src={dna.visualDNA} className="w-full h-full object-cover" /> : dna.candidateName.charAt(0)}</div>
                   <div className="w-[2px] flex-1 bg-gray-100 my-2"></div>
                </div>
                <div className="flex-1 space-y-3">
                   <div className="flex justify-between items-center"><span className="text-sm font-bold">{dna.candidateName}</span><span className="text-xs text-gray-400">1m</span></div>
                   <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{text}</p>
                   {image && <img src={image} className="rounded-xl border border-gray-100 w-full" />}
                   <div className="flex space-x-4 text-gray-400"><Heart size={18} /><MessageSquare size={18} /><RefreshCw size={18} /><Send size={18} /></div>
                </div>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 text-[#1A1A1A]">
      <div className="glass p-8 rounded-[48px] bg-white shadow-xl flex flex-col md:flex-row items-center gap-6">
         <div className="flex-1 w-full">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-4">主攻戰略主題</label>
            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-6 rounded-full outline-none focus:border-[#FF6B35] font-black text-xl shadow-inner transition-all" placeholder="輸入欲產出的政見或戰略話題..." />
         </div>
         <div className="flex space-x-3">
            <button onClick={handleGenerateContent} disabled={loading || !topic} className="px-8 py-6 bg-[#1A1A1A] text-white rounded-full font-black text-lg flex items-center space-x-2 shadow-xl hover:bg-[#FF6B35] transition-all disabled:opacity-50">
               {loading ? <Loader2 className="animate-spin" /> : <><Sparkles size={20} /><span>產出文案</span></>}
            </button>
            <button onClick={handleGenerateImage} disabled={generatingImage || !topic} className="px-8 py-6 bg-orange-50 text-orange-600 rounded-full font-black text-lg flex items-center space-x-2 shadow-md hover:bg-orange-100 border border-orange-100 transition-all disabled:opacity-50">
               {generatingImage ? <Loader2 className="animate-spin" /> : <><ImageIcon size={20} /><span>{dna.visualDNA ? '視覺 DNA 合成' : '生成影像'}</span></>}
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         <div className="lg:col-span-8 flex flex-col space-y-6">
            <div className="flex space-x-2 bg-white/50 p-1.5 rounded-full border border-gray-200 self-center">
               {(['facebook', 'instagram', 'threads', 'line'] as const).map(p => (
                 <button key={p} onClick={() => setActivePlatform(p)} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${activePlatform === p ? 'bg-[#1A1A1A] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>
                    {p === 'facebook' && <Facebook size={14} />}
                    {p === 'instagram' && <Instagram size={14} />}
                    {p === 'threads' && <Hash size={14} />}
                    {p === 'line' && <MessageCircle size={14} />}
                    <span>{p}</span>
                 </button>
               ))}
            </div>

            <div className="relative group max-w-md mx-auto w-full">
               <div className="bg-[#1A1A1A] rounded-[64px] p-4 shadow-2xl border-[10px] border-gray-800 relative overflow-hidden h-[750px] flex flex-col">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-20"></div>
                  <div className="flex-1 bg-white rounded-[44px] overflow-hidden">
                     {renderNativePreview()}
                  </div>
               </div>
               
               <div className="absolute -right-16 top-1/2 -translate-y-1/2 flex flex-col space-y-4 bg-white p-3 rounded-2xl shadow-xl border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                  {(['1:1', '9:16', '16:9'] as const).map(r => (
                    <button key={r} onClick={() => setAspectRatio(r)} className={`w-10 h-10 rounded-lg text-[8px] font-black border-2 ${aspectRatio === r ? 'border-[#FF6B35] text-[#FF6B35] bg-orange-50' : 'border-gray-100 text-gray-400'}`}>{r}</button>
                  ))}
               </div>
            </div>
         </div>

         <div className="lg:col-span-4 space-y-6">
            <div className="glass p-8 rounded-[40px] bg-white shadow-xl space-y-6">
               <div className="flex items-center space-x-2 text-orange-600">
                  <ShieldCheck size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">影像精準對焦狀態</span>
               </div>
               
               {dna.visualDNA ? (
                 <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-2xl border border-green-100">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm">
                       <img src={dna.visualDNA} className="w-full h-full object-cover" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-green-600">已連結視覺 DNA</p>
                       <p className="text-[9px] font-bold text-green-800/60">生成影像將保持候選人外貌相似度。</p>
                    </div>
                 </div>
               ) : (
                 <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400">尚未上傳候選人照片</p>
                    <p className="text-[9px] font-bold text-gray-400 italic">目前將生成「通用亞洲候選人」形象。建議至 DNA 實驗室上傳照片。</p>
                 </div>
               )}

               <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                     <p className="text-[9px] font-black text-orange-400 uppercase mb-1">DNA 對焦</p>
                     <p className="text-xs font-bold text-gray-700 italic">已對位「{dna.personality}」特質。</p>
                  </div>
               </div>
               
               <div className="pt-6 border-t border-gray-100 space-y-3">
                  <button onClick={handleAudit} disabled={!result || auditing} className="w-full py-4 bg-gray-50 rounded-2xl font-black text-xs flex items-center justify-center space-x-2 hover:bg-orange-50 hover:text-orange-600 transition-all">
                     {auditing ? <Loader2 className="animate-spin" /> : <ShieldCheck size={16} />}
                     <span>法規稽核</span>
                  </button>
               </div>
            </div>

            <button className="w-full py-6 bg-[#1A1A1A] text-white rounded-[32px] font-black text-lg flex items-center justify-center space-x-3 shadow-2xl hover:bg-orange-600 transition-all uppercase italic">
               <Send size={20} />
               <span>立即全通路部署</span>
            </button>
         </div>
      </div>
    </div>
  );
};

export default ContentLab;
