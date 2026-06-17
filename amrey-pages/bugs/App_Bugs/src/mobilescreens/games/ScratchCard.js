import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const EMOJI_POOL = ['🍒', '🍋', '🍇', '🍊', '🍉', '💎'];

const ScratchCard = () => {
  const [wins, setWins] = useState(0);
  const [played, setPlayed] = useState(0);
  
  const [cards, setCards] = useState([]); // Array of { emoji: string, revealed: boolean }
  const [revealedCount, setRevealedCount] = useState(0);
  const [gameState, setGameState] = useState('idle'); // idle, playing, completed
  const [feedback, setFeedback] = useState('Scratch (tap) 6 cards to find 3 matching emojis!');
  const [matchingEmoji, setMatchingEmoji] = useState('');

  const generateCard = () => {
    // Generate 9 emoji slots.
    // To ensure there is a decent chance of winning, we randomly decide if this card is a "winning" card
    const isWinner = Math.random() < 0.45;
    let grid = [];

    if (isWinner) {
      // Pick a winning emoji and place 3 of them
      const winEmoji = EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
      grid = [winEmoji, winEmoji, winEmoji];
      
      // Fill the other 6 slots randomly
      while (grid.length < 9) {
        const randomEmoji = EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
        grid.push(randomEmoji);
      }
    } else {
      // Fill 9 slots completely randomly without guaranteeing any winning matches
      for (let i = 0; i < 9; i++) {
        grid.push(EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)]);
      }
    }

    // Shuffle the grid items
    for (let i = grid.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [grid[i], grid[j]] = [grid[j], grid[i]];
    }

    const cardObjs = grid.map((emoji, index) => ({
      id: index,
      emoji,
      revealed: false
    }));

    setCards(cardObjs);
    setRevealedCount(0);
    setGameState('playing');
    setMatchingEmoji('');
    setFeedback('Tap cells to scratch off the grey overlay...');
  };

  const handleScratch = (index) => {
    if (gameState !== 'playing' || cards[index].revealed) return;

    const newCards = [...cards];
    newCards[index].revealed = true;
    const nextRevealedCount = revealedCount + 1;
    
    setCards(newCards);
    setRevealedCount(nextRevealedCount);

    if (nextRevealedCount === 6) {
      evaluateCard(newCards);
    }
  };

  const evaluateCard = (currentCards) => {
    setPlayed((prev) => prev + 1);
    
    // Count occurrences of emojis in revealed cards
    const counts = {};
    let winner = null;

    currentCards.forEach((c) => {
      if (c.revealed) {
        counts[c.emoji] = (counts[c.emoji] || 0) + 1;
        if (counts[c.emoji] >= 3) {
          winner = c.emoji;
        }
      }
    });

    if (winner) {
      setWins((prev) => prev + 1);
      setMatchingEmoji(winner);
      setFeedback(`🎉 JACKPOT! You found 3 matching ${winner}s!`);
    } else {
      setFeedback('😢 No luck this card. Try another one!');
    }
    setGameState('completed');
  };

  return (
    <View style={styles.container}>
      {/* Scoreboard */}
      <View style={styles.scoresRow}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>CARDS WON</Text>
          <Text style={[styles.scoreNum, { color: '#2a9d8f' }]}>{wins}</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>CARDS PLAYED</Text>
          <Text style={styles.scoreNum}>{played}</Text>
        </View>
      </View>

      {/* Stage */}
      <View style={styles.stage}>
        {gameState === 'idle' ? (
          <View style={styles.splashBox}>
            <Text style={styles.splashHeader}>Scratch & Win</Text>
            <Text style={styles.splashText}>
              Buy a ticket, scratch off exactly 6 panels, and try to match 3 emojis to win!
            </Text>
            <TouchableOpacity style={styles.btnAction} onPress={generateCard}>
              <Text style={styles.btnActionText}>NEW TICKET</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.gameArea}>
            <Text style={styles.feedbackText}>{feedback}</Text>

            {/* Grid */}
            <View style={styles.grid}>
              {cards.map((card, idx) => {
                const isScrached = card.revealed;
                return (
                  <TouchableOpacity
                    key={card.id}
                    style={[
                      styles.gridCell,
                      isScrached ? styles.cellRevealed : styles.cellHidden,
                      card.emoji === matchingEmoji && styles.cellHighlight
                    ]}
                    onPress={() => handleScratch(idx)}
                    disabled={gameState !== 'playing' || isScrached}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cellText}>
                      {isScrached ? card.emoji : '❔'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {gameState === 'completed' && (
              <TouchableOpacity style={styles.btnAction} onPress={generateCard}>
                <Text style={styles.btnActionText}>PLAY NEXT TICKET</Text>
              </TouchableOpacity>
            )}

            {gameState === 'playing' && (
              <Text style={styles.scratchedText}>
                Scratched: {revealedCount} / 6
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default ScratchCard;

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
    minHeight: 290,
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
  feedbackText: {
    fontFamily: 'Georgia',
    fontSize: 13,
    fontWeight: '700',
    color: '#0d0d0d',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
    lineHeight: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 216,
    height: 216,
    justifyContent: 'center',
    alignContent: 'center',
    marginBottom: 16,
  },
  gridCell: {
    width: 66,
    height: 66,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    margin: 3,
  },
  cellHidden: {
    backgroundColor: '#cccccc',
    borderColor: '#aaaaaa',
  },
  cellRevealed: {
    backgroundColor: '#faf9f6',
    borderColor: '#0d0d0d',
  },
  cellHighlight: {
    backgroundColor: '#ffb703',
    borderColor: '#ffb703',
  },
  cellText: {
    fontSize: 30,
  },
  scratchedText: {
    fontSize: 11,
    color: '#888',
    fontFamily: 'Georgia',
    fontWeight: '600',
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
