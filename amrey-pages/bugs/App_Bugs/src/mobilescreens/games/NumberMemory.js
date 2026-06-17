import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

const NumberMemory = () => {
  const [level, setLevel] = useState(3); // Start with 3 digits
  const [highLevel, setHighLevel] = useState(3);
  const [gameState, setGameState] = useState('idle'); // idle, memorize, recall, result, over
  
  const [targetNumber, setTargetNumber] = useState('');
  const [userInput, setUserInput] = useState('');
  const [countdown, setCountdown] = useState(0);

  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const inputRef = useRef(null);

  const startNextLevel = (newGame = false) => {
    const nextLvl = newGame ? 3 : level;
    setLevel(nextLvl);
    setUserInput('');
    
    // Generate random digits of length `nextLvl`
    let numStr = '';
    for (let i = 0; i < nextLvl; i++) {
      numStr += Math.floor(Math.random() * 10).toString();
    }
    setTargetNumber(numStr);
    setGameState('memorize');

    // Memorization time: 1.5 seconds minimum + 0.5s per digit
    const durationSec = Math.max(2, Math.floor(1.5 + nextLvl * 0.4));
    setCountdown(durationSec);

    // Start countdown
    if (countdownRef.current) clearInterval(countdownRef.current);
    let secondsLeft = durationSec;
    countdownRef.current = setInterval(() => {
      secondsLeft -= 1;
      setCountdown(secondsLeft);
      if (secondsLeft <= 0) {
        clearInterval(countdownRef.current);
        setGameState('recall');
        setTimeout(() => {
          if (inputRef.current) inputRef.current.focus();
        }, 100);
      }
    }, 1000);
  };

  const handleVerify = () => {
    if (gameState !== 'recall') return;
    
    if (userInput.trim() === targetNumber) {
      const nextLevel = level + 1;
      setLevel(nextLevel);
      if (nextLevel > highLevel) {
        setHighLevel(nextLevel);
      }
      setGameState('result');
    } else {
      setGameState('over');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Scoreboard */}
      <View style={styles.scoresRow}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>LEVEL</Text>
          <Text style={styles.scoreNum}>{level}</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>CURRENT DIGITS</Text>
          <Text style={[styles.scoreNum, { color: '#f4a261' }]}>{level} digits</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>BEST LEVEL</Text>
          <Text style={[styles.scoreNum, { color: '#2a9d8f' }]}>{highLevel}</Text>
        </View>
      </View>

      {/* Stage */}
      <View style={styles.stage}>
        {gameState === 'memorize' && (
          <View style={styles.gameArea}>
            <Text style={styles.instruction}>Memorize this number:</Text>
            <Text style={styles.numberDisplay}>{targetNumber}</Text>
            <Text style={styles.timerText}>Hiding in {countdown}s...</Text>
          </View>
        )}

        {gameState === 'recall' && (
          <View style={styles.gameArea}>
            <Text style={styles.instruction}>What was the number?</Text>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              keyboardType="number-pad"
              value={userInput}
              onChangeText={setUserInput}
              onSubmitEditing={handleVerify}
              placeholder="Enter digits..."
              placeholderTextColor="#ccc"
            />
            <TouchableOpacity style={styles.btnAction} onPress={handleVerify}>
              <Text style={styles.btnActionText}>SUBMIT</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'result' && (
          <View style={styles.gameArea}>
            <Text style={styles.resultHeaderSuccess}>Correct! 🎉</Text>
            <Text style={styles.resultDetails}>You remembered all {level - 1} digits.</Text>
            <TouchableOpacity style={styles.btnAction} onPress={() => startNextLevel(false)}>
              <Text style={styles.btnActionText}>GO TO LEVEL {level}</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'over' && (
          <View style={styles.splashBox}>
            <Text style={styles.resultHeader}>Wrong Number!</Text>
            <Text style={styles.resultDetails}>
              Expected: <Text style={styles.correctNumText}>{targetNumber}</Text>
            </Text>
            <Text style={styles.resultDetails}>
              You entered: <Text style={styles.wrongNumText}>{userInput || '(empty)'}</Text>
            </Text>
            <TouchableOpacity style={styles.btnAction} onPress={() => startNextLevel(true)}>
              <Text style={styles.btnActionText}>TRY AGAIN</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'idle' && (
          <View style={styles.splashBox}>
            <Text style={styles.splashHeader}>Number Memory</Text>
            <Text style={styles.splashText}>
              A sequence of digits will be displayed. Remember it, and type it back. It gets longer each round!
            </Text>
            <TouchableOpacity style={styles.btnAction} onPress={() => startNextLevel(true)}>
              <Text style={styles.btnActionText}>START MEMORY TEST</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default NumberMemory;

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
  gameArea: {
    width: '100%',
    alignItems: 'center',
  },
  instruction: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Georgia',
    marginBottom: 12,
  },
  numberDisplay: {
    fontFamily: 'Georgia',
    fontSize: 38,
    fontWeight: '900',
    color: '#0d0d0d',
    letterSpacing: 4,
    marginVertical: 16,
    textAlign: 'center',
  },
  timerText: {
    fontSize: 12,
    color: '#e63946',
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  textInput: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#0d0d0d',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 22,
    fontFamily: 'Georgia',
    color: '#0d0d0d',
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 20,
  },
  resultHeaderSuccess: {
    fontFamily: 'Georgia',
    fontSize: 24,
    fontWeight: '700',
    color: '#2a9d8f',
    marginBottom: 8,
  },
  correctNumText: {
    fontWeight: '800',
    color: '#2a9d8f',
  },
  wrongNumText: {
    fontWeight: '800',
    color: '#e63946',
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
  resultHeader: {
    fontFamily: 'Georgia',
    fontSize: 22,
    fontWeight: '700',
    color: '#e63946',
    marginBottom: 8,
  },
  resultDetails: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Georgia',
    marginBottom: 10,
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
