
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { 
  Mic, 
  Play, 
  Square, 
  Loader2, 
  Sparkles, 
  Award, 
  Activity, 
  Video, 
  VideoOff, 
  MessageSquare, 
  Volume2, 
  ShieldCheck, 
  PenTool, 
  Eye, 
  RotateCcw,
  CheckCircle2,
  Trophy,
  Target,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';
import { BrandDNA } from '../types';

interface TacticalTrainingProps {
  dna: BrandDNA;
}

// PCM Audio Encoding/Decoding helpers
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const TacticalTraining: React.FC<TacticalTrainingProps> = ({ dna }) => {
  const [isActive, setIsActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const [userTranscription, setUserTranscription] = useState('');
  const [modelTranscription, setModelTranscription] = useState('');
  const [refinedScript, setRefinedScript] = useState<string | null>(null);
  const [history, setHistory] = useState<{ role: string, text: string, refined?: string }[]>([]);

  const userTranscriptionRef = useRef('');
  const modelTranscriptionRef = useRef('');
  const sessionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  // Start Camera
  useEffect(() => {
    if (showVideo && (isActive || isFullScreen)) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }).catch(err => console.error("Camera access denied", err));
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [showVideo, isActive, isFullScreen]);

  // Handle Esc key for Fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullScreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const startSession = async () => {
    setConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setConnecting(false);
            setIsActive(true);
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) { int16[i] = inputData[i] * 32768; }
              const pcmBlob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              userTranscriptionRef.current += text;
              setUserTranscription(userTranscriptionRef.current);
            } 
            else if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              modelTranscriptionRef.current += text;
              setModelTranscription(modelTranscriptionRef.current);
              
              if (text.includes('優化版本：')) {
                const parts = modelTranscriptionRef.current.split('優化版本：');
                if (parts.length > 1) setRefinedScript(parts[1].trim());
              }
            }
            
            if (message.serverContent?.turnComplete) {
              const finalUser = userTranscriptionRef.current;
              const finalAI = modelTranscriptionRef.current;
              setHistory(prev => [...prev, { role: 'user', text: finalUser }, { role: 'ai', text: finalAI, refined: refinedScript || undefined }]);
              userTranscriptionRef.current = '';
              modelTranscriptionRef.current = '';
              setUserTranscription('');
              setModelTranscription('');
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const ctx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
          },
          onerror: (e) => console.error('Live Error:', e),
          onclose: () => setIsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `你是 ${dna.candidateName} 的高端演講教練。
          
          當候選人對你說話時，你的回覆結構必須包含：
          1. 教練評語：以口語化的方式給予鼓勵與肢體建議（這部分會轉為語音）。
          2. 潤稿建議：請在回覆中包含「優化版本：」這一組關鍵字，接著提供該段話的「戰略升級版」文字。
          
          潤稿準則：
          - 去除贅字（例如：那個、然後、其實）。
          - 強化動詞。
          - 對焦候選人 DNA：${dna.personality}。
          - 置入核心標語：${dna.slogan}。`
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      setConnecting(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) { sessionRef.current.close(); sessionRef.current = null; }
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    setIsActive(false);
    setIsFullScreen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-[#1A1A1A]">
      {/* 全螢幕模式 Overlay */}
      {isFullScreen && (
        <div className="fixed inset-0 z-[999] bg-black animate-in fade-in duration-500 flex flex-col items-center justify-center">
           {/* 背景視訊鏡面 */}
           <div className="absolute inset-0 opacity-80">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
           </div>

           {/* 退出與狀態按鈕 */}
           <div className="absolute top-10 right-10 flex items-center space-x-6 z-20">
              {isActive && (
                <div className="flex items-center space-x-3 bg-red-600/90 backdrop-blur-md px-6 py-3 rounded-full text-white text-xs font-black uppercase tracking-widest border border-white/20">
                   <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                   <span>錄製與訓練中</span>
                </div>
              )}
              <button 
                onClick={() => setIsFullScreen(false)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-4 rounded-full text-white transition-all border border-white/10"
              >
                <Minimize2 size={24} />
              </button>
           </div>

           {/* 讀稿機區塊 (中上) */}
           <div className="relative z-10 w-full max-w-5xl px-10 -mt-20">
              <div className="bg-black/40 backdrop-blur-2xl p-12 rounded-[56px] border border-white/10 shadow-2xl text-center">
                 <div className="flex items-center justify-center space-x-2 mb-6 text-orange-400 opacity-60">
                    <PenTool size={20} />
                    <span className="text-xs font-black uppercase tracking-[0.4em]">AI 戰略讀稿建議 (Strategic Refinement)</span>
                 </div>
                 <p className="text-4xl md:text-5xl lg:text-6xl font-black italic text-white leading-tight drop-shadow-lg">
                    {refinedScript || "待發言後，AI 將在此提供讀稿優化版..."}
                 </p>
              </div>
           </div>

           {/* 底部即時資訊 */}
           <div className="absolute bottom-10 inset-x-10 flex flex-col items-center space-y-8 z-10">
              <div className="w-full max-w-4xl bg-white/5 backdrop-blur-md p-8 rounded-[40px] border border-white/10">
                 <div className="flex items-center justify-between mb-4 opacity-50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">即時轉錄 (Live Script)</span>
                    <Activity size={16} className="text-orange-500" />
                 </div>
                 <p className="text-2xl font-bold italic text-white/90 leading-relaxed text-center">
                    {userTranscription || "請開始您的演說..."}
                 </p>
              </div>

              <div className="flex items-center space-x-8">
                 <button 
                  onClick={isActive ? stopSession : startSession}
                  className={`px-16 py-6 rounded-[32px] font-black text-2xl flex items-center space-x-4 shadow-2xl transition-all hover:scale-105 italic uppercase ${isActive ? 'bg-red-600 text-white' : 'bg-[#FF6B35] text-white'}`}
                 >
                    {isActive ? <><Square size={24} /><span>結束訓練</span></> : <><Play size={24} /><span>開始</span></>}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* 標準模式 UI */}
      <div className="flex justify-between items-center px-2">
         <h3 className="text-xl font-black italic tracking-tight uppercase flex items-center space-x-3">
           <div className="w-1.5 h-6 bg-[#FF6B35] rounded-full"></div>
           <span>戰略演講訓練室 (Speech Lab)</span>
         </h3>
         <div className="flex items-center space-x-3">
            <button onClick={() => setIsFullScreen(true)} className="p-3 bg-white rounded-full shadow-sm border border-gray-100 text-[#FF6B35] hover:scale-110 transition-all flex items-center space-x-2 px-6">
               <Maximize2 size={18} />
               <span className="text-[10px] font-black uppercase tracking-widest">沉浸全螢幕模式</span>
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[650px]">
        {/* 左側：儀態監控與即時逐字稿 */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
           <div className="glass p-10 rounded-[64px] bg-white shadow-2xl border-none flex-1 flex flex-col relative overflow-hidden">
              {/* 視訊鏡面 */}
              <div className="w-full aspect-video bg-[#0A0A0A] rounded-[48px] overflow-hidden relative shadow-inner border-4 border-white/50 group">
                 {showVideo && (isActive || isFullScreen) ? (
                   <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror transform scale-x-[-1]" />
                 ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                      <div className="p-8 rounded-full bg-white/5 border border-white/5">
                        <VideoOff size={64} className="opacity-20" />
                      </div>
                      <p className="font-black text-xs uppercase tracking-[0.4em] opacity-30">影像鏡面未啟動</p>
                   </div>
                 )}
                 <div className="absolute inset-0 border-[1px] border-white/10 pointer-events-none group-hover:opacity-100 opacity-20 transition-opacity">
                    <div className="absolute top-1/3 w-full border-t border-white/5"></div>
                    <div className="absolute top-2/3 w-full border-t border-white/5"></div>
                    <div className="absolute left-1/3 h-full border-l border-white/5"></div>
                    <div className="absolute left-2/3 h-full border-l border-white/5"></div>
                 </div>
                 {isActive && (
                    <div className="absolute bottom-8 left-8 flex items-center space-x-3 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                       <Activity size={16} className="text-orange-500 animate-pulse" />
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">同步中</span>
                    </div>
                 )}
              </div>

              {/* 即時轉錄練習區 */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 shadow-inner group">
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center space-x-2 text-gray-400">
                          <MessageSquare size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">練習逐字稿 (原稿)</span>
                       </div>
                    </div>
                    <p className="text-xl font-bold italic text-gray-800 leading-relaxed h-[120px] overflow-y-auto custom-scrollbar">
                       {userTranscription || "啟動教練模式後，AI 將即時轉錄您的字句..."}
                    </p>
                 </div>
                 
                 <div className="bg-orange-50 p-8 rounded-[40px] border border-orange-100 shadow-sm relative overflow-hidden">
                    <div className="flex items-center space-x-2 mb-4 text-[#FF6B35]">
                       <PenTool size={16} />
                       <span className="text-[10px] font-black uppercase tracking-widest">戰略升級建議 (AI 潤稿)</span>
                    </div>
                    <div className="h-[120px] overflow-y-auto custom-scrollbar">
                       {refinedScript ? (
                         <p className="text-xl font-black italic text-gray-800 leading-relaxed">
                            {refinedScript}
                         </p>
                       ) : (
                         <div className="flex flex-col items-center justify-center h-full opacity-20 italic">
                            <Sparkles size={32} className="mb-2" />
                            <p className="text-xs font-bold uppercase tracking-widest">等待您的黃金措辭</p>
                         </div>
                       )}
                    </div>
                 </div>
              </div>

              <div className="mt-10 pt-10 border-t border-gray-100 flex items-center justify-center">
                 <button 
                  onClick={isActive ? stopSession : startSession}
                  disabled={connecting}
                  className={`px-24 py-7 rounded-[40px] font-black text-2xl flex items-center space-x-4 shadow-2xl transition-all hover:scale-105 italic uppercase ${isActive ? 'bg-red-600 text-white' : 'bg-[#FF6B35] text-white'}`}
                 >
                    {isActive ? <><Square size={24} /><span>結束訓練</span></> : (connecting ? <Loader2 size={24} className="animate-spin" /> : <><Play size={24} /><span>啟動教練模式</span></>)}
                 </button>
              </div>
           </div>
        </div>

        {/* 右側：訓練成績 */}
        <div className="lg:col-span-4 flex flex-col h-full space-y-8">
           <div className="glass p-10 rounded-[64px] bg-[#1A1A1A] text-white shadow-2xl flex-1 flex flex-col border-none">
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center space-x-3 text-[#FF6B35]">
                    <Award size={28} />
                    <h3 className="text-xl font-black italic tracking-tighter uppercase">教練即時評鑑</h3>
                 </div>
                 <button onClick={() => setHistory([])} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 text-gray-400 transition-all">
                    <RotateCcw size={16} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
                 {history.length > 0 ? (
                   history.slice(-10).reverse().map((h, i) => (
                     <div key={i} className={`p-8 rounded-[40px] animate-in slide-in-from-right duration-500 ${h.role === 'user' ? 'bg-white/5 border border-white/5' : 'bg-orange-500/10 border border-orange-500/10'}`}>
                        <div className="flex items-center justify-between mb-4">
                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{h.role === 'user' ? '原稿' : '教練回應'}</span>
                        </div>
                        <p className={`font-bold italic leading-relaxed ${h.role === 'user' ? 'text-gray-400 text-sm' : 'text-white text-lg'}`}>
                          {h.text.split('優化版本：')[0]}
                        </p>
                        {h.refined && (
                          <div className="mt-6 pt-6 border-t border-white/5">
                             <div className="flex items-center space-x-2 text-blue-400 mb-3">
                                <Target size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">對位升級</span>
                             </div>
                             <p className="text-sm font-black text-gray-100 italic leading-relaxed bg-white/5 p-4 rounded-2xl">
                                「{h.refined}」
                             </p>
                          </div>
                        )}
                     </div>
                   ))
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center opacity-10 italic text-center space-y-6">
                      <ShieldCheck size={80} className="mx-auto" />
                      <div className="space-y-2">
                         <p className="font-black text-xl uppercase tracking-widest">尚無紀錄</p>
                      </div>
                   </div>
                 )}
              </div>

              <div className="mt-10 p-8 bg-white/5 rounded-[40px] border border-white/5">
                 <div className="flex items-center space-x-3 text-blue-400 mb-4">
                    <Eye size={20} />
                    <h4 className="text-xs font-black uppercase tracking-widest">儀態監測</h4>
                 </div>
                 <p className="text-xs font-bold text-gray-500 italic">全螢幕模式下可獲得更精準的對焦感，建議在寬廣處練習。</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TacticalTraining;
