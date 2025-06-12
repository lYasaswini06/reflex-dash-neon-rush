
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Github, Heart } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

const InfoModal = ({ isOpen, onClose, darkMode }: InfoModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-md ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white/95 backdrop-blur-lg'}`}>
        <DialogHeader>
          <DialogTitle className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
            <span className="text-3xl">🎯</span>
            Reflex Dash Info
          </DialogTitle>
        </DialogHeader>
        
        <div className={`space-y-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <div>
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              🎮 How to Play
            </h3>
            <ul className="space-y-1 text-sm">
              <li>• Click the glowing targets as fast as you can</li>
              <li>• Each hit = +10 points</li>
              <li>• 3 hits in a row = +10 bonus points</li>
              <li>• Game lasts 30 seconds</li>
              <li>• Difficulty increases over time</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              📊 Difficulty Levels
            </h3>
            <ul className="space-y-1 text-sm">
              <li>• 0-10s: Easy (large targets)</li>
              <li>• 11-20s: Medium (smaller & faster)</li>
              <li>• 21-30s: Hard (smallest & fastest)</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              🏆 Features
            </h3>
            <ul className="space-y-1 text-sm">
              <li>• Global leaderboard with Firebase</li>
              <li>• Personal score tracking</li>
              <li>• Dark/Light mode toggle</li>
              <li>• Sound effects toggle</li>
              <li>• Responsive design</li>
            </ul>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Created by
            </h3>
            <p className="text-sm mb-3">
              Built with React, Firebase, and lots of ⚡
            </p>
            <Button
              onClick={() => window.open('https://github.com', '_blank')}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Github className="w-4 h-4 mr-2" />
              View on GitHub
            </Button>
          </div>
        </div>
        
        <Button
          onClick={onClose}
          className="absolute top-4 right-4 bg-transparent hover:bg-gray-200/20 p-2"
          size="sm"
        >
          <X className="w-4 h-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default InfoModal;
