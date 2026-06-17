import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const MathRush = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([]);
  const [answer, setAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameState, setGameState] = useState('idle'); // idle, playing, over
  const timerRef = useRef(null);

  const startNewQuestion = () => {
    // Generate random operation: + - *
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];

    let num1, num2, correctAns;
    if (op === '+') {
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 50) + 1;
      correctAns = num1 + num2;
    } else if (op === '-') {
      num1 = Math.floor(Math.random() * 50) + 20;
      num2 = Math.floor(Math.random() * num1); // Positive outcome
      correctAns = num1 - num2;
    } else {
      num1 = Math.floor(Math.random() * 12) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      correctAns = num1 * num2;
    }

    setQuestion(`${num1} ${op === '*' ? '×' : op} ${num2} = ?`);
    setAnswer(correctAns);
    setTimeLeft(10);

    // Options generator
    const opts = new Set();
    opts.add(correctAns);
    while (opts.size < 4) {
      const offset = Math.floor(Math.random() * 20) - 10;
      if (offset !== 0) {
        opts.add(Math.max(0, correctAns + offset));
      }
    }

    setOptions([...opts].sort(() => Math.random() - 0.5));
  };

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setGameState('playing');
    startNewQuestion();
  };

  const handleChoice = (opt) => {
    if (gameState !== 'playing') return;

    if (opt === answer) {
      const addPoints = 10 + streak * 2;
      setScore((prev) => prev + addPoints);
      setStreak((prev) => prev + 1);
      startNewQuestion();
    } else {
      endGame();
    }
  };

  const endGame = () => {
    setGameState('over');
    clearTimeout(timerRef.current);
  };

  // Timer loop
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      endGame();
    }

    return () => clearTimeout(timerRef.current);
  }, [timeLeft, gameState]);

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
          <Text style={styles.scoreLabel}>STREAK</Text>
          <Text style={[styles.scoreNum, { color: '#f4a261' }]}>{streak}</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>TIMER</Text>
          <Text style={[styles.scoreNum, { color: timeLeft <= 3 ? '#e63946' : '#2a9d8f' }]}>
            {timeLeft}s
          </Text>
        </View>
      </View>

      {/* Board */}
      <View style={styles.board}>
        {gameState === 'playing' ? (
          <View style={styles.gameView}>
            <Text style={styles.questionText}>{question}</Text>
            
            <View style={styles.optionsGrid}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.optBtn}
                  onPress={() => handleChoice(opt)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.splashView}>
            {gameState === 'idle' ? (
              <View style={styles.introBox}>
                <Text style={styles.introHeader}>Math Rush</Text>
                <Text style={styles.introText}>Solve as many math operations as possible. Speed matters!</Text>
                <TouchableOpacity style={styles.btnAction} onPress={startGame}>
                  <Text style={styles.btnActionText}>START RUSH</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.gameOverBox}>
                <Text style={styles.gameOverHeader}>Rush Over!</Text>
                <Text style={styles.gameOverSub}>Final Score: {score}</Text>
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

export default MathRush;

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
    marginBottom: 20,
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

  // Board Wrapper
  board: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ebebeb',
    borderRadius: 8,
    width: '100%',
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  // Game Board view
  gameView: {
    width: '100%',
    alignItems: 'center',
  },
  questionText: {
    fontFamily: 'Georgia',
    fontSize: 34,
    fontWeight: '700',
    color: '#0d0d0d',
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  optBtn: {
    width: '45%',
    backgroundColor: '#0d0d0d',
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: 'center',
  },
  optText: {
    fontFamily: 'Georgia',
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },

  // Intro / Splash View
  splashView: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  introBox: {
    alignItems: 'center',
  },
  introHeader: {
    fontFamily: 'Georgia',
    fontSize: 28,
    fontWeight: '700',
    color: '#0d0d0d',
    marginBottom: 8,
  },
  introText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  gameOverBox: {
    alignItems: 'center',
  },
  gameOverHeader: {
    fontFamily: 'Georgia',
    fontSize: 24,
    fontWeight: '700',
    color: '#e63946',
    marginBottom: 4,
  },
  gameOverSub: {
    fontFamily: 'Georgia',
    fontSize: 15,
    color: '#888',
    marginBottom: 24,
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
