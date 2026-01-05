
import React from 'react';
import { 
  Sword, 
  PenTool, 
  ShieldCheck, 
  Fingerprint, 
  Vault,
  Zap,
  Target,
  BarChart3,
  Compass,
  Settings,
  User,
  Cloud,
  Mic2
} from 'lucide-react';
import { BrandDNA } from './types';

export const COLORS = {
  strategyOrange: '#FF6B35',
  decisionBlack: '#1A1A1A',
  bgRiceGrey: '#F4F2EE',
};

export const POLITICAL_PARTIES = [
  '中國國民黨 (KMT)',
  '民主進步黨 (DPP)',
  '台灣民眾黨 (TPP)',
  '時代力量 (NPP)',
  '台灣基進',
  '親民黨',
  '新黨',
  '綠黨',
  '無黨籍',
  '其他政黨'
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: '今日戰情', icon: <Zap size={20} /> },
  { id: 'polls', label: '民調數據', icon: <BarChart3 size={20} /> },
  { id: 'training', label: '戰術演練', icon: <Mic2 size={20} /> },
  { id: 'polling', label: '選區戰略', icon: <Compass size={20} /> },
  { id: 'warroom', label: '攻防決策', icon: <Sword size={20} /> },
  { id: 'content', label: '戰略文宣', icon: <PenTool size={20} /> },
];

export const FOOTER_ITEMS = [
  { id: 'dna', label: '勝選戰略 DNA', icon: <Fingerprint size={20} /> },
  { id: 'vault', label: '戰略金庫', icon: <Vault size={20} /> },
  { id: 'account', label: '個人帳號', icon: <User size={20} /> },
];

export const TAIWAN_REGIONS = {
  '北部': ['台北市', '新北市', '基隆市', '桃園市', '新竹市', '新竹縣', '宜蘭縣'],
  '中部': ['台中市', '苗栗縣', '彰化縣', '南投縣', '雲林縣'],
  '南部': ['高雄市', '台南市', '嘉義市', '嘉義縣', '屏東縣'],
  '東部及離島': ['花蓮縣', '台東縣', '澎湖縣', '金門縣', '連江縣']
};

// 2026 地方選舉選區 (以議員選區與行政區劃為準)
export const CITY_DISTRICTS: Record<string, string[]> = {
  '台北市': ['第一選區 (士林、北投)', '第二選區 (內湖、南港)', '第三選區 (松山、信義)', '第四選區 (中山、大同)', '第五選區 (中正、萬華)', '第六選區 (大安)', '第七選區 (文山)'],
  '新北市': ['第一選區 (淡水、八里等)', '第二選區 (五股、泰山等)', '第三選區 (新莊)', '第四選區 (蘆洲、三重)', '第五選區 (板橋)', '第六選區 (中和)', '第七選區 (永和)', '第八選區 (土城、樹林等)', '第九選區 (新店、深坑等)', '第十選區 (汐止、金山等)'],
  '桃園市': ['第一選區 (桃園區)', '第二選區 (龜山區)', '第三選區 (八德區)', '第四選區 (蘆竹區)', '第五選區 (大園區)', '第六選區 (大溪、復興)', '第七選區 (中壢區)', '第八選區 (平鎮區)', '第九選區 (龍潭區)', '第十選區 (楊梅區)'],
  '台中市': ['第一選區 (大甲、大安等)', '第二選區 (清水、沙鹿等)', '第三選區 (烏日、大肚、龍井)', '第四選區 (后里、豐原)', '第五選區 (神岡、大雅等)', '第六選區 (西屯區)', '第七選區 (南屯區)', '第八選區 (北屯區)', '第九選區 (北區)', '第十選區 (中、西區)', '第十一選區 (東、南區)', '第十二選區 (太平區)', '第十三選區 (大里、霧峰)'],
  '台南市': ['第一選區 (後壁、白河等)', '第二選區 (佳里、七股等)', '第三選區 (下營、六甲等)', '第四選區 (板橋、新市等)', '第五選區 (善化、安定等)', '第六選區 (安南區)', '第七選區 (永康區)', '第八選區 (北、中西區)', '第九選區 (安平、南區)', '第十選區 (東區)', '第十一選區 (仁德、歸仁等)'],
  '高雄市': ['第一選區 (旗美等)', '第二選區 (茄萣等)', '第三選區 (岡山等)', '第四選區 (楠梓、左營)', '第五選區 (仁武、大社等)', '第六選區 (鼓山、鹽埕等)', '第七選區 (三民區)', '第八選區 (前金、自強等)', '第九選區 (鳳山區)', '第十選區 (前鎮、小港)', '第十一選區 (大寮、林園)'],
  '基隆市': ['第一選區 (中正)', '第二選區 (信義)', '第三選區 (仁愛)', '第四選區 (中山)', '第五選區 (安樂)', '第六選區 (暖暖)', '第七選區 (七堵)'],
  '宜蘭縣': ['第一選區 (宜蘭市)', '第二選區 (羅東鎮)', '第三選區 (蘇澳鎮)', '第四選區 (員山鄉)', '第五選區 (壯圍鄉)', '第六選區 (礁溪鄉)'],
  // 僅列出主要代表性區域，實際應用可完整擴充
};

export const ELECTION_LEVELS = [
  '直轄市長',
  '縣市長',
  '直轄市議員',
  '縣市議員',
  '鄉鎮市長',
  '鄉鎮市民代表',
  '村里長'
];

export const MOCK_DNA: BrandDNA = {
  candidateName: '吳瓊華',
  party: '中國國民黨 (KMT)',
  personality: '溫柔、強韌、專業',
  competitiveEdge: '深耕烏日大肚龍井，長期關注教育、空汙與地方交通',
  targetVoters: '年輕父母、在地長輩、通勤族',
  coreMessage: '守護家園，點亮烏大龍',
  slogan: '深耕巷弄，點亮家園',
  district: '台中市 第三選區 (烏日、大肚、龍井)',
  electionLevel: '直轄市議員',
  strategicTriangle: {
    voterPainPoints: '烏日高體特區新校舍需求、中火空污改善、大肚龍井交通瓶頸',
    competitorWeakness: '對手忽略微觀民生，過度糾結於中央政治意識形態',
    candidateStrengths: '叫得動市府資源，具備跨選區協調大型建設的經歷'
  },
  lastUpdated: '2024/05/20 14:00:00'
};

export const MOCK_SCHEDULE = [
  { id: '1', time: '09:00', title: '烏日新校舍預定地現勘', location: '烏日高體特區', type: 'visit', description: '針對年輕父母關心的入學問題進行進度報告。' },
  { id: '2', time: '14:30', title: '大肚廟口政見說明會', location: '大肚萬興宮', type: 'speech', description: '宣講空污改善成效與未來監控計畫。' },
];
