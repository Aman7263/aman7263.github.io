import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [vsCpu, setVsCpu] = useState(true);
  const [scores, setScores] = useState({ playerX: 0, playerO: 0, draws: 0 });

  const winningLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const calculateWinner = (squares) => {
    for (let i = 0; i < winningLines.length; i++) {
      const [a, b, c] = winningLines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (squares.every((square) => square !== null)) {
      return 'Draw';
    }
    return null;
  };

  const winner = calculateWinner(board);

  // CPU Move Logic
  useEffect(() => {
    if (vsCpu && !isXNext && !winner) {
      const timer = setTimeout(() => {
        makeCpuMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isXNext, vsCpu, winner]);

  // Update Score on Win
  useEffect(() => {
    if (winner === 'X') {
      setScores((prev) => ({ ...prev, playerX: prev.playerX + 1 }));
    } else if (winner === 'O') {
      setScores((prev) => ({ ...prev, playerO: prev.playerO + 1 }));
    } else if (winner === 'Draw') {
      setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
    }
  }, [winner]);

  const makeCpuMove = () => {
    const emptyIndices = board
      .map((val, idx) => (val === null ? idx : null))
      .filter((val) => val !== null);

    if (emptyIndices.length > 0) {
      // 1. Try to win or block
      let targetIndex = null;

      // Find winning/blocking move
      for (let symbol of ['O', 'X']) {
        for (let line of winningLines) {
          const [a, b, c] = line;
          const vals = [board[a], board[b], board[c]];
          const countSymbol = vals.filter(v => v === symbol).length;
          const countNull = vals.filter(v => v === null).length;
          if (countSymbol === 2 && countNull === 1) {
            targetIndex = line[vals.indexOf(null)];
            break;
          }
        }
        if (targetIndex !== null) break;
      }

      // 2. Select center if empty
      if (targetIndex === null && board[4] === null) {
        targetIndex = 4;
      }

      // 3. Fallback to random empty square
      if (targetIndex === null) {
        const randomIndex = Math.floor(Math.random() * emptyIndices.length);
        targetIndex = emptyIndices[randomIndex];
      }

      const nextBoard = [...board];
      nextBoard[targetIndex] = 'O';
      setBoard(nextBoard);
      setIsXNext(true);
    }
  };

  const handlePress = (index) => {
    if (board[index] || winner || (vsCpu && !isXNext)) return;

    const nextBoard = [...board];
    nextBoard[index] = isXNext ? 'X' : 'O';
    setBoard(nextBoard);
    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  const resetScores = () => {
    setScores({ playerX: 0, playerO: 0, draws: 0 });
    resetGame();
  };

  const renderCell = (index) => {
    const value = board[index];
    const isWinCell = winner && winner !== 'Draw' && winningLines.some(line => {
      if (board[line[0]] === winner && board[line[1]] === winner && board[line[2]] === winner) {
        return line.includes(index);
      }
      return false;
    });

    return (
      <TouchableOpacity
        style={[
          styles.cell,
          isWinCell && styles.winningCell,
        ]}
        onPress={() => handlePress(index)}
        activeOpacity={0.7}
      >
        {value === 'X' && <Text style={[styles.cellText, styles.xText]}>✕</Text>}
        {value === 'O' && <Text style={[styles.cellText, styles.oText]}>◯</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Game Mode Selector */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeBtn, vsCpu && styles.modeBtnActive]}
          onPress={() => { setVsCpu(true); resetGame(); }}
        >
          <Text style={[styles.modeBtnText, vsCpu && styles.modeBtnTextActive]}>VS CPU</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, !vsCpu && styles.modeBtnActive]}
          onPress={() => { setVsCpu(false); resetGame(); }}
        >
          <Text style={[styles.modeBtnText, !vsCpu && styles.modeBtnTextActive]}>Pass & Play</Text>
        </TouchableOpacity>
      </View>

      {/* Scoreboard */}
      <View style={styles.scoresRow}>
        <View style={styles.scoreBox}>
          <Text style={[styles.scoreLabel, { color: '#e63946' }]}>PLAYER X</Text>
          <Text style={styles.scoreNum}>{scores.playerX}</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>DRAWS</Text>
          <Text style={styles.scoreNum}>{scores.draws}</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreBox}>
          <Text style={[styles.scoreLabel, { color: '#2a9d8f' }]}>
            {vsCpu ? 'CPU (O)' : 'PLAYER O'}
          </Text>
          <Text style={styles.scoreNum}>{scores.playerO}</Text>
        </View>
      </View>

      {/* Game Status Banner */}
      <View style={styles.statusBanner}>
        {winner ? (
          <Text style={styles.statusText}>
            {winner === 'Draw' ? "It's a Draw!" : `Winner: Player ${winner}!`}
          </Text>
        ) : (
          <Text style={styles.statusText}>
            {isXNext ? "Player X's Turn" : vsCpu ? "CPU thinking..." : "Player O's Turn"}
          </Text>
        )}
      </View>

      {/* 3x3 Grid Board */}
      <View style={styles.board}>
        <View style={styles.boardRow}>
          {renderCell(0)}
          {renderCell(1)}
          {renderCell(2)}
        </View>
        <View style={styles.boardRow}>
          {renderCell(3)}
          {renderCell(4)}
          {renderCell(5)}
        </View>
        <View style={styles.boardRow}>
          {renderCell(6)}
          {renderCell(7)}
          {renderCell(8)}
        </View>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlRow}>
        <TouchableOpacity style={styles.btnReset} onPress={resetGame}>
          <Text style={styles.btnText}>Play Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnReset, styles.btnOutline]} onPress={resetScores}>
          <Text style={[styles.btnText, { color: '#0d0d0d' }]}>Reset Score</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TicTacToe;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  modeRow: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 4,
    padding: 3,
    marginBottom: 20,
    width: '100%',
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 2,
  },
  modeBtnActive: {
    backgroundColor: '#0d0d0d',
  },
  modeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
  },
  modeBtnTextActive: {
    color: '#fff',
  },

  // Scores
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

  // Status
  statusBanner: {
    marginBottom: 16,
  },
  statusText: {
    fontFamily: 'Georgia',
    fontSize: 16,
    fontWeight: '700',
    color: '#0d0d0d',
  },

  // Board
  board: {
    backgroundColor: '#0d0d0d',
    borderRadius: 8,
    padding: 8,
    gap: 8,
    width: 290,
    height: 290,
    marginBottom: 24,
  },
  boardRow: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  cell: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  winningCell: {
    backgroundColor: '#333',
    borderWidth: 1.5,
    borderColor: '#e63946',
  },
  cellText: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  xText: {
    color: '#e63946',
  },
  oText: {
    color: '#2a9d8f',
  },

  // Controls
  controlRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btnReset: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    borderRadius: 2,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#0d0d0d',
  },
  btnText: {
    fontFamily: 'Georgia',
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
});
