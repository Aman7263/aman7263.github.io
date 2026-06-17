import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const DiceRoller = () => {
  const [diceCount, setDiceCount] = useState(2);
  const [diceValues, setDiceValues] = useState([5, 5]);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState([]);
  const [totalSum, setTotalSum] = useState(12);

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);

    let rollsLeft = 10;
    const interval = setInterval(() => {
      setDiceValues(
        Array(diceCount)
          .fill(0)
          .map(() => Math.floor(Math.random() * 6))
      );
      rollsLeft--;
      if (rollsLeft <= 0) {
        clearInterval(interval);
        finalizeRoll();
      }
    }, 60);
  };

  const finalizeRoll = () => {
    const finalRolls = Array(diceCount)
      .fill(0)
      .map(() => Math.floor(Math.random() * 6));
    setDiceValues(finalRolls);

    const sum = finalRolls.reduce((a, b) => a + b + 1, 0);
    setTotalSum(sum);

    const faceList = finalRolls.map((v) => DICE_FACES[v]).join(' ');
    const isDouble = diceCount === 2 && finalRolls[0] === finalRolls[1];

    setHistory((prev) => [
      {
        id: Date.now().toString(),
        summary: `Rolled: ${faceList} (Sum: ${sum})${isDouble ? ' - DOUBLE!' : ''}`,
        color: isDouble ? '#e63946' : '#2b2d42',
      },
      ...prev.slice(0, 4),
    ]);

    setIsRolling(false);
  };

  return (
    <View style={styles.container}>
      {/* Selector */}
      <View style={styles.diceCountRow}>
        <TouchableOpacity
          style={[styles.countBtn, diceCount === 1 && styles.countBtnActive]}
          onPress={() => { if (!isRolling) { setDiceCount(1); setDiceValues([3]); setTotalSum(4); } }}
        >
          <Text style={[styles.countBtnText, diceCount === 1 && styles.countBtnTextActive]}>1 Die</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.countBtn, diceCount === 2 && styles.countBtnActive]}
          onPress={() => { if (!isRolling) { setDiceCount(2); setDiceValues([5, 5]); setTotalSum(12); } }}
        >
          <Text style={[styles.countBtnText, diceCount === 2 && styles.countBtnTextActive]}>2 Dice</Text>
        </TouchableOpacity>
      </View>

      {/* Board */}
      <View style={styles.board}>
        <View style={styles.diceRow}>
          {diceValues.map((v, i) => (
            <Text key={i} style={[styles.dieFace, isRolling && styles.dieFaceRolling]}>
              {DICE_FACES[v]}
            </Text>
          ))}
        </View>
        <Text style={styles.sumText}>
          {isRolling ? 'Rolling...' : `Total Sum: ${totalSum}`}
        </Text>
        {diceCount === 2 && !isRolling && diceValues[0] === diceValues[1] && (
          <Text style={styles.doubleText}>🎉 DOUBLES!</Text>
        )}
      </View>

      {/* Roll Button */}
      <TouchableOpacity
        style={[styles.btnRoll, isRolling && styles.btnRollDisabled]}
        onPress={rollDice}
        disabled={isRolling}
      >
        <Text style={styles.btnRollText}>ROLL DICE</Text>
      </TouchableOpacity>

      {/* History */}
      <View style={styles.historySection}>
        <Text style={styles.historyHeader}>Recent Rolls</Text>
        {history.length > 0 ? (
          history.map((h) => (
            <View key={h.id} style={styles.historyRow}>
              <View style={[styles.historyIndicator, { backgroundColor: h.color }]} />
              <Text style={styles.historyText}>{h.summary}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.historyEmpty}>No rolls yet.</Text>
        )}
      </View>
    </View>
  );
};

export default DiceRoller;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  diceCountRow: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 4,
    padding: 3,
    marginBottom: 20,
    width: '100%',
  },
  countBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 2,
  },
  countBtnActive: {
    backgroundColor: '#0d0d0d',
  },
  countBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
  },
  countBtnTextActive: {
    color: '#fff',
  },

  // Dice board
  board: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ebebeb',
    borderRadius: 8,
    width: '100%',
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  diceRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  dieFace: {
    fontSize: 72,
    color: '#0d0d0d',
  },
  dieFaceRolling: {
    opacity: 0.5,
  },
  sumText: {
    fontFamily: 'Georgia',
    fontSize: 16,
    fontWeight: '700',
    color: '#0d0d0d',
  },
  doubleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#e63946',
    letterSpacing: 1.5,
    marginTop: 4,
  },

  // Roll button
  btnRoll: {
    backgroundColor: '#0d0d0d',
    borderRadius: 2,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  btnRollDisabled: {
    opacity: 0.6,
  },
  btnRollText: {
    fontFamily: 'Georgia',
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },

  // History
  historySection: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#ebebeb',
    paddingTop: 16,
  },
  historyHeader: {
    fontFamily: 'Georgia',
    fontSize: 12,
    fontWeight: '700',
    color: '#0d0d0d',
    marginBottom: 8,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  historyIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  historyText: {
    fontSize: 11,
    color: '#555',
    fontWeight: '600',
  },
  historyEmpty: {
    fontSize: 11,
    color: '#aaa',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
});
