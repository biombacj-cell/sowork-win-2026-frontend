
import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldCheck, 
  LogOut, 
  Facebook,
  Instagram,
  Hash,
  MessageCircle,
  Link,
  Unlink,
  Award,
  Users,
  Terminal,
  Clock,
  ChevronRight,
  Calendar,
  Mail,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { dbService } from '../services/dbService';

// 注意：在正式環境中，請將此替換為您在 Google Cloud Console 申請的真實 Client ID
// 如果沒有 Client ID，點擊時會出現 "idpiframe_initialization_failed"
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

interface AccountProps {
  onLogout: void;
}

const Account: React.FC<AccountProps> = ({ onLogout }) => {
  const [user, setUser] = useState({
    name: "吳瓊華",
    role: "台中市議員候選人",
    email: "campaign@win2026.tw",
    level: "Premium Enterprise",
    seats: "8 / 20"
  });

  const [socialAccounts, setSocialAccounts] = useState(dbService.getSocialAccounts());
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [tokenClient, setTokenClient] = useState<any>(null);

  // 初始化 Google GIS SDK
  useEffect(() => {
    const initializeGis = () => {
      // Fix: Use (window as any).google to bypass TypeScript property check
      if (typeof (window as any).google !== 'undefined') {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar.readonly',
          callback: async (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              await fetchUserProfile(tokenResponse.access_token);
            }
          },
        });
        setTokenClient(client);
      }
    };

    // 確保腳本已載入
    // Fix: Use (window as any).google to bypass TypeScript property check
    if (typeof (window as any).google === 'undefined') {
      const script = document.createElement('script');
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGis;
      document.head.appendChild(script);
    } else {
      initializeGis();
    }
  }, []);

  const fetchUserProfile = async (accessToken: string) => {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await response.json();
      
      const authInfo = {
        email: data.email,
        name: data.name,
        picture: data.picture,
        accessToken: accessToken // 供後續調用 Calendar API 使用
      };
      
      dbService.saveGoogleAuth(authInfo);
      setIsAuthenticating(false);
      alert(`歡迎，${data.name}！Google 帳號已成功串連。`);
    } catch (error) {
      console.error("無法獲取使用者資料", error);
      setIsAuthenticating(false);
    }
  };

  const handleGoogleAuth = () => {
    if (!tokenClient) {
      alert("Google SDK 尚未載入，請稍候。");
      return;
    }
    
    // 如果是 placeholder ID，給予提示
    if (GOOGLE_CLIENT_ID.includes("YOUR_GOOGLE_CLIENT_ID")) {
      alert("檢測到尚未設定真實的 GOOGLE_CLIENT_ID。\n\n系統將進入「模擬成功」模式。若要實測真實彈窗，請至 Account.tsx 修改 Client ID。");
      // 模擬邏輯維持不變，讓使用者能看見成功後的 UI
      setIsAuthenticating(true);
      setTimeout(() => {
        const mockUserInfo = {
          email: "candidate@gmail.com",
          name: "吳瓊華 (選戰專用)",
          picture: "https://images.unsplash.com/photo-1540910419391-700d7a638c44?auto=format&fit=crop&q=80&w=200"
        };
        dbService.saveGoogleAuth(mockUserInfo);
        setIsAuthenticating(false);
      }, 1000);
      return;
    }

    setIsAuthenticating(true);
    tokenClient.requestAccessToken();
  };

  const handleToggleSocial = (platform: string) => {
    if (platform === 'google' && !socialAccounts.google) {
        handleGoogleAuth();
        return;
    }
    const updated = dbService.toggleSocial(platform);
    setSocialAccounts(updated);
  };

  useEffect(() => {
    const handleUpdate = () => setSocialAccounts(dbService.getSocialAccounts());
    window.addEventListener('socialUpdated', handleUpdate);
    return () => window.removeEventListener('socialUpdated', handleUpdate);
  }, []);

  const activityLogs = [
    { action: "微調戰略 DNA", time: "10 分鐘前" },
    { action: "同步 Google 行事曆", time: socialAccounts.lastSync || "尚未同步" },
    { action: "產出 FB 感性文案", time: "昨天 14:30" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500 pb-24 text-[#1A1A1A]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
         <div className="flex items-center space-x-6">
            <div className="relative group">
               <div className="w-24 h-24 bg-gradient-to-br from-[#FF6B35] to-orange-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl overflow-hidden border-4 border-white">
                 {socialAccounts.googleInfo?.picture ? (
                     <img src={socialAccounts.googleInfo.picture} alt="Avatar" className="w-full h-full object-cover" />
                 ) : <User size={48} />}
               </div>
               <div className="absolute -bottom-1 -right-1 bg-green-500 border-4 border-[#F4F2EE] w-7 h-7 rounded-full shadow-lg"></div>
            </div>
            <div>
               <h3 className="text-3xl font-black tracking-tight italic uppercase flex items-center">
                 {socialAccounts.googleInfo?.name || user.name}
                 <Award size={24} className="text-orange-500 ml-2" />
               </h3>
               <div className="flex items-center space-x-4 mt-1">
                 <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{user.role}</p>
                 <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                 <p className="text-[#FF6B35] font-black text-xs uppercase tracking-widest">{user.level}</p>
               </div>
            </div>
         </div>
         <div className="flex space-x-4">
            <button className="px-8 py-4 bg-white border border-gray-200 text-gray-800 rounded-full font-black text-xs hover:border-[#FF6B35] transition-all shadow-sm">
              管理席位
            </button>
            <button onClick={onLogout} className="px-8 py-4 bg-red-50 text-red-600 rounded-full font-black text-xs hover:bg-red-600 hover:text-white transition-all shadow-sm">
              登出系統
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="glass p-10 rounded-[56px] bg-white shadow-2xl border-none space-y-8">
            <h3 className="text-xl font-black italic uppercase flex items-center border-b border-gray-100 pb-4">
               <Link size={20} className="mr-3 text-[#FF6B35]" />
               第三方授權中心 (Integrations)
            </h3>
            
            {/* Google 整合專區 */}
            <div className={`p-8 rounded-[40px] border transition-all space-y-6 ${socialAccounts.google ? 'bg-blue-50/50 border-blue-100' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-black text-lg">Google 戰略全整合</h4>
                    <p className="text-xs font-bold text-gray-400 italic">
                        {socialAccounts.googleInfo ? `帳號：${socialAccounts.googleInfo.email}` : "包含 Calendar、Gmail、Drive 與 Search"}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggleSocial('google')}
                  disabled={isAuthenticating}
                  className={`px-10 py-4 rounded-full font-black text-xs uppercase transition-all shadow-md flex items-center space-x-2 ${socialAccounts.google ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  {isAuthenticating ? <Loader2 size={16} className="animate-spin" /> : (socialAccounts.google ? "中斷授權" : "立即授權")}
                </button>
              </div>
              
              {socialAccounts.google && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
                  <div className="p-5 bg-white rounded-3xl border border-blue-50 flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-50 rounded-xl"><Calendar size={18} className="text-blue-600" /></div>
                      <span className="text-xs font-black">Google 行事曆</span>
                    </div>
                    <div className="w-10 h-5 bg-green-500 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div></div>
                  </div>
                  <div className="p-5 bg-white rounded-3xl border border-blue-50 flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-red-50 rounded-xl"><Mail size={18} className="text-red-500" /></div>
                      <span className="text-xs font-black">Gmail 情資偵測</span>
                    </div>
                    <div className="w-10 h-5 bg-green-500 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div></div>
                  </div>
                </div>
              )}

              {/* 指引提示 */}
              {!socialAccounts.google && (
                <div className="flex items-start space-x-2 text-[10px] text-blue-400 font-bold bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                   <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                   <p>注意：Google 授權需在 HTTPS 環境下運行，且需在 Google Cloud Console 將目前網址加入「授權的 JavaScript 來源」。</p>
                </div>
              )}
            </div>

            {/* 其他社群平台 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'fb', name: 'Facebook 粉絲專頁', icon: <Facebook className="text-[#1877F2]" />, desc: '文宣排程、情緒偵測' }, 
                { id: 'line', name: 'LINE Official', icon: <MessageCircle className="text-[#06C755]" />, desc: '選民對話、群發推播' }
              ].map((p) => (
                <div key={p.id} className="p-8 rounded-[40px] border-2 bg-gray-50 border-gray-100 flex flex-col space-y-4 group hover:border-[#FF6B35] transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">{p.icon}</div>
                    <span className="font-black text-sm block">{p.name}</span>
                  </div>
                  <button 
                    onClick={() => handleToggleSocial(p.id)} 
                    className={`w-full py-4 rounded-2xl font-black text-xs transition-all ${socialAccounts[p.id] ? 'bg-white border border-red-100 text-red-600' : 'bg-[#1A1A1A] text-white hover:bg-[#FF6B35]'}`}
                  >
                    {socialAccounts[p.id] ? "斷開串連" : "立即連結"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="glass p-10 rounded-[64px] bg-[#1A1A1A] text-white shadow-2xl flex flex-col h-fit lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center space-x-3 text-orange-400">
                    <Terminal size={24} />
                    <h3 className="text-xl font-black italic uppercase">指揮中心日誌</h3>
              </div>
              </div>
              <div className="space-y-6">
                {activityLogs.map((log, i) => (
                   <div key={i} className="flex items-start space-x-4 border-l-2 border-white/10 pl-4">
                      <div className="min-w-0 flex-1">
                         <p className="text-sm font-bold text-gray-200">{log.action}</p>
                         <div className="flex items-center space-x-2 mt-1">
                            <Clock size={10} className="text-gray-500" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase">{log.time}</span>
                         </div>
                      </div>
                      <ChevronRight size={14} className="text-gray-600 mt-1" />
                   </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
