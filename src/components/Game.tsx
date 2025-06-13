import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Crown, Star, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Target {
  id: string;
  x: number;
  y: number;
  size: number;
}

interface GameProps {
  user: any;
  onBack: () => void;
  soundEnabled: boolean;
}

const Game: React.FC<GameProps> = ({ user, onBack, soundEnabled }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [targets, setTargets] = useState<Target[]>([]);
  const [streak, setStreak] = useState(0);
  const [hitMessage, setHitMessage] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [highestScore, setHighestScore] = useState(0);
  const [newRecord, setNewRecord] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Enhanced sound effect function with different sounds for each level
  const playHitSound = () => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different sound for each difficulty level
      if (difficulty === 'Easy') {
        // Gentle "pop" sound for easy mode
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
      } else if (difficulty === 'Medium') {
        // Sharp "ding" sound for medium mode
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.35, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      } else if (difficulty === 'Hard') {
        // High-pitched "zap" sound for hard mode
        oscillator.frequency.setValueAtTime(1400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.08);
      }
    } catch (error) {
      console.log('Sound not supported:', error);
    }
  };

  // Load highest score from localStorage
  useEffect(() => {
    const savedHighest = parseInt(localStorage.getItem(`bestScore_${user.uid}`) || '0');
    setHighestScore(savedHighest);
  }, [user.uid]);

  // Game timer
  useEffect(() => {
    if (gameStarted && !gameEnded && timeLeft > 0) {
      intervalRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameStarted) {
      endGame();
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [timeLeft, gameStarted, gameEnded]);

  // Update difficulty based on time remaining
  useEffect(() => {
    if (timeLeft > 20) {
      setDifficulty('Easy');
    } else if (timeLeft > 10) {
      setDifficulty('Medium');
    } else {
      setDifficulty('Hard');
    }
  }, [timeLeft]);

  // Generate new targets with multiple spawning
  const generateTarget = () => {
    if (!gameAreaRef.current || gameEnded) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    let size = 80;
    let maxTargets = 1;
    
    if (difficulty === 'Medium') {
      size = 55;
      maxTargets = 2;
    } else if (difficulty === 'Hard') {
      size = 35;
      maxTargets = 3;
    }

    const margin = size / 2;
    const newTargets: Target[] = [];

    // Generate multiple targets based on difficulty
    for (let i = 0; i < maxTargets; i++) {
      const x = Math.random() * (rect.width - size) + margin;
      const y = Math.random() * (rect.height - size) + margin;

      const newTarget: Target = {
        id: `${Date.now()}-${i}`,
        x,
        y,
        size
      };

      newTargets.push(newTarget);
    }

    setTargets(newTargets);

    // Much faster target spawning
    let timeout;
    if (difficulty === 'Hard') timeout = 400;      // Very fast
    else if (difficulty === 'Medium') timeout = 600; // Fast
    else timeout = 800;  // Normal but faster than before

    targetTimeoutRef.current = setTimeout(() => {
      generateTarget();
    }, timeout);
  };

  const startGame = () => {
    console.log('Starting game, resetting score to 0');
    setGameStarted(true);
    setScore(0);
    setTimeLeft(30);
    setGameEnded(false);
    setStreak(0);
    setHitMessage('');
    setNewRecord(false);
    setTargets([]);
    setForceUpdate(0);
    generateTarget();
  };

  const hitTarget = (targetId: string) => {
    if (gameEnded) return;

    console.log('Target hit! Current score before update:', score);
    
    // Play hit sound
    playHitSound();
    
    // Remove the hit target
    setTargets(prev => prev.filter(t => t.id !== targetId));
    
    // Update score with immediate logging and force update
    setScore(prev => {
      const newScore = prev + 10;
      console.log('Score updated from', prev, 'to', newScore);
      setForceUpdate(f => f + 1); // Force component re-render
      return newScore;
    });
    
    setStreak(prev => prev + 1);

    // Show hit message
    const messages = ['Nice Hit!', 'Great Shot!', 'Awesome!', 'Perfect!'];
    if (streak >= 2) {
      setHitMessage(streak >= 5 ? 'Crazy Fast!' : 'Reflex Streak!');
      if (streak === 2) {
        setScore(prev => {
          const bonusScore = prev + 10;
          console.log('Bonus points! Score now:', bonusScore);
          return bonusScore;
        });
      }
    } else {
      setHitMessage(messages[Math.floor(Math.random() * messages.length)]);
    }

    // Clear message after 1 second
    setTimeout(() => setHitMessage(''), 1000);
    
    console.log('Hit target completed, current score should be:', score + 10);
  };

  const endGame = () => {
    console.log('Game ended with final score:', score);
    setGameEnded(true);
    setTargets([]);
    
    if (targetTimeoutRef.current) {
      clearTimeout(targetTimeoutRef.current);
    }

    // Check if new personal best
    if (score > highestScore) {
      setHighestScore(score);
      setNewRecord(true);
      localStorage.setItem(`bestScore_${user.uid}`, score.toString());
      
      toast({
        title: "🎉 NEW PERSONAL BEST! 🎉",
        description: `Incredible! You scored ${score} points!`,
      });
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameEnded(false);
    setScore(0);
    setTimeLeft(30);
    setTargets([]);
    setStreak(0);
    setHitMessage('');
    setNewRecord(false);
    setForceUpdate(0);
  };

  // Debug log to track score changes
  useEffect(() => {
    console.log('Score state changed to:', score);
  }, [score]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 animate-gradient-x relative overflow-hidden">
      {/* Floating Highest Score Board */}
      {highestScore > 0 && (
        <div className={`absolute top-20 left-1/2 transform -translate-x-1/2 z-20 ${newRecord ? 'animate-bounce' : 'animate-pulse'}`}>
          <div className={`bg-gradient-to-r ${newRecord ? 'from-yellow-400 via-orange-500 to-red-500' : 'from-purple-500 to-pink-500'} rounded-full px-6 py-3 shadow-2xl border-4 border-white/30`}>
            <div className="flex items-center gap-2 text-white">
              {newRecord ? (
                <Crown className="w-6 h-6 text-yellow-200 animate-spin" />
              ) : (
                <Trophy className="w-6 h-6 text-yellow-200" />
              )}
              <div className="text-center">
                <div className="text-xs font-medium opacity-90">
                  {newRecord ? '🔥 NEW RECORD! 🔥' : '👑 PERSONAL BEST'}
                </div>
                <div className="text-xl font-bold">{highestScore}</div>
              </div>
              <Star className="w-6 h-6 text-yellow-200 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          onClick={onBack}
          className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Menu
        </Button>
      </div>

      {/* Game Stats */}
      <div className="absolute top-4 right-4 z-10 text-white text-right">
        <div className={`text-2xl font-bold mb-2 ${timeLeft <= 10 ? 'animate-pulse text-red-400' : ''}`}>
          Time: {timeLeft}s
        </div>
        <div className="text-xl font-semibold mb-1">
          Score: <span className="text-yellow-300 font-bold">{score}</span>
        </div>
        <div className="text-sm opacity-80">
          Difficulty: {difficulty}
        </div>
        {streak > 0 && (
          <div className="text-sm text-orange-300">
            Streak: {streak}
          </div>
        )}
      </div>

      {/* Hit Message */}
      {hitMessage && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="text-4xl font-bold text-white animate-bounce">
            {hitMessage}
          </div>
        </div>
      )}

      {/* New Record Celebration */}
      {newRecord && gameEnded && (
        <div className="absolute inset-0 pointer-events-none z-15">
          <div className="absolute top-32 left-20 text-6xl animate-bounce">🎉</div>
          <div className="absolute top-40 right-32 text-6xl animate-bounce" style={{ animationDelay: '0.2s' }}>🔥</div>
          <div className="absolute bottom-32 left-32 text-6xl animate-bounce" style={{ animationDelay: '0.4s' }}>⭐</div>
          <div className="absolute bottom-20 right-20 text-6xl animate-bounce" style={{ animationDelay: '0.6s' }}>👑</div>
          <div className="absolute top-60 left-1/2 text-6xl animate-bounce" style={{ animationDelay: '0.8s' }}>🚀</div>
        </div>
      )}

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        className="absolute inset-0 cursor-crosshair"
        style={{ top: '80px', bottom: '20px', left: '20px', right: '20px' }}
      >
        {/* Targets */}
        {targets.map(target => (
          <div
            key={target.id}
            className="absolute bg-gradient-to-br from-red-400 to-pink-500 rounded-full cursor-pointer animate-pulse shadow-lg transform hover:scale-110 transition-transform"
            style={{
              left: target.x - target.size / 2,
              top: target.y - target.size / 2,
              width: target.size,
              height: target.size,
              boxShadow: '0 0 20px rgba(255, 0, 100, 0.8)'
            }}
            onClick={() => {
              console.log('Target clicked:', target.id);
              hitTarget(target.id);
            }}
          />
        ))}

        {/* Game States */}
        {!gameStarted && !gameEnded && (
          <div className="flex items-center justify-center h-full">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-center">
              <CardHeader>
                <CardTitle className="text-white text-3xl">🎯 Ready to Play?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80 mb-4">
                  Hit as many targets as you can in 30 seconds!
                </p>
                {highestScore > 0 && (
                  <p className="text-yellow-300 font-bold mb-4">
                    Beat your record of {highestScore} points! 🏆
                  </p>
                )}
                <Button
                  onClick={startGame}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold text-lg px-8 py-3"
                >
                  🚀 Start Game
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {gameEnded && (
          <div className="flex items-center justify-center h-full">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-center max-w-md">
              <CardHeader>
                <CardTitle className={`text-white text-3xl ${newRecord ? 'animate-pulse' : ''}`}>
                  {newRecord ? '🎉 NEW RECORD! 🎉' : '🎯 Game Over!'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-white">
                  <div className={`text-3xl font-bold mb-4 ${newRecord ? 'text-yellow-300 animate-pulse' : 'text-yellow-300'}`}>
                    Final Score: {score}
                  </div>
                  
                  {newRecord && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border-2 border-yellow-400/50">
                      <div className="text-2xl mb-2">🔥 AMAZING! 🔥</div>
                      <div className="text-lg text-yellow-200">
                        You crushed your previous best!
                      </div>
                      <div className="text-sm text-white/80 mt-2">
                        Keep pushing your limits! 💪
                      </div>
                    </div>
                  )}

                  {!newRecord && highestScore > 0 && score < highestScore && (
                    <div className="mb-4 p-3 bg-blue-500/20 rounded-lg">
                      <div className="text-lg text-blue-200">
                        So close! Your best is still {highestScore} 🎯
                      </div>
                      <div className="text-sm text-white/70">
                        Only {highestScore - score} points away from your record!
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={resetGame}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold"
                  >
                    🔄 Play Again
                  </Button>
                  <Button
                    onClick={onBack}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
                  >
                    📊 View Leaderboard
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
