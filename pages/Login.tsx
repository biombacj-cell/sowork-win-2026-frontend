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
  ExternalLink,
  Mail,
  Key
} from 'lucide-react';
import { apiService } from '../services/apiService';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const interval = setInterval(() => setPulse(!pulse), 3000);
    return () => clearInterval(interval);
  }, [pulse]);

  const handleQuickEntry = async () => {
    setLoading(true);
    try {
      // 快速進入（使用 LocalStorage）
      const hasKey = await (window as any).aistudio?.hasSelectedApiKey?.();
      if (!hasKey && (window as any).aistudio?.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
      }
      onLogin();
    } catch (error) {
      console.error("進入指揮中心失敗", error);
      onLogin(); 
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await apiService.register(email, password, name);
      } else {
        await apiService.login(email, password);
      }
      onLogin();
    } catch (err: any) {
      setError(err.message || '登入失敗，請檢查您的帳號密碼');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center overflow-hidden font-['Noto_Sans_TC']">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Logo */}
      <div className="relative z-10 mb-8 flex items-center gap-3">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/30">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            SOWORK <span className="text-orange-500">WIN 2026</span>
          </h1>
          <p className="text-sm text-gray-400 tracking-wider">STRATEGIC AI COMMAND SYSTEM</p>
        </div>
      </div>

      {/* 主標語 */}
      <div className="relative z-10 text-center mb-12 max-w-3xl px-6">
        <h2 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
          數據定策，<span className="text-orange-500">全線對焦</span>。
        </h2>
        <p className="text-lg text-gray-300 leading-relaxed">
          2026 台灣地方選舉專用 — 整合 Gemini 3 全球最強戰略演算模型，從品牌
          定位到攻防文案，為您的選戰插上 AI 的翅膀。
        </p>
      </div>

      {/* 功能特色 */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl px-6">
        {[
          { icon: Target, label: '重度定位', color: 'orange' },
          { icon: BarChart3, label: '民調洞察', color: 'blue' },
          { icon: ShieldCheck, label: '法規檢核', color: 'green' },
          { icon: Sparkles, label: '全域文案', color: 'purple' }
        ].map((feature, i) => (
          <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
            <feature.icon className={`w-8 h-8 text-${feature.color}-500 mb-2`} />
            <p className="text-white font-semibold text-sm">{feature.label}</p>
          </div>
        ))}
      </div>

      {/* 登入區域 */}
      {!showAuth ? (
        <div className="relative z-10 flex flex-col gap-4">
          <button
            onClick={handleQuickEntry}
            disabled={loading}
            className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
          >
            <Lock className="w-5 h-5" />
            {loading ? '啟動中...' : '快速進入（本地模式）'}
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => setShowAuth(true)}
            className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
          >
            <Mail className="w-5 h-5" />
            雲端登入（資料同步）
          </button>
        </div>
      ) : (
        <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            {isRegister ? '註冊帳號' : '登入系統'}
          </h3>

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">姓名</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  placeholder="請輸入您的姓名"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">電子郵件</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">密碼</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50"
            >
              {loading ? '處理中...' : (isRegister ? '註冊' : '登入')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-orange-400 hover:text-orange-300 text-sm"
            >
              {isRegister ? '已有帳號？立即登入' : '還沒有帳號？立即註冊'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAuth(false)}
              className="text-gray-400 hover:text-gray-300 text-sm"
            >
              ← 返回
            </button>
          </div>
        </div>
      )}

      {/* 底部資訊 */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          <span>SECURE CONNECTION</span>
        </div>
        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
        <div className="flex items-center gap-1">
          <Globe className="w-4 h-4 text-blue-500" />
          <span>TAIWAN ELECTION CLUSTER</span>
        </div>
      </div>

      {/* Google Cloud 說明 */}
      <a 
        href="https://console.cloud.google.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="absolute bottom-20 right-8 flex items-center gap-2 text-xs text-gray-600 hover:text-gray-400 transition-colors"
      >
        <span>GOOGLE CLOUD 計費與專案說明</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
};

export default Login;
