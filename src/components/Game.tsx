
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
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
  const [previousScores, setPreviousScores] = useState<number[]>([]);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Load previous scores from localStorage
  useEffect(() => {
    const savedScores = localStorage.getItem(`scores_${user.uid}`);
    if (savedScores) {
      setPreviousScores(JSON.parse(savedScores));
    }
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

  // Update difficulty based on time remaining (more aggressive progression)
  useEffect(() => {
    if (timeLeft > 20) {
      setDifficulty('Easy');
    } else if (timeLeft > 10) {
      setDifficulty('Medium');
    } else {
      setDifficulty('Hard');
    }
  }, [timeLeft]);

  // Generate new target with much faster spawn rates
  const generateTarget = () => {
    if (!gameAreaRef.current || gameEnded) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    let size = 80;
    
    // More aggressive size reduction
    if (difficulty === 'Medium') size = 55;
    else if (difficulty === 'Hard') size = 35;

    const margin = size / 2;
    const x = Math.random() * (rect.width - size) + margin;
    const y = Math.random() * (rect.height - size) + margin;

    const newTarget: Target = {
      id: Date.now().toString(),
      x,
      y,
      size
    };

    setTargets([newTarget]);

    // Much faster target spawning - more aggressive timing
    let timeout;
    if (difficulty === 'Hard') timeout = 800;      // Very fast
    else if (difficulty === 'Medium') timeout = 1200; // Fast
    else timeout = 1600;  // Still faster than before

    targetTimeoutRef.current = setTimeout(() => {
      setTargets([]);
      generateTarget();
    }, timeout);
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setTimeLeft(30);
    setGameEnded(false);
    setStreak(0);
    setHitMessage('');
    generateTarget();
  };

  const hitTarget = (targetId: string) => {
    if (gameEnded) return;

    setTargets(prev => prev.filter(t => t.id !== targetId));
    setScore(prev => prev + 10);
    setStreak(prev => prev + 1);

    // Clear existing timeout
    if (targetTimeoutRef.current) {
      clearTimeout(targetTimeoutRef.current);
    }

    // Show hit message
    const messages = ['Nice Hit!', 'Great Shot!', 'Awesome!', 'Perfect!'];
    if (streak >= 2) {
      setHitMessage(streak >= 5 ? 'Crazy Fast!' : 'Reflex Streak!');
      if (streak === 2) {
        setScore(prev => prev + 10); // Bonus points
      }
    } else {
      setHitMessage(messages[Math.floor(Math.random() * messages.length)]);
    }

    // Clear message after 1 second
    setTimeout(() => setHitMessage(''), 1000);

    // Generate new target immediately
    setTimeout(() => generateTarget(), 50); // Reduced delay for faster gameplay
  };

  const endGame = () => {
    setGameEnded(true);
    setTargets([]);
    
    if (targetTimeoutRef.current) {
      clearTimeout(targetTimeoutRef.current);
    }

    // Only save score if it's greater than 0
    if (score > 0) {
      const newScores = [...previousScores, score];
      localStorage.setItem(`scores_${user.uid}`, JSON.stringify(newScores));
      setPreviousScores(newScores);

      // Update best score
      const currentBest = parseInt(localStorage.getItem(`bestScore_${user.uid}`) || '0');
      if (score > currentBest) {
        localStorage.setItem(`bestScore_${user.uid}`, score.toString());
        toast({
          title: "New Personal Best!",
          description: `Amazing! You scored ${score} points!`,
        });
      }
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 animate-gradient-x relative overflow-hidden">
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
          Score: <span className="text-yellow-300">{score}</span>
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
            onClick={() => hitTarget(target.id)}
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
                <CardTitle className="text-white text-3xl">🎉 Game Over!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-white">
                  <div className="text-2xl font-bold text-yellow-300 mb-2">
                    Your Final Score: {score}
                  </div>
                  
                  {previousScores.length > 0 && score > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">Your Previous Scores:</h3>
                      <div className="text-sm space-y-1 max-h-32 overflow-y-auto">
                        {previousScores.slice(-5).reverse().map((prevScore, index) => (
                          <div key={index} className="text-white/70">
                            Try {previousScores.length - index}: {prevScore} pts
                          </div>
                        ))}
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
