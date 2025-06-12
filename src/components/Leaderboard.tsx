
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  uid: string;
  nickname: string;
  score: number;
  rank: number;
}

interface LeaderboardProps {
  user: any;
  onBack: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ user, onBack }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userBestScore, setUserBestScore] = useState(0);

  useEffect(() => {
    loadLeaderboard();
  }, [user]);

  const loadLeaderboard = () => {
    // Get all scores from localStorage
    const allScores: LeaderboardEntry[] = [];
    
    // Get current user's best score
    const userBest = parseInt(localStorage.getItem(`bestScore_${user.uid}`) || '0');
    setUserBestScore(userBest);
    
    if (userBest > 0) {
      allScores.push({
        uid: user.uid,
        nickname: user.nickname || user.displayName,
        score: userBest,
        rank: 0
      });
    }

    // Add some sample scores for demonstration
    const sampleScores = [
      { uid: 'sample1', nickname: 'FlashMaster', score: 280, rank: 0 },
      { uid: 'sample2', nickname: 'QuickDraw', score: 250, rank: 0 },
      { uid: 'sample3', nickname: 'TargetHunter', score: 220, rank: 0 },
      { uid: 'sample4', nickname: 'SpeedDemon', score: 200, rank: 0 },
      { uid: 'sample5', nickname: 'ReflexKing', score: 180, rank: 0 }
    ];

    // Combine and sort
    const combinedScores = [...allScores, ...sampleScores]
      .filter((entry, index, self) => 
        index === self.findIndex(e => e.uid === entry.uid)
      )
      .sort((a, b) => b.score - a.score);

    // Assign ranks
    const rankedScores = combinedScores.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    setLeaderboard(rankedScores);

    // Find user's rank
    const currentUserEntry = rankedScores.find(entry => entry.uid === user.uid);
    if (currentUserEntry) {
      setUserRank(currentUserEntry.rank);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-white font-bold">{rank}</span>;
  };

  const getEncouragementMessage = () => {
    if (userRank === 1) {
      return "🥇 You're the Reflex Champion!";
    }
    if (userRank && userRank <= 3) {
      return "🏆 Amazing reflexes! You're in the top 3!";
    }
    if (userRank && leaderboard.length > 0) {
      const topScore = leaderboard[0]?.score || 0;
      const difference = topScore - userBestScore;
      if (difference <= 50) {
        return "You're catching up! 👀";
      }
    }
    return "Keep practicing to climb the leaderboard! 💪";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 animate-gradient-x relative overflow-hidden">
      {/* Floating emojis */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="animate-float-1 absolute top-20 left-20 text-4xl">🏆</div>
        <div className="animate-float-2 absolute top-40 right-32 text-4xl">🥇</div>
        <div className="animate-float-3 absolute bottom-32 left-32 text-4xl">⚡</div>
        <div className="animate-float-1 absolute bottom-20 right-20 text-4xl">🎯</div>
      </div>

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

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-white mb-2">
              🏆 Leaderboard
            </CardTitle>
            <p className="text-white/80">Top Reflex Masters</p>
            
            {userBestScore > 0 && (
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
                <p className="text-white font-semibold">
                  {getEncouragementMessage()}
                </p>
                <p className="text-white/70 text-sm">
                  Your best score: {userBestScore} points
                  {userRank && ` (Rank #${userRank})`}
                </p>
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center text-white/70 py-8">
                <p className="text-lg mb-4">No scores yet!</p>
                <p>Be the first to set a score and claim the top spot! 🚀</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.slice(0, 10).map((entry, index) => (
                  <div
                    key={entry.uid}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                      entry.uid === user.uid
                        ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400/50 animate-glow'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {getRankIcon(entry.rank)}
                      <div>
                        <p className="text-white font-semibold">
                          {entry.nickname}
                          {entry.uid === user.uid && (
                            <span className="ml-2 text-yellow-300 text-sm">(You)</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-lg">{entry.score}</p>
                      <p className="text-white/60 text-sm">points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {userBestScore === 0 && (
              <div className="mt-6 text-center">
                <p className="text-white/70 mb-4">
                  Play your first game to appear on the leaderboard!
                </p>
                <Button
                  onClick={onBack}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold"
                >
                  🚀 Start Playing
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
