import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const GAME_DURATION = 15;

const COLOR_NAMES = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
const COLOR_CODES = [
  '#e63946', // Red
  '#3f37c9', // Blue
  '#2a9d8f', // Green
  '#ffb703'  // Yellow
];

const StroopEffect = () => {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameState, setGameState] = useState('idle'); // idle, playing, over
  
  const [wordIdx, setWordIdx] = useState(0);
  const [colorIdx, setColorIdx] = useState(0);
  const [feedback, setFeedback] = useState('Tap Yes if color matches the word!');

  const timerRef = useRef(null);

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setTimeLeft(GAME_DURATION);
    setGameState('playing');
    setFeedback('Go!');
    nextQuestion();
  };

  const nextQuestion = () => {
    // Generate new word and color
    const w = Math.floor(Math.random() * COLOR_NAMES.length);
    // 50% chance of matching to make it interesting
    const matches = Math.random() < 0.5;
    let c = w;
    if (!matches) {
      c = Math.floor(Math.random() * COLOR_CODES.length);
      while (c === w) {
        c = Math.floor(Math.random() * COLOR_CODES.length);
      }
    }
    setWordIdx(w);
    setColorIdx(c);
  };

  const handleAnswer = (userSaysMatches) => {
    if (gameState !== 'playing') return;

    const actuallyMatches = wordIdx === colorIdx;
    const isCorrect = userSaysMatches === actuallyMatches;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });
      setFeedback('🎉 Correct!');
    } else {
      setStreak(0);
      setFeedback('❌ Incorrect!');
    }
    nextQuestion();
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('over');
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
          <Text style={styles.scoreLabel}>BEST STREAK</Text>
          <Text style={[styles.scoreNum, { color: '#2a9d8f' }]}>{bestStreak}</Text>
        </View>
      </View>

      {/* Stage */}
      <View style={styles.stage}>
        {gameState === 'playing' ? (
          <View style={styles.gameArea}>
            <Text style={styles.questionText}>Does the font color match the word?</Text>
            
            {/* Word stage */}
            <View style={styles.wordBox}>
              <Text style={[styles.stroopWord, { color: COLOR_CODES[colorIdx] }]}>
                {COLOR_NAMES[wordIdx]}
              </Text>
            </View>

            <Text style={styles.feedbackText}>{feedback}</Text>

            {/* Answer buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.btnAnswer, styles.btnYes]}
                onPress={() => handleAnswer(true)}
              >
                <Text style={styles.btnYesText}>YES ✅</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnAnswer, styles.btnNo]}
                onPress={() => handleAnswer(false)}
              >
                <Text style={styles.btnNoText}>NO ❌</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.overlay}>
            {gameState === 'idle' ? (
              <View style={styles.splashBox}>
                <Text style={styles.splashHeader}>Stroop Matcher</Text>
                <Text style={styles.splashText}>
                  Decide if the word's text matches the color it is printed in. Answer as many as possible in 15 seconds!
                </Text>
                <TouchableOpacity style={styles.btnAction} onPress={startGame}>
                  <Text style={styles.btnActionText}>START MATCH</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.splashBox}>
                <Text style={styles.resultHeader}>Finished!</Text>
                <Text style={styles.resultScore}>{score} Correct</Text>
                <Text style={styles.resultDetails}>Best streak: {bestStreak}</Text>
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

export default StroopEffect;

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
  questionText: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Georgia',
    marginBottom: 12,
  },
  wordBox: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stroopWord: {
    fontFamily: 'Georgia',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 1,
  },
  feedbackText: {
    fontFamily: 'Georgia',
    fontSize: 13,
    fontWeight: '700',
    color: '#0d0d0d',
    marginBottom: 20,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btnAnswer: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnYes: {
    backgroundColor: '#0d0d0d',
  },
  btnYesText: {
    fontFamily: 'Georgia',
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  btnNo: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0d0d0d',
  },
  btnNoText: {
    fontFamily: 'Georgia',
    fontSize: 12,
    fontWeight: '700',
    color: '#0d0d0d',
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
