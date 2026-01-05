
import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Copy, Search, HelpCircle } from 'lucide-react';
import { auditCompliance } from '../services/geminiService';

const Compliance: React.FC = () => {
  const [content, setContent] = useState('');
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAudit = async () => {
    if (!content) return;
    setLoading(true);
    try {
      const res = await auditCompliance(content);
      setAudit(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <header>
        <h1 className="text-4xl font-extrabold text-[#1A1A1A] tracking-tight">選罷法稽核</h1>
        <p className="text-gray-500 mt-2 font-medium">法律風險的自動守門員，偵測所有敏感語句並提供安全修改建議。</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Content input */}
        <div className="glass p-8 rounded-strategy flex flex-col h-[600px]">
          <div className="flex items-center space-x-2 mb-4">
            <Search size={20} className="text-[#FF6B35]" />
            <h2 className="text-xl font-bold">待審核文案</h2>
          </div>
          <textarea 
            placeholder="貼上你的競選文案、宣傳單文字或是演講草稿..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 w-full bg-white/50 rounded-3xl p-8 outline-none font-medium border border-gray-100 focus:border-[#FF6B35] transition-all resize-none"
          />
          <button 
            onClick={handleAudit}
            disabled={loading || !content}
            className="mt-6 bg-[#1A1A1A] text-white py-6 rounded-strategy font-black flex items-center justify-center space-x-3 hover:bg-[#FF6B35] transition-all disabled:opacity-50"
          >
            {loading ? <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent"></div> : <><span>啟動法律掃描</span></>}
          </button>
        </div>

        {/* Right: Audit results */}
        <div className="space-y-6">
          {audit ? (
            <>
              <div className={`glass p-8 rounded-strategy ${audit.riskLevel === '高' ? 'border-red-500 bg-red-50/50' : 'bg-[#1A1A1A] text-white'}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold uppercase tracking-widest text-sm">風險評級</span>
                  {audit.riskLevel === '高' ? <AlertTriangle className="text-red-500" /> : <ShieldCheck className="text-green-400" />}
                </div>
                <p className={`text-5xl font-black ${audit.riskLevel === '高' ? 'text-red-600' : 'text-green-400'}`}>
                  {audit.riskLevel === '高' ? '危險' : '安全'}
                </p>
                <p className="mt-4 font-medium opacity-80">
                  {audit.riskLevel === '高' ? '文案中包含可能違反選罷法第104條之內容，建議立即修改。' : '未發現顯著法律風險，符合當前規範。'}
                </p>
              </div>

              <div className="glass p-8 rounded-strategy">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <CheckCircle2 size={18} className="mr-2 text-green-500" />
                  法律安全修改版
                </h3>
                <div className="bg-green-50/50 p-6 rounded-3xl border border-green-100 font-medium text-green-800 leading-relaxed italic">
                  "{audit.safeVersion}"
                </div>
                <button className="mt-4 w-full py-4 bg-white border border-gray-200 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-gray-50 transition-all">
                  <Copy size={16} />
                  <span>應用此修改版本</span>
                </button>
              </div>

              <div className="glass p-8 rounded-strategy">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <HelpCircle size={18} className="mr-2 text-[#FF6B35]" />
                  敏感語句提示
                </h3>
                <div className="space-y-2">
                  {audit.issues?.map((issue: string, i: number) => (
                    <div key={i} className="flex items-start space-x-2 text-sm text-gray-600 bg-white/50 p-3 rounded-xl border border-gray-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5"></div>
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="glass h-full flex flex-col items-center justify-center text-center p-12 opacity-30">
              <ShieldCheck size={80} className="mb-6" />
              <p className="font-bold text-xl">等待稽核任務</p>
              <p className="mt-2">所有產出的內容都應經過稽核以確保法律合規性。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Compliance;
