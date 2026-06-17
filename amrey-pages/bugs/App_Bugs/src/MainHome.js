import React, { useState } from 'react';
import { SafeAreaView, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import MobileScreensHome from './mobilescreens/MobileScreensHome';
import WebScreensHome from './webscreens/WebScreensHome';

const MainHome = () => {
  const [activeTab, setActiveTab] = useState('mobile');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {activeTab === 'mobile' ? <MobileScreensHome /> : <WebScreensHome />}
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'mobile' && styles.tabButtonActive]}
          onPress={() => setActiveTab('mobile')}>
          <Text style={[styles.tabLabel, activeTab === 'mobile' && styles.tabLabelActive]}>Mobile Screens</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'web' && styles.tabButtonActive]}
          onPress={() => setActiveTab('web')}>
          <Text style={[styles.tabLabel, activeTab === 'web' && styles.tabLabelActive]}>Web Screens</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default MainHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderColor: '#e1e4ea',
    backgroundColor: '#fff',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  tabButtonActive: {
    backgroundColor: '#111',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555',
  },
  tabLabelActive: {
    color: '#fff',
  },
});
