import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const GAME_DURATION = 15;

const EMOJI_PAIRS = [
  ['🦊', '🐱'],
  ['🍎', '🍒'],
  ['🦁', '🐯'],
  ['🏈', '⚽'],
  ['🍦', '🍧'],
  ['🚗', '🚙'],
  ['🌕', '🌙'],
  ['🍩', '🍪'],
  ['🦖', '🦕'],
  ['🦉', '🦅'],
  ['🍇', '🫐'],
  ['🌻', '🌸'],
  ['✈️', '🚀']
];

const OddOneOut = () => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameState, setGameState] = useState('idle'); // idle, playing, over
  
  const [gridItems, setGridItems] = useState([]);
  const [oddIndex, setOddIndex] = useState(-1);
  const [feedback, setFeedback] = useState('Find the odd emoji!');

  const timerRef = useRef(null);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameState('playing');
    setFeedback('Tap the odd one!');
    nextRound();
  };

  const nextRound = () => {
    // Pick random emoji pair
    const pair = EMOJI_PAIRS[Math.floor(Math.random() * EMOJI_PAIRS.length)];
    // Randomly select which is base and which is odd
    const swap = Math.random() < 0.5;
    const baseEmoji = swap ? pair[0] : pair[1];
    const oddEmoji = swap ? pair[1] : pair[0];

    const randomOddIdx = Math.floor(Math.random() * 9);
    const newItems = Array(9).fill(baseEmoji);
    newItems[randomOddIdx] = oddEmoji;

    setGridItems(newItems);
    setOddIndex(randomOddIdx);
  };

  const handleCellPress = (index) => {
    if (gameState !== 'playing') return;

    if (index === oddIndex) {
      setScore((prev) => prev + 1);
      setFeedback('🎉 Correct!');
      nextRound();
    } else {
      setFeedback('❌ Try again!');
    }
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('over');
      if (score > highScore) {
        setHighScore(score);
      }
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, gameState]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <View style={styles.container}>
      {/* Scoreboard */}
      <View style={styles.scoresRow}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreNum}>{score}</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>TIME LEFT</Text>
          <Text style={[styles.scoreNum, { color: timeLeft <= 3 && timeLeft > 0 ? '#e63946' : '#fff' }]}>
            {timeLeft}s
          </Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>HIGH SCORE</Text>
          <Text style={[styles.scoreNum, { color: '#2a9d8f' }]}>{highScore}</Text>
        </View>
      </View>

      {/* Stage */}
      <View style={styles.stage}>
        {gameState === 'playing' ? (
          <View style={styles.gameArea}>
            <Text style={styles.feedbackText}>{feedback}</Text>

            {/* Grid */}
            <View style={styles.grid}>
              {gridItems.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.gridCell}
                  onPress={() => handleCellPress(index)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cellEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.overlay}>
            {gameState === 'idle' ? (
              <View style={styles.splashBox}>
                <Text style={styles.splashHeader}>Odd One Out</Text>
                <Text style={styles.splashText}>
                  A 3x3 grid of emojis will appear. Find and tap the emoji that is different. You have 15 seconds!
                </Text>
                <TouchableOpacity style={styles.btnAction} onPress={startGame}>
                  <Text style={styles.btnActionText}>START SEARCH</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.splashBox}>
                <Text style={styles.resultHeader}>Finished!</Text>
                <Text style={styles.resultScore}>{score} Emojis Found</Text>
                <Text style={styles.resultDetails}>You matched {score} difference pairs.</Text>
                <TouchableOpacity style={styles.btnAction} onPress={startGame}>
                  <Text style={styles.btnActionText}>PLAY AGAIN</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default OddOneOut;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
  },
  scoresRow: {
    flexDirection: 'row',
    backgroundColor: '#0d0d0d',
    borderRadius: 4,
    width: '100%',
    paddingVertical: 14,
    marginBottom: 24,
  },
  scoreBox: {
    flex: 1,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: '#aaa',
    fontWeight: '700',
    marginBottom: 4,
  },
  scoreNum: {
    fontFamily: 'Georgia',
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  scoreDivider: {
    width: 1,
    backgroundColor: '#333',
    marginVertical: 4,
  },
  stage: {
    width: '100%',
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ebebeb',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  gameArea: {
    alignItems: 'center',
    width: '100%',
  },
  feedbackText: {
    fontFamily: 'Georgia',
    fontSize: 15,
    fontWeight: '700',
    color: '#0d0d0d',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 216,
    height: 216,
    justifyContent: 'center',
    alignContent: 'center',
  },
  gridCell: {
    width: 66,
    height: 66,
    borderRadius: 4,
    backgroundColor: '#faf9f6',
    borderWidth: 1.5,
    borderColor: '#ebebeb',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 3,
  },
  cellEmoji: {
    fontSize: 32,
  },
  overlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashBox: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  splashHeader: {
    fontFamily: 'Georgia',
    fontSize: 24,
    fontWeight: '700',
    color: '#0d0d0d',
    marginBottom: 8,
  },
  splashText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  resultHeader: {
    fontFamily: 'Georgia',
    fontSize: 20,
    fontWeight: '700',
    color: '#e63946',
    marginBottom: 4,
  },
  resultScore: {
    fontFamily: 'Georgia',
    fontSize: 38,
    fontWeight: '800',
    color: '#0d0d0d',
    marginBottom: 4,
  },
  resultDetails: {
    fontSize: 12,
    color: '#888',
    marginBottom: 20,
  },
  btnAction: {
    backgroundColor: '#0d0d0d',
    borderRadius: 2,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  btnActionText: {
    fontFamily: 'Georgia',
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1.5,
  },
});
