import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const CHOICES = [
  { name: 'Rock', emoji: '🪨' },
  { name: 'Paper', emoji: '📄' },
  { name: 'Scissors', emoji: '✂️' },
];

const RockPaperScissors = () => {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [cpuChoice, setCpuChoice] = useState(null);
  const [result, setResult] = useState('Choose to play!');
  const [scores, setScores] = useState({ wins: 0, losses: 0, draws: 0 });
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState([]);

  const getWinner = (player, cpu) => {
    if (player === cpu) return 'Draw';
    if (
      (player === 'Rock' && cpu === 'Scissors') ||
      (player === 'Paper' && cpu === 'Rock') ||
      (player === 'Scissors' && cpu === 'Paper')
    ) {
      return 'Player';
    }
    return 'CPU';
  };

  const handleChoice = (choiceName) => {
    const player = choiceName;
    const randomIndex = Math.floor(Math.random() * CHOICES.length);
    const cpu = CHOICES[randomIndex].name;

    setPlayerChoice(player);
    setCpuChoice(cpu);

    const winner = getWinner(player, cpu);
    let roundResult = '';

    if (winner === 'Draw') {
      roundResult = `It's a draw! Both chose ${player}`;
      setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
    } else if (winner === 'Player') {
      roundResult = `You Win! ${player} beats ${cpu}`;
      setScores((prev) => ({ ...prev, wins: prev.wins + 1 }));
      setStreak((prev) => prev + 1);
    } else {
      roundResult = `CPU Wins! ${cpu} beats ${player}`;
      setScores((prev) => ({ ...prev, losses: prev.losses + 1 }));
      setStreak(0);
    }

    setResult(roundResult);
    
    // Save history
    setHistory((prev) => [
      {
        id: Date.now().toString(),
        summary: `${player} vs ${cpu} - ${winner === 'Draw' ? 'Draw' : winner === 'Player' ? 'Win' : 'Loss'}`,
        color: winner === 'Player' ? '#2a9d8f' : winner === 'CPU' ? '#e63946' : '#888',
      },
      ...prev.slice(0, 4), // Keep last 5 rounds
    ]);
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setCpuChoice(null);
    setResult('Choose to play!');
    setScores({ wins: 0, losses: 0, draws: 0 });
    setStreak(0);
    setHistory([]);
  };

  const getChoiceEmoji = (name) => {
    return CHOICES.find((c) => c.name === name)?.emoji || '';
  };

  return (
    <View style={styles.container}>
      {/* Scoreboard */}
      <View style={styles.scoresRow}>
        <View style={styles.scoreBox}>
          <Text style={[styles.scoreLabel, { color: '#2a9d8f' }]}>YOU</Text>
          <Text style={styles.scoreNum}>{scores.wins}</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>STREAK</Text>
          <Text style={[styles.scoreNum, { color: '#f4a261' }]}>{streak}</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreBox}>
          <Text style={[styles.scoreLabel, { color: '#e63946' }]}>CPU</Text>
          <Text style={styles.scoreNum}>{scores.losses}</Text>
        </View>
      </View>

      {/* Choice display */}
      <View style={styles.vsRow}>
        <View style={styles.choiceBox}>
          <Text style={styles.choiceLabel}>You</Text>
          {playerChoice ? (
            <Text style={styles.choiceEmoji}>{getChoiceEmoji(playerChoice)}</Text>
          ) : (
            <Text style={styles.choicePlaceholder}>?</Text>
          )}
        </View>
        <Text style={styles.vsLabel}>VS</Text>
        <View style={styles.choiceBox}>
          <Text style={styles.choiceLabel}>CPU</Text>
          {cpuChoice ? (
            <Text style={styles.choiceEmoji}>{getChoiceEmoji(cpuChoice)}</Text>
          ) : (
            <Text style={styles.choicePlaceholder}>?</Text>
          )}
        </View>
      </View>

      {/* Game Status Banner */}
      <View style={styles.statusBanner}>
        <Text style={styles.statusText}>{result}</Text>
      </View>

      {/* Option Buttons */}
      <View style={styles.optionsRow}>
        {CHOICES.map((choice) => (
          <TouchableOpacity
            key={choice.name}
            style={styles.optionBtn}
            onPress={() => handleChoice(choice.name)}
            activeOpacity={0.7}
          >
            <Text style={styles.optionEmoji}>{choice.emoji}</Text>
            <Text style={styles.optionLabel}>{choice.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* History */}
      {history.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.historyHeader}>Recent Rounds</Text>
          {history.map((item) => (
            <View key={item.id} style={styles.historyRow}>
              <View style={[styles.historyIndicator, { backgroundColor: item.color }]} />
              <Text style={styles.historyText}>{item.summary}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Reset */}
      <TouchableOpacity style={styles.btnReset} onPress={resetGame}>
        <Text style={styles.btnText}>Reset Stats</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RockPaperScissors;

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

  // VS Area
  vsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 16,
  },
  choiceBox: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ebebeb',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  choiceEmoji: {
    fontSize: 32,
  },
  choicePlaceholder: {
    fontSize: 28,
    color: '#ccc',
    fontFamily: 'Georgia',
  },
  vsLabel: {
    fontFamily: 'Georgia',
    fontSize: 18,
    fontWeight: '700',
    color: '#888',
  },

  // Banner
  statusBanner: {
    marginBottom: 22,
  },
  statusText: {
    fontFamily: 'Georgia',
    fontSize: 15,
    fontWeight: '700',
    color: '#0d0d0d',
    textAlign: 'center',
  },

  // Options
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  optionBtn: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 84,
  },
  optionEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  optionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },

  // History
  historySection: {
    width: '100%',
    marginBottom: 20,
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
    letterSpacing: 0.5,
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

  // Reset
  btnReset: {
    borderWidth: 2,
    borderColor: '#0d0d0d',
    borderRadius: 2,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  btnText: {
    fontFamily: 'Georgia',
    fontSize: 13,
    fontWeight: '700',
    color: '#0d0d0d',
  },
});
