import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import GetCallLog from './getCallLog';
import GetMobile from './getmoble';

// Games imports
import TicTacToe from './games/TicTacToe';
import MemoryMatch from './games/MemoryMatch';
import RockPaperScissors from './games/RockPaperScissors';
import NumberGuess from './games/NumberGuess';
import TapSpeed from './games/TapSpeed';
import DiceRoller from './games/DiceRoller';
import CoinFlip from './games/CoinFlip';
import SimonSays from './games/SimonSays';
import MathRush from './games/MathRush';
import ClickSpeed from './games/ClickSpeed';
import ReactionTime from './games/ReactionTime';
import WordScramble from './games/WordScramble';
import WhackAMole from './games/WhackAMole';
import SlidePuzzle from './games/SlidePuzzle';
import HigherLower from './games/HigherLower';
import StroopEffect from './games/StroopEffect';
import TypeFast from './games/TypeFast';
import CatchBall from './games/CatchBall';
import SnakeGame from './games/SnakeGame';
import NumberMemory from './games/NumberMemory';
import Game2048 from './games/Game2048';
import OddOneOut from './games/OddOneOut';
import ScratchCard from './games/ScratchCard';
import PatternLock from './games/PatternLock';
import ColorMixer from './games/ColorMixer';

const GAMES_CONFIG = {
  tictactoe: { name: 'Tic Tac Toe', component: TicTacToe, color: '#e63946', category: 'TIC TAC TOE', hint: 'Get three in a row to win! Play against the computer.' },
  memorymatch: { name: 'Memory Match', component: MemoryMatch, color: '#3f37c9', category: 'MEMORY MATCH', hint: 'Flip cards and find matching pairs with the fewest moves.' },
  rps: { name: 'R.P.S. Duel', component: RockPaperScissors, color: '#f4a261', category: 'ROCK PAPER SCISSORS', hint: 'Choose Rock, Paper, or Scissors and defeat your opponent.' },
  numguess: { name: 'Guess The Number', component: NumberGuess, color: '#4361ee', category: 'NUMBER GUESS', hint: 'Guess the hidden number in the range. Pay attention to high/low hints.' },
  tapspeed: { name: 'Whack-A-Dot Speed', component: TapSpeed, color: '#7209b7', category: 'TAP SPEED', hint: 'Tap as many green dots as possible before the time runs out.' },
  diceroller: { name: 'Dice Roller', component: DiceRoller, color: '#f4a261', category: 'DICE ROLLER', hint: 'Tap to roll the dice and check your luck.' },
  coinflip: { name: 'Coin Flipper', component: CoinFlip, color: '#e76f51', category: 'COIN FLIP', hint: 'Flip the coin and predict heads or tails.' },
  simonsays: { name: 'Simon Says Recall', component: SimonSays, color: '#2a9d8f', category: 'SIMON SAYS', hint: 'Memorize and repeat the flashing sequence of colored buttons.' },
  mathrush: { name: 'Math Speed Rush', component: MathRush, color: '#2b2d42', category: 'MATH RUSH', hint: 'Solve as many arithmetic equations as you can within the time limit.' },
  clickspeed: { name: 'CPS Click Speed', component: ClickSpeed, color: '#8d99ae', category: 'CLICK SPEED', hint: 'Click the tap button as fast as you can to measure your CPS.' },
  reactiontime: { name: 'Reaction Time', component: ReactionTime, color: '#e63946', category: 'REACTION TIME', hint: 'Wait for green and tap as fast as possible to test your reflexes.' },
  wordscramble: { name: 'Word Scramble', component: WordScramble, color: '#3f37c9', category: 'WORD SCRAMBLE', hint: 'Unscramble the letters to guess the correct word.' },
  whackamole: { name: 'Whack-A-Mole', component: WhackAMole, color: '#f4a261', category: 'WHACK-A-MOLE', hint: 'Whack the moles as they pop up to score points.' },
  slidepuzzle: { name: 'Slide Puzzle', component: SlidePuzzle, color: '#4361ee', category: 'SLIDE PUZZLE', hint: 'Slide the tiles into numeric order 1-8 using the empty slot.' },
  higherlower: { name: 'Higher or Lower', component: HigherLower, color: '#7209b7', category: 'HIGHER OR LOWER', hint: 'Predict if the next card is higher or lower than the current one.' },
  stroopeffect: { name: 'Stroop Effect', component: StroopEffect, color: '#2a9d8f', category: 'STROOP EFFECT', hint: 'Select the color of the text, ignoring the word\'s actual meaning.' },
  typefast: { name: 'Type Fast', component: TypeFast, color: '#2b2d42', category: 'TYPE FAST', hint: 'Type the given sentences as quickly and accurately as possible.' },
  catchball: { name: 'Catch the Ball', component: CatchBall, color: '#8d99ae', category: 'CATCH THE BALL', hint: 'Tilt or tap to move the basket and catch falling balls.' },
  snakegame: { name: 'Retro Snake', component: SnakeGame, color: '#e63946', category: 'RETRO SNAKE', hint: 'Eat food to grow your snake. Avoid hitting walls and your own tail.' },
  numbermemory: { name: 'Number Memory', component: NumberMemory, color: '#3f37c9', category: 'NUMBER MEMORY', hint: 'Memorize the shown digits and type them back correctly.' },
  game2048: { name: '2048 Puzzle', component: Game2048, color: '#edc22e', category: '2048 PUZZLE', hint: 'Merge adjacent identical numbers by swiping or using buttons to reach the 2048 tile!' },
  oddoneout: { name: 'Odd One Out', component: OddOneOut, color: '#2a9d8f', category: 'ODD ONE OUT', hint: 'Find the different grid element that stands out from the rest.' },
  scratchcard: { name: 'Scratch & Win', component: ScratchCard, color: '#7209b7', category: 'SCRATCH CARD', hint: 'Scratch the card surface to reveal matching prize symbols.' },
  patternlock: { name: 'Pattern Lock Memory', component: PatternLock, color: '#4361ee', category: 'PATTERN LOCK', hint: 'Memorize the pattern and trace it correctly on the grid.' },
  colormixer: { name: 'Color Mixer', component: ColorMixer, color: '#2b2d42', category: 'COLOR MIXER', hint: 'Adjust the Red, Green, and Blue sliders to match the target color.' }
};

