import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const WORDS_POOL = [
  'REACT', 'NATIVE', 'EXPO', 'MOBILE', 'DEVICE',
  'SCREEN', 'CODING', 'CONSOLE', 'STYLING', 'ENGINE',
  'ROUTING', 'STATE', 'EFFECT', 'CONTEXT', 'PORTAL'
];

const WordScramble = () => {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  
  const [originalWord, setOriginalWord] = useState('');
  const [scrambledLetters, setScrambledLetters] = useState([]); // array of { char: string, id: number }
  const [selectedIndices, setSelectedIndices] = useState([]); // indices in scrambledLetters
  const [feedback, setFeedback] = useState('Unscramble the word!');
  const [isCorrect, setIsCorrect] = useState(null); // boolean or null

  const scramble = (word) => {
    const arr = word.split('');
    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // Ensure it's not identical to original
    if (arr.join('') === word && word.length > 3) {
      return scramble(word);
    }
    return arr;
  };

  const loadNewWord = () => {
    const word = WORDS_POOL[Math.floor(Math.random() * WORDS_POOL.length)];
    setOriginalWord(word);
    const letterObjs = scramble(word).map((char, index) => ({ char, id: index }));
    setScrambledLetters(letterObjs);
    setSelectedIndices([]);
    setIsCorrect(null);
  };

  useEffect(() => {
    loadNewWord();
  }, []);

  const handleLetterTap = (index) => {
    if (isCorrect) return;
    
    // Toggle letter selection
    if (selectedIndices.includes(index)) {
      setSelectedIndices((prev) => prev.filter((i) => i !== index));
    } else {
      setSelectedIndices((prev) => [...prev, index]);
    }
  };

  // Construct current guess
  const guess = selectedIndices.map((i) => scrambledLetters[i].char).join('');

  useEffect(() => {
    if (guess.length > 0 && guess.length === originalWord.length) {
      if (guess === originalWord) {
        setIsCorrect(true);
        setScore((prev) => prev + 1);
        setStreak((prev) => {
          const next = prev + 1;
          if (next > bestStreak) setBestStreak(next);
          return next;
        });
        setFeedback('🎉 Correct! Awesome job!');
      } else {
        setIsCorrect(false);
        setStreak(0);
        setFeedback('❌ Incorrect guess. Try again!');
      }
    } else if (guess.length > 0) {
      setFeedback('Spelling word...');
      setIsCorrect(null);
    } else {
      setFeedback('Unscramble the word!');
      setIsCorrect(null);
    }
  }, [guess, originalWord]);

  const clearSelection = () => {
    if (isCorrect) return;
    setSelectedIndices([]);
  };

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
          <Text style={styles.scoreLabel}>BEST STREAK</Text>
          <Text style={[styles.scoreNum, { color: '#2a9d8f' }]}>{bestStreak}</Text>
        </View>
      </View>

      {/* Stage */}
      <View style={styles.stage}>
        <Text style={styles.feedbackText}>{feedback}</Text>

        {/* Guess Output */}
        <View style={styles.guessRow}>
          {originalWord.split('').map((_, i) => {
            const letter = guess[i] || '';
            return (
              <View key={i} style={[styles.guessSlot, letter ? styles.guessSlotActive : null]}>
                <Text style={styles.guessLetter}>{letter}</Text>
              </View>
            );
          })}
        </View>

        {/* Scrambled Buttons */}
        <View style={styles.buttonsRow}>
          {scrambledLetters.map((item) => {
            const isSelected = selectedIndices.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.letterBtn, isSelected ? styles.letterBtnSelected : null]}
                onPress={() => handleLetterTap(item.id)}
                disabled={isCorrect}
              >
                <Text style={[styles.letterBtnText, isSelected ? styles.letterBtnTextSelected : null]}>
                  {item.char}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Control Actions */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.clearBtn]}
            onPress={clearSelection}
            disabled={isCorrect || selectedIndices.length === 0}
          >
            <Text style={styles.clearBtnText}>CLEAR</Text>
          </TouchableOpacity>
          
          {isCorrect !== null && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.nextBtn]}
              onPress={loadNewWord}
            >
              <Text style={styles.nextBtnText}>{isCorrect ? 'NEXT WORD' : 'RESET WORD'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default WordScramble;

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
  feedbackText: {
    fontFamily: 'Georgia',
    fontSize: 16,
    fontWeight: '700',
    color: '#0d0d0d',
    textAlign: 'center',
    marginBottom: 20,
  },
  guessRow: {
    flexDirection: 'row',
    marginBottom: 24,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  guessSlot: {
    width: 34,
    height: 40,
    borderBottomWidth: 3,
    borderBottomColor: '#ebebeb',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  guessSlotActive: {
    borderBottomColor: '#0d0d0d',
  },
  guessLetter: {
    fontFamily: 'Georgia',
    fontSize: 22,
    fontWeight: '800',
    color: '#0d0d0d',
  },
  buttonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
  },
  letterBtn: {
    width: 44,
    height: 44,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#0d0d0d',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    margin: 4,
  },
  letterBtnSelected: {
    backgroundColor: '#0d0d0d',
    opacity: 0.3,
  },
  letterBtnText: {
    fontFamily: 'Georgia',
    fontSize: 18,
    fontWeight: '800',
    color: '#0d0d0d',
  },
  letterBtnTextSelected: {
    color: '#fff',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    borderRadius: 2,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtn: {
    borderWidth: 2,
    borderColor: '#0d0d0d',
  },
  clearBtnText: {
    fontFamily: 'Georgia',
    fontSize: 12,
    fontWeight: '700',
    color: '#0d0d0d',
  },
  nextBtn: {
    backgroundColor: '#0d0d0d',
  },
  nextBtnText: {
    fontFamily: 'Georgia',
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
});
