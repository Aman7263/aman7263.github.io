import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

const CoinFlip = () => {
  const [guess, setGuess] = useState('Heads'); // Heads or Tails
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState(null);
  const [scores, setScores] = useState({ wins: 0, losses: 0 });
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState('Guess & Flip the Coin!');

  const spinAnim = useState(new Animated.Value(0))[0];

  const startFlip = () => {
    if (flipping) return;
    setFlipping(true);
    setResult(null);
    setFeedback('Flipping...');

    // Animate rotation
    spinAnim.setValue(0);
    Animated.timing(spinAnim, {
      toValue: 8, // Multiple spins
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      finalizeFlip();
    });
  };

  const finalizeFlip = () => {
    const outcome = Math.random() < 0.5 ? 'Heads' : 'Tails';
    setResult(outcome);

    const won = guess === outcome;
    if (won) {
      setScores((prev) => ({ ...prev, wins: prev.wins + 1 }));
      setStreak((prev) => prev + 1);
      setFeedback(`🎉 Correct! It landed on ${outcome}!`);
    } else {
      setScores((prev) => ({ ...prev, losses: prev.losses + 1 }));
      setStreak(0);
      setFeedback(`😢 Incorrect! It landed on ${outcome}.`);
    }

    setFlipping(false);
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    outputRange: ['0deg', '180deg', '360deg', '540deg', '720deg', '900deg', '1080deg', '1260deg', '1440deg'],
  });

  return (
    <View style={styles.container}>
      {/* Scoreboard */}
      <View style={styles.scoresRow}>
        <View style={styles.scoreBox}>
          <Text style={[styles.scoreLabel, { color: '#2a9d8f' }]}>WINS</Text>
          <Text style={styles.scoreNum}>{scores.wins}</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>STREAK</Text>
          <Text style={[styles.scoreNum, { color: '#f4a261' }]}>{streak}</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreBox}>
          <Text style={[styles.scoreLabel, { color: '#e63946' }]}>LOSSES</Text>
          <Text style={styles.scoreNum}>{scores.losses}</Text>
        </View>
      </View>

      {/* Coin Display */}
      <View style={styles.coinStage}>
        <Animated.View style={[styles.coin, { transform: [{ rotateY: spin }] }]}>
          <View style={styles.coinFace}>
            <Text style={styles.coinText}>
              {result ? (result === 'Heads' ? '🪙 H' : '🪙 T') : '🪙'}
            </Text>
          </View>
        </Animated.View>
        <Text style={styles.feedbackText}>{feedback}</Text>
      </View>

      {/* Guess Selector */}
      <View style={styles.selectorRow}>
        <TouchableOpacity
          style={[styles.selectBtn, guess === 'Heads' && styles.selectBtnActive]}
          onPress={() => { if (!flipping) setGuess('Heads'); }}
          disabled={flipping}
        >
          <Text style={[styles.selectBtnText, guess === 'Heads' && styles.selectBtnTextActive]}>Heads</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.selectBtn, guess === 'Tails' && styles.selectBtnActive]}
          onPress={() => { if (!flipping) setGuess('Tails'); }}
          disabled={flipping}
        >
          <Text style={[styles.selectBtnText, guess === 'Tails' && styles.selectBtnTextActive]}>Tails</Text>
        </TouchableOpacity>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={[styles.btnFlip, flipping && styles.btnFlipDisabled]}
        onPress={startFlip}
        disabled={flipping}
      >
        <Text style={styles.btnFlipText}>FLIP COIN</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CoinFlip;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },

  // Scores Row
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
  coinStage: {
    alignItems: 'center',
    marginBottom: 24,
  },
  coin: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#d4af37', // Gold coin color
    borderWidth: 5,
    borderColor: '#b8860b',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    marginBottom: 16,
  },
  coinFace: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinText: {
    fontFamily: 'Georgia',
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  feedbackText: {
    fontFamily: 'Georgia',
    fontSize: 15,
    fontWeight: '700',
    color: '#0d0d0d',
    textAlign: 'center',
  },

  // Guess Picker
  selectorRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 20,
  },
  selectBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#0d0d0d',
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectBtnActive: {
    backgroundColor: '#0d0d0d',
  },
  selectBtnText: {
    fontFamily: 'Georgia',
    fontSize: 13,
    fontWeight: '700',
    color: '#0d0d0d',
  },
  selectBtnTextActive: {
    color: '#fff',
  },

  // Flip Action Button
  btnFlip: {
    backgroundColor: '#0d0d0d',
    borderRadius: 2,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  btnFlipDisabled: {
    opacity: 0.6,
  },
  btnFlipText: {
    fontFamily: 'Georgia',
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
});
