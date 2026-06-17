import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const SOLVED_BOARD = [1, 2, 3, 4, 5, 6, 7, 8, null];

const SlidePuzzle = () => {
  const [tiles, setTiles] = useState([...SOLVED_BOARD]);
  const [moves, setMoves] = useState(0);
  const [bestMoves, setBestMoves] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  const [gameState, setGameState] = useState('idle'); // idle, playing, won

  const getAdjacentIndices = (index) => {
    const adj = [];
    const row = Math.floor(index / 3);
    const col = index % 3;

    if (row > 0) adj.push(index - 3); // top
    if (row < 2) adj.push(index + 3); // bottom
    if (col > 0) adj.push(index - 1); // left
    if (col < 2) adj.push(index + 1); // right

    return adj;
  };

  const scrambleBoard = () => {
    let currentBoard = [...SOLVED_BOARD];
    let emptyIndex = 8;

    // Perform random valid moves
    for (let k = 0; k < 120; k++) {
      const adj = getAdjacentIndices(emptyIndex);
      const randomTarget = adj[Math.floor(Math.random() * adj.length)];
      
      // Swap Target and Empty
      currentBoard[emptyIndex] = currentBoard[randomTarget];
      currentBoard[randomTarget] = null;
      emptyIndex = randomTarget;
    }

    // Edge case: if by random chance it's already solved, scramble again
    const isAlreadySolved = currentBoard.every((val, idx) => val === SOLVED_BOARD[idx]);
    if (isAlreadySolved) {
      scrambleBoard();
      return;
    }

    setTiles(currentBoard);
    setMoves(0);
    setIsSolved(false);
    setGameState('playing');
  };

  const handleTileTap = (index) => {
    if (gameState !== 'playing' || isSolved) return;

    const emptyIndex = tiles.indexOf(null);
    const adj = getAdjacentIndices(index);

    if (adj.includes(emptyIndex)) {
      const newBoard = [...tiles];
      newBoard[emptyIndex] = tiles[index];
      newBoard[index] = null;
      
      setTiles(newBoard);
      setMoves((prev) => prev + 1);

      // Check solution
      const checkSolved = newBoard.every((val, idx) => val === SOLVED_BOARD[idx]);
      if (checkSolved) {
        setIsSolved(true);
        setGameState('won');
        if (bestMoves === null || moves + 1 < bestMoves) {
          setBestMoves(moves + 1);
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Scoreboard */}
      <View style={styles.scoresRow}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>MOVES</Text>
          <Text style={styles.scoreNum}>{moves}</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>FEWEST MOVES</Text>
          <Text style={[styles.scoreNum, { color: '#2a9d8f' }]}>
            {bestMoves !== null ? bestMoves : '--'}
          </Text>
        </View>
      </View>

      {/* Stage */}
      <View style={styles.stage}>
        {gameState === 'idle' ? (
          <View style={styles.splashBox}>
            <Text style={styles.splashHeader}>Slide Puzzle</Text>
            <Text style={styles.splashText}>
              Slide tiles next to the empty space to sort them 1 through 8.
            </Text>
            <TouchableOpacity style={styles.btnAction} onPress={scrambleBoard}>
              <Text style={styles.btnActionText}>SCRAMBLE & START</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.gameArea}>
            <View style={styles.grid}>
              {tiles.map((val, idx) => {
                const isEmpty = val === null;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.tile, isEmpty ? styles.tileEmpty : null]}
                    onPress={() => handleTileTap(idx)}
                    disabled={isEmpty || isSolved}
                    activeOpacity={0.8}
                  >
                    {!isEmpty && <Text style={styles.tileText}>{val}</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {gameState === 'won' ? (
              <View style={styles.winOverlay}>
                <Text style={styles.winHeader}>Solved! 🎉</Text>
                <Text style={styles.winText}>In {moves} moves!</Text>
                <TouchableOpacity style={styles.btnAction} onPress={scrambleBoard}>
                  <Text style={styles.btnActionText}>PLAY AGAIN</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.btnReset} onPress={scrambleBoard}>
                <Text style={styles.btnResetText}>RESTART / RESHUFFLE</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default SlidePuzzle;

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
  gameArea: {
    alignItems: 'center',
    width: '100%',
  },
  grid: {
    width: 224,
    height: 224,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'center',
    marginBottom: 16,
  },
  tile: {
    width: 68,
    height: 68,
    backgroundColor: '#0d0d0d',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    margin: 3,
  },
  tileEmpty: {
    backgroundColor: '#faf9f6',
    borderWidth: 1.5,
    borderColor: '#ebebeb',
    elevation: 0,
    shadowOpacity: 0,
  },
  tileText: {
    fontFamily: 'Georgia',
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  winOverlay: {
    alignItems: 'center',
  },
  winHeader: {
    fontFamily: 'Georgia',
    fontSize: 20,
    fontWeight: '700',
    color: '#2a9d8f',
    marginBottom: 4,
  },
  winText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  btnAction: {
    backgroundColor: '#0d0d0d',
    borderRadius: 2,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  btnActionText: {
    fontFamily: 'Georgia',
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1.5,
  },
  btnReset: {
    borderWidth: 1.5,
    borderColor: '#0d0d0d',
    borderRadius: 2,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  btnResetText: {
    fontFamily: 'Georgia',
    fontSize: 10,
    fontWeight: '700',
    color: '#0d0d0d',
    letterSpacing: 1,
  },
});