const { width } = Dimensions.get('window');
const screenWidth = Dimensions.get('window').width;
// 4-Column Layout: screenWidth - 36px (horizontal padding 18*2) - 48px (four 12px margin spaces)
const cardWidth = (screenWidth - 36 - 48) / 4;

const SECTIONS = [
  {
    key: 'calllog',
    category: 'FEATURES',
    headline: 'Your Call Log',
    sub: 'View, filter & export every call at a glance',
    icon: '📞',
    accent: '#e63946',
    tag: 'LIVE',
  },
  {
    key: 'deviceinfo',
    category: 'FEATURES',
    headline: 'SIM & Device Specs',
    sub: 'View detailed SIM card and device configuration details',
    icon: '📱',
    accent: '#2a9d8f',
    tag: 'LIVE',
  }
];

const MobileScreensHome = () => {
  const [activePage, setActivePage] = useState(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
          console.log('Contacts permission granted on Mobile Home mount');
        }
      } catch (err) {
        console.warn(err);
      }
    })();
  }, []);

  const openPage = (key) => {
    slideAnim.setValue(40);
    setActivePage(key);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  };

  const goBack = () => setActivePage(null);

  if (activePage === 'calllog') {
    return (
      <Animated.View style={[styles.pageContainer, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.pageTopBar}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backLabel}>Back</Text>
          </TouchableOpacity>
          <View style={styles.pageTagRow}>
            <View style={[styles.liveTag, { backgroundColor: '#e63946' }]}>
              <Text style={styles.liveTagText}>LIVE</Text>
            </View>
            <Text style={styles.pageTopCategory}>CALL LOG</Text>
          </View>
        </View>
        <Text style={styles.pageHeadline}>Your Call Log</Text>
        <View style={styles.dividerFull} />
        <GetCallLog />
      </Animated.View>
    );
  }

  if (activePage === 'deviceinfo') {
    return (
      <Animated.View style={[styles.pageContainer, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.pageTopBar}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backLabel}>Back</Text>
          </TouchableOpacity>
          <View style={styles.pageTagRow}>
            <View style={[styles.liveTag, { backgroundColor: '#2a9d8f' }]}>
              <Text style={styles.liveTagText}>LIVE</Text>
            </View>
            <Text style={styles.pageTopCategory}>DEVICE INFO</Text>
          </View>
        </View>
        <Text style={styles.pageHeadline}>SIM & Device Info</Text>
        <View style={styles.dividerFull} />
        <GetMobile />
      </Animated.View>
    );
  }

  const game = GAMES_CONFIG[activePage];
  if (game) {
    const GameComponent = game.component;
    return (
      <Animated.View style={[styles.pageContainer, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.pageTopBar}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backLabel}>Back</Text>
          </TouchableOpacity>
          <View style={styles.pageTagRow}>
            <View style={[styles.liveTag, { backgroundColor: game.color }]}>
              <Text style={styles.liveTagText}>GAMES</Text>
            </View>
            <Text style={styles.pageTopCategory}>{game.category}</Text>
          </View>
        </View>
        <Text style={styles.pageHeadline}>{game.name}</Text>
        <View style={styles.dividerFull} />
        {game.hint ? (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>💡 Hint: {game.hint}</Text>
          </View>
        ) : null}
        <GameComponent />
      </Animated.View>
    );
  }

  // HOME FEED
  return (
    <ScrollView style={styles.feed} contentContainerStyle={styles.feedContent}>
      {/* Masthead */}
      <View style={styles.masthead}>
        <View style={styles.mastheadTop}>
          <Text style={styles.mastheadDate}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
          </Text>
          <View style={styles.mastheadDot} />
          <Text style={styles.mastheadDate}>MOBILE SCREENS</Text>
        </View>
        <Text style={styles.mastheadLogo}>Bugs Dashboard</Text>
        <View style={styles.mastheadDivider} />
      </View>

      <View style={styles.featuresRow}>
        {/* Feature Card — Call Log */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.gridCard}
          onPress={() => openPage('calllog')}>
          <View style={[styles.gridAccentBar, { backgroundColor: '#e63946' }]} />
          <View style={styles.gridBody}>
            <Text style={styles.gridIcon}>📞</Text>
            <Text style={styles.gridHeadline}>Call Log</Text>
            <Text style={styles.gridSub}>View, filter & export calls</Text>
            <View style={styles.gridCta}>
              <Text style={styles.gridCtaText}>Open →</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Feature Card — SIM & Device Specs */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.gridCard}
          onPress={() => openPage('deviceinfo')}>
          <View style={[styles.gridAccentBar, { backgroundColor: '#2a9d8f' }]} />
          <View style={styles.gridBody}>
            <Text style={styles.gridIcon}>📱</Text>
            <Text style={styles.gridHeadline}>SIM & Specs</Text>
            <Text style={styles.gridSub}>Carrier & hardware details</Text>
            <View style={styles.gridCta}>
              <Text style={[styles.gridCtaText, { color: '#2a9d8f' }]}>Open →</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Horizontal Rule */}
      <View style={styles.hrLine} />

      {/* Game Dashboard Heading */}
      <View style={styles.dashboardSection}>
        <Text style={styles.sectionHeader}>Game Dashboard</Text>
        <Text style={styles.sectionSub}>Play games and track your achievements</Text>
        
        {/* 4-Column Games Grid */}
        <View style={styles.gamesGrid}>
          {/* Game 1: Tic Tac Toe */}
          <TouchableOpacity
            style={[styles.gameGridCard, { width: cardWidth }]}
            onPress={() => openPage('tictactoe')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameGridIcon}>❌</Text>
            <Text style={styles.gameGridTitle} numberOfLines={1}>TicTacToe</Text>
          </TouchableOpacity>

          {/* Game 2: Memory Match */}
          <TouchableOpacity
            style={[styles.gameGridCard, { width: cardWidth }]}
            onPress={() => openPage('memorymatch')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameGridIcon}>🧠</Text>
            <Text style={styles.gameGridTitle} numberOfLines={1}>Memory</Text>
          </TouchableOpacity>

          {/* Game 3: Rock Paper Scissors */}
          <TouchableOpacity
            style={[styles.gameGridCard, { width: cardWidth }]}
            onPress={() => openPage('rps')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameGridIcon}>✂️</Text>
            <Text style={styles.gameGridTitle} numberOfLines={1}>R.P.S.</Text>
          </TouchableOpacity>

          {/* Game 4: Number Guess */}
          <TouchableOpacity
            style={[styles.gameGridCard, { width: cardWidth }]}
            onPress={() => openPage('numguess')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameGridIcon}>🔢</Text>
            <Text style={styles.gameGridTitle} numberOfLines={1}>Guess Num</Text>
          </TouchableOpacity>

          {/* Game 5: Tap Speed */}
          <TouchableOpacity
            style={[styles.gameGridCard, { width: cardWidth }]}
            onPress={() => openPage('tapspeed')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameGridIcon}>⏱️</Text>
            <Text style={styles.gameGridTitle} numberOfLines={1}>Tap Speed</Text>
          </TouchableOpacity>

          {/* Game 6: Dice Roller */}
          <TouchableOpacity
            style={[styles.gameGridCard, { width: cardWidth }]}
            onPress={() => openPage('diceroller')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameGridIcon}>🎲</Text>
            <Text style={styles.gameGridTitle} numberOfLines={1}>Dice Roll</Text>
          </TouchableOpacity>

          {/* Game 7: Coin Flip */}
          <TouchableOpacity
            style={[styles.gameGridCard, { width: cardWidth }]}
            onPress={() => openPage('coinflip')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameGridIcon}>🪙</Text>
            <Text style={styles.gameGridTitle} numberOfLines={1}>Coin Flip</Text>
          </TouchableOpacity>

          {/* Game 8: Simon Says */}
          <TouchableOpacity
            style={[styles.gameGridCard, { width: cardWidth }]}
            onPress={() => openPage('simonsays')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameGridIcon}>🔴</Text>
            <Text style={styles.gameGridTitle} numberOfLines={1}>Simon Says</Text>
          </TouchableOpacity>

          {/* Game 9: Math Rush */}
          <TouchableOpacity
            style={[styles.gameGridCard, { width: cardWidth }]}
            onPress={() => openPage('mathrush')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameGridIcon}>🧮</Text>
            <Text style={styles.gameGridTitle} numberOfLines={1}>Math Rush</Text>
          </TouchableOpacity>

          {/* Game 10: Click Speed */}
          <TouchableOpacity
            style={[styles.gameGridCard, { width: cardWidth }]}
            onPress={() => openPage('clickspeed')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameGridIcon}>⚡</Text>
            <Text style={styles.gameGridTitle} numberOfLines={1}>Click Speed</Text>
          </TouchableOpacity>

          {/* Game 11: Reaction Time */}
          <TouchableOpacity
            style={[styles.gameGridCard, { width: cardWidth }]}
            onPress={() => openPage('reactiontime')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameGridIcon}>🚦</Text>
            <Text style={styles.gameGridTitle} numberOfLines={1}>Reflex Test</Text>
          </TouchableOpacity>

          {/* Game 12: Word Scramble */}
          <TouchableOpacity
            style={[styles.gameGridCard, { width: cardWidth }]}
            onPress={() => openPage('wordscramble')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameGridIcon}>🔤</Text>
            <Text style={styles.gameGridTitle} numberOfLines={1}>Scramble</Text>
          </TouchableOpacity>

          {/* Game 13: WhackAMole */}
          <TouchableOpacity
            style={[styles.gameGridCard, { width: cardWidth }]}
            onPress={() => openPage('whackamole')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameGridIcon}>🐹</Text>
            <Text style={styles.gameGridTitle} numberOfLines={1}>Whack Mole</Text>
          </TouchableOpacity>

          {/* Game 14: Slide Puzzle */}
          <TouchableOpacity
            style={[styles.gameGridCard, { width: cardWidth }]}
            onPress={() => openPage('slidepuzzle')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameGridIcon}>🧩</Text>
            <Text style={styles.gameGridTitle} numberOfLines={1}>Slide 8</Text>
          </TouchableOpacity>

          {/* Game 15: Higher Lower */}
          <TouchableOpacity
            style={[styles.gameGridCard, { width: cardWidth }]}
            onPress={() => openPage('higherlower')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameGridIcon}>🃏</Text>
            <Text style={styles.gameGridTitle} numberOfLines={1}>Hi-Lo Card</Text>
          </TouchableOpacity>

          {/* Game 16: Stroop Effect */}
          <TouchableOpacity
            style={[styles.gameGridCard, { width: cardWidth }]}
            onPress={() => openPage('stroopeffect')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameGridIcon}>🎨</Text>
            <Text style={styles.gameGridTitle} numberOfLines={1}>Stroop Color</Text>
          </TouchableOpacity>

          {/* Game 17: Type Fast */}
          <TouchableOpacity
            style={[styles.gameGridCard, { width: cardWidth }]}
            onPress={() => openPage('typefast')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameGridIcon}>⌨️</Text>
            <Text style={styles.gameGridTitle} numberOfLines={1}>Type Fast</Text>
          </TouchableOpacity>

          {/* Game 18: Catch Ball */}
          <TouchableOpacity
            style={[styles.gameGridCard, { width: cardWidth }]}
            onPress={() => openPage('catchball')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameGridIcon}>🥎</Text>
            <Text style={styles.gameGridTitle} numberOfLines={1}>Catch Ball</Text>
          </TouchableOpacity>

          {/* Game 19: Snake */}
          <TouchableOpacity
            style={[styles.gameGridCard, { width: cardWidth }]}
            onPress={() => openPage('snakegame')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameGridIcon}>🐍</Text>
            <Text style={styles.gameGridTitle} numberOfLines={1}>Retro Snake</Text>
          </TouchableOpacity>

          {/* Game 20: Number Memory */}
          <TouchableOpacity
            style={[styles.gameGridCard, { width: cardWidth }]}
            onPress={() => openPage('numbermemory')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameGridIcon}>📟</Text>
            <Text style={styles.gameGridTitle} numberOfLines={1}>Num Memory</Text>
          </TouchableOpacity>

          {/* Game 21: 2048 */}
          <TouchableOpacity
            style={[styles.gameGridCard, { width: cardWidth }]}
            onPress={() => openPage('game2048')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameGridIcon}>🔢</Text>
            <Text style={styles.gameGridTitle} numberOfLines={1}>2048</Text>
          </TouchableOpacity>

          {/* Game 22: Odd One Out */}
          <TouchableOpacity
            style={[styles.gameGridCard, { width: cardWidth }]}
            onPress={() => openPage('oddoneout')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameGridIcon}>🔍</Text>
            <Text style={styles.gameGridTitle} numberOfLines={1}>Odd One</Text>
          </TouchableOpacity>

          {/* Game 23: Scratch Card */}
          <TouchableOpacity
            style={[styles.gameGridCard, { width: cardWidth }]}
            onPress={() => openPage('scratchcard')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameGridIcon}>🎟️</Text>
            <Text style={styles.gameGridTitle} numberOfLines={1}>Scratch Card</Text>
          </TouchableOpacity>

          {/* Game 24: Pattern Lock */}
          <TouchableOpacity
            style={[styles.gameGridCard, { width: cardWidth }]}
            onPress={() => openPage('patternlock')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameGridIcon}>🔐</Text>
            <Text style={styles.gameGridTitle} numberOfLines={1}>Pattern Lock</Text>
          </TouchableOpacity>

          {/* Game 25: Color Mixer */}
          <TouchableOpacity
            style={[styles.gameGridCard, { width: cardWidth }]}
            onPress={() => openPage('colormixer')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameGridIcon}>🎨</Text>
            <Text style={styles.gameGridTitle} numberOfLines={1}>Color Mixer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default MobileScreensHome;

