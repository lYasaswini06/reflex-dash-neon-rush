
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

interface LeaderboardProps {
  user: any;
  db: any;
  onBack: () => void;
}

interface LeaderboardEntry {
  id: string;
  nickname: string;
  score: number;
  lastUpdated: any;
}

const Leaderboard = ({ user, db, onBack }: LeaderboardProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userScore, setUserScore] = useState(0);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const q = query(
        collection(db, 'leaderboard'),
        orderBy('score', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const data: LeaderboardEntry[] = [];
      
      querySnapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data()
        } as LeaderboardEntry);
      });
      
      setLeaderboard(data);
      
      // Find user's rank and score
      const userIndex = data.findIndex(entry => entry.id === user.uid);
      if (userIndex !== -1) {
        setUserRank(userIndex + 1);
        setUserScore(data[userIndex].score);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-white font-bold">#{rank}</span>;
    }
  };

  const getStatusMessage = () => {
    if (userRank === 1) {
      return "🥇 You're the Reflex Champion!";
    }
    
    if (userRank && userRank <= 3) {
      return `🏆 Amazing! You're in the top 3!`;
    }
    
    if (userRank && leaderboard.length > 0) {
      const topScore = leaderboard[0].score;
      const scoreDiff = topScore - userScore;
      
      if (scoreDiff <= 50) {
        return "You're catching up! 👀";
      }
    }
    
    return "Keep practicing to climb the leaderboard! 💪";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 animate-gradient-x flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">Loading Leaderboard...</div>
      </div>
    );
  }

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
          className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="container mx-auto px-4 pt-20 pb-8">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-white mb-4">
              🏆 Global Leaderboard
            </CardTitle>
            {userRank && (
              <div className="text-lg text-yellow-300 font-semibold">
                {getStatusMessage()}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center text-white/80 py-8">
                <p className="text-xl mb-4">No scores yet!</p>
                <p>Be the first to set a record!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => {
                  const rank = index + 1;
                  const isCurrentUser = entry.id === user.uid;
                  
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                        isCurrentUser 
                          ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400 animate-pulse' 
                          : 'bg-white/10 hover:bg-white/20'
                      } ${
                        rank <= 3 ? 'shadow-lg' : ''
                      }`}
                      style={rank <= 3 ? {
                        boxShadow: rank === 1 ? '0 0 20px rgba(255, 215, 0, 0.5)' : 
                                  rank === 2 ? '0 0 20px rgba(192, 192, 192, 0.5)' :
                                  '0 0 20px rgba(205, 127, 50, 0.5)'
                      } : {}}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-black/20">
                          {getRankIcon(rank)}
                        </div>
                        <div>
                          <div className={`font-bold text-lg ${isCurrentUser ? 'text-yellow-300' : 'text-white'}`}>
                            {entry.nickname}
                            {isCurrentUser && ' (You)'}
                          </div>
                          <div className="text-white/60 text-sm">
                            {entry.lastUpdated?.toDate?.()?.toLocaleDateString() || 'Recently'}
                          </div>
                        </div>
                      </div>
                      <div className={`text-2xl font-bold ${
                        rank === 1 ? 'text-yellow-400' :
                        rank === 2 ? 'text-gray-300' :
                        rank === 3 ? 'text-amber-600' :
                        isCurrentUser ? 'text-yellow-300' : 'text-white'
                      }`}>
                        {entry.score}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {userRank && userRank > 10 && (
              <div className="mt-6 p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
                <div className="text-center text-white">
                  <p className="font-semibold">Your Current Ranking:</p>
                  <div className="flex items-center justify-center gap-4 mt-2">
                    <span className="text-xl">#{userRank}</span>
                    <span className="text-2xl font-bold text-yellow-300">{userScore} pts</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
