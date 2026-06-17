import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

const DEFAULT_URL = 'https://aman7263.github.io/Bugs/';

const normalizeUrl = (input) => {
  const trimmed = input.trim();
  if (!trimmed) return DEFAULT_URL;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (!trimmed.includes(' ') && trimmed.includes('.')) return 'https://' + trimmed;
  return 'https://www.google.com/search?q=' + encodeURIComponent(trimmed);
};

const WebScreensHome = () => {
  const [currentUrl, setCurrentUrl] = useState(DEFAULT_URL);
  const [searchText, setSearchText] = useState(DEFAULT_URL);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const searchInputRef = useRef(null);
  const webViewRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        await Location.requestForegroundPermissionsAsync();
      } catch (err) {
        console.warn('Error requesting location permission:', err);
      }
    })();
  }, []);

  const goBack = () => {
    if (webViewRef.current && canGoBack) webViewRef.current.goBack();
  };

  const goHome = () => {
    setCurrentUrl(DEFAULT_URL);
    setSearchText(DEFAULT_URL);
  };

  const handleSearchSubmit = () => {
    const url = normalizeUrl(searchText);
    Keyboard.dismiss();
    setIsSearchFocused(false);
    setCurrentUrl(url);
    setSearchText(url);
  };

  const handleAddressBarPress = () => {
    setIsSearchFocused(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    if (navState.url && !isSearchFocused) {
      setCurrentUrl(navState.url);
      setSearchText(navState.url);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.browserHeader}>
        <View style={styles.browserDots}>
          <View style={[styles.dot, styles.dotRed]} />
          <View style={[styles.dot, styles.dotYellow]} />
          <View style={[styles.dot, styles.dotGreen]} />
        </View>
        <TouchableOpacity
          style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
          onPress={goBack}
          disabled={!canGoBack}
        >
          <Text style={styles.navButtonText}>⬅</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addressBar} onPress={handleAddressBarPress} activeOpacity={1}>
          {isSearchFocused ? (
            <TextInput
              ref={searchInputRef}
              style={styles.addressInput}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearchSubmit}
              onBlur={() => {
                setIsSearchFocused(false);
                setSearchText(currentUrl);
              }}
              returnKeyType="go"
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
              selectTextOnFocus
              placeholder="Search or enter URL"
              placeholderTextColor="#64748b"
            />
          ) : (
            <Text style={styles.addressText} numberOfLines={1}>
              {currentUrl.replace(/^https?:\/\//, '')}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={goHome}>
          <Text style={styles.navButtonText}>🏠</Text>
        </TouchableOpacity>
      </View>

      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        onNavigationStateChange={handleNavigationStateChange}
      />
    </SafeAreaView>
  );
};

export default WebScreensHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  browserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  browserDots: {
    flexDirection: 'row',
    width: 60,
    justifyContent: 'space-between',
    marginRight: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotRed: { backgroundColor: '#f25f58' },
  dotYellow: { backgroundColor: '#f5bf4d' },
  dotGreen: { backgroundColor: '#33c748' },
  addressBar: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginLeft: 8,
    justifyContent: 'center',
  },
  addressText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
  addressInput: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '500',
    padding: 0,
    margin: 0,
  },
  navButton: {
    marginHorizontal: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 18,
    color: '#fff',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  webview: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
});