
import { BrandDNA, PartyBriefing, Asset } from "../types";
import { MOCK_DNA } from "../constants";

const DNA_KEY = 'sowork_win_dna';
const BRIEFING_KEY = 'sowork_win_briefing';
const ASSETS_KEY = 'sowork_win_assets';
const POLLING_KEY = 'sowork_win_polling';
const INTEL_KEY = 'sowork_win_intel';
const TASKS_KEY = 'sowork_win_tasks';
const SOCIAL_KEY = 'sowork_win_social_accounts';

export const dbService = {
  getDNA: (): BrandDNA & { visualDNA?: string } => {
    const saved = localStorage.getItem(DNA_KEY);
    return saved ? JSON.parse(saved) : MOCK_DNA;
  },

  saveDNA: (dna: BrandDNA & { visualDNA?: string }) => {
    const data = { ...dna, lastUpdated: new Date().toLocaleString() };
    localStorage.setItem(DNA_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('dnaUpdated'));
    return data;
  },

  // ... 其餘保持不變
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

  getPollingData: (): any | null => {
    const saved = localStorage.getItem(POLLING_KEY);
    return saved ? JSON.parse(saved) : null;
  },

  savePollingData: (data: any) => {
    const payload = { ...data, lastUpdated: new Date().toLocaleString() };
    localStorage.setItem(POLLING_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('dataSynced', { detail: { type: '民調數據' } }));
    return payload;
  },

  getTasks: () => JSON.parse(localStorage.getItem(TASKS_KEY) || '{}'),
  setTask: (id: string, status: 'processing' | 'completed', result?: any) => {
    const tasks = dbService.getTasks();
    tasks[id] = { status, result, timestamp: Date.now() };
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    if (status === 'completed') {
      window.dispatchEvent(new CustomEvent('dataSynced', { detail: { type: `分析任務：${id}` } }));
    }
  },

  getSocialAccounts: () => JSON.parse(localStorage.getItem(SOCIAL_KEY) || '{"fb": false, "instagram": false, "threads": false, "line": false, "google": false, "googleInfo": null, "lastSync": null}'),
  
  saveGoogleAuth: (info: { email: string, name: string, picture?: string }) => {
    const accounts = dbService.getSocialAccounts();
    accounts.google = true;
    accounts.googleInfo = info;
    accounts.lastSync = new Date().toLocaleString();
    localStorage.setItem(SOCIAL_KEY, JSON.stringify(accounts));
    window.dispatchEvent(new Event('socialUpdated'));
    return accounts;
  },

  toggleSocial: (platform: string) => {
    const accounts = dbService.getSocialAccounts();
    accounts[platform] = !accounts[platform];
    if (!accounts[platform] && platform === 'google') {
        accounts.googleInfo = null;
    }
    if (accounts[platform]) accounts.lastSync = new Date().toLocaleString();
    localStorage.setItem(SOCIAL_KEY, JSON.stringify(accounts));
    window.dispatchEvent(new Event('socialUpdated'));
    return accounts;
  },

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

  getAssets: (): Asset[] => {
    const saved = localStorage.getItem(ASSETS_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  addAsset: (title: string, content: string, category: 'inspiration' | 'speech' | 'strategy' = 'strategy') => {
    const assets = dbService.getAssets();
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