const styles = StyleSheet.create({
  feed: {
    flex: 1,
    backgroundColor: '#faf9f6',
  },
  feedContent: {
    paddingHorizontal: 18,
    paddingTop: 52,
  },

  // Masthead
  masthead: {
    marginBottom: 24,
  },
  mastheadTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  mastheadDate: {
    fontFamily: 'Georgia',
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#888',
  },
  mastheadDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#ccc',
    marginHorizontal: 8,
  },
  mastheadLogo: {
    fontFamily: 'Georgia',
    fontSize: 38,
    fontWeight: '700',
    color: '#0d0d0d',
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  mastheadDivider: {
    height: 3,
    backgroundColor: '#0d0d0d',
    marginTop: 14,
  },

  // Hero Card
  heroCard: {
    backgroundColor: '#0d0d0d',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  heroAccentBar: {
    height: 4,
    backgroundColor: '#e63946',
  },
  heroBody: {
    padding: 22,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  liveTag: {
    backgroundColor: '#e63946',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 2,
    marginRight: 10,
  },
  liveTagText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  heroCategory: {
    fontFamily: 'Georgia',
    fontSize: 10,
    letterSpacing: 2,
    color: '#888',
    textTransform: 'uppercase',
  },
  heroIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  heroHeadline: {
    fontFamily: 'Georgia',
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 34,
    marginBottom: 8,
  },
  heroSub: {
    color: '#aaa',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  heroCta: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 14,
  },
  heroCtaText: {
    color: '#e63946',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Section divider
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d9d9d9',
  },
  sectionLabel: {
    fontFamily: 'Georgia',
    fontSize: 9,
    letterSpacing: 2,
    color: '#aaa',
    marginHorizontal: 10,
  },

  // Secondary cards
  secondaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ebebeb',
  },
  secondaryAccent: {
    width: 4,
    alignSelf: 'stretch',
  },
  secondaryBody: {
    flex: 1,
    padding: 16,
  },
  secondaryCategory: {
    fontSize: 9,
    letterSpacing: 2,
    color: '#aaa',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  secondaryHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  secondaryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  secondaryHeadline: {
    fontFamily: 'Georgia',
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
  },
  secondarySub: {
    color: '#888',
    fontSize: 12,
    lineHeight: 17,
  },
  secondaryArrow: {
    fontSize: 18,
    color: '#ccc',
    paddingRight: 16,
  },

  // Inner page
  pageContainer: {
    flex: 1,
    backgroundColor: '#faf9f6',
    paddingHorizontal: 18,
    paddingTop: 52,
  },
  pageTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 18,
    color: '#111',
    marginRight: 4,
  },
  backLabel: {
    fontFamily: 'Georgia',
    fontSize: 13,
    color: '#111',
  },
  pageTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageTopCategory: {
    fontSize: 10,
    letterSpacing: 2,
    color: '#aaa',
  },
  pageHeadline: {
    fontFamily: 'Georgia',
    fontSize: 30,
    fontWeight: '700',
    color: '#0d0d0d',
    marginBottom: 14,
    lineHeight: 36,
  },
  dividerFull: {
    height: 3,
    backgroundColor: '#0d0d0d',
    marginBottom: 18,
  },
  placeholderText: {
    color: '#888',
    fontSize: 15,
    fontFamily: 'Georgia',
    marginTop: 10,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    borderRadius: 4,
    overflow: 'hidden',
    minHeight: 160,
  },
  gridAccentBar: {
    height: 4,
  },
  gridBody: {
    padding: 14,
    flex: 1,
    justifyContent: 'space-between',
  },
  gridIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  gridHeadline: {
    fontFamily: 'Georgia',
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  gridSub: {
    color: '#aaa',
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 10,
  },
  gridCta: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 8,
  },
  gridCtaText: {
    color: '#e63946',
    fontSize: 11,
    fontWeight: '700',
  },
  hrLine: {
    height: 1.5,
    backgroundColor: '#0d0d0d',
    marginVertical: 24,
  },
  dashboardSection: {
    marginBottom: 10,
  },
  sectionHeader: {
    fontFamily: 'Georgia',
    fontSize: 24,
    fontWeight: '700',
    color: '#0d0d0d',
    marginBottom: 4,
  },
  sectionSub: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Georgia',
    lineHeight: 16,
    marginBottom: 16,
  },
  gamePlaceholderCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ebebeb',
    borderRadius: 4,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gamePlaceholderIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  gamePlaceholderText: {
    fontFamily: 'Georgia',
    fontSize: 13,
    color: '#aaa',
    fontWeight: '600',
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  gameGridCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ebebeb',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    minHeight: 85,
    margin: 6,
  },
  gameGridIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  gameGridTitle: {
    fontFamily: 'Georgia',
    fontSize: 9.5,
    fontWeight: '700',
    color: '#0d0d0d',
    textAlign: 'center',
  },
  hintContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ebebeb',
    borderRadius: 4,
    padding: 10,
    marginBottom: 14,
  },
  hintText: {
    fontFamily: 'Georgia',
    fontSize: 11.5,
    color: '#555',
    lineHeight: 16,
  },
});