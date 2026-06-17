import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const GAME_DURATION = 15;
const MOLE_SPEED = 800; // ms between movements

const WhackAMole = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameState, setGameState] = useState('idle'); // idle, playing, over
  const [moleIndex, setMoleIndex] = useState(-1);
  const [highScore, setHighScore] = useState(0);

  const gameTimerRef = useRef(null);
  const moleTimerRef = useRef(null);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameState('playing');
    spawnMole();
  };

  const spawnMole = () => {
    setMoleIndex((prev) => {
      let next = Math.floor(Math.random() * 9);
      while (next === prev) {
        next = Math.floor(Math.random() * 9);
      }
      return next;
    });

    if (moleTimerRef.current) clearInterval(moleTimerRef.current);
    moleTimerRef.current = setInterval(() => {
      setMoleIndex((prev) => {
        let next = Math.floor(Math.random() * 9);
        while (next === prev) {
          next = Math.floor(Math.random() * 9);
        }
        return next;
      });
    }, MOLE_SPEED);
  };

  const handleMoleTap = (index) => {
    if (gameState !== 'playing') return;
    if (index === moleIndex) {
      setScore((prev) => prev + 1);
      // Immediately spawn a new one on success
      spawnMole();
    }
  };

  // Timer countdown
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      gameTimerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('over');
      setMoleIndex(-1);
      if (score > highScore) {
        setHighScore(score);
      }
      if (moleTimerRef.current) clearInterval(moleTimerRef.current);
    }

    return () => clearTimeout(gameTimerRef.current);
  }, [timeLeft, gameState]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearTimeout(gameTimerRef.current);
      if (moleTimerRef.current) clearInterval(moleTimerRef.current);
    };
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
          <View style={styles.grid}>
            {Array.from({ length: 9 }).map((_, index) => {
              const hasMole = moleIndex === index;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.gridCell, hasMole ? styles.gridCellActive : null]}
                  onPress={() => handleMoleTap(index)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cellText}>{hasMole ? '🐹' : '🕳️'}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.overlay}>
            {gameState === 'idle' ? (
              <View style={styles.splashBox}>
                <Text style={styles.splashHeader}>Whack-A-Mole</Text>
                <Text style={styles.splashText}>
                  Tap the active hamster holes as fast as you can. You have 15 seconds!
                </Text>
                <TouchableOpacity style={styles.btnAction} onPress={startGame}>
                  <Text style={styles.btnActionText}>START GAME</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.splashBox}>
                <Text style={styles.resultHeader}>Time's Up!</Text>
                <Text style={styles.resultScore}>{score} Points</Text>
                <Text style={styles.resultDetails}>You whacked {score} moles!</Text>
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

export default WhackAMole;

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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignContent: 'center',
  },
  gridCell: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#faf9f6',
    borderWidth: 1.5,
    borderColor: '#ebebeb',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 3,
  },
  gridCellActive: {
    backgroundColor: '#ffb703',
    borderColor: '#0d0d0d',
  },
  cellText: {
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
