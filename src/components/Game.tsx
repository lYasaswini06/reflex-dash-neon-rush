
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface GameProps {
  user: any;
  db: any;
  onBack: () => void;
  soundEnabled: boolean;
}

const Game = ({ user, db, onBack, soundEnabled }: GameProps) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [target, setTarget] = useState({ x: 50, y: 50, id: 0 });
  const [streak, setStreak] = useState(0);
  const [hitMessages, setHitMessages] = useState<Array<{id: number, message: string, x: number, y: number}>>([]);
  const [difficulty, setDifficulty] = useState('Easy');
  const [targetSize, setTargetSize] = useState(80);
  const [spawnDelay, setSpawnDelay] = useState(1000);
  const [previousScores, setPreviousScores] = useState<number[]>([]);
  const [bestScore, setBestScore] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
        updateDifficulty(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted) {
      endGame();
    }
  }, [timeLeft, gameStarted]);

  useEffect(() => {
    if (gameStarted && !gameEnded) {
      spawnTarget();
    }
  }, [gameStarted, gameEnded]);

  const loadUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setBestScore(userData.bestScore || 0);
        setPreviousScores(userData.previousScores || []);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const updateDifficulty = (time: number) => {
    if (time > 20) {
      setDifficulty('Easy');
      setTargetSize(80);
      setSpawnDelay(1000);
    } else if (time > 10) {
      setDifficulty('Medium');
      setTargetSize(60);
      setSpawnDelay(800);
    } else {
      setDifficulty('Hard');
      setTargetSize(40);
      setSpawnDelay(600);
    }
  };

  const spawnTarget = () => {
    if (!gameAreaRef.current) return;
    
    const area = gameAreaRef.current.getBoundingClientRect();
    const margin = targetSize;
    
    const newTarget = {
      x: Math.random() * (area.width - margin * 2) + margin,
      y: Math.random() * (area.height - margin * 2) + margin,
      id: Date.now()
    };
    
    setTarget(newTarget);
  };

  const hitTarget = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (soundEnabled) {
      // Play hit sound (you can add actual audio files)
      const audio = new Audio('/hit-sound.mp3');
      audio.play().catch(() => {}); // Ignore errors if sound file doesn't exist
    }

    const newScore = score + 10;
    const newStreak = streak + 1;
    
    // Bonus for streaks
    let bonus = 0;
    if (newStreak % 3 === 0) {
      bonus = 10;
    }
    
    setScore(newScore + bonus);
    setStreak(newStreak);
    
    // Show hit message
    const messages = ['Nice Hit!', 'Great!', 'Awesome!', 'Perfect!'];
    let message = messages[Math.floor(Math.random() * messages.length)];
    
    if (newStreak >= 3 && newStreak % 3 === 0) {
      message = 'Reflex Streak!';
    }
    if (newStreak >= 10) {
      message = 'Crazy Fast!';
    }
    
    const hitMessage = {
      id: Date.now(),
      message: bonus > 0 ? `${message} +${10 + bonus}!` : `${message} +10!`,
      x: e.clientX,
      y: e.clientY
    };
    
    setHitMessages(prev => [...prev, hitMessage]);
    
    // Remove message after animation
    setTimeout(() => {
      setHitMessages(prev => prev.filter(m => m.id !== hitMessage.id));
    }, 1000);
    
    // Spawn new target immediately
    setTimeout(spawnTarget, 100);
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setStreak(0);
    setTimeLeft(30);
    setGameEnded(false);
    spawnTarget();
  };

  const endGame = async () => {
    setGameEnded(true);
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const newBestScore = Math.max(score, userData.bestScore || 0);
        const newPreviousScores = [...(userData.previousScores || []), score].slice(-5); // Keep last 5 scores
        
        await updateDoc(userDocRef, {
          bestScore: newBestScore,
          previousScores: newPreviousScores,
          totalGames: (userData.totalGames || 0) + 1,
          lastPlayed: new Date()
        });
        
        setBestScore(newBestScore);
        setPreviousScores(newPreviousScores);
        
        if (score > (userData.bestScore || 0)) {
          toast({
            title: "🎉 New Personal Best!",
            description: `You scored ${score} points!`,
          });
        }
        
        // Add to global leaderboard
        await setDoc(doc(db, 'leaderboard', user.uid), {
          nickname: user.displayName,
          score: newBestScore,
          lastUpdated: new Date()
        }, { merge: true });
        
      }
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameEnded(false);
    setScore(0);
    setStreak(0);
    setTimeLeft(30);
    setDifficulty('Easy');
    setTargetSize(80);
    setSpawnDelay(1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 animate-gradient-x relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <Button
          onClick={onBack}
          className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="flex gap-4 text-white font-bold">
          <div className={`text-2xl ${timeLeft <= 10 ? 'animate-pulse text-red-400' : ''}`}>
            ⏱️ {timeLeft}s
          </div>
          <div className="text-lg">
            📊 {difficulty}
          </div>
        </div>
        
        <div className="text-white font-bold text-2xl animate-pulse">
          🎯 {score}
        </div>
      </div>

      {/* Game Area */}
      <div 
        ref={gameAreaRef}
        className="absolute inset-0 mt-20 mb-4 mx-4 rounded-lg bg-black/10 backdrop-blur-sm cursor-crosshair"
        style={{ 
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)'
        }}
      >
        {/* Target */}
        {gameStarted && !gameEnded && (
          <div
            className="absolute animate-pulse cursor-pointer transition-all duration-200 hover:scale-110"
            style={{
              left: target.x - targetSize/2,
              top: target.y - targetSize/2,
              width: targetSize,
              height: targetSize,
              background: 'radial-gradient(circle, #ff6b6b, #ee5a24)',
              borderRadius: '50%',
              boxShadow: '0 0 20px rgba(255, 107, 107, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.3)',
              border: '3px solid rgba(255, 255, 255, 0.6)'
            }}
            onClick={hitTarget}
          />
        )}

        {/* Hit Messages */}
        {hitMessages.map((msg) => (
          <div
            key={msg.id}
            className="absolute pointer-events-none text-white font-bold text-2xl animate-bounce z-20"
            style={{
              left: msg.x - 50,
              top: msg.y - 50,
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}
          >
            {msg.message}
          </div>
        ))}

        {/* Game States */}
        {!gameStarted && !gameEnded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-8 text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Ready to Test Your Reflexes?</h2>
                <p className="text-white/80 mb-6">Hit as many targets as possible in 30 seconds!</p>
                <Button
                  onClick={startGame}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold text-xl px-8 py-4"
                >
                  🚀 Start Game!
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {gameEnded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-md">
              <CardContent className="p-8 text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
                <p className="text-2xl text-yellow-300 mb-4">Your Final Score: {score}</p>
                
                {score === bestScore && score > 0 && (
                  <p className="text-green-400 font-bold mb-4">🎉 New Personal Best!</p>
                )}
                
                <div className="text-white/80 mb-6">
                  <p className="mb-2">Best Score: {bestScore}</p>
                  {previousScores.length > 0 && (
                    <div>
                      <p className="mb-2">Your Previous Scores:</p>
                      {previousScores.map((prevScore, index) => (
                        <p key={index} className="text-sm">
                          Try {index + 1}: {prevScore} pts
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-4">
                  <Button
                    onClick={resetGame}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    🔄 Play Again
                  </Button>
                  <Button
                    onClick={onBack}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    🏠 Main Menu
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
