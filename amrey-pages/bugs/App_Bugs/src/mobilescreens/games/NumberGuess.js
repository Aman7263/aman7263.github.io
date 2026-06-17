import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard, Alert } from 'react-native';

const NumberGuess = () => {
  const [targetNumber, setTargetNumber] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [inputVal, setInputVal] = useState('');
  const [feedback, setFeedback] = useState('Guess a number between 1 and 100!');
  const [attempts, setAttempts] = useState([]);
  const [bestScore, setBestScore] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const handleGuess = () => {
    Keyboard.dismiss();
    const num = parseInt(inputVal, 10);

    if (isNaN(num) || num < 1 || num > 100) {
      Alert.alert('Invalid Entry', 'Please enter a whole number between 1 and 100.');
      return;
    }

    const nextAttempts = [...attempts, num];
    setAttempts(nextAttempts);
    setInputVal('');

    if (num === targetNumber) {
      setFeedback(`🎉 Correct! It was ${targetNumber}!`);
      setGameOver(true);
      
      const currentScore = nextAttempts.length;
      if (bestScore === null || currentScore < bestScore) {
        setBestScore(currentScore);
      }
    } else if (num < targetNumber) {
      setFeedback('📈 Too Low! Try a higher number.');
    } else {
      setFeedback('📉 Too High! Try a lower number.');
    }
  };

  const resetGame = () => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
    setAttempts([]);
    setFeedback('Guess a number between 1 and 100!');
    setInputVal('');
    setGameOver(false);
  };

  return (
    <View style={styles.container}>
      {/* Scoreboard */}
      <View style={styles.scoresRow}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>ATTEMPTS</Text>
          <Text style={styles.scoreNum}>{attempts.length}</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>BEST SCORE</Text>
          <Text style={[styles.scoreNum, { color: '#2a9d8f' }]}>
            {bestScore !== null ? `${bestScore} guesses` : 'N/A'}
          </Text>
        </View>
      </View>

      {/* Game Feedback Banner */}
      <View style={styles.statusBanner}>
        <Text style={styles.statusText}>{feedback}</Text>
      </View>

      {/* Interactive Input Form */}
      {!gameOver ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputVal}
            onChangeText={setInputVal}
            keyboardType="number-pad"
            maxLength={3}
            placeholder="50"
            placeholderTextColor="#888"
            onSubmitEditing={handleGuess}
          />
          <TouchableOpacity style={styles.btnGuess} onPress={handleGuess}>
            <Text style={styles.btnGuessText}>Guess</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.btnPlayAgain} onPress={resetGame}>
          <Text style={styles.btnPlayAgainText}>Play Again</Text>
        </TouchableOpacity>
      )}

      {/* Attempts Log */}
      {attempts.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.historyHeader}>Your Attempts</Text>
          <Text style={styles.historyText}>{attempts.join(' → ')}</Text>
        </View>
      )}

      {/* Helper Tips */}
      <View style={styles.tipsBox}>
        <Text style={styles.tipsText}>
          Tip: Use binary search! Start at 50, then half the remaining range (25 or 75) based on the feedback.
        </Text>
      </View>
    </View>
  );
};

export default NumberGuess;

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

  // Banner
  statusBanner: {
    marginBottom: 20,
    minHeight: 40,
    justifyContent: 'center',
  },
  statusText: {
    fontFamily: 'Georgia',
    fontSize: 15,
    fontWeight: '700',
    color: '#0d0d0d',
    textAlign: 'center',
  },

  // Form Input
  inputContainer: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ebebeb',
    borderRadius: 4,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '700',
    color: '#0d0d0d',
    fontFamily: 'Georgia',
    height: 48,
  },
  btnGuess: {
    backgroundColor: '#0d0d0d',
    borderRadius: 4,
    paddingHorizontal: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGuessText: {
    fontFamily: 'Georgia',
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },

  btnPlayAgain: {
    backgroundColor: '#2a9d8f',
    borderRadius: 4,
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  btnPlayAgainText: {
    fontFamily: 'Georgia',
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },

  // History
  historySection: {
    width: '100%',
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#ebebeb',
    paddingTop: 14,
  },
  historyHeader: {
    fontFamily: 'Georgia',
    fontSize: 12,
    fontWeight: '700',
    color: '#0d0d0d',
    marginBottom: 6,
  },
  historyText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '700',
    lineHeight: 18,
  },

  // Tips Box
  tipsBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    width: '100%',
  },
  tipsText: {
    fontSize: 11,
    color: '#888',
    lineHeight: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
