import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

const GAME_DURATION = 15;
const WORDS = [
  'react', 'native', 'expo', 'javascript', 'antigravity',
  'developer', 'dashboard', 'component', 'stylesheet', 'terminal',
  'debugger', 'sandbox', 'workspace', 'mobile', 'interface'
];

const TypeFast = () => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameState, setGameState] = useState('idle'); // idle, playing, over
  
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');

  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setUserInput('');
    setGameState('playing');
    setCurrentWord(getRandomWord(''));
    // Focus input on next tick
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  };

  const getRandomWord = (exclude) => {
    const filtered = WORDS.filter((w) => w !== exclude);
    return filtered[Math.floor(Math.random() * filtered.length)];
  };

  const handleInputChange = (text) => {
    setUserInput(text);
    if (text.trim().toLowerCase() === currentWord.toLowerCase()) {
      setScore((prev) => prev + 1);
      setUserInput('');
      setCurrentWord(getRandomWord(currentWord));
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
          <Text style={styles.scoreLabel}>WORDS</Text>
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
            <Text style={styles.instruction}>Type this word:</Text>
            <Text style={styles.wordDisplay}>{currentWord}</Text>

            <TextInput
              ref={inputRef}
              style={styles.textInput}
              value={userInput}
              onChangeText={handleInputChange}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Type here..."
              placeholderTextColor="#ccc"
            />
          </View>
        ) : (
          <View style={styles.overlay}>
            {gameState === 'idle' ? (
              <View style={styles.splashBox}>
                <Text style={styles.splashHeader}>Type Fast</Text>
                <Text style={styles.splashText}>
                  Type as many words correctly as possible within 15 seconds!
                </Text>
                <TouchableOpacity style={styles.btnAction} onPress={startGame}>
                  <Text style={styles.btnActionText}>START TYPING</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.splashBox}>
                <Text style={styles.resultHeader}>Time's Up!</Text>
                <Text style={styles.resultScore}>{score} Words</Text>
                <Text style={styles.resultDetails}>You typed at {score * 4} WPM equivalent.</Text>
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

export default TypeFast;

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
  gameArea: {
    width: '100%',
    alignItems: 'center',
  },
  instruction: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  wordDisplay: {
    fontFamily: 'Georgia',
    fontSize: 36,
    fontWeight: '800',
    color: '#0d0d0d',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  textInput: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#0d0d0d',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontFamily: 'Georgia',
    color: '#0d0d0d',
    textAlign: 'center',
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
