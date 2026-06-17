import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Alert } from 'react-native';

const BOARD_SIZE = 4;

const TILE_COLORS = {
  2: { bg: '#eee4da', text: '#776e65' },
  4: { bg: '#ede0c8', text: '#776e65' },
  8: { bg: '#f2b179', text: '#f9f6f2' },
  16: { bg: '#f59563', text: '#f9f6f2' },
  32: { bg: '#f67c5f', text: '#f9f6f2' },
  64: { bg: '#f65e3b', text: '#f9f6f2' },
  128: { bg: '#edcf72', text: '#f9f6f2' },
  256: { bg: '#edcc61', text: '#f9f6f2' },
  512: { bg: '#edc850', text: '#f9f6f2' },
  1024: { bg: '#edc53f', text: '#f9f6f2' },
  2048: { bg: '#edc22e', text: '#f9f6f2' },
};

const getTileStyle = (val) => {
  return TILE_COLORS[val] || { bg: '#3c3a32', text: '#f9f6f2' };
};

const Game2048 = () => {
  const [board, setBoard] = useState(
    Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(0))
  );
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);

  // Initialize board with two random tiles
  const initGame = () => {
    let newBoard = Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(0));
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setVictory(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Helper to add a random tile (2 or 4) to an empty spot
  const addRandomTile = (currentBoard) => {
    const emptyCells = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (currentBoard[r][c] === 0) {
          emptyCells.push({ r, c });
        }
      }
    }
    if (emptyCells.length === 0) return currentBoard;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = currentBoard.map((row) => [...row]);
    newBoard[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  };

  // Check if two boards are identical
  const isIdentical = (boardA, boardB) => {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (boardA[r][c] !== boardB[r][c]) return false;
      }
    }
    return true;
  };

  // Slide and merge one row towards left
  const slideRowLeft = (row) => {
    // 1. Filter out zeros
    let filtered = row.filter((val) => val !== 0);
    let mergedRow = [];
    let addedScore = 0;

    // 2. Merge matching adjacent cells
    for (let i = 0; i < filtered.length; i++) {
      if (filtered[i] === filtered[i + 1]) {
        const mergedVal = filtered[i] * 2;
        mergedRow.push(mergedVal);
        addedScore += mergedVal;
        i++; // skip next since it's merged
      } else {
        mergedRow.push(filtered[i]);
      }
    }

    // 3. Fill trailing with zeros
    while (mergedRow.length < BOARD_SIZE) {
      mergedRow.push(0);
    }

    return { mergedRow, addedScore };
  };

  // Move functions: returns new board and score increment
  const moveLeft = (currentBoard) => {
    let newBoard = [];
    let totalAddedScore = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
      const { mergedRow, addedScore } = slideRowLeft(currentBoard[r]);
      newBoard.push(mergedRow);
      totalAddedScore += addedScore;
    }
    return { newBoard, totalAddedScore };
  };

  const rotateRight = (currentBoard) => {
    let newBoard = Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(0));
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        newBoard[c][BOARD_SIZE - 1 - r] = currentBoard[r][c];
      }
    }
    return newBoard;
  };

  const moveRight = (currentBoard) => {
    // Rotate 180 degrees, move left, rotate 180 degrees back
    let rotated = rotateRight(rotateRight(currentBoard));
    const { newBoard: moved, totalAddedScore } = moveLeft(rotated);
    let finalBoard = rotateRight(rotateRight(moved));
    return { newBoard: finalBoard, totalAddedScore };
  };

  const moveUp = (currentBoard) => {
    // Rotate counter-clockwise (3 right rotations), move left, rotate clockwise
    let rotated = rotateRight(rotateRight(rotateRight(currentBoard)));
    const { newBoard: moved, totalAddedScore } = moveLeft(rotated);
    let finalBoard = rotateRight(moved);
    return { newBoard: finalBoard, totalAddedScore };
  };

  const moveDown = (currentBoard) => {
    // Rotate clockwise (1 right rotation), move left, rotate counter-clockwise
    let rotated = rotateRight(currentBoard);
    const { newBoard: moved, totalAddedScore } = moveLeft(rotated);
    let finalBoard = rotateRight(rotateRight(rotateRight(moved)));
    return { newBoard: finalBoard, totalAddedScore };
  };

  // General move handler
  const handleMove = (direction) => {
    if (gameOver || victory) return;

    let moveResult;
    if (direction === 'left') moveResult = moveLeft(board);
    else if (direction === 'right') moveResult = moveRight(board);
    else if (direction === 'up') moveResult = moveUp(board);
    else if (direction === 'down') moveResult = moveDown(board);

    if (!moveResult) return;

    const { newBoard, totalAddedScore } = moveResult;

    // Check if move actually changed the board
    if (!isIdentical(board, newBoard)) {
      const boardWithRandom = addRandomTile(newBoard);
      const nextScore = score + totalAddedScore;
      setBoard(boardWithRandom);
      setScore(nextScore);
      if (nextScore > bestScore) {
        setBestScore(nextScore);
      }

      checkGameStatus(boardWithRandom, nextScore);
    }
  };

  // Check for game over or victory
  const checkGameStatus = (currentBoard, currentScore) => {
    // Check for 2048 tile (victory)
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (currentBoard[r][c] === 2048) {
          setVictory(true);
          return;
        }
      }
    }

    // Check if there are any empty cells
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (currentBoard[r][c] === 0) return;
      }
    }

    // Check if any adjacent cells can merge
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const val = currentBoard[r][c];
        if (r < BOARD_SIZE - 1 && val === currentBoard[r + 1][c]) return;
        if (c < BOARD_SIZE - 1 && val === currentBoard[r][c + 1]) return;
      }
    }

    setGameOver(true);
  };

  // Gesture parsing via PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        if (absX < 30 && absY < 30) return; // ignore short swipes

        if (absX > absY) {
          if (dx > 0) handleMove('right');
          else handleMove('left');
        } else {
          if (dy > 0) handleMove('down');
          else handleMove('up');
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* Score Header */}
      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreTitle}>SCORE</Text>
          <Text style={styles.scoreVal}>{score}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreTitle}>BEST</Text>
          <Text style={[styles.scoreVal, { color: '#edc22e' }]}>{bestScore}</Text>
        </View>
      </View>

      {/* Game Board */}
      <View style={styles.boardWrapper} {...panResponder.panHandlers}>
        <View style={styles.boardGrid}>
          {board.map((row, rIdx) => (
            <View key={rIdx} style={styles.row}>
              {row.map((val, cIdx) => {
                const isZero = val === 0;
                const tileStyle = getTileStyle(val);
                return (
                  <View
                    key={cIdx}
                    style={[
                      styles.cell,
                      !isZero && { backgroundColor: tileStyle.bg },
                    ]}
                  >
                    {!isZero && (
                      <Text style={[styles.tileText, { color: tileStyle.text }]}>
                        {val}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* Overlay screens */}
        {victory && (
          <View style={styles.overlay}>
            <Text style={styles.overlayTitle}>Victory! 🏆</Text>
            <Text style={styles.overlaySub}>You reached the 2048 tile!</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={initGame}>
              <Text style={styles.actionBtnText}>NEW GAME</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameOver && (
          <View style={styles.overlay}>
            <Text style={[styles.overlayTitle, { color: '#e63946' }]}>Game Over</Text>
            <Text style={styles.overlaySub}>No moves left!</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={initGame}>
              <Text style={styles.actionBtnText}>TRY AGAIN</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Button Controls (for simulators/easier input) */}
      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <TouchableOpacity style={styles.controlBtn} onPress={() => handleMove('up')}>
            <Text style={styles.controlArrow}>▲</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.controlRow}>
          <TouchableOpacity style={styles.controlBtn} onPress={() => handleMove('left')}>
            <Text style={styles.controlArrow}>◀</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlBtn, styles.btnReset]} onPress={initGame}>
            <Text style={styles.resetIcon}>↻</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={() => handleMove('right')}>
            <Text style={styles.controlArrow}>▶</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.controlRow}>
          <TouchableOpacity style={styles.controlBtn} onPress={() => handleMove('down')}>
            <Text style={styles.controlArrow}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Game2048;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#0d0d0d',
    borderRadius: 4,
    width: '100%',
    paddingVertical: 14,
    marginBottom: 20,
    justifyContent: 'space-around',
  },
  scoreContainer: {
    alignItems: 'center',
    flex: 1,
  },
  scoreTitle: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: '#aaa',
    fontWeight: '700',
    marginBottom: 4,
  },
  scoreVal: {
    fontFamily: 'Georgia',
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  boardWrapper: {
    width: 250,
    height: 250,
    backgroundColor: '#bbada0',
    borderRadius: 6,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  boardGrid: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: '23%',
  },
  cell: {
    width: '23%',
    height: '100%',
    backgroundColor: 'rgba(238, 228, 218, 0.35)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileText: {
    fontFamily: 'Georgia',
    fontSize: 18,
    fontWeight: '800',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(238, 228, 218, 0.9)',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTitle: {
    fontFamily: 'Georgia',
    fontSize: 26,
    fontWeight: '800',
    color: '#2a9d8f',
    marginBottom: 4,
  },
  overlaySub: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    fontFamily: 'Georgia',
  },
  actionBtn: {
    backgroundColor: '#0d0d0d',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 4,
  },
  actionBtnText: {
    fontFamily: 'Georgia',
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  controls: {
    marginTop: 20,
    alignItems: 'center',
    gap: 8,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 4,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#0d0d0d',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  btnReset: {
    borderColor: '#888',
  },
  controlArrow: {
    fontSize: 18,
    color: '#0d0d0d',
    fontWeight: 'bold',
  },
  resetIcon: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
});
