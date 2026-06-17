import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const GRID_SIZE = 10;
const TICK_RATE = 280; // Game loop tick rate in ms

const SnakeGame = () => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState('idle'); // idle, playing, over
  
  const [snake, setSnake] = useState([{ x: 4, y: 5 }]);
  const [food, setFood] = useState({ x: 7, y: 3 });
  const [direction, setDirection] = useState({ x: 0, y: -1 }); // Initial move up

  const intervalRef = useRef(null);

  const startGame = () => {
    setScore(0);
    setSnake([{ x: 4, y: 5 }]);
    setDirection({ x: 0, y: -1 });
    generateFood([{ x: 4, y: 5 }]);
    setGameState('playing');
  };

  const generateFood = (currentSnake) => {
    let nextFood;
    let isOnSnake = true;
    while (isOnSnake) {
      nextFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      isOnSnake = currentSnake.some(
        (seg) => seg.x === nextFood.x && seg.y === nextFood.y
      );
    }
    setFood(nextFood);
  };

  const changeDirection = (newDir) => {
    if (gameState !== 'playing') return;
    
    // Prevent reverse direction into self
    const isOpposite = 
      (newDir.x !== 0 && direction.x === -newDir.x) ||
      (newDir.y !== 0 && direction.y === -newDir.y);
      
    if (!isOpposite) {
      setDirection(newDir);
    }
  };

  // Game Loop
  useEffect(() => {
    if (gameState === 'playing') {
      intervalRef.current = setInterval(() => {
        setSnake((prevSnake) => {
          const head = prevSnake[0];
          const nextHead = {
            x: head.x + direction.x,
            y: head.y + direction.y,
          };

          // Wall collision
          if (
            nextHead.x < 0 ||
            nextHead.x >= GRID_SIZE ||
            nextHead.y < 0 ||
            nextHead.y >= GRID_SIZE
          ) {
            setGameState('over');
            clearInterval(intervalRef.current);
            return prevSnake;
          }

          // Self collision
          if (prevSnake.some((seg) => seg.x === nextHead.x && seg.y === nextHead.y)) {
            setGameState('over');
            clearInterval(intervalRef.current);
            return prevSnake;
          }

          const newSnake = [nextHead, ...prevSnake];

          // Check if food eaten
          if (nextHead.x === food.x && nextHead.y === food.y) {
            setScore((s) => s + 1);
            generateFood(newSnake);
          } else {
            newSnake.pop(); // Remove tail
          }

          return newSnake;
        });
      }, TICK_RATE);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [gameState, direction, food]);

  useEffect(() => {
    if (gameState === 'over' && score > highScore) {
      setHighScore(score);
    }
  }, [gameState, score]);

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
          <Text style={styles.scoreLabel}>GRID SIZE</Text>
          <Text style={[styles.scoreNum, { color: '#f4a261' }]}>10x10</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>HIGH SCORE</Text>
          <Text style={[styles.scoreNum, { color: '#2a9d8f' }]}>{highScore}</Text>
        </View>
      </View>

      {/* Stage */}
      <View style={styles.stage}>
        {gameState === 'playing' ? (
          <View style={styles.gameArea}>
            {/* 10x10 Grid Canvas */}
            <View style={styles.gridCanvas}>
              {Array.from({ length: GRID_SIZE }).map((_, rIdx) => (
                <View key={rIdx} style={styles.row}>
                  {Array.from({ length: GRID_SIZE }).map((_, cIdx) => {
                    const isHead = snake[0].x === cIdx && snake[0].y === rIdx;
                    const isBody = snake.slice(1).some((seg) => seg.x === cIdx && seg.y === rIdx);
                    const isFood = food.x === cIdx && food.y === rIdx;

                    return (
                      <View
                        key={cIdx}
                        style={[
                          styles.cell,
                          isHead && styles.cellHead,
                          isBody && styles.cellBody,
                          isFood && styles.cellFood,
                        ]}
                      >
                        {isFood && <Text style={styles.cellEmoji}>🍎</Text>}
                        {isHead && <Text style={styles.cellEmoji}>👀</Text>}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>

            {/* D-Pad Buttons */}
            <View style={styles.dpad}>
              <View style={styles.dpadRow}>
                <TouchableOpacity
                  style={styles.dpadBtn}
                  onPress={() => changeDirection({ x: 0, y: -1 })}
                >
                  <Text style={styles.dpadArrow}>▲</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dpadMiddleRow}>
                <TouchableOpacity
                  style={styles.dpadBtn}
                  onPress={() => changeDirection({ x: -1, y: 0 })}
                >
                  <Text style={styles.dpadArrow}>◀</Text>
                </TouchableOpacity>
                <View style={styles.dpadCenter} />
                <TouchableOpacity
                  style={styles.dpadBtn}
                  onPress={() => changeDirection({ x: 1, y: 0 })}
                >
                  <Text style={styles.dpadArrow}>▶</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dpadRow}>
                <TouchableOpacity
                  style={styles.dpadBtn}
                  onPress={() => changeDirection({ x: 0, y: 1 })}
                >
                  <Text style={styles.dpadArrow}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.overlay}>
            {gameState === 'idle' ? (
              <View style={styles.splashBox}>
                <Text style={styles.splashHeader}>Retro Snake</Text>
                <Text style={styles.splashText}>
                  Use the control pad to guide the snake to eat the apples 🍎. Don't crash into yourself or the borders!
                </Text>
                <TouchableOpacity style={styles.btnAction} onPress={startGame}>
                  <Text style={styles.btnActionText}>PLAY GAME</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.splashBox}>
                <Text style={styles.resultHeader}>Crashed!</Text>
                <Text style={styles.resultScore}>{score} Points</Text>
                <Text style={styles.resultDetails}>You reached a length of {score + 1}.</Text>
                <TouchableOpacity style={styles.btnAction} onPress={startGame}>
                  <Text style={styles.btnActionText}>PLAY AGAIN</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default SnakeGame;

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
    minHeight: 390,
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
  gridCanvas: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#0d0d0d',
    backgroundColor: '#faf9f6',
    marginBottom: 20,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    borderWidth: 0.25,
    borderColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellHead: {
    backgroundColor: '#0d0d0d',
  },
  cellBody: {
    backgroundColor: '#8d99ae',
  },
  cellFood: {
    backgroundColor: '#faf9f6',
  },
  cellEmoji: {
    fontSize: 12,
  },
  dpad: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadRow: {
    alignItems: 'center',
  },
  dpadMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  dpadBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0d0d0d',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dpadCenter: {
    width: 32,
    height: 32,
  },
  dpadArrow: {
    color: '#fff',
    fontSize: 14,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#e63946',
    marginBottom: 4,
  },
  resultScore: {
    fontFamily: 'Georgia',
    fontSize: 38,
    fontWeight: '800',
    color: '#0d0d0d',
    marginBottom: 4,
  },
  resultDetails: {
    fontSize: 12,
    color: '#888',
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
