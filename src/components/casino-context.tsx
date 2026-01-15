import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { casinoAPI } from '../services/casinoAPI';

interface User {
  id?: string;
  name: string;
  points: number;
  isLoggedIn: boolean;
  isFirstLogin: boolean;
}

interface GameHistory {
  id: string;
  gameName: string;
  result: 'win' | 'loss' | 'push';
  pointsChange: number;
  timestamp: Date;
}

interface CasinoContextType {
  user: User;
  login: (name: string, password?: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePoints: (points: number) => Promise<void>;
  addGameHistory: (game: Omit<GameHistory, 'id' | 'timestamp'>) => Promise<void>;
  gameHistory: GameHistory[];
  markWelcomed: () => void;
}

const CasinoContext = createContext<CasinoContextType | undefined>(undefined);

export function CasinoProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>({
    name: '',
    points: 0,
    isLoggedIn: false,
    isFirstLogin: true,
  });
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [useBackend, setUseBackend] = useState(false);

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedCurrentUser = localStorage.getItem('placebo-casino-current-user');
    
    if (savedCurrentUser) {
      const username = JSON.parse(savedCurrentUser);
      const userData = localStorage.getItem(`placebo-casino-user-${username}`);
      const userHistory = localStorage.getItem(`placebo-casino-history-${username}`);
      
      if (userData) {
        setUser(JSON.parse(userData));
        setCurrentUserName(username);
      }
      if (userHistory) {
        const history = JSON.parse(userHistory);
        setGameHistory(history.map((h: any) => ({ ...h, timestamp: new Date(h.timestamp) })));
      }
    }
  }, []);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (user.isLoggedIn && currentUserName) {
      localStorage.setItem(`placebo-casino-user-${currentUserName}`, JSON.stringify(user));
      localStorage.setItem('placebo-casino-current-user', JSON.stringify(currentUserName));
    }
  }, [user, currentUserName]);

  // Save game history to localStorage
  useEffect(() => {
    if (currentUserName) {
      localStorage.setItem(`placebo-casino-history-${currentUserName}`, JSON.stringify(gameHistory));
    }
  }, [gameHistory, currentUserName]);

  const login = async (name: string, password: string = 'default') => {
    try {
      // Try to use backend with JWT
      const response = await casinoAPI.login(name, password);
      if (response && response.success) {
        setUseBackend(true);
        const userData = response.user;
        setUser({
          id: (userData as any).id,
          name: userData.name,
          points: userData.points,
          isLoggedIn: true,
          isFirstLogin: response.isFirstLogin,
        });
        setCurrentUserName(name);
        if (userData.gameHistory) {
          setGameHistory(userData.gameHistory.map((h: any) => ({
            ...h,
            timestamp: new Date(h.timestamp),
          })));
        }
        return;
      }
    } catch (error: any) {
      console.log('Backend login failed:', error);
      throw new Error(error.message || 'Login failed');
    }

    // Fallback to localStorage
    const savedUser = localStorage.getItem(`placebo-casino-user-${name}`);
    const savedHistory = localStorage.getItem(`placebo-casino-history-${name}`);
    
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      // Validate password if user exists (basic validation)
      if (parsed.password && parsed.password !== password && password !== 'default') {
        throw new Error('Invalid password');
      }
      setUser({ ...parsed, isLoggedIn: true, isFirstLogin: false });
      setCurrentUserName(name);
      
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        setGameHistory(history.map((h: any) => ({ ...h, timestamp: new Date(h.timestamp) })));
      } else {
        setGameHistory([]);
      }
    } else {
      // New user - save password for future logins
      setUser({
        name,
        points: 1000,
        isLoggedIn: true,
        isFirstLogin: true,
      });
      setCurrentUserName(name);
      setGameHistory([]);
      // Store password in localStorage for returning user validation
      localStorage.setItem(`placebo-casino-password-${name}`, password);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await casinoAPI.register(username, email, password);
      setUser({
        id: response.user.id,
        name: response.user.name,
        points: response.user.points,
        isLoggedIn: true,
        isFirstLogin: response.isFirstLogin,
      });
      setCurrentUserName(username);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (useBackend) {
      try {
        await casinoAPI.logout();
      } catch (error) {
        console.log('Logout from backend failed');
      }
    }

    localStorage.removeItem('placebo-casino-current-user');
    
    setUser({
      name: '',
      points: 0,
      isLoggedIn: false,
      isFirstLogin: true,
    });
    setCurrentUserName('');
    setGameHistory([]);
  };

  const updatePoints = async (points: number) => {
    const newPoints = user.points + points;
    setUser(prev => ({
      ...prev,
      points: newPoints,
    }));

    // Sync with backend
    if (useBackend && user.id) {
      try {
        await casinoAPI.updatePoints(points, 'manual-update');
      } catch (error) {
        console.log('Failed to sync points with backend');
      }
    }
  };

  const addGameHistory = async (game: Omit<GameHistory, 'id' | 'timestamp'>) => {
    const newHistory: GameHistory = {
      ...game,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
    };
    setGameHistory(prev => [newHistory, ...prev].slice(0, 20));

    // Sync with backend using createGameRound
    if (useBackend && user.id) {
      try {
        await casinoAPI.createGameRound(
          game.gameName.toLowerCase(),
          Math.abs(game.pointsChange),
          game.result,
          game.pointsChange
        );
      } catch (error) {
        console.log('Failed to sync game history with backend');
      }
    }
  };

  const markWelcomed = () => {
    setUser(prev => ({
      ...prev,
      isFirstLogin: false,
    }));
  };

  return (
    <CasinoContext.Provider value={{ user, login, register, logout, updatePoints, addGameHistory, gameHistory, markWelcomed }}>
      {children}
    </CasinoContext.Provider>
  );
}

export function useCasino() {
  const context = useContext(CasinoContext);
  if (context === undefined) {
    throw new Error('useCasino must be used within a CasinoProvider');
  }
  return context;
}