import { BrandDNA, PartyBriefing, Asset } from "../types";
import { MOCK_DNA } from "../constants";
import { apiService } from "./apiService";

const DNA_KEY = 'sowork_win_dna';
const BRIEFING_KEY = 'sowork_win_briefing';
const ASSETS_KEY = 'sowork_win_assets';
const POLLING_KEY = 'sowork_win_polling';
const INTEL_KEY = 'sowork_win_intel';
const TASKS_KEY = 'sowork_win_tasks';
const SOCIAL_KEY = 'sowork_win_social_accounts';

// 判斷是否使用 API（已登入）或 LocalStorage（未登入）
const useAPI = () => apiService.isAuthenticated();

export const dbService = {
  // DNA 相關
  getDNA: async (): Promise<BrandDNA & { visualDNA?: string }> => {
    if (useAPI()) {
      try {
        const data = await apiService.getDNA();
        return data || MOCK_DNA;
      } catch (error) {
        console.error('API 取得 DNA 失敗，使用本地資料:', error);
        const saved = localStorage.getItem(DNA_KEY);
        return saved ? JSON.parse(saved) : MOCK_DNA;
      }
    }
    const saved = localStorage.getItem(DNA_KEY);
    return saved ? JSON.parse(saved) : MOCK_DNA;
  },

  saveDNA: async (dna: BrandDNA & { visualDNA?: string }) => {
    const data = { ...dna, lastUpdated: new Date().toLocaleString() };
    
    if (useAPI()) {
      try {
        const result = await apiService.saveDNA(dna);
        window.dispatchEvent(new Event('dnaUpdated'));
        return result;
      } catch (error) {
        console.error('API 儲存 DNA 失敗，使用本地儲存:', error);
      }
    }
    
    localStorage.setItem(DNA_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('dnaUpdated'));
    return data;
  },

  // 簡報相關（暫時保持本地儲存）
  getBriefing: (): PartyBriefing | null => {
    const saved = localStorage.getItem(BRIEFING_KEY);
    return saved ? JSON.parse(saved) : null;
  },

  saveBriefing: (briefing: PartyBriefing) => {
    const data = { ...briefing, lastUpdated: new Date().toLocaleString() };
    localStorage.setItem(BRIEFING_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('dataSynced', { detail: { type: '今日戰報' } }));
    return data;
  },

  // 民調數據
  getPollingData: async (): Promise<any | null> => {
    if (useAPI()) {
      try {
        const result = await apiService.getPollingData();
        return result.data || null;
      } catch (error) {
        console.error('API 取得民調數據失敗:', error);
      }
    }
    const saved = localStorage.getItem(POLLING_KEY);
    return saved ? JSON.parse(saved) : null;
  },

  savePollingData: async (data: any) => {
    const payload = { ...data, lastUpdated: new Date().toLocaleString() };
    
    if (useAPI()) {
      try {
        await apiService.savePollingData(data);
        window.dispatchEvent(new CustomEvent('dataSynced', { detail: { type: '民調數據' } }));
        return payload;
      } catch (error) {
        console.error('API 儲存民調數據失敗:', error);
      }
    }
    
    localStorage.setItem(POLLING_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('dataSynced', { detail: { type: '民調數據' } }));
    return payload;
  },

  // 任務相關（保持本地）
  getTasks: () => JSON.parse(localStorage.getItem(TASKS_KEY) || '{}'),
  
  setTask: (id: string, status: 'processing' | 'completed', result?: any) => {
    const tasks = dbService.getTasks();
    tasks[id] = { status, result, timestamp: Date.now() };
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    if (status === 'completed') {
      window.dispatchEvent(new CustomEvent('dataSynced', { detail: { type: `分析任務：${id}` } }));
    }
  },

  // 社群帳號
  getSocialAccounts: async () => {
    if (useAPI()) {
      try {
        const accounts = await apiService.getSocialAccounts();
        return accounts.reduce((acc: any, account: any) => {
          acc[account.platform] = account.isConnected;
          if (account.platform === 'google' && account.accountInfo) {
            acc.googleInfo = JSON.parse(account.accountInfo);
          }
          return acc;
        }, { fb: false, instagram: false, threads: false, line: false, google: false, googleInfo: null, lastSync: null });
      } catch (error) {
        console.error('API 取得社群帳號失敗:', error);
      }
    }
    return JSON.parse(localStorage.getItem(SOCIAL_KEY) || '{"fb": false, "instagram": false, "threads": false, "line": false, "google": false, "googleInfo": null, "lastSync": null}');
  },
  
  saveGoogleAuth: async (info: { email: string, name: string, picture?: string }) => {
    if (useAPI()) {
      try {
        await apiService.connectSocialAccount('google', info);
        window.dispatchEvent(new Event('socialUpdated'));
        return await dbService.getSocialAccounts();
      } catch (error) {
        console.error('API 儲存 Google 授權失敗:', error);
      }
    }
    
    const accounts = await dbService.getSocialAccounts();
    accounts.google = true;
    accounts.googleInfo = info;
    accounts.lastSync = new Date().toLocaleString();
    localStorage.setItem(SOCIAL_KEY, JSON.stringify(accounts));
    window.dispatchEvent(new Event('socialUpdated'));
    return accounts;
  },

  toggleSocial: async (platform: string) => {
    const accounts = await dbService.getSocialAccounts();
    accounts[platform] = !accounts[platform];
    if (!accounts[platform] && platform === 'google') {
      accounts.googleInfo = null;
    }
    if (accounts[platform]) accounts.lastSync = new Date().toLocaleString();
    localStorage.setItem(SOCIAL_KEY, JSON.stringify(accounts));
    window.dispatchEvent(new Event('socialUpdated'));
    return accounts;
  },

  // 情報相關（保持本地）
  getIntel: (): any[] | null => {
    const saved = localStorage.getItem(INTEL_KEY);
    return saved ? JSON.parse(saved) : null;
  },

  saveIntel: (list: any[]) => {
    const data = { list, lastUpdated: new Date().toLocaleString() };
    localStorage.setItem(INTEL_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('dataSynced', { detail: { type: '敵情通報' } }));
    return data;
  },

  // 資產相關
  getAssets: async (): Promise<Asset[]> => {
    if (useAPI()) {
      try {
        return await apiService.getAssets();
      } catch (error) {
        console.error('API 取得資產失敗:', error);
      }
    }
    const saved = localStorage.getItem(ASSETS_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  addAsset: async (title: string, content: string, category: 'inspiration' | 'speech' | 'strategy' = 'strategy') => {
    if (useAPI()) {
      try {
        const newAsset = await apiService.addAsset(title, content, category);
        window.dispatchEvent(new Event('assetsUpdated'));
        return newAsset;
      } catch (error) {
        console.error('API 新增資產失敗:', error);
      }
    }
    
    const assets = await dbService.getAssets();
    const newAsset: Asset = {
      id: Date.now().toString(),
      title,
      content,
      category,
      date: new Date().toLocaleDateString()
    };
    localStorage.setItem(ASSETS_KEY, JSON.stringify([newAsset, ...assets]));
    window.dispatchEvent(new Event('assetsUpdated'));
    return newAsset;
  }
};
