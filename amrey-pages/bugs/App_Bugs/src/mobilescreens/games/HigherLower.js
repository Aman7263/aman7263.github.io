import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const SUITS = [
  { name: 'Hearts', char: '♥️', color: '#e63946' },
  { name: 'Diamonds', char: '♦️', color: '#e63946' },
  { name: 'Clubs', char: '♣️', color: '#0d0d0d' },
  { name: 'Spades', char: '♠️', color: '#0d0d0d' }
];

const CARD_VALUES = [
  { name: '2', value: 2 },
  { name: '3', value: 3 },
  { name: '4', value: 4 },
  { name: '5', value: 5 },
  { name: '6', value: 6 },
  { name: '7', value: 7 },
  { name: '8', value: 8 },
  { name: '9', value: 9 },
  { name: '10', value: 10 },
  { name: 'J', value: 11 },
  { name: 'Q', value: 12 },
  { name: 'K', value: 13 },
  { name: 'A', value: 14 }
];

const HigherLower = () => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [currentCard, setCurrentCard] = useState(null);
  const [feedback, setFeedback] = useState('Will the next card be higher or lower?');
  const [lastDraw, setLastDraw] = useState(null); // 'correct', 'incorrect', 'equal'

  const getRandomCard = () => {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const valObj = CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)];
    return {
      suit: suit.char,
      color: suit.color,
      name: valObj.name,
      value: valObj.value
    };
  };

  useEffect(() => {
    setCurrentCard(getRandomCard());
  }, []);

  const makeGuess = (guessType) => {
    if (!currentCard) return;

    const nextCard = getRandomCard();
    const curVal = currentCard.value;
    const nextVal = nextCard.value;

    let result = '';
    if (nextVal === curVal) {
      result = 'equal';
      setFeedback(`Draw! Both were ${nextCard.name}s. Score is safe!`);
    } else if (
      (guessType === 'higher' && nextVal > curVal) ||
      (guessType === 'lower' && nextVal < curVal)
    ) {
      result = 'correct';
      const nextScore = score + 1;
      setScore(nextScore);
      if (nextScore > highScore) setHighScore(nextScore);
      setFeedback(`🎉 Correct! Next was ${nextCard.name} of ${nextCard.suit}.`);
    } else {
      result = 'incorrect';
      setScore(0);
      setFeedback(`😢 Incorrect! Next was ${nextCard.name} of ${nextCard.suit}.`);
    }

    setLastDraw(result);
    setCurrentCard(nextCard);
  };

  return (
    <View style={styles.container}>
      {/* Scoreboard */}
      <View style={styles.scoresRow}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>STREAK</Text>
          <Text style={[styles.scoreNum, { color: '#f4a261' }]}>{score}</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>BEST STREAK</Text>
          <Text style={[styles.scoreNum, { color: '#2a9d8f' }]}>{highScore}</Text>
        </View>
      </View>

      {/* Stage */}
      <View style={styles.stage}>
        <Text style={[
          styles.feedbackText,
          lastDraw === 'correct' && { color: '#2a9d8f' },
          lastDraw === 'incorrect' && { color: '#e63946' }
        ]}>
          {feedback}
        </Text>

        {/* Card Canvas */}
        {currentCard && (
          <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardCornerText, { color: currentCard.color }]}>
                {currentCard.name}
              </Text>
              <Text style={[styles.cardCornerSuit, { color: currentCard.color }]}>
                {currentCard.suit}
              </Text>
            </View>
            <View style={styles.cardCenter}>
              <Text style={[styles.cardCenterSuit, { color: currentCard.color }]}>
                {currentCard.suit}
              </Text>
            </View>
            <View style={styles.cardFooter}>
              <Text style={[styles.cardCornerSuit, { color: currentCard.color }]}>
                {currentCard.suit}
              </Text>
              <Text style={[styles.cardCornerText, { color: currentCard.color }]}>
                {currentCard.name}
              </Text>
            </View>
          </View>
        )}

        {/* Guess Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.btnGuess, styles.btnHigher]}
            onPress={() => makeGuess('higher')}
          >
            <Text style={styles.btnGuessText}>HIGHER ⬆️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnGuess, styles.btnLower]}
            onPress={() => makeGuess('lower')}
          >
            <Text style={styles.btnGuessTextLower}>LOWER ⬇️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default HigherLower;

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
  feedbackText: {
    fontFamily: 'Georgia',
    fontSize: 13,
    fontWeight: '700',
    color: '#0d0d0d',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  cardContainer: {
    width: 120,
    height: 180,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0d0d0d',
    padding: 10,
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCornerText: {
    fontFamily: 'Georgia',
    fontSize: 16,
    fontWeight: '800',
  },
  cardCornerSuit: {
    fontSize: 14,
  },
  cardCenter: {
    alignSelf: 'center',
  },
  cardCenterSuit: {
    fontSize: 54,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    transform: [{ rotate: '180deg' }],
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btnGuess: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 2,
    alignItems: 'center',
  },
  btnHigher: {
    backgroundColor: '#0d0d0d',
  },
  btnLower: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0d0d0d',
  },
  btnGuessText: {
    fontFamily: 'Georgia',
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  btnGuessTextLower: {
    fontFamily: 'Georgia',
    fontSize: 11,
    fontWeight: '700',
    color: '#0d0d0d',
    letterSpacing: 1,
  },
});

