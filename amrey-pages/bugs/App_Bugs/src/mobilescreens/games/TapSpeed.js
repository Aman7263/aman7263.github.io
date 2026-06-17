import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const GAME_DURATION = 15; // 15 seconds game loop

const TapSpeed = () => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [activeCell, setActiveCell] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameState, setGameState] = useState('idle'); // idle, playing, over
  const timerRef = useRef(null);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameState('playing');
    spawnTarget(null);
  };

  const spawnTarget = (currentActive) => {
    let nextActive;
    do {
      nextActive = Math.floor(Math.random() * 9);
    } while (nextActive === currentActive);

    setActiveCell(nextActive);
  };

  const handleCellPress = (index) => {
    if (gameState !== 'playing') return;

    if (index === activeCell) {
      setScore((prev) => {
        const nextScore = prev + 1;
        if (nextScore > highScore) {
          setHighScore(nextScore);
        }
        return nextScore;
      });
      spawnTarget(activeCell);
    } else {
      // Tap wrong cell penalty
      setScore((prev) => Math.max(0, prev - 1));
    }
  };

  // Timer loop
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('over');
      setActiveCell(null);
    }

    return () => clearTimeout(timerRef.current);
  }, [timeLeft, gameState]);

  const renderCell = (index) => {
    const isActive = index === activeCell;
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.cell,
          isActive && styles.cellActive,
        ]}
        onPress={() => handleCellPress(index)}
        activeOpacity={0.7}
      >
        <View style={[styles.innerCircle, isActive && styles.innerCircleActive]} />
      </TouchableOpacity>
    );
  };

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
          <Text style={[styles.scoreNum, { color: timeLeft <= 5 && timeLeft > 0 ? '#e63946' : '#fff' }]}>
            {timeLeft}s
          </Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>HIGH SCORE</Text>
          <Text style={[styles.scoreNum, { color: '#2a9d8f' }]}>{highScore}</Text>
        </View>
      </View>

      {/* Grid Board */}
      <View style={styles.grid}>
        {Array(9)
          .fill(0)
          .map((_, idx) => renderCell(idx))}

        {gameState !== 'playing' && (
          <View style={styles.overlay}>
            {gameState === 'idle' ? (
              <TouchableOpacity style={styles.btnStart} onPress={startGame}>
                <Text style={styles.btnStartText}>START GAME</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.gameOverBox}>
                <Text style={styles.gameOverHeader}>Time's Up!</Text>
                <Text style={styles.gameOverSub}>Final Score: {score}</Text>
                <TouchableOpacity style={styles.btnRestart} onPress={startGame}>
                  <Text style={styles.btnRestartText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Guide label */}
      <Text style={styles.guideText}>
        {gameState === 'playing'
          ? 'TAP THE GLOWING RED DOTS QUICKLY!'
          : 'Tap start and whack as many dots as you can!'}
      </Text>
    </View>
  );
};

export default TapSpeed;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },

  // Scoreboard
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

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: 290,
    height: 290,
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 24,
  },
  cell: {
    width: 78,
    height: 78,
    backgroundColor: '#222',
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellActive: {
    backgroundColor: '#3a1111',
    borderWidth: 1.5,
    borderColor: '#e63946',
  },
  innerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
  },
  innerCircleActive: {
    backgroundColor: '#e63946',
    shadowColor: '#e63946',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },

  // Overlay Screens
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  btnStart: {
    backgroundColor: '#e63946',
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 28,
    elevation: 4,
  },
  btnStartText: {
    fontFamily: 'Georgia',
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  gameOverBox: {
    alignItems: 'center',
  },
  gameOverHeader: {
    fontFamily: 'Georgia',
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  gameOverSub: {
    fontFamily: 'Georgia',
    fontSize: 15,
    color: '#aaa',
    marginBottom: 20,
  },
  btnRestart: {
    backgroundColor: '#fff',
    borderRadius: 2,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  btnRestartText: {
    fontFamily: 'Georgia',
    fontSize: 12,
    fontWeight: '700',
    color: '#0d0d0d',
    letterSpacing: 0.5,
  },

  // Guide
  guideText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1,
    textAlign: 'center',
  },
});
