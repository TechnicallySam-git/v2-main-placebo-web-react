// API service for casino operations
const API_BASE_URL = (import.meta as any).env.DEV ? 'https://15k56cprl1.execute-api.eu-north-1.amazonaws.com/prod/api' : '/api/';
// Token management
const TOKEN_KEY = 'placebo-casino-jwt-token';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

export interface LoginResponse {
  success: boolean;
  user: {
    id?: string;
    name: string;
    points: number;
    totalPoints?: number;
    isLoggedIn: boolean;
    isFirstLogin: boolean;
    gameHistory?: any[];
    sessionStats?: {
      gamesPlayed: number;
      wins: number;
      losses: number;
      totalPointsWon: number;
      totalPointsLost: number;
    };
  };
  isFirstLogin: boolean;
  access_token: string;
}

export interface User {
  name: string;
  points: number;
  totalPoints?: number;
  isLoggedIn: boolean;
  isFirstLogin: boolean;
  gameHistory?: any[];
  sessionStats?: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    totalPointsWon: number;
    totalPointsLost: number;
  };
}

export interface UserStats {
  username: string;
  currentPoints: number;
  totalPoints: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPointsWon: number;
  totalPointsLost: number;
  createdAt: string;
  lastLogin: string;
}

export const casinoAPI = {
  async login(username: string, password: string, email?: string): Promise<LoginResponse> {
    try {
      const body: any = { username, password };
      if (email) {
        body.email = email;
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }
      const data = await response.json();
      
      // Store JWT token
      if (data.access_token) {
        setToken(data.access_token);
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, { 
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
    }
  },

  async getUser(username: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${username}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch user');
      }
      return response.json();
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  async updatePoints(username: string, points: number, gameName?: string, result?: 'win' | 'loss' | 'push'): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${username}/points`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          points, 
          gameName: gameName || 'Unknown',
          result: result || 'loss'
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update points');
      }
      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Update points error:', error);
      throw error;
    }
  },

  async addGameHistory(username: string, game: {
    gameName: string;
    result: 'win' | 'loss' | 'push';
    pointsChange: number;
    betAmount?: number;
    duration?: number;
  }): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${username}/history`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(game),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add game history');
      }
      const data = await response.json();
      return data.gameHistory;
    } catch (error) {
      console.error('Add history error:', error);
      throw error;
    }
  },

  async getGameHistory(username: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${username}/history?limit=${limit}&offset=${offset}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch history');
      }
      const data = await response.json();
      return data.gameHistory;
    } catch (error) {
      console.error('Get history error:', error);
      throw error;
    }
  },

  async getUsers(limit: number = 100): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users?limit=${limit}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch users');
      }
      const data = await response.json();
      return data.users;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  async getStats(username: string): Promise<UserStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${username}/stats`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch stats');
      }
      const data = await response.json();
      return data.stats;
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  },

  async generateRewardCode(points: number, uses: number = 1): Promise<{ code: string; points: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/rewards/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ points, uses }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate reward code');
      }
      const data = await response.json();
      return { code: data.code, points: data.points };
    } catch (error) {
      console.error('Generate reward error:', error);
      throw error;
    }
  },

  async redeemRewardCode(username: string, code: string): Promise<{ user: User; pointsAdded: number; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/rewards/redeem`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ username, code: code.toUpperCase() }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to redeem reward code');
      }
      const data = await response.json();
      return { user: data.user, pointsAdded: data.pointsAdded, message: data.message };
    } catch (error) {
      console.error('Redeem reward error:', error);
      throw error;
    }
  },

  async health(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  },

  getStoredToken(): string | null {
    return getToken();
  },

  clearToken(): void {
    removeToken();
  },
};
