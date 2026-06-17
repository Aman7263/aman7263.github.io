import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const GRID_SIZE = 9;

const PatternLock = () => {
  const [level, setLevel] = useState(3); // Start with 3 dots
  const [highScore, setHighScore] = useState(3);
  const [gameState, setGameState] = useState('idle'); // idle, showing, recall, won, over
  
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [activeDot, setActiveDot] = useState(null);

  const timeoutRefs = useRef([]);

  const startLevel = (newGame = false) => {
    // Clear any active timeouts
    timeoutRefs.current.forEach((t) => clearTimeout(t));
    timeoutRefs.current = [];

    const nextLvl = newGame ? 3 : level;
    setLevel(nextLvl);
    setUserInput([]);
    setActiveDot(null);
    setGameState('showing');

    // Generate random distinct sequence of dots
    const newSeq = [];
    while (newSeq.length < nextLvl) {
      const idx = Math.floor(Math.random() * GRID_SIZE);
      // Ensure we don't repeat the immediate predecessor to make paths distinct
      if (newSeq.length === 0 || newSeq[newSeq.length - 1] !== idx) {
        newSeq.push(idx);
      }
    }
    setSequence(newSeq);

    // Playback sequence
    newSeq.forEach((dot, index) => {
      // Turn active
      const t1 = setTimeout(() => {
        setActiveDot(dot);
      }, index * 800 + 300);

      // Turn inactive
      const t2 = setTimeout(() => {
        setActiveDot(null);
        if (index === newSeq.length - 1) {
          setGameState('recall');
        }
      }, index * 800 + 800);

      timeoutRefs.current.push(t1, t2);
    });
  };

  const handleDotPress = (idx) => {
    if (gameState !== 'recall') return;

    // Check if correct
    const expected = sequence[userInput.length];
    if (idx === expected) {
      const nextInput = [...userInput, idx];
      setUserInput(nextInput);

      if (nextInput.length === sequence.length) {
        // Correct level clear
        const nextLvl = level + 1;
        setLevel(nextLvl);
        if (nextLvl > highScore) {
          setHighScore(nextLvl);
        }
        setGameState('won');
      }
    } else {
      setGameState('over');
    }
  };

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Scoreboard */}
      <View style={styles.scoresRow}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>LEVEL</Text>
          <Text style={styles.scoreNum}>{level}</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>DOT LENGTH</Text>
          <Text style={[styles.scoreNum, { color: '#f4a261' }]}>{level} dots</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>BEST LEVEL</Text>
          <Text style={[styles.scoreNum, { color: '#2a9d8f' }]}>{highScore}</Text>
        </View>
      </View>

      {/* Stage */}
      <View style={styles.stage}>
        {gameState === 'idle' ? (
          <View style={styles.splashBox}>
            <Text style={styles.splashHeader}>Pattern Memory</Text>
            <Text style={styles.splashText}>
              A connecting lock pattern will flash. Re-draw the pattern by tapping dots in the exact sequence!
            </Text>
            <TouchableOpacity style={styles.btnAction} onPress={() => startLevel(true)}>
              <Text style={styles.btnActionText}>START PATTERN</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.gameArea}>
            <Text style={styles.instruction}>
              {gameState === 'showing' ? '👀 Watch the pattern flash...' : '✏️ Tap the dots in order!'}
            </Text>

            {/* 3x3 dot grid */}
            <View style={styles.grid}>
              {Array.from({ length: 9 }).map((_, idx) => {
                const isFlash = activeDot === idx;
                const isSelected = userInput.includes(idx);
                const orderText = userInput.indexOf(idx) !== -1 ? userInput.indexOf(idx) + 1 : '';

                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.dot,
                      isFlash && styles.dotFlash,
                      isSelected && styles.dotSelected
                    ]}
                    onPress={() => handleDotPress(idx)}
                    disabled={gameState !== 'recall'}
                    activeOpacity={0.7}
                  >
                    {isSelected && <Text style={styles.dotOrderText}>{orderText}</Text>}
                    {isFlash && <View style={styles.dotFlashCenter} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {gameState === 'won' && (
              <View style={styles.overlayCenter}>
                <Text style={styles.winHeader}>Pattern Matched! 🎉</Text>
                <TouchableOpacity style={styles.btnAction} onPress={() => startLevel(false)}>
                  <Text style={styles.btnActionText}>LEVEL {level}</Text>
                </TouchableOpacity>
              </View>
            )}

            {gameState === 'over' && (
              <View style={styles.overlayCenter}>
                <Text style={styles.loseHeader}>Wrong Dot! ❌</Text>
                <TouchableOpacity style={styles.btnAction} onPress={() => startLevel(true)}>
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

export default PatternLock;

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
  instruction: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Georgia',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#faf9f6',
    borderWidth: 2,
    borderColor: '#0d0d0d',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 6,
  },
  dotFlash: {
    backgroundColor: '#ffb703',
    borderColor: '#ffb703',
  },
  dotFlashCenter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  dotSelected: {
    backgroundColor: '#0d0d0d',
  },
  dotOrderText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  overlayCenter: {
    alignItems: 'center',
    marginTop: 10,
  },
  winHeader: {
    fontFamily: 'Georgia',
    fontSize: 18,
    fontWeight: '700',
    color: '#2a9d8f',
    marginBottom: 10,
  },
  loseHeader: {
    fontFamily: 'Georgia',
    fontSize: 18,
    fontWeight: '700',
    color: '#e63946',
    marginBottom: 10,
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
  btnAction: {
    backgroundColor: '#0d0d0d',
    borderRadius: 2,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  btnActionText: {
    fontFamily: 'Georgia',
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1.5,
  },
});
