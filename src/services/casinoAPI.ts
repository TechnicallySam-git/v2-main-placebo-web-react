// API service for casino operations
const API_BASE_URL = 'https://15k56cprl1.execute-api.eu-north-1.amazonaws.com/prod/api';

// Token management
const TOKEN_KEY = 'placebo-casino-jwt-token';
const USER_ID_KEY = 'placebo-casino-user-id';
const USERNAME_KEY = 'placebo-casino-username';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function getUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY);
}

function setUserId(userId: string): void {
  localStorage.setItem(USER_ID_KEY, userId);
}

function removeUserId(): void {
  localStorage.removeItem(USER_ID_KEY);
}

function getUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY);
}

function setUsername(username: string): void {
  localStorage.setItem(USERNAME_KEY, username);
}

function removeUsername(): void {
  localStorage.removeItem(USERNAME_KEY);
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
    id: string;
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

function looksLikeUUID(str: string | null | undefined): boolean {
  if (!str) return false;
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);
}

function _parseApiError(resp: Response, body?: any): string {
  // Prefer structured error message from body, fallback to status text
  const msg = (body && (body.error || body.message)) || resp.statusText || 'Unknown API error';
  // Map permission errors to a clearer message
  const lower = String(msg).toLowerCase();
  if (lower.includes('permission denied') || lower.includes('42501') || lower.includes('service role')) {
    return 'Server misconfiguration: backend missing SUPABASE_SERVICE_ROLE_KEY or lacks write permissions';
  }
  return msg;
}

export const casinoAPI = {
  async register(username: string, email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }
      const data = await response.json();
      
      // Store JWT token, user_id, and username
      if (data.access_token) {
        setToken(data.access_token);
      }
      if (data.user?.id) {
        setUserId(data.user.id);
      }
      if (data.user?.name) {
        setUsername(data.user.name);
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }
      const data = await response.json();
      
      // Store JWT token, user_id, and username
      if (data.access_token) {
        setToken(data.access_token);
      }
      if (data.user?.id) {
        setUserId(data.user.id);
      }
      if (data.user?.name) {
        setUsername(data.user.name);
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
      removeUserId();
      removeUsername();
    }
  },

  async getUser(): Promise<User> {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('Not logged in');
      }

      const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
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

  async updatePoints(pointsChange: number, roundId: string): Promise<{ success: boolean; points: number }> {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('Not logged in');
      }

      const response = await fetch(`${API_BASE_URL}/user/${userId}/points`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          round_id: roundId,
          points_change: pointsChange
        }),
      });
      
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(_parseApiError(response, errorBody) || 'Failed to update points');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update points error:', error);
      throw error;
    }
  },

  async createGameRound(gameId: string, pointsUsed: number, result: 'win' | 'loss' | 'push' | 'blackjack', pointsChange: number, roundData?: any): Promise<{ round_id: string; new_balance: number }> {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('Not logged in');
      }

      // Resolve non-UUID game identifiers by fetching /games and matching by name/type.
      let resolvedGameId: string | null = gameId;
      if (gameId && !looksLikeUUID(gameId)) {
        try {
          const resp = await fetch(`${API_BASE_URL}/games`);
          if (resp.ok) {
            const gameResp = await resp.json();
            const found = (gameResp.games || []).find((g: any) =>
              (g.game_name || '').toLowerCase() === gameId.toLowerCase() ||
              (g.game_type || '').toLowerCase() === gameId.toLowerCase()
            );
            resolvedGameId = found ? found.game_id : null;
          } else {
            // if /games fails, avoid sending the raw string to the server
            const errBody = await resp.json().catch(() => null);
            throw new Error(_parseApiError(resp, errBody));
          }
        } catch (err) {
          // don't block the caller with internal lookup failures — send null and let backend validate
          console.warn('Game lookup failed, sending null game_id to backend:', err);
          resolvedGameId = null;
        }
      }

      const response = await fetch(`${API_BASE_URL}/game/round`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          user_id: userId,
          // send resolvedGameId (UUID) or null to avoid invalid uuid syntax errors
          game_id: resolvedGameId,
          points_used: pointsUsed,
          result: result,
          points_change: pointsChange,
          round_data: roundData || {}
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(_parseApiError(response, errorBody) || 'Failed to create game round');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Create game round error:', error);
      throw error;
    }
  },

  async getGameHistory(limit: number = 50, offset: number = 0): Promise<any[]> {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('Not logged in');
      }

      const response = await fetch(`${API_BASE_URL}/user/${userId}/history?limit=${limit}&offset=${offset}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(_parseApiError(response, errorBody) || 'Failed to fetch history');
      }
      const data = await response.json();
      return data.gameHistory || [];
    } catch (error) {
      console.error('Get history error:', error);
      throw error;
    }
  },

  async getUsers(limit: number = 100): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users?limit=${limit}`);
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(_parseApiError(response, errorBody) || 'Failed to fetch users');
      }
      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  async getStats(): Promise<UserStats> {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('Not logged in');
      }

      const response = await fetch(`${API_BASE_URL}/user/${userId}/stats`);
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(_parseApiError(response, errorBody) || 'Failed to fetch stats');
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
        const errorBody = await response.json().catch(() => null);
        throw new Error(_parseApiError(response, errorBody) || 'Failed to generate reward code');
      }
      const data = await response.json();
      return { code: data.code, points: data.points };
    } catch (error) {
      console.error('Generate reward error:', error);
      throw error;
    }
  },

  async redeemRewardCode(code: string): Promise<{ pointsAdded: number; newBalance: number; message: string }> {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('Not logged in');
      }

      const response = await fetch(`${API_BASE_URL}/rewards/redeem`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_id: userId, code: code.toUpperCase() }),
      });
      
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(_parseApiError(response, errorBody) || 'Failed to redeem reward code');
      }
      const data = await response.json();
      return { pointsAdded: data.pointsAdded, newBalance: data.newBalance, message: data.message };
    } catch (error) {
      console.error('Redeem reward error:', error);
      throw error;
    }
  },

  async getGames(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/games`);
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(_parseApiError(response, errorBody) || 'Failed to fetch games');
      }
      const data = await response.json();
      return data.games || [];
    } catch (error) {
      console.error('Get games error:', error);
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

  getStoredUserId(): string | null {
    return getUserId();
  },

  getStoredUsername(): string | null {
    return getUsername();
  },

  clearToken(): void {
    removeToken();
    removeUserId();
    removeUsername();
  },
};