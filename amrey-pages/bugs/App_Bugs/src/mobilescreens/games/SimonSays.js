import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PANELS = [
  { id: 0, color: '#2a9d8f', activeColor: '#52b788', label: 'Green' },
  { id: 1, color: '#e63946', activeColor: '#ff6b6b', label: 'Red' },
  { id: 2, color: '#f4a261', activeColor: '#ffb703', label: 'Yellow' },
  { id: 3, color: '#4361ee', activeColor: '#4cc9f0', label: 'Blue' },
];

const SimonSays = () => {
  const [sequence, setSequence] = useState([]);
  const [userIndex, setUserIndex] = useState(0);
  const [activePanel, setActivePanel] = useState(null);
  const [gameState, setGameState] = useState('idle'); // idle, playing, showing, over
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [status, setStatus] = useState('Press Start to Play!');

  const timeouts = useRef([]);

  const clearTimeouts = () => {
    timeouts.current.forEach((t) => clearTimeout(t));
    timeouts.current = [];
  };

  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  const startGame = () => {
    clearTimeouts();
    setScore(0);
    setGameState('showing');
    const firstStep = Math.floor(Math.random() * 4);
    const nextSeq = [firstStep];
    setSequence(nextSeq);
    playSequence(nextSeq);
  };

  const playSequence = (seq) => {
    setGameState('showing');
    setStatus('Watch Simon...');
    clearTimeouts();

    seq.forEach((panelId, idx) => {
      const flashOn = setTimeout(() => {
        setActivePanel(panelId);
      }, (idx + 1) * 800 - 300);

      const flashOff = setTimeout(() => {
        setActivePanel(null);
        if (idx === seq.length - 1) {
          setGameState('playing');
          setUserIndex(0);
          setStatus('Repeat the sequence!');
        }
      }, (idx + 1) * 800);

      timeouts.current.push(flashOn, flashOff);
    });
  };

  const handlePanelPress = (panelId) => {
    if (gameState !== 'playing') return;

    // Flash pressed panel
    setActivePanel(panelId);
    setTimeout(() => setActivePanel(null), 150);

    // Verify step
    if (panelId === sequence[userIndex]) {
      const nextIndex = userIndex + 1;
      if (nextIndex === sequence.length) {
        // Round passed!
        setScore((prev) => {
          const nextScore = prev + 1;
          if (nextScore > highScore) setHighScore(nextScore);
          return nextScore;
        });
        setStatus('Nice! Next round.');

        const nextStep = Math.floor(Math.random() * 4);
        const nextSeq = [...sequence, nextStep];
        setSequence(nextSeq);

        setTimeout(() => {
          playSequence(nextSeq);
        }, 1000);
      } else {
        setUserIndex(nextIndex);
      }
    } else {
      // Mistake! Game Over
      setGameState('over');
      setStatus('Oops! Wrong color.');
    }
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
          <Text style={styles.scoreLabel}>HIGH SCORE</Text>
          <Text style={[styles.scoreNum, { color: '#2a9d8f' }]}>{highScore}</Text>
        </View>
      </View>

      {/* Game Status Banner */}
      <View style={styles.statusBanner}>
        <Text style={styles.statusText}>{status}</Text>
      </View>

      {/* 2x2 Board */}
      <View style={styles.board}>
        <View style={styles.boardRow}>
          <TouchableOpacity
            style={[
              styles.panel,
              { backgroundColor: activePanel === 0 ? PANELS[0].activeColor : PANELS[0].color },
              styles.panelTL,
            ]}
            onPress={() => handlePanelPress(0)}
            activeOpacity={0.9}
          />
          <TouchableOpacity
            style={[
              styles.panel,
              { backgroundColor: activePanel === 1 ? PANELS[1].activeColor : PANELS[1].color },
              styles.panelTR,
            ]}
            onPress={() => handlePanelPress(1)}
            activeOpacity={0.9}
          />
        </View>
        <View style={styles.boardRow}>
          <TouchableOpacity
            style={[
              styles.panel,
              { backgroundColor: activePanel === 2 ? PANELS[2].activeColor : PANELS[2].color },
              styles.panelBL,
            ]}
            onPress={() => handlePanelPress(2)}
            activeOpacity={0.9}
          />
          <TouchableOpacity
            style={[
              styles.panel,
              { backgroundColor: activePanel === 3 ? PANELS[3].activeColor : PANELS[3].color },
              styles.panelBR,
            ]}
            onPress={() => handlePanelPress(3)}
            activeOpacity={0.9}
          />
        </View>
      </View>

      {/* Control Panel */}
      {gameState !== 'showing' && gameState !== 'playing' && (
        <TouchableOpacity style={styles.btnAction} onPress={startGame}>
          <Text style={styles.btnText}>
            {gameState === 'idle' ? 'START' : 'PLAY AGAIN'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SimonSays;

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

  // Banner
  statusBanner: {
    marginBottom: 20,
  },
  statusText: {
    fontFamily: 'Georgia',
    fontSize: 16,
    fontWeight: '700',
    color: '#0d0d0d',
    textAlign: 'center',
  },

  // 2x2 board layout
  board: {
    width: 250,
    height: 250,
    backgroundColor: '#0d0d0d',
    borderRadius: 125,
    padding: 10,
    gap: 10,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  boardRow: {
    flexDirection: 'row',
    flex: 1,
    gap: 10,
  },
  panel: {
    flex: 1,
  },
  panelTL: {
    borderTopLeftRadius: 110,
  },
  panelTR: {
    borderTopRightRadius: 110,
  },
  panelBL: {
    borderBottomLeftRadius: 110,
  },
  panelBR: {
    borderBottomRightRadius: 110,
  },

  // Start Action
  btnAction: {
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
