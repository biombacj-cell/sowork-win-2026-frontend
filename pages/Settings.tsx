
import React, { useState } from 'react';
import { 
  Globe, 
  ShieldCheck, 
  Server, 
  Activity, 
  Cpu, 
  Database, 
  ExternalLink, 
  Copy, 
  Check, 
  Lock, 
  Zap,
  ChevronRight,
  Wifi,
  Cloud,
  Terminal,
  ArrowUpRight,
  Info,
  ListChecks,
  Code2,
  MousePointer2
} from 'lucide-react';

const Settings: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const domain = "win2026.com.tw";
  const gcpProjectId = "sowork-win2026-production";
  
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const deploymentSteps = [
    { 
      step: "01", 
      title: "專案關聯", 
      desc: "在 GCP Console 建立專案後，於 Firebase Console 關聯該專案。",
      icon: <Cloud size={20} />,
      link: "https://console.firebase.google.com/"
    },
    { 
      step: "02", 
      title: "CLI 工具安裝", 
      desc: "終端機輸入：npm install -g firebase-tools 並進行登入。",
      icon: <Terminal size={20} />,
      code: "firebase login"
    },
    { 
      step: "03", 
      title: "初始化與發布", 
      desc: "執行初始化後，使用 deploy 指令將內容推送到 Google 伺服器。",
      icon: <Code2 size={20} />,
      code: "firebase deploy"
    },
    { 
      step: "04", 
      title: "網域驗證", 
      desc: "在 Hosting 分頁點選「連接網域」，系統會產生一組 TXT/A 紀錄。",
      icon: <Globe size={20} />,
      link: "#"
    },
    { 
      step: "05", 
      title: "DNS 生效", 
      desc: "將紀錄填回 Domain 供應商，等待 Google 自動簽發 SSL 憑證。",
      icon: <Lock size={20} />,
      link: "#"
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 text-[#1A1A1A]">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
           <div className="bg-[#1A1A1A] p-4 rounded-3xl text-white shadow-xl"><Server size={32} /></div>
           <div>
              <h1 className="text-4xl font-black tracking-tighter italic uppercase">全球部署中心 (INFRASTRUCTURE)</h1>
              <p className="text-gray-500 mt-1 font-bold italic">透過 Google Cloud & Firebase Hosting 實現獨立網域運行</p>
           </div>
        </div>
        <div className="flex space-x-2">
           <a 
              href="https://console.cloud.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-white border border-gray-200 px-6 py-4 rounded-full font-black text-sm hover:bg-gray-50 transition-all shadow-sm"
           >
              <Cloud size={18} />
              <span>GCP Console</span>
           </a>
           <a 
              href="https://console.firebase.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-full font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
           >
              <ExternalLink size={18} />
              <span>Firebase 控制台</span>
           </a>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 左側：網域與 DNS 詳情 */}
        <div className="lg:col-span-7 space-y-8">
          <div className="glass p-12 rounded-[56px] bg-white shadow-2xl border-none space-y-10">
            <div className="flex items-center justify-between border-b border-gray-100 pb-6">
               <div className="flex items-center space-x-4">
                  <Globe size={28} className="text-blue-600" />
                  <h3 className="text-2xl font-black tracking-tight italic uppercase">獨立網域：DNS 解析設定</h3>
               </div>
               <span className="px-5 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center">
                  <Activity size={12} className="mr-2 animate-pulse" />
                  已準備好對接
               </span>
            </div>

            <div className="bg-orange-50/50 p-8 rounded-[40px] border border-orange-100 flex items-center justify-between">
               <div className="flex items-center space-x-4">
                  <div className="bg-orange-500 p-3 rounded-2xl text-white shadow-lg"><Info size={20} /></div>
                  <div>
                    <h4 className="font-black text-sm text-orange-900">為什麼使用 Firebase Hosting?</h4>
                    <p className="text-xs font-bold text-orange-700/60 mt-0.5 italic">它是最簡單讓「獨立網域」在 GCP 運行的方案，且自動提供免費 HTTPS。</p>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <div className="overflow-hidden rounded-[32px] border border-gray-100 shadow-sm">
                  <table className="w-full text-left">
                     <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                           <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">類型</th>
                           <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">記錄名 (Host)</th>
                           <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">指向位址 (Value)</th>
                           <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">複製</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        <tr>
                           <td className="px-6 py-5 font-black text-blue-600">A</td>
                           <td className="px-6 py-5 font-bold text-gray-800">@</td>
                           <td className="px-6 py-5 font-mono text-xs">199.36.158.100</td>
                           <td className="px-6 py-5"><button onClick={() => handleCopy('199.36.158.100', 'a1')} className="text-gray-300 hover:text-blue-600 transition-colors">{copied === 'a1' ? <Check size={16} /> : <Copy size={16} />}</button></td>
                        </tr>
                        <tr>
                           <td className="px-6 py-5 font-black text-blue-600">A</td>
                           <td className="px-6 py-5 font-bold text-gray-800">@</td>
                           <td className="px-6 py-5 font-mono text-xs">199.36.158.101</td>
                           <td className="px-6 py-5"><button onClick={() => handleCopy('199.36.158.101', 'a2')} className="text-gray-300 hover:text-blue-600">{copied === 'a2' ? <Check size={16} /> : <Copy size={16} />}</button></td>
                        </tr>
                        <tr>
                           <td className="px-6 py-5 font-black text-orange-500">TXT</td>
                           <td className="px-6 py-5 font-bold text-gray-800">@</td>
                           <td className="px-6 py-5 font-mono text-xs italic">firebase-verify=...</td>
                           <td className="px-6 py-5"><button onClick={() => handleCopy('firebase-verify-id', 'txt')} className="text-gray-300 hover:text-blue-600">{copied === 'txt' ? <Check size={16} /> : <Copy size={16} />}</button></td>
                        </tr>
                     </tbody>
                  </table>
               </div>
            </div>
          </div>
        </div>

        {/* 右側：部署詳細步驟指南 */}
        <div className="lg:col-span-5 space-y-8">
           <div className="glass p-10 rounded-[64px] bg-[#1A1A1A] text-white shadow-2xl h-full flex flex-col border-none">
              <div className="flex items-center space-x-3 mb-10">
                 <ListChecks size={28} className="text-orange-500" />
                 <h3 className="text-xl font-black italic tracking-tighter uppercase">部署實操手冊 (STEP-BY-STEP)</h3>
              </div>

              <div className="space-y-4 flex-1">
                 {deploymentSteps.map((s, i) => (
                    <div key={i} className="group relative bg-white/5 border border-white/10 p-6 rounded-[32px] hover:bg-white/10 transition-all cursor-default">
                       <div className="flex items-start space-x-4">
                          <div className="bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-orange-500 group-hover:scale-110 transition-transform">
                             {s.step}
                          </div>
                          <div className="flex-1">
                             <h4 className="font-black text-sm mb-1">{s.title}</h4>
                             <p className="text-[11px] font-bold text-gray-500 italic leading-relaxed">{s.desc}</p>
                             {s.code && (
                                <div className="mt-3 bg-black rounded-xl p-3 flex justify-between items-center border border-white/5">
                                   <code className="text-[10px] font-mono text-green-400">{s.code}</code>
                                   <button onClick={() => handleCopy(s.code!, `code-${i}`)} className="text-gray-600 hover:text-white"><Copy size={12} /></button>
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="mt-10 pt-10 border-t border-white/10">
                 <div className="flex items-center justify-center space-x-2 text-gray-500 mb-6">
                    <MousePointer2 size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">點擊按鈕跳轉至 Google 實作環境</span>
                 </div>
                 <button className="w-full py-6 bg-[#FF6B35] text-white rounded-[32px] font-black text-xl shadow-[0_20px_40px_-10px_rgba(255,107,53,0.4)] hover:scale-105 transition-all flex items-center justify-center space-x-3">
                    <Cloud size={20} />
                    <span>啟動 GCP 指揮部署</span>
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
