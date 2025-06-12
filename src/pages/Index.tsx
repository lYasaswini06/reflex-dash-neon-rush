import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Info, LogOut, Moon, Sun, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Game from '@/components/Game';
import Leaderboard from '@/components/Leaderboard';
import InfoModal from '@/components/InfoModal';

// ⚠️ IMPORTANT: Replace with your actual Firebase configuration
// Get this from: Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: "demo-key", // Replace with your actual API key
  authDomain: "demo-project.firebaseapp.com", // Replace with your auth domain
  projectId: "demo-project", // Replace with your project ID
  storageBucket: "demo-project.appspot.com", // Replace with your storage bucket
  messagingSenderId: "123456789", // Replace with your messaging sender ID
  appId: "demo-app-id" // Replace with your app ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const Index = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [currentView, setCurrentView] = useState('menu');
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [authError, setAuthError] = useState('');
  const { toast } = useToast();

  // Check if Firebase is properly configured
  const isFirebaseConfigured = firebaseConfig.apiKey !== "demo-key";

  useEffect(() => {
    // Load preferences from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedSound = localStorage.getItem('soundEnabled') !== 'false';
    setDarkMode(savedDarkMode);
    setSoundEnabled(savedSound);
    
    // Apply dark mode
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    if (!nickname || !password) {
      setAuthError('Please enter both nickname and password');
      return;
    }

    if (!isFirebaseConfigured) {
      setAuthError('Firebase is not configured. Please update the Firebase config with your project details.');
      return;
    }

    try {
      const email = `${nickname}@reflexdash.com`;
      
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Welcome back!",
          description: `Good to see you again, ${nickname}!`,
        });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: nickname });
        
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          nickname: nickname,
          bestScore: 0,
          totalGames: 0,
          createdAt: new Date()
        });
        
        toast({
          title: "Account created!",
          description: `Welcome to Reflex Dash, ${nickname}!`,
        });
      }
    } catch (error: any) {
      console.log('Authentication error:', error);
      let errorMessage = error.message;
      
      // Provide more user-friendly error messages
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this nickname. Try creating an account instead.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This nickname is already taken. Try logging in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      }
      
      setAuthError(errorMessage);
      toast({
        title: "Authentication failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentView('menu');
      toast({
        title: "Logged out",
        description: "See you next time!",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
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
            
            {!isFirebaseConfigured && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mt-4">
                <div className="flex items-center gap-2 text-red-200">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Firebase Not Configured</span>
                </div>
                <p className="text-red-200/80 text-xs mt-1">
                  Please update the Firebase config in the code with your project details.
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
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
              <div>
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  required
                />
              </div>
              
              {authError && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-200 text-sm">{authError}</p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold"
                disabled={!isFirebaseConfigured}
              >
                {isLogin ? 'Login' : 'Create Account'}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-white/80 hover:text-white underline"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentView === 'game') {
    return <Game user={user} db={db} onBack={() => setCurrentView('menu')} soundEnabled={soundEnabled} />;
  }

  if (currentView === 'leaderboard') {
    return <Leaderboard user={user} db={db} onBack={() => setCurrentView('menu')} />;
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
