import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ReactionTime = () => {
  const [gameState, setGameState] = useState('idle'); // idle, waiting, tap, result, falsestart
  const [lastTime, setLastTime] = useState(null);
  const [bestTime, setBestTime] = useState(null);
  const [message, setMessage] = useState('Tap anywhere to start');
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const startTest = () => {
    setGameState('waiting');
    setMessage('Wait for green...');
    
    const randomDelay = 2000 + Math.random() * 3000; // 2 to 5 seconds
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setGameState('tap');
      setMessage('TAP NOW!');
      startTimeRef.current = Date.now();
    }, randomDelay);
  };

  const handleTap = () => {
    if (gameState === 'idle' || gameState === 'result' || gameState === 'falsestart') {
      startTest();
    } else if (gameState === 'waiting') {
      // Tapped too early!
      if (timerRef.current) clearTimeout(timerRef.current);
      setGameState('falsestart');
      setMessage('Too early! Falsestart.');
    } else if (gameState === 'tap') {
      const elapsed = Date.now() - startTimeRef.current;
      setLastTime(elapsed);
      if (bestTime === null || elapsed < bestTime) {
        setBestTime(elapsed);
      }
      setGameState('result');
      setMessage(`${elapsed} ms`);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const getBackgroundColor = () => {
    if (gameState === 'waiting') return '#e63946'; // Red
    if (gameState === 'tap') return '#2a9d8f'; // Green
    if (gameState === 'falsestart') return '#f4a261'; // Orange
    return '#fff'; // White for idle / result
  };

  const getTextColor = () => {
    if (gameState === 'waiting' || gameState === 'tap') return '#fff';
    return '#0d0d0d';
  };

  return (
    <View style={styles.container}>
      {/* Scoreboard */}
      <View style={styles.scoresRow}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>LAST RUN</Text>
          <Text style={styles.scoreNum}>{lastTime !== null ? `${lastTime}ms` : '--'}</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>BEST RUN</Text>
          <Text style={[styles.scoreNum, { color: '#2a9d8f' }]}>
            {bestTime !== null ? `${bestTime}ms` : '--'}
          </Text>
        </View>
      </View>

      {/* Stage */}
      <TouchableOpacity
        style={[styles.stage, { backgroundColor: getBackgroundColor() }]}
        onPress={handleTap}
        activeOpacity={0.95}
      >
        <View style={styles.centerAlign}>
          {gameState === 'idle' && <Text style={styles.stageIcon}>🚦</Text>}
          {gameState === 'falsestart' && <Text style={styles.stageIcon}>⚠️</Text>}
          {gameState === 'result' && <Text style={styles.stageIcon}>⏱️</Text>}
          
          <Text style={[styles.mainText, { color: getTextColor() }]}>
            {message}
          </Text>
          
          {(gameState === 'idle' || gameState === 'result' || gameState === 'falsestart') && (
            <Text style={styles.subText}>Tap screen to start next round</Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ReactionTime;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
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
    minHeight: 250,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ebebeb',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  centerAlign: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  mainText: {
    fontFamily: 'Georgia',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subText: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Georgia',
    marginTop: 4,
  },
});
