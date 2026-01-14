import { useState } from 'react';
import { CasinoProvider, useCasino } from './components/casino-context';
import { LandingPage } from './components/landing-page';
import { GamesLobby } from './components/games-lobby';
import { BlackjackGame } from './components/blackjack-game';
import { UserDashboard } from './components/user-dashboard';
import { RewardsSection } from './components/rewards-section';
import { ResponsibleGambling } from './components/responsible-gambling';
import { FAQSection } from './components/faq-section';
import { Button } from './components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Sparkles, Home, Gamepad2, Gift, Shield, HelpCircle, LogOut, User, Menu, X, Coins } from 'lucide-react';

type Page = 'landing' | 'dashboard' | 'games' | 'game-blackjack' | 'rewards' | 'responsible' | 'faq';

function AppContent() {
  const { user, login, logout } = useCasino();
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');

  const handleLogin = async () => {
    if (username.trim() && password.trim()) {
      try {
        setLoginError('');
        await login(username.trim(), password);
        setShowLoginDialog(false);
        setCurrentPage('dashboard');
        setUsername('');
        setPassword('');
      } catch (error: any) {
        setLoginError(error.message || 'Login failed. Please try again.');
      }
    }
  };

  const handleRegister = async () => {
    if (username.trim() && password.trim() && email.trim()) {
      try {
        setRegisterError('');
        await login(username.trim(), password, email.trim());
        setShowRegisterDialog(false);
        setCurrentPage('dashboard');
        setUsername('');
        setPassword('');
        setEmail('');
      } catch (error: any) {
        setRegisterError(error.message || 'Registration failed. Please try again.');
      }
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('landing');
    setSidebarOpen(false);
  };

  const navigateToPage = (page: Page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  const renderPage = () => {
    if (!user.isLoggedIn) {
      return (
        <LandingPage
          onLogin={() => setShowLoginDialog(true)}
          onRegister={() => setShowRegisterDialog(true)}
        />
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return (
          <UserDashboard
            onNavigateToGames={() => setCurrentPage('games')}
            onNavigateToRewards={() => setCurrentPage('rewards')}
            onSelectGame={(gameId) => setCurrentPage(`game-${gameId}` as Page)}
          />
        );
      case 'games':
        return <GamesLobby onSelectGame={(gameId) => setCurrentPage(`game-${gameId}` as Page)} />;
      case 'game-blackjack':
        return <BlackjackGame onBack={() => setCurrentPage('games')} />;
      case 'rewards':
        return <RewardsSection />;
      case 'responsible':
        return <ResponsibleGambling />;
      case 'faq':
        return <FAQSection />;
      default:
        return (
          <UserDashboard
            onNavigateToGames={() => setCurrentPage('games')}
            onNavigateToRewards={() => setCurrentPage('rewards')}
            onSelectGame={(gameId) => setCurrentPage(`game-${gameId}` as Page)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <nav className="border-b border-[#6b46ff]/30 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => navigateToPage(user.isLoggedIn ? 'dashboard' : 'landing')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Sparkles className="w-8 h-8 text-[#6b46ff]" />
              <span className="text-xl text-white">Placebo Casino</span>
            </button>

            {/* Desktop Navigation */}
            {user.isLoggedIn && (
              <>
                <div className="hidden md:flex items-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentPage('dashboard')}
                    className={`${currentPage === 'dashboard' ? 'text-[#6b46ff]' : 'text-gray-400'} hover:text-[#6b46ff]`}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentPage('games')}
                    className={`${currentPage === 'games' || currentPage.startsWith('game-') ? 'text-[#6b46ff]' : 'text-gray-400'} hover:text-[#6b46ff]`}
                  >
                    <Gamepad2 className="w-4 h-4 mr-2" />
                    Games
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentPage('rewards')}
                    className={`${currentPage === 'rewards' ? 'text-[#6b46ff]' : 'text-gray-400'} hover:text-[#6b46ff]`}
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Rewards
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentPage('responsible')}
                    className={`${currentPage === 'responsible' ? 'text-[#6b46ff]' : 'text-gray-400'} hover:text-[#6b46ff]`}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Responsible Gambling
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentPage('faq')}
                    className={`${currentPage === 'faq' ? 'text-[#6b46ff]' : 'text-gray-400'} hover:text-[#6b46ff]`}
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    FAQ
                  </Button>
                </div>

                <div className="hidden md:flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-lg">
                    <Coins className="w-4 h-4 text-[#00ff88]" />
                    <span className="text-white font-medium">{user.points}</span>
                    <span className="text-gray-400 text-sm">pts</span>
                  </div>
                  <div className="flex items-center gap-2 text-white px-3 py-2 bg-secondary/50 rounded-lg">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{user.name}</span>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="border-[#ff2b9e]/30 hover:border-[#ff2b9e] hover:text-[#ff2b9e]"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  className="md:hidden text-white"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </Button>
              </>
            )}

            {!user.isLoggedIn && (
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setShowLoginDialog(true)}
                  variant="outline"
                  className="h-11 border-[#6b46ff]/40 hover:border-[#6b46ff] hover:bg-[#6b46ff]/10 transition-all"
                >
                  Login
                </Button>
                <Button
                  onClick={() => setShowRegisterDialog(true)}
                  className="h-11 bg-gradient-to-r from-[#6b46ff] to-[#ff2b9e] hover:from-[#5a38e6] hover:to-[#e6278f] text-white shadow-lg shadow-[#ff2b9e]/30 hover:shadow-xl hover:shadow-[#ff2b9e]/50 hover:-translate-y-0.5 transition-all"
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sidebar */}
        {user.isLoggedIn && sidebarOpen && (
          <div className="md:hidden border-t border-[#6b46ff]/30 bg-card">
            <div className="px-4 py-4 space-y-2">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#6b46ff]/30">
                <div className="flex items-center gap-2 text-white">
                  <User className="w-4 h-4" />
                  <span>{user.name}</span>
                </div>
                <div className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-lg">
                  <Coins className="w-4 h-4 text-[#00ff88]" />
                  <span className="text-white">{user.points}</span>
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={() => navigateToPage('dashboard')}
                className="w-full justify-start text-gray-400 hover:text-[#6b46ff]"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigateToPage('games')}
                className="w-full justify-start text-gray-400 hover:text-[#6b46ff]"
              >
                <Gamepad2 className="w-4 h-4 mr-2" />
                Games
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigateToPage('rewards')}
                className="w-full justify-start text-gray-400 hover:text-[#6b46ff]"
              >
                <Gift className="w-4 h-4 mr-2" />
                Rewards
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigateToPage('responsible')}
                className="w-full justify-start text-gray-400 hover:text-[#6b46ff]"
              >
                <Shield className="w-4 h-4 mr-2" />
                Responsible Gambling
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigateToPage('faq')}
                className="w-full justify-start text-gray-400 hover:text-[#6b46ff]"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                FAQ
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full justify-start border-[#ff2b9e]/30 hover:border-[#ff2b9e] hover:text-[#ff2b9e] mt-4"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>{renderPage()}</main>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={(open) => {
        setShowLoginDialog(open);
        if (!open) {
          setLoginError('');
        }
      }}>
        <DialogContent className="bg-card border-[#6b46ff]/30">
          <DialogHeader>
            <DialogTitle className="text-white">Welcome Back!</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter your credentials to continue playing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="login-username" className="text-white">Username</Label>
              <Input
                id="login-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="bg-secondary border-[#6b46ff]/30 focus:border-[#6b46ff] text-white"
              />
            </div>
            <div>
              <Label htmlFor="login-password" className="text-white">Password</Label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter your password"
                className="bg-secondary border-[#6b46ff]/30 focus:border-[#6b46ff] text-white"
              />
            </div>
            {loginError && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{loginError}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowLoginDialog(false);
                setPassword('');
              }}
              className="border-[#6b46ff]/30 hover:border-[#6b46ff]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogin}
              disabled={!username.trim() || !password.trim()}
              className="bg-[#6b46ff] hover:bg-[#5a38e6] text-white"
            >
              Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={(open) => {
        setShowRegisterDialog(open);
        if (!open) {
          setRegisterError('');
        }
      }}>
        <DialogContent className="bg-card border-[#6b46ff]/30">
          <DialogHeader>
            <DialogTitle className="text-white">Join Placebo Casino!</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create your account and get 1,000 free points to start playing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="register-username" className="text-white">Choose a Username</Label>
              <Input
                id="register-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter a username"
                className="bg-secondary border-[#6b46ff]/30 focus:border-[#6b46ff] text-white"
              />
            </div>
            <div>
              <Label htmlFor="register-email" className="text-white">Email Address</Label>
              <Input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-secondary border-[#6b46ff]/30 focus:border-[#6b46ff] text-white"
              />
            </div>
            <div>
              <Label htmlFor="register-password" className="text-white">Create a Password</Label>
              <Input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                placeholder="At least 6 characters"
                className="bg-secondary border-[#6b46ff]/30 focus:border-[#6b46ff] text-white"
              />
            </div>
            
            <div className="bg-gradient-to-r from-[#6b46ff]/20 to-[#ff2b9e]/20 border border-[#6b46ff]/30 p-4 rounded-lg">
              <p className="text-white text-sm">
                🎉 Welcome Bonus: Get <span className="text-[#00ff88]">1,000 free points</span> instantly!
              </p>
            </div>
            {registerError && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{registerError}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRegisterDialog(false);
                setPassword('');
              }}
              className="border-[#6b46ff]/30 hover:border-[#6b46ff]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRegister}
              disabled={!username.trim() || password.length < 6 || !email.trim()}
              className="bg-gradient-to-r from-[#6b46ff] to-[#ff2b9e] hover:from-[#5a38e6] hover:to-[#e6278f] text-white"
            >
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function App() {
  return (
    <CasinoProvider>
      <AppContent />
    </CasinoProvider>
  );
}