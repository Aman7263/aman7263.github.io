import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

const CARD_ITEMS = ['🦊', '🐨', '🐯', '🦁', '🐼', '🐷'];

const MemoryMatch = () => {
  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [wins, setWins] = useState(0);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Duplicate items, shuffle, and reset states
    const items = [...CARD_ITEMS, ...CARD_ITEMS];
    const shuffled = items
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    setCards(shuffled);
    setSelected([]);
    setMatched([]);
    setMoves(0);
  };

  const handleCardPress = (index) => {
    // Ignore if already matched, already selected, or 2 cards are already open
    if (matched.includes(index) || selected.includes(index) || selected.length >= 2) return;

    const nextSelected = [...selected, index];
    setSelected(nextSelected);

    if (nextSelected.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstIdx, secondIdx] = nextSelected;

      // Check for match
      if (cards[firstIdx] === cards[secondIdx]) {
        const nextMatched = [...matched, firstIdx, secondIdx];
        setMatched(nextMatched);
        setSelected([]);

        // Game Won check
        if (nextMatched.length === cards.length) {
          setWins((prev) => prev + 1);
        }
      } else {
        // Flip back after delay
        setTimeout(() => {
          setSelected([]);
        }, 1000);
      }
    }
  };

  const renderCard = (index) => {
    const isSelected = selected.includes(index);
    const isMatched = matched.includes(index);
    const isOpen = isSelected || isMatched;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.card,
          isOpen ? styles.cardOpen : styles.cardClosed,
          isMatched && styles.cardMatched,
        ]}
        onPress={() => handleCardPress(index)}
        activeOpacity={0.75}
      >
        {isOpen ? (
          <Text style={styles.cardEmoji}>{cards[index]}</Text>
        ) : (
          <Text style={styles.cardBackSymbol}>?</Text>
        )}
      </TouchableOpacity>
    );
  };

  const hasWon = cards.length > 0 && matched.length === cards.length;

  return (
    <View style={styles.container}>
      {/* Score and Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>MOVES</Text>
          <Text style={styles.statNum}>{moves}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>MATCHED</Text>
          <Text style={styles.statNum}>{matched.length / 2} / 6</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>TOTAL WINS</Text>
          <Text style={styles.statNum}>{wins}</Text>
        </View>
      </View>

      {/* Game Status Banner */}
      <View style={styles.statusBanner}>
        {hasWon ? (
          <Text style={[styles.statusText, { color: '#2a9d8f' }]}>🎉 Match Complete! You Won!</Text>
        ) : (
          <Text style={styles.statusText}>Find all matching animal pairs</Text>
        )}
      </View>

      {/* 4x3 Grid Board */}
      <View style={styles.grid}>
        {cards.length > 0 ? (
          Array(12)
            .fill(0)
            .map((_, idx) => renderCard(idx))
        ) : (
          <ActivityIndicator size="large" color="#0d0d0d" />
        )}
      </View>

      {/* Control Buttons */}
      <TouchableOpacity style={styles.btnReset} onPress={initializeGame}>
        <Text style={styles.btnText}>{hasWon ? 'Play Again' : 'Reset Grid'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MemoryMatch;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#0d0d0d',
    borderRadius: 4,
    width: '100%',
    paddingVertical: 14,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: '#aaa',
    fontWeight: '700',
    marginBottom: 4,
  },
  statNum: {
    fontFamily: 'Georgia',
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#333',
    marginVertical: 4,
  },

  // Status
  statusBanner: {
    marginBottom: 18,
  },
  statusText: {
    fontFamily: 'Georgia',
    fontSize: 15,
    fontWeight: '700',
    color: '#0d0d0d',
  },

  // Cards Grid (4 columns, 3 rows)
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 290,
    justifyContent: 'center',
    marginBottom: 24,
  },
  card: {
    width: 62,
    height: 78,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    margin: 5,
  },
  cardClosed: {
    backgroundColor: '#0d0d0d',
    borderColor: '#333',
  },
  cardOpen: {
    backgroundColor: '#fff',
    borderColor: '#e63946',
  },
  cardMatched: {
    borderColor: '#2a9d8f',
    backgroundColor: '#f5f5f5',
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardBackSymbol: {
    fontSize: 24,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: '#fff',
  },

  // Reset Button
  btnReset: {
    backgroundColor: '#0d0d0d',
    borderRadius: 2,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  btnText: {
    fontFamily: 'Georgia',
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
});
