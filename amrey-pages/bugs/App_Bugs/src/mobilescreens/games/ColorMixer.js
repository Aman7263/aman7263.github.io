import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, PanResponder } from 'react-native';

const SLIDER_WIDTH = 220;

const ColorMixer = () => {
  const [targetColor, setTargetColor] = useState({ r: 0, g: 0, b: 0 });
  const [userColor, setUserColor] = useState({ r: 128, g: 128, b: 128 });
  const [accuracy, setAccuracy] = useState(null);
  const [bestAccuracy, setBestAccuracy] = useState(0);
  const [gameState, setGameState] = useState('idle'); // idle, playing, matched

  const generateTargetColor = () => {
    setTargetColor({
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256)
    });
    setUserColor({ r: 128, g: 128, b: 128 });
    setAccuracy(null);
    setGameState('playing');
  };

  const handleSliderTouch = (colorKey, event) => {
    if (gameState !== 'playing') return;
    const { locationX } = event.nativeEvent;
    // Bound locationX between 0 and SLIDER_WIDTH
    const x = Math.max(0, Math.min(SLIDER_WIDTH, locationX));
    const value = Math.round((x / SLIDER_WIDTH) * 255);
    
    setUserColor((prev) => ({
      ...prev,
      [colorKey]: value
    }));
  };

  const checkMatch = () => {
    const diffR = Math.abs(targetColor.r - userColor.r);
    const diffG = Math.abs(targetColor.g - userColor.g);
    const diffB = Math.abs(targetColor.b - userColor.b);

    const totalDiff = diffR + diffG + diffB;
    const maxDiff = 255 * 3;
    const matchPercentage = Math.round((1 - totalDiff / maxDiff) * 100);

    setAccuracy(matchPercentage);
    if (matchPercentage > bestAccuracy) {
      setBestAccuracy(matchPercentage);
    }
    setGameState('matched');
  };

  useEffect(() => {
    generateTargetColor();
  }, []);

  const getRgbString = (colorObj) => {
    return `rgb(${colorObj.r}, ${colorObj.g}, ${colorObj.b})`;
  };

  return (
    <View style={styles.container}>
      {/* Scoreboard */}
      <View style={styles.scoresRow}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>LAST MATCH</Text>
          <Text style={styles.scoreNum}>{accuracy !== null ? `${accuracy}%` : '--'}</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>BEST ACCURACY</Text>
          <Text style={[styles.scoreNum, { color: '#2a9d8f' }]}>{bestAccuracy}%</Text>
        </View>
      </View>

      {/* Stage */}
      <View style={styles.stage}>
        {gameState === 'idle' ? (
          <View style={styles.splashBox}>
            <Text style={styles.splashHeader}>Color Mixer</Text>
            <Text style={styles.splashText}>
              Adjust the Red, Green, and Blue sliders to match your mixed color box to the target color box!
            </Text>
            <TouchableOpacity style={styles.btnAction} onPress={generateTargetColor}>
              <Text style={styles.btnActionText}>START MIXING</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.gameArea}>
            {/* Color Swatch Canvas */}
            <View style={styles.swatchRow}>
              <View style={styles.swatchContainer}>
                <Text style={styles.swatchLabel}>TARGET</Text>
                <View style={[styles.colorBlock, { backgroundColor: getRgbString(targetColor) }]} />
              </View>
              <View style={styles.swatchContainer}>
                <Text style={styles.swatchLabel}>YOUR MIX</Text>
                <View style={[styles.colorBlock, { backgroundColor: getRgbString(userColor) }]} />
              </View>
            </View>

            {gameState === 'playing' ? (
              <View style={styles.controls}>
                {/* Red Slider */}
                <View style={styles.sliderGroup}>
                  <Text style={styles.sliderLabel}>RED: {userColor.r}</Text>
                  <View
                    style={styles.sliderTrackContainer}
                    onTouchStart={(e) => handleSliderTouch('r', e)}
                    onTouchMove={(e) => handleSliderTouch('r', e)}
                  >
                    <View style={styles.sliderTrack} pointerEvents="none">
                      <View style={[styles.sliderFill, { width: (userColor.r / 255) * SLIDER_WIDTH, backgroundColor: '#e63946' }]} />
                      <View style={[styles.sliderHandle, { left: (userColor.r / 255) * (SLIDER_WIDTH - 14) }]} />
                    </View>
                  </View>
                </View>

                {/* Green Slider */}
                <View style={styles.sliderGroup}>
                  <Text style={styles.sliderLabel}>GREEN: {userColor.g}</Text>
                  <View
                    style={styles.sliderTrackContainer}
                    onTouchStart={(e) => handleSliderTouch('g', e)}
                    onTouchMove={(e) => handleSliderTouch('g', e)}
                  >
                    <View style={styles.sliderTrack} pointerEvents="none">
                      <View style={[styles.sliderFill, { width: (userColor.g / 255) * SLIDER_WIDTH, backgroundColor: '#2a9d8f' }]} />
                      <View style={[styles.sliderHandle, { left: (userColor.g / 255) * (SLIDER_WIDTH - 14) }]} />
                    </View>
                  </View>
                </View>

                {/* Blue Slider */}
                <View style={styles.sliderGroup}>
                  <Text style={styles.sliderLabel}>BLUE: {userColor.b}</Text>
                  <View
                    style={styles.sliderTrackContainer}
                    onTouchStart={(e) => handleSliderTouch('b', e)}
                    onTouchMove={(e) => handleSliderTouch('b', e)}
                  >
                    <View style={styles.sliderTrack} pointerEvents="none">
                      <View style={[styles.sliderFill, { width: (userColor.b / 255) * SLIDER_WIDTH, backgroundColor: '#3f37c9' }]} />
                      <View style={[styles.sliderHandle, { left: (userColor.b / 255) * (SLIDER_WIDTH - 14) }]} />
                    </View>
                  </View>
                </View>

                <TouchableOpacity style={styles.btnAction} onPress={checkMatch}>
                  <Text style={styles.btnActionText}>SUBMIT MIX</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.resultContainer}>
                <Text style={styles.resultMatchText}>Accuracy: {accuracy}%</Text>
                <Text style={styles.resultDetailText}>
                  Target: {targetColor.r}, {targetColor.g}, {targetColor.b}
                </Text>
                <Text style={styles.resultDetailText}>
                  You Mixed: {userColor.r}, {userColor.g}, {userColor.b}
                </Text>
                <TouchableOpacity style={styles.btnAction} onPress={generateTargetColor}>
                  <Text style={styles.btnActionText}>NEXT COLOR</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default ColorMixer;

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
    minHeight: 320,
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
  swatchRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  swatchContainer: {
    alignItems: 'center',
  },
  swatchLabel: {
    fontSize: 9,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: '#666',
    marginBottom: 6,
  },
  colorBlock: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0d0d0d',
  },
  controls: {
    width: '100%',
    alignItems: 'center',
  },
  sliderGroup: {
    marginBottom: 16,
    width: SLIDER_WIDTH,
  },
  sliderLabel: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Georgia',
    color: '#0d0d0d',
    marginBottom: 6,
  },
  sliderTrackContainer: {
    height: 24,
    justifyContent: 'center',
  },
  sliderTrack: {
    width: SLIDER_WIDTH,
    height: 8,
    backgroundColor: '#ebebeb',
    borderRadius: 4,
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 4,
  },
  sliderHandle: {
    position: 'absolute',
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0d0d0d',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  btnAction: {
    backgroundColor: '#0d0d0d',
    borderRadius: 2,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginTop: 8,
  },
  btnActionText: {
    fontFamily: 'Georgia',
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1.5,
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultMatchText: {
    fontFamily: 'Georgia',
    fontSize: 22,
    fontWeight: '800',
    color: '#2a9d8f',
    marginBottom: 8,
  },
  resultDetailText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Georgia',
    marginBottom: 4,
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
});
