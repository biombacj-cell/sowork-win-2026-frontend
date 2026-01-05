
import React, { useState } from 'react';
import { 
  Cloud, 
  Terminal, 
  Globe, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Lock, 
  Server, 
  Wifi, 
  Activity, 
  Info, 
  MousePointer2, 
  Layers,
  ChevronRight,
  Command,
  AlertTriangle,
  FileWarning,
  FolderSearch,
  FileCode,
  ArrowDown,
  Monitor,
  SearchCode
} from 'lucide-react';

const DeploymentCenter: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const projectId = "2026election";
  
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const pathFixes = [
    {
      title: "可能 A：您的桌面路徑在 OneDrive 內",
      cmd: 'cd "OneDrive\\桌面\\2026election"',
      desc: "Windows 10/11 常見問題，路徑會多一層 OneDrive。"
    },
    {
      title: "可能 B：直接使用『絕對路徑』(最推薦)",
      desc: "開啟資料夾 -> 點擊上方網址列 -> 複製整串 -> 回到終端機輸入 cd + 空白 + 按右鍵貼上。",
      cmd: 'cd "C:\\Users\\YourName\\Desktop\\2026election"'
    }
  ];

  const steps = [
    {
      id: 1,
      title: "排除『找不到路徑』錯誤",
      icon: <Monitor size={20} />,
      desc: "如果您看到『系統找不到指定的路徑』，請嘗試下方指令：",
      instructions: [
        "確認您的資料夾名稱是否真的是 '2026election' (大小寫要對)。",
        "檢查您的桌面是否被 OneDrive 接管。",
        "使用引號包裹路徑，防止空格造成中斷。"
      ],
      commands: pathFixes.map(p => ({ label: p.title, cmd: p.cmd }))
    },
    {
      id: 2,
      title: "確認檔案是否存在",
      icon: <SearchCode size={20} />,
      desc: "成功進入資料夾後，輸入指令確認您是否看得到檔案：",
      instructions: [
        "如果您看到 index.html 列表，代表路徑正確。",
        "如果列表是空的，代表您進錯資料夾了。"
      ],
      commands: [
        { label: "查看檔案列表", cmd: "dir" }
      ]
    },
    {
      id: 3,
      title: "正式部署",
      icon: <Cloud size={20} />,
      desc: "萬事俱備，執行最終推送指令。",
      commands: [
        { label: "發布至 Hosting", cmd: "firebase deploy --only hosting" }
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 text-[#1A1A1A]">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
           <div className="bg-[#1A1A1A] p-4 rounded-3xl text-white shadow-xl shadow-black/10"><Cloud size={32} /></div>
           <div>
              <h1 className="text-4xl font-black tracking-tighter italic uppercase">Firebase 部署指揮部</h1>
              <p className="text-gray-500 mt-1 font-bold italic">故障排除：Windows 路徑對位中</p>
           </div>
        </div>
      </header>

      {/* 針對使用者的錯誤提示進行解說 */}
      <div className="bg-orange-50 border-2 border-orange-200 p-10 rounded-[48px] shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><AlertTriangle size={120} /></div>
         <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-3 text-orange-600">
               <AlertTriangle size={28} />
               <h3 className="text-2xl font-black italic tracking-tighter uppercase">診斷：『系統找不到指定的路徑』</h3>
            </div>
            <p className="text-orange-900 font-bold text-lg italic max-w-2xl leading-relaxed">
               這是因為 CMD 找不到 <code className="bg-orange-100 px-2 py-1 rounded">Desktop\2026election</code>。
               通常是因為您的桌面路徑實際位置是 <code className="bg-orange-100 px-2 py-1 rounded">C:\Users\User\OneDrive\桌面</code>。
            </p>
            <div className="mt-6 flex flex-col md:flex-row gap-4">
               <div className="bg-white p-8 rounded-[32px] border border-orange-100 flex-1 shadow-sm">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">終極解法：拖曳法</p>
                  <p className="text-sm font-bold text-gray-700 leading-relaxed italic">
                    1. 在終端機輸入 <code className="text-[#FF6B35]">cd</code> 然後按一個「空白鍵」。<br/>
                    2. 用滑鼠將桌面上的 <code className="text-[#FF6B35]">2026election</code> 資料夾直接「拖進」終端機黑視窗內。<br/>
                    3. 按下 Enter，這是 100% 成功的路徑對位法。
                  </p>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center space-x-3 px-4 text-blue-600">
             <Command size={20} />
             <h3 className="text-xl font-black italic tracking-tighter uppercase">修正後的操作清單</h3>
          </div>

          <div className="space-y-4">
            {steps.map((s) => (
              <div 
                key={s.id} 
                className={`glass p-8 rounded-[40px] border-2 transition-all cursor-pointer ${activeStep === s.id ? 'bg-white border-blue-500 shadow-xl' : 'bg-white/50 border-transparent opacity-60'}`}
                onClick={() => setActiveStep(s.id)}
              >
                <div className="flex items-start space-x-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black flex-shrink-0 ${activeStep === s.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                    {s.id}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-black mb-1">{s.title}</h4>
                    <p className="text-gray-500 font-bold italic mb-4">{s.desc}</p>
                    
                    {activeStep === s.id && (
                      <div className="space-y-4 animate-in slide-in-from-top duration-300">
                        {s.instructions && (
                          <div className="bg-gray-50 p-6 rounded-[24px] mb-4 border border-gray-100">
                            {s.instructions.map((inst, ii) => (
                              <p key={ii} className="text-xs font-bold text-gray-600 mb-1 flex items-center">
                                <ChevronRight size={14} className="text-blue-500 mr-1 flex-shrink-0" />
                                {inst}
                              </p>
                            ))}
                          </div>
                        )}

                        {s.commands?.map((c, ci) => (
                          <div key={ci} className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{c.label}</label>
                            <div className="bg-black rounded-[20px] p-5 flex justify-between items-center group/code border border-white/5 shadow-inner">
                              <code className="text-xs font-mono text-green-400">$ {c.cmd}</code>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleCopy(c.cmd, `c-${s.id}-${ci}`); }}
                                className="bg-white/10 p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
                              >
                                {copied === `c-${s.id}-${ci}` ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        {s.id < 3 && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveStep(s.id + 1); }}
                            className="mt-6 w-full py-4 bg-gray-100 text-gray-600 rounded-[20px] font-black text-xs hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest"
                          >
                            路徑已成功切換，下一步
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
           <div className="glass p-10 rounded-[56px] bg-[#1A1A1A] text-white shadow-2xl border-none sticky top-24">
              <div className="flex items-center space-x-3 text-orange-500 mb-8">
                <FileCode size={28} />
                <h3 className="text-xl font-black italic tracking-tighter uppercase">設定檔 (firebase.json)</h3>
              </div>
              
              <div className="bg-black/50 rounded-[32px] p-6 border border-white/10 relative">
                 <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">確保檔案位於資料夾根目錄：</p>
                 <pre className="text-[11px] font-mono text-orange-400 leading-relaxed overflow-x-auto whitespace-pre-wrap">
{`{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ]
  }
}`}
                 </pre>
                 <button 
                    onClick={() => handleCopy(`{\n  "hosting": {\n    "public": ".",\n    "ignore": [\n      "firebase.json",\n      "**/.*",\n      "**/node_modules/**"\n    ],\n    "rewrites": [\n      { "source": "**", "destination": "/index.html" }\n    ]\n  }\n}`, 'json-copy')}
                    className="absolute top-6 right-6 p-3 bg-white/5 rounded-xl hover:bg-white/20 text-white transition-all"
                 >
                    {copied === 'json-copy' ? <Check size={18} /> : <Copy size={18} />}
                 </button>
              </div>

              <div className="mt-8 p-6 bg-white/5 rounded-[32px] border border-white/5 italic">
                 <p className="text-xs text-gray-400 font-bold">
                   <Info size={14} className="inline mr-1 mb-1" />
                   如果您看見 100 萬個檔案，代表 <code className="text-white">ignore</code> 沒生效，請檢查檔案名稱是否拼錯為 <span className="text-red-400">firebase.json.txt</span> (Windows 預設會隱藏副檔名)。
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentCenter;
