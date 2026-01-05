
import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  ChevronRight, 
  Lock, 
  BarChart3, 
  Target, 
  Sparkles,
  Globe,
  ExternalLink
} from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setPulse(!pulse), 3000);
    return () => clearInterval(interval);
  }, [pulse]);

  const handleEntry = async () => {
    setLoading(true);
    try {
      // 依照指令：檢查 API Key 選取狀態
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }
      // 賽道條件：觸發後即視為成功，進入系統
      onLogin();
    } catch (error) {
      console.error("進入指揮中心失敗", error);
      // 若失敗，通常是因为 key 选拔被取消或出错，直接重试或显示提示
      onLogin(); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center overflow-hidden font-['Noto_Sans_TC']">
      {/* 背景裝飾：模擬數據流 */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF6B35] rounded-full filter blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full filter blur-[120px] opacity-40"></div>
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-1 opacity-10">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="border-[0.5px] border-white/20"></div>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-4xl w-full px-8 flex flex-col items-center text-center">
        {/* Logo 與 標題 */}
        <div className="mb-16 animate-in fade-in slide-in-from-top duration-1000">
          <div className="inline-flex items-center space-x-4 mb-8 bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
            <div className="w-16 h-16 bg-[#FF6B35] rounded-2xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(255,107,53,0.4)]">
              <Zap size={40} />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase leading-none">SoWork <span className="text-[#FF6B35]">Win 2026</span></h1>
              <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-[0.4em]">Strategic AI Command System</p>
            </div>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-tight drop-shadow-2xl">
            數據定策，<span className="text-gradient">全線對焦。</span>
          </h2>
          <p className="text-gray-400 mt-6 text-xl font-bold max-w-2xl mx-auto leading-relaxed">
            2026 台灣地方選舉專屬——整合 Gemini 3 全球最強戰略演算模型，從品牌定位到攻防文宣，為您的選戰插上 AI 的翅膀。
          </p>
        </div>

        {/* 功能預覽標籤 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 w-full animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
          {[
            { icon: <Target className="text-red-500" />, label: '選區定位' },
            { icon: <BarChart3 className="text-blue-500" />, label: '民調演算' },
            { icon: <ShieldCheck className="text-green-500" />, label: '法規稽核' },
            { icon: <Sparkles className="text-orange-500" />, label: '全域文宣' },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-[32px] flex flex-col items-center">
              <div className="mb-3">{item.icon}</div>
              <span className="text-white font-black text-xs uppercase tracking-widest">{item.label}</span>
            </div>
          ))}
        </div>

        {/* 啟動按鈕 */}
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
          <button 
            onClick={handleEntry}
            disabled={loading}
            className="group relative w-full py-8 bg-white text-black rounded-[40px] font-black text-2xl italic tracking-tighter overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:shadow-[#FF6B35]/30"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
            <div className="relative flex items-center justify-center space-x-4 group-hover:text-white transition-colors">
              {loading ? (
                <Loader2 className="animate-spin" size={32} />
              ) : (
                <>
                  <Lock size={24} />
                  <span>啟動戰情指揮中心</span>
                  <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </div>
          </button>
          
          <div className="mt-8 flex flex-col items-center space-y-4">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center">
              <Globe size={12} className="mr-2" />
              Secure Connection: Taiwan Election Cluster
            </p>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#FF6B35] text-[10px] font-black uppercase tracking-widest hover:underline flex items-center"
            >
              Google Cloud 計費與專案說明 <ExternalLink size={10} className="ml-1" />
            </a>
          </div>
        </div>
      </div>

      {/* 底部裝飾 */}
      <div className="absolute bottom-10 left-10 text-white/10 flex flex-col space-y-2">
         <div className="h-1 w-20 bg-white/10"></div>
         <div className="h-1 w-32 bg-white/10"></div>
         <div className="h-1 w-12 bg-white/10"></div>
      </div>
      <div className="absolute bottom-10 right-10 text-white/10 text-[10px] font-black uppercase tracking-[0.5em]">
        Version 2.0.26 / COMMAND_CENTER
      </div>
    </div>
  );
};

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

export default Login;
