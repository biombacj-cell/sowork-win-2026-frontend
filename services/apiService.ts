// API 服務層 - 與後端 API 通訊
const API_BASE_URL = 'https://3001-iqrct621yv68l8r5skz27-38027951.sg1.manus.computer/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Token 過期，清除並重新登入
        this.logout();
        throw new Error('請重新登入');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: '請求失敗' }));
        throw new Error(error.message || '請求失敗');
      }

      return await response.json();
    } catch (error) {
      console.error('API 請求錯誤:', error);
      throw error;
    }
  }

  // 認證相關
  async register(email: string, password: string, name: string) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.token = data.token;
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user_info', JSON.stringify(data.user));
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.token = data.token;
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user_info', JSON.stringify(data.user));
    return data;
  }

  async googleLogin(googleToken: string) {
    const data = await this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token: googleToken }),
    });
    this.token = data.token;
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user_info', JSON.stringify(data.user));
    return data;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
  }

  isAuthenticated() {
    return !!this.token;
  }

  // DNA 相關
  async getDNA() {
    return await this.request('/dna');
  }

  async saveDNA(dna: any) {
    return await this.request('/dna', {
      method: 'POST',
      body: JSON.stringify(dna),
    });
  }

  async deleteDNA() {
    return await this.request('/dna', {
      method: 'DELETE',
    });
  }

  // 內容生成相關
  async generateSocialContent(topic: string, platform: string) {
    return await this.request('/content/social', {
      method: 'POST',
      body: JSON.stringify({ topic, platform }),
    });
  }

  async generateImagePrompt(description: string) {
    return await this.request('/content/image-prompt', {
      method: 'POST',
      body: JSON.stringify({ description }),
    });
  }

  async generateSpeech(topic: string, duration: number) {
    return await this.request('/content/speech', {
      method: 'POST',
      body: JSON.stringify({ topic, duration }),
    });
  }

  async generateCounter(opponentClaim: string) {
    return await this.request('/content/counter', {
      method: 'POST',
      body: JSON.stringify({ opponentClaim }),
    });
  }

  async getContentHistory(contentType?: string) {
    const query = contentType ? `?contentType=${contentType}` : '';
    return await this.request(`/content/history${query}`);
  }

  // 資產相關
  async getAssets(category?: string) {
    const query = category ? `?category=${category}` : '';
    return await this.request(`/assets${query}`);
  }

  async addAsset(title: string, content: string, category: string) {
    return await this.request('/assets', {
      method: 'POST',
      body: JSON.stringify({ title, content, category }),
    });
  }

  async deleteAsset(id: string) {
    return await this.request(`/assets/${id}`, {
      method: 'DELETE',
    });
  }

  // 民調數據相關
  async getPollingData() {
    return await this.request('/data/polling');
  }

  async savePollingData(data: any) {
    return await this.request('/data/polling', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  // 社群帳號相關
  async getSocialAccounts() {
    return await this.request('/data/social');
  }

  async connectSocialAccount(platform: string, accountInfo: any) {
    return await this.request(`/data/social/${platform}`, {
      method: 'POST',
      body: JSON.stringify({ accountInfo }),
    });
  }
}

export const apiService = new ApiService();
