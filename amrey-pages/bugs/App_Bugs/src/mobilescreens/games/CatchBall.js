import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const STAGE_HEIGHT = 240;
const STAGE_WIDTH = 260;
const BALL_SIZE = 40;

const CatchBall = () => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState('idle'); // idle, playing, over
  
  const [ballX, setBallX] = useState(STAGE_WIDTH / 2 - BALL_SIZE / 2);
  const [ballY, setBallY] = useState(0);
  const [speed, setSpeed] = useState(4); // pixels per tick

  const gameIntervalRef = useRef(null);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setSpeed(4);
    resetBall();
    setGameState('playing');
  };

  const resetBall = () => {
    setBallY(0);
    // Random X between 0 and STAGE_WIDTH - BALL_SIZE
    const maxVal = STAGE_WIDTH - BALL_SIZE - 20;
    const randomX = 10 + Math.random() * maxVal;
    setBallX(randomX);
  };

  const handleCatch = () => {
    if (gameState !== 'playing') return;
    setScore((prev) => prev + 1);
    setSpeed((prev) => prev + 0.4); // Get faster
    resetBall();
  };

  // Game Loop
  useEffect(() => {
    if (gameState === 'playing') {
      gameIntervalRef.current = setInterval(() => {
        setBallY((y) => {
          const nextY = y + speed;
          if (nextY >= STAGE_HEIGHT - BALL_SIZE) {
            // Missed!
            setLives((l) => {
              const nextLives = l - 1;
              if (nextLives <= 0) {
                setGameState('over');
                clearInterval(gameIntervalRef.current);
              }
              return nextLives;
            });
            resetBall();
            return 0;
          }
          return nextY;
        });
      }, 30);
    }

    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    };
  }, [gameState, speed]);

  useEffect(() => {
    if (gameState === 'over' && score > highScore) {
      setHighScore(score);
    }
  }, [gameState, score]);

  return (
    <View style={styles.container}>
      {/* Scoreboard */}
      <View style={styles.scoresRow}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>CATCHES</Text>
          <Text style={styles.scoreNum}>{score}</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>LIVES</Text>
          <Text style={[styles.scoreNum, { color: '#e63946' }]}>
            {Array.from({ length: Math.max(0, lives) }).map(() => '❤️').join('') || '💀'}
          </Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>HIGH CATCHES</Text>
          <Text style={[styles.scoreNum, { color: '#2a9d8f' }]}>{highScore}</Text>
        </View>
      </View>

      {/* Stage */}
      <View style={styles.stage}>
        {gameState === 'playing' ? (
          <View style={styles.canvas}>
            {/* The Falling Ball */}
            <TouchableOpacity
              style={[styles.ball, { left: ballX, top: ballY }]}
              onPress={handleCatch}
              activeOpacity={0.8}
            >
              <Text style={styles.ballText}>🥎</Text>
            </TouchableOpacity>

            {/* Bottom danger indicator line */}
            <View style={styles.dangerLine} />
          </View>
        ) : (
          <View style={styles.overlay}>
            {gameState === 'idle' ? (
              <View style={styles.splashBox}>
                <Text style={styles.splashHeader}>Catch The Ball</Text>
                <Text style={styles.splashText}>
                  Tap the falling tennis ball before it hits the red line at the bottom. You have 3 lives!
                </Text>
                <TouchableOpacity style={styles.btnAction} onPress={startGame}>
                  <Text style={styles.btnActionText}>START GAME</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.splashBox}>
                <Text style={styles.resultHeader}>Game Over!</Text>
                <Text style={styles.resultScore}>{score} Catches</Text>
                <Text style={styles.resultDetails}>The ball got too fast!</Text>
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

export default CatchBall;

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
    fontSize: 16, // slightly smaller to fit hearts
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
  canvas: {
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
    backgroundColor: '#faf9f6',
    borderWidth: 1.5,
    borderColor: '#0d0d0d',
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  ball: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ballText: {
    fontSize: BALL_SIZE - 8,
  },
  dangerLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#e63946',
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
