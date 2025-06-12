
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Info, LogOut, Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Game from '@/components/Game';
import Leaderboard from '@/components/Leaderboard';
import InfoModal from '@/components/InfoModal';

const Index = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState('');
  const [currentView, setCurrentView] = useState('menu');
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load preferences from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedSound = localStorage.getItem('soundEnabled') !== 'false';
    const savedUser = localStorage.getItem('reflexDashUser');
    
    setDarkMode(savedDarkMode);
    setSoundEnabled(savedSound);
    
    // Apply dark mode
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }

    // Check for saved user
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
    }
    
    setLoading(false);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleSound = () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    localStorage.setItem('soundEnabled', newSoundEnabled.toString());
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      toast({
        title: "Invalid nickname",
        description: "Please enter a valid nickname",
        variant: "destructive",
      });
      return;
    }

    // Create user object and save to localStorage
    const userData = {
      uid: `user_${Date.now()}`,
      displayName: nickname.trim(),
      nickname: nickname.trim()
    };

    localStorage.setItem('reflexDashUser', JSON.stringify(userData));
    setUser(userData);
    
    toast({
      title: "Welcome!",
      description: `Good to see you, ${nickname}!`,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('reflexDashUser');
    setUser(null);
    setCurrentView('menu');
    toast({
      title: "Logged out",
      description: "See you next time!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 animate-gradient-x">
        <div className="text-white text-2xl font-bold animate-pulse">Loading Reflex Dash...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 animate-gradient-x relative overflow-hidden">
        {/* Floating emojis */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="animate-float-1 absolute top-20 left-20 text-4xl">🎉</div>
          <div className="animate-float-2 absolute top-40 right-32 text-4xl">🚀</div>
          <div className="animate-float-3 absolute bottom-32 left-32 text-4xl">💥</div>
          <div className="animate-float-1 absolute bottom-20 right-20 text-4xl">💫</div>
        </div>

        <Card className="w-full max-w-md mx-4 bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white mb-2">
              🎯 Reflex Dash
            </CardTitle>
            <p className="text-white/80">Test your reflexes in this fast-paced game!</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="nickname" className="text-white">Nickname</Label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Enter your nickname"
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold"
              >
                Start Playing
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentView === 'game') {
    return <Game user={user} onBack={() => setCurrentView('menu')} soundEnabled={soundEnabled} />;
  }

  if (currentView === 'leaderboard') {
    return <Leaderboard user={user} onBack={() => setCurrentView('menu')} />;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900' : 'bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400'} animate-gradient-x relative overflow-hidden`}>
      {/* Floating emojis */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="animate-float-1 absolute top-20 left-20 text-4xl">🎉</div>
        <div className="animate-float-2 absolute top-40 right-32 text-4xl">🚀</div>
        <div className="animate-float-3 absolute bottom-32 left-32 text-4xl">💥</div>
        <div className="animate-float-1 absolute bottom-20 right-20 text-4xl">💫</div>
      </div>

      {/* Header */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          onClick={toggleDarkMode}
          size="sm"
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        <Button
          onClick={toggleSound}
          size="sm"
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </Button>
        <Button
          onClick={() => setShowInfo(true)}
          size="sm"
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          <Info className="w-4 h-4" />
        </Button>
        <Button
          onClick={handleLogout}
          size="sm"
          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      {/* Main Menu */}
      <div className="flex items-center justify-center min-h-screen">
        <Card className={`w-full max-w-md mx-4 ${darkMode ? 'bg-black/20' : 'bg-white/10'} backdrop-blur-lg border-white/20`}>
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-white mb-4">
              🎯 Reflex Dash
            </CardTitle>
            <p className="text-white/80 mb-2">Welcome back, {user.displayName}!</p>
            <p className="text-white/60 text-sm">Test your reflexes in 30 seconds</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setCurrentView('game')}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold text-lg py-6"
            >
              🚀 Start Game
            </Button>
            <Button
              onClick={() => setCurrentView('leaderboard')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
            >
              🏆 Leaderboard
            </Button>
          </CardContent>
        </Card>
      </div>

      <InfoModal 
        isOpen={showInfo} 
        onClose={() => setShowInfo(false)} 
        darkMode={darkMode}
      />
    </div>
  );
};

export default Index;
