import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const GAME_DURATION = 10;

const ClickSpeed = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameState, setGameState] = useState('idle'); // idle, playing, over
  const [bestCps, setBestCps] = useState(0);

  const timerRef = useRef(null);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameState('playing');
  };

  const handleTap = () => {
    if (gameState !== 'playing') return;
    setScore((prev) => prev + 1);
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('over');
      const finalCps = score / GAME_DURATION;
      if (finalCps > bestCps) {
        setBestCps(finalCps);
      }
    }

    return () => clearTimeout(timerRef.current);
  }, [timeLeft, gameState]);

  const currentCps = score / (GAME_DURATION - timeLeft || 1);

  return (
    <View style={styles.container}>
      {/* Scoreboard */}
      <View style={styles.scoresRow}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>CLICKS</Text>
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
          <Text style={styles.scoreLabel}>BEST CPS</Text>
          <Text style={[styles.scoreNum, { color: '#2a9d8f' }]}>{bestCps.toFixed(1)}</Text>
        </View>
      </View>

      {/* Tap Circle Stage */}
      <View style={styles.stage}>
        {gameState === 'playing' ? (
          <TouchableOpacity style={styles.tapTarget} onPress={handleTap} activeOpacity={0.8}>
            <Text style={styles.tapTargetText}>TAP!</Text>
            <Text style={styles.cpsSubText}>CPS: {currentCps.toFixed(1)}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.overlay}>
            {gameState === 'idle' ? (
              <View style={styles.splashBox}>
                <Text style={styles.splashHeader}>Click Speed Test</Text>
                <Text style={styles.splashText}>Tap the button as fast as you can in 10 seconds to measure your speed!</Text>
                <TouchableOpacity style={styles.btnAction} onPress={startGame}>
                  <Text style={styles.btnActionText}>START TEST</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.splashBox}>
                <Text style={styles.resultHeader}>Finished!</Text>
                <Text style={styles.resultCps}>{(score / GAME_DURATION).toFixed(1)} CPS</Text>
                <Text style={styles.resultDetails}>{score} clicks in {GAME_DURATION} seconds.</Text>
                <TouchableOpacity style={styles.btnAction} onPress={startGame}>
                  <Text style={styles.btnActionText}>TRY AGAIN</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default ClickSpeed;

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

  // Stage
  stage: {
    width: '100%',
    minHeight: 250,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ebebeb',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  tapTarget: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#0d0d0d',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0d0d0d',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  tapTargetText: {
    fontFamily: 'Georgia',
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
  },
  cpsSubText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '700',
    marginTop: 4,
  },

  // Overlay / Splashes
  splashBox: {
    alignItems: 'center',
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
  resultCps: {
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
